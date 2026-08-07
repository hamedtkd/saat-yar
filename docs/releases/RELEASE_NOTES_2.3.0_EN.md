# Saatyar 2.3.0 — Release Notes

Saatyar 2.3.0 follows the stable 2.2.0 release and focuses on product UX polish, complete freelancer and employee workflows, Persian/Jalali form controls, and a stricter release gate.

This version is now `released`. The verified release candidate at commit prefix `75b7be6` passed **575/575 tests, the full production build, and the production, freelancer, and employee browser smokes**. The direct WebRTC pairing smoke also transferred **four encrypted chunks with an ACK**. Phase 153 adds six final-release contract tests, so the final source gate is expected to reach **581/581**.

## Highlights since 2.2.0

### Navigation and product UX

- The header and local profile menu are lighter and more consistent, while the workspace switcher, bottom navigation, and sidebar use clearer responsive contracts.
- Today gained previous/next-day navigation, a direct return-to-today action, and improved historical-day behavior.
- Settings now has search, anchors, scroll-spy behavior, and grouped desktop/mobile navigation.
- A dedicated About/Help page documents the local-first model and contact paths.

### Freelancer forms and workflows

- Clients and projects can be created in context and automatically selected without leaving the owning form.
- Invoice, timer, and manual-time flows can create related clients/projects inline.
- Inline validation, keyboard submission, useful empty-state CTAs, and semantic toasts replace raw browser interactions.
- Financial dates use the shared Jalali picker; localized numeric input and design-system wrappers cover native number/color/file controls.
- A real browser journey covers Client → Project → Time → Expense → Invoice, IndexedDB durability, hard reload, dialog focus, and mobile viewport behavior.

### Employee workflow

- A real browser journey covers Start/Lunch/Break/End, daily notes, historical editing, Month, and Reports.
- Every break exposes an explicit paid/unpaid state, and nested lunch/break mutations are applied atomically against the latest WorkRecord.
- The reference `08:00–17:00` day with a 30-minute lunch and 15-minute unpaid break is verified as `8:15` net work in both UI and IndexedDB.
- Hard reload verifies the restored textarea value and completed-day state on the mobile Today viewport.

### Release-gate hardening

- `check:release` now runs quality checks, the release audit, production/PWA smoke, freelancer browser UX, and employee browser UX against the same build.
- Browser startup performs one bounded retry only for infrastructure-level CDP startup failures; real UX failures are never retried.
- Browser harnesses use React-compatible InputEvent updates, section-scoped selectors, and direct IndexedDB persistence probes to reduce false positives and timeouts.

## Data compatibility

- AppData remains on **schema v17**.
- There is no new schema migration from 2.2.0 to 2.3.0.
- Existing v17 backups remain directly compatible, while the historical v16→v17 migration remains covered.
- Encrypted device transfer, WebRTC/QR pairing, offline PWA behavior, and configurable payroll policies remain intact.

## Media and documentation

The README media continues to be produced from deterministic demo fixtures. `npm run media:capture` remains the reproducible capture command and must not read real user data.

## Final release gate

Run on the release workstation:

```bash
npm run check:release
npm run test:browser:pairing
git diff --check
git status
```

Phase 153 expects **581 passing tests and zero failures**, plus:

```text
Production browser smoke passed.
Freelancer browser UX smoke passed.
Employee browser UX smoke passed.
```

The release candidate at commit prefix `75b7be6` passed 575/575 tests, the full build, and the production, freelancer, and employee browser smokes. The direct WebRTC pairing smoke also passed four encrypted chunks with an ACK. The 2.3.0 manifest is now `released`.

Phase 153 adds six final-release contract tests for an expected 581-test final source gate. The manifest intentionally contains no `releaseCommit`; the annotated `v2.3.0` Git tag created after the final commit is the source of truth for the final release commit.
