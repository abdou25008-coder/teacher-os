/**
 * TEACHER OS — High-Performance Relational Database & Repository Adapter
 * Implements UUID keys, normalized table collections, indexing, and foreign key relations.
 */

const crypto = require('crypto');

class DatabaseAdapter {
  constructor() {
    this.tables = {
      organizations: new Map(),
      users: new Map(),
      teachers: new Map(),
      students: new Map(),
      parents: new Map(),
      parent_student_links: new Map(),
      subjects: new Map(),
      curricula: new Map(),
      lessons: new Map(),
      concepts: new Map(),
      groups: new Map(),
      group_memberships: new Map(),
      sessions: new Map(),
      attendance_records: new Map(),
      assessments: new Map(),
      assessment_questions: new Map(),
      student_attempts: new Map(),
      student_answers: new Map(),
      concept_mastery: new Map(),
      insights: new Map(),
      knowledge_documents: new Map(),
      document_chunks: new Map(),
      subscriptions: new Map(),
      payments: new Map(),
      live_meetings: new Map(),
      audit_logs: new Map(),
      promo_redemptions: new Map(),
      posts: new Map(),
      post_interactions: new Map(),
      post_comments: new Map(),
      teacher_follows: new Map(),
      teacher_directory: new Map()
    };
    this.indices = {
      user_by_phone: new Map(),
      user_by_email: new Map(),
      student_by_academic_code: new Map(),
      memberships_by_group: new Map(),
      memberships_by_student: new Map(),
      sessions_by_group: new Map(),
      attendance_by_session: new Map(),
      questions_by_assessment: new Map(),
      attempts_by_assessment: new Map(),
      attempts_by_student: new Map(),
      mastery_by_student_concept: new Map()
    };
    this._initializeDefaultSeedData();
  }

  generateUUID() {
    return crypto.randomUUID();
  }

  // Generic CRUD
  insert(tableName, record) {
    if (!this.tables[tableName]) {
      throw new Error(`Table ${tableName} does not exist`);
    }
    const id = record.id || this.generateUUID();
    const timestamp = new Date().toISOString();
    const completeRecord = {
      ...record,
      id,
      created_at: record.created_at || timestamp,
      updated_at: timestamp
    };
    this.tables[tableName].set(id, completeRecord);
    this._updateIndices(tableName, completeRecord);
    return completeRecord;
  }

  findById(tableName, id) {
    if (!this.tables[tableName]) return null;
    return this.tables[tableName].get(id) || null;
  }

  findOne(tableName, predicate) {
    if (!this.tables[tableName]) return null;
    for (const record of this.tables[tableName].values()) {
      if (predicate(record)) return record;
    }
    return null;
  }

  find(tableName, predicate = () => true) {
    if (!this.tables[tableName]) return [];
    const results = [];
    for (const record of this.tables[tableName].values()) {
      if (predicate(record)) results.push(record);
    }
    return results;
  }

  update(tableName, id, updates) {
    const existing = this.findById(tableName, id);
    if (!existing) {
      throw new Error(`Record with id ${id} not found in table ${tableName}`);
    }
    const updated = {
      ...existing,
      ...updates,
      id, // protect ID
      updated_at: new Date().toISOString()
    };
    this.tables[tableName].set(id, updated);
    this._updateIndices(tableName, updated);
    return updated;
  }

  delete(tableName, id) {
    if (!this.tables[tableName]) return false;
    return this.tables[tableName].delete(id);
  }

  _updateIndices(tableName, record) {
    if (tableName === 'users') {
      if (record.phone_number) this.indices.user_by_phone.set(record.phone_number, record.id);
      if (record.email) this.indices.user_by_email.set(record.email, record.id);
    }
    if (tableName === 'students' && record.academic_code) {
      this.indices.student_by_academic_code.set(record.academic_code, record.id);
    }
    if (tableName === 'group_memberships') {
      if (!this.indices.memberships_by_group.has(record.group_id)) {
        this.indices.memberships_by_group.set(record.group_id, new Set());
      }
      this.indices.memberships_by_group.get(record.group_id).add(record.id);
    }
    if (tableName === 'concept_mastery') {
      const key = `${record.student_id}:${record.concept_id}`;
      this.indices.mastery_by_student_concept.set(key, record.id);
    }
  }

