/**
 * TEACHER OS — Zoom & Live Online Classroom Service
 * Manages virtual classrooms, automated meeting generation, WhatsApp invitation broadcasts,
 * and entry-based attendance synchronization.
 */

const db = require('../../core/db');
const eventBus = require('../../core/events');
const dunningService = require('../business/dunning.service');

class ZoomService {
  /**
   * Create a new Zoom live classroom session
   */
  async createMeeting(teacherId, { groupId, topic, startTime, durationMins = 60, passcode, autoRecord = true }) {
    if (!teacherId) {
      throw new Error('Teacher ID is required');
    }

    const teacher = db.findById('teachers', teacherId);
    let group = null;
    if (groupId) {
      group = db.findById('groups', groupId);
    }

    // Generate realistic 11-digit Zoom meeting number
    const meetingNumber = '8' + Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const meetingPass = passcode || 'Phys' + Math.floor(1000 + Math.random() * 9000);
    const zoomUrl = `https://us05web.zoom.us/j/${meetingNumber}?pwd=${meetingPass}Token`;

    const meeting = db.insert('live_meetings', {
      teacher_id: teacherId,
      teacher_name: teacher ? teacher.full_name : 'أستاذ المادة',
      group_id: groupId || null,
      group_name: group ? group.name : 'حصة عامة أونلاين',
      topic: topic || `حصة زووم مباشرة - ${group ? group.name : 'مراجعة أونلاين'}`,
      meeting_number: meetingNumber,
      passcode: meetingPass,
      zoom_url: zoomUrl,
      start_time: startTime || 'اليوم - موعد الحصة المباشرة',
      duration_mins: Number(durationMins) || 60,
      status: 'LIVE', // Default to LIVE or SCHEDULED
      auto_record: Boolean(autoRecord),
      participants: [],
      created_at: new Date().toISOString()
    });

    eventBus.emit('ZOOM_MEETING_CREATED', {
      teacherId,
      meetingId: meeting.id,
      meetingNumber: meeting.meeting_number,
      topic: meeting.topic
    });

    return meeting;
  }

  /**
   * List meetings for a teacher (or all active live meetings)
   */
  async getMeetings(teacherId, { status, groupId } = {}) {
    let meetings = db.find('live_meetings', m => {
      if (teacherId && m.teacher_id !== teacherId) return false;
      if (status && m.status !== status) return false;
      if (groupId && m.group_id !== groupId) return false;
      return true;
    });

    // Return with participant count
    return meetings.map(m => ({
      ...m,
      participants_count: m.participants ? m.participants.length : 0
    }));
  }

  /**
   * Get single meeting by ID
   */
  async getMeetingById(meetingId) {
    const meeting = db.findById('live_meetings', meetingId);
    if (!meeting) {
      throw new Error('Meeting not found');
    }
    return meeting;
  }

  /**
   * Student joins the Zoom live session — automatically logs attendance
   */
  async joinMeeting(meetingId, { studentId, studentName }) {
    const meeting = db.findById('live_meetings', meetingId);
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    if (meeting.status === 'ENDED') {
      throw new Error('This Zoom session has already ended');
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

    if (!meeting.participants) {
      meeting.participants = [];
    }

    const existingIdx = meeting.participants.findIndex(p => p.student_id === studentId);
    const joinRecord = {
      student_id: studentId || 'stu-guest',
      student_name: studentName || 'طالب',
      joined_at: new Date().toISOString()
    };

    if (existingIdx >= 0) {
      meeting.participants[existingIdx] = joinRecord;
    } else {
      meeting.participants.push(joinRecord);
    }

    db.update('live_meetings', meeting.id, { participants: meeting.participants });

    // Sync with Attendance: If student belongs to this teacher, record attendance
    if (studentId) {
      const student = db.findById('students', studentId);
      if (student) {
        db.insert('attendance_records', {
          student_id: student.id,
          session_id: `zoom-session-${meeting.id}`,
          status: 'PRESENT',
          notes: `حضور أونلاين عبر الزووم (${meeting.topic})`,
          recorded_at: new Date().toISOString()
        });
      }
    }

    eventBus.emit('ZOOM_STUDENT_JOINED', {
      meetingId: meeting.id,
      studentId,
      studentName: joinRecord.student_name
    });

    return {
      success: true,
      message: 'Joined meeting successfully',
      meeting_url: meeting.zoom_url,
      meeting_number: meeting.meeting_number,
      passcode: meeting.passcode,
      topic: meeting.topic,
      participant: joinRecord
    };
  }

  /**
   * End live Zoom meeting
   */
  async endMeeting(teacherId, meetingId) {
    const meeting = db.findById('live_meetings', meetingId);
    if (!meeting || (teacherId && meeting.teacher_id !== teacherId)) {
      throw new Error('Meeting not found or unauthorized');
    }

    const updated = db.update('live_meetings', meeting.id, {
      status: 'ENDED',
      ended_at: new Date().toISOString()
    });

    eventBus.emit('ZOOM_MEETING_ENDED', { meetingId, teacherId });
    return updated;
  }

  /**
   * Generate ready-to-send WhatsApp Invitation for Egyptian Students & Parents
   */
  async generateWhatsAppInvite(meetingId) {
    const meeting = db.findById('live_meetings', meetingId);
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    const teacher = db.findById('teachers', meeting.teacher_id);
    const teacherName = teacher ? teacher.full_name : 'أ/ طارق الشناوي';

    const whatsAppText = 
`السلام عليكم ورحمة الله وبركاته 🌟
أهلاً بأبطالنا وأولياء الأمور الكرام،

🔴 *رابط حصة الزووم المباشرة (Zoom Online Class)*
👨‍🏫 *مع:* ${teacherName}
📚 *الموضوع:* ${meeting.topic}
🏛️ *المجموعة:* ${meeting.group_name}
⏰ *الموعد:* ${meeting.start_time}
⏱️ *مدة الحصة:* ${meeting.duration_mins} دقيقة
------------------------------------
🔗 *رابط الدخول المباشر بنقرة واحدة:*
${meeting.zoom_url}

🆔 *رقم الاجتماع (Meeting ID):*
${meeting.meeting_number}

🔑 *رمز المرور (Passcode):*
${meeting.passcode}
------------------------------------
💡 *تعليمات هامة للطلاب:*
1. يرجى الدخول قبل الموعد بـ 5 دقائق وكتابة اسمك ثلاثي.
2. يتم تسجيل الحضور والغياب آلياً بمجرد الدخول.
3. تجهيز كشكول الملاحظات والآلة الحاسبة.

مع تمنياتنا لكم بأعلى الدرجات والتميز دائماً 🚀`;

    return {
      meetingId: meeting.id,
      whatsAppText,
      encodedUrl: `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsAppText)}`
    };
  }
}

module.exports = new ZoomService();
