# چک‌لیست Release Candidate ساعت‌یار 2.6.0

Baseline قابل قبول Phase 201:

```text
branch: dev
commit: 15f5af8
Phase 200 gate: 958/958
AppData: v21
released 2.5.0 AppData: v20
```

## 1. قبل از Gate

```powershell
git status
git log -1 --oneline
npm install
npm run release:prepare:2.6.0
```

`release:prepare:2.6.0` باید HEAD=`15f5af8` و branch=`dev` را تأیید کند. Working tree در این نقطه عمداً تغییرات Candidate را دارد.

## 2. Candidate Gate

```powershell
npm run check:release:full

git diff --check
git diff -- package-lock.json
git status
```

تغییر lockfile مجاز در Phase 201 فقط bump نسخه root از 2.5.0 به 2.6.0 است؛ dependency graph نباید تغییر کند.

هدف Node Test پس از شش Contract Test فاز ۲۰۱:

```text
964 / 964
```

## 3. Visual sanity

Feature جدیدی وجود ندارد؛ فقط regression sanity روی baseline تثبیت‌شده:

- Employee / Freelancer / Hybrid Today
- Work Calendar
- Persian RTL / English LTR
- 320 / 360 / 375 / 425 / Desktop
- Light / Dark و accent بنفش
- PWA install identity و offline reload

## 4. Candidate commit

فقط بعد از Gate و Visual sanity سبز:

```powershell
git add .
git diff --cached --check
git commit -m "release: prepare 2.6.0 candidate"
git push origin dev
git log -1 --oneline
git status
```

Hash این commit ورودی Phase 202 خواهد بود. در Phase 201 `main`، Production و Tag دست نمی‌خورند.
