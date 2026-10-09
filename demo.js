/* ==========================================================================
   TEACHER OS — DEMO CONTROLLER & 1-CLICK INSTANT LOGIN WITH DEFAULT DATA
   ========================================================================== */

// 1. Ensure Default Demo Users Exist in Storage
function ensureDefaultDemoUsersExist() {
  try {
    let teachers = [];
    try {
      const raw = localStorage.getItem('teacher_os_registered_teachers');
      if (raw) teachers = JSON.parse(raw);
    } catch(e) {}

    if (!teachers.some(t => t.phone === '01011112222')) {
      teachers.push({
        id: 't-demo-master',
        full_name: 'أستاذ / طارق الشناوي',
        subject: 'الفيزياء للثانوية العامة',
        phone: '01011112222',
        secret: '1234',
        academy: 'أكاديمية النخبة التعليمية',
        created_at: new Date().toISOString()
      });
      localStorage.setItem('teacher_os_registered_teachers', JSON.stringify(teachers));
    }

    let users = [];
    try {
      const raw = localStorage.getItem('teacher_os_registered_users');
      if (raw) users = JSON.parse(raw);
    } catch(e) {}

    if (!users.some(u => u.phone === '01012345678')) {
      users.push({
        id: 'usr-student-demo',
        role: 'STUDENT',
        full_name: 'أحمد محمود رضوان',
        phone: '01012345678',
        password: 'password123',
        grade_level: 'GRADE_12_SEC3',
        academic_code: 'STU-102931',
        pairing_pin: 'LNK-1029',
        photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        created_at: new Date().toISOString()
      });
    }

    if (!users.some(u => u.phone === '01033334444')) {
      users.push({
        id: 'usr-parent-demo',
        role: 'PARENT',
        full_name: 'إبراهيم علي (ولي أمر سلمى)',
        phone: '01033334444',
        password: 'parent123',
        grade_level: 'GRADE_12_SEC3',
        pairing_pin: 'LNK-2045',
        created_at: new Date().toISOString()
      });
    }

    localStorage.setItem('teacher_os_registered_users', JSON.stringify(users));
  } catch(e) {
    console.error('Error seeding demo users:', e);
  }
}

// 2. Instant 1-Click Login Function
function instantDemoLogin(role) {
  ensureDefaultDemoUsersExist();
  try { if (typeof loadLivePortfolioData === 'function') loadLivePortfolioData(); } catch(e) {}

  // Hide modals if open
  if (typeof closeSheet === 'function') {
    closeSheet('modal-teacher-auth');
    closeSheet('modal-student-parent-auth');
  }

  if (role === 'TEACHER') {
    localStorage.setItem('active_user_session', JSON.stringify({ role: 'TEACHER', name: 'أستاذ / طارق الشناوي', phone: '01011112222', isMasterAdmin: true }));
    sessionStorage.setItem('teacher_os_active_session', JSON.stringify({ role: 'TEACHER', name: 'أستاذ / طارق الشناوي' }));
    document.body.classList.add('teacher-logged-in');
    if (typeof updateTeacherFloatingEditBtn === 'function') updateTeacherFloatingEditBtn();
    if (typeof showMainView === 'function') showMainView('app');
    if (typeof state !== 'undefined') state.currentRole = 'teacher';
    if (typeof switchPortal === 'function') switchPortal('teacher');
    if (typeof switchTeacherTab === 'function') switchTeacherTab('tab-copilot');
    updateDockActiveButton('teacher');
    showDemoToast('👨‍🏫 تم فتح لوحة تحكم المعلم والمدير بنجاح!');

  } else if (role === 'STUDENT') {
    localStorage.setItem('active_user_session', JSON.stringify({ role: 'STUDENT', name: 'أحمد محمود رضوان', phone: '01012345678' }));
    sessionStorage.removeItem('teacher_os_active_session');
    document.body.classList.remove('teacher-logged-in', 'teacher-live-edit-active', 'live-editing-enabled');
    if (typeof enableLiveEditingMode === 'function') enableLiveEditingMode(false);
    if (typeof updateTeacherFloatingEditBtn === 'function') updateTeacherFloatingEditBtn();
    if (typeof showMainView === 'function') showMainView('app');
    if (typeof state !== 'undefined') state.currentRole = 'student';
    if (typeof switchPortal === 'function') switchPortal('student');

    const greetingEl = document.getElementById('student-greeting-name');
    if (greetingEl) greetingEl.textContent = 'أهلاً بك يا أحمد محمود! ⚡';
    const codeEl = document.getElementById('student-code-badge');
    if (codeEl) codeEl.textContent = 'كود: STU-102931';
    const pinEl = document.getElementById('student-pairing-pin-display');
    if (pinEl) pinEl.textContent = 'LNK-1029';

    updateDockActiveButton('student');
    showDemoToast('🎓 تم فتح بوابة الطالب الذكية (أحمد محمود — 3ث)!');

  } else if (role === 'PARENT') {
    localStorage.setItem('active_user_session', JSON.stringify({ role: 'PARENT', name: 'إبراهيم علي', phone: '01033334444' }));
    sessionStorage.removeItem('teacher_os_active_session');
    document.body.classList.remove('teacher-logged-in', 'teacher-live-edit-active', 'live-editing-enabled');
    if (typeof enableLiveEditingMode === 'function') enableLiveEditingMode(false);
    if (typeof updateTeacherFloatingEditBtn === 'function') updateTeacherFloatingEditBtn();
    if (typeof showMainView === 'function') showMainView('app');
    if (typeof state !== 'undefined') state.currentRole = 'parent';
    if (typeof switchPortal === 'function') switchPortal('parent');

    // Unlock parent dashboard for demo
    const lockBanner = document.getElementById('parent-linking-box');
    const dash = document.getElementById('parent-child-dashboard');
    if (lockBanner) lockBanner.style.display = 'none';
    if (dash) dash.style.display = 'block';

    updateDockActiveButton('parent');
    showDemoToast('👨‍👩‍👧 تم فتح بوابة ولي الأمر الموثقة (والد سلمى)!');
  }
}

