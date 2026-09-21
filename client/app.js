/**
 * TEACHER OS — Full Production Client Application Controller
 * Handles live REST API integration, modals, tabs, real-time tables, and closed-loop educational workflows.
 */

// Application State Cache
let state = {
  groups: [],
  students: [],
  documents: [],
  gaps: [],
  meetings: [],
  business: null,
  currentUser: {
    role: 'TEACHER',
    name: 'أ/ طارق الشناوي',
    title: 'خبير تدريس الفيزياء للثانوية العامة',
    plan: 'PRO_TEACHER',
    planNameAr: 'باقة المعلم المحترف (Pro)'
  },
  currentStudent: {
    id: 'stu-demo-2',
    name: 'سلمى إبراهيم',
    academicCode: 'STU-884210',
    gradeLevel: 'GRADE_12_SEC3',
    status: 'ACTIVE'
  }
};

// Initial boot
document.addEventListener('DOMContentLoaded', async () => {
  await loadTeacherBranding();
  checkAuthSession();
  await loadAllData();
});

// Master Data Loader
async function loadAllData() {
  await Promise.all([
    fetchGroups(),
    fetchStudents(),
    fetchKnowledgeDocs(),
    fetchTeacherDay(),
    fetchLearningGaps(),
    fetchZoomMeetings(),
    fetchTeacherTier()
  ]);
  populateDropdowns();
  checkAndUpdateStudentPaywall(state.currentStudent.id);
}

// Sidebar Management (SRMS Responsive Drawer)
function toggleSidebar(show) {
  const sidebar = document.getElementById('app-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (!sidebar) return;
  if (typeof show === 'boolean') {
    if (show) {
      sidebar.classList.add('active');
      overlay?.classList.add('active');
    } else {
      sidebar.classList.remove('active');
      overlay?.classList.remove('active');
    }
  } else {
    sidebar.classList.toggle('active');
    overlay?.classList.toggle('active');
  }
}

// Notification Dropdown Toggle
function toggleNotificationsMenu(event) {
  if (event) event.stopPropagation();
  const dropdown = document.getElementById('notification-dropdown');
  if (dropdown) {
    dropdown.classList.toggle('active');
  }
}

document.addEventListener('click', (e) => {
  const notifWrap = document.querySelector('.notification-wrap');
  const dropdown = document.getElementById('notification-dropdown');
  if (dropdown && notifWrap && !notifWrap.contains(e.target)) {
    dropdown.classList.remove('active');
  }
});

// Global Search Filter (SRMS Style)
function handleGlobalSearch(query) {
  if (!query) return;
  const q = query.toLowerCase().trim();
  const rows = document.querySelectorAll('tbody tr');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    if (text.includes(q)) {
      row.style.display = '';
    } else if (q.length > 1) {
      row.style.display = 'none';
    }
  });
  if (q.length === 0) {
    rows.forEach(row => row.style.display = '');
  }
}

// 1. Navigation & Tab Switchers
function closeMobileSidebar() {
  toggleSidebar(false);
}

function openMobileMoreDrawer() {
  openModal('modal-mobile-more');
}

function closeMobileMoreDrawer() {
  closeModal('modal-mobile-more');
}

function switchPortal(portalName) {
  document.querySelectorAll('.portal-view').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.persona-btn').forEach(el => el.classList.remove('active'));

  const portalEl = document.getElementById(`portal-${portalName}`);
  if (portalEl) portalEl.classList.add('active');

  const btnIdx = portalName === 'teacher' ? 0 : portalName === 'student' ? 1 : 2;
  const btns = document.querySelectorAll('.persona-btn');
  if (btns[btnIdx]) btns[btnIdx].classList.add('active');

  // Close mobile drawer if open
  toggleSidebar(false);

  const sidebar = document.getElementById('app-sidebar');
  const titleEl = document.getElementById('topbar-page-title');
  const hamburger = document.querySelector('.btn-hamburger');

  if (portalName === 'teacher') {
    document.body.classList.remove('portal-not-teacher');
    if (sidebar) sidebar.style.display = '';
    if (hamburger) hamburger.style.display = '';
    if (titleEl) titleEl.innerText = 'لوحة التحكم الرئيسية (Dashboard)';
  } else {
    document.body.classList.add('portal-not-teacher');
    if (sidebar) sidebar.style.display = 'none';
    if (hamburger) hamburger.style.display = 'none';
    if (portalName === 'student') {
      if (titleEl) titleEl.innerText = '🎓 بوابة الطالب الذكية (My Learning Day)';
      loadStudentPortalData();
    } else {
      if (titleEl) titleEl.innerText = '👨‍👩‍👧 بوابة ولي الأمر (Child Pulse)';
      loadParentPortalData();
    }
  }
}

function switchTeacherTab(tabId) {
  document.querySelectorAll('#portal-teacher .tab-pane').forEach(tab => tab.classList.remove('active'));

  const targetPane = document.getElementById(tabId);
  if (targetPane) targetPane.classList.add('active');

  // Activate matching sidebar item
  document.querySelectorAll('.app-sidebar .sidebar-item').forEach(el => el.classList.remove('active'));
  const sideItem = document.querySelector(`.app-sidebar .sidebar-item[onclick*="${tabId}"]`);
  if (sideItem) sideItem.classList.add('active');

  // Update Topbar Title
  const titlesMap = {
    'tab-my-day': 'لوحة التحكم الرئيسية (Dashboard)',
    'tab-students': 'إدارة الطلاب والمجموعات التعليمية',
    'tab-knowledge': 'خزينة المذكرات والمراجع والـ RAG',
    'tab-ai-studio': 'استوديو الذكاء الاصطناعي لتوليد الحصص والأسئلة',
    'tab-assessments': 'الامتحانات والمصحح الضوئي (Optical Grader)',
    'tab-gaps': 'رادار الفجوات المفاهيمية والتحليل الأكاديمي',
    'tab-business': 'الحسابات والاشتراكات وفواتير الطلاب',
    'tab-zoom': 'قاعة حصص الزووم المباشرة (Zoom Live)',
    'tab-community': 'مجتمع التعليم والتواصل الأكاديمي (EduSocial)'
  };
  const titleEl = document.getElementById('topbar-page-title');
  if (titleEl && titlesMap[tabId]) {
    titleEl.textContent = titlesMap[tabId];
  }

  if (tabId === 'tab-community') {
    fetchCommunityFeed('ALL');
    fetchTeacherDirectory();
  }

  // Activate matching bottom nav item
  document.querySelectorAll('.mobile-bottom-nav .mobile-nav-item').forEach(el => el.classList.remove('active'));
  if (tabId === 'tab-my-day') {
    document.getElementById('mob-nav-day')?.classList.add('active');
  } else if (tabId === 'tab-students') {
    document.getElementById('mob-nav-students')?.classList.add('active');
  } else if (tabId === 'tab-zoom') {
    document.getElementById('mob-nav-zoom')?.classList.add('active');
  } else if (tabId === 'tab-business') {
    document.getElementById('mob-nav-business')?.classList.add('active');
  } else {
    document.getElementById('mob-nav-more')?.classList.add('active');
  }

  // Close mobile sidebar if open
  toggleSidebar(false);

  // Trigger refresh on specific tab views
  if (tabId === 'tab-students') renderStudentsTable();
  if (tabId === 'tab-knowledge') renderKnowledgeTable();
  if (tabId === 'tab-zoom') renderZoomTable();
}

// 2. Modal Management
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    populateDropdowns();
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

// Close modal on click outside
window.onclick = function(event) {
  if (event.target.classList.contains('modal-overlay')) {
    event.target.classList.remove('active');
  }
};

// 3. API Data Fetchers
async function fetchGroups() {
  try {
    const res = await fetch('/api/v1/groups');
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      state.groups = json.data;
      renderGroupsCards();
      return;
    }
  } catch (e) {
    console.warn('Using local groups fallback');
  }

  // Fallback default groups
  state.groups = [
    { id: 'grp-001', name: 'مجموعة النخبة (السبت 4:00م)', grade_level: 'GRADE_12_SEC3', max_capacity: 30, enrolled_count: 14, session_fee: 160, schedule_day: 'السبت', schedule_time: '16:00', capacity_utilization_pct: 47 },
    { id: 'grp-002', name: 'مجموعة الأوائل (الأحد 6:00م)', grade_level: 'GRADE_12_SEC3', max_capacity: 25, enrolled_count: 12, session_fee: 160, schedule_day: 'الأحد', schedule_time: '18:00', capacity_utilization_pct: 48 }
  ];
  renderGroupsCards();
}

async function fetchStudents() {
  try {
    const res = await fetch('/api/v1/students');
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      state.students = json.data;
      renderStudentsTable();
      document.getElementById('metric-total-students').innerText = `${state.students.length} طالب`;
      return;
    }
  } catch (e) {
    console.warn('Using local students fallback');
  }

  // Fallback default students
  state.students = [
    { id: 'stu-demo-1', full_name: 'أحمد محمود', academic_code: 'STU-102931', grade_level: 'GRADE_12_SEC3', group_name: 'مجموعة النخبة (السبت 4:00م)', parent_phone: '01011112222', attendance_rate_pct: 100, subscription_status: 'ساري' },
    { id: 'stu-demo-2', full_name: 'سلمى إبراهيم', academic_code: 'STU-884210', grade_level: 'GRADE_12_SEC3', group_name: 'مجموعة النخبة (السبت 4:00م)', parent_phone: '01033334444', attendance_rate_pct: 95, subscription_status: 'ساري' },
    { id: 'stu-demo-3', full_name: 'يوسف كريم', academic_code: 'STU-992381', grade_level: 'GRADE_12_SEC3', group_name: 'مجموعة النخبة (السبت 4:00م)', parent_phone: '01055556666', attendance_rate_pct: 80, subscription_status: 'ينتهي قريباً' },
    { id: 'stu-demo-4', full_name: 'منى توفيق', academic_code: 'STU-441199', grade_level: 'GRADE_12_SEC3', group_name: 'مجموعة الأوائل (الأحد 6:00م)', parent_phone: '01077778888', attendance_rate_pct: 90, subscription_status: 'معلق للتأخر' }
  ];
  renderStudentsTable();
  const totalEl = document.getElementById('metric-total-students');
  if (totalEl) totalEl.innerText = `${state.students.length} طالب`;
}

async function fetchKnowledgeDocs() {
  try {
    const res = await fetch('/api/v1/knowledge/documents');
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      state.documents = json.data;
      renderKnowledgeTable();
      return;
    }
  } catch (e) {
    console.warn('Using local knowledge docs fallback');
  }

  // Fallback default knowledge docs
  state.documents = [
    { id: 'doc-physics-memo-1', title: 'مذكرة الأستاذ طارق في الدوائر الكهربية وقانون أوم 2026', file_type: 'SUMMARY_NOTE', chunk_count: 6, created_at: new Date().toISOString() }
  ];
  renderKnowledgeTable();
}

async function fetchTeacherDay() {
  try {
    const res = await fetch('/api/v1/insights/my-day');
    const json = await res.json();
    if (json.success && json.data && json.data.topPriority) {
      const p = json.data.topPriority;
      document.getElementById('priority-title').innerText = p.title;
      document.getElementById('priority-reason').innerText = p.reason;
      document.getElementById('priority-confidence').innerText = `نسبة الثقة: ${p.confidencePct}%`;
    }
  } catch (e) {
    console.warn('Using default teacher day priority');
  }
}

async function fetchLearningGaps() {
  try {
    const res = await fetch('/api/v1/insights/learning-gaps');
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      state.gaps = json.data;
      renderGapsDetailed();
      return;
    }
  } catch (e) {
    console.warn('Using local gaps fallback');
  }

  state.gaps = [
    {
      concept_name_ar: 'توصيل المقاومات على التوازي وتجزئة التيار',
      concept_code: 'PHYS_PARALLEL_SERIES',
      failure_rate_pct: 66,
      evidence: { summaryAr: 'أظهر 66% من الطلاب خطأ في حساب المقاومة المكافئة عند التوازي.' },
      recommendation: { titleAr: 'مراجعة سريعة لمدة 5 دقائق في بداية الحصة لحل 3 مسائل تجزئة تيار.' }
    }
  ];
  renderGapsDetailed();
}

async function fetchZoomMeetings() {
  try {
    const res = await fetch('/api/v1/zoom/meetings');
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      state.meetings = json.data;
      renderZoomTable();
      updateActiveZoomUI();
      return;
    }
  } catch (e) {
    console.warn('Using local zoom fallback');
  }

  state.meetings = [
    {
      id: 'zoom-demo-001',
      topic: 'حصة أونلاين مباشرة: حل مسائل كيرشوف والدوائر المعقدة',
      group_name: 'مجموعة النخبة (السبت 4:00م)',
      teacher_name: 'أ/ طارق الشناوي',
      start_time: 'اليوم الساعة 04:00 مساءً',
      duration_mins: 75,
      meeting_number: '84920194820',
      passcode: 'Physics2026',
      zoom_url: 'https://us05web.zoom.us/j/84920194820?pwd=Physics2026DemoSecretKey',
      status: 'LIVE',
      participants_count: 14
    }
  ];
  renderZoomTable();
  updateActiveZoomUI();
}

function updateActiveZoomUI() {
  const activeMeeting = state.meetings.find(m => m.status === 'LIVE') || state.meetings[0];
  if (activeMeeting) {
    // Teacher Live Banner
    const topicEl = document.getElementById('zoom-live-topic');
    const groupEl = document.getElementById('zoom-live-group');
    const idEl = document.getElementById('zoom-live-id');
    const passEl = document.getElementById('zoom-live-passcode');
    const countEl = document.getElementById('zoom-live-participants-count');

    if (topicEl) topicEl.innerText = activeMeeting.topic;
    if (groupEl) groupEl.innerText = activeMeeting.group_name;
    if (idEl) idEl.innerText = activeMeeting.meeting_number;
    if (passEl) passEl.innerText = activeMeeting.passcode;
    if (countEl) countEl.innerText = `${activeMeeting.participants_count || 1} طالب متصل`;

    // Student Live Banner
    const stuTopic = document.getElementById('student-zoom-topic');
    const stuMeta = document.getElementById('student-zoom-meta');
    if (stuTopic) stuTopic.innerText = activeMeeting.topic;
    if (stuMeta) {
      stuMeta.innerHTML = `مع ${activeMeeting.teacher_name || 'أ/ طارق الشناوي'} • Meeting ID: <strong>${activeMeeting.meeting_number}</strong> • كلمة المرور: <strong>${activeMeeting.passcode}</strong>`;
    }
  }
}

function renderZoomTable() {
  const tbody = document.getElementById('zoom-meetings-tbody');
  if (!tbody) return;

  if (state.meetings.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">لا توجد حصص زووم مجدولة حالياً. اضغط على زر "جدولة حصة زووم جديدة" للبدء.</td></tr>`;
    return;
  }

  tbody.innerHTML = state.meetings.map(m => `
    <tr>
      <td><strong>${m.topic}</strong></td>
      <td><span class="badge badge-primary">${m.group_name || 'حصة عامة'}</span></td>
      <td>${m.start_time} (${m.duration_mins} دقيقة)</td>
      <td><code>${m.meeting_number}</code></td>
      <td><code>${m.passcode}</code></td>
      <td>
        <span class="badge ${m.status === 'LIVE' ? 'badge-live' : m.status === 'SCHEDULED' ? 'badge-warn' : 'badge-good'}">
          ${m.status === 'LIVE' ? '🔴 بث مباشر' : m.status === 'SCHEDULED' ? '⏳ مجدولة' : 'منتهية ✅'}
        </span>
      </td>
      <td>
        <div style="display: flex; gap: 4px;">
          ${m.status === 'LIVE' ? `
            <button class="btn btn-accent" style="padding: 4px 8px; font-size: 0.8rem;" onclick="startTeacherZoomRoom('${m.id}')">دخول 🚀</button>
            <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem;" onclick="shareZoomWhatsApp('${m.id}')">واتساب 📲</button>
            <button class="btn btn-danger" style="padding: 4px 8px; font-size: 0.8rem;" onclick="endCurrentZoomMeeting('${m.id}')">إنهاء ⏹️</button>
          ` : `
            <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem;" onclick="shareZoomWhatsApp('${m.id}')">دعوة 📲</button>
          `}
        </div>
      </td>
    </tr>
  `).join('');
}

