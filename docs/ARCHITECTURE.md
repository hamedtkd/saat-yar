# Saatyar architecture

Saatyar is a local-first application. Product data is owned by the browser and the domain layer must remain usable without a backend.

## Layer boundaries

- `app/`: Next.js routes and layouts.
- `components/`: presentation and interaction components.
- `hooks/`: orchestration between UI state, persistence, and domain functions.
- `lib/data/`: data normalisation, schema versions, snapshots, and migrations.
- `lib/`: pure domain services such as time, payroll, holidays, backup validation, and exports.
- `tests/`: Node-based domain and migration tests.

## Data flow

1. `AppDataStorageAdapter` reads the IndexedDB value.
2. `migrateAppData` unwraps legacy/raw/snapshot formats and migrates them to the current schema.
3. `normaliseData` applies safe defaults and canonical values.
4. The React controller receives only current `AppData`.
5. Saves are written as versioned snapshots rather than unversioned raw objects.

UI components must not perform payroll, holiday, or migration calculations directly. Those rules belong in `lib/`.
