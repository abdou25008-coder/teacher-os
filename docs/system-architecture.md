# TEACHER OS — System Architecture & Technical Specifications

---

## 1. High-Level Architectural Paradigm

Teacher OS is engineered as a **Modular Clean Architecture System** with clear separation of concerns across presentation, API gateway, domain logic, data persistence, and AI orchestration.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                              │
│   • Flutter Mobile (Android-First, iOS, Web Admin)                     │
│   • Native Arabic Typography (Cairo), Dynamic RTL/LTR Layouts          │
│   • Riverpod Feature-First State Architecture                          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS (JSON / REST / WS)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   API GATEWAY & SECURITY LAYER                         │
│   • Rate Limiting & DoS Throttling                                     │
│   • JWT Authentication & Refresh Token Rotation                        │
│   • Role-Based Access Control (RBAC Guard)                             │
│   • Structured Correlation ID & Audit Logging                          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                    APPLICATION SERVICE MODULES                         │
│  ┌───────────────────────┐ ┌───────────────────────┐                   │
│  │   Auth & Multi-Tenant │ │  Teacher & Identity   │                   │
│  ├───────────────────────┤ ├───────────────────────┤                   │
│  │  Students & Groups    │ │  Sessions & Attendance│                   │
│  ├───────────────────────┤ ├───────────────────────┤                   │
│  │  Assessment Engine    │ │  Concept Mastery Miner│                   │
│  ├───────────────────────┤ ├───────────────────────┤                   │
│  │  AI Studio & RAG      │ │  Parent Communication │                   │
│  └───────────────────────┘ └───────────────────────┘                   │
└───────────────────┬───────────────────────────────┬────────────────────┘
                    │                               │
┌───────────────────▼───────────┐       ┌───────────▼────────────────────┐
│      PERSISTENCE LAYER        │       │      AI ENGINE ORCHESTRATOR    │
│  • PostgreSQL 16 (ACID Rel)   │       │  • Provider-Agnostic Bridge    │
│  • pgvector Cosine Embeddings │       │  • Structured Schema Validator │
│  • Redis Cache / In-Memory    │       │  • Prompt Registry (V1, V2)    │
│  • Row-Level Tenant Isolation │       │  • Human-in-the-Loop Safeguards│
└───────────────────────────────┘       └────────────────────────────────┘
```

---

## 2. Layer Definitions & Boundaries

### 2.1 Presentation Layer (Mobile Client)
- **Framework**: Flutter 3.x with Dart.
- **Pattern**: Clean Architecture (Presentation -> Application -> Domain -> Infrastructure).
- **Design Tokens**: Centralized semantic design tokens for padding, typography, colors, corner radii, and shadow elevations.
- **Offline Strategy**: Local repository caching with optimistic UI updates and background synchronization queues.

### 2.2 Domain & Application Layer
- **Pure Business Logic**: Zero dependencies on specific UI frameworks or external network SDKs.
- **Core Entities**: Immutable data transfer objects with domain-level validation.
- **Use Cases**: Encapsulated single-responsibility interactors (e.g., `SubmitAssessmentAttemptUseCase`, `CalculateConceptMasteryUseCase`, `GenerateLessonPlanUseCase`).

### 2.3 AI Orchestrator Bridge
- **Provider-Agnostic Interface**: Direct adapter interfaces (`generateStructuredOutput()`, `generateEmbeddings()`, `transcribeAudio()`) allowing instant switching between Gemini, Claude, and local open-source models.
- **Schema Validation**: All AI outputs pass through JSON Schema / Zod runtime validation before reaching the domain or database layers.
- **Autonomy Enforcement**: Level 1 (Suggestions) and Level 2 (Drafts) only; Level 3 requires explicit human confirmation; Level 4 is restricted to internal statistical background processing.
