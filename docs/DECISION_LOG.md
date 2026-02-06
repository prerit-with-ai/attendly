# Attndly - Decision Log

> **Purpose**: A running log of all important architectural, strategic, and technical decisions made during the development of Attndly. Each entry captures the context, rationale, alternatives considered, and conditions for revisiting.
>
> **Format**: Decisions are numbered sequentially (`DECISION-XXX`) and never deleted. If a decision is revisited, the original entry is updated with a new status and a reference to the superseding decision.

---

## [DECISION-001] Product Name - Attndly

**Date**: 2026-02-06
**Status**: Decided

**Context**: The product needed a memorable, domain-friendly SaaS brand name that communicates its purpose (attendance tracking) while being modern and distinctive. The name needed to work as a domain, be easy to spell in conversation, and feel professional for enterprise sales.

**Decision**: **Attndly** - a modern contraction of "Attendly" that clearly communicates the product's purpose while maintaining a SaaS-friendly aesthetic.

**Alternatives Considered**:

- **Presnz** - Short for "Presence," but too abstract and hard to spell/pronounce
- **FaceLog** - Descriptive but sounds too technical and clinical for enterprise buyers
- **Vistara** - Elegant but no immediate connection to attendance or recognition

**Trade-offs**: Attndly is slightly unconventional in spelling (dropped vowels), but this is a well-established SaaS naming pattern (e.g., Flickr, Tumblr) and makes the domain more available.

**Revisit When**: N/A - Brand name is foundational and unlikely to change post-launch.

---

## [DECISION-002] Tech Stack Split - Next.js + Python Microservice

**Date**: 2026-02-06
**Status**: Decided

**Context**: The application requires two capabilities that live in different ecosystems: (1) BetterAuth for authentication, which is a JavaScript/TypeScript library, and (2) deepface for face recognition, which is a Python library. A single-runtime solution would require compromises on one side.

**Decision**: Split the application into two services:

- **Next.js** handles frontend, CRUD APIs, authentication (BetterAuth), and all standard web application logic.
- **Python FastAPI microservice** handles face recognition, face enrollment, video stream processing, and all ML/CV workloads.

The two services communicate via internal REST APIs.

**Alternatives Considered**:

- **Monolithic Next.js with Python subprocess calls** - Fragile, hard to scale, poor error handling
- **Monolithic Python (Django/FastAPI) with JS frontend** - Loses BetterAuth, would need to implement auth from scratch
- **Electron app** - Not suitable for multi-tenant SaaS deployment

**Trade-offs**:

- _Gain_: Clean separation of concerns. CRUD operations are simple and fast in Next.js. Heavy ML processing is Python's strength. Each service can be scaled independently.
- _Lose_: Two runtimes to maintain, deploy, and monitor. Inter-service communication adds latency and complexity. Local development requires running two processes.

**Revisit When**: If the operational overhead of two services becomes too burdensome for the team size, or if a viable single-runtime solution for both auth and face recognition emerges.

---

## [DECISION-003] BetterAuth over Clerk/Auth0

**Date**: 2026-02-06
**Status**: Decided

**Context**: The application needs robust authentication with support for organizations/tenants, role-based access control, and session management. The user strongly prefers an open-source SaaS stack to avoid vendor lock-in and per-user pricing that would eat into margins at scale.

**Decision**: **BetterAuth** - an open-source, self-hosted authentication library for Next.js.

**Alternatives Considered**:

- **Clerk** - Excellent DX, but proprietary with per-MAU pricing ($0.02/MAU after free tier). At 10K+ users per tenant, costs add up fast.
- **Auth0** - Industry standard, but complex pricing, vendor lock-in, and overkill for the current stage.
- **NextAuth/Auth.js** - Open source but less feature-rich, especially for organization/tenant management.
- **Supabase Auth** - Good but ties us to the Supabase ecosystem for auth specifically.

**Trade-offs**:

- _Gain_: No per-user costs at any scale. Full control over auth logic. No vendor lock-in. Can customize every aspect of the auth flow.
- _Lose_: More initial setup work than Clerk. Smaller community and ecosystem. Must handle security updates ourselves.

**Revisit When**: If BetterAuth lacks critical features we need (e.g., advanced MFA, SAML SSO for enterprise) and implementing them ourselves is not feasible.

---

## [DECISION-004] Color Theme - Teal/Green

**Date**: 2026-02-06
**Status**: Decided

**Context**: The UI design needed a distinctive color identity that conveys trust, technology, and modernity. Multiple design inspirations were reviewed with the user, including futuristic city illustrations and modern booking dashboard designs.