  _initializeDefaultSeedData() {
    // Default Organization
    const defaultOrg = this.insert('organizations', {
      id: 'org-egypt-001',
      name: 'Teacher OS Egypt Network',
      country_code: 'EGY',
      currency_code: 'EGP'
    });

    // Default Physics Subject
    const physics = this.insert('subjects', {
      id: 'subj-physics-sec3',
      name_ar: 'الفيزياء للثانوية العامة',
      name_en: 'Secondary Physics (Grade 12)',
      code: 'PHYS_SEC3'
    });

    // Default Curriculum & Lessons
    const curr = this.insert('curricula', {
      id: 'curr-egy-physics-2026',
      subject_id: physics.id,
      grade_level: 'GRADE_12_SEC3',
      country_code: 'EGY',
      academic_year: '2026-2027'
    });

    const lesson1 = this.insert('lessons', {
      id: 'les-electric-current',
      curriculum_id: curr.id,
      title_ar: 'التيار الكهربي وقانون أوم',
      title_en: 'Electric Current & Ohm\'s Law',
      order_index: 1,
      description: 'شدة التيار، فرق الجهد، المقاومة الكهربية، وقانون أوم.'
    });

    // Discrete Concepts
    this.insert('concepts', {
      id: 'cpt-ohm-law',
      lesson_id: lesson1.id,
      code: 'PHYS_OHM_LAW',
      name_ar: 'قانون أوم وحساب المقاومة',
      name_en: 'Ohm\'s Law & Resistance Calculation',
      difficulty_level: 'MEDIUM'
    });

    this.insert('concepts', {
      id: 'cpt-parallel-series',
      lesson_id: lesson1.id,
      code: 'PHYS_PARALLEL_SERIES',
      name_ar: 'توصيل المقاومات على التوالي والتوازي',
      name_en: 'Series & Parallel Resistors Combination',
      difficulty_level: 'HARD'
    });

    this.insert('concepts', {
      id: 'cpt-kirchhoff',
      lesson_id: lesson1.id,
      code: 'PHYS_KIRCHHOFF',
      name_ar: 'قانونا كيرشوف للدوائر المعقدة',
      name_en: 'Kirchhoff\'s Laws for Complex Circuits',
      difficulty_level: 'HARD'
    });

    // Default Teacher User & Profile
    const defaultUser = this.insert('users', {
      id: 'usr-teacher-001',
      organization_id: defaultOrg.id,
      phone_number: '+201012345678',
      email: 'tarek.physics@teacher-os.com',
      password_hash: 'default:hash',
      role: 'TEACHER',
      status: 'ACTIVE'
    });

    const defaultTeacher = this.insert('teachers', {
      id: 'tch-tarek-001',
      user_id: defaultUser.id,
      full_name: 'أ/ طارق الشناوي',
      professional_title: 'خبير تدريس الفيزياء للثانوية العامة',
      teaching_type: 'PRIVATE_TUTOR',
      preferred_tone: 'ENCOURAGING_PROFESSIONAL',
      bio: 'مدرس أول فيزياء بالقاهرة ومؤسس سلسلة المتميز في الفيزياء.',
      subjects: [physics.id],
      saas_plan: 'PRO_TEACHER',
      saas_status: 'ACTIVE',
      branding: {
        academy_name: 'أكاديمية أ/ طارق الشناوي للفيزياء',
        tagline: 'رواد تدريس وتبسيط الفيزياء للثانوية العامة',
        logo_icon: '⚡',
        primary_color: '#2563EB',
        accent_color: '#059669',
        theme_preset: 'ACADEMIC_ROYAL_BLUE',
        cover_gradient: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)'
      },
      showcase: {
        bio: 'خبير ومعد المناهج التعليمية بالقاهرة لأكثر من 18 عاماً، ومؤسس أكاديمية الشناوي للفيزياء الحديثة.',
        philosophy: 'الفيزياء ليست حفظاً للمعادلات، بل فهم عميق للظواهر الكونية وتطبيقاتها الحياتية. نعتمد على استراتيجية حل المشكلات والخرائط المفاهيمية والمحاكاة التفاعلية.',
        publications: [
          { title: 'سلسلة المتميز في الفيزياء (الشرح والتدريبات 2026)', year: '2026', type: 'كتاب ومذكرات شاملة' },
          { title: 'بنك أسئلة مستويات التفكير العليا (بلوم 600 فكرة)', year: '2025', type: 'تدريبات وبنك أسئلة' }
        ],
        projects: [
          { name: 'معسكر الأوائل الشتوي المكثف (Winter Physics Camp)', desc: 'مراجعة البابين الأول والثاني وحل أكثر من 400 مسألة امتحانات وزارية سابقة.' },
          { name: 'رادار الفجوات المفاهيمية بالذكاء الاصطناعي', desc: 'تحليل دقيق لأخطاء كل طالب وعلاجها فردياً قبل الامتحانات الرسمية.' },
          { name: 'المختبر الافتراضي للدوائر الكهربية (Virtual Lab)', desc: 'تطبيق تجارب أوم وكيرشوف عملياً عبر محاكاة حاسوبية ثلاثية الأبعاد.' }
        ],
        academic_interests: [
          'تبسيط الكهرومغناطيسية والفيزياء الحديثة',
          'إعداد الطلاب لأولمبياد العلوم والفيزياء المصرية والعالمية',
          'استراتيجيات التعلم التفاعلي القائم على التقصي'
        ],
        hall_of_fame: [
          { student_name: 'زياد محمود طاهر', score: '60/60 (الدرجة النهائية)', rank: 'المركز الأول مكرر علمي علوم 2025' },
          { student_name: 'نوران حسام الدين', score: '59.5/60', rank: 'كلية الطب البشري جامعة القاهرة' },
          { student_name: 'كريم أشرف', score: '59/60', rank: 'هندسة القاهرة - قسم كهرباء' }
        ]
      }
    });

