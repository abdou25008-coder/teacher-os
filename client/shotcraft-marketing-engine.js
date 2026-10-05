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
  window.ShotcraftMarketingEngine = {
    getMarketingCampaigns,
    getCampaignById,
    customizeCampaignScript,
    speakCampaignVoiceover,
    stopCampaignVoiceover,
    MARKETING_CAMPAIGNS
  };

})(typeof window !== 'undefined' ? window : global);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = (typeof window !== 'undefined' ? window.ShotcraftMarketingEngine : global.ShotcraftMarketingEngine);
}
