# Attndly - Project Context for Claude Code

## Project Overview
**Attndly** - AI-powered attendance tracking SaaS using existing CCTV cameras + facial recognition.
Replaces biometric thumb scanners. Target: offices with 100-10,000+ employees.

## Tech Stack
- **Frontend**: Next.js 14+ (App Router) + TypeScript + TailwindCSS + Shadcn UI
- **Auth**: BetterAuth (open source)
- **Database**: PostgreSQL (Supabase for dev, AWS RDS for prod)
- **Cache/Queue**: Redis (Upstash for dev)
- **Face Recognition**: Python FastAPI microservice + deepface (Facenet512 + SSD detector)
- **Video/Streams**: FFmpeg + Python workers
- **Storage**: S3 or Supabase Storage
- **Real-time**: WebSocket for live dashboard updates
- **Deployment**: Vercel (Next.js) + Railway/AWS (Python service)

## Design System
- **Primary Color**: Teal/Green (#0D9488 range)
- **Style**: Modern, clean, card-based bento grid layouts, generous white space
- **Typography**: Inter or similar clean sans-serif
- **Components**: Shadcn UI as base, customized with teal theme
- **Dark mode**: Supported from day 1
- **Inspiration**: See `/design_inspo/` folder

## User Roles
1. **Super Admin**: Full system access, company setup, camera config
2. **HR Admin**: Employee management, attendance, reports, leave approvals
3. **Manager**: Team attendance, team leave approvals
4. **Employee**: View own attendance, apply for leaves

## Key Decisions
- See `docs/DECISION_LOG.md` for full decision history
- BetterAuth over Clerk/Auth0 (open source, no per-user costs)
- Next.js + Python split (JS for CRUD/auth, Python for face recognition)
- deepface + Facenet512 + SSD detector (proven in v0.1 prototype)
- Vertical slice sprints (each sprint = complete user journey, demoable)
- Real-time RTSP processing as primary mode (batch as fallback)

## Development Workflow
- See `docs/SOP.md` for full workflow
- Plan mode → implement → automated tests → QA checklist → manual testing → commit
- Branch naming: `sprint-{N}/{feature-name}`
- Conventional commits (feat:, fix:, refactor:, docs:, test:)
- QA checklists in `docs/qa/sprint-{N}-checklist.md`

## Sprint Plan (Vertical Slices)
- Sprint 0: Foundation (setup, design system, CI/CD)
- Sprint 1: Landing Page + Auth
- Sprint 2: Onboarding + Employee Management
- Sprint 3: Face Enrollment + Camera Setup
- Sprint 4: Real-time Attendance (THE demo sprint)
- Sprint 5: Leave & Shift Management
- Sprint 6: Reports & Analytics
- Sprint 7: Polish & Production

## Important Docs
- `docs/PRD.md` - Product Requirements Document
- `docs/SOP.md` - Standard Operating Procedure
- `docs/DECISION_LOG.md` - Decision history with rationale
- `docs/qa/` - QA checklists per sprint

## Lessons from v0.1 Prototype
- face_recognition/dlib can't compile on Windows → use deepface
- deepface model weights may need manual download to ~/.deepface/weights/
- SSD detector is good balance of speed/accuracy (MTCNN too heavy on CPU)
- SQLAlchemy UUID columns need UUID() conversion from strings
- numpy float types need float() conversion for DB inserts
- Pydantic validation errors are objects, parse before rendering
- Empty strings for optional email fields cause 422 → send undefined
- Celery on Windows needs --pool=solo
- TensorFlow hot-reload is very slow → full restart preferred
- For 10K+ faces, need vector search (FAISS/Milvus) not linear scan

## Project Structure (planned)
```
cctvats_v1_0/
├── apps/
│   ├── web/              # Next.js app (frontend + API routes + BetterAuth)
│   └── face-service/     # Python FastAPI microservice (face recognition)
├── packages/
│   └── shared/           # Shared types, utilities
├── docs/
│   ├── PRD.md
│   ├── SOP.md
│   ├── DECISION_LOG.md
│   └── qa/
├── design_inspo/
├── CLAUDE.md
├── .env.example
└── README.md
```
