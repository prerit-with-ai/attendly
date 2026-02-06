# Attndly - Product Requirements Document

**Version**: 1.0
**Last Updated**: 2026-02-06
**Status**: Draft - Awaiting Review

---

## 1. Vision & Problem Statement

### The Problem
Modern offices with 100-10,000+ employees still rely on **biometric thumb scanners** for attendance tracking. This creates several pain points:

- **Queues at entry/exit**: Employees wait in line to scan their thumb, especially during peak hours
- **Buddy punching**: Employees can't fake fingerprints easily, but the system is still cumbersome
- **Hardware dependency**: Scanners break, need maintenance, and are a single point of failure
- **No workplace insights**: Thumb scanners only capture check-in/check-out - zero visibility into workplace patterns
- **Manual processes**: HR still exports data manually, cross-references with leave records, generates reports by hand
- **Scaling costs**: Each new office/floor needs new scanner hardware

### The Solution
**Attndly** uses existing CCTV cameras to automatically detect and log employee attendance using facial recognition.

- **No new hardware** - leverage CCTV cameras already installed for security
- **No queues** - employees just walk in, cameras capture attendance automatically
- **No buddy punching** - face recognition is inherently identity-verified
- **Automatic** - zero manual intervention for daily attendance
- **Insightful** - unlock workplace analytics from the same camera feeds
- **Scalable** - adding a new floor means just connecting another camera

### Value Proposition
> "Turn your existing security cameras into an intelligent attendance system. No new hardware, no queues, no manual processes."

---

## 2. Target Market

### Primary Customer
- **Offices with 100-10,000+ employees**
- Already have CCTV cameras installed (most offices do for security)
- Currently using biometric thumb scanners or manual registers
- Want to modernize attendance tracking
- Indian market initially (first customer is India-based)

### First Customer Profile
- 10,000+ employees across multiple office locations
- Currently using biometric thumb scanners
- Looking for a modern, automated solution
- Budget: ~$10/user/month ($100K+/month potential)

### Market Positioning
- **Not a surveillance tool** - purely attendance-focused with privacy by design
- **Complement to existing CCTV** - adds value to infrastructure they already own
- **Enterprise-grade** - built for scale, security, and compliance from day 1

---

## 3. User Roles & Personas

### Super Admin (IT / Company Owner)
- **Goal**: Set up and manage the system
- **Access**: Full system access
- **Key actions**: Company setup, camera configuration, user management, system settings
- **Frequency**: Occasional (setup + maintenance)

### HR Admin
- **Goal**: Manage attendance operations efficiently
- **Access**: Employee management, attendance data, reports, leave management
- **Key actions**: Add employees, enroll faces, review attendance, approve leaves, generate reports
- **Frequency**: Daily
- **Pain today**: Manual data export, cross-referencing, report generation

### Manager
- **Goal**: Oversee team attendance and approve requests
- **Access**: Team-scoped attendance, leave approvals
- **Key actions**: View team attendance, approve/reject leave requests, view team reports
- **Frequency**: Daily

### Employee
- **Goal**: Track own attendance and manage leaves
- **Access**: Own data only
- **Key actions**: View attendance history, check leave balance, apply for leaves, receive notifications
- **Frequency**: Weekly (check attendance) + as-needed (leave requests)

---

## 4. Core Features

### P0 - Must Have (MVP)

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Landing Page** | Marketing site with product info, pricing, demo request |
| 2 | **Authentication** | Sign up, login, Google/Microsoft OAuth via BetterAuth |
| 3 | **Company Onboarding** | Guided wizard: company info → add locations → invite team |
| 4 | **Employee Management** | CRUD operations, bulk CSV import, department assignment |
| 5 | **Face Enrollment** | Webcam capture or photo upload (3-10 images per employee) |
| 6 | **Camera Management** | Configure RTSP camera connections, test connectivity, status monitoring |
| 7 | **Real-time Attendance** | Live face detection from camera feeds → automatic check-in/check-out |
| 8 | **Dashboard** | Today's summary: present/absent/late counts, department breakdown, live activity feed |
| 9 | **Attendance Logs** | Searchable, filterable, paginated attendance records |
| 10 | **Basic Reports** | Daily/weekly attendance reports, export to CSV/PDF |
| 11 | **Multi-location** | Support multiple offices/locations per company |

### P1 - Important for Demo

