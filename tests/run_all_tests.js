/**
 * TEACHER OS — Master Test Suite & E2E Closed-Loop Verification Runner
 */

const { spawnSync } = require('child_process');
const path = require('path');

const testFiles = [
  'test_auth_core.js',
  'test_groups_attendance.js',
  'test_ai_assessment.js',
  'test_closed_loop_insights.js',
  'test_student_parent.js',
  'test_knowledge_rag.js',
  'test_business_os.js',
  'test_ocr_twin.js',
  'test_zoom_meetings.js',
  'test_saas_tiering_billing.js',
  'test_promo_anti_abuse.js',
  'test_community_multi_teacher.js',
  'test_branding_and_secure_parent_link.js'
];

console.log('================================================================');
console.log('🚀 TEACHER OS — FULL AUTOMATED E2E & CLOSED-LOOP VERIFICATION');
console.log('================================================================\n');

let allPassed = true;
const nodeExe = process.execPath;

for (const testFile of testFiles) {
  const fullPath = path.join(__dirname, testFile);
  console.log(`▶️ Executing [${testFile}]...`);
  const result = spawnSync(nodeExe, [fullPath], { stdio: 'inherit' });
  
  if (result.status !== 0) {
    console.error(`❌ FAILED: ${testFile}`);
    allPassed = false;
    break;
  }
}

if (allPassed) {
  console.log('\n================================================================');
  console.log('🏆 ALL 13 SUITES OF TEACHER OS VERIFIED & PASSING WITH 100% SUCCESS!');
  console.log('================================================================');
  process.exit(0);
} else {
  console.error('\n❌ Some test suites failed.');
  process.exit(1);
}
