# Tech Debt Tracker

Track items that need to be addressed before production and pilot deployment.

## Legend

- **P0** — Must fix before pilot
- **P1** — Must fix before production
- **P2** — Should fix, can defer

---

## Authentication & Security

| #   | Item                                                                  | Priority | Sprint Introduced | Notes                                                                               |
| --- | --------------------------------------------------------------------- | -------- | ----------------- | ----------------------------------------------------------------------------------- |
| 1   | Email verification is console-only (no email provider)                | P0       | Sprint 1          | Need Resend/SES integration for real verification emails                            |
| 2   | Google OAuth credentials not configured                               | P1       | Sprint 1          | Need Google Cloud Console project + OAuth consent screen                            |
| 3   | No rate limiting on auth endpoints                                    | P0       | Sprint 1          | Add rate limiting to prevent brute force attacks                                    |
| 4   | No CSRF protection review                                             | P1       | Sprint 1          | Verify BetterAuth CSRF handling is sufficient                                       |
| 5   | Middleware uses cookie check only (no server-side session validation) | P1       | Sprint 1          | Middleware checks cookie existence, not validity; pages should validate server-side |
| 6   | No password reset flow                                                | P0       | Sprint 1          | Users cannot recover accounts                                                       |
| 7   | `BETTER_AUTH_SECRET` must be a strong, rotated secret in production   | P0       | Sprint 1          | Currently a static dev value                                                        |

## Database & Schema

| #   | Item                                           | Priority | Sprint Introduced | Notes                                                                    |
| --- | ---------------------------------------------- | -------- | ----------------- | ------------------------------------------------------------------------ |
| 8   | Role column has no enum constraint at DB level | P2       | Sprint 1          | Drizzle `text` with app-level validation only; consider pgEnum           |
| 9   | No database migrations workflow                | P0       | Sprint 0          | Using `drizzle-kit push` (fine for dev); need proper migrations for prod |
| 10  | No database backups configured                 | P0       | Sprint 0          | Need automated backup strategy for production                            |

## Frontend & UX

| #   | Item                                             | Priority | Sprint Introduced | Notes                                                            |
| --- | ------------------------------------------------ | -------- | ----------------- | ---------------------------------------------------------------- |
| 11  | Dashboard nav items not filtered by user role    | P1       | Sprint 1          | All nav items shown regardless of role; needs session role check |
| 12  | No loading states on auth redirects              | P2       | Sprint 1          | Brief flash possible between middleware redirect and page load   |
| 13  | Landing page footer links are placeholders (`#`) | P1       | Sprint 1          | Privacy, Terms, Contact pages need real content                  |
| 14  | No error boundary components                     | P1       | Sprint 0          | App crashes show default Next.js error page                      |
| 15  | No 404 custom page                               | P2       | Sprint 0          | Using default Next.js not-found                                  |

## Infrastructure & DevOps

| #   | Item                                      | Priority | Sprint Introduced | Notes                                                                       |
| --- | ----------------------------------------- | -------- | ----------------- | --------------------------------------------------------------------------- |
| 16  | No test setup (Vitest/Playwright)         | P1       | Sprint 1          | Deferred per sprint decision; need before production                        |
| 17  | No CI/CD pipeline                         | P0       | Sprint 0          | Need GitHub Actions for lint, type-check, build, test                       |
| 18  | No production deployment config           | P0       | Sprint 0          | Need Vercel (web) + Railway/AWS (face-service) setup                        |
| 19  | No environment variable validation        | P1       | Sprint 0          | App silently fails with missing env vars; need startup validation           |
| 20  | Next.js 16 middleware deprecation warning | P2       | Sprint 1          | `middleware` convention deprecated in favor of `proxy`; migrate when stable |

## Performance & Scalability

| #   | Item                                           | Priority | Sprint Introduced | Notes                                                     |
| --- | ---------------------------------------------- | -------- | ----------------- | --------------------------------------------------------- |
| 21  | No caching strategy                            | P1       | —                 | Redis (Upstash) provisioned but unused                    |
| 22  | Face recognition vector search not implemented | P1       | —                 | Linear scan won't scale past 10K faces; need FAISS/Milvus |

## Compliance & Legal

| #   | Item                     | Priority | Sprint Introduced | Notes                                                 |
| --- | ------------------------ | -------- | ----------------- | ----------------------------------------------------- |
| 23  | No privacy policy        | P0       | —                 | Required before collecting any user/biometric data    |
| 24  | No terms of service      | P0       | —                 | Required before pilot                                 |
| 25  | No data retention policy | P0       | —                 | Facial data has legal implications (GDPR, local laws) |
| 26  | No audit logging         | P1       | —                 | Need to track who accessed what data and when         |

---

## Resolved

| #   | Item | Resolved In | Resolution |
| --- | ---- | ----------- | ---------- |
| —   | —    | —           | —          |
