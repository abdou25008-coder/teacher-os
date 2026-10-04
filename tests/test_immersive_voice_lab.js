/**
 * ============================================================================
 * TEACHER OS — Test Suite: Immersive Curriculum Live AI Voice & Socratic Lab
 * (Zack Akil / Immergo Live API Inspired Integration)
 * ============================================================================
 */

const assert = require('assert');

// Mock localStorage for Node.js test environment
const mockStorage = {};
global.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = String(v); },
  removeItem: (k) => { delete mockStorage[k]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

const ImmersiveVoiceLab = require('../voice-lab-engine.js');

async function runTests() {
  console.log('🚀 [TEST 14] Running Immersive Voice & Socratic Lab Test Suite...');

  // 1. Verify Default Curriculum Missions
  console.log('  Testing Default Curriculum Missions loading...');
  const missions = ImmersiveVoiceLab.getMissions();
  assert.ok(Array.isArray(missions), 'Missions should be an array');
  assert.ok(missions.length >= 4, `Expected at least 4 default missions, got ${missions.length}`);

  const kirchhoff = missions.find(m => m.id === 'msn-kirchhoff-01');
  assert.ok(kirchhoff, 'Kirchhoff mission must exist');
  assert.ok(kirchhoff.title.includes('كيرشوف'), 'Kirchhoff title check');
  assert.ok(Array.isArray(kirchhoff.required_concepts), 'Required concepts must be an array');
  assert.ok(kirchhoff.starter_prompt.length > 10, 'Starter prompt must be defined');
  console.log(`    ✅ Default missions loaded successfully (${missions.length} missions active)`);

  // 2. Teacher Lab Customization (CRUD & Config Persistence)
  console.log('  Testing Teacher Customization & Missions CRUD...');
  const newMission = {
    id: 'msn-ac-dynamo-test',
    title: 'تحدي المولد الكهربي (الدينامو) وقاعدة فيلمنج لليد اليمنى',
    subject: 'الفيزياء — الفصل الثالث',
    grade_level: 'الصف الثالث الثانوي',
    difficulty: 'متقدم',
    difficulty_level: 'Hard',
    concept: 'توليد القوة الدافعة الكهربية المترددة وحساب القيمة الفعالة',
    desc: 'مناقشة صوتية حية حول وضع الصفر وزاوية الطور.',
    system_instructions: 'اسأل الطالب متى تنعدم القوة الدافعة الكهربية المستحثة في ملف الدينامو.',
    starter_prompt: 'أهلاً بك في معمل المولدات الكهربية! متى تكون e.m.f اللحظية مساوية للصفر؟',
    required_concepts: ['الوضع الرأسي', 'الفيض نهاية عظمى', 'معدل القطع صفر', 'القيمة الفعالة']
  };

  missions.push(newMission);
  ImmersiveVoiceLab.saveMissions(missions);

  const updatedMissions = ImmersiveVoiceLab.getMissions();
  assert.strictEqual(updatedMissions.length, missions.length, 'New mission should persist');
  assert.ok(updatedMissions.some(m => m.id === 'msn-ac-dynamo-test'), 'Persisted mission found');

  // Teacher lab config update
  const config = ImmersiveVoiceLab.getTeacherLabConfig();
  config.parent_advisor_rules.weekly_focus = 'التركيز على حل مسائل دوائر الرنين والمفاعلة السعوية.';
  ImmersiveVoiceLab.saveTeacherLabConfig(config);

  const reloadedConfig = ImmersiveVoiceLab.getTeacherLabConfig();
  assert.strictEqual(reloadedConfig.parent_advisor_rules.weekly_focus, 'التركيز على حل مسائل دوائر الرنين والمفاعلة السعوية.');
  console.log('    ✅ Teacher customization and missions CRUD verified successfully');

  // 3. Socratic Dialogue Engine in Different Modes
  console.log('  Testing Socratic Dialogue Engine (Socratic, Teacher, Exam modes)...');
  const mockMission = kirchhoff;

  // Mode 1: Socratic (guides with questions)
  const socraticRes = ImmersiveVoiceLab.generateSocraticResponse(
    'أنا محتار كيف أبدأ في حل المسار المغلق للبطاريات',
    mockMission,
    'socratic',
    []
  );
  assert.ok(socraticRes && socraticRes.reply && socraticRes.reply.length > 15, 'Socratic response should not be empty');
  assert.ok(socraticRes.reply.includes('?') || socraticRes.reply.includes('؟'), 'Socratic mode must ask question');

  // Mode 2: Teacher (gives structured explanation)
  const teacherRes = ImmersiveVoiceLab.generateSocraticResponse(
    'اشرح لي كيف نطبق قانون كيرشوف الثاني',
    mockMission,
    'teacher',
    []
  );
  assert.ok(teacherRes && teacherRes.reply && teacherRes.reply.length > 20, 'Teacher mode response should be comprehensive');

  // Mode 3: Exam (grades rigor and asks ministerial follow-up)
  const examRes = ImmersiveVoiceLab.generateSocraticResponse(
    'مجموع فروق الجهد في أي مسار مغلق يساوي صفر وفق قانون حفظ الطاقة',
    mockMission,
    'exam',
    []
  );
  assert.ok(examRes && examRes.reply && examRes.reply.length > 20, 'Exam mode response should be evaluative');
  console.log('    ✅ Dialogue modes (Socratic, Explainer, Exam) functioning correctly');

  // 4. Voice Lab Scoring & Pedagogical Evaluation
  console.log('  Testing Voice Lab Performance Evaluation & Proficiency Tiering...');
  
  // Scenario A: High Mastery (Peritus - خبير)
  const highTranscript = [
    { sender: 'ai', text: kirchhoff.starter_prompt },
    { sender: 'user', text: 'أطبق قانون كيرشوف الأول وهو حفظ الشحنة حيث مجموع التيارات الداخلة يساوي مجموع التيارات الخارجة عند نقطة العقدة.' },
    { sender: 'ai', text: 'ممتاز! وماذا عن المسار المغلق؟' },
    { sender: 'user', text: 'في المسار المغلق نطبق قانون كيرشوف الثاني وهو حفظ الطاقة حيث مجموع القوى الدافعة الكهربية يساوي مجموع فروق الجهد.' }
  ];
  const evalHigh = ImmersiveVoiceLab.evaluateMissionPerformance(kirchhoff, highTranscript);
  assert.ok(evalHigh.score >= 80, `Expected score >= 80, got ${evalHigh.score}`);
  assert.strictEqual(evalHigh.rank, 'Peritus', 'High performance should earn Peritus rank');
  assert.strictEqual(evalHigh.rankArabic, 'خبير متفوق 🥇 (Peritus)');
  assert.ok(evalHigh.feedbackPoints.length >= 2, 'Should provide positive feedback points');

  // Scenario B: Developing Student (Tiro - مبتدئ)
  const lowTranscript = [
    { sender: 'ai', text: kirchhoff.starter_prompt },
    { sender: 'user', text: 'لا أعرف بالضبط، هل أجمع المقاومات توالي أم توازي؟' }
  ];
  const evalLow = ImmersiveVoiceLab.evaluateMissionPerformance(kirchhoff, lowTranscript);
  assert.ok(evalLow.score <= 70, `Expected low score <= 70, got ${evalLow.score}`);
  assert.strictEqual(evalLow.rank, 'Tiro', 'Low performance should assign Tiro rank');
  assert.ok(evalLow.feedbackPoints.length > 0, 'Targeted feedback must be provided');
  console.log(`    ✅ Evaluation tiering verified: High (${evalHigh.score}% - ${evalHigh.rank}), Low (${evalLow.score}% - ${evalLow.rank})`);

  // 5. Parent Educational Advisor Adherence to Teacher Directives
  console.log('  Testing Parent Educational Advisor adhering to Teacher directives...');
  const studentRecords = {
    name: 'أحمد محمود',
    recent_voice_score: evalHigh.score,
    recent_voice_rank: evalHigh.rankArabic,
    recent_mission: kirchhoff.title
  };

  const parentQuery1 = 'كيف مستوى ابني في التدريب الصوتي الأخير للفيزياء؟';
  const advisorRes1 = ImmersiveVoiceLab.generateParentAdvisorResponse(parentQuery1, studentRecords, reloadedConfig);
  assert.ok(advisorRes1.includes('أحمد') || advisorRes1.includes('ابنك'), 'Response must address the student');
  assert.ok(advisorRes1.includes(String(evalHigh.score)) || advisorRes1.includes('خبير') || advisorRes1.includes('متميز'), 'Response must reflect student score or rank');

  const parentQuery2 = 'ما هو ميعاد الامتحان القادم وما نصيحة الأستاذ طارق؟';
  const advisorRes2 = ImmersiveVoiceLab.generateParentAdvisorResponse(parentQuery2, studentRecords, reloadedConfig);
  assert.ok(advisorRes2.includes('الامتحان') || advisorRes2.includes('المراجعة'), 'Response must communicate exam & study advice');
  console.log('    ✅ Parent Advisor accurately conveys student metrics and teacher rules');

  // 6. Teacher Executive Voice Copilot
  console.log('  Testing Teacher Executive Voice Copilot...');
  const examPrompt = 'ولّد لي 3 أسئلة امتحان فيزياء على قانون فاراداي وقاعدة لينز مع نموذج الإجابة';
  const copilotExam = ImmersiveVoiceLab.generateTeacherCopilotResponse(examPrompt);
  assert.ok(copilotExam.includes('Blueprint') || copilotExam.includes('سؤال') || copilotExam.includes('الإجابة'), 'Copilot exam generator check');

  const gapPrompt = 'ما هي أبرز الفجوات المعرفية والأخطاء الشائعة للطلاب في المختبر الصوتي؟';
  const copilotGap = ImmersiveVoiceLab.generateTeacherCopilotResponse(gapPrompt);
  assert.ok(copilotGap.includes('فجوات') || copilotGap.includes('الأخطاء') || copilotGap.includes('لينز'), 'Copilot gap analysis check');

  const planPrompt = 'أريد خطة درس للحصة القادمة';
  const copilotPlan = ImmersiveVoiceLab.generateTeacherCopilotResponse(planPrompt);
  assert.ok(copilotPlan.includes('خطة') || copilotPlan.includes('دقيقة'), 'Copilot lesson planner check');
  console.log('    ✅ Teacher Executive Voice Copilot responds accurately to exam, gap analysis, and lesson planning');

  console.log('\n================================================================');
  console.log('🎉 [TEST 14 PASSED] IMMERSIVE CURRICULUM VOICE LAB FULLY VERIFIED!');
  console.log('================================================================\n');
}

runTests().catch(err => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
