# چک‌لیست Release Candidate ساعت‌یار 2.4.0

این فایل کنترل فاز ۱۷۹ است. Candidate روی `dev` آماده می‌شود و هنوز Release Production نیست.

## وضعیت Candidate

```text
Package: 2.4.0
Schema: v17
Manifest status: release-candidate
Verified Phase 178 baseline: 887158c
Verified baseline tests: 758
Expected candidate tests: 764
Expected final tests after Phase 180: 770
Tag reserved: v2.4.0
Migration: none
New dependency: framer-motion@^12.42.2
Main merge: pending
Production audit: pending
```

## تأیید Baseline

پس از Replace، چون Revision 6 یک Dependency جدید برای Flip Clock دارد، ابتدا Dependencyها را Sync کن و سپس Baseline را بررسی کن:

```powershell
npm install
npm run release:prepare:2.4.0
```

این دستور باید تأیید کند که `HEAD` هنوز همان Baseline فاز ۱۷۸ یعنی `887158c` است.

## Gate فاز ۱۷۹

```powershell
npm run check:release
npm run test:browser:pairing
npm run audit:vercel
git diff --check
git status
```

انتظار:

- [ ] `764/764` تست و صفر Failure.
- [ ] TypeScript و ESLint سبز.
- [ ] Build استاتیک ۲۲ Route سبز.
- [ ] Production Browser Smoke سبز.
- [ ] Freelancer Browser Smoke سبز.
- [ ] Employee Browser Smoke سبز.
- [ ] Pairing چهار chunk رمزنگاری‌شده + ACK سبز.
- [ ] `audit:vercel` سبز و Published output برابر `out/`.
- [ ] `git diff --check` بدون خروجی.
- [ ] `git status` فقط تغییرات Phase 179 را نشان دهد.

## Commit Candidate

فقط بعد از Gate کامل سبز:

```powershell
git add -A
git commit -m "release: prepare Saatyar 2.4.0 candidate"
git push origin dev
```

بعد از Push، SHA Candidate را نگه دار. این SHA ورودی فاز ۱۸۰ خواهد بود.

## کارهایی که در فاز ۱۷۹ انجام نمی‌شوند

- `dev` به `main` Merge نمی‌شود.
- `npm run audit:production` به‌عنوان Evidence نهایی ۲.۴.۰ ثبت نمی‌شود.
- Manifest به `released` تغییر نمی‌کند.
- Tag `v2.4.0` ساخته یا Push نمی‌شود.

این مراحل فقط در فاز ۱۸۰ و پس از Candidate سبز انجام می‌شوند.
