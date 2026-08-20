# Data migrations

The current data schema version is exported from `lib/data/version.ts`.

## Rules

- Never change persisted data shape without adding a migration.
- Add migrations one version at a time in `lib/data/migrations.ts`.
- Migrations must be deterministic and must not access browser APIs.
- Old raw IndexedDB values and old Local Storage values remain supported.
- A backup from a newer unknown schema is rejected instead of being partially imported.
- Every migration needs a regression test in `tests/data-migrations.test.ts`.

## Adding version 5

1. Increase `APP_DATA_SCHEMA_VERSION` to `5`.
2. Add `migrateV4ToV5`.
3. Register it under key `4` in the migration map.
4. Update Zod schemas for the canonical version.
5. Add tests for old, current, malformed, and future versions.
6. Update the changelog.

## Version 21 — Employee activity context

- `ActivitySegment.title?` stores an optional free-text work item title.
- `workProjects` stores lightweight Employee/Hybrid work projects separately from Freelancer client projects.
- `ActivitySegment.workProjectId?` references `workProjects`. Existing `projectId?` remains a Freelancer project reference and is surfaced only by Hybrid activity context.
- v20 → v21 creates `workProjects: []` and preserves historical segments without inventing titles or project relations.
- Normalization also accepts the earlier Phase 199 R1 transitional v21 shape where `workProjects` was absent, defaulting it safely to an empty collection.
