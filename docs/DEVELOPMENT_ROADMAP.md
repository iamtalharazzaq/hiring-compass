# Development roadmap

Hiring Compass is implemented one sub-phase at a time so each foundation is usable before the next capability is added.

`[x]` Complete · `[ ]` Planned · `[-]` Deferred

## Phase 0 — Product definition

- [x] **0.1 Product and architecture** — Define the recruitment workflow, approval boundary, and modular-monolith direction.

## Phase 1 — Platform foundation

- [x] **1.1 Repository Bootstrap** — Development infrastructure, environment template, and monorepo setup.
- [x] **1.2 Backend Skeleton** — FastAPI foundation, request IDs, logging, and health endpoint.
- [x] **1.3 Persistence Foundation** — Async PostgreSQL, SQLAlchemy, readiness, and Alembic.
- [x] **1.4 Frontend Foundation** — React shell, routing, design tokens, and responsive workspace preview.
- [x] **1.5 Authentication** — Identity, JWT access tokens, rotating refresh cookies, and auth UI.
- [x] **1.6 Organization and RBAC** — Organizations, memberships, roles, tenant isolation, and idempotent `make seed-up` plus protected `make seed-down` support.
- [x] **1.7 Dashboard Shell** — Organization-aware overview, empty states, navigation, and responsive shell.

Next: **2.1 Jobs Domain**.

## Phase 2 — Jobs and candidates

- [x] **2.1 Job foundations** — Tenant-safe job persistence, lifecycle APIs, filtering, and pagination.
- [x] **2.2 Job Workspace UI** — Query-backed job creation, editing, lifecycle actions, and responsive recruiter workspace.
- [x] **2.3 Requirements and JD Approval** — Required/preferred requirements and human JD review.
- [x] **2.4 Candidate Domain** — Organization-scoped reusable candidate profiles.
- [x] **2.5 Resume Storage** — Private PDF storage and short-lived signed downloads.
- [x] **2.6 Applications and Candidate Pipeline** — Connect candidates to approved jobs.
- [ ] **2.3 Resume intake** — Private storage and extraction pipeline.
- [ ] **2.4 Evidence view** — Structured candidate evidence and review history.

## Phase 3 — Hiring workflow

- [ ] **3.1 Screening workflow** — Shortlist, hold, and reject-with-approval states.
- [ ] **3.2 Interview planning** — Interview stages, panels, and scheduling data.
- [ ] **3.3 Scorecards** — Structured interview feedback and calibration.
- [ ] **3.4 Recommendations** — Evidence-backed decision recommendations.

## Phase 4 — Approvals and communication

- [ ] **4.1 Approval engine** — Human approval requests and decisions.
- [ ] **4.2 Audit timeline** — Traceable action and decision history.
- [ ] **4.3 Candidate communication** — Draft, approve, and send email workflow.
- [ ] **4.4 Delivery safeguards** — Duplicate prevention and communication status.

## Phase 5 — AI assistance

- [ ] **5.1 JD assistant** — Assisted job-description drafting.
- [ ] **5.2 Screening assistant** — Resume analysis with evidence and uncertainty.
- [ ] **5.3 Interview assistant** — Question and feedback support.
- [ ] **5.4 Decision assistant** — Recommendations and communication drafts behind approval.

## Phase 6 — Operations and integrations

- [ ] **6.1 Background processing** — Worker jobs and retry policies.
- [ ] **6.2 Storage operations** — Resume retention and private object access.
- [ ] **6.3 Notifications** — Operational alerts and email integration.
- [ ] **6.4 Provider adapters** — LLM and external-service adapter boundaries.

## Phase 7 — Product hardening

- [ ] **7.1 Accessibility review** — Keyboard, contrast, and semantic quality.
- [ ] **7.2 Security review** — Auth, session, tenant, and secret handling review.
- [ ] **7.3 Observability** — Operational logs, metrics, and tracing conventions.
- [ ] **7.4 Performance** — Query, UI, and background-workload optimization.

## Phase 8 — Quality assurance

- [-] **8.1 Automated backend tests** — Deferred until stable workflow boundaries exist.
- [-] **8.2 Automated frontend tests** — Deferred until stable interaction boundaries exist.
- [-] **8.3 Integration tests** — Deferred until cross-module workflows are implemented.
- [-] **8.4 End-to-end tests** — Deferred until the core hiring workflow is complete.

## Phase 9 — Release readiness

- [ ] **9.1 Deployment foundation** — Production environment and release configuration.
- [ ] **9.2 Data operations** — Backup, retention, and recovery process.
- [ ] **9.3 Portfolio polish** — Product narrative, screenshots, and product preparation.
- [ ] **9.4 Release candidate** — Final review and launch checklist.

## Next

**Next: Phase 3.1 — Interview Stages**
