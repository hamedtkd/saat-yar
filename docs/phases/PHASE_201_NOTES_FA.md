# Phase 201 — Release Candidate 2.6.0

Baseline: `15f5af8` (`chore: finalize phase 200 release hardening`)

- Package قبل از فاز: `2.5.0`
- Package Candidate: `2.6.0`
- Released 2.5.0 AppData Schema: `v20`
- Candidate AppData Schema: `v21`
- Baseline tests: `958/958`

## هدف

بسته‌بندی تغییرات پس از ۲.۵.۰، یعنی Phase 195 تا Phase 200، به‌عنوان Release Candidate قابل Audit برای ۲.۶.۰ بدون اضافه‌کردن Feature جدید یا ادعای Production Release.

## چرا Minor Release

این چرخه فقط patch نیست: Freelancer Work Session و routeهای Today مستقل، Employee Activity Context، Work Project مستقل، ویرایش مستقیم Attendance، Date/Time Picker جدید، PWA identity دوزبانه، Work Calendar naming، public trust/OAuth surfaces، GA4 runtime و Release Hardening تغییرهای قابل مشاهده محصول هستند. بنابراین bump از ۲.۵.۰ به **۲.۶.۰** درست است.

## قرارداد Candidate

- `package.json` و root version در `package-lock.json` روی `2.6.0` قرار می‌گیرند.
- Dependency graph تغییر نمی‌کند؛ lockfile فقط root version bump دارد.
- Manifest جدید `docs/releases/2.6.0.json` وضعیت `release-candidate` و Schema v21 دارد.
- Baseline معتبر Phase 200 برابر `15f5af8` با `958/958` است.
- `releaseDate` برابر `null` است.
- `candidateCommit` قبل از ساخت commit محلی Candidate برابر `null` می‌ماند و self-reference ایجاد نمی‌شود.
- Merge به `main`، Production Audit و Tag `v2.6.0` کاملاً متعلق به Phase 202 هستند.
- Manifest و Release Notes نسخه ۲.۵.۰ و قدیمی‌تر تاریخی و immutable باقی می‌مانند.

## Migration boundary

Release پایدار ۲.۵.۰ روی Schema v20 است و Candidate ۲.۶.۰ روی v21:

`v20 → v21`

v21 فقط قرارداد Employee Activity Context را گسترش می‌دهد: Work Item اختیاری، Work Project مستقل و `workProjectId?`. Migration و Backup/Device Transfer در Phase 200 با مسیر کامل v17→v21 نیز behavioral test شده‌اند.

## Gate

```powershell
npm install
npm run release:prepare:2.6.0
npm run check:release:full
git diff --check
git diff -- package-lock.json
git status
```

Phase 201 شش Contract Test Candidate اضافه می‌کند؛ هدف Node Test **964/964** است.

## Exit

پس از Full Gate و Visual sanity سبز، Candidate روی `dev` با پیام پیشنهادی زیر commit و push می‌شود:

```text
release: prepare 2.6.0 candidate
```

Hash Candidate commit به Phase 202 داده می‌شود؛ هیچ merge/tag در Phase 201 انجام نمی‌شود.
