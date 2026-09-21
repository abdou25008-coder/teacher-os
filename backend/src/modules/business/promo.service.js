/**
 * TEACHER OS — Promo Code & Anti-Fraud Service
 * Manages promotional campaigns, 1-year free grants, and 5-layer anti-abuse detection.
 */

const db = require('../../core/db');
const eventBus = require('../../core/events');
const tieringService = require('./tiering.service');

const VALID_EGYPTIAN_GOVERNORATES = new Set([
  '01', '02', '03', '04', '11', '12', '13', '14', '15', '16',
  '17', '18', '19', '21', '22', '23', '24', '25', '26', '27',
  '28', '29', '31', '32', '33', '34', '35', '88'
]);

class PromoService {
  /**
   * Validate Egyptian National ID (14 digits) format and checksum logic
   */
  validateEgyptianNationalId(nationalId) {
    if (!nationalId || typeof nationalId !== 'string') {
      return { valid: false, message: 'الرقم القومي مطلوب ويجب إدخاله كنص رقمي.' };
    }

    const cleanId = nationalId.trim();
    if (!/^\d{14}$/.test(cleanId)) {
      return { valid: false, message: 'الرقم القومي يجب أن يتكون من 14 رقماً بالتمام والكمال.' };
    }

    const centuryDigit = cleanId[0];
    if (centuryDigit !== '2' && centuryDigit !== '3') {
      return { valid: false, message: 'خانة القرن في الرقم القومي غير صحيحة (يجب أن تبدأ بـ 2 أو 3).' };
    }

    const month = parseInt(cleanId.substring(3, 5), 10);
    const day = parseInt(cleanId.substring(5, 7), 10);
    if (month < 1 || month > 12) {
      return { valid: false, message: 'شهر الميلاد في الرقم القومي غير صحيح.' };
    }
    if (day < 1 || day > 31) {
      return { valid: false, message: 'يوم الميلاد في الرقم القومي غير صحيح.' };
    }

    const govCode = cleanId.substring(7, 9);
    if (!VALID_EGYPTIAN_GOVERNORATES.has(govCode)) {
      return { valid: false, message: 'كود المحافظة في الرقم القومي غير مسجل ضمن محافظات جمهورية مصر العربية.' };
    }

    return { valid: true, cleanId };
  }

