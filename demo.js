/* ==========================================================================
   TEACHER OS — DEMO CONTROLLER & 1-CLICK INSTANT LOGIN WITH DEFAULT DATA
   ========================================================================== */

// 1. Ensure Default Demo Users Exist in Storage
function ensureDefaultDemoUsersExist() {
  try {
    // Registered Teachers
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

    // Registered Students and Parents
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

  if (role === 'TEACHER') {
    // Fill Teacher inputs
    const phoneInput = document.getElementById('teacher-login-phone');
    const pinInput = document.getElementById('teacher-login-pin');
    if (phoneInput) phoneInput.value = '01011112222';
    if (pinInput) pinInput.value = '1234';

    // Close Modal
    closeSheet('modal-teacher-auth');

    // Switch to teacher portal
    state.currentRole = 'teacher';
    showPortalView('portal-teacher');
    switchTeacherTab('tab-copilot');

    // Update Dock
    updateDockActiveButton('teacher');

    showDemoToast('✅ تم تسجيل الدخول الفوري كمعلم ومدير (أ/ طارق الشناوي)!');

  } else if (role === 'STUDENT') {
    // Fill Student inputs
    const phoneInput = document.getElementById('sp-login-phone');
    const passInput = document.getElementById('sp-login-password');
    if (phoneInput) phoneInput.value = '01012345678';
    if (passInput) passInput.value = 'password123';

    // Close Modal
    closeSheet('modal-student-parent-auth');

    // Switch to student portal
    state.currentRole = 'student';
    showPortalView('portal-student');
    const greetingEl = document.getElementById('student-greeting-name');
    if (greetingEl) greetingEl.textContent = 'أهلاً بك يا أحمد محمود! ⚡';
    const codeEl = document.getElementById('student-code-badge');
    if (codeEl) codeEl.textContent = 'كود: STU-102931';
    const pinEl = document.getElementById('student-pairing-pin-display');
    if (pinEl) pinEl.textContent = 'LNK-1029';

    // Update Dock
    updateDockActiveButton('student');

    showDemoToast('✅ تم تسجيل الدخول الفوري كطالب (أحمد محمود — 3ث)!');

  } else if (role === 'PARENT') {
    // Fill Parent inputs
    const phoneInput = document.getElementById('sp-login-phone');
    const passInput = document.getElementById('sp-login-password');
    if (phoneInput) phoneInput.value = '01033334444';
    if (passInput) passInput.value = 'parent123';

    // Close Modal
    closeSheet('modal-student-parent-auth');

    // Switch to parent portal
    state.currentRole = 'parent';
    showPortalView('portal-parent');

    // Unlock parent dashboard for demo
    const lockBanner = document.getElementById('parent-linking-box');
    const dash = document.getElementById('parent-child-dashboard');
    if (lockBanner) lockBanner.style.display = 'none';
    if (dash) dash.style.display = 'block';

    // Update Dock
    updateDockActiveButton('parent');

    showDemoToast('✅ تم تسجيل الدخول الفوري كولي أمر موثق (والد سلمى)!');
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
    updateDockActiveButton('portfolio');
    document.querySelectorAll('.portal-view').forEach(p => p.classList.remove('active'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showDemoToast('🌐 استعراض البورتفوليو التسويقي والمتجر الرقمي!');
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
    toast.style.top = '60px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.zIndex = '999999';
    toast.style.background = 'rgba(15, 23, 42, 0.95)';
    toast.style.color = '#34D399';
    toast.style.border = '1.5px solid #10B981';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '30px';
    toast.style.fontWeight = '800';
    toast.style.fontSize = '0.86rem';
    toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
    toast.style.transition = 'all 0.3s ease';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.display = 'block';
  toast.style.opacity = '1';

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => { toast.style.display = 'none'; }, 300);
  }, 2500);
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

// Auto boot into demo mode on load
document.addEventListener('DOMContentLoaded', () => {
  ensureDefaultDemoUsersExist();

  setTimeout(() => {
    prefillDemoInputs();

    if (typeof ensureStudentsHavePhotosAndDetails === 'function') {
      ensureStudentsHavePhotosAndDetails();
    }
    if (typeof renderMobileStudentsList === 'function') {
      renderMobileStudentsList();
    }
    if (typeof renderAttendanceRoster === 'function') {
      renderAttendanceRoster();
    }
    if (typeof renderPortfolioDigitalStore === 'function') {
      renderPortfolioDigitalStore();
    }
    if (typeof renderCMSDigitalProducts === 'function') {
      renderCMSDigitalProducts();
    }

    // Default to teacher view for first impression
    switchToDemoRole('teacher');
  }, 350);
});
