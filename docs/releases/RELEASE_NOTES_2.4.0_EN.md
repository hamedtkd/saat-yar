# Saatyar 2.4.0 Release Notes

Candidate date: 2026-08-11

Final release date: 2026-08-12

Saatyar 2.4.0 is the first minor release after 2.3.2 and packages Phases 166 through 178. Phase 179 candidate `1cabdb4` was completed and the initial controlled `dev -> main` merge is `7627e99`. Phase 180 finalizes the release contract, the 770-test gate, and the requirement for a green production audit before the annotated tag.

## Highlights

- Onboarding moved to the dedicated `/onboarding` route with real recovery/re-entry and Employee/Freelancer/Hybrid personalization.
- Leave entitlement now separates the legal allowance, actual scheduled workdays, holidays, usage, and carry-over correctly.
- Completed-day editing has a persistent action bar, dirty state, and save feedback near the editor.
- The Import Wizard supports safe Backup and CSV/TSV preview, mapping, Persian/Gregorian dates, Persian digits, and explicit conflict strategies.
- A shared low-power runtime clock drives live timers without unnecessary hidden-tab ticks.
- Full i18n coverage now supports Persian RTL and English LTR across shell, core pages, business flows, Settings, Onboarding, Import, About, and system/PWA surfaces.
- CSV/Excel/Print, validation/toasts, runtime error bridging, route titles, and shared RTL/LTR geometry follow the active locale.
- The repository-wide `npm run audit:i18n` gate prevents new hard-coded Persian UI outside a narrow documented allowlist.
- A responsive quick language switch now keeps the current flag visible: desktop uses the sidebar utility area, while tablet/mobile use a compact header control so language access does not crowd navigation or break alignment.
- Calendar display is now independent but language-aware: Automatic uses Gregorian for English and Persian/Jalali for Persian, while Settings can explicitly override either combination without changing stored date keys.
- Month status markers use logical positioning so holiday/leave/deficit dots no longer overlap day numbers in LTR layouts.
- Payroll breakdown labels are derived from locale keys instead of Persian strings returned by the domain engine.
- The vendored QR encoder now has a browser-safe ESM entry point, fixing the Settings runtime failure under the Vite development server without adding a dependency.
- The default local `npm run dev` path now uses Next.js, matching the production build path and avoiding the Vite/Vinext HMR/RSC development-only failure seen during Windows visual QA; `npm run dev:vinext` remains available explicitly.
- Repeated page and section helper copy is now collapsed into compact keyboard-accessible info tooltips, while task-critical form hints, warnings, and empty-state guidance stay inline.
- Month day details isolate clock-in/clock-out values for stable bidi rendering, and zero-length work spans are now marked invalid instead of complete.
- The Iran language flag is intentionally rendered as plain green/white/red bands without a center emblem.
- The live Today timer now uses a theme-aware animated flip clock while preserving the shared low-power runtime scheduler instead of introducing another interval.
- Clock-in and clock-out regain proper card width on tablet/desktop; privacy, language, and theme are now visually separate controls rather than unrelated actions inside one grouped shell.
- Mobile Settings navigation removes the visible horizontal scrollbar, uses a two-column group grid on narrow screens, and keeps swipeable section items without breaking the header.
- The language navigation label is simplified to “Language”; direction remains an automatic locale behavior.

## Data and dependency contract

- AppData schema: **v17**
- New migration: **none**
- New dependency introduced by the candidate: **`framer-motion@^12.42.2`** for the flip-clock digit transition
- Backup and domain/storage values remain locale-neutral.
- Static metadata and the install manifest remain canonical Persian in 2.4.0, while runtime `lang/dir/title` follows the selected locale.

## Verified baseline

Phase 178 commit `887158c` passed:

```text
758 / 758 tests passed
TypeScript passed
ESLint passed
Next.js production build: 22 / 22 routes
PWA precache: 44 build assets
Production browser smoke passed
Freelancer browser smoke passed
Employee browser smoke passed
WebRTC pairing: 4 encrypted chunks + ACK
Vercel static-export audit passed
i18n closure audit passed
```

Phase 179 added six candidate contract tests and reached the **764/764** candidate gate. Phase 180 adds six finalization contracts, so the final gate must reach **770/770**.

## Rollout

The Phase 179 candidate is recorded as `1cabdb4`, and the initial controlled `dev -> main` merge is verified as `7627e99`. Phase 180 is committed on `dev`, merged to `main`, and deployed by Vercel. Only after `npm run audit:production` passes may the annotated `v2.4.0` tag be created on that exact final commit. The tag is the source of truth for the final release SHA; the manifest deliberately avoids a self-referential release-commit field.
