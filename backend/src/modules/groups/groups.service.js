/**
 * TEACHER OS — Groups & Student Roster Service
 */

const db = require('../../core/db');
const eventBus = require('../../core/events');
const SecurityEngine = require('../../core/security');

class GroupsService {
  /**
   * Create a new student group
   */
  async createGroup(teacherId, { name, subjectId, gradeLevel, maxCapacity = 50, sessionFee = 150, scheduleDay, scheduleTime }) {
    if (!teacherId || !name || !gradeLevel) {
      throw new Error('Teacher ID, group name, and grade level are required');
    }

    const group = db.insert('groups', {
      teacher_id: teacherId,
      subject_id: subjectId || 'subj-physics-sec3',
      name,
      grade_level: gradeLevel,
      max_capacity: Number(maxCapacity),
      session_fee: Number(sessionFee),
      schedule_day: scheduleDay || 'Saturday',
      schedule_time: scheduleTime || '16:00'
    });

    eventBus.emit('GROUP_CREATED', { teacherId, groupId: group.id, name: group.name });
    return group;
  }

  /**
   * List groups for a teacher with real-time membership counts
   */
  async getTeacherGroups(teacherId) {
    const groups = db.find('groups', g => g.teacher_id === teacherId);
    return groups.map(g => {
      const memberships = db.find('group_memberships', m => m.group_id === g.id && m.status === 'ACTIVE');
      return {
        ...g,
        enrolled_count: memberships.length,
        available_seats: Math.max(0, g.max_capacity - memberships.length),
        capacity_utilization_pct: Math.round((memberships.length / g.max_capacity) * 100)
      };
    });
  }

  /**
   * Enroll a student into a group (or create student record if new)
   */
  async enrollStudent(teacherId, groupId, { fullName, parentPhone, gradeLevel, academicCode }) {
    const group = db.findById('groups', groupId);
    if (!group || group.teacher_id !== teacherId) {
      throw new Error('Group not found or unauthorized');
    }

    // Check capacity
    const activeMembers = db.find('group_memberships', m => m.group_id === groupId && m.status === 'ACTIVE');
    if (activeMembers.length >= group.max_capacity) {
      const err = new Error(`Group '${group.name}' is already at full capacity (${group.max_capacity} students)`);
      err.statusCode = 400;
      throw err;
    }

    let student = null;
    if (academicCode) {
      student = db.findOne('students', s => s.academic_code === academicCode);
    }

    if (!student) {
      const code = academicCode || 'STU-' + Math.floor(100000 + Math.random() * 900000);
      student = db.insert('students', {
        teacher_id: teacherId,
        full_name: fullName || 'طالب جديد',
        academic_code: code,
        grade_level: gradeLevel || group.grade_level,
        parent_phone: SecurityEngine.normalizePhoneNumber(parentPhone)
      });
    }

    // Check if already in group
    const existingMembership = db.findOne('group_memberships', m => m.group_id === groupId && m.student_id === student.id);
    if (existingMembership) {
      if (existingMembership.status === 'INACTIVE') {
        db.update('group_memberships', existingMembership.id, { status: 'ACTIVE' });
      }
      return { student, group, membershipId: existingMembership.id };
    }

    const membership = db.insert('group_memberships', {
      group_id: groupId,
      student_id: student.id,
      status: 'ACTIVE'
    });

    eventBus.emit('STUDENT_ENROLLED', { teacherId, groupId, studentId: student.id });
    return { student, group, membershipId: membership.id };
  }

  /**
   * Get all enrolled students in a group
   */
  async getGroupStudents(teacherId, groupId) {
    const group = db.findById('groups', groupId);
    if (!group || group.teacher_id !== teacherId) {
      throw new Error('Group not found or unauthorized');
    }

    const memberships = db.find('group_memberships', m => m.group_id === groupId && m.status === 'ACTIVE');
    return memberships.map(m => {
      const student = db.findById('students', m.student_id);
      return {
        membership_id: m.id,
        student_id: student.id,
        full_name: student.full_name,
        academic_code: student.academic_code,
        parent_phone: student.parent_phone,
        joined_at: m.joined_at
      };
    });
  }

  /**
   * Get all enrolled students across all groups for a teacher
   */
  async getAllTeacherStudents(teacherId) {
    const students = db.find('students', s => s.teacher_id === teacherId);
    return students.map(s => {
      const membership = db.findOne('group_memberships', m => m.student_id === s.id && m.status === 'ACTIVE');
      const group = membership ? db.findById('groups', membership.group_id) : null;
      const attendances = db.find('attendance_records', a => a.student_id === s.id);
      const totalSessions = attendances.length;
      const presentCount = attendances.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
      const ratePct = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 100;

      const sub = db.findOne('subscriptions', sub => sub.student_id === s.id && sub.status === 'ACTIVE');

      return {
        id: s.id,
        full_name: s.full_name,
        academic_code: s.academic_code,
        grade_level: s.grade_level,
        parent_phone: s.parent_phone,
        group_id: group ? group.id : null,
        group_name: group ? group.name : 'غير محدد',
        attendance_rate_pct: ratePct,
        subscription_status: sub ? 'ساري' : 'متأخر',
        created_at: s.created_at
      };
    });
  }
}

module.exports = new GroupsService();
