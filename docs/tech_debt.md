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
| 2   | Google OAuth credentials not configured                               | P1       | Sprint 1          | Need Google Cloud Console project + OAuth consent screen                            |
| 4   | No CSRF protection review                                             | P1       | Sprint 1          | Verify BetterAuth CSRF handling is sufficient                                       |
| 5   | Middleware uses cookie check only (no server-side session validation) | P1       | Sprint 1          | Middleware checks cookie existence, not validity; pages should validate server-side |
| 7   | `BETTER_AUTH_SECRET` must be a strong, rotated secret in production   | P0       | Sprint 1          | Currently a static dev value                                                        |

## Database & Schema

| #   | Item                                           | Priority | Sprint Introduced | Notes                                                          |
| --- | ---------------------------------------------- | -------- | ----------------- | -------------------------------------------------------------- |
| 8   | Role column has no enum constraint at DB level | P2       | Sprint 1          | Drizzle `text` with app-level validation only; consider pgEnum |
| 10  | No database backups configured                 | P0       | Sprint 0          | Need automated backup strategy for production                  |

## Frontend & UX

| #   | Item                                | Priority | Sprint Introduced | Notes                                                          |
| --- | ----------------------------------- | -------- | ----------------- | -------------------------------------------------------------- |
| 12  | No loading states on auth redirects | P2       | Sprint 1          | Brief flash possible between middleware redirect and page load |

## Infrastructure & DevOps

| #   | Item                                      | Priority | Sprint Introduced | Notes                                                                       |
| --- | ----------------------------------------- | -------- | ----------------- | --------------------------------------------------------------------------- |
| 16  | No test setup (Vitest/Playwright)         | P1       | Sprint 1          | Deferred per sprint decision; need before production                        |
| 18  | No production deployment config           | P0       | Sprint 0          | Need Vercel (web) + Railway/AWS (face-service) setup                        |
| 20  | Next.js 16 middleware deprecation warning | P2       | Sprint 1          | `middleware` convention deprecated in favor of `proxy`; migrate when stable |

## Performance & Scalability

| #   | Item                                           | Priority | Sprint Introduced | Notes                                                     |
| --- | ---------------------------------------------- | -------- | ----------------- | --------------------------------------------------------- |
| 21  | No caching strategy                            | P1       | —                 | Redis (Upstash) provisioned but unused                    |
| 22  | Face recognition vector search not implemented | P1       | —                 | Linear scan won't scale past 10K faces; need FAISS/Milvus |

## Compliance & Legal

| #   | Item                     | Priority | Sprint Introduced | Notes                                                 |
| --- | ------------------------ | -------- | ----------------- | ----------------------------------------------------- |
| 25  | No data retention policy | P0       | —                 | Facial data has legal implications (GDPR, local laws) |
| 26  | No audit logging         | P1       | —                 | Need to track who accessed what data and when         |

---

## Resolved

| #   | Item                                             | Resolved In | Resolution                                           |
| --- | ------------------------------------------------ | ----------- | ---------------------------------------------------- |
| 1   | Email verification is console-only               | Sprint 7    | Resend integration with console fallback             |
| 3   | No rate limiting on auth endpoints               | Sprint 7    | Upstash Ratelimit on sign-in/sign-up/password reset  |
| 6   | No password reset flow                           | Sprint 7    | BetterAuth + Resend forgot/reset password flow       |
| 9   | No database migrations workflow                  | Sprint 7    | drizzle-kit generate/migrate scripts                 |
| 11  | Dashboard nav items not filtered by user role    | Sprint 2    | app-sidebar.tsx filters nav items by session role    |
| 13  | Landing page footer links are placeholders (`#`) | Sprint 7    | Linked to /privacy, /terms, mailto:support           |
| 14  | No error boundary components                     | Sprint 7    | error.tsx + global-error.tsx with Sentry integration |
| 15  | No 404 custom page                               | Sprint 7    | Custom not-found.tsx with Attndly branding           |
| 17  | No CI/CD pipeline                                | Sprint 0    | .github/workflows/ci.yml                             |
| 19  | No environment variable validation               | Sprint 7    | Zod env schema in lib/env.ts with typed exports      |
| 23  | No privacy policy                                | Sprint 7    | /privacy page with comprehensive content             |
| 24  | No terms of service                              | Sprint 7    | /terms page with comprehensive content               |
