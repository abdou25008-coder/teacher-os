/**
 * ============================================================================
 * TEACHER OS — Test Suite: AI Presenter Video Studio & Video Capsule Engine
 * (Lanshu Presenter Video Architecture Integration)
 * ============================================================================
 */

const assert = require('assert');

// Mock localStorage and basic window environment for Node.js
const mockStorage = {};
global.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = String(v); },
  removeItem: (k) => { delete mockStorage[k]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

const PresenterVideoEngine = require('../presenter-video-engine.js');

async function runTests() {
  console.log('🚀 [TEST 15] Running AI Presenter Video Studio & Capsule Engine Test Suite...');

  // 1. Verify Default Video Capsules (Lanshu Seed)
  console.log('  Testing Default Video Capsules loading...');
  const capsules = PresenterVideoEngine.getVideoCapsules();
  assert.ok(Array.isArray(capsules), 'Capsules should be an array');
  assert.ok(capsules.length >= 4, `Expected at least 4 default capsules, got ${capsules.length}`);

  const lenzCapsule = capsules.find(c => c.id === 'capsule-lenz-rule');
  assert.ok(lenzCapsule, 'Lenz rule capsule must exist');
  assert.strictEqual(lenzCapsule.aspect, '9:16', 'Lenz rule should be 9:16 Shorts format');
  assert.ok(lenzCapsule.formula.includes('e.m.f'), 'Formula check');
  assert.ok(lenzCapsule.script.length > 20, 'Script check');
  assert.ok(lenzCapsule.target_audiences.includes('students'), 'Audience check');
  console.log(`    ✅ Default video capsules verified (${capsules.length} preloaded)`);

  // 2. AI Script & Beat Sheet Generator
  console.log('  Testing AI Script & Beat Sheet Generator...');
  
  // Test Faraday/Lenz physics topic
  const faradayScript = PresenterVideoEngine.generatePresenterScript('قاعدة لينز وظاهرة الحث');
  assert.ok(faradayScript.title.includes('لينز') || faradayScript.title.includes('الحث'), 'Title check');
  assert.ok(faradayScript.hook.length > 10, 'Hook check');
  assert.ok(Array.isArray(faradayScript.beats) && faradayScript.beats.length >= 3, 'Beats check');
  assert.ok(faradayScript.formula.includes('ΔΦ'), 'Formula check');
  assert.ok(faradayScript.fullScript.includes('المغناطيس'), 'Full script check');

  // Test Kirchhoff physics topic
  const kirchhoffScript = PresenterVideoEngine.generatePresenterScript('قوانين كيرشوف والمسارات المغلقة');
  assert.ok(kirchhoffScript.title.includes('كيرشوف'), 'Kirchhoff title check');
  assert.ok(kirchhoffScript.formula.includes('Σ I'), 'Kirchhoff formula check');

  // Test Parent briefing topic
  const parentScript = PresenterVideoEngine.generatePresenterScript('تقرير ولي الأمر الأسبوعي');
  assert.ok(parentScript.title.includes('ولي الأمر'), 'Parent briefing title check');
  assert.ok(parentScript.fullScript.includes('أولياء أمور'), 'Parent greeting check');
  console.log('    ✅ AI Script generator produces structured title, hook, beats, formula, and narration');

  // 3. Capsules CRUD & Multi-Audience Publishing
  console.log('  Testing Capsules CRUD & Multi-Audience Publishing...');
  const newCustomCapsule = {
    id: 'capsule-ac-resonance-custom',
    title: 'كبسولة دائرة الرنين وحالة التردد الحرج',
    topic: 'الفيزياء — دوائر التيار المتردد',
    aspect: '9:16',
    durationSec: 45,
    presenter_image: 'assets/teacher_tarek_portrait.jpg',
    presenter_name: 'أ/ طارق الشناوي',
    theme: 'cyber_studio',
    formula: 'f_0 = 1 / (2π √(L·C))',
    badge: 'دوائر التيار المتردد',
    script: 'في دائرة الرنين تكون المفاعلة الحثية مساوية للمفاعلة السعوية وتكون المعاوقة أقل ما يمكن وتساوي المقاومة الأومية فقط!',
    target_audiences: ['students', 'parents'],
    publishedAt: new Date().toISOString()
  };

  capsules.unshift(newCustomCapsule);
  PresenterVideoEngine.saveVideoCapsules(capsules);

  const reloadedCapsules = PresenterVideoEngine.getVideoCapsules();
  assert.strictEqual(reloadedCapsules.length, capsules.length, 'Persisted length check');
  const found = reloadedCapsules.find(c => c.id === 'capsule-ac-resonance-custom');
  assert.ok(found, 'New custom capsule must be found in storage');
  assert.strictEqual(found.formula, 'f_0 = 1 / (2π √(L·C))');

  // Audience filtering verification
  const studentView = reloadedCapsules.filter(c => !c.target_audiences || c.target_audiences.includes('students'));
  const parentView = reloadedCapsules.filter(c => !c.target_audiences || c.target_audiences.includes('parents'));
  assert.ok(studentView.some(c => c.id === 'capsule-ac-resonance-custom'), 'Must appear in student feed');
  assert.ok(parentView.some(c => c.id === 'capsule-ac-resonance-custom'), 'Must appear in parent feed');
  console.log('    ✅ CRUD and multi-audience publishing verified');

  // 4. Compositor & Animation State Engine
  console.log('  Testing Presenter Video Compositor mock instantiation & controls...');
  
  // Mock HTML5 Canvas & 2D Context
  const mockCanvas = {
    width: 0,
    height: 0,
    getContext: () => ({
      fillRect: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      fill: () => {},
      arc: () => {},
      ellipse: () => {},
      quadraticCurveTo: () => {},
      closePath: () => {},
      save: () => {},
      restore: () => {},
      clip: () => {},
      drawImage: () => {},
      fillText: () => {},
      strokeRect: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} }),
      measureText: (txt) => ({ width: txt.length * 8 })
    })
  };

  const compositor = new PresenterVideoEngine.PresenterVideoCompositor(mockCanvas, {
    aspect: '9:16',
    theme: 'dark_lab',
    durationSec: 45,
    title: newCustomCapsule.title,
    formula: newCustomCapsule.formula,
    script: newCustomCapsule.script
  });

  assert.strictEqual(mockCanvas.width, 540, 'Portrait 9:16 width check');
  assert.strictEqual(mockCanvas.height, 960, 'Portrait 9:16 height check');

  // Switch to 16:9 Landscape
  compositor.setAspect('16:9');
  assert.strictEqual(mockCanvas.width, 960, 'Landscape 16:9 width check');
  assert.strictEqual(mockCanvas.height, 540, 'Landscape 16:9 height check');

  // Change theme
  compositor.setTheme('chalkboard');
  assert.strictEqual(compositor.theme, 'chalkboard');

  // Seek
  compositor.seek(15);
  assert.strictEqual(compositor.currentTime, 15);
  console.log('    ✅ Compositor dimensions, aspects (9:16 & 16:9), themes, and seeking verified');

  console.log('\n================================================================');
  console.log('🎉 [TEST 15 PASSED] AI PRESENTER VIDEO STUDIO FULLY VERIFIED!');
  console.log('================================================================\n');
}

runTests().catch(err => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
