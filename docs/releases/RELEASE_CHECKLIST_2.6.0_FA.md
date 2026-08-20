# چک‌لیست Final Release ساعت‌یار 2.6.0

## Baseline تأییدشده

```text
branch: dev
Phase 200 baseline: 15f5af8 — 958/958
Phase 201 candidate: 3e5bcbf — 964/964 + full release gate
package: 2.6.0
AppData: v21
released 2.5.0 AppData: v20
```

Phase 202 فقط Release است؛ Feature، dependency و schema جدید مجاز نیست.

## 1. Final source gate روی dev

بعد از جایگزینی سورس Phase 202 و در حالی که HEAD هنوز `3e5bcbf` است:

```powershell
Set-Location "D:\my-workspace\saat-yar"

npm ci
npm run check:release:final:2.6.0

git diff --check
git diff -- package-lock.json
git status
```

انتظار:

```text
970 / 970 tests
package-lock.json: no diff from Phase 201 candidate
AppData: v21
```

`check:release:final:2.6.0` ابتدا branch=`dev` و HEAD=`3e5bcbf` را تأیید می‌کند و سپس Full Release Gate را اجرا می‌کند.

## 2. Finalization commit روی dev

فقط بعد از Gate سبز:

```powershell
git add .
git diff --cached --check
git status

git commit -m "release: finalize 2.6.0"
git push origin dev

git status
git log -1 --oneline
```

Hash این commit را نگه دار؛ همین commit باید به `main` برسد و در Production audit شود.

## 3. Merge کنترل‌شده به main

```powershell
git checkout main
git pull --ff-only origin main
git merge --no-ff dev
git push origin main

git status
git log -1 --oneline
```

اگر سیاست repository شما fast-forward است، به‌جای `--no-ff` همان روش ثابت repository را استفاده کن؛ نکته مهم این است که محتوای Finalization بدون تغییر به `main` برسد.

## 4. Production deploy و Audit

صبر کن Vercel همان `main` commit را Production کند. سپس:

```powershell
npm run audit:production
```

Audit باید routeها، PWA identity دوزبانه، Service Worker/Precache، install iconها، sitemap/robots، security headerها و revalidation Manifest/SW را سبز کند.

## 5. Tag فقط بعد از Production Audit

روی `main` و همان commit audit‌شده:

```powershell
git status
git rev-parse --short=7 HEAD

git tag -a v2.6.0 -m "Saatyar 2.6.0"
git push origin v2.6.0

git show --no-patch --decorate v2.6.0
git status
```

Tag قبل از Production Audit ممنوع است.
