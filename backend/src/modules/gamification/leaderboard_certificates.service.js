/**
 * ============================================================================
 * TEACHER OS — HALL OF FAME LEADERBOARD & SOCIAL CERTIFICATE GENERATOR
 * ============================================================================
 * Gamification & Motivation Suite for Egyptian High School Students:
 * 1. Monthly Hall of Fame (لوحة شرف أوائل السناتر والجمهورية).
 * 2. Real-Time Points, Streak Badges, and Solved Question Metrics.
 * 3. 1-Click High-Res Certificate of Honor Generator (شهادة تقدير معتمدة).
 * 4. Social Sharing Metadata for Facebook & WhatsApp Stories.
 * ============================================================================
 */

const db = require('../../core/db');
const eventBus = require('../../core/events');

class LeaderboardCertificatesService {
  constructor() {
    this.teacherName = 'الأستاذ طارق الشناوي';
    this.subject = 'الفيزياء للثانوية العامة';
  }

  /**
   * Get Top 10 Hall of Fame Students across Centers & Online
   */
  getMonthlyLeaderboard(month = 'أكتوبر 2026') {
    return {
      month: month,
      teacher: this.teacherName,
      subject: this.subject,
      totalCompetitors: 1420,
      leaderboard: [
        { rank: 1, name: 'أحمد محمود رضوان', code: 'STU-99214', score: '59.5/60', center: 'سنتر النخبة (الدقي)', badge: '👑 الأول على الجمهورية', points: 2840, streakDays: 24 },
        { rank: 2, name: 'سارة أسامة الجوهري', code: 'STU-44129', score: '59.0/60', center: 'سنتر الأوائل (مدينة نصر)', badge: '🥈 المركز الثاني', points: 2710, streakDays: 21 },
        { rank: 3, name: 'كريم أشرف هلال', code: 'STU-18290', score: '58.5/60', center: 'أكاديمية أونلاين', badge: '🥉 المركز الثالث', points: 2650, streakDays: 19 },
        { rank: 4, name: 'مريم طارق الفقي', code: 'STU-77218', score: '58.0/60', center: 'سنتر النخبة', badge: '⭐ وسام الدقة الفائقة', points: 2590, streakDays: 17 },
        { rank: 5, name: 'يوسف حسام الدين', code: 'STU-55201', score: '57.5/60', center: 'سنتر الأوائل', badge: '⭐ وسام الدقة الفائقة', points: 2510, streakDays: 15 }
      ]
    };
  }

  /**
   * Generate High-Res Certificate of Honor for Top Performer
   */
  generateCertificate(studentInfo = {}) {
    const student = Object.assign({}, {
      name: 'أحمد محمود رضوان',
      code: 'STU-99214',
      rank: 'المركز الأول على مستوى الجمهورية',
      score: '59.5 من 60 (99.2%)',
      examTitle: 'امتحان الفيزياء الشامل للثانوية العامة — الفصل الثالث',
      center: 'سنتر النخبة'
    }, studentInfo);

    const certId = 'CERT-' + Math.floor(100000 + Math.random() * 900000);
    const issueDate = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

    const certificate = {
      certificateId: certId,
      studentName: student.name,
      academicCode: student.code,
      honorTitle: 'شهادة تميز وتقدير وتفوق دراسي',
      achievement: student.rank,
      score: student.score,
      exam: student.examTitle,
      issuedBy: this.teacherName,
      subject: this.subject,
      issueDate: issueDate,
      verificationUrl: `https://teacher-os.internal/verify/cert/${certId}`,
      socialShareTitle: `فخور بتفوقي مع ${this.teacherName} وحصولي على ${student.rank} بدرجة ${student.score}! 🎓⚡`
    };

    db.insert('certificates', certificate);
    eventBus.emit('CERTIFICATE_OF_HONOR_ISSUED', certificate);

    return certificate;
  }
}

module.exports = new LeaderboardCertificatesService();