**Decision**: Teal primary color palette (`#0D9488` range) with green accents. The overall aesthetic targets a futuristic, clean feel that communicates technological sophistication without feeling cold or clinical.

**Alternatives Considered**:

- Blue (too generic for SaaS, blends in with every other B2B product)
- Purple (trendy but may not convey the "security/reliability" feel needed for attendance systems)
- Dark mode only (limits accessibility and may not suit all enterprise environments)

**Trade-offs**: Teal is less common in the B2B space, which helps with brand differentiation, but it requires careful contrast management for accessibility compliance (WCAG AA).

**Revisit When**: User testing indicates the color scheme creates usability issues or does not resonate with target enterprise buyers.

---

## [DECISION-005] Vertical Slice Sprint Approach

**Date**: 2026-02-06
**Status**: Decided

**Context**: The product is being developed for a specific customer pitch/demo. At each milestone, the team needs to show a working, demoable product - not just a backend without UI or a UI without data.

**Decision**: Each sprint delivers a complete vertical slice - a full user journey from UI through API to database. Every sprint produces something that can be demonstrated to a potential customer.

**Alternatives Considered**:

- **Horizontal slicing** (build all backend first, then all frontend) - Faster per-layer but nothing is demoable until both layers are complete.
- **Feature flagging with stubs** - Could show UI with mocked data, but feels inauthentic in demos and creates throwaway work.

**Trade-offs**:

- _Gain_: Always have a demoable product. Catches integration issues early. User can give feedback on real, working features.
- _Lose_: More context switching per sprint (frontend, backend, database in the same sprint). Harder to parallelize work across team members.

**Revisit When**: If the team grows beyond 2-3 developers and horizontal slicing would allow better parallelization.

---

## [DECISION-006] PostgreSQL + Supabase (dev) / AWS RDS (prod)

**Date**: 2026-02-06
**Status**: Decided

**Context**: The application needs a relational database for structured data (users, organizations, employees, attendance records). The user is cost-conscious during development but needs production-grade infrastructure when a paying customer comes onboard.

**Decision**:

- **Development**: Supabase free tier (managed PostgreSQL) for zero-cost development and prototyping.
- **Production**: AWS RDS PostgreSQL when the first paying customer is secured and can fund infrastructure.

**Alternatives Considered**:

- **SQLite** (used in v0.1 prototype) - No multi-tenancy support, no concurrent writes, not production-viable for SaaS.
- **MySQL** - Viable but PostgreSQL has better JSON support, better extensions ecosystem, and is more common in modern stacks.
- **PlanetScale** - MySQL-based, good DX, but adds another vendor dependency.
- **Neon** - Serverless PostgreSQL, good alternative to Supabase but less mature ecosystem.

**Trade-offs**:

- _Gain_: Zero cost during development. PostgreSQL is battle-tested and widely supported. Supabase provides a nice dashboard for data inspection during development.
- _Lose_: Supabase free tier has connection limits and storage caps. Migration from Supabase to RDS requires careful planning (but it is standard PostgreSQL, so the migration path is clean).

**Revisit When**: If Supabase free tier limits become blocking during development, or if a simpler/cheaper production option emerges.

---

## [DECISION-007] deepface with Facenet512 + SSD Detector

**Date**: 2026-02-06
**Status**: Decided

**Context**: The face recognition pipeline was proven in the v0.1 prototype. The key requirements are: (1) works on Windows without C++ compilation (rules out dlib/face_recognition), (2) accurate enough for attendance verification, (3) runs on CPU for development, (4) can scale to GPU for production.

**Decision**: Continue using **deepface** library with:

- **Facenet512** model for face embedding generation (512-dimensional vectors)
- **SSD** (Single Shot Detector) for face detection in frames

**Alternatives Considered**:

- **face_recognition (dlib)** - More popular but requires C++ compilation with VS Build Tools on Windows. Failed to compile reliably in v0.1.
- **InsightFace** - Very accurate but more complex setup and less documentation.
- **MediaPipe** - Google's solution, good for real-time but less accurate for verification tasks.
- **MTCNN detector** - More accurate than SSD but extremely CPU-heavy. Tested in v0.1 and was too slow for real-time processing.
- **Haar cascade detector** - Built into OpenCV but unreliable (high false negative rate, tested in v0.1).

**Trade-offs**:

- _Gain_: Pure Python installation. Proven in prototype. Good accuracy with Facenet512. SSD is fast enough for real-time on modern CPUs.
- _Lose_: SSD is less accurate than MTCNN for difficult angles/lighting. Facenet512 may not be the absolute best model but is well-tested and reliable.

**Revisit When**: Moving to GPU inference in production (can switch to more accurate but heavier detector like RetinaFace). Or when a significantly better pure-Python face recognition library emerges.

