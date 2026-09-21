/**
 * TEACHER OS — Comprehensive SaaS Tiering, Feature Gating, Student Fee Enforcement & Dunning Test Suite
 */

const assert = require('assert');
const db = require('../backend/src/core/db');
const authService = require('../backend/src/modules/auth/auth.service');
const groupsService = require('../backend/src/modules/groups/groups.service');
const businessService = require('../backend/src/modules/business/business.service');
const tieringService = require('../backend/src/modules/business/tiering.service');
const dunningService = require('../backend/src/modules/business/dunning.service');
const zoomService = require('../backend/src/modules/zoom/zoom.service');
const assessmentsService = require('../backend/src/modules/assessments/assessments.service');

async function runTests() {
  console.log('🧪 [Test Suite] Running SaaS Tiering, Feature Gating, Dunning & Auth Tests...');

  // 1. Available SaaS Plans
  const plans = tieringService.getAvailablePlans();
  assert.strictEqual(plans.length, 3, 'Should provide 3 tiers: Free, Pro, Enterprise');
  const planIds = plans.map(p => p.id);
  assert(planIds.includes('FREE_STARTER'), 'Free starter plan must exist');
  assert(planIds.includes('PRO_TEACHER'), 'Pro teacher plan must exist');
  assert(planIds.includes('ENTERPRISE_CENTER'), 'Enterprise center plan must exist');

  const proPlan = plans.find(p => p.id === 'PRO_TEACHER');
  assert.strictEqual(proPlan.priceEGP, 500, 'Pro Teacher plan must be exactly 500 EGP');

  const freePlan = plans.find(p => p.id === 'FREE_STARTER');
  assert.strictEqual(freePlan.allowZoom, true, 'Free Starter must have Zoom open with limited quota');
  assert.strictEqual(freePlan.allowOCR, true, 'Free Starter must have OCR open with limited quota');
  console.log('  ✅ SaaS Tier definitions validated (Free, Pro @ 500 EGP, Enterprise).');

  // 2. Setup New Teacher with Free Starter Plan
  const teacherUser = await authService.register({
    phoneNumber: '01099881122',
    password: 'Password@2026',
    role: 'TEACHER',
    fullName: 'أ/ خالد إبراهيم (مدرس كيمياء)'
  });
  const teacherId = teacherUser.profile.id;
  db.update('teachers', teacherId, { saas_plan: 'FREE_STARTER' });

  // 3. Feature Gatekeeper Verification on Free Tier (Open Zoom & OCR, Gated Enterprise & Assistants)
  const freeZoom = await tieringService.verifyFeatureAccess(teacherId, 'ZOOM');
  assert.strictEqual(freeZoom, true, 'Free Starter should have Zoom enabled');
  const freeOcr = await tieringService.verifyFeatureAccess(teacherId, 'OCR');
  assert.strictEqual(freeOcr, true, 'Free Starter should have OCR enabled');

  try {
    await tieringService.verifyFeatureAccess(teacherId, 'MULTI_ASSISTANT');
    assert.fail('Free tier should not have multi-assistant access');
  } catch (err) {
    assert(err.message.includes('المحترف') || err.message.includes('السنتر'), 'Should prompt for upgrade for assistants');
  }

  try {
    await tieringService.verifyFeatureAccess(teacherId, 'DIGITAL_TWIN');
    assert.fail('Free tier should not have AI Digital Twin');
  } catch (err) {
    assert(err.message.includes('التوأم الرقمي'), 'Should gate AI Digital Twin');
  }
  console.log('  ✅ Free tier open features (Zoom & OCR open, Assistants & Digital Twin gated) verified.');

  // 4. Upgrade Teacher to Pro Tier (500 EGP)
  const upgradeResult = await tieringService.upgradePlan(teacherId, {
    newPlanId: 'PRO_TEACHER',
    paymentMethod: 'INSTAPAY',
    referenceId: 'INSTA-TEST-12345'
  });
  assert.strictEqual(upgradeResult.success, true);
  assert.strictEqual(upgradeResult.plan.id, 'PRO_TEACHER');
  assert.strictEqual(upgradeResult.plan.priceEGP, 500);

  // Verify features now unlocked for Pro
  const proAssistant = await tieringService.verifyFeatureAccess(teacherId, 'MULTI_ASSISTANT');
  assert.strictEqual(proAssistant, true);

  // 4b. Upgrade to Enterprise Center to unlock AI Digital Twin & Bulk OCR
  const enterpriseUpgrade = await tieringService.upgradePlan(teacherId, {
    newPlanId: 'ENTERPRISE_CENTER',
    paymentMethod: 'INSTAPAY',
    referenceId: 'INSTA-ENTERPRISE-999'
  });
  assert.strictEqual(enterpriseUpgrade.success, true);
  assert.strictEqual(enterpriseUpgrade.plan.priceEGP, 1200);

  const digitalTwinAccess = await tieringService.verifyFeatureAccess(teacherId, 'DIGITAL_TWIN');
  const bulkOcrAccess = await tieringService.verifyFeatureAccess(teacherId, 'BULK_OCR');
  assert.strictEqual(digitalTwinAccess, true);
  assert.strictEqual(bulkOcrAccess, true);

  // Revert to PRO for remaining tests
  await tieringService.upgradePlan(teacherId, { newPlanId: 'PRO_TEACHER' });
  console.log('  ✅ Teacher plan upgrades (Pro @ 500 EGP & Enterprise @ 1200 EGP) verified.');

  // 5. Setup Student and Test Grace Period & Suspension
  const group = await groupsService.createGroup(teacherId, {
    name: 'مجموعة الكيمياء العامة',
    gradeLevel: 'GRADE_12_SEC3',
    maxCapacity: 25
  });

  const studentReg = await groupsService.enrollStudent(teacherId, group.id, {
    fullName: 'عمرو دياب السعيد',
    parentPhone: '01044556677',
    gradeLevel: 'GRADE_12_SEC3'
  });
  const student = studentReg.student;
  const studentId = student.id;

  // Active Subscription
  const activeSub = await businessService.createSubscription(teacherId, {
    studentId,
    groupId: group.id,
    planType: 'MONTHLY',
    feeAmount: 600,
    durationDays: 30
  });

  let access = await dunningService.checkStudentAccess(studentId);
  assert.strictEqual(access.canAccess, true);
  assert.strictEqual(access.status, 'ACTIVE');

  // Expiring in 2 days (Due Soon)
  db.update('subscriptions', activeSub.id, {
    end_date: new Date(Date.now() + 2 * 86400000).toISOString()
  });
  access = await dunningService.checkStudentAccess(studentId);
  assert.strictEqual(access.canAccess, true);
  assert.strictEqual(access.status, 'DUE_SOON');

  // Overdue by 1 day (In Grace Period)
  db.update('subscriptions', activeSub.id, {
    end_date: new Date(Date.now() - 1 * 86400000).toISOString()
  });
  access = await dunningService.checkStudentAccess(studentId);
  assert.strictEqual(access.canAccess, true);
  assert.strictEqual(access.status, 'GRACE_PERIOD');

  // Overdue by 7 days (Past Grace Period -> Suspended)
  db.update('subscriptions', activeSub.id, {
    end_date: new Date(Date.now() - 7 * 86400000).toISOString()
  });
  access = await dunningService.checkStudentAccess(studentId);
  assert.strictEqual(access.canAccess, false);
  assert.strictEqual(access.status, 'SUSPENDED_OVERDUE');
  console.log('  ✅ Student subscription lifecycle & grace period rules verified.');

  // 6. Enforce Paywall on Zoom & Assessments for Suspended Student
  const meeting = await zoomService.createMeeting(teacherId, {
    groupId: group.id,
    topic: 'مراجعة الكيمياء العضوية المباشرة',
    durationMins: 60
  });

  try {
    await zoomService.joinMeeting(meeting.id, {
      studentId: student.id,
      studentName: student.full_name
    });
    assert.fail('Suspended student should not be able to join Zoom meeting');
  } catch (err) {
    assert(err.message.includes('تعليق') || err.statusCode === 402, 'Should block Zoom entry due to payment suspension');
  }

  // Create assessment
  const assessment = await assessmentsService.createAssessment(teacherId, {
    groupId: group.id,
    title: 'اختبار الكيمياء العضوية',
    questions: [{
      prompt: 'ما هو أبسط ألكان؟',
      options: ['ميثان', 'إيثان', 'بروبان'],
      correct_answer: 'ميثان',
      marks: 5,
      explanation: 'الميثان CH4 هو أبسط هيدروكربون'
    }]
  });

  try {
    await assessmentsService.submitAttempt(student.id, assessment.assessment.id, {
      answers: { [assessment.questions[0].id]: 'ميثان' }
    });
    assert.fail('Suspended student should not be able to submit assessment');
  } catch (err) {
    assert(err.message.includes('تعليق') || err.statusCode === 402, 'Should block assessment submission');
  }
  console.log('  ✅ Paywall enforcement: Suspended student blocked from Zoom and Assessments.');

  // 7. Polite WhatsApp Payment Reminder Generation
  const reminder = await dunningService.generatePaymentReminder(student.id);
  assert(reminder.whatsAppText.includes(student.full_name), 'Reminder text must include student name');
  assert(reminder.whatsAppText.includes('InstaPay') || reminder.whatsAppText.includes('إنستاباي'), 'Reminder must mention InstaPay');
  assert(reminder.whatsAppText.includes('فودافون كاش'), 'Reminder must mention Vodafone Cash');
  assert(reminder.encodedUrl.startsWith('https://api.whatsapp.com'), 'Must produce encoded WhatsApp URL');
  console.log('  ✅ Polite WhatsApp payment reminder generator validated.');

  // 8. Payment Recording & Instant Account Unlocking
  const paymentRecord = await businessService.recordPayment(teacherUser.user.id, {
    teacherId,
    studentId: student.id,
    amount: 600,
    paymentMethod: 'INSTAPAY',
    notes: 'تحويل إنستاباي - سداد شهر الكيمياء'
  });
  assert(paymentRecord.receiptNumber.startsWith('REC-'));
  assert.strictEqual(paymentRecord.amount, 600);

  // Re-check student access - should be ACTIVE now!
  const restoredAccess = await dunningService.checkStudentAccess(student.id);
  assert.strictEqual(restoredAccess.canAccess, true);
  assert.strictEqual(restoredAccess.status, 'ACTIVE');

  // Now student can join Zoom!
  const joinSuccess = await zoomService.joinMeeting(meeting.id, {
    studentId: student.id,
    studentName: student.full_name
  });
  assert.strictEqual(joinSuccess.success, true);
  console.log('  ✅ Payment settling instantly unblocks student account and unlocks Zoom.');

  // 9. Student Fast Login by Academic Code
  const studentLoginResult = await authService.studentLogin({
    academicCode: student.academic_code
  });
  assert.strictEqual(studentLoginResult.user.role, 'STUDENT');
  assert.strictEqual(studentLoginResult.student.id, student.id);
  assert(Boolean(studentLoginResult.token), 'Must return session token');

  // 10. Parent Login by Phone Number
  const parentLoginResult = await authService.parentLogin({
    phoneNumber: student.parent_phone
  });
  assert.strictEqual(parentLoginResult.user.role, 'PARENT');
  assert(parentLoginResult.children.length >= 1);
  assert.strictEqual(parentLoginResult.children[0].id, student.id);
  console.log('  ✅ Multi-role fast login (Student by Academic Code & Parent by Phone) verified.');

  console.log('🎉 [Test Suite] ALL SaaS Tiering, Gating, Dunning & Multi-Role Auth Tests PASSED successfully!\n');
}

if (require.main === module) {
  runTests().catch(err => {
    console.error('❌ Test Suite Failed:', err);
    process.exit(1);
  });
}

module.exports = runTests;
