# Phase 123 - Production onboarding browser smoke hardening

Phase 122 restored the source/test navigation contracts, but the Windows production browser smoke could still time out while waiting for the first onboarding step even though 438/438 unit and architecture tests, TypeScript, ESLint, the build, and the release audit were green.

## Changes

- The browser target now starts on `about:blank` instead of navigating to the application before CDP setup is complete.
- `Storage.clearDataForOrigin` clears IndexedDB, local storage, cache storage, and service-worker state before the first application boot.
- The first navigation is explicit through `Page.navigate` and waits for the real `Page.loadEventFired` event.
- Onboarding exposes `data-onboarding-step-index` as a stable structural test contract.
- The production smoke follows onboarding steps 2, 3, and 4 through structural markers instead of translated heading text.
- Smoke timeouts now include URL, document state, onboarding step, loading state, and a compact body snapshot.
- Runtime exception reporting keeps the browser exception description when available.

## Data and release

- AppData schema: unchanged at v17.
- Package version: unchanged at 2.2.0.
- New dependencies: none.
- Migration: none.
