# TEACHER OS — API Specification (REST & OpenAPI 3.0 Standard)

---

## 1. API Architecture Conventions
- **Base URL**: `/api/v1`
- **Authentication**: Bearer JWT token in `Authorization` header.
- **Content-Type**: `application/json; charset=utf-8`
- **Standard Response Envelope**:
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "meta": {
    "correlationId": "req_a1b2c3d4",
    "timestamp": "2026-09-02T03:00:00.000Z"
  }
}
```

---

## 2. Core API Endpoints

### 2.1 Authentication & Profile
- `POST /api/v1/auth/register` — Register new teacher/user with role, phone, and password.
- `POST /api/v1/auth/login` — Authenticate and receive access & refresh tokens.
- `GET /api/v1/auth/me` — Retrieve current authenticated user session & permissions.

### 2.2 Teacher & Student Roster
- `GET /api/v1/teachers/profile` — Get teacher identity & preferences.
- `PUT /api/v1/teachers/profile` — Update teacher preferences & teaching styles.
- `POST /api/v1/groups` — Create new student group (name, subject, capacity, fee).
- `GET /api/v1/groups` — List teacher's groups with capacity metrics.
- `POST /api/v1/groups/:groupId/students` — Enroll student into group.
- `GET /api/v1/students/:studentId/profile` — Get full Student Intelligence Profile (attendance, grades, concept radar).

### 2.3 Sessions & Attendance
- `POST /api/v1/sessions` — Schedule teaching session for a group.
- `GET /api/v1/sessions` — List upcoming and past sessions with filters.
- `POST /api/v1/sessions/:sessionId/attendance` — Batch submit attendance records (status, notes).
- `GET /api/v1/sessions/:sessionId/attendance` — Retrieve session attendance roster.

### 2.4 AI Studio & Assessment Engine
- `POST /api/v1/ai/generate-lesson` — Generate structured lesson plan with hook, explanations, time distribution.
- `POST /api/v1/ai/generate-assessment` — Generate curriculum-aligned quiz with blueprints & concept mappings.
- `POST /api/v1/assessments` — Publish assessment to group.
- `GET /api/v1/assessments/:assessmentId` — Fetch assessment with question details.
- `POST /api/v1/assessments/:assessmentId/submit` — Submit student attempt (answers).
- `GET /api/v1/assessments/:assessmentId/results` — Fetch scored attempts, distribution, and concept mastery delta.

### 2.5 Insights & "My Intelligent Day"
- `GET /api/v1/insights/daily-planner` — Fetch "My Intelligent Day" prioritized recommendations and alerts.
- `GET /api/v1/insights/learning-gaps` — Retrieve high-frequency concept gaps across groups.
- `POST /api/v1/insights/:insightId/action` — Trigger 1-click remediation generator from insight.

### 2.6 Parent & Student Portals
- `GET /api/v1/parent/child-pulse/:studentId` — Retrieve simplified parent health card (attendance, scores, status).
- `GET /api/v1/student/my-day` — Retrieve student daily dashboard, upcoming deadlines, and weak concept challenges.
