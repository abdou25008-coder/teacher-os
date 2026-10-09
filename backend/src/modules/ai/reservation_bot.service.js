/**
 * ============================================================================
 * TEACHER OS — 24/7 AI WHATSAPP & WEB RESERVATION BOT (EGYPTIAN EDTECH)
 * ============================================================================
 * Sits on WhatsApp and Public Web Portfolio:
 * 1. Automatic Lead Capture & Center Seat Reservations.
 * 2. Instant Dialect-Aware FAQ Responses (Prices, Schedules, Centers, Cash).
 * 3. CRM Lead Routing & Auto-Generated Fawry Reference Codes.
 * ============================================================================
 */

const db = require('../../core/db');
const eventBus = require('../../core/events');

class AIReservationBotService {
  constructor() {
    this.teacherName = 'أ/ طارق الشناوي';
    this.subject = 'الفيزياء للثانوية العامة واللغات';
    this.centers = [
      { name: 'سنتر النخبة (الدقي)', days: 'الأحد والأربعاء 4:00 عصراً', seatsLeft: 14 },
      { name: 'سنتر الأوائل (مدينة نصر)', days: 'الإثنين والخميس 6:00 مساءً', seatsLeft: 8 },
      { name: 'أكاديمية أونلاين (Zoom Live)', days: 'الجمعة 8:00 مساءً (شحن المذكرات للبيت)', seatsLeft: 120 }
    ];
    this.pricing = {
      monthlyCenter: 600,
      monthlyOnline: 450,
      bookletPack: 180
    };
  }