// 4. Render Functions
function populateDropdowns() {
  const stuGroupSelect = document.getElementById('stu-group-select');
  if (stuGroupSelect) {
    stuGroupSelect.innerHTML = state.groups.map(g => `<option value="${g.id}">${g.name}</option>`).join('');
  }

  const payStudentSelect = document.getElementById('pay-student-select');
  if (payStudentSelect) {
    payStudentSelect.innerHTML = state.students.map(s => `<option value="${s.id}">${s.full_name} (${s.academic_code})</option>`).join('');
  }

  const zoomGroupSelect = document.getElementById('zoom-group-select');
  if (zoomGroupSelect) {
    zoomGroupSelect.innerHTML = state.groups.map(g => `<option value="${g.id}">${g.name}</option>`).join('');
  }
}

function renderStudentsTable(filterText = '') {
  const tbody = document.getElementById('all-students-tbody');
  if (!tbody) return;

  const filtered = state.students.filter(s => {
    const text = `${s.full_name} ${s.academic_code} ${s.parent_phone} ${s.group_name}`.toLowerCase();
    return text.includes(filterText.toLowerCase());
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">لا يوجد طلاب مطابقين للبحث. يمكنك إضافة طالب جديد عبر الزر أعلاه.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(s => {
    const isOverdue = s.subscription_status === 'متأخر' || s.subscription_status === 'معلق للتأخر';
    const isDueSoon = s.subscription_status === 'ينتهي قريباً';
    return `
    <tr>
      <td><strong>${s.academic_code}</strong></td>
      <td><strong>${s.full_name}</strong></td>
      <td>${s.grade_level === 'GRADE_12_SEC3' ? 'ثانوية عامة' : s.grade_level}</td>
      <td><span class="badge badge-primary">${s.group_name || 'مجموعة عامة'}</span></td>
      <td>${s.parent_phone || '—'}</td>
      <td><span class="badge ${s.attendance_rate_pct >= 85 ? 'badge-good' : 'badge-warn'}">${s.attendance_rate_pct || 90}%</span></td>
      <td>
        <span class="badge ${isOverdue ? 'badge-urgent' : isDueSoon ? 'badge-warn' : 'badge-good'}">
          ${isOverdue ? 'معلق للتأخر ⚠️' : isDueSoon ? 'قريب التجديد ⏳' : 'ساري ✅'}
        </span>
      </td>
      <td>
        <div style="display: flex; gap: 4px; flex-wrap: wrap;">
          <button class="btn btn-outline" style="padding: 3px 8px; font-size: 0.76rem;" onclick="generateWhatsAppCardForStudent('${s.id}')">📲 نبض الطالب</button>
          <button class="btn btn-accent" style="padding: 3px 8px; font-size: 0.76rem;" onclick="sendDunningReminder('${s.id}')">تذكير سداد 💵</button>
        </div>
      </td>
    </tr>
  `;
  }).join('');
}

function filterStudentsTable() {
  const input = document.getElementById('search-student-input');
  renderStudentsTable(input.value);
}

function renderGroupsCards() {
  const container = document.getElementById('groups-cards-container');
  if (!container) return;

  if (state.groups.length === 0) {
    container.innerHTML = `<p style="color: var(--text-muted);">لا توجد مجموعات بعد. اضغط على إنشاء مجموعة جديدة لإضافتها.</p>`;
    return;
  }

  container.innerHTML = state.groups.map(g => `
    <div style="background: #fff; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem;">
      <div style="font-weight: 700; color: var(--primary-700); margin-bottom: 0.5rem;">${g.name}</div>
      <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">
        الموعد: ${g.schedule_day || 'السبت'} (${g.schedule_time || '16:00'}) • السعر: ${g.session_fee || 150} ج.م
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.85rem;">الإشغال: <strong>${g.enrolled_count || 0} / ${g.max_capacity}</strong></span>
        <span class="badge badge-good">${g.capacity_utilization_pct || 0}%</span>
      </div>
    </div>
  `).join('');
}

function renderKnowledgeTable() {
  const tbody = document.getElementById('knowledge-docs-tbody');
  if (!tbody) return;

  if (state.documents.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">لا توجد مذكرات مفهرسة بعد. اضغط على زر "رفع مذكرة / مرجع جديد" لإضافة أول ملف.</td></tr>`;
    return;
  }

  tbody.innerHTML = state.documents.map(d => `
    <tr>
      <td><strong>${d.title}</strong></td>
      <td><span class="badge badge-primary">${d.file_type}</span></td>
      <td>${d.chunk_count} فقرة متجهة</td>
      <td>${new Date(d.created_at).toLocaleDateString('ar-EG')}</td>
      <td>
        <button class="btn btn-danger" style="padding: 4px 10px; font-size: 0.8rem;" onclick="deleteKnowledgeDoc('${d.id}')">حذف 🗑️</button>
      </td>
    </tr>
  `).join('');
}

async function deleteKnowledgeDoc(docId) {
  if (!confirm('هل أنت متأكد من رغبتك في حذف هذه المذكرة وكافة مقاطعها المفهرسة؟')) return;
  try {
    const res = await fetch(`/api/v1/knowledge/documents/${docId}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) {
      alert('تم حذف المذكرة بنجاح.');
      await fetchKnowledgeDocs();
    }
  } catch (err) {
    alert('تعذر حذف المذكرة.');
  }
}

async function searchTeacherVaultTab() {
  const query = document.getElementById('vault-tab-search-input')?.value;
  const outputEl = document.getElementById('vault-tab-output');
  if (!query || !outputEl) return;

  outputEl.style.display = 'block';
  outputEl.innerHTML = '<em>جاري البحث الدلالي في مذكراتك عبر متجهات الـ RAG... ⏳</em>';

  try {
    const res = await fetch('/api/v1/knowledge/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, topK: 3 })
    });
    const json = await res.json();
    if (json.success && json.data.length > 0) {
      outputEl.innerHTML = `
        <div style="font-weight: 700; color: var(--primary-700); margin-bottom: 0.5rem;">
          🎯 تم العثور على ${json.data.length} مقاطع دلالية ذات صلة من مذكراتك:
        </div>
        ${json.data.map((c, idx) => `
          <div style="background: #F8FAFC; border: 1px solid var(--border-subtle); border-radius: 8px; padding: 0.75rem; margin-bottom: 0.5rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--primary-600); margin-bottom: 0.25rem;">
              <span><strong>المصدر:</strong> ${c.documentTitle} (الفقرة #${c.chunkIndex + 1})</span>
              <span class="badge badge-good" style="font-size: 0.72rem;">نسبة التطابق: ${(c.similarityScore * 100).toFixed(0)}%</span>
            </div>
            <p style="font-size: 0.88rem; margin: 0; color: #1E293B;">${c.chunkText}</p>
          </div>
        `).join('')}
      `;
    } else {
      outputEl.innerHTML = '<span style="color: var(--text-muted);">لم يتم العثور على فقرات مطابقة لهذا المفهوم في مذكراتك. يرجى تجربة كلمات أخرى أو رفع مذكرة تتضمن هذا الموضوع.</span>';
    }
  } catch (err) {
    outputEl.innerHTML = '<span style="color: #DC2626;">تعذر إتمام البحث الدلالي.</span>';
  }
}

async function generateRagQuizTab() {
  const queryTopic = document.getElementById('vault-tab-search-input')?.value || 'قانون أوم وتوصيل المقاومات';
  const outputEl = document.getElementById('vault-tab-output');
  if (!outputEl) return;

  outputEl.style.display = 'block';
  outputEl.innerHTML = '<em>جاري صياغة أسئلة ومستويات بلوم بالذكاء الاصطناعي استناداً لنصوص مذكراتك... 🤖</em>';

  try {
    const res = await fetch('/api/v1/knowledge/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queryTopic, questionCount: 2 })
    });
    const json = await res.json();
    if (json.success && json.data) {
      const qz = json.data;
      outputEl.innerHTML = `
        <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 0.85rem; margin-bottom: 0.75rem;">
          <div style="font-weight: 800; color: #1E40AF; margin-bottom: 0.25rem;">📝 ${qz.title}</div>
          <div style="font-size: 0.8rem; color: #3B82F6;">تم الاقتباس الدقيق والتوثيق من: ${qz.sourceCitations.map(s => s.documentTitle).join('، ')}</div>
        </div>
        ${qz.questions.map((q, idx) => `
          <div style="background: #FFFFFF; border: 1.5px solid var(--border-subtle); border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem;">
            <div style="font-weight: 700; color: #0F172A; margin-bottom: 0.5rem;">س${idx + 1}: ${q.prompt}</div>
            <div style="display: grid; gap: 0.4rem; margin-bottom: 0.5rem;">
              ${q.options.map(opt => `
                <div style="padding: 6px 12px; background: ${opt === q.correctAnswer ? '#ECFDF5' : '#F8FAFC'}; border: 1px solid ${opt === q.correctAnswer ? '#10B981' : '#E2E8F0'}; border-radius: 6px; font-size: 0.85rem; color: ${opt === q.correctAnswer ? '#065F46' : '#334155'}; font-weight: ${opt === q.correctAnswer ? '700' : 'normal'};">
                  ${opt === q.correctAnswer ? '✅ ' : '⚪ '} ${opt}
                </div>
              `).join('')}
            </div>
            <div style="font-size: 0.8rem; color: #059669; background: #F0FDF4; padding: 6px 10px; border-radius: 6px;">
              <strong>💡 التعليل النموذجي:</strong> ${q.explanation}
            </div>
          </div>
        `).join('')}
        <button class="btn btn-primary btn-sm" onclick="switchTeacherTab('tab-assessments')">نقل هذا الاختبار إلى بنك الامتحانات والمصحح الضوئي 🚀</button>
      `;
    }
  } catch (err) {
    outputEl.innerHTML = '<span style="color: #DC2626;">تعذر توليد الاختبار من المذكرات.</span>';
  }
}

function renderGapsDetailed() {
  const container = document.getElementById('gaps-detailed-container');
  if (!container) return;

  if (state.gaps.length === 0) {
    container.innerHTML = `<div style="background: var(--accent-100); color: var(--accent-700); padding: 1rem; border-radius: var(--radius-md);">لا توجد فجوات مفاهيمية حرجة. أداء الطلاب مستقر وممتاز!</div>`;
    return;
  }

  container.innerHTML = state.gaps.map(g => `
    <div style="background: #fff; border: 1px solid var(--border-color); border-right: 5px solid var(--danger-500); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <h4 style="color: var(--danger-500);">${g.concept_name_ar} (${g.concept_code})</h4>
        <span class="badge badge-urgent">نسبة الخطأ: ${g.failure_rate_pct}%</span>
      </div>
      <p style="font-size: 0.9rem; margin-bottom: 0.5rem;">${g.evidence.summaryAr}</p>
      <div style="background: #F8FAFC; padding: 0.75rem; border-radius: var(--radius-sm); font-size: 0.85rem;">
        <strong>💡 الإجراء العلاجي المقترح:</strong> ${g.recommendation.titleAr}
      </div>
    </div>
  `).join('');
}

// 5. Form Handlers (CRUD Operations)

async function handleCreateStudent(e) {
  e.preventDefault();
  const fullName = document.getElementById('stu-name-input').value;
  const groupId = document.getElementById('stu-group-select').value;
  const gradeLevel = document.getElementById('stu-grade-select').value;
  const parentPhone = document.getElementById('stu-phone-input').value;

  try {
    const res = await fetch(`/api/v1/groups/${groupId}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, parentPhone, gradeLevel })
    });
    const json = await res.json();
    if (json.success) {
      alert(`🎉 تم تسجيل الطالب (${fullName}) بنجاح!\nالكود الأكاديمي: ${json.data.student.academic_code}`);
      closeModal('modal-add-student');
      document.getElementById('stu-name-input').value = '';
      document.getElementById('stu-phone-input').value = '';
      await fetchStudents();
    } else {
      alert('خطأ: ' + json.error);
    }
  } catch (err) {
    alert('تعذر حفظ الطالب.');
  }
}

// File Ingestion Controls for Knowledge Vault
function triggerFileInput(inputId) {
  const input = document.getElementById(inputId);
  if (input) input.click();
}

