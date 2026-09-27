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

  // Hide modals if open
  if (typeof closeSheet === 'function') {
    closeSheet('modal-teacher-auth');
    closeSheet('modal-student-parent-auth');
  }

  if (role === 'TEACHER') {
    if (typeof showMainView === 'function') showMainView('app');
    if (typeof state !== 'undefined') state.currentRole = 'teacher';
    if (typeof switchPortal === 'function') switchPortal('teacher');
    if (typeof switchTeacherTab === 'function') switchTeacherTab('tab-copilot');
    updateDockActiveButton('teacher');
    showDemoToast('👨‍🏫 تم فتح لوحة تحكم المعلم والمدير بنجاح!');

  } else if (role === 'STUDENT') {
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
  if (role === 'teacher') instantDemoLogin('TEACHER');
  else if (role === 'student') instantDemoLogin('STUDENT');
  else if (role === 'parent') instantDemoLogin('PARENT');
  else if (role === 'portfolio') {
    if (typeof showMainView === 'function') showMainView('portfolio');
    updateDockActiveButton('portfolio');
    showDemoToast('🌐 تم فتح البورتفوليو التسويقي والمتجر الرقمي!');
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
  const modal = document.getElementById('modal-sales-pitch');
  if (modal) modal.classList.add('active');
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
    switchToDemoRole('teacher');
  }, 250);
});