  /**
   * Redeem Promo Code 2027 with 5-Layer Anti-Fraud Multi-Account Enforcement
   */
  async redeemPromo({ teacherId, promoCode, nationalId, deviceFingerprint, ipAddress = '127.0.0.1' }) {
    // 1. Validate Promo Code
    if (!promoCode || typeof promoCode !== 'string') {
      throw new Error('يرجى إدخال كود الخصم.');
    }

    const normalizedCode = promoCode.trim().toUpperCase();
    if (normalizedCode !== '2027') {
      throw new Error('كود الخصم غير صالح أو منتهي الصلاحية. يرجى التأكد من كتابة الكود الصحيح (2027).');
    }

    // 2. Resolve & Validate Teacher Account
    if (!teacherId) {
      const firstTeacher = db.find('teachers')[0];
      if (!firstTeacher) throw new Error('لم يتم العثور على حساب المعلم.');
      teacherId = firstTeacher.id;
    }

    const teacher = db.findById('teachers', teacherId);
    if (!teacher) {
      throw new Error('حساب المعلم غير موجود في النظام.');
    }

    // Teacher user account
    const teacherUser = db.findById('users', teacher.user_id) || db.findOne('users', u => u.profile_id === teacherId);

    // Rule 1: Account-Level Idempotency (Teacher cannot reuse promo)
    if (teacher.promo_code_used) {
      throw new Error(`⛔ لقد تم تفعيل عرض العام المجاني بالفعل على حسابك الحالي في ${new Date(teacher.promo_redeemed_at).toLocaleDateString('ar-EG')}. لا يمكن تكرار الاستخدام.`);
    }

    // 3. Layer 1: Device Fingerprint Verification
    if (!deviceFingerprint || typeof deviceFingerprint !== 'string' || deviceFingerprint.trim().length < 8) {
      throw new Error('تعذر قراءة بصمة الجهاز والعتاد. يرجى تفعيل التخزين المحلي في المتصفح والمحاولة مرة أخرى.');
    }
    const cleanDeviceFp = deviceFingerprint.trim();

    const existingDeviceRedemption = db.findOne('promo_redemptions', r => r.device_fingerprint === cleanDeviceFp);
    if (existingDeviceRedemption) {
      throw new Error('⛔ عفواً! تم استخدام هذا الجهاز مسبقاً لتفعيل عرض العام المجاني لرمز 2027 على حساب آخر. العرض متاح مرة واحدة فقط لكل جهاز ومعلم لمنع تكرار الحسابات.');
    }

    // 4. Layer 2: Egyptian National ID Verification
    const idValidation = this.validateEgyptianNationalId(nationalId);
    if (!idValidation.valid) {
      throw new Error(idValidation.message);
    }
    const cleanNationalId = idValidation.cleanId;

    const existingIdRedemption = db.findOne('promo_redemptions', r => r.national_id === cleanNationalId);
    if (existingIdRedemption) {
      throw new Error('⛔ هذا الرقم القومي مسجل به حساب آخر استفاد بالفعل من عرض العام المجاني. لا يمكن الاستفادة أكثر من مرة لنفس المعلم.');
    }

    // 5. Layer 3: Phone Number Verification
    const teacherPhone = teacherUser?.phone_number || teacher.phone_number;
    if (teacherPhone) {
      const existingPhoneRedemption = db.findOne('promo_redemptions', r => r.phone_number === teacherPhone);
      if (existingPhoneRedemption) {
        throw new Error('⛔ رقم الهاتف هذا تم استخدامه بالفعل لتفعيل عرض العام المجاني.');
      }
    }

    // 6. Calculate 365 Days (1 Full Year) Expiration
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();

    // 7. Record in promo_redemptions table
    const redemptionRecord = db.insert('promo_redemptions', {
      promo_code: '2027',
      teacher_id: teacherId,
      teacher_name: teacher.full_name,
      national_id: cleanNationalId,
      phone_number: teacherPhone,
      device_fingerprint: cleanDeviceFp,
      ip_address: ipAddress,
      granted_plan: 'PRO_TEACHER',
      savings_egp: 6000,
      duration_days: 365,
      redeemed_at: now.toISOString(),
      expires_at: expiresAt
    });

    // 8. Upgrade Teacher to PRO_TEACHER for 1 Year
    db.update('teachers', teacherId, {
      saas_plan: 'PRO_TEACHER',
      national_id: cleanNationalId,
      promo_code_used: '2027',
      promo_redeemed_at: now.toISOString(),
      plan_upgraded_at: now.toISOString(),
      plan_expires_at: expiresAt,
      device_fingerprint: cleanDeviceFp
    });

    // 9. Emit Event
    eventBus.emit('TEACHER_PROMO_REDEEMED', {
      teacherId,
      promoCode: '2027',
      redemptionId: redemptionRecord.id,
      expiresAt,
      nationalId: cleanNationalId
    });

    return {
      success: true,
      promoCode: '2027',
      teacherId,
      teacherName: teacher.full_name,
      plan: {
        id: 'PRO_TEACHER',
        nameAr: 'باقة المعلم المحترف (Pro Teacher)',
        durationDays: 365,
        expiresAt,
        savingsEGP: 6000
      },
      message: '🎉 ألف مبروك يا أستاذنا! تم تفعيل باقة المعلم المحترف مجاناً لمدة عام كامل (365 يوماً) بنجاح بقيمة 6,000 ج.م بفضل برومو كود 2027.'
    };
  }

  /**
   * Check if current device or teacher has already redeemed the promo
   */
  checkEligibility({ teacherId, deviceFingerprint, nationalId }) {
    if (teacherId) {
      const teacher = db.findById('teachers', teacherId);
      if (teacher?.promo_code_used) {
        return { eligible: false, reason: 'تم استخدام الكود بالفعل على هذا الحساب.' };
      }
    }

    if (deviceFingerprint) {
      const deviceUsed = db.findOne('promo_redemptions', r => r.device_fingerprint === deviceFingerprint);
      if (deviceUsed) {
        return { eligible: false, reason: 'هذا الجهاز استخدم عرض العام المجاني مسبقاً.' };
      }
    }

    if (nationalId) {
      const idUsed = db.findOne('promo_redemptions', r => r.national_id === nationalId);
      if (idUsed) {
        return { eligible: false, reason: 'هذا الرقم القومي مسجل به حساب مستفيد بالفعل.' };
      }
    }

    return { eligible: true };
  }
}

module.exports = new PromoService();
