# Attndly - Standard Operating Procedure (SOP)

> **Purpose**: This is the living "truth document" for the Attndly development workflow. It defines how every sprint is planned, built, tested, and shipped. This SOP improves over time as the team learns.
>
> **Stack**: Next.js (frontend + CRUD APIs + auth) | Python FastAPI (face recognition + video processing)
>
> **Tooling**: Development is performed with Claude Code (AI assistant) as a pair-programming partner.

---

## 1. Sprint Workflow

Each sprint follows a strict five-phase cycle. No phase is skipped.

### 1.1 Planning Phase

1. **Enter plan mode** - Claude Code switches to planning context. No code is written during planning.
2. **Explore the codebase** - Review current state of relevant files, identify dependencies, understand what already exists.
3. **Create implementation plan** - Produce a numbered, step-by-step plan covering:
   - What will be built (feature scope)
   - Which files will be created or modified
   - Database schema changes (if any)
   - API endpoints involved
   - UI components and pages
   - Known risks or unknowns
4. **Get user approval** - The plan is presented to the user. Implementation does NOT begin until the user explicitly approves.

### 1.2 Implementation Phase

Follow the **vertical slice** approach. Every sprint delivers a complete feature from UI to database:

```
UI Component --> API Route --> Service Layer --> Database
```

- Build one slice at a time, not layer by layer.
- Each slice should be independently testable.
- Prefer small, working increments over large batches.

### 1.3 Testing Phase

Testing follows a strict sequence. Each step must pass before moving to the next.

| Step | Activity | Owner |
|------|----------|-------|
| 1 | Write automated tests (unit + integration) | Developer + Claude Code |
| 2 | Run automated tests, fix all failures | Developer + Claude Code |
| 3 | Create QA Checklist document (`docs/qa/sprint-{N}-checklist.md`) | Claude Code |
| 4 | User performs manual testing using the QA Checklist | User |
| 5 | Fix any issues found during manual testing | Developer + Claude Code |

### 1.4 Commit Phase

- Commits happen **only after** all automated tests pass AND the user approves.
- Follow the Git Workflow defined in Section 2.
- Never commit broken or untested code to any branch.

### 1.5 Review Phase

- Document what was learned during the sprint in `DECISION_LOG.md`.
- Note any surprises, gotchas, or architectural insights.
- Update this SOP if the process itself needs improvement.

---

## 2. Git Workflow

### Branch Naming

```
sprint-{N}/{feature-name}
```

**Examples:**
- `sprint-1/auth-flow`
- `sprint-2/employee-management`
- `sprint-3/face-enrollment`

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

| Prefix | Usage |
|--------|-------|
| `feat:` | New feature or capability |
| `fix:` | Bug fix |
| `refactor:` | Code restructuring without behavior change |
| `docs:` | Documentation only |
| `test:` | Adding or updating tests |
| `chore:` | Build, tooling, or dependency changes |
| `style:` | Formatting, whitespace (no logic change) |

