/**
 * ============================================================================
 * TEACHER OS — SHOTCRAFT MARKETING VIDEO SUITE ENGINE
 * Professional Video Campaigns & Motion Recipes for Egyptian Teachers
 * Featuring: avatar-bracket-carousel, carousel-3d, fui-hud-moves, bezier-converge
 * ============================================================================
 */

(function(window) {
  'use strict';

  // 1. Flagship Video Campaigns Catalog for Egyptian Teachers
  const MARKETING_CAMPAIGNS = [
    {
      id: 'campaign-drama-exhaustion',
      code: 'CAMPAIGN-01 // DRAMATIC-CINEMATIC',
      title: 'يوم في حياة مدرس الثانوية العامة: قبل وبعد المعلم الرقمي',
      subject_archetype: 'الفيزياء والعلوم',
      teacher_avatar: '⚡',
      teacher_role: 'مستر طارق (فيزياء)',
      format: 'Shorts 9:16',
      durationSec: 60,
      shotcraft_recipes: ['neon-frame-orbit-drop', 'graze-face-tour', 'spotlight-hero-card', 'canvas-materialize-moves'],
      hookCategory: 'الخطاف البيعي الدرامي (Pain-Point Hook):',
      hookQuote: 'أنت بتصحى 6 الصبح تلف على 3 سناتر، صوتك بيروح، الملازم بتتصور وتتسرب في الفجالة، وتليفونك مش بيبطل رن من أولياء الأمور.. طب ليه تفضل شغال بطريقة 2010 وإحنا في 2026؟',
      voiceoverText: 'أنت بتصحى ستة الصبح تلف على تلات سناتر، صوتك بيروح في إعادة نفس الجملة لمية طالب في القاعة، ملازمك اللي تعبت فيها بتتصور وتتباع برة بجنيهات، وتليفونك بالليل مش بيهدى من رسايل أولياء الأمور.. ليه تفضل تبيع صحتك ووقتك، وإنت تقدر تعمل زي أوائل الجمهورية في التدريس؟ مع تيتشر أو إس، صورتك وصوتك بيتحولوا لمعلم رقمي ذكي، كبسولات فيديو مركزة تشرح للطلبة أربعة وعشرين ساعة، ومختبر صوتي يدرب ألف طالب شفوياً في نفس اللحظة! وفر مجهودك، احمي ملازمك، وضاعف دخلك من إسكندرية لأسوان. انضم لأكاديميات المستقبل الآن!',
      scenes: [
        {
          time: '00:00 - 00:15',
          shot: 'graze-face-tour',
          visual: 'لقطات سريعة بالأبيض والأسود لمدرس مرهق في زحام السنتر، وأكوام ورق امتحانات بابل شيت متراكمة، مع صوت دقات ساعة متوترة.',
          audio: 'صوتك بيروح في إعادة نفس الشرح، ومذكراتك بتتصور على الرصيف.. لحد إمتى هتفضل مجهد؟'
        },
        {
          time: '00:15 - 00:30',
          shot: 'neon-frame-orbit-drop',
          visual: 'انتقال نيون بنفسجي سينمائي ملون: ظهور شاشة Teacher OS تبتلع الفوضى، وتنشئ استوديو المعلم الرقمي المضيء.',
          audio: 'في 2026، المعلم الشاطر عنده توأم رقمي متحدث ومختبر صوتي ذكي يشتغل مكانه!'
        },
        {
          time: '00:30 - 00:45',
          shot: 'canvas-materialize-moves',
          visual: 'استعراض لوحة الطالب: الطالب يتحدث شفوياً مع الذكاء الاصطناعي، وراسم الموجات يتحرك، ويحصل على تقييم فوري 95% ورتبة خبير.',
          audio: 'الطلاب يتدربوا شفهياً، يحلوا البابل شيت، وأولياء الأمور يوصلهم تقرير فوري بدون ما يرنوا عليك.'
        },
        {
          time: '00:45 - 00:60',
          shot: 'spotlight-hero-card',
          visual: 'بطاقة ذهبية لامعة: زيادة 10 أضعاف في الاشتراكات عبر InstaPay، مع زر: اشترك مجاناً مع كود 2027.',
          audio: 'ابنِ أكاديميتك الخاصة النهاردة، واحجز مكانك بين كبار المدرسين في مصر بضغطة زر واحدة.'
        }
      ]
    },
    {
      id: 'campaign-tech-voice-lab',
      code: 'CAMPAIGN-02 // TECH-PRODUCT DEMO',
      title: 'المختبر الصوتي الذكي: درب 1000 طالب شفوياً في نفس الدقيقة!',
      subject_archetype: 'الكيمياء والأحياء',
      teacher_avatar: '🧪',
      teacher_role: 'د. حسام (كيمياء)',
      format: 'Reels 60s',
      durationSec: 45,
      shotcraft_recipes: ['avatar-bracket-carousel', 'fui-hud-moves · line-unfold-panel', 'list-stack-press'],
      hookCategory: 'الخطاف التكنولوجي المذهل (The Impossible Made Possible):',
      hookQuote: 'في السنتر.. تقدر تسمّع لكام طالب في الحصة؟ 5؟ 10؟ طب إيه رأيك لو سمعت لـ 1500 طالب في دقيقة واحدة، وعرفت نقطة ضعف كل طالب بالظبط؟',
      voiceoverText: 'في السنتر.. تقدر تسمّع لكام طالب في الحصة؟ خمسة؟ عشرة؟ طب إيه رأيك لو سمعت لألف وخمسمية طالب في دقيقة واحدة، وعرفت نقطة ضعف كل طالب بالظبط؟ بنقدملك المختبر الصوتي الذكي من تيتشر أو إس. الطالب بيفتح الموبايل ويناقش قوانين المنهج بصوته، والذكاء الاصطناعي السقراطي يقيمه فوراً ويديله رتبة لاتينية من مبتدئ لخبير! والأجمل؟ بيطلعلك تقرير فوري بأكتر المفاهيم اللي الطلبة غلطت فيها علشان تشرحها في الحصة الجاية. متخليش تدريسك تقليدي.. فاجئ طلابك بأعلى تقنية تعليمية في مصر!',
      scenes: [
        {
          time: '00:00 - 00:10',
          shot: 'avatar-bracket-carousel',
          visual: 'إطار تركيز هولوجرامي في المنتصف يتنقل بين وجوه طلاب الثانوية العامة مع راسم موجات صوتية نابض باللون البنفسجي والذهبي.',
          audio: 'مستحيل تسمّع لـ 300 طالب في قاعة السنتر.. بس مع الذكاء الاصطناعي الصوتي مفيش مستحيل!'
        },
        {
          time: '00:10 - 00:25',
          shot: 'fui-hud-moves',
          visual: 'طالب يتكلم بالصوت ويشرح قاعدة لينز، والذكاء الاصطناعي يرد عليه فوراً بسؤال سقراطي ذكي مع تفريغ النص شاشة بشاشة.',
          audio: 'الطالب بيتكلم، والمنصة بتصححله خطوة بخطوة بالصوت بدون ما تديله الحل على الجاهز.'
        },
        {
          time: '00:25 - 00:35',
          shot: 'list-stack-press',
          visual: 'قائمة ثلاثية الأبعاد تنضغط لتظهر رتبة الطالب: خبير متفوق (Peritus) مع بطاقة نقاط القوة والضعف.',
          audio: 'رتب شفهية فورية تخلق روح التحدي بين طلابك وتخلي اسمك تريند في كل المدارس.'
        },
        {
          time: '00:35 - 00:45',
          shot: 'spotlight-hero-card',
          visual: 'لوحة تحكم المعلم تعرض زر: (تخصيص أسئلة المنهج بضغطة زر) مع رابط التجربة المجانية.',
          audio: 'فعل المختبر الصوتي لطلابك النهاردة مجاناً، وخليك المدرس رقم واحد في منطقتك!'
        }
      ]
    },
    {
      id: 'campaign-business-scale',
      code: 'CAMPAIGN-03 // BUSINESS & WEALTH',
      title: 'سر المليون جنيه: كيف تبني أكاديميتك الخاصة من الإسكندرية لأسوان؟',
      subject_archetype: 'الرياضيات والإحصاء',
      teacher_avatar: '📐',
      teacher_role: 'م/ أحمد (رياضيات)',
      format: 'Landscape 16:9',
      durationSec: 60,
      shotcraft_recipes: ['bezier-source-converge-merge', 'integration-hub-map', 'page-waterfall-wall'],
      hookCategory: 'خطاف العائد المالي وحرية المعلم (Financial Freedom & Scale):',
      hookQuote: 'ليه تكتفي بـ 200 طالب في منطقتك بياخدوا سنتر، وإنت تقدر تشترك معاك 3000 طالب من كل محافظات مصر باشتراك شهري ثابت على InstaPay؟',
      voiceoverText: 'ليه تكتفي بميتين طالب في منطقتك، وإنت تقدر تشترك معاك آلاف الطلاب من أسوان لمطروح؟ زمان كنت محتاج مبرمجين وسيرفرات بمئات الآلاف.. النهاردة مع تيتشر أو إس، بتبني أكاديميتك الخاصة في خمس دقايق باسمك وصورتك! متجر رقمي لبيع مذكراتك المحمية من النسخ، حصص زووم مشفرة بدون روابط تسريب، ودفع مباشر على فودافون كاش وإنستاباي بدون وسيط ولا عمولات مجحفة. المدرسين اللي بدأوا أونلاين صح حققوا ملايين وغيروا حياتهم.. دورك النهاردة تنقل تدريسك للمستوى الاحترافي. سجل الآن مجاناً وابدأ حصتك الأولى بكرة!',
      scenes: [
        {
          time: '00:00 - 00:15',
          shot: 'bezier-source-converge-merge',
          visual: 'خريطة مصر تضيء بنقاط ومسارات منحنية تتجمع كلها نحو شاشة هاتف محمول للمدرس مع إشعارات إيداعات InstaPay.',
          audio: 'طلاب من القاهرة، طنطا، سوهاج، وقنا.. كلهم بيشتركوا في منصتك في نفس اللحظة.'
        },
        {
          time: '00:15 - 00:30',
          shot: 'integration-hub-map',
          visual: 'مخطط شبكي يربط Teacher OS مع InstaPay، Zoom، WhatsApp، وGoogle Cloud مع شعار الأكاديمية الخاص بالمدرس.',
          audio: 'منظومة إدارية كاملة بتحسب الاشتراكات، تقفل الحساب عن الممتنعين، وتفتح الحصص أوتوماتيك.'
        },
        {
          time: '00:30 - 00:45',
          shot: 'page-waterfall-wall',
          visual: 'شلال شاشات هاتف يعرض تجارب المذكرات المشفرة بعلامة مائية برقم الطالب القومي، مانعةً أي محاولة تسريب أو طباعة.',
          audio: 'مذكراتك محمية تماماً بعلامة مائية سرية باسم الطالب القومي.. مستحيل تتسرب على تليجرام.'
        },
        {
          time: '00:45 - 00:60',
          shot: 'spotlight-hero-card',
          visual: 'المدرس جالس في مكتبه الفاخر مع حاسوبه يشرب قهوته والمنصة تعمل وحدها: عرض تجربة مجانية 30 يوماً.',
          audio: 'ارتاح من دوشة السناتر واستثمر في علامتك الشخصية. المنصة جاهزة ليك بالكامل.. ابدأ الآن!'
        }
      ]
    },
    {
      id: 'campaign-parent-relief',
      code: 'CAMPAIGN-04 // RELATABLE COMEDY & RELIEF',
      title: 'سلاح المدرس الذكي ضد وجع دماغ السكرتارية وأولياء الأمور عالواتساب',
      subject_archetype: 'اللغات واللغة العربية',
      teacher_avatar: '📚',
      teacher_role: 'أ/ محمود (لغة عربية)',
      format: 'Shorts 45s',
      durationSec: 45,
      shotcraft_recipes: ['line-unfold-panel', 'list-stack-press', 'spotlight-hero-card'],
      hookCategory: 'الخطاف الفكاهي والراحة النفسية (Relatable Stress & Relief):',
      hookQuote: 'الساعة 12 بالليل.. يا مستر هو الواد أحمد حضر النهاردة؟ يا مستر امتحانه الجاي إمتى؟ طب ليه متخليش الذكاء الاصطناعي يرد عليهم بدالك وبأدب؟',
      voiceoverText: 'الساعة اتناشر بالليل، تليفونك بيرن: يا مستر هو أحمد حضر النهاردة؟ يا مستر درجات كويز الخميس إيه؟ يا مستر ذاكر ازاي؟ وفي الآخر تكتشف إن السكرتيرة نسيت تسجل نص الغياب! مع تيتشر أو إس، ولي الأمر عنده بوابته الخاصة برقم سري، ومستشار ذكي بيرد عليه فوراً بنبرة هادية وبأعلى احترام وفقاً لتعليماتك إنت! درجات ابنه، نسب حضوره، وحتى مواعيد الامتحانات بتوصله أوتوماتيك. ريّح دماغك من وجع رسايل الواتساب، وركّز إنت في الشرح والإبداع. جرب بوابة ولي الأمر الذكية مجاناً النهاردة!',
      scenes: [
        {
          time: '00:00 - 00:12',
          shot: 'graze-face-tour',
          visual: 'شاشة موبايل تهتز بعشرات إشعارات الواتساب الساعة 12:30 بعد منتصف الليل مع وجه مدرس مجهد.',
          audio: 'يا مستر هو أحمد مستواه إيه؟ يا مستر الواجب كان صفحة كام؟ تليفونك مبينامش؟'
        },
        {
          time: '00:12 - 00:25',
          shot: 'line-unfold-panel',
          visual: 'ظهور خط نيون يفتح لوحة ولي الأمر: المستشار الذكي يرد بلباقة على ولي الأمر ويعرض نسبة الحضور 95% ودرجة الامتحان.',
          audio: 'تيتشر أو إس وفرتلك مستشار ذكي بيشتغل سكرتير شخصي ليك 24 ساعة، يرد على كل سؤال بتعليماتك.'
        },
        {
          time: '00:25 - 00:35',
          shot: 'canvas-materialize-moves',
          visual: 'تقرير ولي الأمر يظهر بالصوت والصورة مع رسالة فيديو أسبوعية مسجلة من المعلم الرقمي.',
          audio: 'أولياء الأمور مبسوطين بالاهتمام الفائق، وإنت نايم مرتاح البال بدون أي إزعاج.'
        },
        {
          time: '00:35 - 00:45',
          shot: 'spotlight-hero-card',
          visual: 'شارة: أكاديمية احترافية 100% مع زر إطلاق التجربة وتفعيل كود الخصم السنوي.',
          audio: 'ريّح بالك واكسب ثقة أولياء أمورك من أول يوم.. جرب تيتشر أو إس مجاناً!'
        }
      ]
    }
  ];

  // 2. Core API Helpers
  function getMarketingCampaigns() {
    return MARKETING_CAMPAIGNS;
  }

  function getCampaignById(id) {
    return MARKETING_CAMPAIGNS.find(c => c.id === id) || MARKETING_CAMPAIGNS[0];
  }

  function customizeCampaignScript(campaignId, teacherName, subjectName, contactPhone) {
    const c = getCampaignById(campaignId);
    let customized = c.voiceoverText;
    if (teacherName) {
      customized = customized.replace(/تيتشر أو إس/g, `أكاديمية ${teacherName} عبر منصة تيتشر أو إس`);
    }
    if (subjectName) {
      customized = customized.replace(/التدريس/g, `تدريس ${subjectName}`);
    }
    if (contactPhone) {
      customized += ` تواصل واتساب الآن على ${contactPhone}.`;
    }
    return customized;
  }

  // 3. Audio Voiceover Engine
  let activeSpeechUtterance = null;
  let isVoiceoverPlaying = false;

  function speakCampaignVoiceover(text, onStart, onEnd, onError) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onError) onError(new Error('SpeechSynthesis not supported'));
      return;
    }

    stopCampaignVoiceover();

    activeSpeechUtterance = new SpeechSynthesisUtterance(text);
    activeSpeechUtterance.lang = 'ar-EG';
    activeSpeechUtterance.rate = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const arVoice = voices.find(v => v.lang.startsWith('ar') || v.lang.includes('EG') || v.lang.includes('SA'));
    if (arVoice) activeSpeechUtterance.voice = arVoice;

    activeSpeechUtterance.onstart = () => {
      isVoiceoverPlaying = true;
      if (onStart) onStart();
    };

    activeSpeechUtterance.onend = () => {
      isVoiceoverPlaying = false;
      if (onEnd) onEnd();
    };

    activeSpeechUtterance.onerror = (err) => {
      isVoiceoverPlaying = false;
      if (onError) onError(err);
    };

    window.speechSynthesis.speak(activeSpeechUtterance);
  }

  function stopCampaignVoiceover() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      isVoiceoverPlaying = false;
    }
  }

  // 4. Export globally
  
  // ============================================================================
  // 4. SHOTCRAFT INTERACTIVE CANVAS VIDEO PLAYER & MOTION RECIPES RENDERER
  // ============================================================================
  let activeAnimationId = null;
  let activeCanvas = null;
  let activeCtx = null;
  let activeCampaignIndex = 0;
  let isVideoPlaying = false;
  let isMuted = false;
  let playbackStartTime = 0;
  let currentPlaybackSec = 0;
  let videoTotalSec = 45;

  // Particle System for Motion Recipes
  const particles = [];
  for (let i = 0; i < 40; i++) {
    particles.push({
      x: Math.random() * 800,
      y: Math.random() * 600,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      radius: Math.random() * 3 + 1,
      color: ['#8B5CF6', '#EC4899', '#38BDF8', '#F59E0B', '#10B981'][Math.floor(Math.random() * 5)],
      alpha: Math.random() * 0.7 + 0.3
    });
  }

  function startCampaignPlayer(canvasId, campaignIdx) {
    activeCanvas = typeof canvasId === 'string' ? document.getElementById(canvasId) : canvasId;
    if (!activeCanvas) return;
    activeCtx = activeCanvas.getContext('2d');
    activeCampaignIndex = campaignIdx >= 0 && campaignIdx < MARKETING_CAMPAIGNS.length ? campaignIdx : 0;
    const campaign = MARKETING_CAMPAIGNS[activeCampaignIndex];
    videoTotalSec = campaign.durationSec || 45;
    currentPlaybackSec = 0;
    playbackStartTime = performance.now();
    isVideoPlaying = true;

    if (!isMuted) {
      speakCampaignVoiceover(campaign.voiceoverText, null, () => {
        // Loop or end
      });
    }

    if (activeAnimationId) cancelAnimationFrame(activeAnimationId);
    animateLoop();
    updatePlayerControlsUI();
  }

  function stopCampaignPlayer() {
    isVideoPlaying = false;
    if (activeAnimationId) {
      cancelAnimationFrame(activeAnimationId);
      activeAnimationId = null;
    }
    stopCampaignVoiceover();
    updatePlayerControlsUI();
  }

  function togglePlayPause() {
    if (isVideoPlaying) {
      isVideoPlaying = false;
      stopCampaignVoiceover();
    } else {
      isVideoPlaying = true;
      const campaign = MARKETING_CAMPAIGNS[activeCampaignIndex];
      if (!isMuted) {
        speakCampaignVoiceover(campaign.voiceoverText);
      }
      playbackStartTime = performance.now() - (currentPlaybackSec * 1000);
      animateLoop();
    }
    updatePlayerControlsUI();
  }

  function toggleMute() {
    isMuted = !isMuted;
    if (isMuted) {
      stopCampaignVoiceover();
    } else if (isVideoPlaying) {
      const campaign = MARKETING_CAMPAIGNS[activeCampaignIndex];
      speakCampaignVoiceover(campaign.voiceoverText);
    }
    updatePlayerControlsUI();
  }

  function switchPlayerCampaign(idx) {
    stopCampaignPlayer();
    startCampaignPlayer(activeCanvas, idx);
  }

  function animateLoop() {
    if (!activeCanvas || !activeCtx) return;
    const now = performance.now();
    if (isVideoPlaying) {
      currentPlaybackSec = ((now - playbackStartTime) / 1000) % videoTotalSec;
    }

    renderShotcraftFrame(activeCtx, activeCanvas.width, activeCanvas.height, activeCampaignIndex, currentPlaybackSec, now);

    // Update time displays if modal elements exist
    const timeDisplay = document.getElementById('shotcraft-player-time');
    if (timeDisplay) {
      const curM = Math.floor(currentPlaybackSec / 60);
      const curS = Math.floor(currentPlaybackSec % 60);
      const totM = Math.floor(videoTotalSec / 60);
      const totS = Math.floor(videoTotalSec % 60);
      timeDisplay.textContent = `${curM < 10 ? '0' : ''}${curM}:${curS < 10 ? '0' : ''}${curS} / ${totM < 10 ? '0' : ''}${totM}:${totS < 10 ? '0' : ''}${totS}`;
    }

    const progBar = document.getElementById('shotcraft-player-progress-fill');
    if (progBar) {
      progBar.style.width = `${(currentPlaybackSec / videoTotalSec) * 100}%`;
    }

    if (isVideoPlaying) {
      activeAnimationId = requestAnimationFrame(animateLoop);
    }
  }

  function renderShotcraftFrame(ctx, w, h, campIdx, timeSec, nowMs) {
    const campaign = MARKETING_CAMPAIGNS[campIdx];
    const progress = (timeSec / videoTotalSec);

    // 1. Cyber Dark Background
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#0B0F19');
    bgGrad.addColorStop(0.5, '#111827');
    bgGrad.addColorStop(1, '#030712');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Animated Particle Field
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      ctx.save();
      ctx.globalAlpha = p.alpha * 0.6;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 3. Grid Lines
    ctx.save();
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.08)';
    ctx.lineWidth = 1;
    const gridSpacing = 40;
    for (let x = 0; x < w; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();

    // 4. MOTION RECIPE RENDERING BASED ON ACTIVE CAMPAIGN
    if (campIdx === 0) {
      // ===== RECIPE: canvas-materialize-moves & neon-frame-orbit-drop =====
      renderCampaign0Drama(ctx, w, h, progress, nowMs);
    } else if (campIdx === 1) {
      // ===== RECIPE: avatar-bracket-carousel & fui-hud-moves =====
      renderCampaign1VoiceLab(ctx, w, h, progress, nowMs);
    } else if (campIdx === 2) {
      // ===== RECIPE: bezier-source-converge-merge & carousel-3d =====
      renderCampaign2Scale(ctx, w, h, progress, nowMs);
    } else {
      // ===== RECIPE: page-waterfall-wall & line-unfold-panel =====
      renderCampaign3Relief(ctx, w, h, progress, nowMs);
    }

    // 5. Header HUD Bar
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(0, 0, w, 50);
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 50);
    ctx.lineTo(w, 50);
    ctx.stroke();

    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillStyle = '#F472B6';
    ctx.fillText('🔴 REC // SHOTCRAFT ' + campaign.format, 20, 30);

    ctx.textAlign = 'right';
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText(campaign.code, w - 20, 30);
    ctx.restore();

    // 6. Kinetic Subtitle Bar (Bottom)
    renderKineticSubtitles(ctx, w, h, campaign, progress);
  }

  // --- Campaign 0: Dramatic Before/After & Neon Frame Drop ---
  function renderCampaign0Drama(ctx, w, h, progress, nowMs) {
    const cx = w / 2;
    const cy = h / 2 - 30;

    // Neon Frame Orbit Drop
    const frameW = Math.min(w * 0.85, 480);
    const frameH = 260;
    const dropY = cy - frameH / 2;

    ctx.save();
    // Glowing neon border
    ctx.shadowColor = '#EC4899';
    ctx.shadowBlur = 20;
    ctx.strokeStyle = '#EC4899';
    ctx.lineWidth = 3;
    ctx.strokeRect(cx - frameW / 2, dropY, frameW, frameH);
    ctx.shadowBlur = 0;

    // Inner Glass Background
    ctx.fillStyle = 'rgba(30, 27, 75, 0.75)';
    ctx.fillRect(cx - frameW / 2, dropY, frameW, frameH);

    // Orbiting particle around frame
    const angle = (nowMs / 800) % (Math.PI * 2);
    const orbitR = frameW / 2 + 15;
    const ox = cx + Math.cos(angle) * orbitR;
    const oy = cy + Math.sin(angle) * (frameH / 2 + 15);
    ctx.fillStyle = '#38BDF8';
    ctx.shadowColor = '#38BDF8';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(ox, oy, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Content: Split Screen Comparison
    ctx.textAlign = 'center';
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('يوم في حياة مدرس الثانوية العامة', cx, dropY + 45);

    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.fillStyle = '#F472B6';
    ctx.fillText('⚡ نقلة ثورية: من تعب السناتر إلى الأكاديمية الذكية', cx, dropY + 75);

    // 2 Feature Highlight Pills
    const pillW = frameW * 0.42;
    // Left: Before
    ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
    ctx.strokeRect(cx - pillW - 10, dropY + 105, pillW, 110);
    ctx.fillRect(cx - pillW - 10, dropY + 105, pillW, 110);

    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.fillStyle = '#FCA5A5';
    ctx.fillText('❌ قبل تيتشر أو إس', cx - pillW / 2 - 10, dropY + 130);
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillStyle = '#FECACA';
    ctx.fillText('• 3 سناتر يومياً وصوت مرهق', cx - pillW / 2 - 10, dropY + 155);
    ctx.fillText('• تصوير المذكرات في الفجالة', cx - pillW / 2 - 10, dropY + 175);
    ctx.fillText('• اتصالات بالليل من الأهالي', cx - pillW / 2 - 10, dropY + 195);

    // Right: After
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
    ctx.strokeRect(cx + 10, dropY + 105, pillW, 110);
    ctx.fillRect(cx + 10, dropY + 105, pillW, 110);

    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.fillStyle = '#6EE7B7';
    ctx.fillText('✅ مع تيتشر أو إس 2026', cx + pillW / 2 + 10, dropY + 130);
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillStyle = '#A7F3D0';
    ctx.fillText('• توأم رقمي متحدث 24 ساعة', cx + pillW / 2 + 10, dropY + 155);
    ctx.fillText('• تصحيح OCR ومختبر صوتي', cx + pillW / 2 + 10, dropY + 175);
    ctx.fillText('• أرباح مضاعفة عبر InstaPay', cx + pillW / 2 + 10, dropY + 195);

    ctx.restore();
  }

  // --- Campaign 1: Avatar Bracket Carousel & FUI HUD ---
  function renderCampaign1VoiceLab(ctx, w, h, progress, nowMs) {
    const cx = w / 2;
    const cy = h / 2 - 30;

    // FUI HUD Target Rings
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 140, 0, Math.PI * 2);
    ctx.stroke();

    ctx.setLineDash([8, 8]);
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
    ctx.beginPath();
    ctx.arc(cx, cy, 160, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Rotating Avatars Bracket Carousel
    const avatars = [
      { icon: '👨‍🏫', label: 'المعلم الرقمي' },
      { icon: '🎓', label: 'طالب 1 (كيرشوف)' },
      { icon: '🎙️', label: 'المختبر الصوتي' },
      { icon: '⭐', label: 'أوائل الجمهورية' }
    ];

    const baseAngle = nowMs / 2000;
    avatars.forEach((av, i) => {
      const a = baseAngle + (i * (Math.PI * 2 / avatars.length));
      const ax = cx + Math.cos(a) * 110;
      const ay = cy + Math.sin(a) * 80;

      // Bracket Box
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = i === 0 ? '#EC4899' : '#38BDF8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(ax - 35, ay - 30, 70, 60, 10) : ctx.rect(ax - 35, ay - 30, 70, 60);
      ctx.fill();
      ctx.stroke();

      // Bracket corners
      ctx.font = '24px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(av.icon, ax, ay + 5);

      ctx.font = 'bold 10px system-ui, sans-serif';
      ctx.fillStyle = '#CBD5E1';
      ctx.fillText(av.label, ax, ay + 22);
    });

    // Center Live Soundwave & HUD Meter
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('المختبر الصوتي السقراطي الحي', cx, cy - 180);

    // Audio Bars
    for (let b = -6; b <= 6; b++) {
      const barH = Math.sin(nowMs / 150 + b) * 25 + 30;
      ctx.fillStyle = b === 0 ? '#F59E0B' : '#8B5CF6';
      ctx.fillRect(cx + b * 10 - 3, cy - barH / 2, 6, barH);
    }

    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillStyle = '#34D399';
    ctx.fillText('✅ تقييم فوري 98% (رتبة خبير Peritus)', cx, cy + 185);

    ctx.restore();
  }

  // --- Campaign 2: Bezier Source Converge & Merge ---
  function renderCampaign2Scale(ctx, w, h, progress, nowMs) {
    const cx = w / 2;
    const cy = h / 2 - 30;

    ctx.save();
    // Central Emblem: Golden Academy Shield
    ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
    ctx.beginPath();
    ctx.arc(cx, cy, 75, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#F59E0B';
    ctx.shadowBlur = 25;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.font = '36px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('🏛️', cx, cy + 5);

    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillStyle = '#FDE68A';
    ctx.fillText('أكاديمية المعلم الرقمية', cx, cy + 30);

    // Bezier Converge Streams from Egypt Governorates
    const cities = [
      { name: 'الإسكندرية', x: cx - 220, y: cy - 140 },
      { name: 'القاهرة', x: cx - 200, y: cy + 120 },
      { name: 'المنصورة', x: cx + 200, y: cy - 130 },
      { name: 'أسيوط', x: cx + 220, y: cy + 110 },
      { name: 'سوهاج', x: cx - 120, y: cy + 180 },
      { name: 'أسوان', x: cx + 130, y: cy + 180 }
    ];

    cities.forEach((city, idx) => {
      // City badge
      ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(city.x - 45, city.y - 15, 90, 30);
      ctx.fillRect(city.x - 45, city.y - 15, 90, 30);

      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.fillStyle = '#38BDF8';
      ctx.fillText(city.name, city.x, city.y + 5);

      // Bezier curve to center
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.lineWidth = 2;
      ctx.moveTo(city.x, city.y);
      const cpX = (city.x + cx) / 2 + (idx % 2 === 0 ? 50 : -50);
      const cpY = (city.y + cy) / 2 + (idx % 2 === 0 ? -40 : 40);
      ctx.quadraticCurveTo(cpX, cpY, cx, cy);
      ctx.stroke();

      // Energy pulse moving along curve
      const t = ((nowMs / 1200) + idx * 0.2) % 1;
      const px = Math.pow(1 - t, 2) * city.x + 2 * (1 - t) * t * cpX + Math.pow(t, 2) * cx;
      const py = Math.pow(1 - t, 2) * city.y + 2 * (1 - t) * t * cpY + Math.pow(t, 2) * cy;

      ctx.fillStyle = '#F59E0B';
      ctx.shadowColor = '#F59E0B';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('سر المليون جنيه: ابنِ أكاديميتك الخاصة', cx, cy - 190);

    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillStyle = '#34D399';
    ctx.fillText('💳 اشتراكات فورية من كل محافظات مصر عبر InstaPay و Vodafone Cash', cx, cy + 225);

    ctx.restore();
  }

  // --- Campaign 3: Page Waterfall Wall & WhatsApp Relief ---
  function renderCampaign3Relief(ctx, w, h, progress, nowMs) {
    const cx = w / 2;
    const cy = h / 2 - 30;

    ctx.save();
    // WhatsApp Parent Relief Card
    const cardW = Math.min(w * 0.85, 460);
    const cardH = 250;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#10B981';
    ctx.shadowBlur = 15;
    ctx.strokeRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH);
    ctx.shadowBlur = 0;
    ctx.fillRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH);

    // Header
    ctx.textAlign = 'center';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('سلاح المدرس الذكي ضد وجع دماغ السكرتارية', cx, cy - cardH / 2 + 40);

    // Chat Message Bubbles
    // Parent Message (Late Night)
    ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.strokeRect(cx - cardW / 2 + 20, cy - 40, cardW - 40, 50);
    ctx.fillRect(cx - cardW / 2 + 20, cy - 40, cardW - 40, 50);

    ctx.textAlign = 'right';
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.fillStyle = '#F87171';
    ctx.fillText('12:35 AM • ولي أمر أحمد (واتساب):', cx + cardW / 2 - 35, cy - 22);
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillStyle = '#FECACA';
    ctx.fillText('يا مستر هو أحمد جه السنتر النهاردة ولا غاب؟ ودرجة كويز الفيزياء كام؟', cx + cardW / 2 - 35, cy - 2);

    // AI Auto-Advisor Reply
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
    ctx.strokeRect(cx - cardW / 2 + 20, cy + 25, cardW - 40, 65);
    ctx.fillRect(cx - cardW / 2 + 20, cy + 25, cardW - 40, 65);

    ctx.textAlign = 'right';
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.fillStyle = '#34D399';
    ctx.fillText('12:35 AM • رد مستشار المنصة الآلي الفوري ✅:', cx + cardW / 2 - 35, cy + 45);
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillStyle = '#A7F3D0';
    ctx.fillText('أهلاً بحضرتك. أحمد حضر محاضرة كيرشوف ونسبة حضوره 95%، ودرجة الكويز 20/20 متفوق.', cx + cardW / 2 - 35, cy + 68);

    ctx.textAlign = 'center';
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.fillStyle = '#CBD5E1';
    ctx.fillText('🛡️ وفر وقتك وريّح بالك من رسايل نصف الليل.. المنصة بترد مكانك بأدب وشفافية!', cx, cy + cardH / 2 + 35);

    ctx.restore();
  }

  // --- Kinetic Subtitles Bar ---
  function renderKineticSubtitles(ctx, w, h, campaign, progress) {
    const scenes = campaign.scenes || [];
    const sceneIndex = Math.min(Math.floor(progress * scenes.length), scenes.length - 1);
    const activeScene = scenes[sceneIndex] || scenes[0];

    ctx.save();
    // Subtitle Container
    const barH = 75;
    const barY = h - barH - 25;
    ctx.fillStyle = 'rgba(11, 15, 25, 0.92)';
    ctx.strokeStyle = '#F472B6';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(20, barY, w - 40, barH);
    ctx.fillRect(20, barY, w - 40, barH);

    // Badge
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillStyle = '#F472B6';
    ctx.textAlign = 'left';
    ctx.fillText('🎙️ التعليق الصوتي الحركي (Voiceover & Subtitles):', 35, barY + 22);

    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.fillStyle = '#FDE047';
    ctx.textAlign = 'center';
    ctx.fillText(activeScene.audio, w / 2, barY + 50);

    ctx.restore();
  }

  function updatePlayerControlsUI() {
    const playBtn = document.getElementById('shotcraft-play-toggle-btn');
    if (playBtn) {
      playBtn.innerHTML = isVideoPlaying ? '⏸️ إيقاف مؤقت' : '▶️ تشغيل الفيديو';
    }
    const muteBtn = document.getElementById('shotcraft-mute-toggle-btn');
    if (muteBtn) {
      muteBtn.innerHTML = isMuted ? '🔇 الصوت مكتوم' : '🔊 الصوت يعمل';
    }
  }

  // 5. Global Modal Helpers
  function openShotcraftVideoModal(campIdx) {
    const modal = document.getElementById('modal-shotcraft-video-player');
    if (!modal) return;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Highlight tab
    const tabs = document.querySelectorAll('.shotcraft-modal-tab-btn');
    tabs.forEach((t, i) => {
      if (i === campIdx) {
        t.style.background = 'rgba(236, 72, 153, 0.3)';
        t.style.borderColor = '#EC4899';
        t.style.color = '#FFFFFF';
      } else {
        t.style.background = 'rgba(30, 41, 59, 0.5)';
        t.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        t.style.color = '#94A3B8';
      }
    });

    const canvas = document.getElementById('shotcraft-player-canvas');
    if (canvas) {
      // Set resolution
      canvas.width = 800;
      canvas.height = 500;
      startCampaignPlayer(canvas, campIdx);
    }
  }

  function closeShotcraftVideoModal() {
    const modal = document.getElementById('modal-shotcraft-video-player');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
    stopCampaignPlayer();
  }

  window.ShotcraftMarketingEngine = {
    getMarketingCampaigns,
    getCampaignById,
    customizeCampaignScript,
    speakCampaignVoiceover,
    stopCampaignVoiceover,
    startCampaignPlayer,
    stopCampaignPlayer,
    togglePlayPause,
    toggleMute,
    switchPlayerCampaign,
    openShotcraftVideoModal,
    closeShotcraftVideoModal,
    MARKETING_CAMPAIGNS
  };

})(typeof window !== 'undefined' ? window : global);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = (typeof window !== 'undefined' ? window.ShotcraftMarketingEngine : global.ShotcraftMarketingEngine);
}