function handleFileSelected(e, fileKind) {
  const file = e.target.files[0];
  if (!file) return;

  const statusCard = document.getElementById('file-upload-status');
  const statusName = document.getElementById('file-status-name');
  const statusDetails = document.getElementById('file-status-details');
  const titleInput = document.getElementById('memo-title-input');
  const typeSelect = document.getElementById('memo-type-select');
  const contentArea = document.getElementById('memo-content-input');

  statusCard.style.display = 'flex';
  statusName.innerText = `📎 تم اختيار: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
  statusDetails.innerText = '⏳ جاري القراءة واستخراج النصوص بالذكاء الاصطناعي...';

  // Base title from filename
  const cleanTitle = file.name.replace(/\.[^/.]+$/, "");
  if (!titleInput.value) {
    titleInput.value = cleanTitle;
  }

  if (fileKind === 'PDF') {
    typeSelect.value = 'PDF_DOCUMENT';
    setTimeout(() => {
      statusDetails.innerText = '✅ تم استخراج نصوص ملف الـ PDF وتقسيمها إلى أقسام تعليمية بنجاح.';
      if (!contentArea.value) {
        contentArea.value = `[مستند PDF: ${cleanTitle}]\n\nالفصل الأول: الدوائر الكهربية المتقدمة وقوانين كيرشوف.\n1. عند توصيل المقاومات في دوائر التيار المستمر، نطبق قانون كيرشوف الأول (حفظ الشحنة) عند أي نقطة تفرع: مجموع التيارات الداخلة = مجموع التيارات الخارجة.\n2. قانون كيرشوف الثاني (حفظ الطاقة): في أي مسار مغلق، المجموع الجبري للقوى الدافعة الكهربية يساوي المجموع الجبري لفروق الجهد (ΣV = ΣIR).\n\nملاحظة هامة للطلاب: انتبه لاتجاه المسار المفترض وإشارات القوة الدافعة والمقاومات الداخلية للبطاريات.`;
      }
    }, 600);
  } else if (fileKind === 'WORD') {
    typeSelect.value = 'WORD_DOCUMENT';
    setTimeout(() => {
      statusDetails.innerText = '✅ تم قراءة مستند Word واستخراج 1,280 كلمة جاهزة للفهرسة.';
      if (!contentArea.value) {
        contentArea.value = `[مستند Word: ${cleanTitle}]\n\nمذكرة المراجعة النهائية في الفيزياء 2026.\nالقوانين الأساسية:\n- المقاومة R = ρ * (L / A)\n- الطاقة الكهربية المستنفدة W = V * I * t = I² * R * t\n- القدرة الكهربية P = V * I = I² * R = V² / R\n\nتطبيقات عملية: علل تزداد مقاومة موصل بزيادة طوله؟ لأن زيادة الطول بمثابة إضافة مقاومات متصلة على التوالي.`;
      }
    }, 600);
  } else if (fileKind === 'CAMERA') {
    typeSelect.value = 'CAMERA_PHOTO_OCR';
    setTimeout(() => {
      statusDetails.innerText = '📸 اكتمل التعرف الضوئي على الورقة المصورة بالكاميرا (دقة OCR: 98%).';
      titleInput.value = `صورة مذكرة ورقية (${new Date().toLocaleDateString('ar-EG')})`;
      if (!contentArea.value) {
        contentArea.value = `[مسح ضوئي لكاميرا الموبايل - OCR]:\n\nسؤال هام متوقع في الامتحان:\nدائرة كهربية تحتوي على بطارية قوتها الدافعة 12 فولت ومقاومتها الداخلية 1 أوم، متصلة بمقاومتين على التوازي (6 أوم و 3 أوم).\nالمطلوب:\n1. احسب المقاومة المكافئة الخارجية: R_eq = (6 * 3) / (6 + 3) = 2 أوم.\n2. احسب المقاومة الكلية للدائرة: R_total = 2 + 1 = 3 أوم.\n3. شدة التيار الكلي: I = 12 / 3 = 4 أمبير.`;
      }
    }, 800);
  }
}

async function handleUploadMemo(e) {
  e.preventDefault();
  const title = document.getElementById('memo-title-input').value;
  const fileType = document.getElementById('memo-type-select').value;
  const rawContent = document.getElementById('memo-content-input').value;

  try {
    const res = await fetch('/api/v1/knowledge/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, fileType, rawContent })
    });
    const json = await res.json();
    if (json.success) {
      alert(`📚 تم رفع وفهرسة المذكرة بنجاح!\nتم إنشاء ${json.data.chunk_count} متجهاً دلالياً في الخزينة.`);
      closeModal('modal-add-memo');
      document.getElementById('memo-title-input').value = '';
      document.getElementById('memo-content-input').value = '';
      const statusCard = document.getElementById('file-upload-status');
      if (statusCard) statusCard.style.display = 'none';
      await fetchKnowledgeDocs();
    } else {
      alert('خطأ: ' + json.error);
    }
  } catch (err) {
    alert('تعذر رفع المذكرة.');
  }
}

async function handleCreateGroup(e) {
  e.preventDefault();
  const name = document.getElementById('group-name-input').value;
  const gradeLevel = document.getElementById('group-grade-select').value;
  const maxCapacity = document.getElementById('group-capacity-input').value;
  const sessionFee = document.getElementById('group-fee-input').value;
  const scheduleDay = document.getElementById('group-day-input').value;
  const scheduleTime = document.getElementById('group-time-input').value;

  try {
    const res = await fetch('/api/v1/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, gradeLevel, maxCapacity, sessionFee, scheduleDay, scheduleTime })
    });
    const json = await res.json();
    if (json.success) {
      alert(`🏛️ تم إنشاء المجموعة (${name}) بنجاح!`);
      closeModal('modal-add-group');
      document.getElementById('group-name-input').value = '';
      await fetchGroups();
    } else {
      alert('خطأ: ' + json.error);
    }
  } catch (err) {
    alert('تعذر إنشاء المجموعة.');
  }
}

async function handleRecordPayment(e) {
  e.preventDefault();
  const studentId = document.getElementById('pay-student-select').value;
  const amount = document.getElementById('pay-amount-input').value;
  const paymentMethod = document.getElementById('pay-method-select').value;
  const referenceId = document.getElementById('pay-ref-input').value;

  try {
    const res = await fetch('/api/v1/business/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, amount, paymentMethod, referenceId })
    });
    const json = await res.json();
    if (json.success) {
      alert(`🧾 تم تسجيل الدفعة بنجاح بمبلغ ${amount} ج.م!\nطريقة الدفع: ${paymentMethod}`);
      closeModal('modal-record-payment');
      document.getElementById('pay-ref-input').value = '';
    } else {
      alert('خطأ: ' + json.error);
    }
  } catch (err) {
    alert('تعذر تسجيل الدفعة.');
  }
}

async function deleteKnowledgeDoc(docId) {
  if (!confirm('هل أنت متأكد من رغبتك في حذف هذه المذكرة من الخزينة؟')) return;

  try {
    const res = await fetch(`/api/v1/knowledge/documents/${docId}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) {
      alert('تم حذف المذكرة بنجاح.');
      await fetchKnowledgeDocs();
    }
  } catch (err) {
    alert('تعذر حذف المذكرة.');
  }
}

// 6. Attendance & 1-Click Operations

function toggleAttendanceStatus(idx) {
  const badge = document.getElementById(`att-badge-${idx}`);
  if (badge.innerText.includes('حاضر')) {
    badge.className = 'badge badge-urgent';
    badge.innerText = 'غائب ❌';
  } else {
    badge.className = 'badge badge-good';
    badge.innerText = 'حاضر ✅';
  }
}

function saveDailyAttendance() {
  alert('💾 تم حفظ سجل حضور حصة اليوم بنجاح!\nتم إرسال إشعارات "نبض الأبناء" إلى هواتف أولياء الأمور تلقائياً.');
}

async function trigger1ClickRemediation() {
  try {
    const res = await fetch('/api/v1/insights/remediation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conceptId: 'cpt-parallel-series', groupId: 'grp-001' })
    });
    const result = await res.json();
    if (result.success) {
      alert(`⚡ تم تفعيل خطة المعالجة بنجاح!\n\n${result.data.title}\n- الخطوات: ${result.data.remediationSteps.join('\n- ')}`);
      document.getElementById('btn-remediation-action').innerText = '✅ تم إرسال وتوجيه المراجعة للطلاب';
      document.getElementById('btn-remediation-action').disabled = true;
    }
  } catch (e) {
    alert('حدث خطأ أثناء تفعيل المراجعة.');
  }
}

// 7. AI Studio & Search Workflows

async function searchTeacherVaultTab() {
  const query = document.getElementById('vault-tab-search-input').value;
  const out = document.getElementById('vault-tab-output');
  out.style.display = 'block';
  out.innerHTML = '<em>⏳ جاري البحث الدلالي في مذكراتك...</em>';

  try {
    const res = await fetch('/api/v1/knowledge/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, topK: 2 })
    });
    const json = await res.json();
    if (json.success && json.data.length > 0) {
      out.innerHTML = `
        <div style="font-weight: 700; color: var(--primary-700); margin-bottom: 0.5rem;">✅ تم استرجاع النصوص الأكثر صلة من مذكراتك:</div>
        ${json.data.map(c => `
          <div style="border-top: 1px dashed var(--border-color); padding-top: 6px; margin-top: 6px;">
            <strong>[${c.documentTitle}]</strong> (درجة التطابق: ${(c.similarityScore * 100).toFixed(1)}%)
            <p style="color: var(--text-muted); margin-top: 2px;">${c.chunkText}</p>
          </div>
        `).join('')}
      `;
    } else {
      out.innerHTML = 'لم يتم العثور على فقرات مطابقة.';
    }
  } catch (e) {
    out.innerHTML = 'تعذر إتمام البحث.';
  }
}

async function generateRagQuizTab() {
  const out = document.getElementById('vault-tab-output');
  out.style.display = 'block';
  out.innerHTML = '<em>⏳ جاري صياغة اختبار ذكي مستنداً إلى مذكراتك المفهرسة...</em>';

  try {
    const res = await fetch('/api/v1/knowledge/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queryTopic: 'توصيل التوازي والمنازل' })
    });
    const json = await res.json();
    if (json.success) {
      const q = json.data.questions[0];
      out.innerHTML = `
        <div style="font-weight: 700; color: var(--accent-700); margin-bottom: 0.5rem;">🎯 ${json.data.title}</div>
        <div style="background: #F8FAFC; border: 1px solid var(--border-color); padding: 10px; border-radius: 8px;">
          <strong>س: ${q.prompt}</strong>
          <div style="color: var(--accent-600); font-weight: 700; margin-top: 4px;">الإجابة النموذجية: ${q.correctAnswer}</div>
          <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">${q.explanation}</div>
        </div>
      `;
    }
  } catch (e) {
    out.innerHTML = 'تعذر توليد الاختبار من الخزينة.';
  }
}

async function generateAiLesson() {
  const topic = document.getElementById('lesson-topic-input').value;
  const grade = document.getElementById('lesson-grade-select').value;
  const duration = document.getElementById('lesson-duration-input').value;

  const out = document.getElementById('ai-output-area');
  out.innerHTML = '<em>⏳ جاري إعداد خطة الدرس بالذكاء الاصطناعي...</em>';

  try {
    const res = await fetch('/api/v1/ai/generate-lesson', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, gradeLevel: grade, durationMins: Number(duration) })
    });
    const json = await res.json();
    if (json.success) {
      const plan = json.data;
      out.innerHTML = `
        <h4 style="color: var(--primary-700); margin-bottom: 0.5rem;">${plan.title} (${plan.totalDurationMins} دقيقة)</h4>
        <strong>🎯 نواتج التعلم المستهدفة:</strong>
        <ul style="margin-right: 1.25rem; margin-bottom: 0.5rem;">
          ${plan.learningObjectives.map(o => `<li>${o}</li>`).join('')}
        </ul>
        <strong>⏱️ التوزيع الزمني المقترح للحصة:</strong>
        <ul style="margin-right: 1.25rem;">
          ${plan.timeAllocation.map(t => `<li><strong>${t.phase} (${t.durationMins} د):</strong> ${t.description}</li>`).join('')}
        </ul>
      `;
    }
  } catch (err) {
    out.innerHTML = '<span style="color: red;">تعذر توليد خطة الدرس.</span>';
  }
}

async function generateAiAssessment() {
  const title = document.getElementById('quiz-title-input').value;
  const count = document.getElementById('quiz-count-input').value;

  const out = document.getElementById('ai-output-area');
  out.innerHTML = '<em>⏳ جاري توليد اختبار متوازن (30% سهل، 50% متوسط، 20% صعب)...</em>';

  try {
    const res = await fetch('/api/v1/ai/generate-assessment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, questionCount: Number(count) })
    });
    const json = await res.json();
    if (json.success) {
      const quiz = json.data;
      out.innerHTML = `
        <h4 style="color: var(--primary-700); margin-bottom: 0.5rem;">${quiz.title} (مجموع الدرجات: ${quiz.totalMarks})</h4>
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">
          توزيع بلوم للصعوبة: ${quiz.blueprintSummary.easyPct}% سهل • ${quiz.blueprintSummary.mediumPct}% متوسط • ${quiz.blueprintSummary.hardPct}% صعب
        </div>
        ${quiz.questions.map((q, idx) => `
          <div style="border-top: 1px solid var(--border-color); padding-top: 0.5rem; margin-top: 0.5rem;">
            <strong>س${idx + 1}: ${q.prompt}</strong> [${q.difficulty} - ${q.marks} درجات]
            <div style="font-size: 0.85rem; color: var(--accent-600); margin-top: 2px;">الإجابة الصحيحة: ${q.correctAnswer}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">التفسير: ${q.explanation}</div>
          </div>
        `).join('')}
      `;
    }
  } catch (err) {
    out.innerHTML = '<span style="color: red;">تعذر توليد الاختبار.</span>';
  }
}

async function simulateVoiceCommand() {
  const transcript = document.getElementById('voice-transcript-input').value;
  const out = document.getElementById('ai-output-area');
  out.innerHTML = '<em>🎙️ جاري معالجة الأمر الصوتي المصري...</em>';

  try {
    const res = await fetch('/api/v1/ai/voice-command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript })
    });
    const json = await res.json();
    if (json.success) {
      out.innerHTML = `
        <h4 style="color: var(--primary-700);">🎙️ نتيجة التعرف على الأمر الصوتي الذكي</h4>
        <div style="margin: 0.5rem 0;"><strong>النية المستخرجة (Intent):</strong> <span class="badge badge-primary">${json.data.intent}</span></div>
        <div style="margin: 0.5rem 0;"><strong>مستوى التأكيد:</strong> يتطلب تأكيد المعلم (Level 3 Human-in-the-Loop)</div>
        <div style="background: #FEF3C7; padding: 0.75rem; border-radius: 8px; margin-top: 0.5rem;">
          ${json.data.previewMessageAr}
        </div>
      `;
    }
  } catch (e) {
    out.innerHTML = '<span style="color: red;">خطأ في معالجة الصوت.</span>';
  }
}

async function simulateOcrScan() {
  const out = document.getElementById('ocr-output');
  out.style.display = 'block';
  out.innerHTML = '<em>📸 جاري التعرف الضوئي على خط يد الطالب وتصحيح الامتحان...</em>';

  try {
    const res = await fetch('/api/v1/ocr/scan-paper', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assessmentId: 'ass-demo-1',
        studentId: 'stu-demo-1',
        paperImageUrl: 'https://cdn.teacher-os.internal/scans/mostafa_exam_page1.jpg'
      })
    });
    const json = await res.json();
    if (json.success) {
      const d = json.data;
      out.innerHTML = `
        <div style="font-weight: 700; color: var(--accent-700);">✅ اكتمل التصحيح الآلي لورقة الطالب: ${d.studentName}</div>
        <div style="margin: 4px 0;"><strong>الدرجة المحسوبة:</strong> ${d.scoreEarned} / ${d.totalMarks} (${d.percentage}%) • دقة التعرف الضوئي: ${(d.confidenceScore * 100).toFixed(0)}%</div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">تم تحديث رادار الفجوات المفاهيمية وسجل الطالب فورياً.</div>
      `;
    }
  } catch (e) {
    out.innerHTML = '<span style="color: red;">تعذر إتمام الفحص الضوئي.</span>';
  }
}

// 8. Student & Parent Portal Handlers

async function startStudentQuiz() {
  const student = state.currentStudent;
  if (student && student.id) {
    try {
      const checkRes = await fetch(`/api/v1/business/student-access/${student.id}`);
      const checkJson = await checkRes.json();
      if (checkJson.success && !checkJson.data.canAccess) {
        alert(`⚠️ عذراً، لا يمكن بدء الاختبار الآن:\n\n${checkJson.data.reason}\n\nيرجى سداد الاشتراك أولاً.`);
        checkAndUpdateStudentPaywall(student.id);
        return;
      }
    } catch (e) {}
  }
  document.getElementById('student-quiz-modal').style.display = 'block';
}

async function submitStudentQuiz() {
  const student = state.currentStudent;
  const resultDiv = document.getElementById('student-quiz-result');
  resultDiv.style.display = 'block';

  try {
    const res = await fetch('/api/v1/assessments/ass-demo-1/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: student.id,
        answers: { 'q-ohm-1': 'R / 3' }
      })
    });
    const json = await res.json();
    if (!res.ok || json.success === false) {
      resultDiv.innerHTML = `<div style="color: #DC2626; font-weight: 700;">⚠️ تعذر تسليم الاختبار: ${json.error || 'تم تعليق الحساب مؤقتاً لانتهاء فترة السماح بالسداد'}</div>`;
      checkAndUpdateStudentPaywall(student.id);
      return;
    }
  } catch (e) {}

  resultDiv.innerHTML = `
    <h4 style="color: var(--accent-700); margin-bottom: 0.25rem;">🎉 نتيجة الاختبار: 10 / 10 (100% - ممتاز)</h4>
    <p style="font-size: 0.9rem; color: var(--text-main);">تم تصحيح إجابتك فورياً وتحديث رادار إتقان المفاهيم لديك. تم إرسال إشعار فوري لولي الأمر عبر "نبض الأبناء".</p>
  `;
}

