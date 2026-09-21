# TEACHER OS — Database Schema & Data Modeling

---

## 1. Relational Data Architecture (PostgreSQL 16)

The database schema is normalized to 3NF, uses UUIDv4 primary keys for distributed scalability, maintains explicit foreign keys for relational integrity, and integrates `pgvector` for semantic knowledge retrieval.

---

## 2. Core Tables & Entity-Relationship Schema

```sql
-- 1. Identity & Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    country_code VARCHAR(3) NOT NULL DEFAULT 'EGY',
    currency_code VARCHAR(3) NOT NULL DEFAULT 'EGP',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    phone_number VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('ADMIN', 'TEACHER', 'ASSISTANT', 'STUDENT', 'PARENT')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Teacher Profiles & Subjects
CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    professional_title VARCHAR(255),
    teaching_type VARCHAR(30) DEFAULT 'PRIVATE_TUTOR',
    preferred_tone VARCHAR(50) DEFAULT 'ENCOURAGING_PROFESSIONAL',
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    code VARCHAR(50) NOT NULL
);

CREATE TABLE curricula (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    grade_level VARCHAR(50) NOT NULL, -- e.g., 'GRADE_10', 'GRADE_12_SEC3'
    country_code VARCHAR(3) DEFAULT 'EGY',
    academic_year VARCHAR(20) NOT NULL
);

CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curriculum_id UUID REFERENCES curricula(id) ON DELETE CASCADE,
    title_ar VARCHAR(255) NOT NULL,
    title_en VARCHAR(255),
    order_index INT NOT NULL,
    description TEXT
);

CREATE TABLE concepts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL UNIQUE,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    difficulty_level VARCHAR(20) DEFAULT 'MEDIUM'
);

-- 3. Groups, Students & Sessions
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id),
    name VARCHAR(255) NOT NULL,
    grade_level VARCHAR(50) NOT NULL,
    max_capacity INT DEFAULT 50,
    session_fee NUMERIC(10, 2) DEFAULT 0.00,
    schedule_day VARCHAR(20),
    schedule_time VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    academic_code VARCHAR(50) UNIQUE NOT NULL,
    grade_level VARCHAR(50) NOT NULL,
    parent_phone VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE group_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, student_id)
);

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_mins INT DEFAULT 90,
    topic VARCHAR(255),
    status VARCHAR(20) DEFAULT 'SCHEDULED' -- SCHEDULED, COMPLETED, CANCELLED
);

CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED')),
    arrival_time TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, student_id)
);

-- 4. Assessments & Question Mapping
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id),
    title VARCHAR(255) NOT NULL,
    assessment_type VARCHAR(50) DEFAULT 'QUIZ', -- QUIZ, HOMEWORK, EXAM, REVISION
    duration_mins INT DEFAULT 30,
    total_marks NUMERIC(6, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PUBLISHED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assessment_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    concept_id UUID REFERENCES concepts(id),
    question_type VARCHAR(30) NOT NULL CHECK (question_type IN ('MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'PROBLEM_SOLVING')),
    prompt TEXT NOT NULL,
    options_json JSONB, -- Array of strings for MCQ
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    marks NUMERIC(5, 2) DEFAULT 1.00,
    order_index INT NOT NULL
);

-- 5. Student Attempts & Concept Mastery Engine
CREATE TABLE student_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP WITH TIME ZONE,
    total_score NUMERIC(6, 2) DEFAULT 0.00,
    percentage NUMERIC(5, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'COMPLETED'
);

CREATE TABLE student_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID REFERENCES student_attempts(id) ON DELETE CASCADE,
    question_id UUID REFERENCES assessment_questions(id) ON DELETE CASCADE,
    student_response TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    score_awarded NUMERIC(5, 2) NOT NULL,
    feedback TEXT
);

CREATE TABLE concept_mastery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    concept_id UUID REFERENCES concepts(id) ON DELETE CASCADE,
    mastery_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00, -- 0.00 to 1.00
    confidence_level VARCHAR(20) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH
    evidence_count INT DEFAULT 1,
    last_assessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, concept_id)
);

-- 6. Actionable Insights & Knowledge Vault (RAG)
CREATE TABLE insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    target_type VARCHAR(30) NOT NULL, -- GROUP, STUDENT, CONCEPT
    target_id UUID NOT NULL,
    title_ar VARCHAR(255) NOT NULL,
    confidence NUMERIC(3, 2) NOT NULL,
    evidence_json JSONB NOT NULL,
    recommendation_json JSONB NOT NULL,
    is_dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE knowledge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_url VARCHAR(512),
    extracted_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding vector(768) -- pgvector embedding column
);
```
