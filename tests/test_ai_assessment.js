/**
 * Unit & Integration Test Suite for AI Studio, Assessment Builder, and Auto-Scoring
 */

const assert = require('assert');
const authService = require('../backend/src/modules/auth/auth.service');
const groupsService = require('../backend/src/modules/groups/groups.service');
const aiService = require('../backend/src/modules/ai/ai.service');
const assessmentsService = require('../backend/src/modules/assessments/assessments.service');

async function runTests() {
  console.log('🧪 [Test Suite] Running AI Studio & Assessment Auto-Scoring Tests...');

  // 1. Setup Teacher & Group
  const teacher = await authService.register({
    phoneNumber: '01233445566',
    password: 'Password_2026',
    role: 'TEACHER',
    fullName: 'أ/ ماجد عزمي'
  });
  const teacherId = teacher.profile.id;

  const group = await groupsService.createGroup(teacherId, {
    name: 'مجموعة المتفوقين - فيزياء',
    gradeLevel: 'GRADE_12_SEC3'
  });

  const studentReg = await groupsService.enrollStudent(teacherId, group.id, {
    fullName: 'نوران يحيى',
    parentPhone: '01088776655',
    gradeLevel: 'GRADE_12_SEC3'
  });
  const studentId = studentReg.student.id;

  // 2. AI Lesson Plan Generation
  const lessonPlan = await aiService.generateLessonPlan(teacherId, {
    topic: 'التيار الكهربي وقانون أوم',
    gradeLevel: 'GRADE_12_SEC3',
    durationMins: 60
  });
  assert.ok(lessonPlan.title.includes('خطة درس'), 'Lesson title should be generated');
  assert.strictEqual(lessonPlan.timeAllocation.length, 5, 'Must have 5 allocated lesson phases');
  console.log('  ✅ AI Lesson Plan generation with pedagogical time allocation passed.');

  // 3. AI Assessment Generation
  const aiQuiz = await aiService.generateAssessment(teacherId, {
    title: 'اختبار تجريبي على قانون أوم وتوصيل المقاومات',
    questionCount: 5
  });
  assert.strictEqual(aiQuiz.questions.length, 5);
  assert.strictEqual(aiQuiz.blueprintSummary.mediumPct, 50);
  console.log('  ✅ AI Assessment generation with 30/50/20 difficulty blueprint passed.');

  // 4. Publish Assessment to Group
  const published = await assessmentsService.createAssessment(teacherId, {
    groupId: group.id,
    title: aiQuiz.title,
    durationMins: 25,
    questions: aiQuiz.questions
  });
  assert.strictEqual(published.questions.length, 5);
  assert.strictEqual(published.assessment.total_marks, 10);
  console.log('  ✅ Assessment publishing with concept-mapped questions passed.');

  // 5. Submit Student Attempt & Auto-Score
  const q1 = published.questions[0]; // 'تظل ثابتة لا تتغير'
  const q2 = published.questions[1]; // 'R / 3'
  const q3 = published.questions[2]; // '6 أمبير'
  const q4 = published.questions[3]; // 'خطأ'
  const q5 = published.questions[4]; // 'حفظ الشحنة الكهربية'

  // Student answers 4 correctly and 1 incorrectly (q3)
  const answers = {
    [q1.id]: 'تظل ثابتة لا تتغير', // Correct (+2)
    [q2.id]: 'R / 3',               // Correct (+2)
    [q3.id]: '2 أمبير',             // INCORRECT (Correct is '6 أمبير') (0)
    [q4.id]: 'خطأ',                 // Correct (+2)
    [q5.id]: 'حفظ الشحنة الكهربية'  // Correct (+2)
  };

  const attemptResult = await assessmentsService.submitAttempt(studentId, published.assessment.id, { answers });
  assert.strictEqual(attemptResult.score_earned, 8);
  assert.strictEqual(attemptResult.percentage, 80);
  assert.strictEqual(attemptResult.details.find(d => d.question_id === q3.id).is_correct, false);
  console.log('  ✅ Instant objective auto-scoring and percentage calculation passed.');

  // 6. Teacher Assessment Overview
  const overview = await assessmentsService.getAssessmentOverview(teacherId, published.assessment.id);
  assert.strictEqual(overview.completed_submissions, 1);
  assert.strictEqual(overview.metrics.average_score, 80);
  console.log('  ✅ Teacher assessment performance metrics aggregation passed.');

  console.log('🎉 ALL CYCLE 3 AI STUDIO & ASSESSMENT TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
