/**
 * Unit & Integration Test Suite for Knowledge Vault & Semantic RAG Engine
 */

const assert = require('assert');
const authService = require('../backend/src/modules/auth/auth.service');
const knowledgeService = require('../backend/src/modules/knowledge/knowledge.service');

async function runTests() {
  console.log('🧪 [Test Suite] Running Knowledge Vault & Semantic RAG Tests...');

  // 1. Setup 2 distinct Teachers to test Tenant Isolation
  const teacherA = await authService.register({
    phoneNumber: '01011223344',
    password: 'Password_2026',
    role: 'TEACHER',
    fullName: 'أ/ طارق الشناوي (مدرس فيزياء)'
  });
  const teacherAId = teacherA.profile.id;

  const teacherB = await authService.register({
    phoneNumber: '01099881177',
    password: 'Password_2026',
    role: 'TEACHER',
    fullName: 'أ/ شريف فهمي (مدرس كيمياء)'
  });
  const teacherBId = teacherB.profile.id;

  // 2. Teacher A ingests a private Physics Summary Note
  const docA = await knowledgeService.ingestDocument(teacherAId, {
    title: 'مذكرة الأستاذ طارق في الدوائر الكهربية وقانون أوم 2026',
    fileType: 'SUMMARY_NOTE',
    rawContent: `في الدوائر الكهربية، يعتبر قانون أوم الأساس الذي يربط بين فرق الجهد وشده التيار والمقاومة.
عند توصيل المقاومات على التوازي، يكون فرق الجهد متساوياً عبر جميع الأفرع، بينما يتجزأ التيار الكلي بنسبة عكسية مع قيم المقاومات.
من أهم التطبيقات الحياتية لتوصيل التوازي هو إنارة المنازل وتشغيل الأجهزة الكهربائية المنزلية بشكل مستقل تماماً، بحيث إذا تلف أحد الأجهزة لا تتأثر باقي الأجهزة في المنزل.`
  });

  assert.strictEqual(docA.status, 'INDEXED_SUCCESSFULLY');
  assert.ok(docA.chunk_count >= 1, 'Document should be chunked and indexed');
  console.log('  ✅ Document ingestion and semantic chunking passed.');

  // 3. Teacher B ingests a private Chemistry Note
  await knowledgeService.ingestDocument(teacherBId, {
    title: 'مذكرة الكيمياء العضوية والألكانات',
    fileType: 'SUMMARY_NOTE',
    rawContent: `الألكانات هي هيدروكربونات مشبعة ترتبط فيها ذرات الكربون بروابط أحادية قوية من نوع سيجما، وتتميز بخمولها الكيميائي النسبي مقارنة بالألكينات.`
  });

  // 4. Semantic Search Test & Multi-Tenant Isolation Verification
  const searchResultsA = await knowledgeService.searchVault(teacherAId, {
    query: 'توصيل المصابيح في المنازل على التوازي',
    topK: 2
  });

  assert.ok(searchResultsA.length > 0, 'Teacher A should find their own physics chunks');
  assert.ok(searchResultsA[0].similarityScore > 0.1, 'Similarity score should be positive for relevant query');
  console.log('  ✅ Cosine similarity semantic retrieval passed.');

  // 5. Strict Tenant Isolation Test: Teacher B querying physics MUST return 0 results
  const searchResultsB = await knowledgeService.searchVault(teacherBId, {
    query: 'توصيل المصابيح في المنازل على التوازي',
    topK: 2
  });
  // Since teacher B only uploaded Chemistry notes, no physics chunks belonging to Teacher A should ever leak
  const leakedChunks = searchResultsB.filter(c => c.documentTitle.includes('الفيزياء') || c.documentTitle.includes('طارق'));
  assert.strictEqual(leakedChunks.length, 0, 'ZERO data leakage: Teacher B must never see Teacher A documents');
  console.log('  ✅ Strict Multi-Tenant row-level vector isolation verified (Zero Data Leakage).');

  // 6. RAG-Powered Assessment Generation from Vault
  const ragQuiz = await knowledgeService.generateAssessmentFromVault(teacherAId, {
    queryTopic: 'توصيل التوازي والمنازل'
  });
  assert.ok(ragQuiz.sourceCitations.length > 0, 'Must include source citations');
  assert.ok(ragQuiz.questions[0].prompt.includes('مبني على ملخصك'), 'Question should reference teacher source');
  console.log('  ✅ Citation-aware RAG assessment generation passed.');

  console.log('🎉 ALL CYCLE 7 KNOWLEDGE VAULT & RAG TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
