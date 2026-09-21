/**
 * Unit & Integration Test Suite for Auth, Core Security, and RBAC
 */

const assert = require('assert');
const authService = require('../backend/src/modules/auth/auth.service');
const SecurityEngine = require('../backend/src/core/security');
const db = require('../backend/src/core/db');

async function runTests() {
  console.log('🧪 [Test Suite] Running Core Auth & Security Tests...');

  // 1. Password hashing test
  const password = 'SecretPassword123';
  const hash = SecurityEngine.hashPassword(password);
  assert.ok(hash.includes(':'), 'Hash must contain salt separator');
  assert.ok(SecurityEngine.verifyPassword(password, hash), 'Password verification must pass');
  assert.ok(!SecurityEngine.verifyPassword('WrongPassword', hash), 'Wrong password must fail');
  console.log('  ✅ Password hashing and constant-time verification passed.');

  // 2. Phone normalization test (Egypt format)
  assert.strictEqual(SecurityEngine.normalizePhoneNumber('01012345678'), '+201012345678');
  assert.strictEqual(SecurityEngine.normalizePhoneNumber('201012345678'), '+201012345678');
  console.log('  ✅ Egyptian phone number normalization passed.');

  // 3. Teacher registration test
  const teacherReg = await authService.register({
    phoneNumber: '01099887766',
    email: 'tarek.teacher@example.com',
    password: 'Password_2026',
    role: 'TEACHER',
    fullName: 'أ/ طارق الشناوي'
  });

  assert.strictEqual(teacherReg.user.role, 'TEACHER');
  assert.ok(teacherReg.token, 'Token must be issued');
  assert.strictEqual(teacherReg.profile.full_name, 'أ/ طارق الشناوي');
  console.log('  ✅ Teacher registration passed.');

  // 4. Duplicate phone rejection
  try {
    await authService.register({
      phoneNumber: '01099887766',
      password: 'AnotherPassword',
      role: 'TEACHER'
    });
    assert.fail('Duplicate registration should throw error');
  } catch (err) {
    assert.strictEqual(err.statusCode, 409);
    console.log('  ✅ Duplicate phone number prevention passed.');
  }

  // 5. Login verification
  const loginRes = await authService.login({
    phoneNumber: '01099887766',
    password: 'Password_2026'
  });
  assert.strictEqual(loginRes.user.phoneNumber, '+201099887766');
  console.log('  ✅ Login verification passed.');

  // 6. Session recovery via token
  const session = await authService.getSession(loginRes.token);
  assert.strictEqual(session.profile.full_name, 'أ/ طارق الشناوي');
  console.log('  ✅ Session retrieval and JWT verification passed.');

  console.log('🎉 ALL CYCLE 1 CORE TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
