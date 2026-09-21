/**
 * TEACHER OS — Auth & Identity Service
 */

const db = require('../../core/db');
const SecurityEngine = require('../../core/security');
const eventBus = require('../../core/events');

class AuthService {
  /**
   * Register a new user (Teacher, Student, Parent)
   */
  async register({ phoneNumber, email, password, role, fullName, gradeLevel, subjects, parentPhone }) {
    if (!phoneNumber || !password || !role) {
      throw new Error('Phone number, password, and role are required');
    }

    const normalizedPhone = SecurityEngine.normalizePhoneNumber(phoneNumber);
    const existingUser = db.findOne('users', u => u.phone_number === normalizedPhone);
    if (existingUser) {
      const err = new Error('A user with this phone number already exists');
      err.statusCode = 409;
      throw err;
    }

    const passwordHash = SecurityEngine.hashPassword(password);
    const user = db.insert('users', {
      organization_id: 'org-egypt-001',
      phone_number: normalizedPhone,
      email: email || null,
      password_hash: passwordHash,
      role: role.toUpperCase(),
      status: 'ACTIVE'
    });

    let profile = null;

    // Create role-specific entity
    if (user.role === 'TEACHER') {
      profile = db.insert('teachers', {
        user_id: user.id,
        full_name: fullName || 'أستاذ جديد',
        professional_title: 'مدرس فيزياء ورياضيات',
        teaching_type: 'PRIVATE_TUTOR',
        preferred_tone: 'ENCOURAGING_PROFESSIONAL',
        bio: 'مدرس متخصص في الثانوية العامة',
        subjects: subjects || ['subj-physics-sec3']
      });
    } else if (user.role === 'STUDENT') {
      const academicCode = 'STU-' + Math.floor(100000 + Math.random() * 900000);
      profile = db.insert('students', {
        user_id: user.id,
        full_name: fullName || 'طالب جديد',
        academic_code: academicCode,
        grade_level: gradeLevel || 'GRADE_12_SEC3',
        parent_phone: SecurityEngine.normalizePhoneNumber(parentPhone)
      });
    } else if (user.role === 'PARENT') {
      profile = db.insert('parents', {
        user_id: user.id,
        full_name: fullName || 'ولي أمر',
        phone: normalizedPhone,
        whatsapp_enabled: true
      });
    }

    const token = SecurityEngine.generateToken({
      userId: user.id,
      role: user.role,
      profileId: profile ? profile.id : null
    });

    eventBus.emit('USER_REGISTERED', { userId: user.id, role: user.role });

    return {
      user: { id: user.id, phoneNumber: user.phone_number, role: user.role },
      profile,
      token
    };
  }

  /**
   * Login user by phone number and password
   */
  async login({ phoneNumber, password }) {
    if (!phoneNumber || !password) {
      throw new Error('Phone number and password are required');
    }

    const normalizedPhone = SecurityEngine.normalizePhoneNumber(phoneNumber);
    const user = db.findOne('users', u => u.phone_number === normalizedPhone);
    if (!user) {
      const err = new Error('Invalid phone number or password');
      err.statusCode = 401;
      throw err;
    }

    const isMatch = SecurityEngine.verifyPassword(password, user.password_hash);
    if (!isMatch) {
      const err = new Error('Invalid phone number or password');
      err.statusCode = 401;
      throw err;
    }

    let profile = null;
    if (user.role === 'TEACHER') {
      profile = db.findOne('teachers', t => t.user_id === user.id);
    } else if (user.role === 'STUDENT') {
      profile = db.findOne('students', s => s.user_id === user.id);
    } else if (user.role === 'PARENT') {
      profile = db.findOne('parents', p => p.user_id === user.id);
    }

    const token = SecurityEngine.generateToken({
      userId: user.id,
      role: user.role,
      profileId: profile ? profile.id : null
    });

    eventBus.emit('USER_LOGGED_IN', { userId: user.id, role: user.role });

    return {
      user: { id: user.id, phoneNumber: user.phone_number, role: user.role },
      profile,
      token
    };
  }

  /**
   * Get user session by token
   */
  async getSession(token) {
    const payload = SecurityEngine.verifyToken(token);
    const user = db.findById('users', payload.userId);
    if (!user) {
      throw new Error('User not found');
    }

    let profile = null;
    if (user.role === 'TEACHER') {
      profile = db.findOne('teachers', t => t.user_id === user.id);
    } else if (user.role === 'STUDENT') {
      profile = db.findOne('students', s => s.user_id === user.id);
    } else if (user.role === 'PARENT') {
      profile = db.findOne('parents', p => p.user_id === user.id);
    }

    return {
      user: { id: user.id, phoneNumber: user.phone_number, role: user.role },
      profile
    };
  }

  /**
   * Fast Student login by Academic Code (e.g. STU-102931) or parent phone
   */
  async studentLogin({ academicCode, parentPhone }) {
    let student = null;
    if (academicCode) {
      const code = String(academicCode).trim().toUpperCase();
      student = db.findOne('students', s => s.academic_code && s.academic_code.toUpperCase() === code);
    }
    if (!student && parentPhone) {
      const normalized = SecurityEngine.normalizePhoneNumber(parentPhone);
      student = db.findOne('students', s => s.parent_phone === normalized);
    }

    if (!student) {
      const err = new Error('لم يتم العثور على طالب بهذا الكود الأكاديمي أو رقم الهاتف');
      err.statusCode = 404;
      throw err;
    }

    const teacher = db.findById('teachers', student.teacher_id) || db.find('teachers')[0];

    const token = SecurityEngine.generateToken({
      userId: student.user_id || student.id,
      role: 'STUDENT',
      profileId: student.id
    });

    eventBus.emit('STUDENT_LOGGED_IN', { studentId: student.id, academicCode: student.academic_code });

    return {
      user: { id: student.id, role: 'STUDENT', name: student.full_name, academicCode: student.academic_code },
      student,
      teacher: teacher ? { id: teacher.id, name: teacher.full_name, title: teacher.professional_title } : null,
      token
    };
  }

  /**
   * Parent login by registered Phone Number
   */
  async parentLogin({ phoneNumber }) {
    if (!phoneNumber) {
      throw new Error('رقم الهاتف مطلوب');
    }
    const normalized = SecurityEngine.normalizePhoneNumber(phoneNumber);
    const children = db.find('students', s => s.parent_phone === normalized);

    if (children.length === 0) {
      const cleanInput = normalized.replace(/\D/g, '');
      const allStudents = db.find('students');
      const matched = allStudents.filter(s => (s.parent_phone || '').replace(/\D/g, '').endsWith(cleanInput.slice(-8)));
      if (matched.length > 0) {
        children.push(...matched);
      }
    }

    if (children.length === 0) {
      const err = new Error('لم يتم العثور على طلاب مسجلين بهذا الرقم لدى المعلم');
      err.statusCode = 404;
      throw err;
    }

    const token = SecurityEngine.generateToken({
      userId: `parent-${normalized}`,
      role: 'PARENT',
      phone: normalized
    });

    return {
      user: { id: `parent-${normalized}`, role: 'PARENT', phoneNumber: normalized },
      children,
      token
    };
  }
}

module.exports = new AuthService();