    // Default Groups
    const group1 = this.insert('groups', {
      id: 'grp-001',
      teacher_id: defaultTeacher.id,
      subject_id: physics.id,
      name: 'مجموعة النخبة (السبت 4:00م)',
      grade_level: 'GRADE_12_SEC3',
      max_capacity: 30,
      session_fee: 160,
      schedule_day: 'السبت',
      schedule_time: '16:00'
    });

    const group2 = this.insert('groups', {
      id: 'grp-002',
      teacher_id: defaultTeacher.id,
      subject_id: physics.id,
      name: 'مجموعة الأوائل (الأحد 6:00م)',
      grade_level: 'GRADE_12_SEC3',
      max_capacity: 25,
      session_fee: 160,
      schedule_day: 'الأحد',
      schedule_time: '18:00'
    });

    // Default Students (with secure pairing PINs for parent verification)
    const stu1 = this.insert('students', {
      id: 'stu-demo-1',
      teacher_id: defaultTeacher.id,
      full_name: 'أحمد محمود',
      academic_code: 'STU-102931',
      pairing_pin: 'LNK-1029',
      grade_level: 'GRADE_12_SEC3',
      parent_phone: '+201011112222'
    });

    const stu2 = this.insert('students', {
      id: 'stu-demo-2',
      teacher_id: defaultTeacher.id,
      full_name: 'سلمى إبراهيم',
      academic_code: 'STU-884210',
      pairing_pin: 'LNK-8842',
      grade_level: 'GRADE_12_SEC3',
      parent_phone: '+201033334444'
    });

    const stu3 = this.insert('students', {
      id: 'stu-demo-3',
      teacher_id: defaultTeacher.id,
      full_name: 'يوسف كريم',
      academic_code: 'STU-992381',
      pairing_pin: 'LNK-9923',
      grade_level: 'GRADE_12_SEC3',
      parent_phone: '+201055556666'
    });

    const stu4 = this.insert('students', {
      id: 'stu-demo-4',
      teacher_id: defaultTeacher.id,
      full_name: 'منى توفيق',
      academic_code: 'STU-441199',
      pairing_pin: 'LNK-4411',
      grade_level: 'GRADE_12_SEC3',
      parent_phone: '+201077778888'
    });