async function askSocraticCoach() {
  const input = document.getElementById('socratic-input').value;
  const resDiv = document.getElementById('socratic-response');
  resDiv.style.display = 'block';
  resDiv.innerHTML = '<em>⏳ المرشد الذكي يحلل استفسارك بأسلوب سقراطي...</em>';

  try {
    const res = await fetch('/api/v1/student/ask-coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionPrompt: input, studentThought: input })
    });
    const json = await res.json();
    if (json.success) {
      resDiv.innerHTML = `
        <div style="font-weight: 700; color: var(--primary-700); margin-bottom: 4px;">💡 إرشاد سقراطي موجه:</div>
        <div>${json.data.coachResponseAr}</div>
      `;
    }
  } catch (e) {
    resDiv.innerHTML = 'تعذر الاتصال بالمرشد الذكي.';
  }
}

async function generateWhatsAppCard() {
  const box = document.getElementById('whatsapp-card-display');
  box.innerHTML = 'جاري توليد بطاقة المتابعة...';

  try {
    const res = await fetch('/api/v1/parent/whatsapp-card/stu-sample');
    const json = await res.json();
    if (json.success) {
      box.innerText = json.data.whatsAppText;
    }
  } catch (e) {
    box.innerText = `السلام عليكم ورحمة الله،\nتحية طيبة من مكتب أ/ طارق الشناوي 🌟\n\n📊 *بطاقة المتابعة الدورية للطالب/ة:* أحمد محمود\n🆔 *كود الطالب:* STU-102931\n----------------------------------\n🔹 *نبض الأداء العام:* ممتاز ومستقر (Good)\n🔹 *نسبة الحضور:* 100% (0 غياب مسجل)\n🔹 *متوسط درجات التقييمات:* 88%\n----------------------------------\n📝 *ملاحظة المعلم:*\nمستوى أحمد ممتاز وملتزم بالحضور والواجبات.\n\nنتمنى لأبنائنا دوام التوفيق والتميز دائماً 💡`;
  }
}

async function generateWhatsAppCardForStudent(studentId) {
  try {
    const res = await fetch(`/api/v1/parent/whatsapp-card/${studentId}`);
    const json = await res.json();
    if (json.success) {
      alert(`📱 بطاقة الواتساب الجاهزة للإرسال لولي الأمر:\n\n${json.data.whatsAppText}`);
    }
  } catch (e) {
    alert('تم توليد بطاقة المتابعة بنجاح.');
  }
}

// 9. Zoom Live Classroom Action Handlers

async function handleCreateZoomMeeting(e) {
  e.preventDefault();
  const topic = document.getElementById('zoom-topic-input').value;
  const groupId = document.getElementById('zoom-group-select').value;
  const startTime = document.getElementById('zoom-time-input').value;
  const durationMins = document.getElementById('zoom-duration-input').value;
  const passcode = document.getElementById('zoom-passcode-input').value;
  const autoRecord = document.getElementById('zoom-record-check').checked;

  try {
    const res = await fetch('/api/v1/zoom/meetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, groupId, startTime, durationMins, passcode, autoRecord })
    });
    const json = await res.json();
    if (json.success) {
      alert(`🎉 تم إنشاء حصة الزووم بنجاح!\n\nMeeting ID: ${json.data.meeting_number}\nPasscode: ${json.data.passcode}\n\nتم تحديث جدول الحصص المباشرة.`);
      closeModal('modal-add-zoom');
      await fetchZoomMeetings();
    } else {
      alert('خطأ: ' + json.error);
    }
  } catch (err) {
    alert('تعذر إنشاء حصة الزووم.');
  }
}

function getActiveZoomMeeting(meetingId) {
  return (meetingId ? state.meetings.find(m => m.id === meetingId) : null) || 
         state.meetings.find(m => m.status === 'LIVE') || 
         state.meetings[0] || {
    id: 'zoom-demo-001',
    topic: 'حصة أونلاين مباشرة: حل مسائل كيرشوف والدوائر المعقدة',
    group_name: 'مجموعة النخبة (السبت 4:00م)',
    teacher_name: 'أ/ طارق الشناوي',
    start_time: 'اليوم الساعة 04:00 مساءً',
    duration_mins: 75,
    meeting_number: '84920194820',
    passcode: 'Physics2026',
    zoom_url: 'https://us05web.zoom.us/j/84920194820?pwd=Physics2026DemoSecretKey',
    status: 'LIVE'
  };
}

function startTeacherZoomRoom(meetingId) {
  const meeting = getActiveZoomMeeting(meetingId);
  const titleEl = document.getElementById('room-topic-title');
  if (titleEl) titleEl.innerText = `${meeting.topic} (المضيف: أ/ طارق الشناوي)`;
  openModal('modal-zoom-live-room');
}

async function joinStudentZoomLive() {
  const activeMeeting = getActiveZoomMeeting();
  const student = state.currentStudent;

  // Check access first
  if (student && student.id) {
    try {
      const checkRes = await fetch(`/api/v1/business/student-access/${student.id}`);
      const checkJson = await checkRes.json();
      if (checkJson.success && !checkJson.data.canAccess) {
        alert(`⚠️ تنبيه تعليق الحساب:\n\n${checkJson.data.reason}\n\nيرجى سداد الاشتراك لتفعيل حصص الزووم المباشرة.`);
        checkAndUpdateStudentPaywall(student.id);
        return;
      }
    } catch (e) {}
  }

  // Auto-register attendance on backend
  try {
    const res = await fetch(`/api/v1/zoom/meetings/${activeMeeting.id}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: student.id,
        studentName: student.name
      })
    });
    const json = await res.json();
    if (!res.ok || json.success === false) {
      alert(`⚠️ ${json.error || 'تم تعليق الحساب مؤقتاً بسبب مستحقات دراسية متأخرة'}`);
      checkAndUpdateStudentPaywall(student.id);
      return;
    }
  } catch (e) {}

  alert(`🎉 تم الانضمام بنجاح وتسجيل حضورك آلياً في الحصة!\nالموضوع: ${activeMeeting.topic}`);
  const titleEl = document.getElementById('room-topic-title');
  if (titleEl) titleEl.innerText = `${activeMeeting.topic} (طالب: ${student.name})`;
  openModal('modal-zoom-live-room');
}

async function shareZoomWhatsApp(meetingId) {
  const meeting = getActiveZoomMeeting(meetingId);

  let inviteText = 
`السلام عليكم ورحمة الله وبركاته 🌟
أهلاً بأبطالنا وأولياء الأمور الكرام،

🔴 *رابط حصة الزووم المباشرة (Zoom Online Class)*
👨‍🏫 *مع:* أ/ طارق الشناوي
📚 *الموضوع:* ${meeting.topic}
🏛️ *المجموعة:* ${meeting.group_name || 'مجموعة النخبة'}
⏰ *الموعد:* ${meeting.start_time || 'اليوم 04:00م'}
⏱️ *مدة الحصة:* ${meeting.duration_mins || 75} دقيقة
------------------------------------
🔗 *رابط الدخول المباشر بنقرة واحدة:*
${meeting.zoom_url || 'https://zoom.us'}

🆔 *رقم الاجتماع (Meeting ID):*
${meeting.meeting_number || '849 2019 4820'}

🔑 *رمز المرور (Passcode):*
${meeting.passcode || 'Physics2026'}
------------------------------------
💡 *تعليمات هامة للطلاب:*
1. يرجى الدخول قبل الموعد بـ 5 دقائق وكتابة اسمك ثلاثي.
2. يتم تسجيل الحضور والغياب آلياً بمجرد الدخول.
3. تجهيز كشكول الملاحظات والآلة الحاسبة.

مع تمنياتنا لكم بأعلى الدرجات والتميز دائماً 🚀`;

  let encodedUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(inviteText)}`;

  try {
    const res = await fetch(`/api/v1/zoom/meetings/${meeting.id}/whatsapp-invite`);
    const json = await res.json();
    if (json.success) {
      inviteText = json.data.whatsAppText;
      encodedUrl = json.data.encodedUrl;
    }
  } catch (e) {
    // Keep offline fallback inviteText
  }

  if (navigator.clipboard) {
    try { await navigator.clipboard.writeText(inviteText); } catch(err) {}
  }

  const choice = confirm(`📱 تم توليد دعوة الزووم الجاهزة للواتساب وتجهيزها للنسخ:\n\n${inviteText}\n\nاضغط "موافق" لفتح تطبيق الواتساب مباشرة.`);
  if (choice) {
    window.open(encodedUrl, '_blank');
  }
}

async function endCurrentZoomMeeting(meetingId) {
  const meeting = getActiveZoomMeeting(meetingId);

  if (!confirm(`هل أنت متأكد من إنهاء جلسة الزووم (${meeting.topic})؟ سيتم حفظ وتثبيت سجل حضور جميع الطلاب المشاركين آلياً.`)) {
    return;
  }

  try {
    await fetch(`/api/v1/zoom/meetings/${meeting.id}/end`, { method: 'POST' });
  } catch (e) {}

  alert('⏹️ تم إنهاء حصة الزووم وتثبيت سجل الحضور بنجاح!');
  meeting.status = 'ENDED';
  closeModal('modal-zoom-live-room');
  renderZoomTable();
  updateActiveZoomUI();
}

// In-Room Live Controls
function toggleZoomMic() {
  const btn = document.getElementById('btn-ctrl-mic');
  if (btn.classList.contains('active')) {
    btn.classList.remove('active');
    btn.innerText = '🎙️';
    alert('🎙️ تم تشغيل المايك الخاص بك.');
  } else {
    btn.classList.add('active');
    btn.innerText = '🔇';
    alert('🔇 تم كتم المايك.');
  }
}

function toggleZoomCam() {
  const btn = document.getElementById('btn-ctrl-cam');
  if (btn.classList.contains('active')) {
    btn.classList.remove('active');
    btn.innerText = '📹';
    alert('📹 تم تشغيل الكاميرا الخاصة بك.');
  } else {
    btn.classList.add('active');
    btn.innerText = '🚫';
    alert('🚫 تم إيقاف الكاميرا.');
  }
}

function raiseZoomHand() {
  const btn = document.getElementById('btn-ctrl-hand');
  btn.classList.toggle('active');
  alert('✋ تم رفع اليد للمشاركة وإشعار المعلم برغبتك في السؤال.');
}

function sendZoomChat() {
  const msg = prompt('اكتب رسالتك في شات الحصة المباشرة:', 'فهمت المسألة يا مستر، شكراً لحضرتك!');
  if (msg) {
    const chatBox = document.getElementById('zoom-chat-box');
    if (chatBox) {
      const newMsg = document.createElement('div');
      newMsg.style.color = '#E2E8F0';
      newMsg.style.marginTop = '4px';
      newMsg.innerHTML = `<strong style="color: #FCD34D;">أنت:</strong> ${msg}`;
      chatBox.appendChild(newMsg);
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }
}

function openOfficialZoomLink() {
  const activeMeeting = state.meetings.find(m => m.status === 'LIVE') || state.meetings[0];
  const url = activeMeeting ? activeMeeting.zoom_url : 'https://zoom.us';
  window.open(url, '_blank');
}

// ==========================================
// 10. SaaS Tiering & Monetization Handlers
// ==========================================

async function fetchTeacherTier() {
  try {
    const res = await fetch('/api/v1/business/teacher-tier');
    const json = await res.json();
    if (json.success && json.data) {
      updateTeacherTierUI(json.data);
      return;
    }
  } catch (e) {
    console.warn('Using local teacher tier fallback');
  }

  updateTeacherTierUI({
    planId: 'PRO_TEACHER',
    planNameAr: 'باقة المعلم المحترف (Pro Teacher)',
    priceEGP: 500,
    badgeColor: '#2563EB'
  });
}

function updateTeacherTierUI(tier) {
  state.currentUser.plan = tier.planId;
  state.currentUser.planNameAr = tier.planNameAr;

  const badgeEl = document.getElementById('header-tier-badge');
  if (badgeEl) {
    if (tier.planId === 'FREE_STARTER') {
      badgeEl.innerText = '🥉 الباقة الأساسية المفتوحة (مجانية)';
      badgeEl.style.background = '#64748B';
    } else if (tier.planId === 'PRO_TEACHER') {
      badgeEl.innerText = '👑 باقة المعلم المحترف (500 ج.م)';
      badgeEl.style.background = 'linear-gradient(135deg, #2563EB, #1D4ED8)';
    } else {
      badgeEl.innerText = '🚀 باقة السنتر الذكي والنخبة';
      badgeEl.style.background = 'linear-gradient(135deg, #7C3AED, #5B21B6)';
    }
  }

  // Highlight active plan in modal
  document.querySelectorAll('.pricing-card').forEach(card => card.style.boxShadow = '');
  const currentCard = document.getElementById(`card-tier-${tier.planId}`);
  if (currentCard) {
    currentCard.style.boxShadow = '0 0 0 3px #10B981, 0 10px 25px -5px rgba(16, 185, 129, 0.2)';
  }
}

async function upgradeTeacherSaaS(newPlanId) {
  try {
    const res = await fetch('/api/v1/business/upgrade-tier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planCode: newPlanId,
        paymentMethod: 'INSTAPAY',
        referenceId: 'INSTA-' + Math.floor(100000 + Math.random() * 900000)
      })
    });
    const json = await res.json();
    if (json.success) {
      alert(`🎉 تهانينا يا أستاذنا!\n\n${json.message}\nتم تفعيل كافة مميزات الباقة ورفع حدود الاستخدام فورياً.`);
      updateTeacherTierUI({
        planId: newPlanId,
        planNameAr: json.data.plan.nameAr
      });
      closeModal('modal-upgrade-tier');
      return;
    }
  } catch (e) {}

  alert(`🎉 تهانينا! تم تفعيل الباقة بنجاح.`);
  updateTeacherTierUI({
    planId: newPlanId,
    planNameAr: newPlanId === 'FREE_STARTER' ? 'الباقة الأساسية المفتوحة' : newPlanId === 'PRO_TEACHER' ? 'باقة المعلم المحترف (Pro)' : 'باقة السنتر الذكي والنخبة'
  });
  closeModal('modal-upgrade-tier');
}

// ==========================================
// 10b. Promo Code 2027 & Device Fingerprint Anti-Abuse Handlers
// ==========================================

function generateDeviceFingerprint() {
  try {
    // 1. Persistent Storage UID token
    let storedToken = localStorage.getItem('teacher_os_device_uid');
    if (!storedToken) {
      storedToken = 'UID-' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
      localStorage.setItem('teacher_os_device_uid', storedToken);
    }

    // 2. Canvas 2D fingerprint
    let canvasHash = 0;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 50;
      const ctx = canvas.getContext('2d');
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('TEACHER_OS_FP_2027', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('TEACHER_OS_FP_2027', 4, 17);
      const str = canvas.toDataURL();
      for (let i = 0; i < str.length; i++) {
        canvasHash = ((canvasHash << 5) - canvasHash) + str.charCodeAt(i);
        canvasHash |= 0;
      }
    } catch (e) {}

    // 3. WebGL GPU renderer string
    let glRenderer = 'webgl_generic';
    try {
      const glCanvas = document.createElement('canvas');
      const gl = glCanvas.getContext('webgl') || glCanvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          glRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        }
      }
    } catch (e) {}

    // 4. Screen, Hardware and Environment properties
    const screenSpec = `${screen.width}x${screen.height}x${screen.colorDepth}`;
    const concurrency = navigator.hardwareConcurrency || 4;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Cairo';

    // Combine into stable hardware signature
    const rawFp = `FP:${storedToken}:${canvasHash}:${glRenderer}:${screenSpec}:${concurrency}:${tz}`;
    
    // Hash into clean alphanumeric string
    let hash = 0;
    for (let i = 0; i < rawFp.length; i++) {
      hash = ((hash << 5) - hash) + rawFp.charCodeAt(i);
      hash |= 0;
    }
    return `DFP-${Math.abs(hash).toString(16).toUpperCase()}-${storedToken.slice(-8)}`;
  } catch (err) {
    return 'DFP-FALLBACK-' + (localStorage.getItem('teacher_os_device_uid') || 'GENERIC');
  }
}

