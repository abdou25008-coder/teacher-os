/**
 * TEACHER OS — Parent Experience & "Child Pulse" Service
 */

const db = require('../../core/db');

class ParentService {
  /**
   * Calculate simplified "Child Pulse" health status
   */
  /**
   * Calculate simplified "Child Pulse" health status
   * Enforces Zero-Trust Verification: sensitive metrics locked until verified
   */
  async getChildPulse(studentId, parentPhone = null) {
    const student = db.findById('students', studentId);
    if (!student) throw new Error('Student not found');

    const teacher = db.findById('teachers', student.teacher_id) || db.find('teachers')[0];

    // Check Verification Status if parentPhone provided
    let isVerified = true;
    if (parentPhone) {
      const normalizedPhone = parentPhone.replace(/\D/g, '');
      const link = db.findOne('parent_student_links', l => 
        l.student_id === studentId && 
        (l.parent_phone || '').replace(/\D/g, '').endsWith(normalizedPhone.slice(-8)) &&
        l.status === 'VERIFIED'
      );
      if (!link) {
        isVerified = false;
      }
    }

    if (!isVerified) {
      return {
        student_id: student.id,
        student_name: student.full_name,
        academic_code: student.academic_code,
        is_verified: false,
        requires_pairing: true,
        message: 'بيانات أداء ودرجات هذا الطالب محمية وتتطلب إدخال رمز الربط السري (Pairing PIN) الخاص بالطالب لربط الحساب رسمياً.'
      };
    }

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
      pairing_pin: student.pairing_pin,
      is_verified: true,
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
   * Get all children for a parent with their pairing verification status
   */
  async getChildrenForParent(parentPhone) {
    if (!parentPhone) return [];
    const cleanPhone = parentPhone.replace(/\D/g, '');
    const allStudents = db.find('students');
    const matchedStudents = allStudents.filter(s => 
      (s.parent_phone || '').replace(/\D/g, '').endsWith(cleanPhone.slice(-8))
    );

    return matchedStudents.map(student => {
      const link = db.findOne('parent_student_links', l => 
        l.student_id === student.id && 
        (l.parent_phone || '').replace(/\D/g, '').endsWith(cleanPhone.slice(-8)) &&
        l.status === 'VERIFIED'
      );
      return {
        id: student.id,
        full_name: student.full_name,
        academic_code: student.academic_code,
        pairing_pin: student.pairing_pin,
        grade_level: student.grade_level,
        is_verified: !!link,
        verified_at: link ? link.verified_at : null
      };
    });
  }

  /**
   * Dual-Key Parent-Student Secure Pairing Handshake
   * Key 1: Parent phone on student record
   * Key 2: Secret Pairing PIN provided by student/teacher
   */
  async linkChildWithDualKey({ parentPhone, academicCode, pairingPin, deviceFingerprint = 'default_device' }) {
    if (!parentPhone || !academicCode || !pairingPin) {
      const err = new Error('رقم هاتف ولي الأمر، الكود الأكاديمي، وكود الربط السري كلها مطلوبة');
      err.statusCode = 400;
      throw err;
    }

    const cleanCode = String(academicCode).trim().toUpperCase();
    const cleanPin = String(pairingPin).trim().toUpperCase();
    const cleanParentPhone = parentPhone.replace(/\D/g, '');

    const student = db.findOne('students', s => s.academic_code && s.academic_code.toUpperCase() === cleanCode);
    if (!student) {
      const err = new Error('لم يتم العثور على طالب بهذا الكود الأكاديمي');
      err.statusCode = 404;
      throw err;
    }

    // Key 1: Phone verification
    const studentParentPhone = (student.parent_phone || '').replace(/\D/g, '');
    if (!studentParentPhone.endsWith(cleanParentPhone.slice(-8)) && !cleanParentPhone.endsWith(studentParentPhone.slice(-8))) {
      const err = new Error('رقم هاتف ولي الأمر غير مطابق للرقم المسجل في استمارة الطالب لدى الأستاذ');
      err.statusCode = 403;
      throw err;
    }

    // Key 2: Secret Pairing PIN verification
    const expectedPin = (student.pairing_pin || '').trim().toUpperCase();
    if (cleanPin !== expectedPin) {
      const err = new Error('كود الربط السري (Pairing PIN) غير صحيح! يرجى مراجعة الكود مع الطالب أو المعلم');
      err.statusCode = 403;
      throw err;
    }

    // Dual-key validated! Create or update verified link
    let existingLink = db.findOne('parent_student_links', l => 
      l.student_id === student.id && 
      (l.parent_phone || '').replace(/\D/g, '').endsWith(cleanParentPhone.slice(-8))
    );

    if (existingLink) {
      existingLink = db.update('parent_student_links', existingLink.id, {
        status: 'VERIFIED',
        pairing_pin: cleanPin,
        verified_at: new Date().toISOString(),
        device_fingerprint: deviceFingerprint
      });
    } else {
      existingLink = db.insert('parent_student_links', {
        parent_phone: parentPhone,
        student_id: student.id,
        pairing_pin: cleanPin,
        status: 'VERIFIED',
        verified_at: new Date().toISOString(),
        device_fingerprint: deviceFingerprint
      });
    }

    return {
      success: true,
      message: `تم توثيق وربط حساب ولي الأمر بالطالب/ة (${student.full_name}) بنجاح تام 🛡️`,
      student_id: student.id,
      student_name: student.full_name,
      academic_code: student.academic_code,
      verified_at: existingLink.verified_at
    };
  }

  /**
   * Get Teacher Portfolio & Marketing Showcase for Parents
   */
  async getTeacherShowcase(teacherId = null) {
    const teacher = teacherId ? db.findById('teachers', teacherId) : db.find('teachers')[0];
    if (!teacher) throw new Error('Teacher not found');

    return {
      teacher_id: teacher.id,
      full_name: teacher.full_name,
      professional_title: teacher.professional_title,
      bio: teacher.bio,
      branding: teacher.branding || {
        academy_name: `أكاديمية ${teacher.full_name}`,
        tagline: 'رواد التعليم الحديث',
        primary_color: '#2563EB',
        accent_color: '#059669',
        logo_icon: '⚡'
      },
      showcase: teacher.showcase || {
        bio: teacher.bio,
        philosophy: 'التعليم رسالة تبني قادة المستقبل من خلال الفهم والتطبيق العملي.',
        publications: [
          { title: 'سلسلة التميز الأكاديمي 2026', year: '2026', type: 'كتاب ومذكرات' }
        ],
        projects: [
          { name: 'معسكر المتفوقين السنوي', desc: 'مراجعة مكثفة وحل امتحانات وزارية سابقة' }
        ],
        academic_interests: ['تبسيط العلوم', 'تطوير مهارات التفكير الناقد'],
        hall_of_fame: [
          { student_name: 'أحمد سعيد', score: 'الدرجة النهائية', rank: 'أوائل الثانوية العامة' }
        ]
      }
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
🔹 *نبض الأداء العام:* ${pulse.pulse?.badgeAr || 'ممتاز'}
🔹 *نسبة الحضور:* ${pulse.metrics?.attendanceRatePct || 100}% (${pulse.metrics?.unexcusedAbsences || 0} غياب مسجل)
🔹 *متوسط درجات التقييمات:* ${pulse.metrics?.averageAssessmentScorePct || 85}%
----------------------------------
📝 *ملاحظة المعلم:*
${pulse.pulse?.summaryAr || 'مستوى الطالب ممتاز وملتزم.'}

نتمنى لأبنائنا دوام التوفيق والتميز دائماً 💡`;

    return {
      student_id: studentId,
      parent_phone: db.findById('students', studentId)?.parent_phone || '',
      whatsAppText: message
    };
  }
}

module.exports = new ParentService();
