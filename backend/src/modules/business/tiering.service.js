/**
 * TEACHER OS — SaaS Tiering & Feature Gatekeeper Service
 * Manages Teacher subscription plans, feature gates, and usage quotas.
 */

const db = require('../../core/db');
const eventBus = require('../../core/events');

const SAAS_PLANS = {
  FREE_STARTER: {
    id: 'FREE_STARTER',
    nameAr: 'الباقة الأساسية المفتوحة (مجانية مدى الحياة)',
    priceEGP: 0,
    maxGroups: 2,
    maxStudents: 35,
    allowAI: true,
    aiMonthlyLimit: 15,
    allowOCR: true,
    ocrMonthlyLimit: 20,
    allowZoom: true,
    zoomMonthlyLimit: 5,
    allowVaultUploads: 5,
    allowMultiAssistant: false,
    allowDigitalTwin: false,
    allowBulkOCR: false,
    allowCustomBranding: false,
    badgeColor: '#64748B',
    tagline: 'تجربة مفتوحة لكافة المميزات بقدرات مخصصة للدروس المصغرة'
  },
  PRO_TEACHER: {
    id: 'PRO_TEACHER',
    nameAr: 'باقة المعلم المحترف (Pro Teacher)',
    priceEGP: 500,
    maxGroups: 10,
    maxStudents: 300,
    allowAI: true,
    aiMonthlyLimit: 999,
    allowOCR: true,
    ocrMonthlyLimit: 500,
    allowZoom: true,
    zoomMonthlyLimit: 999,
    allowVaultUploads: 50,
    allowMultiAssistant: true,
    allowDigitalTwin: false,
    allowBulkOCR: false,
    allowCustomBranding: false,
    badgeColor: '#2563EB',
    tagline: 'الخيار الأمثل للمدرس الخصوصي المحترف لرفع طاقته لـ 300 طالب وزووم ومصحح ضوئي مفتوح'
  },
  ENTERPRISE_CENTER: {
    id: 'ENTERPRISE_CENTER',
    nameAr: 'باقة السنتر الذكي والنخبة الفائقة (Enterprise AI Center)',
    priceEGP: 1200,
    maxGroups: 999,
    maxStudents: 9999,
    allowAI: true,
    aiMonthlyLimit: 9999,
    allowOCR: true,
    ocrMonthlyLimit: 9999,
    allowZoom: true,
    zoomMonthlyLimit: 9999,
    allowVaultUploads: 999,
    allowMultiAssistant: true,
    allowDigitalTwin: true,
    allowBulkOCR: true,
    allowCustomBranding: true,
    allowWhatsAppGateway: true,
    badgeColor: '#7C3AED',
    tagline: 'منظومة السناتر الكبرى الذكية مع التوأم الرقمي للمعلم والمصحح الضوئي الجماعي'
  }
};

class TieringService {
  /**
   * Get all available commercial plans
   */
  getAvailablePlans() {
    return Object.values(SAAS_PLANS);
  }

  /**
   * Get teacher's current SaaS tier and active usage limits
   */
  async getTeacherTier(teacherId) {
    if (!teacherId) {
      teacherId = db.find('teachers')[0]?.id;
    }
    const teacher = db.findById('teachers', teacherId);
    if (!teacher) {
      throw new Error('Teacher not found');
    }

    const currentPlanId = teacher.saas_plan || 'PRO_TEACHER'; // default seeded to PRO for rich experience
    const plan = SAAS_PLANS[currentPlanId] || SAAS_PLANS.FREE_STARTER;

    // Calculate live usage
    const groups = db.find('groups', g => g.teacher_id === teacherId);
    const students = db.find('students', s => s.teacher_id === teacherId);
    const docs = db.find('knowledge_documents', d => d.teacher_id === teacherId);

    return {
      teacherId,
      teacherName: teacher.full_name,
      planId: plan.id,
      planNameAr: plan.nameAr,
      priceEGP: plan.priceEGP,
      features: {
        allowAI: plan.allowAI,
        aiMonthlyLimit: plan.aiMonthlyLimit,
        allowOCR: plan.allowOCR,
        ocrMonthlyLimit: plan.ocrMonthlyLimit,
        allowZoom: plan.allowZoom,
        zoomMonthlyLimit: plan.zoomMonthlyLimit,
        allowMultiAssistant: plan.allowMultiAssistant,
        allowDigitalTwin: plan.allowDigitalTwin,
        allowBulkOCR: plan.allowBulkOCR,
        allowCustomBranding: plan.allowCustomBranding,
        allowWhatsAppGateway: Boolean(plan.allowWhatsAppGateway)
      },
      usage: {
        groupsCount: groups.length,
        maxGroups: plan.maxGroups,
        studentsCount: students.length,
        maxStudents: plan.maxStudents,
        vaultDocsCount: docs.length,
        maxVaultDocs: plan.allowVaultUploads
      },
      isOverLimit: {
        groups: groups.length >= plan.maxGroups,
        students: students.length >= plan.maxStudents
      },
      badgeColor: plan.badgeColor
    };
  }

