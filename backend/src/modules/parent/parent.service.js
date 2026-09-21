/**
 * TEACHER OS — Parent Experience & "Child Pulse" Service
 */

const db = require('../../core/db');

class ParentService {
  /**
   * Calculate simplified "Child Pulse" health status
   */
  async getChildPulse(studentId) {
    const student = db.findById('students', studentId);
    if (!student) throw new Error('Student not found');

    const teacher = db.findById('teachers', student.teacher_id);

    // Attendance Calculation
    const attendanceRecords = db.find('attendance_records', a => a.student_id === studentId);
    const totalSessions = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
    const absentCount = attendanceRecords.filter(a => a.status === 'ABSENT').length;
    const attendancePct = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 100;

    // Assessment Scores Calculation
    const attempts = db.find('student_attempts', a => a.student_id === studentId);
    const avgScorePct = attempts.length > 0
      ? Math.round(attempts.reduce((sum, a) => sum + Number(a.percentage), 0) / attempts.length)
      : 85;

    // Pulse Heuristic
    let pulseStatus = 'GOOD';
    let pulseBadgeAr = 'ممتاز ومستقر';
    let pulseColor = '#059669'; // Emerald
    let summaryMessageAr = `مستوى ${student.full_name.split(' ')[0]} ممتاز وملتزم بالحضور والواجبات.`;

    if (absentCount >= 2 || avgScorePct < 55) {
      pulseStatus = 'ACTION_RECOMMENDED';
      pulseBadgeAr = 'إجراء مطلوب';
      pulseColor = '#DC2626'; // Red
      summaryMessageAr = `يوجد تراجع في درجات التقييمات الأخيرة وتكرر للغياب. يرجى التواصل مع الأستاذ.`;
    } else if (attendancePct < 85 || avgScorePct < 70) {
      pulseStatus = 'NEEDS_ATTENTION';
      pulseBadgeAr = 'يحتاج متابعة';
      pulseColor = '#D97706'; // Amber
      summaryMessageAr = `المستوى جيد عموماً، لكن يحتاج مزيداً من التركيز في حل الواجبات المنزلية.`;
    }

    // Enrolled Subjects & Teachers
    const memberships = db.find('group_memberships', m => m.student_id === studentId && m.status === 'ACTIVE');
    const enrolledSubjects = memberships.map(m => {
      const grp = db.findById('groups', m.group_id);
      const tch = grp ? db.findById('teachers', grp.teacher_id) : null;
      const subj = grp ? db.findById('subjects', grp.subject_id) : null;
      const sub = db.findOne('subscriptions', s => s.student_id === studentId && s.group_id === m.group_id);
      return {
        group_id: m.group_id,
        group_name: grp ? grp.name : 'مجموعة دراسية',
        teacher_id: tch ? tch.id : '',
        teacher_name: tch ? tch.full_name : 'أستاذ المادة',
        teacher_title: tch ? tch.professional_title : '',
        subject_name: subj ? subj.name_ar : 'المادة التعليمية',
        schedule: grp ? `${grp.schedule_day || ''} ${grp.schedule_time || ''}` : '',
        subscription_status: sub ? sub.status : 'ACTIVE',
        fee_amount: sub ? sub.fee_amount : (grp ? grp.session_fee * 4 : 600)
      };
    });

    return {
      student_id: student.id,
      student_name: student.full_name,
      academic_code: student.academic_code,
      teacher_name: teacher ? teacher.full_name : 'أستاذ المادة',
      pulse: {
        status: pulseStatus,
        badgeAr: pulseBadgeAr,
        colorHex: pulseColor,
        summaryAr: summaryMessageAr
      },
      metrics: {
        attendanceRatePct: attendancePct,
        totalSessionsTracked: totalSessions,
        unexcusedAbsences: absentCount,
        averageAssessmentScorePct: avgScorePct,
        quizzesCompletedCount: attempts.length
      },
      enrolled_subjects: enrolledSubjects,
      recentAssessments: attempts.slice(-3).map(a => {
        const ass = db.findById('assessments', a.assessment_id);
        return {
          title: ass ? ass.title : 'اختبار',
          score: a.total_score,
          percentage: a.percentage,
          submittedAt: a.submitted_at
        };
      })
    };
  }

  /**
   * Generate 1-Click WhatsApp Progress Card Text
   */
  async generateWhatsAppCard(studentId) {
    const pulse = await this.getChildPulse(studentId);

    const message = `السلام عليكم ورحمة الله،
تحية طيبة من مكتب ${pulse.teacher_name} 🌟

📊 *بطاقة المتابعة الدورية للطالب/ة:* ${pulse.student_name}
🆔 *كود الطالب:* ${pulse.academic_code}
----------------------------------
🔹 *نبض الأداء العام:* ${pulse.pulse.badgeAr}
🔹 *نسبة الحضور:* ${pulse.metrics.attendanceRatePct}% (${pulse.metrics.unexcusedAbsences} غياب مسجل)
🔹 *متوسط درجات التقييمات:* ${pulse.metrics.averageAssessmentScorePct}%
----------------------------------
📝 *ملاحظة المعلم:*
${pulse.pulse.summaryAr}

نتمنى لأبنائنا دوام التوفيق والتميز دائماً 💡`;

    return {
      student_id: studentId,
      parent_phone: db.findById('students', studentId)?.parent_phone || '',
      whatsAppText: message
    };
  }
}

module.exports = new ParentService();
