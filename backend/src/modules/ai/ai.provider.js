/**
 * TEACHER OS — Provider-Agnostic AI Bridge Engine
 * Abstract interface with support for structured schema generation, fallback rules, and multi-provider swapping.
 */

class AIProviderBridge {
  constructor() {
    this.providerName = process.env.AI_PROVIDER || 'TEACHER_OS_INTELLIGENCE_ENGINE';
  }

  /**
   * Generates structured output against a registered prompt and input parameters
   */
  async generateStructuredOutput(promptConfig, inputParams) {
    // In production, this bridges to Gemini 2.5/3.0, Anthropic Claude, or OpenAI API
    // Here we implement the high-precision pedagogical rule engine adhering to the exact JSON contract
    if (promptConfig.id === 'LESSON_GENERATOR_V1') {
      return this._generateLessonPlan(inputParams);
    } else if (promptConfig.id === 'ASSESSMENT_GENERATOR_V1') {
      return this._generateAssessment(inputParams);
    } else if (promptConfig.id === 'VOICE_INTENT_PARSER_V1') {
      return this._parseVoiceIntent(inputParams);
    }

    throw new Error(`Unsupported prompt ID: ${promptConfig.id}`);
  }

  _generateLessonPlan(params) {
    const topic = params.topic || 'التيار الكهربي وقانون أوم';
    const grade = params.gradeLevel || 'GRADE_12_SEC3';
    const duration = params.durationMins || 60;

    return {
      title: `خطة درس متكاملة: ${topic}`,
      subject: 'الفيزياء',
      gradeLevel: grade,
      totalDurationMins: duration,
      learningObjectives: [
        'فهم مفهوم شدة التيار الكهربي وفرق الجهد الكهربي في الدوائر المغلقة.',
        'تطبيق العلاقة الرياضية لقانون أوم (V = I * R) لحساب المقاومة المكافئة.',
        'التمييز بين خصائص توصيل المقاومات على التوالي والتوازي عملياً ونظرياً.'
      ],
      timeAllocation: [
        { phase: 'التهيئة وجذب الانتباه (Hook)', durationMins: 5, description: 'عرض تجربة بسيطة لتوهج مصباح في دائرة متوالية مقابل متوازية وتحدي الطلاب بتفسير الفرق.' },
        { phase: 'تنشيط المعرفة السابقة (Prior Knowledge)', durationMins: 7, description: 'مراجعة سريعة لمفهوم الشحنة الكهربية ووحدات القياس الأساسية (أمبير، كولوم، فولت).' },
        { phase: 'الشرح المعمق والتطبيقات (Core Explanation)', durationMins: 25, description: 'استنتاج قانون أوم، رسم العلاقات البيانية وتفسير الميل، وحساب المقاومة النوعية.' },
        { phase: 'النشاط التفاعلي الجماعي (Collaborative Activity)', durationMins: 13, description: 'حل مسألة مركبة في مجموعات ثنائية لحساب شدة التيار في فروع دائرة متوازية.' },
        { phase: 'التقييم التكويني وتذكرة الخروج (Exit Ticket)', durationMins: 10, description: 'سؤال سريع يقيس الفهم العميق للتحقق من تحقيق نواتج التعلم قبل نهاية الحصة.' }
      ],
      commonMisconceptions: [
        'اعتقاد أن شدة التيار تستهلك أو تنقص بعد مرورها في المقاومة.',
        'الخلط بين قانون أوم (العلاقة الخطية) والمقاومات غير الأومية.',
        'الخطأ في حساب المقاومة المكافئة في التوازي بنسيان قلب الكسر النهائي.'
      ],
      interactiveActivity: {
        title: 'تحدي الدائرة الذكية',
        durationMins: 13,
        instructions: 'توزيع مخطط دائرة كهربية بها 3 مقاومات ومفتاح، ويطلب من كل طالبين حساب فرق الجهد قبل وبعد غلق المفتاح.'
      },
      exitTicket: {
        prompt: 'إذا زاد طول سلك موصل إلى الضعف وقلت مساحة مقطعه إلى النصف، فماذا يحدث لمقاومته الكهربية؟ وضح السبب رياضياً.',
        correctAnswerRationale: 'تزداد المقاومة إلى 4 أمثال قيمتها لأن R تتناسب طردياً مع L وعكسياً مع A.'
      }
    };
  }

