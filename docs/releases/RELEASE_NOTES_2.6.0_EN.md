# Saatyar 2.6.0 Release Candidate Notes

Candidate date: 2026-08-20
Final release date: not set yet

Saatyar 2.6.0 is a real minor release after 2.5.0 and packages the product and hardening work from Phases 195 through 200. The final Phase 200 baseline is commit `15f5af8`, verified with **958/958 tests** and the full release gate. Phase 201 only packages the candidate; no new product feature enters this version.

## Highlights

- Public About / Help / Privacy / Terms surfaces and explicit Google Calendar disclosures for OAuth verification readiness.
- Real GA4 delivery with local consent/opt-out and a privacy-safe event payload that excludes work content.
- Corrected leave intelligence in Work Calendar and recent activity without inventing worked minutes.
- Shared portal-safe, viewport-aware tooltip infrastructure and broader production observability.
- Redesigned onboarding/first-run and a freelancer workflow centered on a project timer rather than employee attendance semantics.
- Freelancer Work Session with Start / Pause / Resume / Finish, reload recovery, real persisted timeline, and single-session protection.
- Dedicated Employee / Freelancer / Hybrid Today routes while `/today` remains a compatibility entry point.
- Shared responsive Date/Time Picker with a mobile drawer, desktop popover, time wheel, and no remaining native datetime-local editor.
- Explicit 320px hardening plus 360/375/425 responsive coverage across RTL/LTR surfaces.
- Employee Activity Context with an optional Work Item, employee Work Projects isolated from client projects, live activity timing, and completed activity edit/delete.
- Direct Clock-in / Clock-out / Lunch / Break editing without opening the full completed-day editor.
- Trust footer/pages, cached GitHub star count with safe failure behavior, and final header/mobile navigation polish.
- “My month” is now **Work Calendar** (`تقویم کاری` in Persian); the technical `/month` route remains stable for compatibility.
- PWA install identity is now `Saatyar | ساعت یار`, with compact launcher label `Saatyar`.
- Long-date reading order is language-specific: Persian follows weekday, day, month, year; English follows weekday, month, day, year.
- Runtime favicon/brand follows the active accent while the installed launcher icon remains a stable app identity.
- Release hardening audits dynamic code, persistent OAuth token storage, unsafe external links, reviewed inline HTML, Vercel security headers, and explicit manifest/service-worker revalidation.

## Data and migration contract

- Released 2.5.0 schema: **v20**
- 2.6.0 candidate schema: **v21**
- Audited release migration: **v20 → v21**
- v21 adds `ActivitySegment.title?`, `workProjects`, and `workProjectId?` for Employee/Hybrid activity context.
- Employee work projects remain isolated from Freelancer client projects; Hybrid may access both contexts without leakage.
- Google Calendar cache/token, analytics consent, and locale/PWA preferences remain outside AppData.
- Backup/restore and device-transfer behavior for v21 are covered by the Phase 200 behavioral gate.

## Verified Phase 200 baseline

```text
958 / 958 tests passed
TypeScript passed
ESLint passed
Hardening audit passed
AppData schema v21 audit passed
Behavioral migration v17 -> v21 passed
Next.js 37/37 static routes passed
Production browser smoke passed
Freelancer browser smoke passed
Employee browser smoke passed
WebRTC pairing smoke passed
Vercel static-export + security-header audit passed
PWA offline reload passed
RTL 360/375/425 + LTR 375 + Employee/Freelancer 320 passed
```

## Release-candidate boundary

Phase 201 is **not** the final production release:

- the candidate stays on `dev`;
- `main` is not changed in this phase;
- `releaseDate` remains `null`;
- manifest status remains `release-candidate`;
- `candidateCommit` remains `null` until the local candidate commit is created after the full gate;
- no `v2.6.0` tag is created;
- Phase 202 alone may promote the verified candidate to `main`, run the production audit, and create the annotated tag.
