/**
 * Unit & Integration Test Suite for Student Learning Journey & Parent Child Pulse
 */

const assert = require('assert');
const authService = require('../backend/src/modules/auth/auth.service');
const groupsService = require('../backend/src/modules/groups/groups.service');
const sessionsService = require('../backend/src/modules/sessions/sessions.service');
const assessmentsService = require('../backend/src/modules/assessments/assessments.service');
const studentService = require('../backend/src/modules/student/student.service');
const parentService = require('../backend/src/modules/parent/parent.service');

async function runTests() {
  console.log('🧪 [Test Suite] Running Student Learning Day & Parent Child Pulse Tests...');

  // 1. Setup Teacher, Group, and Student
  const teacher = await authService.register({
    phoneNumber: '01055667788',
    password: 'Password_2026',
    role: 'TEACHER',
    fullName: 'أ/ عصام فوزي'
  });
  const teacherId = teacher.profile.id;

  const group = await groupsService.createGroup(teacherId, {
    name: 'مجموعة الأوائل - فيزياء',
    gradeLevel: 'GRADE_12_SEC3'
  });

  const studentReg = await groupsService.enrollStudent(teacherId, group.id, {
    fullName: 'ياسمين أشرف',
    parentPhone: '01099881122',
    gradeLevel: 'GRADE_12_SEC3'
  });
  const studentId = studentReg.student.id;

  // 2. Schedule Session & Mark Attendance
  const session = await sessionsService.scheduleSession(teacherId, {
    groupId: group.id,
    topic: 'تطبيقات قانون كيرشوف'
  });

  await sessionsService.markAttendance(teacherId, session.id, [
    { studentId, status: 'PRESENT' }
  ]);

  // 3. Create Assessment & Submit Attempt (100% score)
  const published = await assessmentsService.createAssessment(teacherId, {
    groupId: group.id,
    title: 'اختبار كيرشوف القصير',
    questions: [
      {
        conceptId: 'cpt-kirchhoff',
        questionType: 'MCQ',
        prompt: 'سؤال كيرشوف',
        options: ['أ', 'ب'],
        correctAnswer: 'أ',
        marks: 5
      }
    ]
  });

  await assessmentsService.submitAttempt(studentId, published.assessment.id, {
    answers: { [published.questions[0].id]: 'أ' }
  });

  // 4. Test Student "My Learning Day" Dashboard
  const myDay = await studentService.getMyLearningDay(studentId);
  assert.strictEqual(myDay.student_name, 'ياسمين أشرف');
  assert.strictEqual(myDay.assessments.length, 1);
  assert.strictEqual(myDay.assessments[0].is_completed, true);
  assert.strictEqual(myDay.assessments[0].percentage, 100);
  console.log('  ✅ Student "My Learning Day" dashboard and progress aggregation passed.');

  // 5. Test Socratic AI Coach Hint
  const coachHint = await studentService.askSocraticCoach(studentId, {
    questionPrompt: 'كيف أفرق بين قانون كيرشوف الأول والثاني؟',
    studentThought: 'الأول تيار والثاني جهد؟'
  });
  assert.ok(coachHint.coachResponseAr.includes('ياسمين'), 'Coach should address student by name');
  assert.strictEqual(coachHint.pedagogicalPhase, 'SOCRATIC_HINT_LEVEL_1');
  console.log('  ✅ Socratic AI Coach interactive guidance passed.');

  // 6. Test Parent "Child Pulse"
  const pulse = await parentService.getChildPulse(studentId);
  assert.strictEqual(pulse.pulse.status, 'GOOD');
  assert.strictEqual(pulse.pulse.badgeAr, 'ممتاز ومستقر');
  assert.strictEqual(pulse.metrics.attendanceRatePct, 100);
  assert.strictEqual(pulse.metrics.averageAssessmentScorePct, 100);
  console.log('  ✅ Parent "Child Pulse" heuristic calculation passed.');

  // 7. Test WhatsApp Card Generation
  const card = await parentService.generateWhatsAppCard(studentId);
  assert.ok(card.whatsAppText.includes('ياسمين أشرف'));
  assert.ok(card.whatsAppText.includes('أ/ عصام فوزي'));
  console.log('  ✅ 1-Click WhatsApp Progress Card generator passed.');

  console.log('🎉 ALL CYCLE 5 STUDENT & PARENT TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