| # | Feature | Description |
|---|---------|-------------|
| 12 | **Leave Management** | Leave types, balance tracking, apply/approve workflow |
| 13 | **Shift Management** | Define shifts (morning/evening/night), assign to employees |
| 14 | **Late/Early Alerts** | Policy-based alerts when employees arrive late or leave early |
| 15 | **Overtime Tracking** | Auto-calculate overtime hours based on shift + actual attendance |
| 16 | **Notification System** | In-app + email notifications for alerts, approvals, announcements |
| 17 | **Department Management** | Organize employees by department, department-level reports |

### P2 - Post-MVP

| # | Feature | Description |
|---|---------|-------------|
| 18 | **Workplace Insights** | Peak hours, traffic patterns, busiest days/times |
| 19 | **Space Utilization** | Which areas/floors are most/least used |
| 20 | **Mobile App** | Employee self-service mobile app (React Native) |
| 21 | **Integration APIs** | REST APIs for HR system integration (Workday, BambooHR, etc.) |
| 22 | **Advanced Analytics** | Trends, predictions, anomaly detection |
| 23 | **Visitor Management** | Track and manage office visitors |
| 24 | **Compliance Reports** | Auto-generated compliance reports for labor laws |

---

## 5. User Journeys

### Journey 1: Admin Onboarding
```
Landing Page → "Get Started" → Sign Up (email or Google OAuth)
→ Company Profile (name, industry, size)
→ Add First Location (name, address, timezone)
→ Configure First Camera (RTSP URL, test connection)
→ Invite HR Admin (email invite)
→ Redirect to Dashboard
```
**Success criteria**: Admin can set up company in < 10 minutes

### Journey 2: Employee Enrollment
```
HR Admin logs in → Employees section → "Add Employee"
→ Fill details (name, code, department, email, shift)
→ OR bulk import via CSV
→ "Enroll Face" → Webcam capture (take 3-5 photos from different angles)
→ OR upload existing photos
→ System processes and confirms enrollment
→ Employee is now active in the system
```
**Success criteria**: Enroll 1 employee in < 2 minutes, bulk import 100+ in < 5 minutes

### Journey 3: Daily Attendance (The Core Loop)
```
Employee walks into office → Camera detects face
→ System matches face against enrolled employees (< 500ms)
→ Check-in logged with timestamp + confidence score
→ Dashboard updates in real-time (WebSocket)
→ Employee walks out → Check-out logged
→ Day's attendance calculated: total hours, on-time/late status
```
**Success criteria**: Face → attendance log in < 3 seconds, 99%+ accuracy

### Journey 4: HR Daily Workflow
```
HR Admin opens Dashboard → Sees today's summary
  - 8,450 present / 1,200 absent / 350 late
  - Department breakdown chart
  - Live activity feed (recent check-ins)
→ Reviews late arrivals → Sends notification/warning
→ Checks leave requests → Approves/rejects
→ End of week: Generates weekly report → Exports PDF → Sends to management
```
**Success criteria**: Dashboard loads in < 2 seconds, all data up-to-date within 30 seconds

### Journey 5: Employee Self-Service
```
Employee logs in → Sees own attendance summary
  - This week: 4/5 days present, 1 WFH
  - Hours worked: 38.5 / 40 target
→ Views attendance history with calendar view
→ Checks leave balance (12 casual, 8 sick remaining)
→ Applies for leave next Friday
→ Gets notification when approved
```
**Success criteria**: Employee can check attendance and apply for leave in < 1 minute

### Journey 6: Manager Oversight
```
Manager logs in → Team Dashboard
  - Team of 25: 22 present, 2 on leave, 1 absent
  - Team attendance rate: 96%
→ Reviews pending leave requests (2)
→ Approves one, requests more info on other
→ Views team monthly report → Notes one employee with consistent late arrivals
```
**Success criteria**: Manager gets full team picture in < 30 seconds

### Journey 7: Report Generation
```
HR/Manager → Reports section
→ Select report type (daily/weekly/monthly/custom)
→ Select date range
→ Apply filters (department, location, shift)
→ Preview report with charts + data table
→ Export as CSV or PDF
→ Schedule recurring report (optional)
```
**Success criteria**: Generate report in < 5 seconds for 10K employees

---

## 6. Technical Architecture

