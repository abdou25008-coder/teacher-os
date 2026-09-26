/* ==========================================================================
   TEACHER OS — DEMO CONTROLLER & 1-CLICK ROLE SWITCHER
   ========================================================================== */

function switchToDemoRole(role) {
  // Update dock buttons
  document.querySelectorAll('.demo-role-btn').forEach(btn => btn.classList.remove('active'));
  const targetBtn = document.getElementById('demo-btn-' + role);
  if (targetBtn) targetBtn.classList.add('active');

  if (role === 'teacher') {
    state.currentRole = 'teacher';
    showPortalView('portal-teacher');
    switchTeacherTab('tab-copilot');
  } else if (role === 'student') {
    state.currentRole = 'student';
    showPortalView('portal-student');
    const greetingEl = document.getElementById('student-greeting-name');
    if (greetingEl) greetingEl.textContent = 'أهلاً بك يا أحمد محمود! ⚡';
    const codeEl = document.getElementById('student-code-badge');
    if (codeEl) codeEl.textContent = 'كود: STU-102931';
    const pinEl = document.getElementById('student-pairing-pin-display');
    if (pinEl) pinEl.textContent = 'LNK-1029';
  } else if (role === 'parent') {
    state.currentRole = 'parent';
    showPortalView('portal-parent');
    // Ensure parent view is un-locked for demo
    const lockBanner = document.getElementById('parent-linking-box');
    const dash = document.getElementById('parent-child-dashboard');
    if (lockBanner) lockBanner.style.display = 'none';
    if (dash) dash.style.display = 'block';
  } else if (role === 'portfolio') {
    // Show public portfolio landing view
    document.querySelectorAll('.portal-view').forEach(p => p.classList.remove('active'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
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
  setTimeout(() => {
    // Pre-populate students & products if missing
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
  }, 400);
});