  /**
   * Check feature access (Feature Gatekeeper Middleware logic)
   */
  async verifyFeatureAccess(teacherId, featureKey) {
    const tier = await this.getTeacherTier(teacherId);
    if (featureKey === 'ZOOM' && !tier.features.allowZoom) {
      throw new Error('خاصية الزووم غير متاحة في باقتك الحالية. يرجى الترقية إلى باقة المعلم المحترف (Pro) للتفعيل.');
    }
    if (featureKey === 'OCR' && !tier.features.allowOCR) {
      throw new Error('المصحح الضوئي للامتحانات الورقية مقفل في باقتك. يرجى الترقية إلى باقة المحترف (Pro).');
    }
    if (featureKey === 'DIGITAL_TWIN' && !tier.features.allowDigitalTwin) {
      throw new Error('خاصية التوأم الرقمي للمعلم (AI Teacher Digital Twin 24/7) حصرية لباقة السنتر والنخبة (Enterprise AI Center).');
    }
    if (featureKey === 'BULK_OCR' && !tier.features.allowBulkOCR) {
      throw new Error('المصحح الضوئي الجماعي فائق السرعة متاح حصرياً في باقة السنتر والنخبة (Enterprise AI Center).');
    }
    if (featureKey === 'CUSTOM_BRANDING' && !tier.features.allowCustomBranding) {
      throw new Error('تخصيص هوية وعلامة السنتر المائية متاح حصرياً في باقة السنتر والنخبة (Enterprise AI Center).');
    }
    if (featureKey === 'MULTI_ASSISTANT' && !tier.features.allowMultiAssistant) {
      throw new Error('إضافة حسابات السكرتارية والمساعدين تتطلب باقة المحترف (Pro) أو السنتر (Enterprise).');
    }
    if (featureKey === 'ADD_GROUP' && tier.isOverLimit.groups) {
      throw new Error(`وصلت للحد الأقصى لعدد المجموعات في باقتك (${tier.usage.maxGroups} مجموعة). يرجى الترقية لإضافة مجموعات جديدة.`);
    }
    if (featureKey === 'ADD_STUDENT' && tier.isOverLimit.students) {
      throw new Error(`وصلت للحد الأقصى لعدد الطلاب في باقتك (${tier.usage.maxStudents} طالب). يرجى الترقية لزيادة السعة.`);
    }
    return true;
  }

  /**
   * Upgrade teacher SaaS plan
   */
  async upgradePlan(teacherId, { newPlanId, paymentMethod = 'INSTAPAY', referenceId }) {
    if (!SAAS_PLANS[newPlanId]) {
      throw new Error('Invalid plan selected');
    }

    if (!teacherId) {
      teacherId = db.find('teachers')[0]?.id;
    }

    const teacher = db.findById('teachers', teacherId);
    if (!teacher) {
      throw new Error('Teacher not found');
    }

    const previousPlan = teacher.saas_plan || 'FREE_STARTER';
    db.update('teachers', teacherId, {
      saas_plan: newPlanId,
      plan_upgraded_at: new Date().toISOString()
    });

    eventBus.emit('TEACHER_PLAN_UPGRADED', {
      teacherId,
      previousPlan,
      newPlanId,
      paymentMethod,
      referenceId
    });

    return {
      success: true,
      teacherId,
      plan: SAAS_PLANS[newPlanId],
      message: `🎉 تهانينا! تم تفعيل ${SAAS_PLANS[newPlanId].nameAr} بنجاح.`
    };
  }
}

module.exports = new TieringService();
