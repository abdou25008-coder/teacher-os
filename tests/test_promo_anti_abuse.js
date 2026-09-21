/**
 * TEACHER OS — Promo Code 2027 & 5-Layer Anti-Fraud Multi-Account Test Suite
 */

const assert = require('assert');
const db = require('../backend/src/core/db');
const authService = require('../backend/src/modules/auth/auth.service');
const promoService = require('../backend/src/modules/business/promo.service');

async function runTests() {
  console.log('🧪 [Test Suite] Running Promo Code 2027 & 5-Layer Anti-Fraud Multi-Account Tests...');

  // 1. Egyptian National ID Validator Unit Tests
  const validId = '28905140102345'; // Century 2, 1989-05-14, Gov 01 (Cairo)
  const valResult = promoService.validateEgyptianNationalId(validId);
  assert.strictEqual(valResult.valid, true);

  const shortId = promoService.validateEgyptianNationalId('2890514010234'); // 13 digits
  assert.strictEqual(shortId.valid, false);

  const invalidCentury = promoService.validateEgyptianNationalId('18905140102345'); // Starts with 1
  assert.strictEqual(invalidCentury.valid, false);

  const invalidMonth = promoService.validateEgyptianNationalId('28913140102345'); // Month 13
  assert.strictEqual(invalidMonth.valid, false);

  const invalidGov = promoService.validateEgyptianNationalId('28905149902345'); // Gov 99
  assert.strictEqual(invalidGov.valid, false);
  console.log('  ✅ Egyptian National ID algorithmic checks verified.');

  // 2. Register Teacher 1 on Free Starter Plan
  const teacherUser1 = await authService.register({
    phoneNumber: '01011112233',
    password: 'Password@2026',
    role: 'TEACHER',
    fullName: 'أ/ شريف المصري (مدرس فيزياء)'
  });
  const teacherId1 = teacherUser1.profile.id;
  db.update('teachers', teacherId1, { saas_plan: 'FREE_STARTER' });

  // 3. Teacher 1 Redeems Promo Code 2027
  const deviceFp1 = 'DEV-FP-HASH-CHROME-WIN11-9988AABB';
  const redemption1 = await promoService.redeemPromo({
    teacherId: teacherId1,
    promoCode: '2027',
    nationalId: '28905140102345',
    deviceFingerprint: deviceFp1,
    ipAddress: '197.34.12.80'
  });

  assert.strictEqual(redemption1.success, true);
  assert.strictEqual(redemption1.plan.id, 'PRO_TEACHER');
  assert.strictEqual(redemption1.plan.durationDays, 365);
  assert.strictEqual(redemption1.plan.savingsEGP, 6000);

  const updatedTeacher1 = db.findById('teachers', teacherId1);
  assert.strictEqual(updatedTeacher1.saas_plan, 'PRO_TEACHER');
  assert.strictEqual(updatedTeacher1.promo_code_used, '2027');
  assert(Boolean(updatedTeacher1.plan_expires_at));

  // Verify expiry is ~365 days in future (between 364 and 366 days)
  const diffDays = (new Date(updatedTeacher1.plan_expires_at) - new Date()) / (1000 * 60 * 60 * 24);
  assert(diffDays > 364 && diffDays <= 366, 'Plan expiry must be 365 days in future');
  console.log('  ✅ Teacher 1 successfully redeemed promo 2027 (365 days free Pro @ 6,000 EGP savings).');

  // 4. Test Idempotency: Teacher 1 tries to redeem again on the same account
  try {
    await promoService.redeemPromo({
      teacherId: teacherId1,
      promoCode: '2027',
      nationalId: '28905140102345',
      deviceFingerprint: deviceFp1
    });
    assert.fail('Teacher 1 should not be able to redeem promo twice');
  } catch (err) {
    assert(err.message.includes('بالفعل'), 'Should reject duplicate redemption on same account');
  }
  console.log('  ✅ Account-level idempotency enforced.');

  // 5. Fraud Vector 1: Device Fingerprint Reuse (Same device, different account)
  const teacherUser2 = await authService.register({
    phoneNumber: '01022223344',
    password: 'Password@2026',
    role: 'TEACHER',
    fullName: 'أ/ حسام الديب (حساب مكرر على نفس الجهاز)'
  });
  const teacherId2 = teacherUser2.profile.id;
  db.update('teachers', teacherId2, { saas_plan: 'FREE_STARTER' });

  try {
    await promoService.redeemPromo({
      teacherId: teacherId2,
      promoCode: '2027',
      nationalId: '29308201401234', // Different National ID
      deviceFingerprint: deviceFp1 // SAME DEVICE FINGERPRINT!
    });
    assert.fail('Should reject multi-account redemption from same physical device');
  } catch (err) {
    assert(err.message.includes('الجهاز مسبقاً'), 'Should block redemption due to device fingerprint match');
  }
  console.log('  ✅ Fraud Defense Layer 1: Device Fingerprint reuse blocked.');

  // 6. Fraud Vector 2: National ID Reuse (Different device, same national ID)
  const teacherUser3 = await authService.register({
    phoneNumber: '01033334455',
    password: 'Password@2026',
    role: 'TEACHER',
    fullName: 'أ/ أيمن رشاد (محاولة استخدام نفس الرقم القومي)'
  });
  const teacherId3 = teacherUser3.profile.id;
  db.update('teachers', teacherId3, { saas_plan: 'FREE_STARTER' });

  const deviceFp3 = 'DEV-FP-HASH-FIREFOX-MAC-11223344';
  try {
    await promoService.redeemPromo({
      teacherId: teacherId3,
      promoCode: '2027',
      nationalId: '28905140102345', // SAME NATIONAL ID AS TEACHER 1!
      deviceFingerprint: deviceFp3
    });
    assert.fail('Should reject redemption with duplicate National ID');
  } catch (err) {
    assert(err.message.includes('الرقم القومي مسجل به حساب آخر'), 'Should block redemption due to National ID match');
  }
  console.log('  ✅ Fraud Defense Layer 2: National ID duplicate reuse blocked.');

  // 7. Fraud Vector 3: Invalid Promo Code
  try {
    await promoService.redeemPromo({
      teacherId: teacherId3,
      promoCode: 'INVALID_2028',
      nationalId: '29511151609876',
      deviceFingerprint: deviceFp3
    });
    assert.fail('Should reject invalid promo code');
  } catch (err) {
    assert(err.message.includes('كود الخصم غير صالح'), 'Should reject invalid promo code');
  }
  console.log('  ✅ Invalid promo code rejected.');

  // 8. Legitimate New Teacher on Clean Device & Clean National ID
  const legitRedemption = await promoService.redeemPromo({
    teacherId: teacherId3,
    promoCode: ' 2027 ', // whitespace trimming
    nationalId: '29511151609876',
    deviceFingerprint: deviceFp3,
    ipAddress: '41.238.19.120'
  });
  assert.strictEqual(legitRedemption.success, true);
  assert.strictEqual(legitRedemption.plan.id, 'PRO_TEACHER');
  console.log('  ✅ Legitimate distinct teacher on clean device successfully redeemed.');

  console.log('🎉 [Test Suite] ALL Promo 2027 & 5-Layer Anti-Fraud Tests PASSED successfully!\n');
}

if (require.main === module) {
  runTests().catch(err => {
    console.error('❌ Test Suite Failed:', err);
    process.exit(1);
  });
}

module.exports = runTests;