---

## [DECISION-008] Real-time Processing over Batch

**Date**: 2026-02-06
**Status**: Decided

**Context**: The target customer has 10,000+ employees across multiple locations. Batch uploading photos/videos for attendance is impractical at this scale. The real-world workflow involves employees walking past CCTV cameras, and the system should automatically record attendance from the live feed.

**Decision**: **Real-time RTSP stream processing** is the primary mode of operation. The system connects to CCTV cameras via RTSP protocol and processes frames in real-time. Batch upload of photos/videos is available as a secondary fallback mode.

**Alternatives Considered**:

- **Batch-only** - Simpler architecture but does not match the real-world use case. Requires manual intervention to upload footage.
- **Hybrid with batch as primary** - Easier to build but would not satisfy the customer requirement for automated attendance.
- **Edge processing on camera** - Ideal for latency but requires specialized hardware and is out of scope for MVP.

**Trade-offs**:

- _Gain_: Matches the real-world enterprise use case. Fully automated attendance without human intervention. Impressive for demos.
- _Lose_: Significantly more complex architecture (stream management, frame processing pipeline, connection handling, reconnection logic). Higher infrastructure requirements (CPU/GPU for real-time inference).

**Revisit When**: If the MVP scope needs to be reduced for faster time-to-market. Batch mode could be shipped first with real-time as a v2 feature.

---

## [DECISION-009] Full User Hierarchy (Admin / HR / Manager / Employee)

**Date**: 2026-02-06
**Status**: Decided

**Context**: The target enterprise customer requires different levels of access and visibility. A flat permission model would not satisfy enterprise security and compliance requirements.

**Decision**: Implement a four-tier role-based access control (RBAC) system from day one:

| Role         | Access Level                                                           |
| ------------ | ---------------------------------------------------------------------- |
| **Admin**    | Full system access. Manage organizations, billing, system settings.    |
| **HR**       | Manage employees, view all attendance reports, manage face enrollment. |
| **Manager**  | View attendance for their department/team, approve corrections.        |
| **Employee** | View own attendance records, update own profile.                       |

**Alternatives Considered**:

- **Two-tier (Admin/User)** - Simpler but insufficient for enterprise needs. Would require rework later.
- **Dynamic role builder** - Maximum flexibility but over-engineered for current stage. Can be added later.
- **Per-feature permissions** - Granular but complex to manage. Better suited for a mature product.

**Trade-offs**:

- _Gain_: Meets enterprise requirements from day one. No rework needed when the customer asks "can only HR see this?"
- _Lose_: More complex authorization logic in every API endpoint and UI component. More test cases to cover.

**Revisit When**: If customers need custom roles beyond these four tiers (implement dynamic role builder at that point).

---

## [DECISION-010] Starting Fresh (v1.0) vs Iterating on Prototype

**Date**: 2026-02-06
**Status**: Decided

**Context**: The v0.1 prototype successfully proved the concept - face recognition works, the basic UI flow is viable, and the customer is interested. However, the prototype has significant architectural debt:

- SQLite database (no multi-tenancy, no concurrent writes)
- Monolithic architecture (everything in one process)
- No authentication system
- No role-based access control
- Hardcoded configurations
- No test coverage
- Messy git history from rapid prototyping

**Decision**: Start a **fresh project (v1.0)** with proper architecture rather than iterating on the prototype codebase.

**Alternatives Considered**:

- **Refactor v0.1 incrementally** - Would preserve working code but the scope of changes needed (database migration, architecture split, auth addition) would essentially rewrite everything anyway while fighting legacy decisions.
- **Fork and clean up** - Keeps git history but the history is noise, not signal. Every commit was experimental.

**Trade-offs**:

- _Gain_: Clean git history (valuable for hiring and fundraising). Proper multi-tenancy from day one. Clean architecture without workarounds. Fresh dependency tree. Lessons from v0.1 inform better decisions.
- _Lose_: Cannot copy-paste working code directly (must re-implement). Lose the "proof" of iterative development in git history. Some time spent re-building what already worked.

**Rationale**: The prototype served its purpose - it proved the concept and identified all the gotchas documented in the SOP. Starting fresh with those lessons learned is faster than untangling the prototype's accumulated debt.

**Revisit When**: N/A - This is a one-time decision. The v0.1 prototype remains available as reference code.

---

## [DECISION-011] pnpm + Turborepo for Monorepo

**Date**: 2026-02-06
**Status**: Decided

**Context**: The v1.0 project has multiple packages (Next.js web app, shared types, Python face-service). Need a monorepo tool for dependency management and task orchestration.

**Decision**: **pnpm workspaces + Turborepo** for monorepo management.

**Alternatives Considered**:

