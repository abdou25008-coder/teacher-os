/**
 * Unit & Integration Test Suite for Groups, Roster, and 1-Tap Attendance
 */

const assert = require('assert');
const authService = require('../backend/src/modules/auth/auth.service');
const groupsService = require('../backend/src/modules/groups/groups.service');
const sessionsService = require('../backend/src/modules/sessions/sessions.service');

async function runTests() {
  console.log('🧪 [Test Suite] Running Groups, Roster & Attendance Tests...');

  // 1. Setup Teacher
  const teacher = await authService.register({
    phoneNumber: '01122334455',
    password: 'Password_2026',
    role: 'TEACHER',
    fullName: 'أ/ حسام الدين'
  });
  const teacherId = teacher.profile.id;

  // 2. Create Group
  const group = await groupsService.createGroup(teacherId, {
    name: 'مجموعة النخبة - فيزياء ثانوية عامة (السبت 4 مساءً)',
    gradeLevel: 'GRADE_12_SEC3',
    maxCapacity: 3, // Small capacity to test constraint
    sessionFee: 160,
    scheduleDay: 'Saturday',
    scheduleTime: '16:00'
  });
  assert.strictEqual(group.name, 'مجموعة النخبة - فيزياء ثانوية عامة (السبت 4 مساءً)');
  console.log('  ✅ Group creation passed.');

  // 3. Enroll Students
  const s1 = await groupsService.enrollStudent(teacherId, group.id, {
    fullName: 'أحمد محمود',
    parentPhone: '01011112222',
    gradeLevel: 'GRADE_12_SEC3'
  });

  const s2 = await groupsService.enrollStudent(teacherId, group.id, {
    fullName: 'سلمى إبراهيم',
    parentPhone: '01033334444',
    gradeLevel: 'GRADE_12_SEC3'
  });

  const s3 = await groupsService.enrollStudent(teacherId, group.id, {
    fullName: 'يوسف كريم',
    parentPhone: '01055556666',
    gradeLevel: 'GRADE_12_SEC3'
  });

  assert.strictEqual(s1.student.full_name, 'أحمد محمود');
  assert.ok(s1.student.academic_code.startsWith('STU-'), 'Academic code must be generated');
  console.log('  ✅ Student roster enrollment passed.');

  // 4. Test capacity limit rejection
  try {
    await groupsService.enrollStudent(teacherId, group.id, {
      fullName: 'طالب زائد',
      parentPhone: '01077778888',
      gradeLevel: 'GRADE_12_SEC3'
    });
    assert.fail('Over-capacity enrollment should throw error');
  } catch (err) {
    assert.strictEqual(err.statusCode, 400);
    console.log('  ✅ Group capacity boundary enforcement passed.');
  }

  // 5. Schedule Teaching Session
  const session = await sessionsService.scheduleSession(teacherId, {
    groupId: group.id,
    topic: 'توصيل المقاومات وتطبيقات قانون أوم',
    durationMins: 90
  });
  assert.strictEqual(session.status, 'SCHEDULED');
  console.log('  ✅ Session scheduling passed.');

  // 6. Record 1-Tap Bulk Attendance
  const attendanceRes = await sessionsService.markAttendance(teacherId, session.id, [
    { studentId: s1.student.id, status: 'PRESENT' },
    { studentId: s2.student.id, status: 'PRESENT' },
    { studentId: s3.student.id, status: 'ABSENT', notes: 'عذر مرضي مسبق' }
  ]);

  assert.strictEqual(attendanceRes.summary.total, 3);
  assert.strictEqual(attendanceRes.summary.present, 2);
  assert.strictEqual(attendanceRes.summary.absent, 1);
  console.log('  ✅ 1-Tap Attendance logging and summary statistics passed.');

  // 7. Verify Attendance Roster
  const rosterRes = await sessionsService.getSessionAttendance(teacherId, session.id);
  assert.strictEqual(rosterRes.roster.length, 3);
  const absentStudent = rosterRes.roster.find(r => r.student_id === s3.student.id);
  assert.strictEqual(absentStudent.status, 'ABSENT');
  console.log('  ✅ Session attendance roster retrieval passed.');

  console.log('🎉 ALL CYCLE 2 GROUPS & ATTENDANCE TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
