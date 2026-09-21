# ADR-003: Provider-Agnostic AI Architecture & Prompt Registry

## Status
Accepted

## Context
AI model providers (Google Gemini, Anthropic Claude, OpenAI) evolve rapidly in terms of price, latency, context window, and Arabic dialect performance. Hardcoding direct vendor API calls creates extreme technical debt and vendor lock-in. Furthermore, raw uncontrolled prompt strings scattered throughout the codebase lead to unpredictable outputs and regressions.

## Decision
We implement a **Provider-Agnostic AI Engine Bridge** with a centralized, immutable **Prompt Registry** and strict runtime JSON Schema validation.

## Consequences
### Positive
- Zero vendor lock-in: Switching from Gemini to Claude or a local fine-tuned model requires zero changes in domain or presentation code.
- Guaranteed schema conformance: No raw markdown or unparsed strings can contaminate the database or cause frontend crashes.
- Granular cost tracking, token budget enforcement, and semantic caching per teacher.

### Negative
- Requires maintaining explicit TypeScript/Zod schemas and prompt version migration tests.