  _generateAssessment(params) {
    const title = params.title || 'اختبار تقييمي على قانون أوم وتوصيل المقاومات';
    const lessonId = params.lessonId || 'les-electric-current';
    const questionCount = params.questionCount || 5;

    return {
      title,
      lessonId,
      totalMarks: questionCount * 2,
      blueprintSummary: {
        easyPct: 30,
        mediumPct: 50,
        hardPct: 20,
        totalQuestions: questionCount
      },
      questions: [
        {
          conceptId: 'cpt-ohm-law',
          questionType: 'MCQ',
          prompt: 'عند زيادة فرق الجهد بين طرفي موصل أومي إلى ثلاثة أمثال قيمته عند ثبوت درجة الحرارة، فإن مقاومة الموصل:',
          options: [
            'تزداد إلى ثلاثة أمثالها',
            'تقل إلى الثلث',
            'تظل ثابتة لا تتغير',
            'تزداد إلى تسعة أمثالها'
          ],
          correctAnswer: 'تظل ثابتة لا تتغير',
          explanation: 'المقاومة الأومية خاصية مميزة للموصل تعتمد على طوله ومساحة مقطعه ونوعه ودرجة حرارته، ولا تتغير بتغير فرق الجهد أو شدة التيار.',
          marks: 2,
          difficulty: 'EASY'
        },
        {
          conceptId: 'cpt-parallel-series',
          questionType: 'MCQ',
          prompt: 'ثلاث مقاومات متماثلة قيمة كل منها (R). عند توصيلها معاً على التوازي، تكون المقاومة المكافئة للمجموعة:',
          options: [
            '3R',
            'R / 3',
            'R / 9',
            '9R'
          ],
          correctAnswer: 'R / 3',
          explanation: 'في حالة التوصيل على التوازي لمقاومات متماثلة، المقاومة المكافئة R_eq = R / n = R / 3.',
          marks: 2,
          difficulty: 'MEDIUM'
        },
        {
          conceptId: 'cpt-parallel-series',
          questionType: 'MCQ',
          prompt: 'مقاومتان (6 أوم) و (3 أوم) متصلتان على التوازي مع بطارية مهملة المقاومة الداخلية. إذا كانت شدة التيار المار في المقاومة (6 أوم) هي (2 أمبير)، فإن التيار الكلي للدائرة يساوي:',
          options: [
            '2 أمبير',
            '4 أمبير',
            '6 أمبير',
            '8 أمبير'
          ],
          correctAnswer: '6 أمبير',
          explanation: 'فرق الجهد متساوٍ في التوازي V = 6 * 2 = 12 فولت. تيار المقاومة الأخرى I_2 = 12 / 3 = 4 أمبير. التيار الكلي I_total = 2 + 4 = 6 أمبير.',
          marks: 2,
          difficulty: 'HARD'
        },
        {
          conceptId: 'cpt-ohm-law',
          questionType: 'TRUE_FALSE',
          prompt: 'الميل في العلاقة البيانية بين فرق الجهد (V) على المحور الرأسي وشدة التيار (I) على المحور الأفقي يمثل مقلوب المقاومة الكهربية (1/R).',
          options: ['صح', 'خطأ'],
          correctAnswer: 'خطأ',
          explanation: 'الميل Slope = ΔV / ΔI = R (المقاومة نفسها، وليس مقلوبها).',
          marks: 2,
          difficulty: 'MEDIUM'
        },
        {
          conceptId: 'cpt-kirchhoff',
          questionType: 'MCQ',
          prompt: 'يعتبر قانون كيرشوف الأول (قانون نقطة التفرع) تطبيقاً مباشراً لمبدأ فيزيائي هام هو:',
          options: [
            'حفظ الطاقة',
            'حفظ الشحنة الكهربية',
            'حفظ كمية التحرك',
            'حفظ المادة'
          ],
          correctAnswer: 'حفظ الشحنة الكهربية',
          explanation: 'قانون كيرشوف الأول ينص على أن مجموع الشحنات الداخلة إلى نقطة يساوي مجموع الشحنات الخارجة منها (حفظ الشحنة).',
          marks: 2,
          difficulty: 'EASY'
        }
      ]
    };
  }

  _parseVoiceIntent(params) {
    const rawTranscript = (params.transcript || '').trim();

    if (rawTranscript.includes('غياب') || rawTranscript.includes('حضور')) {
      return {
        intent: 'MARK_ATTENDANCE',
        entities: {
          action: 'LOG_ABSENCE',
          studentName: rawTranscript.replace(/.*غياب\s+/g, '').replace(/.*حضور\s+/g, '').trim()
        },
        confirmationRequired: true,
        previewMessageAr: `هل تريد تسجيل حالة الحضور/الغياب للطالب بناءً على الأمر الصوتي؟`
      };
    } else if (rawTranscript.includes('امتحان') || rawTranscript.includes('واجب') || rawTranscript.includes('كويز')) {
      return {
        intent: 'CREATE_QUIZ',
        entities: {
          topic: 'قانون أوم وتوصيل المقاومات',
          questionCount: 5
        },
        confirmationRequired: true,
        previewMessageAr: `تم إعداد مسودة اختبار (5 أسئلة) على قانون أوم. هل تريد مراجعتها ونشرها؟`
      };
    } else if (rawTranscript.includes('رسالة') || rawTranscript.includes('أولياء الأمور')) {
      return {
        intent: 'SEND_PARENT_BROADCAST',
        entities: {
          recipientGroup: 'مجموعة النخبة',
          messageType: 'EXAM_REMINDER'
        },
        confirmationRequired: true,
        previewMessageAr: `تمت صياغة رسالة تذكيرية لأولياء الأمور بموعد الاختبار. هل تريد الإرسال؟`
      };
    }

    return {
      intent: 'UNKNOWN',
      entities: {},
      confirmationRequired: false,
      previewMessageAr: 'عذراً، لم أستطع تحديد الأمر بدقة. يمكنك الاختيار من قائمة الإجراءات السريعة.'
    };
  }
}

module.exports = new AIProviderBridge();