    // Seed Verified Parent-Student Links
    this.insert('parent_student_links', {
      id: 'link-parent-demo-1',
      parent_phone: '+201011112222',
      student_id: stu1.id,
      pairing_pin: 'LNK-1029',
      status: 'VERIFIED',
      verified_at: new Date().toISOString(),
      device_fingerprint: 'fp_demo_guardian_01'
    });

    this.insert('parent_student_links', {
      id: 'link-parent-demo-2',
      parent_phone: '+201033334444',
      student_id: stu2.id,
      pairing_pin: 'LNK-8842',
      status: 'VERIFIED',
      verified_at: new Date().toISOString(),
      device_fingerprint: 'fp_demo_guardian_02'
    });

    // Enroll students in group1
    this.insert('group_memberships', { group_id: group1.id, student_id: stu1.id, status: 'ACTIVE' });
    this.insert('group_memberships', { group_id: group1.id, student_id: stu2.id, status: 'ACTIVE' });
    this.insert('group_memberships', { group_id: group1.id, student_id: stu3.id, status: 'ACTIVE' });
    this.insert('group_memberships', { group_id: group2.id, student_id: stu4.id, status: 'ACTIVE' });

    // Subscriptions
    this.insert('subscriptions', { teacher_id: defaultTeacher.id, student_id: stu1.id, group_id: group1.id, plan_type: 'MONTHLY', fee_amount: 600, currency: 'EGP', status: 'ACTIVE', start_date: new Date().toISOString(), end_date: new Date(Date.now() + 25 * 86400000).toISOString() });
    this.insert('subscriptions', { teacher_id: defaultTeacher.id, student_id: stu2.id, group_id: group1.id, plan_type: 'MONTHLY', fee_amount: 600, currency: 'EGP', status: 'ACTIVE', start_date: new Date().toISOString(), end_date: new Date(Date.now() + 20 * 86400000).toISOString() });
    this.insert('subscriptions', { teacher_id: defaultTeacher.id, student_id: stu3.id, group_id: group1.id, plan_type: 'MONTHLY', fee_amount: 600, currency: 'EGP', status: 'ACTIVE', start_date: new Date().toISOString(), end_date: new Date(Date.now() + 3 * 86400000).toISOString() }); // Expiring soon
    // Overdue student subscription (for dunning and access suspension demo)
    this.insert('subscriptions', { teacher_id: defaultTeacher.id, student_id: stu4.id, group_id: group2.id, plan_type: 'MONTHLY', fee_amount: 600, currency: 'EGP', status: 'SUSPENDED_OVERDUE', start_date: new Date(Date.now() - 40 * 86400000).toISOString(), end_date: new Date(Date.now() - 10 * 86400000).toISOString() });

    // Default Knowledge Document
    const doc1 = this.insert('knowledge_documents', {
      id: 'doc-physics-memo-1',
      teacher_id: defaultTeacher.id,
      title: 'مذكرة الأستاذ طارق في الدوائر الكهربية وقانون أوم 2026',
      file_type: 'SUMMARY_NOTE',
      extracted_text: `في الدوائر الكهربية، يعتبر قانون أوم الأساس الذي يربط بين فرق الجهد وشدة التيار والمقاومة. عند توصيل المقاومات على التوازي، يظل فرق الجهد متساوياً عبر جميع الأفرع بينما يتجزأ التيار الكلي. من أهم التطبيقات الحياتية لتوصيل التوازي هو إنارة المنازل وتشغيل الأجهزة المنزلية بشكل مستقل.`
    });

    this.insert('document_chunks', {
      id: 'chk-doc-1-1',
      document_id: doc1.id,
      teacher_id: defaultTeacher.id,
      chunk_index: 0,
      chunk_text: doc1.extracted_text,
      embedding: new Array(128).fill(0.1)
    });

