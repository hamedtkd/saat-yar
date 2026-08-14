<div align="center">

<img src="./public/brand/saatyar-mark-accent.svg" width="112" height="112" alt="Saatyar logo" />

# Saatyar

### A Persian-first, RTL, local-first web app for worklogs, attendance, payroll, projects, and income

[![Quality](https://img.shields.io/badge/quality-600%2B%20tests%20passing-16a34a)](#quality-gates)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-0f766e)](./LICENSE)
[![RTL](https://img.shields.io/badge/RTL-Persian-7c3aed)](#product-scope)

[فارسی](./README_FA.md) · [Live app](https://saat-yar.vercel.app) · [Run and deploy](./RUN_AND_DEPLOY_FA.md) · [Contributing](./CONTRIBUTING.md) · [Support development](https://daramet.com/hamedtkd)

</div>

---

## What is Saatyar?

Saatyar is an open-source, Persian-first, right-to-left, **local-first** web application for personal work-time management. Employees, freelancers, and hybrid workers can record attendance, lunch, breaks, leave, projects, expenses, invoices, and reports without creating an account or depending on a remote backend.

Core product data is stored in the user's browser through IndexedDB. Normal daily use does not require a backend, cloud account, or `.env` file.

## Live app

The public deployment is available at:

**https://saat-yar.vercel.app**

For real long-term data, create regular JSON backups from the data and backup section. Browser storage is not a substitute for an external backup.

## Product media

The screenshots below come from a real production build using isolated demo fixtures. The capture workflow does not read real user data.

<p align="center">
  <img src="./docs/assets/screenshots/today-light-desktop.png" alt="Saatyar Today dashboard in light mode" width="920" />
</p>

<table>
  <tr>
    <td width="50%"><img src="./docs/assets/screenshots/today-dark-desktop.png" alt="Saatyar Today dashboard in dark mode" /></td>
    <td width="50%"><img src="./docs/assets/screenshots/reports-light.png" alt="Saatyar reports in light mode" /></td>
  </tr>
  <tr>
    <td width="50%"><img src="./docs/assets/screenshots/reports-dark.png" alt="Saatyar reports in dark mode" /></td>
    <td width="50%"><img src="./docs/assets/screenshots/today-mobile.png" alt="Saatyar Today dashboard on mobile" /></td>
  </tr>
</table>

### Short onboarding demo

<p align="center">
  <img src="./docs/assets/media/onboarding.gif" alt="Saatyar onboarding demo" width="760" />
</p>

Regenerate the media with `npm run media:capture`. See [docs/assets/README.md](./docs/assets/README.md) for the privacy-safe capture contract.

## Product scope

### Attendance and time tracking

- Start and finish a workday
- Record paid or unpaid lunch
- Record multiple independent breaks
- Edit start, end, lunch, and break times precisely
- Handle shifts that cross midnight
- Suggest an exit time from the selected day's schedule
- Recover stale open sessions, resume an auto-closed current-day session safely, and keep the recovery gap out of worked time
- Optional break reminders and open-timer notifications

### Work modes

- **Employee:** attendance, targets, overtime, deficit, leave, and estimated payroll
- **Freelancer:** clients, projects, hourly rates, budgets, expenses, and invoices
- **Hybrid:** employee and freelancer workflows in the same local workspace

### Schedule and payroll

- Independent schedule for each weekday
- Configurable net-work weekly target distributed over enabled days
- Bulk lunch defaults for duration and paid/unpaid accounting, with per-day overrides
- Selectable payroll basis: prorated monthly, fixed monthly, hourly, or daily
- Independent overtime, holiday-work, deficit, and rounding policies
- Official holidays and manual date overrides
- Live payroll preview and explainable breakdown of earnings, benefits, deductions, and net pay

### Reports and data safety

- Monthly attendance, target, overtime, and deficit reports
- GitHub-style monthly work-activity heatmap with keyboard navigation, streaks, and overtime/deficit intelligence
- Daily details and record filters
- CSV and Excel export
- A4-aware print and PDF output
- Versioned backup and restore
- Automatic migration of older local data
- Local recovery snapshots and a 30-day recycle bin
- Direct encrypted mobile/desktop transfer over WebRTC with locally generated pairing QR codes

### User experience

- Bilingual Persian/RTL and English/LTR interface with a quick flag language switcher
- Language-aware calendar: Auto follows the interface language, with explicit Persian/Jalali or Gregorian override
- Light, dark, and system themes
- Configurable accent, surface, and radius options
- Locally bundled Vazirmatn font
- Responsive desktop and mobile layouts
- Keyboard access, focus management, and reduced-motion support
- PWA install UX, offline shell, and user-approved update prompts where the browser supports them

## Privacy and the local-first model

Saatyar does not send core work records to a project server by default. Data belongs to the browser profile and origin where the application is used.

This has useful properties:

- No account is required
- The user keeps direct control of their data
- Core workflows are not tied to a continuously available backend
- There is no central Saatyar database containing users' private work records

It also creates a responsibility: clearing site data, changing browsers or devices, using private browsing, or moving to a different origin can make local records unavailable. Regular exported backups are essential for serious use.

## Quick start

### Requirements

- Node.js `22.x`
- npm bundled with Node.js
- Git

### Clone and run

```bash
git clone https://github.com/hamedtkd/saat-yar.git
cd saat-yar
npm ci
npm run dev
```

The default local development server uses Next.js and normally starts at:

```text
http://localhost:3000
```

If you specifically need the optional Vite/Vinext environment, run:

```bash
npm run dev:vinext
```

Vite/Vinext normally uses `http://localhost:5173`. `npm run dev:next` remains an explicit alias for the default Next.js server.

Installation problems are documented in:

- [Windows and npm troubleshooting — English](./docs/TROUBLESHOOTING_EN.md)
- [راهنمای عیب‌یابی Windows و npm — فارسی](./docs/TROUBLESHOOTING_FA.md)

## Main commands

| Command | Purpose |
| --- | --- |
| `npm ci` | Install the exact dependency tree from the lockfile |
| `npm run dev` | Start the stable local Next.js development server |
| `npm run dev:next` | Explicit alias for the default Next.js development server |
| `npm run dev:vinext` | Start the optional Vite/Vinext development server |
| `npm run check:dependencies` | Verify direct dependencies after replacing a phase package |
| `npm run typecheck` | Run TypeScript validation without emitting files |
| `npm run lint` | Run ESLint with zero warnings allowed |
| `npm test` | Run domain, regression, and architecture tests |
| `npm run check` | Run cleanup, import checks, schema audit, typecheck, lint, and tests |
| `npm run check:quality` | Run the complete quality pipeline and production Next.js build |
| `npm run test:browser:production` | Build the static export and run the Chromium production smoke test |
| `npm run check:release` | Run quality checks and the production browser smoke test on the same build |
| `npm run test:browser:pairing` | Run the real WebRTC encrypted multi-chunk transfer/ACK smoke |
| `npm run audit:vercel` | Verify the local static-export → `out/` Vercel deployment contract |
| `npm run audit:production` | Read-only audit of deployed routes, PWA, service worker, robots, and sitemap |
| `npm run media:capture` | Regenerate product screenshots/GIF from isolated demo data |
| `npm run build:pages` | Produce the static application build |
| `npm run build:vercel` | Produce the Vercel-compatible build |
| `npm start` | Start the Vinext production output |

Before pushing a change:

```bash
npm run check:quality
npm run check:release
```

## Time calculation

```text
attendance = exit - entry
net work = attendance - unpaid lunch - unpaid breaks
credited time = net work + credited leave
daily balance = credited time - selected-day target
```

Paid lunch and paid breaks are not subtracted from net work. Manually edited records use the selected day's clock values so stale timestamps cannot create multi-day overtime.

## Payroll calculation

```text
daily base salary = monthly salary / 30
```

Partial days are prorated from credited time. Time above the daily target can use the configured overtime multiplier, and holiday work can use the configured holiday multiplier.

> Saatyar provides personal estimates. It does not replace an employment contract, official payslip, accountant, or applicable labor and tax rules.

## Architecture

```text
app/                           Routes and application layout
components/
  common/                      Shared product components
  layout/                      Shell, header, navigation, and onboarding
  pages/                       Today, month, reports, settings, and business views
  pickers/                     Jalali date and time pickers
  ui/                          Shared UI primitives
hooks/
  controller/                  Application workflows and mutations
  settings/                    Draft-based settings editing
  use-saatyar-controller.ts    Main product state facade
  use-persisted-app-data.ts    Local-first loading and persistence
lib/
  data/                        Schema, migrations, normalization, and audit
  time-engine.ts               Time calculation engine
  payroll.ts                   Payroll calculations
  work-schedule.ts             Weekly schedule and targets
  backup-schema.ts             Backup validation
  storage.ts                   IndexedDB storage adapter
  types.ts                     Domain contracts
scripts/                       Build, quality, and browser smoke utilities
tests/                         Domain, regression, architecture, and repository tests
```

## Data schema and migrations

The current application schema version is defined in `lib/data/version.ts`. Any incompatible data change must include:

1. A schema version increment
2. A deterministic migration step
3. Normalization for incomplete legacy data
4. Backup validation and round-trip coverage
5. Regression tests and a passing schema audit

See [docs/DATA_MIGRATIONS.md](./docs/DATA_MIGRATIONS.md).

## Quality gates

The repository protects the product through several layers:

- Local import resolution checks
- Direct dependency preflight
- Runtime `AppData` schema audit across factory, migration, backup, recovery, snapshot, and merge paths
- TypeScript validation
- ESLint with `--max-warnings=0`
- Domain tests for time, payroll, backup, recovery, and migration
- Architecture and source-boundary tests
- Theme and semantic-token tests
- Next.js production build and static prerendering
- A real Chromium smoke test covering initial load, onboarding, the Today route, and calendar navigation

The current suite contains more than **600 tests**. The exact release evidence should always come from the current `npm run check:release` output rather than a hard-coded badge alone.

## Browser support

The automated release browser gate currently runs in Chrome, Edge, or Chromium. Firefox and Safari require manual verification for release-critical UI changes. IndexedDB, multi-tab coordination, service-worker behavior, PWA installation, notifications, and private-mode limitations are documented in the [browser compatibility matrix](./docs/BROWSER_COMPATIBILITY.md).

## UI and styling policy

- Tailwind classes stay next to the JSX that owns them.
- Product surfaces use semantic theme tokens instead of fixed color literals.
- There is no central Tailwind class registry such as `lib/tw.ts`.
- `app/globals.css` contains only global styles, tokens, print rules, and browser-level behavior.
- Production UI and hook modules should remain focused and generally below 250 lines.
- Destructive actions use the shared official Radix/shadcn Alert Dialog wrapper.

## Deployment

The Persian deployment guide covers Windows, macOS, Linux, Docker, GitHub Pages, and Vercel:

[Run and deployment guide](./RUN_AND_DEPLOY_FA.md)

- [Latest stable Saatyar 2.4.0 release notes](./docs/releases/RELEASE_NOTES_2.4.0_EN.md)
- [Latest stable Saatyar 2.3.2 release notes](./docs/releases/RELEASE_NOTES_2.3.2_EN.md)
- [Historical Saatyar 2.3.1 release notes](./docs/releases/RELEASE_NOTES_2.3.1_EN.md)
- [Historical Saatyar 2.3.0 release notes](./docs/releases/RELEASE_NOTES_2.3.0_EN.md)
- [Historical Saatyar 2.2.0 release notes](./docs/releases/RELEASE_NOTES_2.2.0_EN.md)
- [Historical Saatyar 2.1.0 release notes](./docs/releases/RELEASE_NOTES_2.1.0_EN.md)

## Contributing

Bug reports, UX suggestions, documentation fixes, and pull requests are welcome.

Before opening a pull request, read [CONTRIBUTING.md](./CONTRIBUTING.md) and the [English agent guide](./docs/agents/AGENT_GUIDE_EN.md). Security vulnerabilities must not be reported in a public issue; use the responsible disclosure path in [SECURITY.md](./SECURITY.md).

## Roadmap

Version **2.4.0** is the latest stable Saatyar release and packages Phases 166–180: dedicated recoverable onboarding, corrected leave entitlement, completed-day editing feedback, the Import Wizard, the shared live runtime clock, full Persian RTL / English LTR i18n hardening, and the final release contract.

The verified Phase 178 baseline at `887158c` passed **758/758 tests**. Phase 179 candidate `1cabdb4` completed the **764/764** gate, and Phase 180 added six finalization contracts for a **770/770** final gate. The released 2.4.0 data contract stays immutable on schema v17. Post-release development advances AppData to **schema v18** in Phase 182 for flexible daily targets and persistent activity segments, with a v17→v18 migration that keeps existing users in scheduled mode. See the [2.4.0 release notes](./docs/releases/RELEASE_NOTES_2.4.0_EN.md), the [Phase 182 notes](./docs/phases/PHASE_182_NOTES_FA.md), and the [roadmap](./docs/roadmap/BACKLOG_FA.md).

The 2.4.0 manifest is `released` and intentionally does not embed its own final release commit. After the final `dev -> main` merge and Vercel deployment, `npm run audit:production` must pass before the annotated `v2.4.0` tag is created. That tag is the source of truth for the exact final release commit. Historical 2.3.2 and earlier manifests/tags remain immutable.

## Support development

Saatyar remains free and open source. Optional support is available at:

**https://daramet.com/hamedtkd**

Support does not unlock product features and is not required to use the application.

## License

Saatyar is released under the [MIT License](./LICENSE).

## Author

Maintained by **Hamed Ahmadi — hamedtkd**

- GitHub: [hamedtkd](https://github.com/hamedtkd)
- Support: [daramet.com/hamedtkd](https://daramet.com/hamedtkd)
