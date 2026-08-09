# Saatyar 2.3.2 Release Notes

Release date: 2026-08-09

Saatyar 2.3.2 is a patch release focused on employee-session recovery, work-schedule clarity, theme contrast, CI reliability, and repository documentation. AppData remains on schema v17 with no new migration or dependency.

## Highlights

- **Lunch and suggested-exit contract:** weekly targets now explicitly represent net work, while unpaid lunch extends the suggested exit without changing the net target.
- **Work-schedule settings polish:** the schedule summary, default lunch, and weekly net-target cards now share a balanced responsive layout.
- **Vercel-aligned CI:** the unused GitHub Pages deployment step was removed from GitHub Actions, leaving validation and the Vercel static-export contract as the CI responsibility.
- **Safe session recovery:** normal reloads no longer force-close an open workday. A stale auto-closed current-day session can be resumed, recording the disconnected gap as an unpaid break instead of inflating worked time.
- **Accessible accent fills:** cyan and blue filled controls use a dedicated darker fill with white foregrounds while preserving the brighter accent for identity, focus, and charts.
- **Repository documentation:** the canonical GitHub README is now English, the complete Persian README remains available, and the roadmap records a future Persian RTL / English LTR localization pass.

## Release quality

- Pre-finalization Phase 164 baseline: **633/633 tests**.
- Expected Phase 165 final gate: **639/639 tests**.
- Production, freelancer, and employee browser smokes remain mandatory.
- Direct WebRTC pairing remains mandatory with four encrypted chunks plus ACK.
- Vercel static-export and post-deploy production audits remain mandatory.
- Production PWA precache: 37 build assets.
- AppData schema: `v17`.
- New migration: none.
- New dependency: none.

The Phase 164 baseline commit is captured from `HEAD` by `npm run release:prepare:2.3.2` so the final manifest records the exact production-audited baseline.

## Tagging

Only after the Phase 165 commit is pushed, Vercel reports Ready, and `npm run audit:production` passes:

```bash
git tag -a v2.3.2 -m "Saatyar 2.3.2"
git push origin v2.3.2
```

The manifest intentionally contains no `releaseCommit`; the annotated tag is the source of truth for the final release commit.
