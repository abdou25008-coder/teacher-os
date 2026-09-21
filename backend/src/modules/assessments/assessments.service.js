/**
 * TEACHER OS — Assessment & Objective Auto-Scoring Engine
 */

const db = require('../../core/db');
const eventBus = require('../../core/events');
const dunningService = require('../business/dunning.service');

class AssessmentsService {
  /**
   * Publish an assessment to a group with questions mapped to concepts
   */
  async createAssessment(teacherId, { groupId, lessonId, title, durationMins = 30, questions }) {
    const group = db.findById('groups', groupId);
    if (!group || group.teacher_id !== teacherId) {
      throw new Error('Group not found or unauthorized');
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      throw new Error('Assessment must contain at least one question');
    }

    const totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);

    const assessment = db.insert('assessments', {
      teacher_id: teacherId,
      group_id: groupId,
      lesson_id: lessonId || 'les-electric-current',
      title: title || 'اختبار تقييمي',
      assessment_type: 'QUIZ',
      duration_mins: Number(durationMins),
      total_marks: totalMarks,
      status: 'PUBLISHED'
    });

    const savedQuestions = [];
    let order = 1;
    for (const q of questions) {
      const qRecord = db.insert('assessment_questions', {
        assessment_id: assessment.id,
        concept_id: q.conceptId || 'cpt-ohm-law',
        question_type: q.questionType || 'MCQ',
        prompt: q.prompt,
        options_json: q.options || [],
        correct_answer: q.correctAnswer,
        explanation: q.explanation || '',
        marks: Number(q.marks) || 1,
        order_index: order++
      });
      savedQuestions.push(qRecord);
    }

    eventBus.emit('ASSESSMENT_PUBLISHED', {
      teacherId,
      groupId,
      assessmentId: assessment.id,
      questionCount: savedQuestions.length
    });

    return {
      assessment,
      questions: savedQuestions
    };
  }

  /**
   * Submit student attempt and execute auto-scoring
   */
  async submitAttempt(studentId, assessmentId, { answers }) {
    const assessment = db.findById('assessments', assessmentId);
    if (!assessment) {
      throw new Error('Assessment not found');
    }

    const questions = db.find('assessment_questions', q => q.assessment_id === assessmentId);
    if (questions.length === 0) {
      throw new Error('No questions found for this assessment');
    }

    if (studentId && studentId !== 'stu-guest') {
      const access = await dunningService.checkStudentAccess(studentId);
      if (!access.canAccess) {
        const err = new Error(access.reason || 'تم تعليق الحساب مؤقتاً بسبب مستحقات دراسية متأخرة');
        err.statusCode = 402;
        err.details = access;
        throw err;
      }
    }

    // Check if attempt already submitted
    const existingAttempt = db.findOne('student_attempts', a => a.assessment_id === assessmentId && a.student_id === studentId);
    if (existingAttempt) {
      return this.getAttemptResults(existingAttempt.id);
    }

    const attempt = db.insert('student_attempts', {
      assessment_id: assessmentId,
      student_id: studentId,
      started_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      submitted_at: new Date().toISOString(),
      total_score: 0,
      percentage: 0,
      status: 'COMPLETED'
    });

    let earnedMarks = 0;
    const answerRecords = [];

    for (const q of questions) {
      const studentResponse = answers[q.id] || '';
      const isCorrect = String(studentResponse).trim().toLowerCase() === String(q.correct_answer).trim().toLowerCase();
      const scoreAwarded = isCorrect ? q.marks : 0;
      earnedMarks += scoreAwarded;

      const ans = db.insert('student_answers', {
        attempt_id: attempt.id,
        question_id: q.id,
        student_response: String(studentResponse),
        is_correct: isCorrect,
        score_awarded: scoreAwarded,
        feedback: isCorrect ? 'إجابة صحيحة وممتازة!' : q.explanation
      });

      answerRecords.push({
        ...ans,
        concept_id: q.concept_id,
        prompt: q.prompt,
        correct_answer: q.correct_answer
      });
    }

    const finalPercentage = assessment.total_marks > 0 ? Math.round((earnedMarks / assessment.total_marks) * 100) : 0;

    const updatedAttempt = db.update('student_attempts', attempt.id, {
      total_score: earnedMarks,
      percentage: finalPercentage
    });

    eventBus.emit('STUDENT_ATTEMPT_SUBMITTED', {
      studentId,
      assessmentId,
      attemptId: attempt.id,
      score: earnedMarks,
      totalMarks: assessment.total_marks,
      percentage: finalPercentage,
      answers: answerRecords
    });

    return {
      attempt: updatedAttempt,
      assessment_title: assessment.title,
      total_marks: assessment.total_marks,
      score_earned: earnedMarks,
      percentage: finalPercentage,
      details: answerRecords
    };
  }

  /**
   * Retrieve scored attempt results
   */
  async getAttemptResults(attemptId) {
    const attempt = db.findById('student_attempts', attemptId);
    if (!attempt) throw new Error('Attempt not found');

    const assessment = db.findById('assessments', attempt.assessment_id);
    const answers = db.find('student_answers', a => a.attempt_id === attemptId);

    const detailedAnswers = answers.map(ans => {
      const q = db.findById('assessment_questions', ans.question_id);
      return {
        ...ans,
        prompt: q ? q.prompt : '',
        correct_answer: q ? q.correct_answer : '',
        concept_id: q ? q.concept_id : ''
      };
    });

    return {
      attempt,
      assessment_title: assessment ? assessment.title : '',
      total_marks: assessment ? assessment.total_marks : 0,
      score_earned: attempt.total_score,
      percentage: attempt.percentage,
      details: detailedAnswers
    };
  }

  /**
   * Get all results and performance summary for an assessment (Teacher View)
   */
  async getAssessmentOverview(teacherId, assessmentId) {
    const assessment = db.findById('assessments', assessmentId);
    if (!assessment || assessment.teacher_id !== teacherId) {
      throw new Error('Assessment not found or unauthorized');
    }

    const attempts = db.find('student_attempts', a => a.assessment_id === assessmentId);
    const group = db.findById('groups', assessment.group_id);
    const totalEnrolled = db.find('group_memberships', m => m.group_id === assessment.group_id && m.status === 'ACTIVE').length;

    const scores = attempts.map(a => a.percentage);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
    const minScore = scores.length > 0 ? Math.min(...scores) : 0;

    return {
      assessment,
      group_name: group ? group.name : '',
      enrolled_students: totalEnrolled,
      completed_submissions: attempts.length,
      completion_rate_pct: totalEnrolled > 0 ? Math.round((attempts.length / totalEnrolled) * 100) : 0,
      metrics: {
        average_score: avgScore,
        max_score: maxScore,
        min_score: minScore
      },
      submissions: attempts.map(a => {
        const stu = db.findById('students', a.student_id);
        return {
          attempt_id: a.id,
          student_id: a.student_id,
          student_name: stu ? stu.full_name : '',
          academic_code: stu ? stu.academic_code : '',
          score: a.total_score,
          percentage: a.percentage,
          submitted_at: a.submitted_at
        };
      })
    };
  }
}

module.exports = new AssessmentsService();
