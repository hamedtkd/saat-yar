# Phase 194 — Finalization / Release 2.5.0

Baseline Candidate: `d81e094` (`release: prepare 2.5.0 candidate`)

- Candidate tests: `874/874`
- Final test target: `880/880`
- AppData schema: `v20`
- Historical released 2.4.0 schema: `v17`

## هدف

تبدیل Candidate سبز 2.5.0 به Final Release source بدون تغییر Product behavior یا dependency graph.

## قرارداد Finalization

1. Finalization فقط از Candidate `d81e094` روی branch `dev` آماده می‌شود.
2. Full quality/release/browser/pairing/Vercel gates باید سبز باشند.
3. Finalization commit روی `dev` ساخته و push می‌شود.
4. همان commit به‌شکل کنترل‌شده به `main` منتقل می‌شود.
5. پس از Deploy روی production، `npm run audit:production` باید PASS شود.
6. فقط بعد از Production Audit، tag annotated زیر روی همان commit ساخته می‌شود:

```bash
git tag -a v2.5.0 -m "Saatyar 2.5.0"
git push origin v2.5.0
```

هیچ tag قبل از Production Audit مجاز نیست.

## شواهد Candidate

- Phase 192 baseline: `0c4c22e` — `870/870`
- Phase 193 candidate: `d81e094` — `874/874`
- Migration: `v17 → v18 → v19 → v20`
- Production/Freelancer/Employee browser smoke: PASS روی Candidate
- WebRTC pairing smoke: PASS روی Candidate
- Vercel static export audit: PASS روی Candidate

Phase 194 شش Contract Test نهایی اضافه می‌کند و هدف Node Test را به **880/880** می‌رساند.
