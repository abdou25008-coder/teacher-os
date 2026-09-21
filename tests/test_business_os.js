/**
 * Unit & Integration Test Suite for Business OS, Subscriptions, and Multi-Assistant RBAC
 */

const assert = require('assert');
const authService = require('../backend/src/modules/auth/auth.service');
const groupsService = require('../backend/src/modules/groups/groups.service');
const businessService = require('../backend/src/modules/business/business.service');

async function runTests() {
  console.log('🧪 [Test Suite] Running Business OS, Subscriptions & Assistant RBAC Tests...');

  // 1. Setup Master Teacher
  const teacher = await authService.register({
    phoneNumber: '01066778899',
    password: 'Password_2026',
    role: 'TEACHER',
    fullName: 'أ/ أيمن عبد الحميد'
  });
  const teacherId = teacher.profile.id;

  // 2. Setup Assistant User
  const assistant = await authService.register({
    phoneNumber: '01022339900',
    password: 'Password_2026',
    role: 'ASSISTANT',
    fullName: 'أحمد سعيد (مساعد تعليمي)'
  });
  const assistantUserId = assistant.user.id;

  // 3. Setup Group & Student
  const group = await groupsService.createGroup(teacherId, {
    name: 'مجموعة الأحد (ثانوية عامة)',
    gradeLevel: 'GRADE_12_SEC3',
    maxCapacity: 20
  });

  const studentReg = await groupsService.enrollStudent(teacherId, group.id, {
    fullName: 'منى توفيق',
    parentPhone: '01077665544',
    gradeLevel: 'GRADE_12_SEC3'
  });
  const studentId = studentReg.student.id;

  // 4. Create Active Student Subscription (Monthly 600 EGP)
  const subscription = await businessService.createSubscription(teacherId, {
    studentId,
    groupId: group.id,
    planType: 'MONTHLY',
    feeAmount: 600,
    durationDays: 30
  });
  assert.strictEqual(subscription.status, 'ACTIVE');
  assert.strictEqual(subscription.fee_amount, 600);
  assert.strictEqual(subscription.currency, 'EGP');
  console.log('  ✅ Student subscription creation with EGP currency passed.');

  // 5. Assistant records an InstaPay Payment for the student
  const payment = await businessService.recordPayment(assistantUserId, {
    teacherId,
    studentId,
    subscriptionId: subscription.id,
    amount: 600,
    paymentMethod: 'INSTAPAY',
    referenceId: 'INSTA-TX-99881122',
    notes: 'تحويل انستاباي من رقم ولي الأمر'
  });
  assert.strictEqual(payment.status, 'COMPLETED');
  assert.strictEqual(payment.payment_method, 'INSTAPAY');
  assert.strictEqual(payment.collector_user_id, assistantUserId);
  console.log('  ✅ Assistant payment recording via InstaPay passed.');

  // 6. Teacher views business financial overview
  const teacherOverview = await businessService.getBusinessOverview(teacherId, 'TEACHER');
  assert.strictEqual(teacherOverview.financials.totalRevenueEGP, 600);
  assert.strictEqual(teacherOverview.subscriptions.totalActive, 1);
  assert.strictEqual(teacherOverview.capacity.occupiedSeats, 1);
  console.log('  ✅ Teacher financial metrics aggregation passed.');

  // 7. Security & RBAC: Verify Assistant CANNOT view master business profit margins
  try {
    await businessService.getBusinessOverview(teacherId, 'ASSISTANT');
    assert.fail('Assistant should not be permitted to view master financial aggregate');
  } catch (err) {
    assert.strictEqual(err.statusCode, 403);
    console.log('  ✅ Granular Assistant RBAC financial boundary enforced.');
  }

  console.log('🎉 ALL CYCLE 8 BUSINESS OS & ASSISTANT RBAC TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
