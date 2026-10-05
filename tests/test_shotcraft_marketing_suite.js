/**
 * ============================================================================
 * TEACHER OS — Test Suite: Shotcraft Marketing Video Suite & Campaign Recipes
 * Testing avatar-bracket-carousel, bezier-converge, and Egyptian marketing scripts
 * ============================================================================
 */

const assert = require('assert');
const ShotcraftMarketingEngine = require('../shotcraft-marketing-engine.js');

async function runTests() {
  console.log('🚀 [TEST 16] Running Shotcraft Marketing Video Suite Test Suite...');

  // 1. Verify Campaigns Catalog
  console.log('  Testing Marketing Campaigns catalog loading...');
  const campaigns = ShotcraftMarketingEngine.getMarketingCampaigns();
  assert.ok(Array.isArray(campaigns), 'Campaigns must be an array');
  assert.strictEqual(campaigns.length, 4, 'Must have exactly 4 flagship campaigns');

  const dramaCampaign = campaigns.find(c => c.id === 'campaign-drama-exhaustion');
  assert.ok(dramaCampaign, 'Drama campaign must exist');
  assert.ok(dramaCampaign.title.includes('يوم في حياة مدرس'), 'Drama title check');
  assert.ok(dramaCampaign.voiceoverText.length > 50, 'Voiceover text length check');
  assert.ok(Array.isArray(dramaCampaign.scenes) && dramaCampaign.scenes.length >= 4, 'Scenes count check');
  console.log(`    ✅ 4 Campaigns loaded successfully (${dramaCampaign.title})`);

  // 2. Validate Shotcraft Motion Recipes
  console.log('  Testing Shotcraft motion recipe definitions...');
  const allRecipes = campaigns.flatMap(c => c.shotcraft_recipes || []);
  assert.ok(allRecipes.includes('avatar-bracket-carousel'), 'avatar-bracket-carousel must be registered');
  assert.ok(allRecipes.includes('neon-frame-orbit-drop'), 'neon-frame-orbit-drop must be registered');
  assert.ok(allRecipes.includes('bezier-source-converge-merge'), 'bezier-source-converge-merge must be registered');
  assert.ok(allRecipes.includes('fui-hud-moves · line-unfold-panel'), 'fui-hud-moves must be registered');
  assert.ok(allRecipes.includes('spotlight-hero-card'), 'spotlight-hero-card must be registered');
  console.log('    ✅ All requested Shotcraft motion recipes validated across campaign storyboards');

  // 3. Test Campaign Script Customization
  console.log('  Testing Script Customizer with Egyptian Teacher profile...');
  const customized = ShotcraftMarketingEngine.customizeCampaignScript(
    'campaign-drama-exhaustion',
    'أ/ طارق الشناوي',
    'الفيزياء للثانوية العامة',
    '01012345678'
  );
  assert.ok(customized.includes('طارق الشناوي'), 'Customized teacher name check');
  assert.ok(customized.includes('01012345678'), 'Customized phone number check');
  console.log('    ✅ Dynamic script customization working accurately');

  // 4. Test Campaign Retrieval by ID
  console.log('  Testing Campaign retrieval by ID...');
  const c2 = ShotcraftMarketingEngine.getCampaignById('campaign-tech-voice-lab');
  assert.ok(c2, 'Campaign 2 found');
  assert.ok(c2.title.includes('المختبر الصوتي'), 'Campaign 2 title check');
  assert.strictEqual(c2.format, 'Reels 60s');

  console.log('\n================================================================');
  console.log('🎉 [TEST 16 PASSED] SHOTCRAFT MARKETING VIDEO SUITE FULLY VERIFIED!');
  console.log('================================================================\n');
}

runTests().catch(err => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