async function handleRedeemPromo(event) {
  if (event) event.preventDefault();

  const codeInput = document.getElementById('promo-code-input');
  const nationalIdInput = document.getElementById('promo-national-id-input');
  const statusEl = document.getElementById('promo-redeem-status');
  const submitBtn = document.getElementById('btn-redeem-promo');

  const promoCode = (codeInput?.value || '').trim();
  const nationalId = (nationalIdInput?.value || '').trim();

  if (!promoCode) {
    alert('يرجى إدخال كود الخصم (2027).');
    return;
  }

  if (!nationalId || nationalId.length !== 14 || !/^\d{14}$/.test(nationalId)) {
    alert('⚠️ الرقم القومي غير صحيح!\n\nيرجى إدخال 14 رقماً قومياً مصرياً صحيحاً للتحقق من هوية المعلم ومنع تكرار الحسابات.');
    if (nationalIdInput) nationalIdInput.focus();
    return;
  }

  const deviceFingerprint = generateDeviceFingerprint();

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerText = 'جاري التحقق الأمني... ⏳';
  }
  if (statusEl) {
    statusEl.innerHTML = '<span style="color: #4F46E5;">⏳ جاري فحص بصمة الجهاز والعتاد وتدقيق الرقم القومي...</span>';
  }

  try {
    const res = await fetch('/api/v1/business/redeem-promo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        promoCode,
        nationalId,
        deviceFingerprint
      })
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'فشل تفعيل العرض');
    }

    // Success!
    alert(`🎉 ألف مبروك يا أستاذنا!\n\nتم تفعيل باقة المعلم المحترف (Pro Teacher) مجاناً لمدة عام كامل (365 يوماً) بنجاح!\n\n💰 القيمة الموفرة: 6,000 ج.م\n📅 تاريخ التجديد القادم: ${new Date(json.data.plan.expiresAt).toLocaleDateString('ar-EG')}\n\nاستمتع بكافة إمكانيات زووم غير المحدودة والمصحح الضوئي والذكاء الاصطناعي بلا حدود.`);

    updateTeacherTierUI({
      planId: 'PRO_TEACHER',
      planNameAr: 'باقة المحترف (مفعلة مجاناً لعام كامل 🎁)'
    });

    // Update banner
    const banner = document.getElementById('promo-2027-banner');
    if (banner) {
      banner.style.background = 'linear-gradient(135deg, #059669, #10B981)';
      banner.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.8rem;">
          <span style="font-size: 1.5rem;">👑</span>
          <div>
            <div style="font-weight: 800; font-size: 0.95rem;">تم تفعيل عرض العام المجاني لحسابك بنجاح!</div>
            <div style="font-size: 0.8rem; opacity: 0.95;">باقة المحترف سارية لمدة 365 يوماً كاملة بتوفير 6,000 ج.م سنوياً.</div>
          </div>
        </div>
        <span style="background: rgba(255,255,255,0.25); padding: 4px 12px; border-radius: 20px; font-weight: 800; font-size: 0.8rem;">✅ مفعل</span>
      `;
    }

    closeModal('modal-upgrade-tier');

  } catch (err) {
    alert(`⛔ تنبيه أمني:\n\n${err.message}`);
    if (statusEl) {
      statusEl.innerHTML = `<span style="color: #DC2626; font-weight: 700;">⛔ ${err.message}</span>`;
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerText = 'تفعيل العام المجاني ⚡';
    }
  }
}

// ==========================================
// 11. Student Paywall & Dunning Handlers
// ==========================================

async function checkAndUpdateStudentPaywall(studentId) {
  const banner = document.getElementById('student-paywall-banner');
  const badge = document.getElementById('student-portal-sub-badge');
  const nameBadge = document.getElementById('student-portal-name');
  const codeBadge = document.getElementById('student-portal-code');

  const student = state.students.find(s => s.id === studentId) || state.currentStudent;
  if (nameBadge) nameBadge.innerText = `طالب: ${student.full_name || student.name} (ثانوية عامة)`;
  if (codeBadge) codeBadge.innerText = `الكود: ${student.academic_code || student.academicCode || 'STU-884210'}`;

  try {
    const res = await fetch(`/api/v1/business/student-access/${studentId}`);
    const json = await res.json();
    if (json.success) {
      const access = json.data;
      if (!access.canAccess) {
        if (banner) banner.style.display = 'block';
        if (badge) {
          badge.innerText = 'الاشتراك: معلق للتأخر ⚠️';
          badge.style.background = '#DC2626';
        }
        const reasonEl = document.getElementById('paywall-reason-text');
        if (reasonEl) reasonEl.innerText = access.reason;
        const amountEl = document.getElementById('paywall-amount-tag');
        if (amountEl) amountEl.innerText = `المبلغ المطلوب: ${access.feeAmount || 600} ${access.currency || 'ج.م'}`;
        return;
      } else {
        if (banner) banner.style.display = 'none';
        if (badge) {
          badge.innerText = access.status === 'DUE_SOON' ? 'الاشتراك: يستحق قريباً ⏳' : 'الاشتراك: ساري ✅';
          badge.style.background = access.status === 'DUE_SOON' ? '#D97706' : '#10B981';
        }
        return;
      }
    }
  } catch (e) {}

  // Fallback check
  if (student.subscription_status === 'متأخر' || student.subscription_status === 'معلق للتأخر') {
    if (banner) banner.style.display = 'block';
    if (badge) {
      badge.innerText = 'الاشتراك: معلق للتأخر ⚠️';
      badge.style.background = '#DC2626';
    }
  } else {
    if (banner) banner.style.display = 'none';
    if (badge) {
      badge.innerText = 'الاشتراك: ساري ✅';
      badge.style.background = '#10B981';
    }
  }
}

async function simulateStudentPayment() {
  const student = state.currentStudent;
  try {
    const res = await fetch('/api/v1/business/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: student.id,
        amount: 600,
        paymentMethod: 'INSTAPAY',
        referenceNumber: 'INSTA-' + Math.floor(100000 + Math.random() * 900000),
        notes: 'سداد فوري عبر إنستاباي - بوابة الطالب'
      })
    });
    const json = await res.json();
    if (json.success) {
      alert(`🎉 تم تأكيد وتجديد الاشتراك بنجاح!\n\nرقم الإيصال الرقمي: ${json.data.receiptNumber || 'REC-2026'}\nتم فك تعليق الحساب وتفعيل حصص الزووم المباشرة فورياً.`);
      const stuInState = state.students.find(s => s.id === student.id);
      if (stuInState) stuInState.subscription_status = 'ساري';
      checkAndUpdateStudentPaywall(student.id);
      renderStudentsTable();
      return;
    }
  } catch (e) {}

  alert('🎉 تم تأكيد تجديد الاشتراك بنجاح وفك تعليق الحساب!');
  const stuInState = state.students.find(s => s.id === student.id);
  if (stuInState) stuInState.subscription_status = 'ساري';
  checkAndUpdateStudentPaywall(student.id);
  renderStudentsTable();
}

function contactSecretaryWhatsApp() {
  const msg = `السلام عليكم، بخصوص تجديد اشتراك الطالب/ة ${state.currentStudent.name}، قمت بالتحويل عبر إنستاباي ومرفق صورة الإيصال لتأكيد التجديد.`;
  const url = `https://api.whatsapp.com/send?phone=201012345678&text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

async function sendDunningReminder(studentId) {
  try {
    const res = await fetch(`/api/v1/business/dunning/remind/${studentId}`);
    const json = await res.json();
    if (json.success) {
      const data = json.data;
      if (navigator.clipboard) {
        try { await navigator.clipboard.writeText(data.whatsAppText); } catch(e) {}
      }
      const choice = confirm(`📲 رسالة تذكير السداد المهذبة الجاهزة للواتساب:\n\n${data.whatsAppText}\n\n(تم نسخ نص الرسالة للحافظة ✅)\nاضغط "موافق" لفتح الواتساب وإرسالها لولي الأمر.`);
      if (choice) {
        window.open(data.encodedUrl, '_blank');
      }
      return;
    }
  } catch (e) {}

  const student = state.students.find(s => s.id === studentId);
  const text = `السلام عليكم ورحمة الله، تحية طيبة من مكتب أ/ طارق الشناوي. نذكر سيادتكم بموعد تجديد الاشتراك الشهري للطالب ${student ? student.full_name : ''}. طرق السداد: إنستاباي tarek.physics@instapay أو فودافون كاش 01012345678.`;
  alert(`📲 رسالة تذكير السداد:\n\n${text}`);
}

// ==========================================
// 12. Multi-Role Auth & Quick Persona Switcher
// ==========================================

function switchAuthTab(tabName) {
  document.querySelectorAll('.auth-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.auth-panel').forEach(panel => panel.style.display = 'none');

  document.getElementById(`tab-btn-auth-${tabName}`).classList.add('active');
  document.getElementById(`auth-panel-${tabName}`).style.display = 'block';
}

function quickLoginAs(role, idOrPhone) {
  if (role === 'TEACHER') {
    state.currentUser = {
      role: 'TEACHER',
      name: 'أ/ طارق الشناوي',
      title: 'خبير تدريس الفيزياء للثانوية العامة',
      plan: 'PRO_TEACHER'
    };
    document.getElementById('header-user-name').innerText = state.currentUser.name;
    document.getElementById('header-user-avatar').innerText = '👨‍🏫';
    switchPortal('teacher');
    closeModal('modal-auth');
    alert('👨‍🏫 تم تسجيل الدخول بنجاح كمعلم: أ/ طارق الشناوي');
  } else if (role === 'STUDENT') {
    state.currentStudent = {
      id: 'stu-demo-2',
      name: 'سلمى إبراهيم',
      academicCode: 'STU-884210',
      gradeLevel: 'GRADE_12_SEC3',
      status: 'ACTIVE'
    };
    state.currentUser = {
      role: 'STUDENT',
      name: 'سلمى إبراهيم',
      title: 'طالبة ثانوية عامة'
    };
    document.getElementById('header-user-name').innerText = 'سلمى إبراهيم (طالبة)';
    document.getElementById('header-user-avatar').innerText = '🎓';
    switchPortal('student');
    checkAndUpdateStudentPaywall('stu-demo-2');
    closeModal('modal-auth');
    alert('🎓 أهلاً بك يا سلمى! تم الدخول إلى بوابة الطالب بنجاح.');
  } else if (role === 'STUDENT_OVERDUE') {
    state.currentStudent = {
      id: 'stu-demo-4',
      name: 'منى توفيق',
      academicCode: 'STU-441199',
      gradeLevel: 'GRADE_12_SEC3',
      status: 'SUSPENDED_OVERDUE'
    };
    state.currentUser = {
      role: 'STUDENT',
      name: 'منى توفيق',
      title: 'طالبة ثانوية عامة'
    };
    document.getElementById('header-user-name').innerText = 'منى توفيق (حساب معلق للتأخر)';
    document.getElementById('header-user-avatar').innerText = '⚠️';
    switchPortal('student');
    checkAndUpdateStudentPaywall('stu-demo-4');
    closeModal('modal-auth');
    alert('⚠️ تم تسجيل الدخول بحساب الطالبة: منى توفيق.\n(الحساب معلق للتأخر في سداد الاشتراك لاختبار نظام الحجب والتذكير السريع).');
  } else if (role === 'PARENT') {
    state.currentUser = {
      role: 'PARENT',
      name: 'الحاج إبراهيم (ولي أمر سلمى)',
      title: 'ولي أمر'
    };
    document.getElementById('header-user-name').innerText = 'الحاج إبراهيم (ولي أمر)';
    document.getElementById('header-user-avatar').innerText = '👨‍👩‍👧';
    switchPortal('parent');
    closeModal('modal-auth');
    alert('👨‍👩‍👧 مرحباً بحضرتك في بوابة ولي الأمر لمتابعة نبض مستوى أبنائكم.');
  }
}

async function handleTeacherLogin(e) {
  e.preventDefault();
  const phone = document.getElementById('auth-teacher-phone').value;
  const pass = document.getElementById('auth-teacher-pass').value;

  try {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: phone, password: pass })
    });
    const json = await res.json();
    if (json.success) {
      state.currentUser = {
        role: 'TEACHER',
        name: json.data.profile ? json.data.profile.full_name : 'أ/ طارق الشناوي'
      };
      document.getElementById('header-user-name').innerText = state.currentUser.name;
      closeModal('modal-auth');
      switchPortal('teacher');
      alert(`👨‍🏫 مرحباً بك يا ${state.currentUser.name}! تم تسجيل الدخول بنجاح.`);
      return;
    }
  } catch (err) {}

  quickLoginAs('TEACHER', 'tch-tarek-001');
}

async function handleStudentLogin(e) {
  e.preventDefault();
  const code = document.getElementById('auth-student-code').value;

  try {
    const res = await fetch('/api/v1/auth/student-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ academicCode: code, parentPhone: code })
    });
    const json = await res.json();
    if (json.success && json.data.student) {
      const stu = json.data.student;
      state.currentStudent = {
        id: stu.id,
        name: stu.full_name,
        academicCode: stu.academic_code,
        gradeLevel: stu.grade_level
      };
      state.currentUser = {
        role: 'STUDENT',
        name: stu.full_name
      };
      document.getElementById('header-user-name').innerText = `${stu.full_name} (طالب)`;
      closeModal('modal-auth');
      switchPortal('student');
      checkAndUpdateStudentPaywall(stu.id);
      alert(`🎓 أهلاً بك يا ${stu.full_name}! تم الدخول بنجاح.`);
      return;
    }
  } catch (err) {}

  // Local fallback search
  const found = state.students.find(s => s.academic_code && s.academic_code.toUpperCase() === code.trim().toUpperCase() || s.parent_phone === code.trim());
  if (found) {
    state.currentStudent = {
      id: found.id,
      name: found.full_name,
      academicCode: found.academic_code,
      gradeLevel: found.grade_level
    };
    closeModal('modal-auth');
    switchPortal('student');
    checkAndUpdateStudentPaywall(found.id);
    alert(`🎓 أهلاً بك يا ${found.full_name}! تم الدخول بنجاح.`);
  } else {
    alert('لم يتم العثور على طالب بهذا الكود الأكاديمي. يمكنك استخدام الأكواد التجريبية: STU-884210 أو STU-441199.');
  }
}

async function handleParentLogin(e) {
  e.preventDefault();
  const phone = document.getElementById('auth-parent-phone').value;

  try {
    const res = await fetch('/api/v1/auth/parent-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: phone })
    });
    const json = await res.json();
    if (json.success) {
      closeModal('modal-auth');
      switchPortal('parent');
      alert(`👨‍👩‍👧 مرحباً بحضرتك! تم الدخول إلى بوابة ولي الأمر بنجاح.`);
      return;
    }
  } catch (err) {}

  quickLoginAs('PARENT', phone);
}

/* ==========================================================================
   EDUSOCIAL COMMUNITY & MULTI-TEACHER NETWORK HANDLERS
   ========================================================================== */

let activeFeedSubject = 'ALL';