function updateDockActiveButton(role) {
  document.querySelectorAll('.demo-role-btn').forEach(btn => btn.classList.remove('active'));
  const targetBtn = document.getElementById('demo-btn-' + role);
  if (targetBtn) targetBtn.classList.add('active');
}

function switchToDemoRole(role) {
  if (role === 'pitch') {
    if (typeof enableLiveEditingMode === 'function') enableLiveEditingMode(false);
    if (typeof showMainView === 'function') showMainView('pitch');
    updateDockActiveButton('pitch');
    showDemoToast('💡 تم فتح صفحة نقاط القوة البيعية وأبواب الربح للمنصة!');
  } else if (role === 'portfolio') {
    if (typeof showMainView === 'function') showMainView('portfolio');
    updateDockActiveButton('portfolio');
    showDemoToast('🌐 تم فتح البورتفوليو التسويقي والمتجر الرقمي!');
  } else if (role === 'teacher') {
    instantDemoLogin('TEACHER');
  } else if (role === 'student') {
    instantDemoLogin('STUDENT');
  } else if (role === 'parent') {
    instantDemoLogin('PARENT');
  }
}

function prefillDemoInputs() {
  const teacherPhone = document.getElementById('teacher-login-phone');
  const teacherPin = document.getElementById('teacher-login-pin');
  if (teacherPhone && !teacherPhone.value) teacherPhone.value = '01011112222';
  if (teacherPin && !teacherPin.value) teacherPin.value = '1234';

  const spPhone = document.getElementById('sp-login-phone');
  const spPass = document.getElementById('sp-login-password');
  if (spPhone && !spPhone.value) spPhone.value = '01012345678';
  if (spPass && !spPass.value) spPass.value = 'password123';
}

function showDemoToast(msg) {
  let toast = document.getElementById('demo-instant-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'demo-instant-toast';
    toast.style.position = 'fixed';
    toast.style.top = '12px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.zIndex = '999999';
    toast.style.background = 'rgba(15, 23, 42, 0.95)';
    toast.style.color = '#34D399';
    toast.style.border = '1.5px solid #10B981';
    toast.style.padding = '8px 18px';
    toast.style.borderRadius = '30px';
    toast.style.fontWeight = '800';
    toast.style.fontSize = '0.84rem';
    toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.6)';
    toast.style.transition = 'all 0.3s ease';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.display = 'block';
  toast.style.opacity = '1';

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => { toast.style.display = 'none'; }, 300);
  }, 2200);
}

function openSalesPitchModal() {
  switchToDemoRole('pitch');
    if (typeof updateProfitCalc === 'function') updateProfitCalc();
}

