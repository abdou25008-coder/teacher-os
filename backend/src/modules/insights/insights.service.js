/**
 * TEACHER OS — Closed-Loop Intelligence & Cognitive Gap Mining Service
 */

const db = require('../../core/db');
const eventBus = require('../../core/events');

class InsightsService {
  constructor() {
    this._subscribeToEvents();
  }

  _subscribeToEvents() {
    // Automatically update concept mastery on student attempt submission
    eventBus.on('STUDENT_ATTEMPT_SUBMITTED', payload => {
      this.processAttemptConceptMastery(payload);
    });
  }

  /**
   * Updates discrete concept mastery records based on graded answers
   */
  processAttemptConceptMastery({ studentId, answers }) {
    for (const ans of answers) {
      if (!ans.concept_id) continue;

      const key = `${studentId}:${ans.concept_id}`;
      const existing = db.findOne('concept_mastery', cm => cm.student_id === studentId && cm.concept_id === ans.concept_id);

      const delta = ans.is_correct ? 0.35 : -0.35;

      if (existing) {
        const newScore = Math.max(0.0, Math.min(1.0, Number(existing.mastery_score) + delta));
        const newConfidence = existing.evidence_count >= 3 ? 'HIGH' : 'MEDIUM';
        db.update('concept_mastery', existing.id, {
          mastery_score: Number(newScore.toFixed(2)),
          evidence_count: existing.evidence_count + 1,
          confidence_level: newConfidence,
          last_assessed_at: new Date().toISOString()
        });
      } else {
        const initialScore = ans.is_correct ? 0.85 : 0.25;
        db.insert('concept_mastery', {
          student_id: studentId,
          concept_id: ans.concept_id,
          mastery_score: initialScore,
          evidence_count: 1,
          confidence_level: 'LOW',
          last_assessed_at: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Mine cognitive learning gaps for a group or teacher
   */
  async mineLearningGaps(teacherId, groupId = null) {
    let targetGroups = [];
    if (groupId) {
      const g = db.findById('groups', groupId);
      if (g && g.teacher_id === teacherId) targetGroups = [g];
    } else {
      targetGroups = db.find('groups', g => g.teacher_id === teacherId);
    }

    const gapReports = [];

    for (const group of targetGroups) {
      const memberships = db.find('group_memberships', m => m.group_id === group.id && m.status === 'ACTIVE');
      const studentIds = memberships.map(m => m.student_id);
      if (studentIds.length === 0) continue;

      // Group mastery by concept
      const conceptStats = new Map(); // conceptId -> { totalScore: number, studentCount: number, weakStudents: [] }

      for (const sId of studentIds) {
        const masteries = db.find('concept_mastery', cm => cm.student_id === sId);
        for (const m of masteries) {
          if (!conceptStats.has(m.concept_id)) {
            conceptStats.set(m.concept_id, { totalScore: 0, studentCount: 0, weakStudents: [] });
          }
          const stat = conceptStats.get(m.concept_id);
          stat.totalScore += Number(m.mastery_score);
          stat.studentCount += 1;
          if (m.mastery_score < 0.6) {
            const stu = db.findById('students', sId);
            stat.weakStudents.push({ id: sId, name: stu ? stu.full_name : '' });
          }
        }
      }

      // Generate gap insights for concepts with average mastery < 65%
      for (const [conceptId, stat] of conceptStats.entries()) {
        const avgMastery = stat.studentCount > 0 ? (stat.totalScore / stat.studentCount) : 1.0;
        if (avgMastery < 0.65) {
          const concept = db.findById('concepts', conceptId);
          const failureRatePct = Math.round((stat.weakStudents.length / studentIds.length) * 100);

          const insightRecord = {
            teacher_id: teacherId,
            target_type: 'GROUP',
            target_id: group.id,
            group_name: group.name,
            concept_id: conceptId,
            concept_name_ar: concept ? concept.name_ar : 'مفهوم دراسي',
            concept_code: concept ? concept.code : '',
            confidence: 0.92,
            average_mastery_pct: Math.round(avgMastery * 100),
            students_needing_review_count: stat.weakStudents.length,
            failure_rate_pct: failureRatePct,
            evidence: {
              summaryAr: `أظهر ${failureRatePct}% من طلاب ${group.name} صعوبة في استيعاب مفهوم (${concept ? concept.name_ar : ''}) بناءً على نتائج التقييمات الأخيرة.`,
              affectedStudents: stat.weakStudents
            },
            recommendation: {
              actionType: 'TARGETED_REVISION',
              titleAr: `تخصيص نشاط مراجعة 10 دقائق لمفهوم: ${concept ? concept.name_ar : ''}`,
              actionPayload: {
                conceptId,
                groupId: group.id,
                suggestedDurationMins: 10
              }
            }
          };

          // Save insight to DB if not exists
          const existingInsight = db.findOne('insights', i => i.teacher_id === teacherId && i.target_id === group.id && i.title_ar === insightRecord.concept_name_ar);
          if (!existingInsight) {
            db.insert('insights', {
              teacher_id: teacherId,
              target_type: 'GROUP',
              target_id: group.id,
              title_ar: insightRecord.concept_name_ar,
              confidence: 0.92,
              evidence_json: insightRecord.evidence,
              recommendation_json: insightRecord.recommendation,
              is_dismissed: false
            });
          }

          gapReports.push(insightRecord);
        }
      }
    }

    return gapReports;
  }

  /**
   * "My Intelligent Day" Daily Briefing & Prioritized Agenda
   */
  async getMyIntelligentDay(teacherId) {
    const gaps = await this.mineLearningGaps(teacherId);
    const groups = db.find('groups', g => g.teacher_id === teacherId);
    const sessions = db.find('sessions', s => s.teacher_id === teacherId && s.status === 'SCHEDULED');

    // Build top priority action
    let topPriority = null;
    if (gaps.length > 0) {
      const topGap = gaps[0];
      topPriority = {
        priorityLevel: 'HIGH',
        badge: 'أولوية تعليمية عاجلة',
        title: `مراجعة ${topGap.concept_name_ar} مع ${topGap.group_name}`,
        reason: topGap.evidence.summaryAr,
        confidencePct: Math.round(topGap.confidence * 100),
        actionButtonText: 'إنشاء بطاقة مراجعة سريعة (1-Tap)',
        actionType: 'CREATE_MICRO_REVISION',
        payload: topGap.recommendation.actionPayload
      };
    } else {
      topPriority = {
        priorityLevel: 'NORMAL',
        badge: 'الأداء مستقر وممتاز',
        title: 'جميع المجموعات تسير وفق الخطة الزمنية',
        reason: 'لا توجد فجوات مفاهيمية حرجة مسجلة في التقييمات الأخيرة.',
        confidencePct: 98,
        actionButtonText: 'إعداد درس الحصة القادمة',
        actionType: 'CREATE_LESSON_PLAN',
        payload: {}
      };
    }

    // Build upcoming schedule timeline
    const upcomingSchedule = sessions.map(s => {
      const grp = db.findById('groups', s.group_id);
      return {
        sessionId: s.id,
        groupName: grp ? grp.name : 'مجموعة',
        topic: s.topic,
        scheduledAt: s.scheduled_at,
        durationMins: s.duration_mins
      };
    });

    return {
      date: new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      greeting: 'صباح الخير يا أستاذ، إليك ملخص يومك الذكي:',
      topPriority,
      learningGapsCount: gaps.length,
      activeGroupsCount: groups.length,
      upcomingSessionsCount: sessions.length,
      upcomingSchedule,
      detectedGaps: gaps
    };
  }

  /**
   * Execute 1-click remediation generator from an insight
   */
  async triggerRemediation(teacherId, { conceptId, groupId }) {
    const concept = db.findById('concepts', conceptId);
    const group = db.findById('groups', groupId);

    const revisionPlan = {
      title: `بطاقة معالجة فجوة تعليمية: ${concept ? concept.name_ar : ''}`,
      targetGroup: group ? group.name : '',
      conceptCode: concept ? concept.code : '',
      remediationSteps: [
        'إعادة توضيح الفارق الجوهري بين توصيل التوالي والتوازي مع رسم توضيحي مبسط.',
        'حل مسألة نموذجية خطوة بخطوة مع التركيز على نقطة توزيع التيار (I_branch).',
        'تكليف الطلاب بحل تمرين تدريبي مكثف (سؤالين) مع تصحيح فوري.'
      ],
      quickAssessmentQuestions: [
        {
          prompt: `تمرين علاجي: سلكان من نفس المادة متصلان على التوازي، إذا كان طول الأول ضعف الثاني، فما نسبة التيار المار فيهما؟`,
          correctAnswer: 'النسبة عكسية مع المقاومة، وبالتالي يمر تيار أكبر في السلك الأقصر.',
          marks: 5
        }
      ]
    };

    eventBus.emit('REMEDIATION_TRIGGERED', { teacherId, groupId, conceptId });

    return {
      success: true,
      message: 'تم إنشاء وتوجيه خطة المراجعة العلاجية بنجاح لإغلاق الفجوة التعليمية',
      data: revisionPlan
    };
  }
}

module.exports = new InsightsService();