    // Default Scheduled Zoom Meeting
    this.insert('live_meetings', {
      id: 'zoom-demo-001',
      teacher_id: defaultTeacher.id,
      group_id: group1.id,
      group_name: group1.name,
      topic: 'حصة أونلاين مباشرة: حل مسائل كيرشوف والدوائر المعقدة',
      meeting_number: '84920194820',
      passcode: 'Physics2026',
      zoom_url: 'https://us05web.zoom.us/j/84920194820?pwd=Physics2026DemoSecretKey',
      start_time: 'اليوم الساعة 04:00 مساءً',
      duration_mins: 75,
      status: 'LIVE', // LIVE so students and teachers can immediately test joining!
      auto_record: true,
      participants: [
        { student_id: stu1.id, student_name: stu1.full_name, joined_at: new Date().toISOString() }
      ],
      created_at: new Date().toISOString()
    });

    // ── MULTI-TEACHER ECOSYSTEM SEED DATA ──────────────────────────────
    // Teacher 2: أ/ خالد إبراهيم (كيمياء)
    const chemUser = this.insert('users', {
      id: 'usr-teacher-002',
      organization_id: defaultOrg.id,
      phone_number: '+201099900011',
      email: 'khaled.chem@teacher-os.com',
      password_hash: 'default:hash',
      role: 'TEACHER',
      status: 'ACTIVE'
    });

    const chemSubject = this.insert('subjects', {
      id: 'subj-chem-001',
      name_ar: 'كيمياء ثانوية عامة',
      name_en: 'Chemistry General Secondary'
    });

    const chemTeacher = this.insert('teachers', {
      id: 'tch-khaled-002',
      user_id: chemUser.id,
      full_name: 'أ/ خالد إبراهيم',
      professional_title: 'خبير الكيمياء للثانوية العامة ومعد البرامج التعليمية',
      teaching_type: 'PRIVATE_TUTOR',
      preferred_tone: 'ENCOURAGING_PROFESSIONAL',
      bio: 'مؤلف سلسلة الإكسير في الكيمياء وخبير المنصات التعليمية التفاعلية.',
      subjects: [chemSubject.id],
      saas_plan: 'PRO_TEACHER',
      saas_status: 'ACTIVE'
    });

    const chemGroup = this.insert('groups', {
      id: 'grp-chem-001',
      teacher_id: chemTeacher.id,
      subject_id: chemSubject.id,
      name: 'مجموعة كيمياء العباقرة (الأحد 6:00م)',
      grade_level: 'GRADE_12_SEC3',
      max_capacity: 35,
      session_fee: 160,
      schedule_day: 'الأحد',
      schedule_time: '18:00'
    });

    // Teacher 3: أ/ شريف المصري (رياضيات)
    const mathUser = this.insert('users', {
      id: 'usr-teacher-003',
      organization_id: defaultOrg.id,
      phone_number: '+201099900022',
      email: 'sherif.math@teacher-os.com',
      password_hash: 'default:hash',
      role: 'TEACHER',
      status: 'ACTIVE'
    });

    const mathSubject = this.insert('subjects', {
      id: 'subj-math-001',
      name_ar: 'رياضيات (تفاضل وتكامل)',
      name_en: 'Mathematics Calculus'
    });

    const mathTeacher = this.insert('teachers', {
      id: 'tch-sherif-003',
      user_id: mathUser.id,
      full_name: 'أ/ شريف المصري',
      professional_title: 'كبير معلمي الرياضيات والتحليل الرياضي المتقدم',
      teaching_type: 'PRIVATE_TUTOR',
      preferred_tone: 'RIGOROUS_ANALYTICAL',
      bio: 'محاضر وباحث في طرق تدريس الرياضيات الحديثة ومؤلف سلسلة البرهان.',
      subjects: [mathSubject.id],
      saas_plan: 'PRO_TEACHER',
      saas_status: 'ACTIVE'
    });

    const mathGroup = this.insert('groups', {
      id: 'grp-math-001',
      teacher_id: mathTeacher.id,
      subject_id: mathSubject.id,
      name: 'مجموعة فرسان الرياضيات (الثلاثاء 5:00م)',
      grade_level: 'GRADE_12_SEC3',
      max_capacity: 30,
      session_fee: 175,
      schedule_day: 'الثلاثاء',
      schedule_time: '17:00'
    });

