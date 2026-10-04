/**
 * ============================================================================
 * TEACHER OS — IMMERSIVE CURRICULUM LIVE AI VOICE & SOCRATIC LEARNING LAB
 * Inspired by Zack Akil's Immergo (Gemini Live API Architecture)
 * Adapted for Curriculum Mastery, Teacher Customization & Parent Advisory
 * ============================================================================
 */

(function(window) {
  'use strict';

  // 1. Default Curriculum Missions Seed
  const DEFAULT_CURRICULUM_MISSIONS = [
    {
      id: 'msn-kirchhoff-01',
      title: 'تحدي شبكات كيرشوف وتجزئة الجهد',
      subject: 'الفيزياء — الفصل الأول (الكهربية)',
      grade_level: 'الصف الثالث الثانوي',
      difficulty: 'متوسط',
      difficulty_level: 'Medium',
      target_role: 'مهندس تحليلي يناقش المعلم',
      concept: 'قانون كيرشوف الأول (حفظ الشحنة) وقانون كيرشوف الثاني (حفظ الطاقة)',
      desc: 'ناقش المعلم صوتياً في تحديد اتجاه التيارات ومعادلة العقدة وحساب المقاومة المكافئة لدائرة كهربية معقدة.',
      system_instructions: 'أنت المعلم الذكي للأستاذ طارق الشناوي. ناقش الطالب في دائرة كهربية بها بطاريتان ومقاومات. اسأله عن كيفية كتابة معادلة التيارات عند العقدة. إذا ذكر الإجابة، اطلب منه تطبيق قانون المسار المغلق. لا تعطه الحل جاهزاً بل وجهه بالأسئلة.',
      starter_prompt: 'أهلاً بك يا بطل في مختبر كيرشوف! أمامنا الآن نقطة تفرع كهربية يدخل إليها تياران I1 و I2 ويخرج منها I3. كيف ستطبق قانون كيرشوف الأول لحساب التيارات؟',
      required_concepts: ['حفظ الشحنة', 'مجموع التيارات الداخلة', 'قانون العقدة', 'المسار المغلق']
    },
    {
      id: 'msn-faraday-02',
      title: 'تفسير ظاهرة الحث الكهرومغناطيسي وقاعدة لينز',
      subject: 'الفيزياء — الفصل الثالث (الحث الكهرومغناطيسي)',
      grade_level: 'الصف الثالث الثانوي',
      difficulty: 'متقدم',
      difficulty_level: 'Hard',
      target_role: 'مستكشف فيزيائي في معمل كهرومغناطيسي',
      concept: 'تغير الفيض المغناطيسي وتوليد القوة الدافعة المستحثة وقاعدة لينز',
      desc: 'عند تقريب قطب شمالي لمغناطيس من ملف حلزوني، فسر صوتياً اتجاه التيار المستحث المتولد وسبب مقاومة الحركة.',
      system_instructions: 'اسأل الطالب ماذا يحدث لمعدل قطع خطوط الفيض عند تقريب المغناطيس. اطلب منه تحديد نوع القطب المتكون عند الطرف القريب وفق قاعدة لينز ولماذا. شجعه على ذكر نص قاعدة لينز بدقة.',
      starter_prompt: 'مرحباً بك في معمل فاراداي! نقوم الآن بتقريب القطب الشمالي لمغناطيس بسرعة نحو طرف ملف لولبي. ماذا سيحدث للفيض المغناطيسي، وما نوع القطب الذي سيتكون في وجه الملف المقابل؟',
      required_concepts: ['تغير الفيض ΔΦ/Δt', 'قاعدة لينز', 'القطب الشمالي المقاوم', 'قوة التنافر']
    },
    {
      id: 'msn-photoelectric-03',
      title: 'لغز الظاهرة الكهروضوئية وفوتونات أينشتاين',
      subject: 'الفيزياء — الفصل الخامس (ازدواجية الموجة والجسيم)',
      grade_level: 'الصف الثالث الثانوي',
      difficulty: 'خبير',
      difficulty_level: 'Expert',
      target_role: 'عالم فيزياء حديثة يناقش أينشتاين',
      concept: 'دالة الشغل والتردد الحرج وطاقة حركة الإلكترونات المنبعثة',
      desc: 'ناقش فشل التفسير الكلاسيكي في انبعاث الإلكترونات الكهروضوئية وكيف حسم أينشتاين التفسير بفرضية تكميم الطاقة.',
      system_instructions: 'اسأل الطالب لماذا لم ينجح النموذج الكلاسيكي (شدة الضوء). اسأله عن الشرط الأساسي لانبعاث الإلكترون وعلاقة تردد الضوء بالتردد الحرج للمعدن وطاقة الحركة.',
      starter_prompt: 'أهلاً بك في قاعة أبحاث الفيزياء الحديثة! سقط ضوء أحمر شديد جداً على سطح فلز ولم تنبعث أي إلكترونات، بينما ضوء بنفسجي خافت حرر إلكترونات فوراً! كيف تفسر هذا اللغز الفيزيائي؟',
      required_concepts: ['دالة الشغل', 'التردد الحرج', 'طاقة الفوتون E=hν', 'فشل النظرية الكلاسيكية']
    },
    {
      id: 'msn-exam-oral-04',
      title: 'المحاكاة الشفوية الشاملة لامتحان الثانوية العامة',
      subject: 'الفيزياء العامة — مراجعة ليلة الامتحان الشاملة',
      grade_level: 'الصف الثالث الثانوي',
      difficulty: 'خبير متفوق',
      difficulty_level: 'Master',
      target_role: 'أستاذ ممتحن صارم بلجنة أوائل الجمهورية',
      concept: 'تطبيقات مركبة تربط الكهربية والمغناطيسية والدينامو وأجهزة القياس',
      desc: 'اختبار شفوي سريع وصارم يحاكي أسئلة التفكير العليا في امتحان الوزارة لتقييم السرعة والدقة والاستنتاج.',
      system_instructions: 'اطرح أسئلة مقارنة سريعة مثل المقارنة بين المحول الرافع والخافض، أو عزم الازدواج عند وضع الصفر. قيّم نطق الطالب للمصطلحات الفيزيائية بدقة وإيجاز.',
      starter_prompt: 'أهلاً بك يا بني في لجنة الامتحانات الشفوية لأوائل الجمهورية! السؤال الأول: لماذا يُصنع قلب المحول الكهربي من الحديد المطاوع السيليكوني مقسماً إلى شرائح رقيقة معزولة؟',
      required_concepts: ['التيارات الدوامية', 'فقد الطاقة الحراري', 'المقاومة النوعية العالية', 'سهولة الحركة المغناطيسية']
    }
  ];

  // 2. Default Teacher AI Configurations
  const DEFAULT_TEACHER_LAB_CONFIG = {
    teacher_name: 'أ/ طارق الشناوي',
    subject: 'الفيزياء للثانوية العامة',
    pedagogical_mode: 'socratic', // 'socratic' | 'teacher' | 'exam'
    strictness_level: 'balanced', // 'gentle' | 'balanced' | 'strict'
    enforce_units: true,
    voice_accent: 'ar-EG',
    parent_advisor_rules: {
      advisor_name: 'المستشار الذكي لمنصة الأستاذ طارق الشناوي',
      tone: 'مهنية، مطمئنة، صريحة، وداعمة لولي الأمر',
      weekly_focus: 'التدريب المستمر على مسائل الفصل الثاني وتثبيت قاعدة لينز والفيض المغناطيسي.',
      upcoming_exam: 'الجمعة القادمة الساعة 8:00 مساءً (اختبار إلكتروني شامل على الحث الكهرومغناطيسي).',
      study_tip: 'يوصي الأستاذ طارق بحل 15 مسألة يومياً في كتاب المراجعة مع عدم مراجعة الإجابة إلا بعد المحاولة مرتين.'
    }
  };

  // State Management
  const state = {
    missions: [],
    activeMission: null,
    currentMode: 'socratic', // 'socratic' | 'teacher' | 'exam'
    isRecording: false,
    audioContext: null,
    analyser: null,
    mediaStream: null,
    speechRecognition: null,
    transcriptHistory: [],
    currentEvaluation: null
  };

  function getMissions() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem('teacher_os_curriculum_missions');
        if (raw) return JSON.parse(raw);
        localStorage.setItem('teacher_os_curriculum_missions', JSON.stringify(DEFAULT_CURRICULUM_MISSIONS));
      }
    } catch (e) {}
    return DEFAULT_CURRICULUM_MISSIONS;
  }

  function saveMissions(missions) {
    try {
      localStorage.setItem('teacher_os_curriculum_missions', JSON.stringify(missions));
    } catch (e) {}
  }

  function getTeacherLabConfig() {
    try {
      const raw = localStorage.getItem('teacher_os_ai_lab_config');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return DEFAULT_TEACHER_LAB_CONFIG;
  }

  function saveTeacherLabConfig(cfg) {
    try {
      localStorage.setItem('teacher_os_ai_lab_config', JSON.stringify(cfg));
    } catch (e) {}
  }

  function getStudentMissionHistory() {
    try {
      const raw = localStorage.getItem('teacher_os_student_mission_history');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  }

  function saveStudentMissionResult(res) {
    try {
      const history = getStudentMissionHistory();
      history.unshift({ ...res, timestamp: new Date().toISOString() });
      localStorage.setItem('teacher_os_student_mission_history', JSON.stringify(history));
    } catch (e) {}
  }

  // 4. Audio Visualizer Engine (Canvas Waves + Frequency Simulation)
  class WaveVisualizer {
    constructor(canvasId, colorTheme = 'purple') {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
      this.colorTheme = colorTheme; // 'purple' | 'gold' | 'blue'
      this.animId = null;
      this.isActive = false;
      this.phase = 0;
    }

    start(isActive = true) {
      this.isActive = isActive;
      if (!this.canvas || !this.ctx) return;
      const render = () => {
        this.draw();
        this.animId = requestAnimationFrame(render);
      };
      if (!this.animId) render();
    }

    stop() {
      this.isActive = false;
      if (this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }
      this.clear();
    }

    clear() {
      if (!this.canvas || !this.ctx) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    draw() {
      if (!this.canvas || !this.ctx) return;
      const w = this.canvas.width = this.canvas.offsetWidth || 300;
      const h = this.canvas.height = this.canvas.offsetHeight || 100;
      const ctx = this.ctx;

      ctx.clearRect(0, 0, w, h);
      this.phase += 0.08;

      const numWaves = 3;
      const centerY = h / 2;

      for (let i = 0; i < numWaves; i++) {
        ctx.beginPath();
        const baseAmp = this.isActive ? (22 - i * 5) : 4;
        const freq = 0.015 + i * 0.005;

        let strokeColor = 'rgba(139, 92, 246, 0.6)';
        if (this.colorTheme === 'gold') {
          strokeColor = i === 0 ? 'rgba(245, 158, 11, 0.9)' : 'rgba(217, 119, 6, 0.4)';
        } else if (this.colorTheme === 'blue') {
          strokeColor = i === 0 ? 'rgba(37, 99, 235, 0.9)' : 'rgba(59, 130, 246, 0.4)';
        } else {
          strokeColor = i === 0 ? 'rgba(139, 92, 246, 0.9)' : 'rgba(99, 102, 241, 0.45)';
        }

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = i === 0 ? 3 : 1.5;

        for (let x = 0; x < w; x++) {
          const y = centerY + Math.sin(x * freq + this.phase + i * 1.5) * baseAmp * Math.sin(x / w * Math.PI);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }
  }

  // 5. Speech Recognition & Synthesis Controllers
  function speakArabic(text, onEnd) {
    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }
    window.speechSynthesis.cancel(); // cancel previous
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-EG';
    utterance.rate = 1.02;
    utterance.pitch = 1.0;

    // Try finding Arabic voice
    const voices = window.speechSynthesis.getVoices();
    const arVoice = voices.find(v => v.lang.includes('ar'));
    if (arVoice) utterance.voice = arVoice;

    utterance.onend = () => {
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  function initSpeechRecognition(onResult, onStatusChange) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API not available in this browser');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-EG';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      if (onStatusChange) onStatusChange('LISTENING');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (onResult) onResult(transcript);
    };

    recognition.onerror = (err) => {
      console.warn('Speech recognition error:', err);
      if (onStatusChange) onStatusChange('ERROR');
    };

    recognition.onend = () => {
      if (onStatusChange) onStatusChange('IDLE');
    };

    return recognition;
  }

  // 6. Socratic Curriculum Evaluation Engine
  function generateSocraticResponse(studentInput, mission, mode = 'socratic') {
    const input = (studentInput || '').trim();

    // Check concept keywords
    let matchedKeywords = [];
    if (mission && mission.required_concepts) {
      matchedKeywords = mission.required_concepts.filter(c => input.includes(c));
    }

    let reply = '';
    let isGoalMet = false;

    if (mode === 'socratic') {
      if (input.includes('كيرشوف') || input.includes('تيار') || input.includes('شحنة') || input.includes('فيض') || input.includes('لينز') || input.includes('فوتون') || input.includes('تردد')) {
        reply = `ممتاز جداً! ذكرت نقطة جوهرية تتطابق مع المنهج. ولكن فكر معي: ماذا لو قمنا بعكس الاتجاه أو زيادة القيمة، كيف سيتغير فرق الجهد أو القوة الدافعة وفق المعادلة الرياضية؟`;
        isGoalMet = matchedKeywords.length >= 2;
      } else if (input.length > 5) {
        reply = `فكرة جيدة وتفكير تحليلي سليم! ولكن وفق قانون المنهج، هل هذا التغير ناتج عن حفظ الطاقة أم حفظ الشحنة؟ وضح لي السبب خطوة بخطوة.`;
      } else {
        reply = `أسمعك بوضوح! خذ نفساً عميقاً واشرح لي فكرتك: ما هو المبدأ الفيزيائي الأساسي الذي نعتمد عليه هنا؟`;
      }
    } else if (mode === 'teacher') {
      reply = `أحسنت الاستماع! القاعدة الذهبية في هذا الدرس: مجموع الجهود في أي مسار مغلق يساوي صفراً، والتغير في الفيض يولد قوة دافعة مستحثة تقاوم سببها وفق قاعدة لينز. استمر في التدريب وستتفوق!`;
      isGoalMet = true;
    } else { // 'exam'
      if (input.length > 15) {
        reply = `إجابة نموذجية ومنظمة تليق بطالب متفوق بالثانوية العامة. حصلت على الدرجة الكاملة في تفسير المفهوم.`;
        isGoalMet = true;
      } else {
        reply = `إجابة مختصرة. في امتحان الوزارة يجب ذكر السبب العلمي بدقة وقانون التعليل الفيزيائي.`;
      }
    }

    return {
      reply: reply,
      isGoalMet: isGoalMet,
      matchedConcepts: matchedKeywords
    };
  }

  // Calculate final score & rank
  function evaluateMissionPerformance(arg1, arg2) {
    let transcriptHistory = [];
    let mission = null;
    if (Array.isArray(arg1)) {
      transcriptHistory = arg1;
      mission = arg2;
    } else {
      mission = arg1;
      transcriptHistory = Array.isArray(arg2) ? arg2 : [];
    }

    const count = transcriptHistory.length;
    let score = 75;
    let rank = 'Proficiens'; // Tiro (Bronze) | Proficiens (Silver) | Peritus (Gold)
    let feedbackPoints = [];
    let misconceptions = [];

    const allStudentWords = transcriptHistory
      .filter(t => t.sender === 'student' || t.sender === 'user')
      .map(t => t.text)
      .join(' ');

    let matched = 0;
    if (mission && mission.required_concepts) {
      mission.required_concepts.forEach(c => {
        if (allStudentWords.includes(c)) matched++;
      });
    }

    if (matched >= 3 || count >= 6) {
      score = 95;
      rank = 'Peritus';
      feedbackPoints.push('إتقان ممتاز للمصطلحات الفيزيائية الوزارية.');
      feedbackPoints.push('تفسير سببي متكامل لقوانين حفظ الطاقة والشحنة.');
      feedbackPoints.push('سرعة استجابة وطلاقة شفوية تماثل أوائل الجمهورية.');
    } else if (matched >= 1 || count >= 3) {
      score = 84;
      rank = 'Proficiens';
      feedbackPoints.push('فهم جيد للمفاهيم الأساسية مع استنتاج صحيح.');
      feedbackPoints.push('يُوصى بالتركيز أكثر على ذكر وحدات القياس الفيزيائية.');
      misconceptions.push('الخلط البسيط بين اتجاه القوة الدافعة واتجاه التيار المستحث.');
    } else {
      score = 68;
      rank = 'Tiro';
      feedbackPoints.push('بداية واعدة تحتاج للمزيد من الاسترسال وتوضيح الخطوات.');
      misconceptions.push('عدم استكمال معادلة القانون بشكل كامل.');
    }

    return {
      score: score,
      rank: rank,
      rankArabic: rank === 'Peritus' ? 'خبير متفوق 🥇 (Peritus)' : (rank === 'Proficiens' ? 'متمكن ومتميز 🥈 (Proficiens)' : 'مبتدئ واعد 🥉 (Tiro)'),
      feedbackPoints: feedbackPoints,
      misconceptions: misconceptions,
      missionTitle: mission ? mission.title : 'مهمة فيزيائية',
      completedAt: new Date().toLocaleDateString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };
  }

  // 7. Parent AI Advisor Logic
  function generateParentAdvisorResponse(parentInquiry, studentProfile, customConfig) {
    const cfg = customConfig || getTeacherLabConfig();
    const rules = cfg.parent_advisor_rules || {};
    const text = (parentInquiry || '').trim();
    const studentName = studentProfile && studentProfile.name ? studentProfile.name : 'الطالب';
    const recentScore = studentProfile && studentProfile.recent_voice_score ? `${studentProfile.recent_voice_score}%` : '95%';
    const recentRank = studentProfile && studentProfile.recent_voice_rank ? studentProfile.recent_voice_rank : 'خبير متفوق 🥇';

    if (text.includes('مستوى') || text.includes('ابني') || text.includes('ابنتي') || text.includes('سلمى') || text.includes('درجات')) {
      return `أهلاً بحضرتك يا فندم! 🌟 بخصوص مستوى الطالب ${studentName}، بناءً على سجل الحصص والامتحانات وتدريبات المختبر الصوتي الذكي:
- نسبة الحضور 95% ومستقرة تماماً.
- التقييم الصوتي الأخير: أنجز مهمة (${studentProfile && studentProfile.recent_mission ? studentProfile.recent_mission : 'شبكات كيرشوف والحث'}) بنتيجة ${recentScore} برتبة ${recentRank}.
- الأستاذ طارق يثني على تفاعله ويوصي بالاستمرار في نفس وتيرة المذاكرة والتدريب الصوتي.`;
    }

    if (text.includes('امتحان') || text.includes('موعد') || text.includes('اختبار')) {
      return `موعد الامتحان والاختبار القادم للطالب ${studentName} يا فندم:
📅 ${rules.upcoming_exam || 'الجمعة القادمة الساعة 8:00 مساءً (امتحان إلكتروني شامل)'}.
وهو اختبار إلكتروني تقييمي لقياس نواتج التعلم، والنتيجة ستظهر لحضرتك فوراً في لوحة ولي الأمر مع تحليل نقاط القوة والضعف.`;
    }

    if (text.includes('مذاكرة') || text.includes('نصيحة') || text.includes('ازاي أساعد')) {
      return `توصية الأستاذ طارق الشناوي لحضرتك هذا الأسبوع:
💡 "${rules.study_tip || 'يوصي الأستاذ طارق بحل 15 مسألة يومياً في كتاب المراجعة والتركيز على مسائل الفصل الثاني.'}"
يرجى توفير بيئة هادئة بدون مشتتات لمدة 45 دقيقة يومياً لحل شيتات المنصة.`;
    }

    // Default polite response
    return `أهلاً بحضرتك! أنا المستشار التعليمي الذكي لمنصة ${cfg.teacher_name || 'الأستاذ طارق الشناوي'}.
نحن حريصون على متابعة أدق تفاصيل تحصيل الطالب ${studentName} الأكاديمي.
📌 تركيزنا الأسبوعي الحالي بتوجيه المعلم: ${rules.weekly_focus || 'التدريب المكثف على مسائل الحث الكهرومغناطيسي'}.
هل تود الاستفسار عن درجات الاختبار الأخير، جدول الحصص القادمة، أو نصائح المذاكرة؟`;
  }

  // 8. Teacher AI Executive Copilot Logic
  function generateTeacherCopilotResponse(command) {
    const cmd = (command || '').trim();

    if (cmd.includes('أسئلة') || cmd.includes('امتحان') || cmd.includes('مسائل')) {
      return `👨‍🏫 تفضل يا مستر طارق، 3 أسئلة مستويات تفكير عليا جاهزة وفق مواصفات امتحان الوزارة (Blueprint 30/50/20):

1️⃣ (مستوى فهم - 2 درجة): حلقة دائرية من النحاس تسقط سقوطاً حراً فوق قطب مغناطيسي شمالي ثابت، فسر مع الرسم نوع القطب المتولد بالوجه السفلي وعجلة سقوط الحلقة هل هي أكبر أم أقل من g؟
2️⃣ (مستوى تطبيق - 2 درجة): ملف مستطيل أبعاده (10cm × 20cm) يدور في مجال مغناطيسي 0.4T بتردد 50Hz، احسب القوة الدافعة اللحظية عندما يميل مستوى الملف بزاوية 60° على اتجاه المجال.
3️⃣ (مستوى إبداع وتحليل - 3 درجات): دائرة تيار متردد تحتوي على ملف حث ومقاومة ومكثف في حالة رنين، ماذا يحدث لشدة التيار وقراءة الفولتميتر عند غمر قلب الملف ببرادة حديد؟ مع التعليل الفيزيائي.

هل تريد تصديرها الآن إلى تبويب "الامتحانات والكويزات" بضغطة واحدة؟`;
    }

    if (cmd.includes('تقرير') || cmd.includes('طلاب') || cmd.includes('مختبر') || cmd.includes('ضعف')) {
      return `📊 ملخص أداء الطلاب في المختبر الصوتي الذكي هذا الأسبوع:
- عدد الجلسات الصوتية المكتملة: 142 جلسة تفاعلية.
- متوسط نسبة الإتقان العام: 86.4%.
- 84 طالب حصلوا على رتبة (خبير متفوق Peritus 🥇).
- الفجوة المعرفية المشتركة المرصودة: "قاعدة لينز وتحديد القطب المعاكس عند تلاشي الفيض" (وقع فيها 18% من الطلاب).
💡 توصية المساعد: تخصيص أول 10 دقائق في حصة الزووم القادمة لحل مثالين على تناقص الفيض.`;
    }

    if (cmd.includes('خطة') || cmd.includes('درس') || cmd.includes('حصة')) {
      return `📝 الخطة البيداغوجية المقترحة للمحاضرة القادمة (60 دقيقة):
- [00 - 10 د]: تدفئة ذهنية ومناقشة السؤال التفاعلي على التيارات الدوامية.
- [10 - 30 د]: الشرح التفكيكي لقانون فاراداي والمولد الكهربي (الدينامو) مع محاكاة 3D.
- [30 - 45 د]: حل 4 مسائل مستويات عليا من أحدث نماذج الوزارة.
- [45 - 55 د]: اختبار كويز سريع (5 أسئلة بابل شيت على المنصة).
- [55 - 60 د]: توجيه الطلاب لدخول المختبر الصوتي الذكي لمناقشة مهمة الدينامو.`;
    }

    return `أهلاً بك يا أستاذنا العزيز! ⚡ أنا مساعدك التنفيذي الصوتي والتعليمي.
أستطيع مساعدتك فوراً في:
1. صياغة وتوليد أسئلة امتحانات مطابقة للـ Blueprint الوزاري.
2. تلخيص جلسات وتحديات الطلاب الصوتية ورصد الفجوات المعرفية.
3. صياغة وتحديث توجيهات أولياء الأمور وإرسال تنبيهات واتساب.
4. إعداد خطط الدروس والواجبات المنزلية.
ما الذي تريد إنجازه الآن؟`;
  }

  // Export globally
  window.ImmersiveVoiceLab = {
    getMissions,
    saveMissions,
    getTeacherLabConfig,
    saveTeacherLabConfig,
    getStudentMissionHistory,
    saveStudentMissionResult,
    WaveVisualizer,
    speakArabic,
    initSpeechRecognition,
    generateSocraticResponse,
    evaluateMissionPerformance,
    generateParentAdvisorResponse,
    generateTeacherCopilotResponse,
    state
  };

})(typeof window !== 'undefined' ? window : global);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = (typeof window !== 'undefined' ? window.ImmersiveVoiceLab : global.ImmersiveVoiceLab);
}