- **npm workspaces + nx** - Nx is heavier, more opinionated. npm workspaces are slower than pnpm.
- **yarn workspaces + turborepo** - Yarn Berry has PnP complexity that can cause issues with some tools.
- **Separate repos** - Loses co-location benefits, harder to share types and ensure consistency.

**Trade-offs**:

- _Gain_: pnpm is fast, disk-efficient (content-addressable store), strict by default. Turborepo provides intelligent caching, parallel task execution, and minimal config.
- _Lose_: pnpm can have Windows PATH quirks (mitigated with corepack/shims). Turborepo has less features than Nx but sufficient for our needs.

**Revisit When**: If build times exceed 5 minutes or we need more sophisticated task graph features.

---

## [DECISION-012] Drizzle ORM over Prisma

**Date**: 2026-02-06
**Status**: Decided

**Context**: Need a TypeScript ORM for PostgreSQL that integrates well with BetterAuth and supports the complex queries needed for attendance reporting.

**Decision**: **Drizzle ORM** with postgres.js driver.

**Alternatives Considered**:

- **Prisma** - More mature ecosystem but heavier runtime (query engine binary), slower cold starts, and BetterAuth's Drizzle adapter is more lightweight.
- **Kysely** - Excellent query builder but less schema management tooling.
- **Raw SQL with pg** - Maximum control but no type safety or migration tooling.

**Trade-offs**:

- _Gain_: SQL-like syntax (team familiarity), lightweight runtime, excellent TypeScript inference, fast migrations with drizzle-kit, native BetterAuth adapter support.
- _Lose_: Smaller ecosystem than Prisma. Fewer tutorials/guides available. Schema changes require more manual work.

**Revisit When**: If Drizzle's query capabilities prove insufficient for complex reporting queries.

---

## [DECISION-013] uv for Python Dependency Management

**Date**: 2026-02-06
**Status**: Decided

**Context**: The face-service Python microservice needs a dependency manager. The v0.1 prototype used pip + requirements.txt which was slow and had reproducibility issues.

**Decision**: **uv** (by Astral) for Python project and dependency management.

**Alternatives Considered**:

- **pip + requirements.txt** - Simple but slow, no lockfile by default, no virtual env management.
- **Poetry** - Feature-rich but slow resolver, complex configuration, sometimes conflicts with pyproject.toml standards.
- **pdm** - Good alternative but smaller community than uv.

**Trade-offs**:

- _Gain_: 10-100x faster than pip/Poetry. Built-in venv management. Standard pyproject.toml. Lockfile for reproducibility. Can manage Python versions too.
- _Lose_: Relatively new tool (though backed by Astral/Ruff team). Some CI providers don't have native caching support yet.

**Revisit When**: If uv has breaking changes or stability issues in production CI.

---

## [DECISION-014] Tailwind v4 + Shadcn UI New York Style with OKLCH Teal Theme

**Date**: 2026-02-06
**Status**: Decided

**Context**: Need a design system that supports the teal/green brand color (#0D9488 range), dark mode from day 1, and rapid UI development.

**Decision**: **Tailwind CSS v4** with **Shadcn UI (New York style)** using OKLCH color space for the teal theme.

**Alternatives Considered**:

- **Tailwind v3 + Shadcn** - Proven but v4 has better CSS variable integration and performance.
- **Chakra UI** - Full component library but less customizable, heavier bundle.
- **Radix + custom styles** - Maximum control but much more design work upfront.

**Trade-offs**:

- _Gain_: OKLCH provides perceptually uniform colors (better dark mode). Shadcn gives copy-paste components we own. New York style is more refined. Tailwind v4 has native CSS variables.
- _Lose_: Tailwind v4 is newer with fewer community examples. OKLCH not supported in older browsers (graceful degradation). Shadcn requires manual component installation.

**Revisit When**: If browser compatibility issues arise with OKLCH, or if Tailwind v4 has breaking changes.

---

> **Last Updated**: 2026-02-06
>
> **Next Decision Number**: DECISION-015
>
> To add a new decision, copy the template below and fill in all fields:
>
> ```markdown
> ## [DECISION-XXX] Title
>
> **Date**: YYYY-MM-DD
> **Status**: Decided / Under Discussion / Revisited
>
> **Context**: Why this decision was needed.
>
> **Decision**: What was decided.
>
> **Alternatives Considered**:
>
> - Alternative 1 - Why it was not chosen
> - Alternative 2 - Why it was not chosen
>
> **Trade-offs**:
>
> - _Gain_: What we gain from this decision
> - _Lose_: What we lose or accept as a cost
>
> **Revisit When**: Conditions that would make us reconsider this decision.
> ```
