/**
 * ============================================================================
 * TEST SUITE 17: ENTERPRISE SECURITY, E-PAYMENTS, WHATSAPP DISPATCHER & AI BOT
 * ============================================================================
 */

const assert = require('assert');
const contentProtection = require('../content-protection-engine');
const paymentGateways = require('../backend/src/modules/payments/payment_gateways.service');
const whatsappDispatcher = require('../backend/src/modules/notifications/whatsapp_dispatcher.service');
const reservationBot = require('../backend/src/modules/ai/reservation_bot.service');
const authService = require('../backend/src/modules/auth/auth.service');
const groupsService = require('../backend/src/modules/groups/groups.service');

async function runEnterpriseTests() {
  console.log('🚀 [TEST 17] Running Enterprise Anti-Piracy, E-Payments, Cloud WhatsApp & AI Bot Test Suite...');

  // -------------------------------------------------------------
  // PART 1: CONTENT PROTECTION & DYNAMIC WATERMARKING
  // -------------------------------------------------------------
  console.log('  Testing Content Protection & Watermarking Engine...');
  const drm = new contentProtection.ContentProtectionEngine();
  assert(drm !== null, 'DRM engine instantiated');

  const pdfStamp = drm.generatePDFWatermarkMetadata({
    name: 'أحمد محمود رضوان',
    code: 'STU-99214',
    phone: '01012345678'
  });
  assert(pdfStamp.watermarkText.includes('أحمد محمود رضوان'), 'PDF stamp includes student name');
  assert(pdfStamp.watermarkText.includes('STU-99214'), 'PDF stamp includes academic code');
  assert(pdfStamp.hash.startsWith('STAMP-'), 'Security stamp hash generated');
  console.log('    ✅ Dynamic PDF student watermark metadata verified.');

  // -------------------------------------------------------------
  // PART 2: ELECTRONIC PAYMENT GATEWAY (FAWRY & PAYMOB WEBHOOKS)
  // -------------------------------------------------------------
  console.log('  Testing Electronic Payment Gateways (Fawry, Paymob & Fraud Block)...');

  // Setup teacher and student
  const teacher = await authService.register({
    phoneNumber: '01055667788',
    password: 'Password_2026',
    role: 'TEACHER',
    fullName: 'أ/ طارق الشناوي'
  });
  const teacherId = teacher.profile.id;

  const group = await groupsService.createGroup(teacherId, {
    name: '3ث سنتر النخبة (مجموعة A)',
    gradeLevel: 'GRADE_12_SEC3'
  });

  const studentReg = await groupsService.enrollStudent(teacherId, group.id, {
    fullName: 'حازم شريف الجوهري',
    parentPhone: '01019922883',
    gradeLevel: 'GRADE_12_SEC3'
  });
  const studentId = studentReg.student.id;

  // 2.1 Fawry Reference Generation
  const fawryOrder = await paymentGateways.initiateFawryPayment(teacherId, {
    studentId,
    groupId: group.id,
    amount: 600,
    durationDays: 30
  });
  assert.strictEqual(fawryOrder.amount, 600);
  assert.strictEqual(fawryOrder.currency, 'EGP');
  assert.strictEqual(fawryOrder.fawryReference.length, 8, 'Fawry reference is 8 digits');
  console.log(`    ✅ Fawry reference code generation passed (${fawryOrder.fawryReference}).`);

  // 2.2 Paymob Order Initiation
  const paymobOrder = await paymentGateways.initiatePaymobPayment(teacherId, {
    studentId,
    amount: 600,
    paymentChannel: 'WALLET'
  });
  assert(paymobOrder.iframeUrl.includes('paymobsolutions.com'), 'Paymob iframe URL generated');
  console.log('    ✅ Paymob mobile wallet intention passed.');

  // 2.3 Fawry Webhook Auto-Activation Callback
  const webhookResult = await paymentGateways.handleFawryWebhook({
    fawryRef: fawryOrder.fawryReference,
    merchantRef: fawryOrder.merchantRef,
    paymentStatus: 'PAID',
    amount: 600
  });
  assert.strictEqual(webhookResult.success, true);
  assert.strictEqual(webhookResult.status, 'ACTIVATED');
  assert(webhookResult.invoiceNumber.startsWith('INV-FAWRY-'), 'Electronic invoice issued');
  console.log('    ✅ Fawry webhook callback successfully triggered instant subscription activation & invoice issuance.');

  // 2.4 InstaPay Reference Deduplication (Anti-Fraud)
  const testRef = 'TXN_INSTAPAY_992145';
  const firstVerification = paymentGateways.verifyAndLockManualReference(testRef, studentId, 600);
  assert.strictEqual(firstVerification.verified, true);

  assert.throws(() => {
    paymentGateways.verifyAndLockManualReference(testRef, 'other-student-id', 600);
  }, /محاولة تكرار مرفوضة/, 'Double spending of manual transaction rejected');
  console.log('    ✅ InstaPay transaction anti-fraud replay barrier passed.');

  // -------------------------------------------------------------
  // PART 3: CLOUD WHATSAPP AUTOMATED DISPATCHER
  // -------------------------------------------------------------
  console.log('  Testing Background Cloud WhatsApp Dispatcher...');

  // 3.1 Single WhatsApp Dispatch
  const singleMsg = await whatsappDispatcher.sendMessage('01012345678', 'مرحباً بك في أكاديمية الفيزياء!');
  assert.strictEqual(singleMsg.status, 'DELIVERED');
  assert(singleMsg.to.startsWith('201012345678'), 'Egyptian phone formatted with international country code');

  // 3.2 Batch Exam Results Dispatch
  const examBatch = await whatsappDispatcher.dispatchExamResultsBatch(teacherId, 'EXAM_CH3_INDUCTION');
  assert(examBatch.totalDispatched >= 3, 'Batch results dispatched to all students');
  assert.strictEqual(examBatch.successCount, examBatch.totalDispatched);
  console.log(`    ✅ Batch exam scorecard dispatch passed (${examBatch.totalDispatched} parents notified).`);

  // 3.3 Urgent Attendance Absence Dispatch
  const absenceBatch = await whatsappDispatcher.dispatchAttendanceAbsenceAlerts(teacherId, group.id);
  assert(absenceBatch.dispatchedCount >= 2, 'Absence alerts dispatched to parents');
  console.log(`    ✅ Attendance absence instant alerts passed (${absenceBatch.dispatchedCount} alerts).`);

  // 3.4 Dunning Renewal Alerts
  const dunningBatch = await whatsappDispatcher.dispatchDunningRenewals(teacherId);
  assert(dunningBatch.totalSent >= 1, 'Dunning renewals sent');
  console.log('    ✅ Dunning renewal alerts with Fawry payment link passed.');

  // -------------------------------------------------------------
  // PART 4: 24/7 AI WHATSAPP & WEB RESERVATION BOT
  // -------------------------------------------------------------
  console.log('  Testing 24/7 AI WhatsApp & Web Reservation Bot...');

  // 4.1 Centers & Schedules Inquiry
  const replySchedules = await reservationBot.processInquiry({
    senderPhone: '01099887766',
    senderName: 'محمد طارق',
    messageText: 'ممكن اعرف مواعيد وسناتر مستر طارق؟'
  });
  assert.strictEqual(replySchedules.intent, 'CENTERS_AND_SCHEDULES');
  assert(replySchedules.replyText.includes('سنتر النخبة'), 'Reply details center name');
  assert(replySchedules.replyText.includes('سنتر الأوائل'), 'Reply details center name');
  console.log('    ✅ Schedules & centers inquiry dialect parsing verified.');

  // 4.2 Pricing Inquiry
  const replyPrices = await reservationBot.processInquiry({
    senderPhone: '01099887766',
    messageText: 'اشتراك الشهر بكام يا مستر؟'
  });
  assert.strictEqual(replyPrices.intent, 'PRICING_FEES');
  assert(replyPrices.replyText.includes('600 ج.م'), 'Reply includes exact monthly price');
  console.log('    ✅ Pricing inquiry dialect parsing verified.');

  // 4.3 New Seat Reservation & CRM Lead Capture
  const replyBooking = await reservationBot.processInquiry({
    senderPhone: '01055443322',
    senderName: 'سارة أسامة (3ث علمي علوم)',
    messageText: 'عاوزة احجز مكان في سنتر النخبة دفعة 2027'
  });
  assert.strictEqual(replyBooking.intent, 'SEAT_RESERVATION');
  assert(replyBooking.leadCreated !== null, 'Lead captured in CRM');
  assert.strictEqual(replyBooking.leadCreated.phone, '01055443322');

  const crmReport = reservationBot.getLeadsReport();
  assert(crmReport.totalLeads >= 1, 'CRM lead registered and reported');
  console.log('    ✅ New seat booking & CRM lead capture verified.');

  console.log('\n================================================================');
  console.log('🎉 [TEST 17 PASSED] ENTERPRISE SECURITY, E-PAYMENTS, WHATSAPP DISPATCHER & AI BOT FULLY VERIFIED!');
  console.log('================================================================\n');
}

runEnterpriseTests().catch(err => {
  console.error('❌ Test 17 Failed:', err);
  process.exit(1);
});
