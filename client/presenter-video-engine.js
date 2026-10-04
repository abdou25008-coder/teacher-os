/**
 * ============================================================================
 * TEACHER OS — AI PRESENTER VIDEO STUDIO & VIDEO CAPSULE ENGINE
 * Inspired by Lanshu (lanshu-create-ai-presenter-video) Architecture
 * Adapted for Curriculum Mastery, Teacher Digital Twin & Student/Parent Feeds
 * ============================================================================
 */

(function(window) {
  'use strict';

  // 1. Preloaded Educational Video Capsules (Lanshu-inspired Seed)
  const DEFAULT_VIDEO_CAPSULES = [
    {
      id: 'capsule-lenz-rule',
      title: 'كبسولة قاعدة لينز وتحديد اتجاه التيار في 45 ثانية',
      topic: 'الفيزياء — الحث الكهرومغناطيسي',
      aspect: '9:16', // Shorts / Reels
      durationSec: 45,
      presenter_image: 'assets/teacher_tarek_portrait.jpg',
      presenter_name: 'أ/ طارق الشناوي',
      theme: 'dark_lab',
      formula: 'e.m.f = -N (ΔΦ / Δt)',
      badge: 'الثانوية العامة — سؤال مضمون في الامتحان',
      script: 'أهلاً بكم يا أبطال الثانوية العامة! قاعدة لينز ببساطة: التيار المستحث دائماً يعاكس التغير في الفيض المسبب له. لو المغناطيس بيقرب بقطب شمالي، الملف هيعمل قطب شمالي يقاومه بالتنافر! ولو بيبعد هيعمل جنوبي يمسكه بالتجاذب! تذكروا دائماً: إشارة السالب في قانون فاراداي هي قاعدة لينز.',
      target_audiences: ['students', 'public'],
      publishedAt: '2026-10-04T20:00:00Z'
    },
    {
      id: 'capsule-kirchhoff-rules',
      title: 'طريقة حل عقدة كيرشوف والمسار المغلق بدون أخطاء',
      topic: 'الفيزياء — الكهربية والتيار المستمر',
      aspect: '16:9', // Landscape
      durationSec: 55,
      presenter_image: 'assets/teacher_tarek_portrait.jpg',
      presenter_name: 'أ/ طارق الشناوي',
      theme: 'chalkboard',
      formula: 'Σ I_in = Σ I_out  &  Σ V_B = Σ (I·R)',
      badge: 'استراتيجية الحل السريع',
      script: 'السلام عليكم طلابنا الأعزاء! عند أي نقطة تفرع، مجموع التيارات الداخلة لازم يساوي مجموع التيارات الخارجة، وده تطبيق لحفظ الشحنة. ولما تلف في مسار مغلق، كل بطارية بتدفع بتجمعها، وكل مقاومة بتسحب جهد بتطرحها. اوعى تتردد في تحديد اتجاه الدوران الافتراضي.',
      target_audiences: ['students'],
      publishedAt: '2026-10-03T18:30:00Z'
    },
    {
      id: 'capsule-photoelectric',
      title: 'لغز تحرير الإلكترونات: لماذا انتصر أينشتاين على كلاسيكيات الضوء؟',
      topic: 'الفيزياء الحديثة — ازدواجية الموجة والجسيم',
      aspect: '9:16',
      durationSec: 50,
      presenter_image: 'assets/teacher_tarek_portrait.jpg',
      presenter_name: 'أ/ طارق الشناوي',
      theme: 'cyber_studio',
      formula: 'E_k = h·ν - E_w',
      badge: 'الفيزياء الحديثة — الفصل الخامس',
      script: 'فيزياء زمان قالت: شدة الضوء العالية هي اللي هتحرر إلكترونات المعدن. لكن التجربة فاجأت الجميع! ضوء أحمر قوي جداً مقدرش يحرر إلكترون واحد، بينما ضوء بنفسجي خافت حرر إلكترونات فوراً! السر في تردد الفوتون ودالة الشغل يا بطل.',
      target_audiences: ['students'],
      publishedAt: '2026-10-02T19:00:00Z'
    },
    {
      id: 'capsule-parent-briefing',
      title: 'تقرير الأسبوع المرئي لأولياء الأمور — الحث الكهرومغناطيسي',
      topic: 'إحاطة أولياء الأمور الأسبوعية',
      aspect: '16:9',
      durationSec: 40,
      presenter_image: 'assets/teacher_tarek_portrait.jpg',
      presenter_name: 'أ/ طارق الشناوي',
      theme: 'blueprint',
      formula: 'متابعة نواتج التعلم — الأسبوع 4',
      badge: 'رسالة خاصة لأولياء الأمور',
      script: 'أهلاً بكم أولياء أمور طلابنا الأعزاء. هذا الأسبوع أكملنا بحمد الله تدريبات الحث الكهرومغناطيسي في المختبر الصوتي الذكي. نوصي بتخصيص 45 دقيقة يومياً لحل شيت المراجعة، وموعدنا مع الاختبار الشامل يوم الجمعة القادمة الساعة الثامنة مساءً.',
      target_audiences: ['parents'],
      publishedAt: '2026-10-04T12:00:00Z'
    }
  ];

  // 2. Storage Helpers
  function getVideoCapsules() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem('teacher_os_video_capsules');
        if (raw) return JSON.parse(raw);
        localStorage.setItem('teacher_os_video_capsules', JSON.stringify(DEFAULT_VIDEO_CAPSULES));
      }
    } catch (e) {}
    return DEFAULT_VIDEO_CAPSULES;
  }

  function saveVideoCapsules(capsules) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('teacher_os_video_capsules', JSON.stringify(capsules));
      }
    } catch (e) {}
  }

  // 3. AI Script & Beat Sheet Generator
  function generatePresenterScript(topic, format = 'shorts_45s') {
    const t = (topic || '').trim();

    if (t.includes('فاراداي') || t.includes('حث') || t.includes('لينز')) {
      return {
        title: 'كبسولة الحث الكهرومغناطيسي وقاعدة لينز',
        hook: 'عارف ليه المغناطيس بيبطأ لما يقع جوة ماسورة نحاس؟',
        beats: [
          'الحث الكهرومغناطيسي بيولد تيارات دوامية تقاوم حركة المغناطيس.',
          'كل ما تزيد سرعة السقوط، يزداد معدل تغير الفيض وتزيد قوة التنافر.',
          'النتيجة: قوة التنافر تعاكس وزنه فيسقط المغناطيس ببطء كأنه يسبح في الهواء!'
        ],
        formula: 'e.m.f = -N (ΔΦ / Δt)',
        fullScript: 'عارف ليه المغناطيس بيبطأ لما يقع جوة ماسورة نحاس؟ السبب هو ظاهرة الحث الكهرومغناطيسي! سقوط المغناطيس بيغير خطوط الفيض المغناطيسي جوة النحاس، فيتولد تيار مستحث وقوة تنافر تقاوم السقوط حسب قاعدة لينز! خليك دايم فاكر: التيار المستحث دايماً ضد السبب اللي أنشأه!'
      };
    }

    if (t.includes('كيرشوف') || t.includes('تيار') || t.includes('دائرة')) {
      return {
        title: 'كبسولة حل شبكات كيرشوف في دقيقة',
        hook: 'خايف من معادلات كيرشوف الطويلة في الامتحان؟',
        beats: [
          'قانون العقدة: اللي داخل النقطة لازم يخرج منها قد بعض.',
          'قانون المسار المغلق: مجموع البطاريات يساوي مجموع جهود المقاومات.',
          'حدد اتجاه دوران افتراضي وثبّت الإشارات تكسب الدرجة كاملة.'
        ],
        formula: 'Σ I_in = Σ I_out  |  Σ V_B = Σ I·R',
        fullScript: 'خايف من معادلات كيرشوف الطويلة في الامتحان؟ السر في خطوتين! أولاً: عند أي عقدة، كل التيارات الداخلة بتساوي التيارات الخارجة، وده قانون حفظ الشحنة. ثانياً: في أي مسار مغلق، مجموع القوة الدافعة للبطاريات يساوي مجموع فروق الجهد. حدد اتجاه الدوران وسمّي الله وهتقفل المسألة!'
      };
    }

    if (t.includes('ولي') || t.includes('أمر') || t.includes('تقرير')) {
      return {
        title: 'رسالة إحاطة مصورة لولي الأمر',
        hook: 'تحياتي لجميع أولياء أمور طلابنا المتفوقين',
        beats: [
          'مستوى الطلاب في تقدم ممتاز مع نسبة حضور 95%.',
          'تم تفعيل المختبر الصوتي الذكي لتدريب الطالب على الإجابات الشفهية.',
          'الاختبار الشامل القادم الجمعة 8 مساءً مع تقرير فوري.'
        ],
        formula: 'متابعة أداء الطالب والواجبات',
        fullScript: 'تحياتي لجميع أولياء أمور طلابنا المتفوقين! حابب أطمنكم إن مستويات الطلاب في تقدم ممتاز ونسبة الحضور مستقرة عند 95%. بدأنا تدريب الطلاب في المختبر الصوتي الذكي لمحاكاة امتحانات الثانوية العامة، وامتحاننا الشامل القادم الجمعة الساعة الثامنة مساءً. شكراً لتعاونكم المستمر معنا.'
      };
    }

    // Default general physics topic
    return {
      title: `كبسولة سريعة: ${t || 'مفهوم فيزيائي أساسي'}`,
      hook: 'في أقل من 45 ثانية، فكرة فيزيائية هامة تتكرر سنوياً في الامتحانات!',
      beats: [
        'فهم العلاقة الرياضية بين المتغيرات وميل الخط المستقيم.',
        'تحديد نوع التناسب طردي أم عكسي وقراءة الرسم البياني بدقة.',
        'الانتباه لوحدات القياس الدولية والتحويلات قبل التعويض.'
      ],
      formula: 'y = m·x + c',
      fullScript: `في أقل من 45 ثانية، فكرة فيزيائية هامة تتكرر سنوياً في امتحانات الثانوية العامة بخصوص ${t || 'هذا المفهوم'}! انتبه دائماً للعلاقة الرياضية بين المتغيرات ولنقطة الأصل في الرسم البياني. تذكر أن استخراج الميل الفيزيائي ووحدة القياس هو مفتاح الحل السحري لأي مسألة.`
    };
  }

  // 4. Canvas Presenter Video Compositor & Animator
  class PresenterVideoCompositor {
    constructor(canvas, options = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.aspect = options.aspect || '9:16'; // '9:16' or '16:9'
      this.theme = options.theme || 'dark_lab';
      this.presenterImg = null;
      this.presenterSrc = options.presenterSrc || 'assets/teacher_tarek_portrait.jpg';
      this.script = options.script || '';
      this.formula = options.formula || '';
      this.badge = options.badge || 'كبسولة تعليمية';
      this.title = options.title || 'شرح المفهوم';
      
      this.isPlaying = false;
      this.currentTime = 0;
      this.duration = options.durationSec || 45;
      this.animFrameId = null;
      this.speechSynthUtterance = null;

      this.mouthOpen = 0; // 0 to 1
      this.blinkProgress = 0; // 0 (open) to 1 (closed)
      this.lastBlinkTime = 0;
      this.headBobY = 0;

      this.onTimeUpdate = null;
      this.onEnded = null;

      this.initDimensions();
      this.loadPresenterImage();
    }

    initDimensions() {
      if (this.aspect === '9:16') {
        this.canvas.width = 540;
        this.canvas.height = 960;
      } else {
        this.canvas.width = 960;
        this.canvas.height = 540;
      }
    }

    loadPresenterImage() {
      if (typeof Image === 'undefined') {
        this.presenterImg = null;
        this.drawFrame();
        return;
      }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.presenterImg = img;
        this.drawFrame();
      };
      img.onerror = () => {
        // Fallback: avatar placeholder will be drawn
        this.presenterImg = null;
        this.drawFrame();
      };
      img.src = this.presenterSrc;
    }

    setPresenterImage(src) {
      this.presenterSrc = src;
      this.loadPresenterImage();
    }

    setAspect(aspect) {
      this.aspect = aspect;
      this.initDimensions();
      this.drawFrame();
    }

    setTheme(theme) {
      this.theme = theme;
      this.drawFrame();
    }

    setScript(text, title, formula, badge) {
      this.script = text || '';
      if (title) this.title = title;
      if (formula) this.formula = formula;
      if (badge) this.badge = badge;
      this.currentTime = 0;
      this.drawFrame();
    }

    // Playback Controls
    play() {
      if (this.isPlaying) return;
      this.isPlaying = true;

      // Master clock using SpeechSynthesis if available
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && this.script) {
        window.speechSynthesis.cancel();
        this.speechSynthUtterance = new SpeechSynthesisUtterance(this.script);
        this.speechSynthUtterance.lang = 'ar-EG';
        this.speechSynthUtterance.rate = 1.05;

        // Try selecting Arabic voice
        const voices = window.speechSynthesis.getVoices();
        const arVoice = voices.find(v => v.lang.startsWith('ar') || v.lang.includes('EG') || v.lang.includes('SA'));
        if (arVoice) this.speechSynthUtterance.voice = arVoice;

        this.speechSynthUtterance.onend = () => {
          this.pause();
          this.currentTime = this.duration;
          if (this.onEnded) this.onEnded();
        };

        window.speechSynthesis.speak(this.speechSynthUtterance);
      }

      this.startTime = performance.now() - (this.currentTime * 1000);
      this.loop();
    }

    pause() {
      this.isPlaying = false;
      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      this.drawFrame();
    }

    seek(seconds) {
      this.currentTime = Math.max(0, Math.min(seconds, this.duration));
      if (this.isPlaying) {
        this.pause();
        this.play();
      } else {
        this.drawFrame();
      }
      if (this.onTimeUpdate) this.onTimeUpdate(this.currentTime, this.duration);
    }

    loop() {
      if (!this.isPlaying) return;

      const now = performance.now();
      this.currentTime = (now - this.startTime) / 1000;

      if (this.currentTime >= this.duration) {
        this.currentTime = this.duration;
        this.pause();
        if (this.onEnded) this.onEnded();
        return;
      }

      // 1. Simulate speech mouth animation with fluctuating frequency
      if (this.isPlaying) {
        const speechRhythm = Math.sin(now * 0.015) * Math.cos(now * 0.007);
        this.mouthOpen = Math.max(0, (speechRhythm + 0.5) * 0.85);

        // Subtle head swaying
        this.headBobY = Math.sin(now * 0.003) * 4;

        // Natural blinking every 3.5 seconds
        if (now - this.lastBlinkTime > 3500) {
          this.blinkProgress = Math.sin(Math.PI * ((now - this.lastBlinkTime - 3500) / 250));
          if (now - this.lastBlinkTime > 3750) {
            this.lastBlinkTime = now;
            this.blinkProgress = 0;
          }
        } else {
          this.blinkProgress = 0;
        }
      } else {
        this.mouthOpen = 0;
        this.headBobY = 0;
        this.blinkProgress = 0;
      }

      this.drawFrame();

      if (this.onTimeUpdate) {
        this.onTimeUpdate(this.currentTime, this.duration);
      }

      this.animFrameId = requestAnimationFrame(() => this.loop());
    }

    // Drawing the complete composite frame
    drawFrame() {
      const W = this.canvas.width;
      const H = this.canvas.height;
      const ctx = this.ctx;

      // 1. Background
      this.drawBackground(ctx, W, H);

      // 2. Animated Presenter Avatar
      this.drawPresenter(ctx, W, H);

      // 3. Motion Captions & Subtitles
      this.drawCaptions(ctx, W, H);

      // 4. Overlays: Formula Badge, Academy Watermark, Header
      this.drawOverlays(ctx, W, H);
    }

    drawBackground(ctx, W, H) {
      if (this.theme === 'dark_lab') {
        const grad = ctx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, '#0F172A');
        grad.addColorStop(0.5, '#1E1B4B');
        grad.addColorStop(1, '#0B0F19');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Tech grid lines
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.12)';
        ctx.lineWidth = 1;
        const step = 40;
        for (let x = 0; x < W; x += step) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, H);
          ctx.stroke();
        }
        for (let y = 0; y < H; y += step) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(W, y);
          ctx.stroke();
        }

        // Ambient glowing orb
        const rad = ctx.createRadialGradient(W * 0.5, H * 0.35, 10, W * 0.5, H * 0.35, W * 0.6);
        rad.addColorStop(0, 'rgba(124, 58, 237, 0.25)');
        rad.addColorStop(1, 'transparent');
        ctx.fillStyle = rad;
        ctx.fillRect(0, 0, W, H);
      } else if (this.theme === 'chalkboard') {
        ctx.fillStyle = '#064E3B';
        ctx.fillRect(0, 0, W, H);

        // Chalk texture border
        ctx.strokeStyle = '#D1D5DB';
        ctx.lineWidth = 3;
        ctx.strokeRect(12, 12, W - 24, H - 24);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        for (let y = 40; y < H - 40; y += 35) {
          ctx.beginPath();
          ctx.moveTo(20, y);
          ctx.lineTo(W - 20, y);
          ctx.stroke();
        }
      } else if (this.theme === 'blueprint') {
        ctx.fillStyle = '#0C4A6E';
        ctx.fillRect(0, 0, W, H);

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 30) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        for (let y = 0; y < H; y += 30) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }
      } else { // cyber_studio
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#111827');
        grad.addColorStop(1, '#312E81');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      }
    }

    drawPresenter(ctx, W, H) {
      ctx.save();

      let avatarX, avatarY, avatarR;
      const isPortrait = this.aspect === '9:16';

      if (isPortrait) {
        avatarX = W * 0.5;
        avatarY = H * 0.42 + this.headBobY;
        avatarR = W * 0.34;
      } else {
        avatarX = W * 0.28;
        avatarY = H * 0.52 + this.headBobY;
        avatarR = H * 0.34;
      }

      // Outer glowing ring
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarR + 8, 0, Math.PI * 2);
      ctx.strokeStyle = this.isPlaying ? '#8B5CF6' : 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 6;
      ctx.shadowColor = '#8B5CF6';
      ctx.shadowBlur = this.isPlaying ? 20 : 5;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Inner image clipping circle
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2);
      ctx.clip();

      if (this.presenterImg) {
        // Draw image centered in circle
        ctx.drawImage(
          this.presenterImg,
          avatarX - avatarR,
          avatarY - avatarR,
          avatarR * 2,
          avatarR * 2
        );
      } else {
        // Fallback Stylized Avatar
        ctx.fillStyle = '#3B82F6';
        ctx.fillRect(avatarX - avatarR, avatarY - avatarR, avatarR * 2, avatarR * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 60px Cairo, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('أ/ طارق', avatarX, avatarY);
      }

      // Dynamic Lip-Sync Mouth Overlay (Synchronized Aperture)
      if (this.mouthOpen > 0.05) {
        const mouthCenterY = avatarY + (avatarR * 0.44);
        const mouthW = avatarR * 0.22;
        const mouthH = avatarR * 0.14 * this.mouthOpen;

        ctx.beginPath();
        ctx.ellipse(avatarX, mouthCenterY, mouthW, mouthH, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#78350F';
        ctx.fill();

        // Upper teeth line
        ctx.beginPath();
        ctx.ellipse(avatarX, mouthCenterY - (mouthH * 0.3), mouthW * 0.7, mouthH * 0.3, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#FEF3C7';
        ctx.fill();
      }

      // Dynamic Eye Blinking Overlay
      if (this.blinkProgress > 0.2) {
        const eyeY = avatarY - (avatarR * 0.12);
        const leftEyeX = avatarX - (avatarR * 0.22);
        const rightEyeX = avatarX + (avatarR * 0.22);
        const eyeW = avatarR * 0.14;

        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 4 * this.blinkProgress;
        ctx.beginPath();
        ctx.moveTo(leftEyeX - eyeW, eyeY);
        ctx.quadraticCurveTo(leftEyeX, eyeY + 4, leftEyeX + eyeW, eyeY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(rightEyeX - eyeW, eyeY);
        ctx.quadraticCurveTo(rightEyeX, eyeY + 4, rightEyeX + eyeW, eyeY);
        ctx.stroke();
      }

      ctx.restore();

      // Speaker Name Plate
      ctx.save();
      const plateY = avatarY + avatarR + 18;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#8B5CF6';
      ctx.lineWidth = 1.5;
      const plateW = 180;
      const plateH = 34;
      this.drawRoundedRect(ctx, avatarX - (plateW / 2), plateY - (plateH / 2), plateW, plateH, 17);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 16px Cairo, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎙️ أ/ طارق الشناوي', avatarX, plateY);
      ctx.restore();
    }

    drawCaptions(ctx, W, H) {
      if (!this.script) return;

      const isPortrait = this.aspect === '9:16';
      let capX = isPortrait ? W * 0.5 : W * 0.64;
      let capY = isPortrait ? H * 0.76 : H * 0.46;
      let maxW = isPortrait ? W * 0.88 : W * 0.42;

      // Extract current sentence segment based on playback progress
      const sentences = this.script.split(/[.؟!]+/).map(s => s.trim()).filter(Boolean);
      if (sentences.length === 0) return;

      const progress = this.duration > 0 ? (this.currentTime / this.duration) : 0;
      const activeIdx = Math.min(Math.floor(progress * sentences.length), sentences.length - 1);
      const currentSentence = sentences[activeIdx] || sentences[0];

      ctx.save();
      // Caption Backdrop Card
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      const cardPad = 16;
      const cardH = isPortrait ? 130 : 180;
      this.drawRoundedRect(ctx, capX - (maxW / 2) - cardPad, capY - 20, maxW + (cardPad * 2), cardH, 16);
      ctx.fill();
      ctx.stroke();

      // Caption Header
      ctx.fillStyle = '#FBBF24';
      ctx.font = 'bold 14px Cairo, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ الشرح الصوتي المباشر:', capX, capY);

      // Caption Body Text with Word Wrapping
      ctx.fillStyle = '#FFFFFF';
      ctx.font = isPortrait ? 'bold 18px Cairo, sans-serif' : 'bold 20px Cairo, sans-serif';
      this.drawWrappedText(ctx, currentSentence, capX, capY + 32, maxW, isPortrait ? 26 : 28);
      ctx.restore();
    }

    drawOverlays(ctx, W, H) {
      const isPortrait = this.aspect === '9:16';

      // 1. Top Header Badge
      ctx.save();
      ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      this.drawRoundedRect(ctx, 16, 16, W - 32, isPortrait ? 60 : 50, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 14px Cairo, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`🏷️ ${this.badge}`, W - 32, isPortrait ? 38 : 34);

      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 16px Cairo, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('🎓 أكاديمية الشناوي للفيزياء', 32, isPortrait ? 38 : 34);
      ctx.restore();

      // 2. Floating Physics Formula Banner
      if (this.formula) {
        ctx.save();
        const fY = isPortrait ? H * 0.18 : H * 0.80;
        const fX = isPortrait ? W * 0.5 : W * 0.64;
        const fW = isPortrait ? W * 0.85 : W * 0.44;

        ctx.fillStyle = 'rgba(124, 58, 237, 0.92)';
        ctx.strokeStyle = '#DDD6FE';
        ctx.lineWidth = 1.5;
        this.drawRoundedRect(ctx, fX - (fW / 2), fY - 18, fW, 46, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 18px "Courier New", monospace, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`📐 ${this.formula}`, fX, fY + 5);
        ctx.restore();
      }

      // 3. Bottom Progress Bar
      ctx.save();
      const progressRatio = this.duration > 0 ? (this.currentTime / this.duration) : 0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(0, H - 6, W, 6);

      ctx.fillStyle = '#10B981';
      ctx.fillRect(0, H - 6, W * progressRatio, 6);
      ctx.restore();
    }

    drawRoundedRect(ctx, x, y, width, height, radius) {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    }

    drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
      const words = text.split(' ');
      let line = '';
      let currentY = y;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line.trim(), x, currentY);
          line = words[n] + ' ';
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), x, currentY);
    }

    // 5. Video Rendering & Export via MediaRecorder
    exportVideo(onProgress, onComplete, onError) {
      if (typeof window === 'undefined' || !this.canvas.captureStream) {
        if (onError) onError(new Error('Canvas captureStream is not supported in this environment.'));
        return;
      }

      try {
        const stream = this.canvas.captureStream(30);
        let mimeType = 'video/webm;codecs=vp9';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = '';
          }
        }

        const options = mimeType ? { mimeType } : {};
        const recorder = new MediaRecorder(stream, options);
        const chunks = [];

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType || 'video/webm' });
          const url = URL.createObjectURL(blob);
          if (onComplete) onComplete({ blob, url, sizeBytes: blob.size });
        };

        recorder.start();
        this.seek(0);
        this.play();

        const checkInterval = setInterval(() => {
          if (onProgress) {
            const pct = Math.min(100, Math.round((this.currentTime / this.duration) * 100));
            onProgress(pct);
          }
          if (!this.isPlaying || this.currentTime >= this.duration) {
            clearInterval(checkInterval);
            setTimeout(() => {
              if (recorder.state !== 'inactive') recorder.stop();
            }, 300);
          }
        }, 200);

      } catch (err) {
        if (onError) onError(err);
      }
    }
  }

  // Export globally
  window.PresenterVideoEngine = {
    getVideoCapsules,
    saveVideoCapsules,
    generatePresenterScript,
    PresenterVideoCompositor,
    DEFAULT_VIDEO_CAPSULES
  };

})(typeof window !== 'undefined' ? window : global);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = (typeof window !== 'undefined' ? window.PresenterVideoEngine : global.PresenterVideoEngine);
}