**Example:**
```
feat: add employee registration form with photo upload

- Created EmployeeForm component with validation
- Added /api/employees POST endpoint
- Integrated with face enrollment service

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

### Rules

- **Always** include the `Co-Authored-By` tag when Claude Code contributes to the commit.
- **Never** force push to `main`.
- **Merge to main** only after the sprint is fully complete and tested.
- Keep commits atomic - one logical change per commit.

---

## 3. Code Standards

### TypeScript (Next.js)

- **Strict mode** enabled in `tsconfig.json` (`"strict": true`).
- **ESLint + Prettier** configured and enforced.
- All functions must have explicit type annotations.
- **No `any`** unless absolutely necessary (and documented with a comment explaining why).
- Components: **functional components + hooks only**. No class components.
- API routes: proper error handling with structured error responses, input validation with Zod or similar.

### Python (FastAPI)

- **Type hints** on all function signatures and return types.
- **Docstrings** on all public functions and classes (Google style).
- Follow PEP 8 formatting (enforced via Black or Ruff).
- Use Pydantic models for request/response validation.
- Proper exception handling with meaningful error messages.

### General

- No hardcoded secrets or credentials in source code.
- Environment variables for all configuration (documented in `.env.example`).
- Meaningful variable and function names - code should be self-documenting.
- DRY principle, but prefer clarity over cleverness.

---

## 4. Testing Protocol

### Frontend (Next.js)

| Tool | Purpose |
|------|---------|
| **Vitest** | Unit tests for components, hooks, utilities |
| **Playwright** | End-to-end tests for critical user flows |

### Backend (Python FastAPI)

| Tool | Purpose |
|------|---------|
| **pytest** | Unit tests and integration tests |
| **httpx / TestClient** | API endpoint testing |

### Coverage Targets

- **80%+ coverage** for critical paths (authentication, face recognition, attendance recording).
- Non-critical utilities and UI polish can have lower coverage.
- Coverage reports generated on every test run.

### QA Checklists

Every sprint produces a manual QA checklist:

```
docs/qa/sprint-{N}-checklist.md
```

The checklist includes:
- Step-by-step manual test cases
- Expected results for each step
- Edge cases to verify
- Pass/fail checkboxes for the user

---

## 5. Documentation Protocol

### What Gets Updated and When

| Document | Updated When |
|----------|-------------|
| `docs/SOP.md` (this file) | Process improvements are discovered |
| `docs/DECISION_LOG.md` | Any architectural or strategic decision is made |
| `docs/qa/sprint-{N}-checklist.md` | Every sprint (testing phase) |
| API documentation | Any API endpoint is added or changed |
| `.env.example` | Any new environment variable is introduced |
| `README.md` | Major setup or architecture changes |

### Rules

- Architecture decisions **always** go in `DECISION_LOG.md` with full context and rationale.
- Never leave a "why" undocumented - future you (or a new hire) will need it.
- API changes are documented alongside the code change, not after.
- QA checklists are created as part of the sprint, not as an afterthought.

---

## 6. Common Mistakes to Avoid

> Lessons learned from the v0.1 prototype and general development experience. This section grows over time.

### Face Recognition / ML

| Mistake | Solution |
|---------|----------|
| `face_recognition` library requires dlib which CANNOT compile on Windows without VS Build Tools | Use `deepface` instead - pure Python, no compilation needed |
| TensorFlow hot-reload via uvicorn is extremely slow (reloads entire model on every change) | Full server restart is faster than relying on hot-reload |
| OpenCV Haar cascade face detector is unreliable (high false negative rate) | SSD detector provides a better balance of speed and accuracy |
| MTCNN detector is accurate but very heavy on CPU | Avoid on resource-constrained systems; reserve for GPU environments |
| deepface model weights may fail to auto-download (network/firewall issues) | Implement manual download fallback with documented mirror URLs |
| For face recognition at scale (10K+ employees), linear scan of embeddings will not work | Need a vector database (FAISS for single-node, Milvus for distributed) |

### Backend / Data

| Mistake | Solution |
|---------|----------|
| Pydantic validation errors are objects `{type, loc, msg}` not plain strings | Must parse the error structure before rendering in React UI |
| Empty strings for optional `EmailStr` fields cause 422 Unprocessable Entity errors | Send `undefined` (omit the field) instead of `""` for optional email fields |
| SQLAlchemy UUID columns with SQLite need proper `UUID()` object conversion from strings | Always convert with `UUID(str_value)` before inserting |
| numpy float types (`np.float64`) can fail silently or error in SQLAlchemy inserts | Convert to Python native `float()` before any database operation |

### Infrastructure / Tooling

| Mistake | Solution |
|---------|----------|
| Celery on Windows requires special configuration | Always use `--pool=solo` flag when running Celery on Windows |
| Route target may differ from the file name (e.g., import aliasing, re-exports) | Always check which file the route actually points to before editing |

---

## 7. Environment Setup Checklist

### Prerequisites

- [ ] **Node.js** 20+ (LTS recommended)
- [ ] **Python** 3.11+
- [ ] **PostgreSQL** (local install or Supabase free tier for development)
- [ ] **Redis** (local install or Upstash free tier for development)
- [ ] **FFmpeg** installed and available on PATH (required for video processing)
- [ ] **Git** configured with user name and email

### Next.js Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Fill in environment variables
npm run dev
```

### Python Microservice Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env
# Fill in environment variables
uvicorn main:app --reload
```

### Key Python Dependencies

- `deepface` - Face recognition and verification
- `tensorflow` - ML backend for deepface
- `opencv-python` - Image and video processing
- `fastapi` - API framework
- `uvicorn` - ASGI server
- `sqlalchemy` - ORM (if Python service needs direct DB access)
- `celery` - Task queue for async video processing
- `redis` - Celery broker and result backend

### Environment Variables

All required environment variables must be documented in `.env.example` files in both the `frontend/` and `backend/` directories. Never commit actual `.env` files to version control.

---

> **Last Updated**: 2026-02-06
>
> **Version**: 1.0
>
> This document is maintained by the development team and updated every sprint. If something in this SOP is wrong or incomplete, fix it immediately - do not leave it for later.