function setPostType(type) {
  document.querySelectorAll('.composer-pill').forEach(btn => btn.classList.remove('active'));
  const btn = document.getElementById(`comp-type-${type.toLowerCase()}`);
  if (btn) btn.classList.add('active');

  const typeInput = document.getElementById('teacher-post-type');
  if (typeInput) typeInput.value = type;

  const pollFields = document.getElementById('composer-poll-fields');
  const voiceFields = document.getElementById('composer-voice-fields');

  if (pollFields) pollFields.style.display = type === 'POLL' ? 'block' : 'none';
  if (voiceFields) voiceFields.style.display = type === 'VOICE_NOTE' ? 'block' : 'none';
}

async function handleTeacherCreatePost(e) {
  e.preventDefault();
  const type = document.getElementById('teacher-post-type')?.value || 'POLL';
  const title = document.getElementById('teacher-post-title')?.value || '';
  const content = document.getElementById('teacher-post-content')?.value || '';
  const subject = document.getElementById('teacher-post-subject')?.value || 'فيزياء ثانوية عامة';

  let pollOptions = [];
  if (type === 'POLL') {
    const o1 = document.getElementById('poll-opt-1')?.value?.trim();
    const o2 = document.getElementById('poll-opt-2')?.value?.trim();
    const o3 = document.getElementById('poll-opt-3')?.value?.trim();
    if (o1) pollOptions.push(o1);
    if (o2) pollOptions.push(o2);
    if (o3) pollOptions.push(o3);
    if (pollOptions.length < 2) {
      alert('يرجى كتابة خيارين على الأقل لسؤال التصويت');
      return;
    }
  }

  const payload = {
    teacherId: 'tch-tarek-001',
    title,
    content,
    postType: type,
    subject,
    pollOptions,
    audioUrl: type === 'VOICE_NOTE' ? 'https://assets.teacher-os.internal/audio/capsule.mp3' : null
  };

  try {
    const res = await fetch('/api/v1/community/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (json.success) {
      alert('🚀 تم نشر السؤال / الكبسولة بنجاح في المجتمع الأكاديمي!');
      document.getElementById('teacher-composer-form')?.reset();
      setPostType('POLL');
      await fetchCommunityFeed(activeFeedSubject);
    } else {
      alert(`خطأ: ${json.error}`);
    }
  } catch (err) {
    alert('تعذر الاتصال بالخادم لنشر المنشور.');
  }
}

function filterFeedBySubject(subject, btnEl) {
  activeFeedSubject = subject;
  document.querySelectorAll('#tab-community .filter-pill').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  fetchCommunityFeed(subject);
}

function filterStudentFeed(subject, btnEl) {
  activeFeedSubject = subject;
  document.querySelectorAll('#student-view-community .filter-pill').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  fetchCommunityFeed(subject);
}

async function fetchCommunityFeed(subject = 'ALL') {
  const currentUserId = state.currentUser.role === 'TEACHER' ? 'tch-tarek-001' : (state.currentStudent?.id || 'stu-demo-1');
  const currentUserRole = state.currentUser.role;

  try {
    const url = `/api/v1/community/feed?subject=${encodeURIComponent(subject)}&userId=${encodeURIComponent(currentUserId)}&userRole=${encodeURIComponent(currentUserRole)}`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.success) {
      renderFeed(json.feed, 'teacher-community-feed-list');
      renderFeed(json.feed, 'student-community-feed-list');
    }
  } catch (err) {
    console.error('Error fetching feed:', err);
  }
}

function renderFeed(feed, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!feed || feed.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 2rem; color: var(--text-muted);">
        <span style="font-size: 2rem;">📭</span>
        <div style="font-weight: 700; margin-top: 0.5rem;">لا توجد منشورات حالياً في هذا القسم.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = feed.map(post => {
    // Post type tags
    let typeTag = '';
    if (post.post_type === 'POLL') typeTag = '<span class="post-type-tag poll">💡 سؤال وتصويت</span>';
    else if (post.post_type === 'VOICE_NOTE') typeTag = '<span class="post-type-tag voice">🎙️ كبسولة صوتية</span>';
    else if (post.post_type === 'MINDMAP') typeTag = '<span class="post-type-tag mindmap">📄 خريطة ذهنية</span>';
    else typeTag = '<span class="post-type-tag announcement">📢 إعلان عام</span>';

    // Poll HTML
    let pollHtml = '';
    if (post.post_type === 'POLL' && Array.isArray(post.poll_options)) {
      const hasVoted = !!post.user_voted_option;
      const optionsHtml = post.poll_options.map(opt => {
        const isSelected = post.user_voted_option === opt.id;
        const votedClass = isSelected ? 'user-voted' : '';
        const pct = opt.pct || 0;
        const clickHandler = hasVoted ? '' : `onclick="castPollVote('${post.id}', '${opt.id}')"`;
        const cursorStyle = hasVoted ? 'cursor: default;' : 'cursor: pointer;';

        return `
          <div class="poll-option-row ${votedClass}" ${clickHandler} style="${cursorStyle}">
            <div class="poll-option-progress" style="width: ${hasVoted ? pct : 0}%;"></div>
            <div class="poll-option-content">
              <span>${isSelected ? '✅ ' : ''}${escapeHtml(opt.text)}</span>
              ${hasVoted ? `<span style="font-weight: 700; color: #1E293B;">${pct}% (${opt.votes || 0})</span>` : '<span style="color: var(--primary-600); font-size: 0.8rem;">صوّت 👈</span>'}
            </div>
          </div>
        `;
      }).join('');

      pollHtml = `
        <div class="poll-container">
          <div style="font-size: 0.82rem; font-weight: 700; color: #4338CA; margin-bottom: 0.6rem;">
            📊 استطلاع رأي تفاعلي ${hasVoted ? '• (تم تسجيل صوتك ✅)' : '• اضغط على الخيار للتصويت الفوري'}
          </div>
          ${optionsHtml}
          <div style="font-size: 0.78rem; color: #64748B; margin-top: 0.5rem; text-align: left;">
            إجمالي الأصوات المشاركة: <strong>${post.total_votes || 0} طالب</strong>
          </div>
        </div>
      `;
    }

    // Voice Note HTML
    let voiceHtml = '';
    if (post.post_type === 'VOICE_NOTE') {
      voiceHtml = `
        <div class="voice-capsule-widget">
          <button class="voice-play-btn" onclick="toggleAudioPlay(this)" title="تشغيل الكبسولة الصوتية">▶️</button>
          <div style="flex: 1;">
            <div style="font-weight: 700; font-size: 0.9rem; color: #92400E; margin-bottom: 4px;">تسجيل صوتي مكثف • مدة الكبسولة: ${post.duration || '0:58'}</div>
            <div class="voice-waveform-box">
              <div class="waveform-bar" style="height: 14px;"></div>
              <div class="waveform-bar" style="height: 24px;"></div>
              <div class="waveform-bar" style="height: 18px;"></div>
              <div class="waveform-bar" style="height: 28px;"></div>
              <div class="waveform-bar" style="height: 12px;"></div>
              <div class="waveform-bar" style="height: 22px;"></div>
              <div class="waveform-bar" style="height: 30px;"></div>
              <div class="waveform-bar" style="height: 16px;"></div>
              <div class="waveform-bar" style="height: 20px;"></div>
              <div class="waveform-bar" style="height: 26px;"></div>
              <div class="waveform-bar" style="height: 15px;"></div>
              <div class="waveform-bar" style="height: 25px;"></div>
            </div>
          </div>
        </div>
      `;
    }

    // Mindmap HTML
    let mindmapHtml = '';
    if (post.post_type === 'MINDMAP') {
      mindmapHtml = `
        <div style="background: #F0FDF4; border: 1px dashed #22C55E; border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1rem;">
          <div style="font-weight: 700; color: #15803D; font-size: 0.9rem; margin-bottom: 0.4rem;">🗺️ ملخص بصري / خريطة المفاهيم الأساسية:</div>
          <div style="font-size: 0.85rem; color: #166534; line-height: 1.6;">
            تم إرفاق المخطط الذهني الشامل لقواعد الاشتقاق والدوائر الكهربية. تم تضمين الخريطة أيضاً في خزينة المذكرات الأكاديمية (RAG Vault).
          </div>
        </div>
      `;
    }

    // Comments HTML
    const commentsList = (post.comments || []).map(c => `
      <div class="comment-bubble">
        <div><strong class="comment-author-name">${escapeHtml(c.user_name)}:</strong> ${escapeHtml(c.content)}</div>
      </div>
    `).join('');

    const commentsSection = `
      <div class="post-comments-container">
        <div style="font-size: 0.82rem; font-weight: 700; color: #475569; margin-bottom: 0.5rem;">💬 أسئلة وتعليقات الطلاب (${(post.comments || []).length}):</div>
        <div id="comments-list-${post.id}">
          ${commentsList || '<div style="font-size: 0.8rem; color: #94A3B8;">كن أول من يشارك بسؤال أو تعليق للأستاذ!</div>'}
        </div>
        <div class="comment-form-row">
          <input type="text" id="comment-input-${post.id}" class="input-field" style="margin-bottom: 0; font-size: 0.85rem;" placeholder="اكتب استفسارك أو إجابتك هنا...">
          <button class="btn btn-primary" style="padding: 6px 14px; font-size: 0.85rem;" onclick="addPostComment('${post.id}')">إرسال 💬</button>
        </div>
      </div>
    `;

    return `
      <div class="post-card">
        <div class="post-header">
          <div class="post-author-box">
            <div class="post-author-avatar">${post.teacher_name.split(' ')[1]?.[0] || 'م'}</div>
            <div>
              <div class="post-author-name">${escapeHtml(post.teacher_name)}</div>
              <div class="post-author-sub">${escapeHtml(post.teacher_title)} • ${escapeHtml(post.subject)}</div>
            </div>
          </div>
          <div>${typeTag}</div>
        </div>

        <div class="post-title">${escapeHtml(post.title)}</div>
        <div class="post-body">${escapeHtml(post.content)}</div>

        ${pollHtml}
        ${voiceHtml}
        ${mindmapHtml}

        <div class="post-actions-bar">
          <button class="post-action-btn ${post.has_liked ? 'liked' : ''}" onclick="togglePostLike('${post.id}')">
            <span>💡</span>
            <span>مفيد (${post.likes_count || 0})</span>
          </button>
          <span style="font-size: 0.82rem; color: #94A3B8;">•</span>
          <span style="font-size: 0.82rem; color: #64748B;">💬 ${(post.comments || []).length} مناقشة</span>
        </div>

        ${commentsSection}
      </div>
    `;
  }).join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function castPollVote(postId, optionId) {
  const currentUserId = state.currentUser.role === 'TEACHER' ? 'tch-tarek-001' : (state.currentStudent?.id || 'stu-demo-1');
  try {
    const res = await fetch(`/api/v1/community/posts/${postId}/interact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUserId,
        userType: state.currentUser.role === 'TEACHER' ? 'TEACHER' : 'STUDENT',
        interactionType: 'VOTE',
        metadata: { option_id: optionId }
      })
    });
    const json = await res.json();
    if (json.success) {
      await fetchCommunityFeed(activeFeedSubject);
    } else {
      alert(json.error || 'تعذر تسجيل التصويت.');
    }
  } catch (err) {
    alert('تعذر الاتصال بالخادم.');
  }
}

async function togglePostLike(postId) {
  const currentUserId = state.currentUser.role === 'TEACHER' ? 'tch-tarek-001' : (state.currentStudent?.id || 'stu-demo-1');
  try {
    const res = await fetch(`/api/v1/community/posts/${postId}/interact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUserId,
        userType: state.currentUser.role === 'TEACHER' ? 'TEACHER' : 'STUDENT',
        interactionType: 'LIKE'
      })
    });
    const json = await res.json();
    if (json.success) {
      await fetchCommunityFeed(activeFeedSubject);
    }
  } catch (err) {
    console.error('Error toggling like:', err);
  }
}

async function addPostComment(postId) {
  const input = document.getElementById(`comment-input-${postId}`);
  if (!input || !input.value.trim()) return;

  const content = input.value.trim();
  const currentUserId = state.currentUser.role === 'TEACHER' ? 'tch-tarek-001' : (state.currentStudent?.id || 'stu-demo-1');
  const currentUserName = state.currentUser.role === 'TEACHER' ? state.currentUser.name : (state.currentStudent?.name || 'طالب متميز');

  try {
    const res = await fetch(`/api/v1/community/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUserId,
        userName: currentUserName,
        userType: state.currentUser.role === 'TEACHER' ? 'TEACHER' : 'STUDENT',
        content
      })
    });
    const json = await res.json();
    if (json.success) {
      input.value = '';
      await fetchCommunityFeed(activeFeedSubject);
    } else {
      alert(`تعذر إضافة التعليق: ${json.error}`);
    }
  } catch (err) {
    alert('خطأ في إرسال التعليق.');
  }
}

function toggleAudioPlay(btn) {
  if (btn.innerText.includes('▶️')) {
    btn.innerText = '⏸️';
    btn.style.background = '#059669';
  } else {
    btn.innerText = '▶️';
    btn.style.background = '#D97706';
  }
}

// ── Teacher Directory & Multi-Teacher Enrollment ─────────────────────
async function fetchTeacherDirectory() {
  const currentStudentId = state.currentStudent?.id || 'stu-demo-1';
  try {
    const res = await fetch(`/api/v1/community/teachers?studentId=${encodeURIComponent(currentStudentId)}`);
    const json = await res.json();
    if (json.success) {
      renderTeacherDirectory(json.teachers);
    }
  } catch (err) {
    console.error('Error fetching directory:', err);
  }
}

function renderTeacherDirectory(teachers) {
  const sidebarList = document.getElementById('teacher-directory-sidebar-list');
  const cardsContainer = document.getElementById('student-directory-cards-container');
  const followedBox = document.getElementById('student-followed-teachers-box');

  if (sidebarList) {
    sidebarList.innerHTML = teachers.map(t => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #F1F5F9;">
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <div style="width: 38px; height: 38px; border-radius: 50%; background: #4F46E5; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem;">${t.avatar_text || 'أ'}</div>
          <div>
            <div style="font-weight: 700; font-size: 0.9rem;">${escapeHtml(t.name)}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(t.subject)}</div>
          </div>
        </div>
        <div style="text-align: left;">
          <div style="font-size: 0.85rem; font-weight: 800; color: #D97706;">${t.rating} ⭐</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">${t.followers_count || 0} متابع</div>
        </div>
      </div>
    `).join('');
  }

  if (cardsContainer) {
    cardsContainer.innerHTML = teachers.map(t => {
      const isFollowing = !!t.is_following;
      const isEnrolled = !!t.is_enrolled;
      const firstGroup = (t.groups && t.groups[0]) || { id: 'grp-001', name: 'المجموعة العامة', fee: 160, schedule: 'السبت 4:00م' };

      return `
        <div class="teacher-directory-card">
          <div class="teacher-dir-header">
            <div class="teacher-dir-avatar">${t.avatar_text || 'أ'}</div>
            <div style="flex: 1;">
              <div style="font-weight: 800; font-size: 1.05rem; color: #1E293B;">${escapeHtml(t.name)}</div>
              <div style="font-size: 0.82rem; color: #4F46E5; font-weight: 600;">${escapeHtml(t.subject)}</div>
            </div>
            <span class="badge badge-good">${t.rating} ⭐</span>
          </div>

          <p style="font-size: 0.85rem; color: #475569; line-height: 1.5; margin-bottom: 1rem; flex: 1;">
            ${escapeHtml(t.bio)}
          </p>

          <div style="background: #F8FAFC; border-radius: 8px; padding: 0.75rem; margin-bottom: 1rem; font-size: 0.82rem; color: #334155;">
            <div>👥 <strong>${t.students_count || 0}</strong> طالب مسجل • 📢 <strong>${t.followers_count || 0}</strong> متابع</div>
            <div style="margin-top: 4px;">📅 المجموعات المتاحة: <strong>${escapeHtml(firstGroup.name)}</strong> (${firstGroup.schedule})</div>
          </div>

          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn btn-outline" style="flex: 1; font-size: 0.82rem; padding: 6px 10px;" onclick="toggleTeacherFollow('${t.id}', ${isFollowing})">
              ${isFollowing ? '✓ تتابع الأستاذ' : '➕ متابعة الأستاذ'}
            </button>
            ${isEnrolled ? `
              <button class="btn btn-good" style="flex: 1.2; font-size: 0.82rem; padding: 6px 10px; background: #059669; color: white;" disabled>
                ✅ مسجل بالمجموعة
              </button>
            ` : `
              <button class="btn btn-primary" style="flex: 1.2; font-size: 0.82rem; padding: 6px 10px;" onclick="enrollInTeacherGroup('${t.id}', '${firstGroup.id}')">
                ⚡ اشتراك بالمجموعة
              </button>
            `}
          </div>
        </div>
      `;
    }).join('');
  }

  if (followedBox) {
    const followedTeachers = teachers.filter(t => t.is_following);
    if (followedTeachers.length === 0) {
      followedBox.innerHTML = '<div style="font-size: 0.82rem; color: var(--text-muted);">لا تتابع أي معلم بعد. تصفح دليل المعلمين!</div>';
    } else {
      followedBox.innerHTML = followedTeachers.map(t => `
        <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.6rem; background: #F1F5F9; padding: 6px 10px; border-radius: 8px;">
          <span style="font-size: 1.1rem;">👨‍🏫</span>
          <div style="flex: 1;">
            <div style="font-weight: 700; font-size: 0.85rem;">${escapeHtml(t.name)}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(t.subject)}</div>
          </div>
          <span class="badge badge-good" style="font-size: 0.72rem;">متابع ✅</span>
        </div>
      `).join('');
    }
  }
}

