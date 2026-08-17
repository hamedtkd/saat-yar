# Saatyar 2.5.0 Release Candidate Notes

Candidate date: 2026-08-17

Saatyar 2.5.0 packages the post-2.4.0 development line from Phases 181 through 192. The verified Phase 192 baseline is `0c4c22e` with **870/870 tests**. Phase 193 prepares the candidate only; merge to `main`, production rollout, final release date, and annotated tag remain pending until the full release matrix is green.

## Highlights

- Faster first-run onboarding with Fast Setup, Skip, reusable workday application, and clearer first actions for Employee, Freelancer, and Hybrid workspaces.
- Flexible daily targets and Activity Segments for Deep Work, Meetings, Learning, Admin, Projects, and Other activity without requiring fixed start/end times.
- Notification Intelligence with quiet hours, global snooze, multiple active-work reminders, and pause-aware timing.
- Privacy-safe product analytics with browser-local consent, allowlisted event taxonomy, and no work-content payloads.
- Month Intelligence with a GitHub-style activity heatmap, streaks, recent activity, and overtime/deficit distribution.
- Reduced-motion-aware route transitions, route-specific loading skeletons, and perceived-performance improvements without changing domain state.
- Optional Google Calendar read/write integration with least-privilege scopes, memory-only access tokens, browser-local calendar preferences, and no automatic conversion into worked time or payroll.
- Incremental Google Calendar sync using `syncToken`, safe 410 fallback, cache isolation outside AppData, ETag/`If-Match` stale-write protection, overlap/duplicate intelligence, Day/Week planning, explicit Event-to-Activity import, and safe recurring occurrence/series editing.
- Payroll rate-basis correction with a configurable standard month (220 hours by default) and an explicit period-target alternative.
- Shared Payroll Period Facts across Reports and Payroll Preview so holiday work cannot hide regular deficits, paid leave is credited consistently, and base/overtime/holiday/deficit rates come from one engine.
- Behavioral test modernization with a pure Report Summary contract and a repository audit that prevents new source/regex-coupled product tests from Phase 192 onward.

## Data and migration contract

- Released 2.4.0 schema: **v17** (immutable historical release contract)
- 2.5.0 candidate schema: **v20**
- Migration chain under audit: **v17 → v18 → v19 → v20**
- v18 adds flexible daily targets and Activity Segments.
- v19 adds Notification Intelligence while privacy-safe analytics remains outside AppData.
- v20 adds the payroll hourly-rate basis and standard-month minutes.
- Google Calendar event/cache metadata remains outside AppData in its separate browser cache; OAuth access tokens remain memory-only.
- No new dependency is introduced by Phase 193.

## Candidate baseline

Phase 192 commit `0c4c22e` passed:

```text
870 / 870 tests passed
TypeScript passed
ESLint passed
Next.js static build passed
Production browser smoke passed
Freelancer browser smoke passed
Employee browser smoke passed
WebRTC pairing smoke passed
Vercel static-export audit passed
Schema v20 audit passed
i18n closure audit passed
Test-coupling audit passed
```

Phase 193 adds release-candidate contracts and targets **874/874** Node tests before commit.

## Candidate rollout boundary

This is not a final release. During Phase 193:

- work stays on `dev`;
- `main` is not changed;
- `releaseDate` stays `null`;
- the manifest status stays `release-candidate`;
- no release commit is embedded in the manifest;
- no `v2.5.0` tag is created.

A later finalization phase must merge the verified candidate to `main`, deploy it, run `npm run audit:production`, and only then create the annotated `v2.5.0` tag on the exact verified final commit.
