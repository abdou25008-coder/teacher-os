# ADR-002: Modular Backend Architecture & Database Selection

## Status
Accepted

## Context
Teacher OS requires high concurrency for simultaneous assessment submissions, real-time attendance logging, multi-tenant row-level security, relational data integrity for the Teaching Intelligence Graph, and vector similarity search for the Teacher Knowledge Vault.

## Decision
We select a **Modular Clean Layered Core** with **PostgreSQL 16 + pgvector** as the single unified persistence engine.

## Consequences
### Positive
- Strict ACID transactions guarantee zero data loss or race conditions for attendance and student grades.
- `pgvector` eliminates the cost, maintenance, and latency of running a separate vector database (like Pinecone) while keeping embeddings in the same transactional boundary.
- Modular layer boundaries (API Gateway → Application Service → Domain Model → Repository Abstraction) allow isolated unit and integration testing without database coupling.

### Negative
- Requires careful index optimization on vector embeddings as chunk volume grows to millions of records (mitigated by IVFFlat / HNSW indexes).
