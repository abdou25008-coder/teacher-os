/**
 * TEACHER OS — Student Experience & Socratic AI Coach Service
 */

const db = require('../../core/db');

class StudentService {
  /**
   * Get student's "My Learning Day" dashboard
   */
  async getMyLearningDay(studentId) {
    const student = db.findById('students', studentId);
    if (!student) throw new Error('Student not found');

    const memberships = db.find('group_memberships', m => m.student_id === studentId && m.status === 'ACTIVE');
    const groupIds = memberships.map(m => m.group_id);

    // Active Assessments
    const availableAssessments = [];
    for (const gId of groupIds) {
      const assessments = db.find('assessments', a => a.group_id === gId && a.status === 'PUBLISHED');
      for (const ass of assessments) {
        const attempt = db.findOne('student_attempts', a => a.assessment_id === ass.id && a.student_id === studentId);
        availableAssessments.push({
          assessment_id: ass.id,
          title: ass.title,
          duration_mins: ass.duration_mins,
          total_marks: ass.total_marks,
          is_completed: !!attempt,
          score: attempt ? attempt.total_score : null,
          percentage: attempt ? attempt.percentage : null
        });
      }
    }

    // Concept Mastery Radar
    const masteries = db.find('concept_mastery', cm => cm.student_id === studentId);
    const strongConcepts = [];
    const reviewConcepts = [];

    for (const m of masteries) {
      const concept = db.findById('concepts', m.concept_id);
      const item = {
        concept_id: m.concept_id,
        name_ar: concept ? concept.name_ar : 'مفهوم',
        mastery_pct: Math.round(m.mastery_score * 100),
        confidence: m.confidence_level
      };
      if (m.mastery_score >= 0.65) {
        strongConcepts.push(item);
      } else {
        reviewConcepts.push(item);
      }
    }

    // Next scheduled session
    const upcomingSessions = [];
    for (const gId of groupIds) {
      const sessions = db.find('sessions', s => s.group_id === gId && s.status === 'SCHEDULED');
      for (const s of sessions) {
        const group = db.findById('groups', gId);
        upcomingSessions.push({
          session_id: s.id,
          group_name: group ? group.name : '',
          topic: s.topic,
          scheduled_at: s.scheduled_at
        });
      }
    }

    // Multi-Teacher Enrolled Subjects
    const enrolledTeachers = [];
    for (const gId of groupIds) {
      const group = db.findById('groups', gId);
      if (group) {
        const tch = db.findById('teachers', group.teacher_id);
        const subj = db.findById('subjects', group.subject_id);
        enrolledTeachers.push({
          group_id: group.id,
          group_name: group.name,
          teacher_id: tch ? tch.id : '',
          teacher_name: tch ? tch.full_name : 'أستاذ المادة',
          teacher_title: tch ? tch.professional_title : '',
          subject_name: subj ? subj.name_ar : 'المادة',
          schedule: `${group.schedule_day || ''} ${group.schedule_time || ''}`
        });
      }
    }

    return {
      student_name: student.full_name,
      academic_code: student.academic_code,
      pairing_pin: student.pairing_pin || 'LNK-1029',
      grade_level: student.grade_level,
      active_tasks_count: availableAssessments.filter(a => !a.is_completed).length,
      upcoming_sessions: upcomingSessions,
      assessments: availableAssessments,
      enrolled_teachers: enrolledTeachers,
      mastery_radar: {
        strong_concepts: strongConcepts,
        concepts_needing_review: reviewConcepts
      }
    };
  }

  /**
   * Socratic AI Study Coach: Provides guided hints without spoon-feeding answers
   */
  async askSocraticCoach(studentId, { questionPrompt, studentThought }) {
    const student = db.findById('students', studentId);
    if (!student) throw new Error('Student not found');

    return {
      coachResponseAr: `أهلاً يا ${student.full_name.split(' ')[0]}! فكرتك ممتازة كخطوة أولى. 
تذكر: عند توصيل المقاومات على التوازي، ما الذي يظل ثابتاً عبر جميع الفروع؟ (هل هو فرق الجهد أم شدة التيار؟)
جرب حساب فرق الجهد الكلي أولاً، ثم شاركني النتيجة لنكمل معاً! 💡`,
      pedagogicalPhase: 'SOCRATIC_HINT_LEVEL_1',
      suggestedNextStepAr: 'فكر في قانون V = I * R على الفرع الأول.'
    };
  }
}

module.exports = new StudentService();
