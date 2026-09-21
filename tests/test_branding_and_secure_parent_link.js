/**
 * TEACHER OS — Test Suite: Teacher Branding & Secure Dual-Key Parent-Student Link
 */

const assert = require('assert');
const http = require('http');

function makeRequest(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('🚀 [TEST 13] Running Teacher Branding & Secure Dual-Key Link Test Suite...');

  // 1. Teacher Branding API
  console.log('  Testing GET /api/v1/teacher/branding...');
  const brandGet = await makeRequest('/api/v1/teacher/branding');
  assert.strictEqual(brandGet.status, 200);
  assert.ok(brandGet.body.data.academy_name, 'Should return academy_name');
  assert.ok(brandGet.body.data.primary_color, 'Should return primary_color');
  console.log(`    ✅ Default branding loaded: ${brandGet.body.data.academy_name} (${brandGet.body.data.primary_color})`);

  console.log('  Testing POST /api/v1/teacher/branding (Custom Palette Update)...');
  const brandUpdate = await makeRequest('/api/v1/teacher/branding', 'POST', {
    academy_name: 'أكاديمية الشناوي للفيزياء المتقدمة',
    primary_color: '#059669',
    accent_color: '#D97706',
    theme_preset: 'EMERALD_GREEN',
    tagline: 'منظومة التفوق والدرجات النهائية في الفيزياء'
  });
  assert.strictEqual(brandUpdate.status, 200);
  assert.strictEqual(brandUpdate.body.data.primary_color, '#059669');
  assert.strictEqual(brandUpdate.body.data.academy_name, 'أكاديمية الشناوي للفيزياء المتقدمة');
  console.log('    ✅ Teacher branding updated and propagated successfully.');

  // 2. Mobile Phone Login & Auto-Registration
  console.log('  Testing POST /api/v1/auth/phone-login (New Student)...');
  const phoneLogin = await makeRequest('/api/v1/auth/phone-login', 'POST', {
    phoneNumber: '01088776655',
    fullName: 'رامي خالد المستجد',
    role: 'STUDENT',
    gradeLevel: 'GRADE_12_SEC3'
  });
  assert.strictEqual(phoneLogin.status, 200);
  assert.ok(phoneLogin.body.data.token, 'Should generate JWT auth token');
  assert.strictEqual(phoneLogin.body.data.user.role, 'STUDENT');
  console.log(`    ✅ Student mobile login verified: ${phoneLogin.body.data.user.fullName} (${phoneLogin.body.data.profile.academic_code})`);

  // 3. One-Tap Google SSO Login
  console.log('  Testing POST /api/v1/auth/google-login...');
  const googleLogin = await makeRequest('/api/v1/auth/google-login', 'POST', {
    email: 'mohamed.tarek.student@gmail.com',
    name: 'محمد طارق طالب',
    picture: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
    role: 'STUDENT'
  });
  assert.strictEqual(googleLogin.status, 200);
  assert.ok(googleLogin.body.data.token, 'Should return token');
  assert.strictEqual(googleLogin.body.data.user.email, 'mohamed.tarek.student@gmail.com');
  console.log('    ✅ One-Tap Google sign-in created profile and issued token successfully.');

  // 4. Teacher Portfolio & Showcase for Parents
  console.log('  Testing GET /api/v1/parent/teacher-showcase...');
  const showcaseRes = await makeRequest('/api/v1/parent/teacher-showcase');
  assert.strictEqual(showcaseRes.status, 200);
  assert.ok(showcaseRes.body.data.showcase.philosophy, 'Should have teacher philosophy');
  assert.ok(showcaseRes.body.data.showcase.publications.length > 0, 'Should list publications');
  assert.ok(showcaseRes.body.data.showcase.projects.length > 0, 'Should list projects');
  assert.ok(showcaseRes.body.data.showcase.hall_of_fame.length > 0, 'Should list top students');
  console.log(`    ✅ Teacher showcase verified: ${showcaseRes.body.data.showcase.publications.length} publications, ${showcaseRes.body.data.showcase.hall_of_fame.length} honors.`);

  // 5. Zero-Trust Parent-Student Link Security
  console.log('  Testing Zero-Trust: Child pulse without verification...');
  // stu-demo-3 (يوسف كريم) has parent_phone: +201055556666, pairing_pin: LNK-9923
  // Trying with wrong phone (01011112222) should lock metrics
  const unlinkedPulse = await makeRequest('/api/v1/parent/child-pulse/stu-demo-3?parentPhone=01011112222');
  assert.strictEqual(unlinkedPulse.status, 200);
  assert.strictEqual(unlinkedPulse.body.data.is_verified, false, 'Unlinked student must not be verified');
  assert.strictEqual(unlinkedPulse.body.data.requires_pairing, true, 'Must require pairing PIN');
  assert.strictEqual(unlinkedPulse.body.data.metrics, undefined, 'Sensitive metrics must be locked!');
  console.log('    ✅ Zero-Trust verified: unverified parent cannot see student marks or attendance.');

  // Trying to link with WRONG PIN
  console.log('  Testing POST /api/v1/parent/link-student with wrong PIN (tamper attempt)...');
  const wrongPinLink = await makeRequest('/api/v1/parent/link-student', 'POST', {
    parentPhone: '01055556666',
    academicCode: 'STU-992381',
    pairingPin: 'WRONG_PIN_123'
  });
  assert.strictEqual(wrongPinLink.status, 403);
  console.log('    ✅ Correctly rejected pairing with invalid PIN (403 Forbidden).');

  // Linking with CORRECT PIN and registered phone
  console.log('  Testing POST /api/v1/parent/link-student with valid Dual-Key handshake...');
  const validLink = await makeRequest('/api/v1/parent/link-student', 'POST', {
    parentPhone: '01055556666',
    academicCode: 'STU-992381',
    pairingPin: 'LNK-9923',
    deviceFingerprint: 'device_galaxy_s24'
  });
  assert.strictEqual(validLink.status, 200);
  assert.strictEqual(validLink.body.data.success, true);
  console.log('    ✅ Dual-Key handshake succeeded and verified link created.');

  // Querying child pulse again after verification
  console.log('  Testing GET /api/v1/parent/child-pulse after pairing verification...');
  const verifiedPulse = await makeRequest('/api/v1/parent/child-pulse/stu-demo-3?parentPhone=01055556666');
  assert.strictEqual(verifiedPulse.status, 200);
  assert.strictEqual(verifiedPulse.body.data.is_verified, true);
  assert.ok(verifiedPulse.body.data.metrics, 'Metrics unlocked for verified parent');
  assert.strictEqual(verifiedPulse.body.data.metrics.attendanceRatePct, 100);
  console.log('    ✅ Verified parent successfully unlocked full student pulse, attendance, and grades!');

  console.log('\n🎉 ALL TEACHER BRANDING & SECURE DUAL-KEY PARENT-STUDENT TESTS PASSED 100%!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