### High-Level Architecture
```
┌──────────────────────────────────────────────────┐
│                  Client Layer                     │
│  ┌─────────────┐  ┌─────────────┐               │
│  │  Web App    │  │  Mobile App │  (P2)         │
│  │  (Next.js)  │  │  (React     │               │
│  │             │  │   Native)   │               │
│  └─────────────┘  └─────────────┘               │
└──────────────────────────────────────────────────┘
                    ↓ HTTPS / WebSocket
┌──────────────────────────────────────────────────┐
│              Next.js Backend (API Routes)         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │  Auth    │ │  CRUD    │ │ Real-time│        │
│  │(BetterAuth)│ │  APIs   │ │  (WS)   │        │
│  └──────────┘ └──────────┘ └──────────┘        │
└──────────────────────────────────────────────────┘
                    ↓ REST / Message Queue
┌──────────────────────────────────────────────────┐
│         Python Face Recognition Service           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │  Face    │ │  RTSP    │ │  Video   │        │
│  │  Engine  │ │  Handler │ │  Worker  │        │
│  │(deepface)│ │ (FFmpeg) │ │ (Celery) │        │
│  └──────────┘ └──────────┘ └──────────┘        │
└──────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────┐
│                  Data Layer                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │PostgreSQL│ │  Redis   │ │  S3 /    │        │
│  │  (Data)  │ │(Cache/Q) │ │  Storage │        │
│  └──────────┘ └──────────┘ └──────────┘        │
└──────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js 14+ (App Router) + TypeScript | SSR, API routes, modern React |
| UI | TailwindCSS + Shadcn UI | Customizable, accessible, teal theme |
| Auth | BetterAuth | Open source, no per-user costs, OAuth support |
| Database | PostgreSQL | Relational data, strong ACID, JSON support |
| Cache/Queue | Redis | Session cache, job queue, real-time pub/sub |
| Face Recognition | Python (FastAPI) + deepface | Proven in v0.1, Facenet512 + SSD detector |
| Video Streams | FFmpeg + Python workers | RTSP handling, frame extraction |
| Storage | S3 / Supabase Storage | Face images, video frames |
| Real-time | WebSocket (via Next.js) | Live dashboard updates |
| Vector Search | FAISS / Milvus (at scale) | Fast face matching for 10K+ employees |
| Deployment | Vercel + Railway/AWS | Next.js on Vercel, Python on Railway |

### Data Architecture Split
- **Next.js API Routes handle**: Auth, CRUD (employees, companies, locations, leaves, shifts), Reports, Dashboard queries
- **Python Service handles**: Face enrollment processing, RTSP stream consumption, real-time face detection/matching, video processing

---

## 7. Data Model

### Core Entities

**Company**
- id, name, industry, size, plan_tier, settings (JSON), logo_url
- created_at, updated_at

**Location**
- id, company_id, name, address, city, timezone, is_active
- created_at, updated_at

**User** (system users - admins, HR, managers)
- id, company_id, email, name, role (super_admin/hr_admin/manager/employee)
- avatar_url, is_active, last_login_at
- created_at, updated_at

**Employee**
- id, company_id, location_id, department_id
- employee_code, first_name, last_name, email, phone
- position, shift_id
- face_encoding (encrypted bytes), face_image_url, face_enrolled_at, face_enrollment_count
- gdpr_consent_given, gdpr_consent_date
- is_active, joined_date
- created_at, updated_at

**Department**
- id, company_id, name, manager_id (references User)
- created_at

**Camera**
- id, location_id, company_id
- name, rtsp_url (encrypted), description
- status (active/inactive/error), last_connected_at
- created_at, updated_at

**AttendanceLog**
- id, employee_id, company_id, location_id
- timestamp, event_type (check_in/check_out)
- confidence_score, camera_id, video_frame_url
- processing_method (rtsp/upload)
- is_manual_override, override_by, override_reason
- created_at

**Shift**
- id, company_id, name
- start_time, end_time, grace_period_minutes
- is_default
- created_at

**Leave**
- id, employee_id, company_id
- leave_type (casual/sick/earned/wfh/other)
- start_date, end_date, days_count
- reason, status (pending/approved/rejected/cancelled)
- approved_by, approved_at, rejection_reason
- created_at, updated_at

**LeaveBalance**
- id, employee_id, leave_type
- total_days, used_days, remaining_days
- year
- created_at, updated_at

**Notification**
- id, user_id, company_id
- type (leave_approved/leave_rejected/late_alert/system)
- title, message, data (JSON)
- is_read, read_at
- created_at

**Indexes** (critical for performance)
- attendance_logs: (company_id, timestamp), (employee_id, timestamp), (company_id, employee_id, timestamp)
- employees: (company_id, employee_code), (company_id, department_id)
- leaves: (employee_id, status), (company_id, status)

---

## 8. Design System

### Color Palette
- **Primary**: Teal (#0D9488) with range from light (#CCFBF1) to dark (#134E4A)
- **Secondary**: Slate grays for text and backgrounds
- **Accent**: Amber/Yellow for warnings, Red for errors, Green for success
- **Background**: White (#FFFFFF) / Slate-50 (#F8FAFC)
- **Dark mode**: Slate-900 base with teal accents preserved

### Typography
- **Font**: Inter (clean, professional, excellent readability)
- **Headings**: Semi-bold to Bold
- **Body**: Regular weight, 14-16px base
- **Monospace**: JetBrains Mono (for codes, IDs)

### Layout Principles
- **Card-based bento grid** for dashboards (inspired by Crextio)
- **Sidebar navigation** (collapsible for more screen space)
- **Generous white space** - not cramped
- **Data density**: Show what matters, progressive disclosure for details
- **Responsive**: Desktop-first, tablet-friendly, mobile-functional

### Component Library
- Shadcn UI as base (accessible, customizable)
- Custom components for:
  - Live camera feed viewer
  - Attendance timeline
  - Face enrollment capture
  - Real-time activity feed
  - Stat cards with sparklines

### Key Page Designs

**Dashboard** (inspired by Crextio HR dashboard):
- Welcome banner with user name + date
- 4 stat cards: Present / Absent / Late / On Leave
- Department breakdown chart
- Live activity feed (recent check-ins, scrolling)
- Quick actions (add employee, view reports)

**Landing Page** (inspired by futuristic city illustrations):
- Hero section with product demo video/animation
- Features grid with icons
- How it works (3 steps)
- Pricing section
- CTA: "Start Free Trial" / "Request Demo"
- Teal/green gradient background elements

---

## 9. Vertical Slice Sprint Plan

### Sprint 0: Foundation (3-5 days)
**Deliverable**: Project skeleton, design system, dev workflow
- Next.js project with App Router + TypeScript
- TailwindCSS + Shadcn UI setup with teal theme
- Python FastAPI microservice skeleton
- PostgreSQL database setup (Supabase)
- Redis setup (Upstash)
- Docker Compose for local development
- CI/CD pipeline (GitHub Actions)
- ESLint + Prettier + Husky pre-commit hooks
- Environment variables setup
- README with setup instructions

### Sprint 1: Landing Page + Auth (3-5 days)
**Deliverable**: Marketing site + working auth
- Landing page (hero, features, how it works, CTA)
- BetterAuth integration (email + Google OAuth)
- Sign up flow with email verification
- Login / Logout
- Protected routes
- Dashboard shell (sidebar + empty dashboard page)
- **QA Checklist**: Sign up, login, logout, OAuth, protected routes

### Sprint 2: Onboarding + Employee Management (5-7 days)
**Deliverable**: Complete company setup + employee CRUD
- Company onboarding wizard (3 steps)
- Location management (CRUD)
- Department management (CRUD)
- Employee management (add, edit, delete, search, filter)
- Bulk CSV import for employees
- Employee profile page
- Role-based access control (RBAC)
- **QA Checklist**: Full onboarding flow, employee CRUD, CSV import, RBAC

### Sprint 3: Face Enrollment + Camera Setup (5-7 days)
**Deliverable**: Face enrollment working + cameras configurable
- Face enrollment UI (webcam capture + photo upload)
- Python face recognition service integration
- Face encoding storage (encrypted)
- Camera management UI (add, edit, test connection, status)
- RTSP connection testing
- Employee face status indicators
- **QA Checklist**: Enroll face, verify encoding saved, camera CRUD, RTSP test

### Sprint 4: Real-time Attendance - THE DEMO SPRINT (7-10 days)
**Deliverable**: The magic moment - camera sees face → attendance logged
- RTSP stream consumer in Python service
- Real-time face detection + matching pipeline
- Attendance logging with deduplication
- WebSocket for live dashboard updates
- Dashboard: live stats, activity feed, department breakdown
- Attendance log page (search, filter, paginate)
- Camera live status indicators
- **QA Checklist**: Real-time detection, accuracy testing, deduplication, dashboard updates

### Sprint 5: Leave & Shift Management (5-7 days)
**Deliverable**: Complete leave and shift workflows
- Shift definitions (CRUD, assign to employees)
- Leave types configuration
- Leave balance management
- Leave apply/approve/reject workflow
- Late/early detection based on shift times
- Overtime calculation
- Notifications (in-app)
- Manager team view
- **QA Checklist**: Full leave lifecycle, shift assignment, overtime calc, notifications

### Sprint 6: Reports & Analytics (5-7 days)
**Deliverable**: Comprehensive reporting for HR
- Daily/weekly/monthly attendance reports
- Department-wise reports
- Individual employee reports
- Export to CSV and PDF
- Charts: attendance trends, department comparison, peak hours
- Workplace insights (basic): busiest times, attendance patterns
- Scheduled reports (optional)
- **QA Checklist**: All report types, export formats, chart accuracy, large dataset handling

### Sprint 7: Polish & Production (5-7 days)
**Deliverable**: Production-ready system
- Performance optimization (queries, caching, lazy loading)
- Security hardening (input validation, rate limiting, encryption audit)
- Multi-tenancy verification (data isolation)
- Error handling & logging (Sentry integration)
- Production deployment (Vercel + Railway/AWS)
- Load testing (10K employees, 50 cameras)
- Documentation finalization
- **QA Checklist**: Security audit, load testing, multi-tenant isolation, deployment verification

---

## 10. Non-Functional Requirements

### Security
- Face data encrypted at rest (AES-256)
- RTSP URLs encrypted in database
- GDPR-compliant: consent tracking, right to deletion, data export
- Audit logs for all face data access
- Role-based access control at API level
- HTTPS only, security headers (CSP, HSTS)
- Session management with BetterAuth
- No face data in logs or error messages

### Performance
- Face matching: < 500ms for 10K employees (vector search with FAISS)
- Dashboard load: < 2 seconds
- Real-time updates: < 3 seconds from face detection to dashboard
- API response time: p95 < 500ms
- Support 50+ concurrent RTSP streams per deployment

### Scalability
- Horizontal scaling of Python face recognition workers
- Database connection pooling
- Redis caching for frequent queries
- CDN for static assets
- Designed for 10K+ employees per company

### Availability
- 99.9% uptime target
- Graceful degradation (if face service is down, show last known status)
- Camera auto-reconnect on failure
- Queue-based processing (no data loss if worker is temporarily down)

### Privacy
- Face encodings are mathematical vectors, not reconstructable to images
- Consent management before face enrollment
- Data retention policies (configurable per company)
- Right to deletion (remove all face data on request)
- Company data isolation (multi-tenancy)

---

## 11. Success Metrics

### Demo Success
- Real-time face detection → attendance logged in < 3 seconds
- Face recognition accuracy > 99% in controlled environment
- Dashboard shows live updates during demo
- Complete onboarding in < 10 minutes
- Wow factor: walk past camera → see your name appear on dashboard

### Product Success
- Onboard first customer within 30 days of production launch
- Process 10K+ daily check-ins without degradation
- HR report generation in < 5 seconds
- 99%+ face recognition accuracy in production
- < 0.1% false positive rate

### Business Success
- First contract: $10/user/month × 10K+ employees
- System replaces biometric scanners within 3 months of deployment
- HR reports manual work reduction by 80%+
- Employee satisfaction: no more queues at entry/exit

---

## 12. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|------------|------------|
| Face recognition accuracy drops in varied lighting | High | Medium | Multi-image enrollment, confidence thresholds, manual override option |
| RTSP connection instability | Medium | High | Auto-reconnect, exponential backoff, status monitoring, fallback to batch |
| Privacy/legal concerns | High | Medium | GDPR compliance, consent flows, encryption, clear privacy policy |
| Scale issues at 10K employees | High | Medium | Vector search (FAISS), caching, horizontal scaling, load testing early |
| Camera compatibility issues | Medium | Medium | Document supported camera models, provide RTSP URL guide |
| Employee resistance ("surveillance") | Medium | High | Position as attendance tool, face data is math vectors not photos, transparency |

---

## 13. Open Questions

- [ ] Exact pricing model (per user/month, per camera, tiered?)
- [ ] Mobile app priority (P2 or earlier?)
- [ ] Integration requirements for first customer (any specific HR system?)
- [ ] On-premise deployment option needed? (some enterprises require this)
- [ ] Compliance requirements for Indian labor laws?
- [ ] Multi-language support needed?

---

## Appendix A: Competitive Landscape

| Solution | Type | Pros | Cons |
|----------|------|------|------|
| Biometric Scanners | Hardware | Proven, reliable | Queues, hardware costs, no insights |
| RFID Cards | Hardware | Fast | Lost cards, buddy punching |
| Manual Registers | Paper | Simple | Error-prone, no digital records |
| Keka/GreytHR | Software | Full HRMS | No auto-attendance, still need hardware |
| **Attndly** | **AI/CCTV** | **No hardware, automatic, insights** | **Requires CCTV, face recognition accuracy** |

## Appendix B: v0.1 Prototype Results
- Successfully detected 61 faces in a 75-frame video
- Matched 57 faces to enrolled employee (1 person test)
- Attendance logged with deduplication (57 detections → 1 attendance entry)
- Confidence score: 72.5% (will improve with better enrollment + GPU inference)
- Tech proven: deepface + Facenet512 + SSD detector works on Windows CPU
