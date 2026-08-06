# Saatyar Agent and Contributor Guide

This document is the English entry point for coding agents and human contributors. The Persian guide remains available at [`AGENT_GUIDE_FA.md`](./AGENT_GUIDE_FA.md), and change-specific safety checks are collected in [`CHANGE_CHECKLISTS.md`](./CHANGE_CHECKLISTS.md).

## 1. Product contract

Saatyar is a Persian-first, RTL, local-first worklog and time-tracking web application. Core user data is stored in the browser, primarily through IndexedDB. A change is not complete merely because the current UI works: existing local data, backup files, migrations, keyboard access, light/dark themes, and mobile layouts must remain safe.

Non-negotiable behavior:

- Preserve Persian copy and RTL layout unless the task explicitly changes product language behavior.
- Preserve local-first operation and avoid introducing an unnecessary backend or account dependency.
- Keep employee, freelancer, and hybrid workflows compatible.
- Keep light, dark, and system themes readable through semantic design tokens.
- Do not expose secrets, real user backups, or private data in commits, logs, fixtures, or screenshots.

## 2. Start every task safely

1. Read `README.md`, `AGENTS.md`, this guide, and the relevant phase notes.
2. Run `git status` and protect pre-existing work. Never reset or overwrite unrelated changes.
3. Identify the actual owner of the behavior before editing. Follow the route, controller, domain function, persistence path, and tests.
4. For a large or risky change, write a plan before editing.
5. Keep the change small enough to review and rollback.
6. Add behavioral regression coverage for product logic. Source-based checks are reserved for stable repository or architecture contracts.

Recommended baseline:

```bash
npm ci
npm run check:quality
```

## 3. Repository map

- `app/`: routes, layouts, and application entry points.
- `components/common/`: reusable product components.
- `components/layout/`: shell, navigation, header, and onboarding layout.
- `components/pages/`: feature-level page composition.
- `components/pickers/`: date and time pickers.
- `components/ui/`: shared UI primitives, normally based on official shadcn/ui and Radix components.
- `hooks/controller/`: application workflows and mutations.
- `hooks/settings/`: settings drafts, dirty state, save, and cancel behavior.
- `hooks/use-saatyar-controller.ts`: the main product-state facade.
- `hooks/use-persisted-app-data.ts`: local-first loading and persistence orchestration.
- `lib/data/`: schema versioning, factories, normalization, migrations, and audit contracts.
- `lib/time-engine.ts`: time calculations.
- `lib/payroll.ts`: payroll calculations.
- `lib/backup-schema.ts`: backup validation and transport envelope handling.
- `lib/storage.ts`: IndexedDB storage adapter.
- `scripts/`: build, quality, schema audit, and production browser smoke utilities.
- `tests/`: domain, regression, architecture, and repository contract tests.

## 4. UI and component rules

- Prefer an existing shared component before introducing another implementation.
- For a new general-purpose primitive, install the official shadcn/ui component and adapt it to the project design system. Do not maintain a parallel hand-written substitute without a documented reason.
- Use semantic theme tokens. Avoid hard-coded surface, text, border, and status colors in feature UI.
- Keep Tailwind classes next to the component markup; do not create a central class registry.
- Keep production files below 250 lines where practical. Extract behavior by responsibility, not merely to satisfy a line limit.
- Verify desktop and mobile layouts, RTL alignment, light/dark themes, keyboard navigation, focus return, Escape behavior, and reduced motion.
- When auto-save is disabled, settings must use an explicit draft, save, and cancel contract.

## 5. Data, schema, and backup safety

Persisted-data changes are high risk. Before modifying `AppData` or any stored collection, complete the data checklist.

A compatible schema change normally requires all of the following:

1. Increment the schema version when the persisted contract changes incompatibly.
2. Add a step-by-step migration from the previous supported version.
3. Update the central `AppData` factory and normalization path.
4. Update backup validation and restore behavior.
5. Check recovery, snapshot, merge, and IndexedDB paths.
6. Keep backup transport metadata outside application state.
7. Add regression tests for old data and round trips.
8. Run the schema audit and inspect its path-aware report.

Never silently drop a collection, accept an unknown replacement key, or let backup envelope metadata enter `AppData`.

## 6. Testing strategy

Use the narrowest test that proves the user-visible or domain behavior, then run the full quality pipeline.

- Domain calculation: pure unit test.
- Persistence, backup, migration, or recovery: round-trip and old-data regression tests.
- Hook/controller behavior: public output and workflow contract tests.
- UI behavior: accessibility and interaction tests where available.
- Repository layout and documentation policy: stable architecture contract tests.
- Production navigation: browser smoke tests against the static production export.

Do not couple product tests to a private variable name, whitespace, or an incidental implementation shape. Do not delete or weaken a failing test merely to make CI green.

## 7. Required validation

Before opening a pull request:

```bash
npm run check:quality
npm run check:release
```

`check:quality` runs the repository quality pipeline and production build. `check:release` also runs the production browser smoke test on the built static export. If the release check cannot run in your environment, document the exact limitation and every substitute command you executed.

For data changes, also inspect:

```bash
npm run audit:schema
```

## 8. Documentation and phase hygiene

- Put phase notes only in `docs/phases/`.
- Keep the canonical backlog in `docs/roadmap/BACKLOG_FA.md`.
- Update the backlog only when the implementation and its validation are complete.
- Keep root contract files such as `README.md`, `AGENTS.md`, `CONTRIBUTING.md`, `SECURITY.md`, and `CHANGELOG.md` at the repository root.
- Update screenshots and user documentation when behavior or UI changes materially.

## 9. Pull request handoff

A useful handoff states:

- the problem and the observable result;
- the exact scope and deliberate non-goals;
- important technical decisions and trade-offs;
- commands run and their results;
- schema, migration, backup, IndexedDB, and recovery impact;
- UI evidence for desktop/mobile and light/dark themes when relevant;
- known risks and the rollback path.

Do not claim a command passed unless you ran it and saw the successful output.
