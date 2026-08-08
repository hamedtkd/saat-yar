# Saatyar 2.3.1 — Release Notes

Saatyar **2.3.1** is a patch release on top of 2.3.0. It does not introduce a large new product area; it packages four post-2.3.0 fixes: real production auditing, correct precache parsing, an explicit Vercel static-export deployment contract, and Today-page awareness of scheduled days off.

The verified release baseline is commit prefix `7c675e1`. That source passed **601/601 tests**, the full Next.js build, production/freelancer/employee browser smokes, direct WebRTC pairing, the Vercel deployment-contract audit, and the post-deploy audit against the real production origin. Phase 159 adds six release-contract tests, so the final source gate is expected to reach **607/607**.

## Highlights since 2.3.0

### Production and PWA

- `npm run audit:production` verifies public routes, the Persian RTL app shell, PWA manifest, service worker, generated precache, install icons, robots, and sitemap on `https://saat-yar.vercel.app/`.
- The precache parser now follows the emitted `self.__SAATYAR_PRECACHE` format and accepts relative `_next/static/...` build paths, removing the earlier false negative.
- The audit also verifies reachability of a generated build asset.
- Vercel deployment is explicit: Framework Preset `Other`, `npm run build:vercel`, and publication from `out/`.
- The verified production precache contains **37 build assets**.

### Scheduled days off

- A disabled `weeklySchedule` day is now shown explicitly as **scheduled day off** on Today.
- Required work time is zero and the UI explains why the target is zero instead of presenting a generic no-target day.
- Exceptional work can still be recorded, but through a distinct exceptional-work action.
- The Jalali calendar marks scheduled days off separately.
- Scheduled days off intentionally remain separate from official holidays, weekly holidays, and holiday-pay semantics.

## Data compatibility

- AppData remains on **schema v17**.
- There is no new migration.
- There is no new dependency.
- Existing v17 backups and historical migrations remain unchanged.
- Historical manifests and tags for `v2.3.0`, `v2.2.0`, and `v2.1.0` stay immutable.

## Final 2.3.1 gate

Before the final commit:

```bash
npm run check:release
npm run test:browser:pairing
npm run audit:vercel
git diff --check
git status
```

Expected test result:

```text
tests 607
pass 607
fail 0
```

After committing and pushing Phase 159, wait for the new Vercel deployment to become Ready and run:

```bash
npm run audit:production
```

If the production audit is green, create the annotated release tag on that same final commit:

```bash
git tag -a v2.3.1 -m "Saatyar 2.3.1"
git push origin v2.3.1
```

The manifest intentionally has no `releaseCommit` field. The annotated `v2.3.1` Git tag is the source of truth for the final release commit.
