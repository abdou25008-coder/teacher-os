# TEACHER OS — Security Model, RBAC & Data Privacy

---

## 1. Security Architecture & Threat Vectors

Teacher OS handles sensitive personal data including children's academic records, guardian contact details, and teacher business transactions. It implements defense-in-depth across the entire stack:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SECURITY PERIMETER                              │
│   • TLS 1.3 In-Transit Encryption                                      │
│   • JWT Auth with Short-Lived Access Tokens & Refresh Rotation         │
│   • Strict Rate Limiting (100 req/min per IP, 20 AI req/min per User)  │
│   • CORS & Helmet Security Headers                                     │
│   • Multi-Tenant Row-Level Security (RLS)                              │
│   • Full Audit Trail for Critical Actions (Grade edits, Broadcasts)    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Role-Based Access Control (RBAC) Matrix

| Entity / Action | ADMIN | TEACHER | ASSISTANT | STUDENT | PARENT |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Manage Organizations & System** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Create / Edit Lessons & Quizzes** | ✅ | ✅ | ❌ (View Only) | ❌ | ❌ |
| **Publish Assessments** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Take Assigned Assessments** | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Mark Attendance** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **View Financial / Business Metrics** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **View Own Intelligence Profile** | ❌ | ❌ | ❌ | ✅ | ❌ |
| **View Linked Child's Pulse** | ❌ | ❌ | ❌ | ❌ | ✅ (Linked Only)|

---

## 3. Child Privacy & Data Governance (COPPA / GDPR / Egyptian Data Law)
1. **Data Minimization**: Only strictly necessary educational fields are collected.
2. **Student-to-Student Isolation**: A student cannot inspect another student's scores, attempts, or contact info.
3. **No Training on Private Data**: User educational submissions are strictly excluded from public LLM training sets.
4. **Data Deletion & Portability**: Teachers can export their entire roster and curriculum database or delete their account irreversibly with 1 tap.
