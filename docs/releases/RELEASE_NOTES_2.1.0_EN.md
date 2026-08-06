# Saatyar 2.1.0 Release Notes

Prepared on **August 7, 2026**.

Saatyar 2.1.0 is a stability and public-release readiness update. It focuses on local data safety, explicit settings editing, production browser validation, repository contracts, and release documentation.

## Highlights

### Safer settings and navigation

- Completed the view, edit, save, and cancel workflow across settings cards.
- Prevented unsafe autosave activation while other cards contain unsaved drafts.
- Guarded route, date, and browser-history navigation when local drafts are dirty.
- Migrated destructive confirmations and unsaved-change warnings to the official Radix/shadcn Alert Dialog primitive.

### Data, backup, and recovery

- Stabilized the application data contract on schema v16.
- Added a 30-day recycle bin with bulk restore and expired-record cleanup.
- Kept backup transport metadata outside application state.
- Added path-aware audits for factories, migrations, backups, recovery, snapshots, and merge workflows.
- Expanded typed test fixtures to reduce schema-change breakage.

### Multi-tab and runtime stability

- Added live-timer ownership, device details, and explicit takeover flows.
- Recorded external saves, draft conflicts, and a compact sync event history.
- Hardened temporary Chrome and Edge profile cleanup against transient Windows `EBUSY` locks.

### Release quality

- The release gate builds the real Next.js static export.
- A real browser smoke test covers initial load, onboarding, the Today route, and calendar navigation.
- Dependency preflight, readable schema auditing, and a version-aware release audit are part of the quality pipeline.
- The last phase-98 evidence completed **305 tests** before this release candidate was prepared.

### Repository and documentation

- Added Persian and English guidance for agents and contributors.
- Added pull request and issue templates with schema, migration, and data-safety checks.
- Added an English README, Windows/npm troubleshooting guides, and a browser compatibility matrix.
- Added a machine-readable release manifest to keep package version, schema, release notes, and release gates aligned.

## Compatibility

```text
Package version: 2.1.0
AppData schema: 16
New phase-99 migration: none
Backup format: unchanged from the end of phase 98
IndexedDB structure: unchanged from the end of phase 98
Node.js: 22.x
```

Older backups continue through the versioned migration path. Backups created by a newer unsupported schema are rejected.

## Final verification before tagging

```bash
npm ci
npm run check:release
git diff --check
git status
```

After the automated gate and the manual items in `RELEASE_CHECKLIST_FA.md` are complete:

```bash
git tag -a v2.1.0 -m "Saatyar 2.1.0"
git push origin v2.1.0
```

## Follow-up work

The following non-blocking work remains on the roadmap:

- Current real-product screenshots for the READMEs.
- A short onboarding, workday, and reporting demo.
- Gradual replacement of brittle source-based assertions with behavioral tests.
