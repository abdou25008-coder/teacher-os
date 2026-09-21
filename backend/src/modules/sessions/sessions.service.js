/**
 * TEACHER OS — Sessions & Attendance Service
 */

const db = require('../../core/db');
const eventBus = require('../../core/events');

class SessionsService {
  /**
   * Schedule a new teaching session for a group
   */
  async scheduleSession(teacherId, { groupId, lessonId, scheduledAt, durationMins = 90, topic }) {
    const group = db.findById('groups', groupId);
    if (!group || group.teacher_id !== teacherId) {
      throw new Error('Group not found or unauthorized');
    }

    const session = db.insert('sessions', {
      group_id: groupId,
      teacher_id: teacherId,
      lesson_id: lessonId || null,
      scheduled_at: scheduledAt || new Date().toISOString(),
      duration_mins: Number(durationMins),
      topic: topic || 'شرح وحل مسائل',
      status: 'SCHEDULED'
    });

    eventBus.emit('SESSION_SCHEDULED', { teacherId, groupId, sessionId: session.id });
    return session;
  }

  /**
   * Mark attendance for a single or multiple students in a session
   */
  async markAttendance(teacherId, sessionId, attendanceList) {
    const session = db.findById('sessions', sessionId);
    if (!session || session.teacher_id !== teacherId) {
      throw new Error('Session not found or unauthorized');
    }

    const results = [];
    for (const record of attendanceList) {
      const { studentId, status, notes } = record;
      const validStatuses = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid attendance status '${status}'. Must be one of ${validStatuses.join(', ')}`);
      }

      const existing = db.findOne('attendance_records', a => a.session_id === sessionId && a.student_id === studentId);
      if (existing) {
        const updated = db.update('attendance_records', existing.id, {
          status,
          notes: notes || null,
          arrival_time: status === 'PRESENT' ? new Date().toISOString() : null
        });
        results.push(updated);
      } else {
        const created = db.insert('attendance_records', {
          session_id: sessionId,
          student_id: studentId,
          status,
          arrival_time: status === 'PRESENT' ? new Date().toISOString() : null,
          notes: notes || null
        });
        results.push(created);
      }
    }

    // Mark session as COMPLETED if attendance was taken
    db.update('sessions', sessionId, { status: 'COMPLETED' });

    eventBus.emit('ATTENDANCE_MARKED', {
      teacherId,
      sessionId,
      totalCount: results.length,
      presentCount: results.filter(r => r.status === 'PRESENT').length,
      absentCount: results.filter(r => r.status === 'ABSENT').length
    });

    return {
      session_id: sessionId,
      records: results,
      summary: {
        total: results.length,
        present: results.filter(r => r.status === 'PRESENT').length,
        absent: results.filter(r => r.status === 'ABSENT').length,
        late: results.filter(r => r.status === 'LATE').length,
        excused: results.filter(r => r.status === 'EXCUSED').length
      }
    };
  }

  /**
   * Get attendance sheet for a session with student details
   */
  async getSessionAttendance(teacherId, sessionId) {
    const session = db.findById('sessions', sessionId);
    if (!session || session.teacher_id !== teacherId) {
      throw new Error('Session not found or unauthorized');
    }

    const group = db.findById('groups', session.group_id);
    const memberships = db.find('group_memberships', m => m.group_id === session.group_id && m.status === 'ACTIVE');
    
    const roster = memberships.map(m => {
      const student = db.findById('students', m.student_id);
      const record = db.findOne('attendance_records', a => a.session_id === sessionId && a.student_id === student.id);
      return {
        student_id: student.id,
        full_name: student.full_name,
        academic_code: student.academic_code,
        parent_phone: student.parent_phone,
        status: record ? record.status : 'NOT_MARKED',
        arrival_time: record ? record.arrival_time : null,
        notes: record ? record.notes : null
      };
    });

    return {
      session,
      group_name: group.name,
      roster
    };
  }
}

module.exports = new SessionsService();
