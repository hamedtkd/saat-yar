# Saatyar 2.2.0 Release Notes

Saatyar 2.2.0 is the largest product update since 2.1.0. It freezes the final multi-theme design across the main product surfaces, hardens the PWA/offline experience, persists customizable payroll rules in the application schema, and adds direct encrypted mobile/desktop data transfer without introducing a central user database.

## Highlights

### Customizable payroll

- Rule-based payroll with prorated monthly, fixed monthly, hourly, and daily bases.
- Independent overtime, holiday-work, deficit, and rounding policies.
- Live preview plus explainable payroll breakdowns in settings and reports.
- AppData moves from schema v16 to v17 with a compatible migration that preserves the legacy payroll result through an equivalent preset.

### Direct device transfer

- Versioned payloads with SHA-256 verification and a preview before applying data.
- Merge while keeping local conflicts, merge preferring incoming conflicts, or explicit replacement.
- AES-GCM-256 session encryption using a short-lived key that is not persisted with AppData.
- Direct WebRTC DataChannel transport between browsers.
- Fully local multi-frame QR pairing for large WebRTC offer/answer codes, with Copy/Paste and Share Link fallbacks.
- Bounded metadata-only transfer history; payloads and session keys are never stored in history.
- A real browser E2E smoke that transfers multiple encrypted chunks and verifies the ACK.

### Design and PWA

- Final multi-theme design language across Today, Month, Reports, Settings, Leave, Clients, Projects, and Invoices.
- PWA install identity, any/maskable icons, install UX, offline state, and user-approved update prompts.
- Generated Next.js assets are precached and offline navigation has a bounded network wait before cache fallback.
- Reproducible screenshot/GIF capture uses isolated demo data rather than real user records.

## Privacy

Saatyar remains local-first. Device transfer does not add a permanent backend or central database. Pairing codes are short-lived bearer secrets and must remain private; AppData itself is transferred over the established AES-GCM encrypted session.

## Data compatibility

```text
Package release: 2.2.0
Released baseline schema: v16
Current schema: v17
Migration: v16 → v17
Node.js: 22.x
```

Older supported backups are migrated to v17. Backups created by a newer unsupported schema are still rejected by older clients.

## Verified quality evidence

The verified candidate at commit prefix `f659456` passed the complete gate:

```text
423 tests passed
TypeScript + ESLint passed
Next.js production build passed
Static export: 19/19 routes
PWA offline reload smoke passed
Encrypted WebRTC browser pairing smoke passed (4 chunks + ACK)
```

Phase 120 adds six final-release contract tests, so the final release-source gate is expected to pass 429 tests.

## Release status

The v2.2.0 manifest is now `released` and preserves the verified candidate evidence. It intentionally does not embed the final commit SHA inside its own commit because that would create an unstable self-referential contract. The annotated `v2.2.0` Git tag is the source of truth for the final release commit and must be created on the final release-source commit after the Phase 120 gate is green:

```bash
git tag -a v2.2.0 -m "Saatyar 2.2.0"
git push origin v2.2.0
```
