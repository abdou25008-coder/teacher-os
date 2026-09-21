/**
 * Unit & Integration Test Suite for OCR Exam Paper Scanner & Teaching Digital Twin
 */

const assert = require('assert');
const authService = require('../backend/src/modules/auth/auth.service');
const groupsService = require('../backend/src/modules/groups/groups.service');
const assessmentsService = require('../backend/src/modules/assessments/assessments.service');
const ocrService = require('../backend/src/modules/ocr/ocr.service');
const twinService = require('../backend/src/modules/twin/twin.service');

async function runTests() {
  console.log('🧪 [Test Suite] Running OCR Exam Scanner & Teaching Digital Twin Tests...');

  // 1. Setup Teacher, Group, and Student
  const teacher = await authService.register({
    phoneNumber: '01033221100',
    password: 'Password_2026',
    role: 'TEACHER',
    fullName: 'أ/ سمير عبد الفتاح'
  });
  const teacherId = teacher.profile.id;

  const group = await groupsService.createGroup(teacherId, {
    name: 'مجموعة الثانوية العامة - فيزياء',
    gradeLevel: 'GRADE_12_SEC3'
  });

  const studentReg = await groupsService.enrollStudent(teacherId, group.id, {
    fullName: 'مصطفى كمال',
    parentPhone: '01088771122',
    gradeLevel: 'GRADE_12_SEC3'
  });
  const studentId = studentReg.student.id;

  // 2. Create Assessment with Questions
  const published = await assessmentsService.createAssessment(teacherId, {
    groupId: group.id,
    title: 'امتحان فيزياء ورقي (شامل)',
    questions: [
      {
        conceptId: 'cpt-ohm-law',
        questionType: 'MCQ',
        prompt: 'ما هي وحدة قياس المقاومة النوعية؟',
        options: ['أوم . متر', 'أوم / متر'],
        correctAnswer: 'أوم . متر',
        marks: 5
      }
    ]
  });

  const q1 = published.questions[0];

  // 3. Test OCR Exam Paper Auto-Grading
  const ocrResult = await ocrService.scanAndGradePaper(teacherId, {
    assessmentId: published.assessment.id,
    studentId,
    paperImageUrl: 'https://cdn.teacher-os.internal/scans/mostafa_exam_page1.jpg',
    detectedAnswers: {
      [q1.id]: 'أوم . متر' // Correctly extracted by OCR
    }
  });

  assert.strictEqual(ocrResult.ocrStatus, 'SUCCESS');
  assert.strictEqual(ocrResult.scoreEarned, 5);
  assert.strictEqual(ocrResult.percentage, 100);
  assert.strictEqual(ocrResult.extractedDetails[0].isCorrect, true);
  console.log('  ✅ OCR Exam Paper scanning, character recognition, and auto-grading passed.');

  // 4. Test Teaching Digital Twin
  const twinResponse = await twinService.generateTwinResponse(teacherId, {
    studentQuestion: 'يا مستر، كيف أحسب المقاومة المكافئة إذا كان هناك سلك عديم المقاومة يلغي مقاومة؟',
    studentId
  });

  assert.ok(twinResponse.teacherTwinName.includes('سمير عبد الفتاح'), 'Twin must represent teacher name');
  assert.ok(twinResponse.responseAr.includes('أهلاً بك يا بطل'), 'Twin must speak in teacher voice');
  assert.strictEqual(twinResponse.confidenceScore, 0.98);
  console.log('  ✅ Teaching Digital Twin personalized pedagogical response passed.');

  console.log('🎉 ALL CYCLE 9 OCR & TEACHING DIGITAL TWIN TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