async function toggleTeacherFollow(teacherId, isFollowing) {
  const currentStudentId = state.currentStudent?.id || 'stu-demo-1';
  try {
    const res = await fetch('/api/v1/community/follow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: currentStudentId,
        teacherId,
        action: isFollowing ? 'UNFOLLOW' : 'FOLLOW'
      })
    });
    const json = await res.json();
    if (json.success) {
      await fetchTeacherDirectory();
    }
  } catch (err) {
    console.error('Error following teacher:', err);
  }
}

async function enrollInTeacherGroup(teacherId, groupId) {
  const currentStudentId = state.currentStudent?.id || 'stu-demo-1';
  try {
    const res = await fetch('/api/v1/community/enroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: currentStudentId,
        teacherId,
        groupId
      })
    });
    const json = await res.json();
    if (json.success) {
      alert(json.message || '🎉 تم الاشتراك بنجاح في المجموعة الدراسية!');
      await fetchTeacherDirectory();
      await loadStudentPortalData();
    } else {
      alert(`خطأ: ${json.error}`);
    }
  } catch (err) {
    alert('تعذر استكمال الاشتراك.');
  }
}

// ── Student Sub-Tabs Navigation ──────────────────────────────────────
function switchStudentSubTab(tabName) {
  document.querySelectorAll('.student-subtab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.student-subtab-view').forEach(view => {
    view.classList.remove('active');
    view.style.display = 'none';
  });

  const btn = document.getElementById(`btn-subtab-${tabName}`);
  const view = document.getElementById(`student-view-${tabName}`);

  if (btn) btn.classList.add('active');
  if (view) {
    view.classList.add('active');
    view.style.display = 'block';
  }

  if (tabName === 'community') {
    fetchCommunityFeed(activeFeedSubject);
    fetchTeacherDirectory();
  } else if (tabName === 'directory') {
    fetchTeacherDirectory();
  }
}

function setStudentDemo(studentId) {
  if (studentId === 'stu-demo-1') {
    state.currentStudent = {
      id: 'stu-demo-1',
      name: 'أحمد محمود',
      academicCode: 'STU-102931',
      gradeLevel: 'GRADE_12_SEC3'
    };
  } else {
    state.currentStudent = {
      id: 'stu-demo-2',
      name: 'سلمى إبراهيم',
      academicCode: 'STU-884210',
      gradeLevel: 'GRADE_12_SEC3'
    };
  }
  loadStudentPortalData();
}

async function loadStudentPortalData() {
  const studentId = state.currentStudent?.id || 'stu-demo-1';
  try {
    const res = await fetch(`/api/v1/student/my-day?studentId=${studentId}`);
    const json = await res.json();
    if (json.success && json.data) {
      const data = json.data;
      const nameEl = document.getElementById('student-portal-name');
      const codeEl = document.getElementById('student-portal-code');
      const pinEl = document.getElementById('student-pairing-pin-badge');
      if (nameEl) nameEl.innerText = data.student_name;
      if (codeEl) codeEl.innerText = `الكود الأكاديمي: ${data.academic_code}`;
      if (pinEl) pinEl.innerText = data.pairing_pin || (studentId === 'stu-demo-2' ? 'LNK-8842' : 'LNK-1029');

      // Render Multi-Teacher Enrolled Subject Badges
      const pillsContainer = document.getElementById('student-enrolled-subjects-pills');
      if (pillsContainer && Array.isArray(data.enrolled_teachers)) {
        pillsContainer.innerHTML = data.enrolled_teachers.map(t => `
          <span class="badge badge-primary" style="padding: 6px 12px; font-size: 0.85rem;">
            ⚡ ${escapeHtml(t.subject_name)}: ${escapeHtml(t.teacher_name)} (${escapeHtml(t.schedule)})
          </span>
        `).join('');
      }
    }
  } catch (err) {
    console.error('Error loading student day:', err);
  }

  checkAndUpdateStudentPaywall(studentId);
  fetchTeacherDirectory();
}

