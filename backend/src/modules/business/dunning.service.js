/**
 * TEACHER OS — WhatsApp Dunning & Student Fee Enforcement Service
 * Handles polite payment reminders, digital payment receipts, and grace period access checks.
 */

const db = require('../../core/db');

class DunningService {
  /**
   * Check if a student is allowed to access premium features (Zoom classes, active quizzes)
   */
  async checkStudentAccess(studentId) {
    if (!studentId) {
      return { hasAccess: true, canAccess: true, status: 'ACTIVE' }; // Guest/default fallback
    }

    const student = db.findById('students', studentId);
    if (!student) {
      return { hasAccess: true, canAccess: true, status: 'ACTIVE' };
    }

    // Find student's subscription
    const sub = db.findOne('subscriptions', s => s.student_id === studentId);
    if (!sub) {
      // If no subscription recorded yet, give access under trial
      return { hasAccess: true, canAccess: true, status: 'TRIAL', message: 'فترة تجريبية سارية' };
    }

    const now = new Date();
    const endDate = new Date(sub.end_date);
    const diffDays = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

    if (diffDays >= 0) {
      if (diffDays <= 3) {
        return {
          hasAccess: true,
          canAccess: true,
          status: 'DUE_SOON',
          daysRemaining: diffDays,
          message: `تنبيه ودي: يستحق تجديد الاشتراك بعد ${diffDays} يوم.`
        };
      }
      return { hasAccess: true, canAccess: true, status: 'ACTIVE' };
    }

    // If past end_date, check grace period (2 days)
    const overdueDays = Math.abs(diffDays);
    if (overdueDays <= 2) {
      return {
        hasAccess: true,
        canAccess: true,
        status: 'GRACE_PERIOD',
        overdueDays,
        message: 'فترة سماح سارية لمدة يومين للسداد.'
      };
    }

    // Overdue past grace period -> Suspended
    return {
      hasAccess: false,
      canAccess: false,
      status: 'SUSPENDED_OVERDUE',
      overdueDays,
      feeAmount: sub.fee_amount || 600,
      currency: sub.currency || 'EGP',
      reason: 'عذراً، تم تعليق الاشتراك لانتهاء فترة السماح بالسداد. يرجى سداد الاشتراك لتفعيل حصص الزووم والاختبارات.'
    };
  }

  /**
   * Generate polite WhatsApp payment reminder for student / parent
   */
  async generatePaymentReminder(studentId) {
    const student = db.findById('students', studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    const teacher = db.findById('teachers', student.teacher_id) || db.find('teachers')[0];
    const sub = db.findOne('subscriptions', s => s.student_id === studentId);
    const feeAmount = sub ? sub.fee_amount : 600;

    const whatsAppText = 
`السلام عليكم ورحمة الله وبركاته،
تحية طيبة لحضرتك من مكتب ${teacher ? teacher.full_name : 'أ/ طارق الشناوي'} 🌟

نحيط سيادتكم علماً بموعد تجديد الاشتراك الشهري للطالب/ة:
👤 *الطالب:* ${student.full_name}
🆔 *الكود الأكاديمي:* ${student.academic_code}
💵 *المبلغ المطلوب:* ${feeAmount} ج.م

طرق السداد المتاحة:
⚡ *تحويل إنستاباي (InstaPay):* tarek.physics@instapay
📱 *فودافون كاش:* 01012345678
🏢 *نقداً بالسنتر* أثناء موعد الحصة القادمة.

(بعد التحويل يرجى إرسال صورة الإيصال لتأكيد تجديد الحساب تلقائياً)

شاكرين لسيادتكم حرصكم الدائم على تفوق وتميز أبنائنا 💡`;

    return {
      studentId: student.id,
      studentName: student.full_name,
      parentPhone: student.parent_phone,
      whatsAppText,
      encodedUrl: `https://api.whatsapp.com/send?phone=${student.parent_phone ? student.parent_phone.replace(/[^0-9]/g, '') : ''}&text=${encodeURIComponent(whatsAppText)}`
    };
  }

  /**
   * Generate Official WhatsApp Receipt
   */
  async generatePaymentReceipt(paymentId) {
    const payment = db.findById('payments', paymentId);
    if (!payment) {
      throw new Error('Payment record not found');
    }

    const student = db.findById('students', payment.student_id);
    const teacher = db.findById('teachers', payment.teacher_id) || db.find('teachers')[0];

    const whatsAppText = 
`السلام عليكم ورحمة الله،
إيصال سداد إلكتروني معتمد 🧾

تم استلام دفعة الاشتراك الشهري بنجاح للطالب/ة:
👤 *الطالب:* ${student ? student.full_name : 'طالب'}
🆔 *كود الطالب:* ${student ? student.academic_code : '—'}
💵 *المبلغ المسدد:* ${payment.amount} ج.م
💳 *طريقة الدفع:* ${payment.payment_method}
🔢 *رقم الإيصال:* ${payment.id}
📅 *تاريخ السداد:* ${new Date(payment.recorded_at).toLocaleDateString('ar-EG')}

✅ تم تفعيل حساب الطالب بالكامل وإتاحة كافة حصص الزووم المباشرة والامتحانات.
شكراً لالتزامكم ونتمنى لأبنائنا دوام التميز 🌟`;

    return {
      paymentId: payment.id,
      whatsAppText,
      encodedUrl: `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsAppText)}`
    };
  }
}

module.exports = new DunningService();