    // Multi-Teacher Enrollments: Ahmed Mahmoud (stu1) enrolled with Tarek (Physics), Khaled (Chemistry), Sherif (Math)
    this.insert('group_memberships', { group_id: chemGroup.id, student_id: stu1.id, status: 'ACTIVE' });
    this.insert('subscriptions', { teacher_id: chemTeacher.id, student_id: stu1.id, group_id: chemGroup.id, plan_type: 'MONTHLY', fee_amount: 600, currency: 'EGP', status: 'ACTIVE', start_date: new Date().toISOString(), end_date: new Date(Date.now() + 25 * 86400000).toISOString() });

    this.insert('group_memberships', { group_id: mathGroup.id, student_id: stu1.id, status: 'ACTIVE' });
    this.insert('subscriptions', { teacher_id: mathTeacher.id, student_id: stu1.id, group_id: mathGroup.id, plan_type: 'MONTHLY', fee_amount: 650, currency: 'EGP', status: 'ACTIVE', start_date: new Date().toISOString(), end_date: new Date(Date.now() + 25 * 86400000).toISOString() });

    // Salma Ibrahim (stu2) enrolled with Tarek (Physics) and Khaled (Chemistry)
    this.insert('group_memberships', { group_id: chemGroup.id, student_id: stu2.id, status: 'ACTIVE' });
    this.insert('subscriptions', { teacher_id: chemTeacher.id, student_id: stu2.id, group_id: chemGroup.id, plan_type: 'MONTHLY', fee_amount: 600, currency: 'EGP', status: 'ACTIVE', start_date: new Date().toISOString(), end_date: new Date(Date.now() + 20 * 86400000).toISOString() });

    // ── EDUSOCIAL COMMUNITY SEED DATA ──────────────────────────────────
    // Teacher Directory
    this.insert('teacher_directory', {
      id: defaultTeacher.id,
      name: defaultTeacher.full_name,
      title: defaultTeacher.professional_title,
      subject: 'فيزياء ثانوية عامة',
      bio: defaultTeacher.bio,
      rating: 4.95,
      reviews_count: 128,
      students_count: 342,
      followers_count: 1420,
      avatar_text: 'ط.ش',
      groups: [{ id: group1.id, name: group1.name, fee: group1.session_fee, schedule: 'السبت 4:00م' }, { id: group2.id, name: group2.name, fee: group2.session_fee, schedule: 'الأحد 6:00م' }]
    });

    this.insert('teacher_directory', {
      id: chemTeacher.id,
      name: chemTeacher.full_name,
      title: chemTeacher.professional_title,
      subject: 'كيمياء ثانوية عامة',
      bio: chemTeacher.bio,
      rating: 4.90,
      reviews_count: 94,
      students_count: 285,
      followers_count: 1180,
      avatar_text: 'خ.إ',
      groups: [{ id: chemGroup.id, name: chemGroup.name, fee: chemGroup.session_fee, schedule: 'الأحد 6:00م' }]
    });

    this.insert('teacher_directory', {
      id: mathTeacher.id,
      name: mathTeacher.full_name,
      title: mathTeacher.professional_title,
      subject: 'رياضيات - تفاضل وتكامل',
      bio: mathTeacher.bio,
      rating: 4.92,
      reviews_count: 112,
      students_count: 310,
      followers_count: 980,
      avatar_text: 'ش.م',
      groups: [{ id: mathGroup.id, name: mathGroup.name, fee: mathGroup.session_fee, schedule: 'الثلاثاء 5:00م' }]
    });

    // Follows
    this.insert('teacher_follows', { id: 'fol-1', student_id: stu1.id, teacher_id: defaultTeacher.id });
    this.insert('teacher_follows', { id: 'fol-2', student_id: stu1.id, teacher_id: chemTeacher.id });
    this.insert('teacher_follows', { id: 'fol-3', student_id: stu2.id, teacher_id: defaultTeacher.id });
    this.insert('teacher_follows', { id: 'fol-4', student_id: stu2.id, teacher_id: mathTeacher.id });