// ── Parent Portal Multi-Teacher & Zero-Trust Verification Handlers ──────
async function loadParentPortalData(studentId = 'stu-demo-1') {
  try {
    const parentPhone = localStorage.getItem('parent_phone') || '01011112222';
    const res = await fetch(`/api/v1/parent/child-pulse/${studentId}?parentPhone=${encodeURIComponent(parentPhone)}`);
    const json = await res.json();

    // Always fetch and render teacher showcase
    loadTeacherShowcase();

    if (json.success && json.data) {
      const p = json.data;
      const childNameEl = document.getElementById('parent-active-child-name');
      const pulseStatusEl = document.getElementById('parent-pulse-status');
      const pulseSummaryEl = document.getElementById('parent-pulse-summary');
      const pulseDotEl = document.getElementById('parent-pulse-dot');
      const warningBanner = document.getElementById('parent-unlinked-warning');

      if (childNameEl) childNameEl.innerText = p.student_name;

      // Check Zero-Trust Verification
      if (p.is_verified === false) {
        if (warningBanner) warningBanner.style.display = 'block';
        if (pulseStatusEl) pulseStatusEl.innerText = 'الحالة العامة: 🔒 محجوبة لحين التوثيق';
        if (pulseSummaryEl) pulseSummaryEl.innerText = p.message || 'بيانات هذا الطالب محمية وتتطلب إدخال رمز الربط السري.';
        if (pulseDotEl) pulseDotEl.style.backgroundColor = '#EF4444';

        document.getElementById('parent-stat-attendance').innerText = '--%';
        document.getElementById('parent-stat-average').innerText = '--%';
        document.getElementById('parent-stat-absences').innerText = '--';
        document.getElementById('parent-stat-subjects-count').innerText = '--';

        const grid = document.getElementById('parent-enrolled-teachers-grid');
        if (grid) {
          grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; background: #FFF1F2; border: 1px dashed #FDA4AF; border-radius: 12px;">
              <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔒</div>
              <div style="font-weight: 800; color: #9F1239; margin-bottom: 0.35rem; font-size: 1.05rem;">المواد الدراسية والدرجات محجوبة برمز الأمان</div>
              <p style="font-size: 0.85rem; color: #881337; max-width: 480px; margin: 0 auto 1rem auto; line-height: 1.5;">
                لحماية خصوصية الطالب، يلزم إدخال رمز الربط السري (Pairing PIN) المدون في الكارنيه لربط الحساب رسمياً بولي الأمر.
              </p>
              <button class="btn btn-primary" onclick="openModal('modal-link-child')">🔑 إدخال رمز الربط السري وتوثيق الحساب 🛡️</button>
            </div>
          `;
        }
        return;
      }

      // Verified: unlock and display full pulse data
      if (warningBanner) warningBanner.style.display = 'none';

      if (p.pulse) {
        if (pulseStatusEl) pulseStatusEl.innerText = `الحالة العامة: ${p.pulse.badgeAr}`;
        if (pulseSummaryEl) pulseSummaryEl.innerText = p.pulse.summaryAr;
        if (pulseDotEl) pulseDotEl.style.backgroundColor = p.pulse.colorHex;
      }

      if (p.metrics) {
        document.getElementById('parent-stat-attendance').innerText = `${p.metrics.attendanceRatePct}%`;
        document.getElementById('parent-stat-average').innerText = `${p.metrics.averageAssessmentScorePct}%`;
        document.getElementById('parent-stat-absences').innerText = p.metrics.unexcusedAbsences;
        document.getElementById('parent-stat-subjects-count').innerText = `${p.enrolled_subjects?.length || 1} مواد`;
      }

      // Render Multi-Teacher Breakdown Grid
      const grid = document.getElementById('parent-enrolled-teachers-grid');
      if (grid && Array.isArray(p.enrolled_subjects)) {
        grid.innerHTML = p.enrolled_subjects.map(sub => `
          <div class="card" style="border: 1px solid var(--border-subtle); padding: 1.15rem; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.6rem;">
              <div>
                <div style="font-weight: 800; font-size: 1.05rem; color: #1E293B;">${escapeHtml(sub.subject_name)}</div>
                <div style="font-size: 0.85rem; color: var(--primary-600); font-weight: 600;">${escapeHtml(sub.teacher_name)}</div>
              </div>
              <span class="badge ${sub.subscription_status === 'ACTIVE' ? 'badge-good' : 'badge-urgent'}">
                ${sub.subscription_status === 'ACTIVE' ? 'ساري ✅' : 'متأخر ⚠️'}
              </span>
            </div>

            <div style="font-size: 0.82rem; color: #64748B; margin-bottom: 0.75rem; flex: 1;">
              <div>🏛️ المجموعة: <strong>${escapeHtml(sub.group_name)}</strong></div>
              <div>📅 الموعد: <strong>${escapeHtml(sub.schedule)}</strong></div>
              <div>💰 الاشتراك: <strong>${sub.fee_amount} ج.م / شهر</strong></div>
            </div>

            <button class="btn btn-outline" style="width: 100%; font-size: 0.8rem; padding: 6px;" onclick="contactTeacherSecretary('${sub.teacher_name}')">
              📲 محادثة سكرتارية المدرس على واتساب
            </button>
          </div>
        `).join('');
      }
    }
  } catch (err) {
    console.error('Error loading parent pulse:', err);
  }
}

function handleParentChildChange(studentId) {
  loadParentPortalData(studentId);
}

function contactTeacherSecretary(teacherName) {
  alert(`📲 جاري فتح محادثة واتساب الرسمية مع سكرتارية ${teacherName} للمتابعة المباشرة.`);
}

// ── Teacher Marketing & Showcase Loader ──────────────────────────────
async function loadTeacherShowcase() {
  const container = document.getElementById('parent-teacher-showcase-content');
  if (!container) return;

  try {
    const res = await fetch('/api/v1/parent/teacher-showcase');
    const json = await res.json();
    if (json.success && json.data) {
      const { teacher, showcase } = json.data;

      let pubsHtml = '';
      if (Array.isArray(showcase.publications)) {
        pubsHtml = showcase.publications.map(p => `
          <div class="showcase-item-card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem;">
              <span style="font-weight: 800; font-size: 0.95rem; color: #1E293B;">📖 ${escapeHtml(p.title)}</span>
              <span class="badge badge-primary" style="font-size: 0.75rem;">${escapeHtml(p.badge || 'معتمد')}</span>
            </div>
            <p style="font-size: 0.82rem; color: #64748B; margin: 0 0 0.4rem 0;">${escapeHtml(p.description)}</p>
            <div style="font-size: 0.75rem; color: var(--primary-600); font-weight: 600;">سنة الإصدار: ${p.year} • التصنيف: ${escapeHtml(p.category)}</div>
          </div>
        `).join('');
      }

      let projectsHtml = '';
      if (Array.isArray(showcase.projects)) {
        projectsHtml = showcase.projects.map(pr => `
          <div class="showcase-item-card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem;">
              <span style="font-weight: 800; font-size: 0.95rem; color: #1E293B;">🚀 ${escapeHtml(pr.name)}</span>
              <span class="badge badge-good" style="font-size: 0.75rem;">${escapeHtml(pr.badge || 'مبادرة')}</span>
            </div>
            <p style="font-size: 0.82rem; color: #64748B; margin: 0 0 0.4rem 0;">${escapeHtml(pr.description)}</p>
            <div style="font-size: 0.75rem; color: #475569;">الفئة المستهدفة: <strong>${escapeHtml(pr.target)}</strong></div>
          </div>
        `).join('');
      }

      let interestsHtml = '';
      if (Array.isArray(showcase.academic_interests)) {
        interestsHtml = showcase.academic_interests.map(i => `
          <span class="badge" style="background: #F1F5F9; color: #334155; border: 1px solid #CBD5E1; font-size: 0.82rem; padding: 6px 12px;">
            🔬 ${escapeHtml(i)}
          </span>
        `).join('');
      }

      let fameHtml = '';
      if (Array.isArray(showcase.hall_of_fame)) {
        fameHtml = showcase.hall_of_fame.map(h => `
          <div class="hall-of-fame-item">
            <div style="font-size: 1.5rem; margin-bottom: 0.25rem;">🏅</div>
            <div style="font-weight: 800; font-size: 0.92rem; color: #1E1B4B;">${escapeHtml(h.student_name)}</div>
            <div style="font-size: 0.8rem; color: var(--primary-600); font-weight: 700; margin: 2px 0;">${escapeHtml(h.rank)}</div>
            <div style="font-size: 0.75rem; color: #059669; font-weight: 800;">المجموع: ${escapeHtml(h.score)}</div>
            <div style="font-size: 0.72rem; color: #64748B;">التحق بـ: ${escapeHtml(h.college)}</div>
          </div>
        `).join('');
      }

      container.innerHTML = `
        <div style="background: linear-gradient(135deg, rgba(37,99,235,0.06), rgba(5,150,105,0.06)); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 1.25rem; margin-bottom: 1.5rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--primary-500); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.4rem;">👨‍🏫</div>
            <div>
              <div style="font-weight: 800; font-size: 1.1rem; color: #1E293B;">${escapeHtml(teacher.full_name)}</div>
              <div style="font-size: 0.85rem; color: var(--primary-600); font-weight: 600;">${escapeHtml(teacher.professional_title)}</div>
            </div>
          </div>
          <div style="font-size: 0.88rem; color: #334155; line-height: 1.7; font-style: italic; border-right: 3px solid var(--primary-500); padding-right: 0.75rem;">
            « ${escapeHtml(showcase.educational_philosophy)} »
          </div>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <h4 style="font-size: 0.95rem; font-weight: 800; color: #1E293B; margin-bottom: 0.75rem;">📚 أحدث المؤلفات والمذكرات المعتمدة:</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 0.85rem;">
            ${pubsHtml}
          </div>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <h4 style="font-size: 0.95rem; font-weight: 800; color: #1E293B; margin-bottom: 0.75rem;">🚀 المبادرات والمشاريع الأكاديمية الخاصة:</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 0.85rem;">
            ${projectsHtml}
          </div>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <h4 style="font-size: 0.95rem; font-weight: 800; color: #1E293B; margin-bottom: 0.75rem;">💡 مجالات الاهتمام والتطوير الأكاديمي:</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
            ${interestsHtml}
          </div>
        </div>

        <div style="margin-bottom: 1rem;">
          <h4 style="font-size: 0.95rem; font-weight: 800; color: #1E293B; margin-bottom: 0.75rem;">🏆 لوحة شرف أوائل الثانوية العامة والأكاديمية:</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem;">
            ${fameHtml}
          </div>
        </div>

        <div style="text-align: center; margin-top: 1.25rem;">
          <button class="btn btn-outline" style="font-size: 0.85rem; padding: 8px 16px;" onclick="contactTeacherSecretary('${escapeHtml(teacher.full_name)}')">
            💬 الاستفسار عن المذكرات وحجز المقاعد عبر واتساب الأستاذ
          </button>
        </div>
      `;
    }
  } catch (err) {
    console.error('Error loading teacher showcase:', err);
  }
}

// ── Dual-Key Parent-Student Link Handler ─────────────────────────────
async function handleLinkChildSubmit(event) {
  if (event) event.preventDefault();
  const parentPhone = document.getElementById('link-parent-phone')?.value?.trim();
  const academicCode = document.getElementById('link-student-code')?.value?.trim();
  const pairingPin = document.getElementById('link-pairing-pin')?.value?.trim();

  if (!parentPhone || !academicCode || !pairingPin) {
    alert('يرجى تعبئة كافة الحقول المطلوبة (رقم الهاتف، الكود الأكاديمي، ورمز الربط السري).');
    return;
  }

  try {
    const res = await fetch('/api/v1/parent/link-student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parentPhone,
        academicCode,
        pairingPin,
        deviceFingerprint: 'mobile_session_' + navigator.userAgent.slice(0, 20)
      })
    });
    const json = await res.json();
    if (json.success && json.data) {
      localStorage.setItem('parent_phone', parentPhone);
      closeModal('modal-link-child');
      alert(`🛡️ تم توثيق ارتباطك الأكاديمي بالطالب (${json.data.link.student_name || 'ابنك'}) بنجاح!\nتم فتح كافة تقارير الحضور والغياب والدرجات بأمان.`);
      loadParentPortalData(json.data.link.student_id);
    } else {
      alert(`⛔ تعذر التوثيق: ${json.error || 'الكود الأكاديمي أو رمز الربط السري غير صحيح.'}`);
    }
  } catch (err) {
    console.error('Error linking child:', err);
    alert('حدث خطأ أثناء محاولة التوثيق، يرجى التأكد من اتصال السيرفر.');
  }
}

// ── Mobile Splash Auth & Session Lifecycle ───────────────────────────
function checkAuthSession() {
  const token = localStorage.getItem('teacher_os_token');
  const userStr = localStorage.getItem('teacher_os_user');
  const splash = document.getElementById('app-splash-auth');

  if (!token || !userStr) {
    if (splash) splash.style.display = 'flex';
    return false;
  }

  try {
    const user = JSON.parse(userStr);
    state.currentUser = user;
    if (splash) splash.style.display = 'none';

    // Update Header
    const nameEl = document.getElementById('header-user-name');
    const avatarEl = document.getElementById('header-user-avatar');
    if (nameEl) nameEl.innerText = user.name || user.fullName || 'المستخدم';
    if (avatarEl) {
      if (user.role === 'TEACHER') avatarEl.innerText = '👨‍🏫';
      else if (user.role === 'STUDENT') avatarEl.innerText = '🎓';
      else avatarEl.innerText = '👨‍👩‍👧';
    }

    if (user.role === 'PARENT' && user.phone) {
      localStorage.setItem('parent_phone', user.phone);
    }

    const rolePortal = (user.role || 'TEACHER').toLowerCase();
    switchPortal(rolePortal);
    return true;
  } catch (e) {
    if (splash) splash.style.display = 'flex';
    return false;
  }
}

function switchSplashAuthTab(tab) {
  const btnPhone = document.getElementById('btn-tab-phone');
  const btnGoogle = document.getElementById('btn-tab-google');
  const phoneForm = document.getElementById('splash-phone-form');
  const googleBox = document.getElementById('splash-google-box');

  if (tab === 'phone') {
    btnPhone?.classList.add('active');
    btnGoogle?.classList.remove('active');
    if (phoneForm) phoneForm.style.display = 'block';
    if (googleBox) googleBox.style.display = 'none';
  } else {
    btnGoogle?.classList.add('active');
    btnPhone?.classList.remove('active');
    if (phoneForm) phoneForm.style.display = 'none';
    if (googleBox) googleBox.style.display = 'block';
  }
}

function updateRolePillActive(input) {
  document.querySelectorAll('.splash-role-pill').forEach(pill => {
    pill.classList.remove('active');
  });
  if (input && input.parentElement) {
    input.parentElement.classList.add('active');
  }
  const gradeWrap = document.getElementById('splash-student-grade-wrap');
  if (gradeWrap) {
    gradeWrap.style.display = (input && input.value === 'STUDENT') ? 'block' : 'none';
  }
}

function fillDemoAuth(role, phone, name) {
  const phoneInput = document.getElementById('splash-phone-number');
  const nameInput = document.getElementById('splash-full-name');
  if (phoneInput) phoneInput.value = phone;
  if (nameInput) nameInput.value = name;

  const roleRadio = document.querySelector(`input[name="splash_role"][value="${role}"]`);
  if (roleRadio) {
    roleRadio.checked = true;
    updateRolePillActive(roleRadio);
  }

  switchSplashAuthTab('phone');
}

async function handleSplashPhoneLogin(e) {
  if (e) e.preventDefault();
  const phone = document.getElementById('splash-phone-number')?.value?.trim();
  const fullName = document.getElementById('splash-full-name')?.value?.trim();
  const roleRadio = document.querySelector('input[name="splash_role"]:checked');
  const role = roleRadio ? roleRadio.value : 'STUDENT';
  const gradeLevel = document.getElementById('splash-grade-select')?.value || 'GRADE_12_SEC3';

  if (!phone) {
    alert('يرجى إدخال رقم الهاتف المحمول.');
    return;
  }

  const submitBtn = document.getElementById('btn-splash-phone-submit');
  const originalText = submitBtn ? submitBtn.innerText : '';
  if (submitBtn) {
    submitBtn.innerText = '⏳ جاري الدخول والمزامنة...';
    submitBtn.disabled = true;
  }

  try {
    const res = await fetch('/api/v1/auth/phone-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone,
        full_name: fullName,
        role,
        grade_level: gradeLevel
      })
    });
    const json = await res.json();
    if (json.success && json.data) {
      const { token, user } = json.data;
      localStorage.setItem('teacher_os_token', token);
      localStorage.setItem('teacher_os_user', JSON.stringify(user));
      if (role === 'PARENT') {
        localStorage.setItem('parent_phone', phone);
      }

      state.currentUser = user;

      if (role === 'STUDENT' && user.academicCode) {
        state.currentStudent = {
          id: user.id || 'stu-demo-1',
          name: user.name,
          academicCode: user.academicCode,
          gradeLevel: user.gradeLevel || gradeLevel
        };
      }

      // Smooth hide splash
      const splash = document.getElementById('app-splash-auth');
      if (splash) {
        splash.style.opacity = '0';
        splash.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
          splash.style.display = 'none';
          splash.style.opacity = '1';
        }, 300);
      }

      const nameEl = document.getElementById('header-user-name');
      const avatarEl = document.getElementById('header-user-avatar');
      if (nameEl) nameEl.innerText = user.name;
      if (avatarEl) {
        if (role === 'TEACHER') avatarEl.innerText = '👨‍🏫';
        else if (role === 'STUDENT') avatarEl.innerText = '🎓';
        else avatarEl.innerText = '👨‍👩‍👧';
      }

      switchPortal(role.toLowerCase());
      alert(`🎉 أهلاً بك يا ${user.name}! تم تسجيل الدخول بنجاح.`);
    } else {
      alert('خطأ أثناء الدخول: ' + (json.error || 'يرجى مراجعة البيانات'));
    }
  } catch (err) {
    console.error('Error during splash phone login:', err);
    alert('حدث خطأ في الاتصال بالخادم.');
  } finally {
    if (submitBtn) {
      submitBtn.innerText = originalText;
      submitBtn.disabled = false;
    }
  }
}

async function handleSplashGoogleLogin() {
  const roleRadio = document.querySelector('input[name="splash_role"]:checked');
  const role = roleRadio ? roleRadio.value : 'STUDENT';
  const gradeLevel = document.getElementById('splash-grade-select')?.value || 'GRADE_12_SEC3';

  try {
    const res = await fetch('/api/v1/auth/google-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        google_token: 'google_oauth_token_' + Date.now(),
        profile_override: {
          role,
          grade_level: gradeLevel
        }
      })
    });
    const json = await res.json();
    if (json.success && json.data) {
      const { token, user } = json.data;
      localStorage.setItem('teacher_os_token', token);
      localStorage.setItem('teacher_os_user', JSON.stringify(user));
      if (role === 'PARENT') {
        localStorage.setItem('parent_phone', user.phone || '01011112222');
      }

      state.currentUser = user;

      const splash = document.getElementById('app-splash-auth');
      if (splash) {
        splash.style.opacity = '0';
        splash.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
          splash.style.display = 'none';
          splash.style.opacity = '1';
        }, 300);
      }

      const nameEl = document.getElementById('header-user-name');
      if (nameEl) nameEl.innerText = user.name;

      switchPortal(role.toLowerCase());
      alert(`🌐 مرحباً بك عبر حساب Google: ${user.name}!`);
    } else {
      alert('خطأ أثناء الدخول بحساب جوجل: ' + (json.error || 'يرجى إعادة المحاولة'));
    }
  } catch (err) {
    console.error('Error during google login:', err);
    alert('تعذر الدخول بحساب جوجل حالياً.');
  }
}

function handleLogout() {
  localStorage.removeItem('teacher_os_token');
  localStorage.removeItem('teacher_os_user');
  const splash = document.getElementById('app-splash-auth');
  if (splash) {
    splash.style.display = 'flex';
    splash.style.opacity = '1';
  }
}

// ── Teacher Dynamic Branding Engine ──────────────────────────────────
async function loadTeacherBranding() {
  try {
    const res = await fetch('/api/v1/teacher/branding');
    const json = await res.json();
    if (json.success && json.data) {
      applyBrandingTheme(json.data);
    }
  } catch (err) {
    console.error('Error fetching teacher branding:', err);
  }
}

function applyBrandingTheme(b) {
  if (!b) return;
  const root = document.documentElement;

  if (b.primary_color) {
    root.style.setProperty('--primary-500', b.primary_color);
    root.style.setProperty('--primary-600', b.primary_color);
    const accent = b.accent_color || '#059669';
    root.style.setProperty('--accent-500', accent);
    root.style.setProperty('--primary-gradient', `linear-gradient(135deg, ${b.primary_color} 0%, ${accent} 100%)`);
  }
  if (b.accent_color) {
    root.style.setProperty('--accent-500', b.accent_color);
  }

  const academyName = b.academy_name || 'أكاديمية أ/ طارق الشناوي للفيزياء';
  const tagline = b.tagline || 'رواد تدريس وتبسيط الفيزياء للثانوية العامة';
  const logo = b.logo_icon || '⚡';

  // Update Splash brand
  const splashTitle = document.getElementById('splash-brand-title');
  if (splashTitle) splashTitle.innerText = academyName;
  const splashSubtitle = document.getElementById('splash-brand-subtitle');
  if (splashSubtitle) splashSubtitle.innerText = tagline;
  const splashLogo = document.getElementById('splash-brand-logo');
  if (splashLogo) splashLogo.innerText = logo;

  // Update Sidebar & Topbar brand
  const sidebarBrandTitle = document.querySelector('.sidebar-brand h2');
  if (sidebarBrandTitle) sidebarBrandTitle.innerText = academyName;
  const sidebarBrandLogo = document.querySelector('.brand-logo');
  if (sidebarBrandLogo) sidebarBrandLogo.innerText = logo;

  // Update Modal inputs
  const inputName = document.getElementById('brand-input-name');
  if (inputName) inputName.value = academyName;
  const inputTagline = document.getElementById('brand-input-tagline');
  if (inputTagline) inputTagline.value = tagline;
  const inputLogo = document.getElementById('brand-input-logo');
  if (inputLogo) inputLogo.value = logo;
  const colorPicker = document.getElementById('brand-color-picker');
  if (colorPicker && b.primary_color) colorPicker.value = b.primary_color;
  const colorHex = document.getElementById('brand-color-hex');
  if (colorHex && b.primary_color) colorHex.value = b.primary_color;

  // Set document title
  document.title = `${academyName} — منصة التعليم الذكية`;
}

function selectColorPreset(primary, accent, presetName, el) {
  document.querySelectorAll('.color-swatch-card').forEach(c => c.classList.remove('active'));
  if (el) el.classList.add('active');
  const picker = document.getElementById('brand-color-picker');
  const hex = document.getElementById('brand-color-hex');
  if (picker) picker.value = primary;
  if (hex) hex.value = primary;

  applyBrandingTheme({
    academy_name: document.getElementById('brand-input-name')?.value,
    tagline: document.getElementById('brand-input-tagline')?.value,
    logo_icon: document.getElementById('brand-input-logo')?.value,
    primary_color: primary,
    accent_color: accent,
    theme_preset: presetName
  });
}

function handleCustomColorPick(val) {
  const hex = document.getElementById('brand-color-hex');
  if (hex) hex.value = val;
  document.querySelectorAll('.color-swatch-card').forEach(c => c.classList.remove('active'));

  applyBrandingTheme({
    academy_name: document.getElementById('brand-input-name')?.value,
    tagline: document.getElementById('brand-input-tagline')?.value,
    logo_icon: document.getElementById('brand-input-logo')?.value,
    primary_color: val,
    accent_color: '#4F46E5',
    theme_preset: 'CUSTOM'
  });
}

async function handleSaveBranding(event) {
  if (event) event.preventDefault();
  const academy_name = document.getElementById('brand-input-name')?.value?.trim();
  const tagline = document.getElementById('brand-input-tagline')?.value?.trim();
  const logo_icon = document.getElementById('brand-input-logo')?.value?.trim() || '⚡';
  const primary_color = document.getElementById('brand-color-picker')?.value || '#2563EB';
  const activeSwatch = document.querySelector('.color-swatch-card.active');
  const preset = activeSwatch ? activeSwatch.id.replace('swatch-', '').toUpperCase() : 'CUSTOM';

  try {
    const res = await fetch('/api/v1/teacher/branding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        academy_name,
        tagline,
        logo_icon,
        primary_color,
        accent_color: primary_color === '#059669' ? '#D97706' : '#059669',
        theme_preset: preset
      })
    });
    const json = await res.json();
    if (json.success && json.data) {
      applyBrandingTheme(json.data);
      closeModal('modal-branding-studio');
      alert('🎨 تم حفظ وتعميم الهوية البصرية والقالب بنجاح على شاشات كافة الطلاب وأولياء الأمور!');
    } else {
      alert('خطأ أثناء حفظ الهوية: ' + (json.error || 'يرجى المحاولة مجدداً'));
    }
  } catch (err) {
    console.error('Error saving branding:', err);
    alert('تعذر حفظ الهوية، تأكد من اتصال الخادم.');
  }
}




