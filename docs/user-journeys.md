# TEACHER OS — User Journeys & Workflow Specifications

---

## 1. Teacher End-to-End Journey: The Closed-Loop Flow

```mermaid
sequenceDiagram
    autonumber
    actor Teacher as Mr. Tarek (Teacher)
    participant App as Teacher OS App
    participant AI as AI Studio & Engine
    participant DB as System DB & Graph
    actor Student as Salma (Student)
    actor Parent as Hajj Mahmoud (Parent)

    Note over Teacher, App: 1. Setup & Intelligent Day
    Teacher->>App: Opens App → Sees "My Intelligent Day"
    App-->>Teacher: Displays today's schedule & priority alert: "Group A weak in Ohm's Law"
    
    Note over Teacher, AI: 2. AI Lesson & Assessment Prep
    Teacher->>AI: Prompts: "Create 10-question quiz on Electric Current & Resistance"
    AI->>AI: Validates against Curriculum & Question Blueprints
    AI-->>Teacher: Generates formatted quiz (MCQ/TF) with concept mappings & answer key
    Teacher->>App: Reviews, adjusts 1 question, clicks "Publish & Assign"
    
    Note over App, Student: 3. Session & Assessment Delivery
    Teacher->>App: Marks 1-tap bulk attendance for Group A
    App->>DB: Records attendance & logs timeline
    App-->>Parent: Sends WhatsApp/App Pulse: "Salma attended Physics session"
    
    Student->>App: Opens Student Portal → Takes 10-Question Quiz
    Student->>App: Submits answers
    
    Note over App, DB: 4. Auto-Scoring & Gap Detection
    App->>DB: Scores objective questions instantly
    App->>DB: Mines mistake patterns → Maps failed questions to Concept "Parallel Resistance"
    DB->>DB: Updates Concept Mastery Score for Salma (Mastery: 45% - Needs Review)
    
    Note over DB, Teacher: 5. Closed-Loop Remediation
    DB-->>Teacher: Generates Actionable Insight: "38% of Group A failed Parallel Resistance"
    Teacher->>App: Clicks "Create 5-min Revision Card"
    App->>AI: Generates targeted micro-remediation worksheet
    Teacher->>Student: Assigns micro-revision for next session
```

---

## 2. Student Onboarding & Daily Learning Journey

1. **Invitation & Access**: Student enters unique Academic Code or phone number provided by the teacher.
2. **"My Learning Day" Dashboard**:
   - Next Session countdown & location.
   - Pending Homework & Active Quizzes.
   - Concept Health Radar: Strong concepts (Green) vs Concepts requiring review (Amber/Red).
3. **Interactive Socratic Quiz Experience**:
   - Time-bounded quiz interface.
   - Immediate explanatory feedback on submission.
   - "Ask AI Coach" for pedagogical hints on missed questions (without giving the direct solution).

---

## 3. Parent "Child Pulse" Journey

1. **Authentication**: Instant login via verified phone number (OTP).
2. **Child Card Overview**:
   - Single-screen summary per child.
   - Pulse Indicator: **"Good" (ممتاز)** / **"Needs Attention" (يحتاج متابعة)** / **"Action Recommended" (إجراء مطلوب)**.
3. **Transparent Event Feed**:
   - Attendance history (Session date, arrival status).
   - Homework submissions & Assessment scores.
   - Payment status (Paid / Due with 1-tap InstaPay/Fawry receipt verification).