  /**
   * Process incoming inquiry from student or parent
   */
  async processInquiry({ senderPhone = '01012345678', senderName = 'ولي أمر / طالب', messageText = '' }) {
    const text = messageText.toLowerCase().trim();
    let intent = 'GENERAL';
    let replyText = '';
    let leadCreated = null;

    // 1. Seat Reservation Intent (Top Priority for Lead Capture)
    if (text.includes('حجز') || text.includes('احجز') || text.includes('تسجيل') || text.includes('اشترك')) {
      intent = 'SEAT_RESERVATION';

      const leadId = 'LEAD-' + Math.floor(100000 + Math.random() * 900000);
      leadCreated = db.insert('crm_student_leads', {
        id: leadId,
        student_name: senderName,
        phone: senderPhone,
        raw_message: messageText,
        stage: 'NEW_RESERVATION',
        assigned_teacher: this.teacherName,
        created_at: new Date().toISOString()
      });

      eventBus.emit('NEW_STUDENT_LEAD_CAPTURED', leadCreated);

      replyText = 
`تم تسجيل طلب الحجز المبدئي بنجاح يا ${senderName}! 🎉
رقم طلبك: *${leadId}*

تم إخطار سكرتارية المستر لتأكيد المقعد وإصدار كود الدخول الخاص بك.
إذا كنت تريد الدفع الفوري لتأكيد الحجز، اختر: *فودافون كاش* أو *فوري*.`;
    }

    // 2. Centers & Schedules Inquiry
    else if (text.includes('مواعيد') || text.includes('جدول') || text.includes('فين') || text.includes('عنوان') || text.includes('سنتر') || text.includes('مكان')) {
      intent = 'CENTERS_AND_SCHEDULES';
      replyText = 
`أهلاً بك يا بطل! ⚡ مواعيد وأماكن مجموعات ${this.teacherName} (${this.subject}):

📍 *1. سنتر النخبة (الدقي):*
• الأحد والأربعاء - 4:00 عصراً (متبقي 14 مقعد)

📍 *2. سنتر الأوائل (مدينة نصر):*
• الإثنين والخميس - 6:00 مساءً (متبقي 8 مقاعد)

🌐 *3. كورس الأونلاين التفاعلي (محافظات):*
• بث مباشر زووم + تسجيلات + تصحيح واجبات وتوصيل المذكرات.

لحجز مكانك، اكتب: *حجز + اسمك + مجموعتك المفضلة* وسنتواصل معك فوراً! ✨`;
    }

    // 2. Pricing & Fees Inquiry
    else if (text.includes('بكام') || text.includes('سعر') || text.includes('مصاريف') || text.includes('اشتراك') || text.includes('تكلفة') || text.includes('كام')) {
      intent = 'PRICING_FEES';
      replyText = 
`أهلاً بك! إليك تفاصيل اشتراكات مجموعات ${this.teacherName}:

💰 *السنتر الحضوري:* ${this.pricing.monthlyCenter} ج.م شهرياً (تشمل 8 حصص + امتحانات أسبوعية بابل شيت + المتابعة).
🌐 *الأونلاين التفاعلي:* ${this.pricing.monthlyOnline} ج.م شهرياً (بث زووم مشفر + كبسولات الفيديو + بنك الأسئلة).
📚 *باكدج المذكرات وبنك الأسئلة الشامل:* ${this.pricing.bookletPack} ج.م للترمين.

طرق السداد المتاحة: *فودافون كاش، إنستاباي، أو فوري باي*.`;
    }

    // 3. Payment Methods Inquiry
    else if (text.includes('فودافون') || text.includes('كاش') || text.includes('انستاباي') || text.includes('إنستاباي') || text.includes('فوري') || text.includes('ادفع') || text.includes('أدفع')) {
      intent = 'PAYMENT_METHODS';
      replyText = 
`طرق السداد المعتمدة لدى سكرتارية ${this.teacherName}:

📱 *فودافون كاش:* 01099887766
⚡ *InstaPay:* tarek-physics@instapay
🏪 *فوري باي (Fawry):* كود الخدمة 788 أو طلب كود فوري خاص بك.

بعد التحويل، يرجى إرسال صورة الإيصال أو رقم الحوالة هنا فوراً لتفعيل الحساب! 🧾`;
    }

    // 4. Booking Registration Intent
    else if (text.includes('حجز') || text.includes('احجز') || text.includes('تسجيل') || text.includes('اشترك')) {
      intent = 'SEAT_RESERVATION';

      const leadId = 'LEAD-' + Math.floor(100000 + Math.random() * 900000);
      leadCreated = db.insert('crm_student_leads', {
        id: leadId,
        student_name: senderName,
        phone: senderPhone,
        raw_message: messageText,
        stage: 'NEW_RESERVATION',
        assigned_teacher: this.teacherName,
        created_at: new Date().toISOString()
      });

      eventBus.emit('NEW_STUDENT_LEAD_CAPTURED', leadCreated);

      replyText = 
`تم تسجيل طلب الحجز المبدئي بنجاح يا ${senderName}! 🎉
رقم طلبك: *${leadId}*

تم إخطار سكرتارية المستر لتأكيد المقعد وإصدار كود الدخول الخاص بك.
إذا كنت تريد الدفع الفوري لتأكيد الحجز، اختر: *فودافون كاش* أو *فوري*.`;
    }

    // 5. Default Fallback
    else {
      intent = 'GENERAL_FAQ';
      replyText = 
`أهلاً بك في المساعد الذكي لأكاديمية ${this.teacherName}! ⚡
أنا هنا لمساعدتك على مدار 24 ساعة. يمكنك سؤالي عن:
1️⃣ مواعيد السناتر والأماكن المتاحة
2️⃣ أسعار الاشتراكات والمذكرات
3️⃣ طرق الدفع (فودافون كاش / إنستاباي / فوري)
4️⃣ حجز مقعد جديد بالاسم والهاتف

اكتب سؤالك وسأجيبك فوراً! 🚀`;
    }

    return {
      intent: intent,
      senderPhone: senderPhone,
      replyText: replyText,
      leadCreated: leadCreated,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get leads overview for the teacher CRM
   */
  getLeadsReport() {
    const leads = db.find('crm_student_leads', () => true) || [];
    return {
      totalLeads: leads.length,
      recentLeads: leads.slice(-5)
    };
  }
}

module.exports = new AIReservationBotService();
