/**
 * Unit & Integration Test Suite for Closed-Loop Cognitive Gap Mining & My Intelligent Day
 */

const assert = require('assert');
const authService = require('../backend/src/modules/auth/auth.service');
const groupsService = require('../backend/src/modules/groups/groups.service');
const assessmentsService = require('../backend/src/modules/assessments/assessments.service');
const insightsService = require('../backend/src/modules/insights/insights.service');
const db = require('../backend/src/core/db');

async function runTests() {
  console.log('🧪 [Test Suite] Running Closed-Loop Intelligence & Cognitive Gap Mining Tests...');

  // 1. Setup Teacher & Group with multiple students
  const teacher = await authService.register({
    phoneNumber: '01044556677',
    password: 'Password_2026',
    role: 'TEACHER',
    fullName: 'أ/ خالد المنشاوي'
  });
  const teacherId = teacher.profile.id;

  const group = await groupsService.createGroup(teacherId, {
    name: 'مجموعة الفيزياء المتقدمة (السبت)',
    gradeLevel: 'GRADE_12_SEC3'
  });

  const s1 = (await groupsService.enrollStudent(teacherId, group.id, { fullName: 'كريم وائل', parentPhone: '01012300001' })).student;
  const s2 = (await groupsService.enrollStudent(teacherId, group.id, { fullName: 'فاطمة حسام', parentPhone: '01012300002' })).student;
  const s3 = (await groupsService.enrollStudent(teacherId, group.id, { fullName: 'عمر شريف', parentPhone: '01012300003' })).student;

  // 2. Create Assessment with specific concept: 'cpt-parallel-series'
  const published = await assessmentsService.createAssessment(teacherId, {
    groupId: group.id,
    title: 'اختبار تشخيصي في توصيل المقاومات',
    questions: [
      {
        conceptId: 'cpt-parallel-series',
        questionType: 'MCQ',
        prompt: 'سؤال 1: حساب تيار التوازي',
        options: ['2A', '4A', '6A', '8A'],
        correctAnswer: '6A',
        explanation: 'فرق الجهد متساوٍ، وبالتالي I_total = 6A',
        marks: 2
      },
      {
        conceptId: 'cpt-parallel-series',
        questionType: 'MCQ',
        prompt: 'سؤال 2: المقاومة المكافئة للتوازي',
        options: ['R/2', 'R/3', '3R', '9R'],
        correctAnswer: 'R/3',
        explanation: 'المقاومة المكافئة R_eq = R / n = R / 3',
        marks: 2
      },
      {
        conceptId: 'cpt-ohm-law',
        questionType: 'TRUE_FALSE',
        prompt: 'سؤال 3: ثبوت المقاومة الأومية',
        options: ['صح', 'خطأ'],
        correctAnswer: 'صح',
        explanation: 'المقاومة خاصية فيزيائية ثابتة بثبوت درجة الحرارة',
        marks: 2
      }
    ]
  });

  const q1 = published.questions[0]; // cpt-parallel-series
  const q2 = published.questions[1]; // cpt-parallel-series
  const q3 = published.questions[2]; // cpt-ohm-law

  // 3. Students submit attempts where all 3 fail 'cpt-parallel-series' but pass 'cpt-ohm-law'
  // Student 1
  await assessmentsService.submitAttempt(s1.id, published.assessment.id, {
    answers: { [q1.id]: 'WRONG', [q2.id]: 'WRONG', [q3.id]: 'صح' }
  });

  // Student 2
  await assessmentsService.submitAttempt(s2.id, published.assessment.id, {
    answers: { [q1.id]: 'WRONG', [q2.id]: 'WRONG', [q3.id]: 'صح' }
  });

  // Student 3
  await assessmentsService.submitAttempt(s3.id, published.assessment.id, {
    answers: { [q1.id]: '6A', [q2.id]: 'WRONG', [q3.id]: 'صح' }
  });

  console.log('  ✅ 3 Student assessment attempts submitted and scored.');

  // 4. Verify Concept Mastery records were updated automatically by EventBus
  const masteryS1 = db.findOne('concept_mastery', cm => cm.student_id === s1.id && cm.concept_id === 'cpt-parallel-series');
  assert.ok(masteryS1, 'Mastery record must exist for s1');
  assert.ok(masteryS1.mastery_score < 0.5, 'Mastery score should be low due to wrong answers');
  console.log('  ✅ Event-driven Concept Mastery updates verified.');

  // 5. Verify Cognitive Gap Mining Engine
  const gaps = await insightsService.mineLearningGaps(teacherId, group.id);
  assert.ok(gaps.length > 0, 'Gap engine must detect the parallel series weakness');
  const parallelGap = gaps.find(g => g.concept_id === 'cpt-parallel-series');
  assert.ok(parallelGap, 'Must find gap for cpt-parallel-series');
  assert.strictEqual(parallelGap.target_id, group.id);
  assert.ok(parallelGap.failure_rate_pct >= 66, 'Failure rate should be >= 66%');
  console.log('  ✅ Cognitive Gap Mining identified cohort misconception with empirical evidence.');

  // 6. Verify "My Intelligent Day" Priority Briefing
  const myDay = await insightsService.getMyIntelligentDay(teacherId);
  assert.strictEqual(myDay.topPriority.priorityLevel, 'HIGH');
  assert.ok(myDay.topPriority.title.includes('مراجعة'), 'Priority must recommend revision');
  assert.ok(myDay.topPriority.reason.includes('صعوبة في استيعاب مفهوم'), 'Must provide explainable reason');
  console.log('  ✅ "My Intelligent Day" daily prioritization verified.');

  // 7. Test 1-Click Remediation Dispatching
  const remediation = await insightsService.triggerRemediation(teacherId, {
    conceptId: 'cpt-parallel-series',
    groupId: group.id
  });
  assert.strictEqual(remediation.success, true);
  assert.strictEqual(remediation.data.remediationSteps.length, 3);
  console.log('  ✅ 1-Click Remediation micro-revision generation passed.');

  console.log('🎉 ALL CYCLE 4 CLOSED-LOOP INTELLIGENCE TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
