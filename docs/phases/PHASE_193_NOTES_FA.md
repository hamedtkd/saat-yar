# Phase 193 — Next Release Candidate 2.5.0

Baseline: `0c4c22e` (`test: harden behavioral contracts and test discovery`)

- Package قبل از فاز: `2.4.0`
- Package Candidate: `2.5.0`
- Released 2.4.0 AppData Schema: `v17`
- Development/Candidate AppData Schema: `v20`
- Baseline tests: `870/870`

## هدف

بسته‌بندی فازهای ۱۸۱ تا ۱۹۲ به‌عنوان Feature Release Candidate قابل Audit برای ۲.۵.۰، بدون ادعای Release Production یا Tag نهایی.

## چرا Minor Release

این چرخه فقط bugfix نیست: Flexible Work، Activity Segments، Notification Intelligence، Month Intelligence، Google Calendar Read/Write و Incremental Sync، Calendar Intelligence و Payroll/Reports hardening قابلیت‌های قابل مشاهده و workflowهای جدید هستند. بنابراین نسخه Candidate از ۲.۴.۰ به ۲.۵.۰ می‌رود.

## قرارداد Candidate

- `package.json` و root version در `package-lock.json` روی `2.5.0` قرار می‌گیرند.
- Manifest جدید `docs/releases/2.5.0.json` وضعیت `release-candidate` و Schema v20 دارد.
- Baseline معتبر فاز ۱۹۲ برابر `0c4c22e` با `870/870` است.
- `releaseDate` برابر `null` است و `releaseCommit` ذخیره نمی‌شود.
- Merge به `main`، Production Audit و Tag `v2.5.0` Pending می‌مانند.
- Manifest ۲.۴.۰ و Releaseهای قدیمی‌تر immutable باقی می‌مانند.
- Dependency graph تغییر نمی‌کند؛ تغییر lockfile فقط bump نسخه root است.

## Migration boundary

Release پایدار ۲.۴.۰ روی Schema v17 است و Candidate ۲.۵.۰ روی v20. بنابراین Release Audit باید زنجیره زیر را صریح نگه دارد:

`v17 → v18 → v19 → v20`

- v18: Flexible Daily Targets + Activity Segments
- v19: Notification Intelligence
- v20: Payroll Rate Basis + Standard Monthly Minutes

Analytics consent و Google Calendar cache/token خارج از AppData باقی می‌مانند.

## Gate

- `npm run release:prepare:2.5.0` baseline و branch `dev` را قفل می‌کند.
- `npm run check:quality`
- `npm run check:release:audit`
- Production/Freelancer/Employee browser smoke
- Pairing browser smoke
- Vercel static-export audit
- `git diff --check`

Phase 193 چهار Contract Test Candidate اضافه می‌کند و هدف Node Test را به **874/874** می‌رساند.