function resetDemoState() {
  if (!confirm('هل تريد إعادة تعيين كافة البيانات التجريبية لحالتها الافتراضية المثالية؟')) return;

  try {
    localStorage.removeItem('teacher_os_attendance_records');
    localStorage.removeItem('teacher_os_evaluations');
    localStorage.removeItem('teacher_os_digital_products');
  } catch(e) {}

  location.reload();
}

// Bind globally to window
window.instantDemoLogin = instantDemoLogin;
window.switchToDemoRole = switchToDemoRole;
window.openSalesPitchModal = openSalesPitchModal;
window.resetDemoState = resetDemoState;
window.showDemoToast = showDemoToast;
if (typeof copyToClipboard !== 'undefined') window.copyToClipboard = copyToClipboard;
if (typeof openWatermarkDemoModal !== 'undefined') window.openWatermarkDemoModal = openWatermarkDemoModal;
if (typeof openFawryPaymentModal !== 'undefined') window.openFawryPaymentModal = openFawryPaymentModal;
if (typeof dispatchWhatsAppExamResults !== 'undefined') window.dispatchWhatsAppExamResults = dispatchWhatsAppExamResults;
if (typeof dispatchWhatsAppAbsenceAlert !== 'undefined') window.dispatchWhatsAppAbsenceAlert = dispatchWhatsAppAbsenceAlert;
if (typeof openFastQrScannerModal !== 'undefined') window.openFastQrScannerModal = openFastQrScannerModal;
if (typeof openHallOfFameModal !== 'undefined') window.openHallOfFameModal = openHallOfFameModal;
if (typeof openMultiCenterLedgerModal !== 'undefined') window.openMultiCenterLedgerModal = openMultiCenterLedgerModal;

// Auto boot into demo mode on load
document.addEventListener('DOMContentLoaded', () => {
  ensureDefaultDemoUsersExist();

  setTimeout(() => {
    prefillDemoInputs();

    try {
      if (typeof ensureStudentsHavePhotosAndDetails === 'function') ensureStudentsHavePhotosAndDetails();
      if (typeof renderMobileStudentsList === 'function') renderMobileStudentsList();
      if (typeof renderAttendanceRoster === 'function') renderAttendanceRoster();
      if (typeof renderPortfolioDigitalStore === 'function') renderPortfolioDigitalStore();
      if (typeof renderCMSDigitalProducts === 'function') renderCMSDigitalProducts();
    } catch(e) {
      console.warn('Render error:', e);
    }

    // Default to teacher view for first impression
    switchToDemoRole('pitch');
  }, 250);
});



// Interactive Profit Calculator
function updateProfitCalc() {
  const studentsRange = document.getElementById('calc-range-students');
  const feeRange = document.getElementById('calc-range-fee');
  const booksRange = document.getElementById('calc-range-books');

  const students = studentsRange ? parseInt(studentsRange.value, 10) : 300;
  const fee = feeRange ? parseInt(feeRange.value, 10) : 250;
  const books = booksRange ? parseInt(booksRange.value, 10) : 150;

  const valStudentsEl = document.getElementById('calc-val-students');
  const valFeeEl = document.getElementById('calc-val-fee');
  const valBooksEl = document.getElementById('calc-val-books');

  if (valStudentsEl) valStudentsEl.textContent = students + ' طالب';
  if (valFeeEl) valFeeEl.textContent = fee + ' ج.م';
  if (valBooksEl) valBooksEl.textContent = books + ' نسخة (بـ 60 ج.م)';

  // Monthly Subscriptions Revenue
  const subRevenue = students * fee;
  // Digital Products Revenue
  const bookRevenue = books * 60;
  // Total Monthly
  const totalMonthly = subRevenue + bookRevenue;
  // 20% platform cut that would have been lost on other platforms
  const savedCut = Math.round(totalMonthly * 0.20);
  // Annual Revenue (12 months)
  const totalAnnual = totalMonthly * 12;

  const resMonthlyEl = document.getElementById('calc-res-monthly');
  const resSavedEl = document.getElementById('calc-res-saved');
  const resAnnualEl = document.getElementById('calc-res-annual');

  if (resMonthlyEl) resMonthlyEl.textContent = totalMonthly.toLocaleString('en-US') + ' ج.م';
  if (resSavedEl) resSavedEl.textContent = savedCut.toLocaleString('en-US') + ' ج.م شهرياً';
  if (resAnnualEl) resAnnualEl.textContent = totalAnnual.toLocaleString('en-US') + ' ج.م';
}

window.updateProfitCalc = updateProfitCalc;
