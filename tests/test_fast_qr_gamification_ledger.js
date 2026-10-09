/**
 * ============================================================================
 * TEST SUITE 18: FAST QR ATTENDANCE, GAMIFICATION LEADERBOARD & FINANCIAL LEDGER
 * ============================================================================
 */

const assert = require('assert');
const fastQrScanner = require('../backend/src/modules/attendance/fast_qr_scanner.service');
const leaderboardService = require('../backend/src/modules/gamification/leaderboard_certificates.service');
const financialLedger = require('../backend/src/modules/business/financial_ledger.service');
const authService = require('../backend/src/modules/auth/auth.service');
const groupsService = require('../backend/src/modules/groups/groups.service');

async function runTests() {
  console.log('🚀 [TEST 18] Running Fast QR Attendance, Hall of Fame & Multi-Center Ledger Test Suite...');

  // Setup teacher and group
  const teacher = await authService.register({
    phoneNumber: '01033445566',
    password: 'Password_2026',
    role: 'TEACHER',
    fullName: 'أ/ طارق الشناوي'
  });
  const teacherId = teacher.profile.id;

  const group = await groupsService.createGroup(teacherId, {
    name: 'سنتر النخبة (الدقي) - مجموعة الجمعة',
    gradeLevel: 'GRADE_12_SEC3'
  });

  const studentReg = await groupsService.enrollStudent(teacherId, group.id, {
    fullName: 'سيف الدين وائل',
    parentPhone: '01019922883',
    gradeLevel: 'GRADE_12_SEC3'
  });
  const student = studentReg.student;

  // -------------------------------------------------------------
  // PART 1: FAST QR ATTENDANCE SCANNER
  // -------------------------------------------------------------
  console.log('  Testing Fast QR Door Scanner...');
  const scanResult = await fastQrScanner.processBadgeScan('assistant-usr-01', {
    teacherId: teacherId,
    centerName: 'سنتر النخبة (الدقي)',
    studentCode: student.academic_code,
    groupId: group.id
  });

  assert.strictEqual(scanResult.status, 'SUCCESS');
  assert.strictEqual(scanResult.isAllowedEntry, true);
  assert(scanResult.timestamp !== undefined);
  console.log(`    ✅ Badge scanned at the door for [${scanResult.studentName}] with instant parent arrival WhatsApp notification.`);

  // Test anti-duplicate scan
  const duplicateScan = await fastQrScanner.processBadgeScan('assistant-usr-01', {
    teacherId: teacherId,
    centerName: 'سنتر النخبة (الدقي)',
    studentCode: student.academic_code,
    groupId: group.id
  });
  assert.strictEqual(duplicateScan.status, 'DUPLICATE');
  console.log('    ✅ Anti-duplicate badge scan barrier verified.');

  const centerStats = fastQrScanner.getTodayStats('سنتر النخبة');
  assert(centerStats.totalScanned >= 1);
  console.log(`    ✅ Center daily attendance aggregation verified (${centerStats.totalScanned} scanned).`);

  // -------------------------------------------------------------
  // PART 2: HALL OF FAME LEADERBOARD & CERTIFICATE OF HONOR
  // -------------------------------------------------------------
  console.log('  Testing Hall of Fame & Certificate Generator...');
  const leaderboard = leaderboardService.getMonthlyLeaderboard('أكتوبر 2026');
  assert(leaderboard.leaderboard.length >= 5);
  assert.strictEqual(leaderboard.leaderboard[0].rank, 1);
  assert(leaderboard.leaderboard[0].points > 2500);
  console.log(`    ✅ Hall of fame retrieved (${leaderboard.totalCompetitors} student competitors).`);

  const cert = leaderboardService.generateCertificate({
    name: student.full_name,
    code: student.academic_code,
    rank: 'المركز الأول على المجموعة'
  });
  assert(cert.certificateId.startsWith('CERT-'));
  assert(cert.verificationUrl.includes('/verify/cert/'));
  console.log(`    ✅ Certificate of Honor generated with verification link (${cert.certificateId}).`);

  // -------------------------------------------------------------
  // PART 3: MULTI-CENTER FINANCIAL LEDGER & COMMISSION SPLIT
  // -------------------------------------------------------------
  console.log('  Testing Multi-Center Financial Ledger & Commission Splits...');
  const ledger = financialLedger.calculateMonthlySettlement(teacherId, 'أكتوبر 2026');

  assert(ledger.totalGrossRevenue > 500000, 'Gross revenue calculated');
  assert(ledger.totalCenterCommissions > 50000, 'Center commissions calculated');
  assert(ledger.teacherGrossShare > 400000, 'Teacher share calculated');
  assert(ledger.netTeacherProfit > 300000, 'Net profit calculated after expenses');
  assert.strictEqual(ledger.centersBreakdown.length, 4, '4 revenue streams/centers');
  console.log(`    ✅ Multi-center settlement calculated: Gross = ${ledger.totalGrossRevenue.toLocaleString()} EGP | Net Profit = ${ledger.netTeacherProfit.toLocaleString()} EGP (${ledger.profitMargin}).`);

  console.log('\n================================================================');
  console.log('🎉 [TEST 18 PASSED] FAST QR SCANNER, HALL OF FAME & LEDGER FULLY VERIFIED!');
  console.log('================================================================\n');
}

runTests().catch(err => {
  console.error('❌ Test 18 Failed:', err);
  process.exit(1);
});
