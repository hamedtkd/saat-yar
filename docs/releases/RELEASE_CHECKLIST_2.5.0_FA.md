# چک‌لیست Release Candidate ساعت‌یار 2.5.0

Baseline: `0c4c22e` — Phase 192 — `870/870`

## مرز Candidate

- [ ] فقط روی `dev` آماده شود.
- [ ] `package.json` و `package-lock.json` روی `2.5.0` باشند.
- [ ] Manifest `docs/releases/2.5.0.json` روی `release-candidate` و Schema v20 باشد.
- [ ] Manifest تاریخی `2.4.0` روی `released` / Schema v17 دست‌نخورده بماند.
- [ ] `releaseDate` در Candidate برابر `null` باشد.
- [ ] هیچ `releaseCommit` در Candidate ثبت نشود.
- [ ] Merge به `main` و Tag `v2.5.0` در Phase 193 انجام نشود.

## Migration audit

- [ ] Migration v17 → v18 برای Flexible Work و Activity Segments پوشش داشته باشد.
- [ ] Migration v18 → v19 برای Notification Intelligence پوشش داشته باشد.
- [ ] Migration v19 → v20 برای Payroll Rate Basis پوشش داشته باشد.
- [ ] Backup/Restore/Merge/Schema audit روی v20 سبز باشد.
- [ ] Google Calendar cache بیرون AppData باقی بماند.

## Gate

```powershell
npm install
npm run release:prepare:2.5.0
npm run check:quality
npm run check:release:audit
npm run test:browser:production:built
npm run test:browser:freelancer:built
npm run test:browser:employee:built
npm run test:browser:pairing
npm run audit:vercel
git diff --check
git diff -- package-lock.json
```

نکته: در Phase 193 تغییر `package-lock.json` فقط برای bump نسخه ریشه از 2.4.0 به 2.5.0 مجاز است؛ Dependency graph نباید تغییر کند.

## هدف Candidate

- Node tests: **874/874**
- Production/Freelancer/Employee browser smoke: PASS
- Pairing browser smoke: PASS
- Vercel audit: PASS
- Production domain audit: بعد از Merge/Deploy نهایی، نه در Candidate محلی