    // Community Posts
    const post1 = this.insert('posts', {
      id: 'post-001',
      teacher_id: defaultTeacher.id,
      teacher_name: defaultTeacher.full_name,
      teacher_title: 'خبير تدريس الفيزياء',
      subject: 'فيزياء ثانوية عامة',
      post_type: 'POLL',
      title: '💡 سؤال اليوم التفاعلي: قانونا كيرشوف وتوزيع فرق الجهد',
      content: 'في الدائرة الكهربية الموضحة، إذا كانت قراءة الفولتميتر المقاس بين النقطتين (A, B) تساوي 6V عند فتح المفتاح، فما هي القيمة المتوقعة لفرق الجهد عند غلق المفتاح K؟ اختبر استيعابك وصوّت فوراً لنرى النتيجة!',
      poll_options: [
        { id: 'opt-1', text: '6 فولت (تظل ثابتة بدون تغيير)', votes: 34 },
        { id: 'opt-2', text: '12 فولت (تتضاعف بسبب تغير المقاومة المكافئة)', votes: 78 },
        { id: 'opt-3', text: 'صفر فولت (تهبط قراءة الفولتميتر للصفر)', votes: 12 }
      ],
      likes_count: 142,
      comments_count: 2,
      created_at: new Date(Date.now() - 2 * 3600000).toISOString()
    });

    const post2 = this.insert('posts', {
      id: 'post-002',
      teacher_id: chemTeacher.id,
      teacher_name: chemTeacher.full_name,
      teacher_title: chemTeacher.professional_title,
      subject: 'كيمياء ثانوية عامة',
      post_type: 'VOICE_NOTE',
      title: '🎙️ كبسولة صوتية 60 ثانية: تكة وزن معادلات الأكسدة والاختزال',
      content: 'تسجيل صوتي مكثف يشرح كيفية موازنة ذرات الأكسجين بإضافة جزيئات الماء ووزن الشحنات بإضافة الإلكترونات في الوسط الحمضي بخطوات محددة.. اسمع الكبسولة وركز في التكّة.',
      audio_url: 'https://assets.teacher-os.internal/audio/capsule-redox.mp3',
      duration: '0:58 دقيقة',
      likes_count: 95,
      comments_count: 1,
      created_at: new Date(Date.now() - 5 * 3600000).toISOString()
    });

    const post3 = this.insert('posts', {
      id: 'post-003',
      teacher_id: mathTeacher.id,
      teacher_name: mathTeacher.full_name,
      teacher_title: mathTeacher.professional_title,
      subject: 'رياضيات - تفاضل وتكامل',
      post_type: 'MINDMAP',
      title: '📄 خريطة ذهنية: ملخص قواعد الاشتقاق الضمني وتطبيقات النهايات',
      content: 'خريطة بصرية شاملة لأهم متطابقات حساب المثلثات وتفاضل الدوال الأسية واللوغاريتمية لمراجعتها السريعة وتثبيت القوانين قبل امتحان الأسبوع القادم.',
      likes_count: 215,
      comments_count: 3,
      created_at: new Date(Date.now() - 12 * 3600000).toISOString()
    });

    // Post Comments
    this.insert('post_comments', {
      id: 'cmt-001',
      post_id: post1.id,
      user_id: stu1.id,
      user_name: stu1.full_name,
      user_type: 'STUDENT',
      content: 'شكراً يا مستر، اخترت 12V لأن فرق الجهد الكلي يتجزأ بنسبة المقاومات بعد تقليل المقاومة المكافئة!',
      created_at: new Date(Date.now() - 90 * 60000).toISOString()
    });

    this.insert('post_comments', {
      id: 'cmt-002',
      post_id: post1.id,
      user_id: stu3.id,
      user_name: stu3.full_name,
      user_type: 'STUDENT',
      content: 'مسألة خادعة وممتازة جداً، تكررت فكرتها في امتحان الدور الأول 2024.. شكراً لحضرتك 👏',
      created_at: new Date(Date.now() - 60 * 60000).toISOString()
    });

    this.insert('post_comments', {
      id: 'cmt-003',
      post_id: post2.id,
      user_id: stu2.id,
      user_name: stu2.full_name,
      user_type: 'STUDENT',
      content: 'فكرة الكبسولة الصوتية أسهل بكتير وأسرع في الاستيعاب من قراءة المذكرات، بالتوفيق دائماً يا مستر خالد!',
      created_at: new Date(Date.now() - 3 * 3600000).toISOString()
    });
  }
}

// Global Singleton Instance
const db = new DatabaseAdapter();
module.exports = db;
