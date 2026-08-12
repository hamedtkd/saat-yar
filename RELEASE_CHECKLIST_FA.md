# چک‌لیست Final Release ساعت‌یار 2.4.0

این فایل کنترل فاز ۱۸۰ است. Candidate فاز ۱۷۹ بسته شده، Merge اولیه کنترل‌شده به `main` انجام شده و Finalization باید روی همان baseline مشترک `dev/main` اجرا شود. Tag فقط بعد از Deploy نهایی و `audit:production` سبز ساخته می‌شود.

## وضعیت Finalization

```text
Package: 2.4.0
Schema: v17
Manifest status: released
Verified Phase 178 baseline: 887158c
Verified baseline tests: 758
Verified Phase 179 candidate: 1cabdb4
Verified candidate tests: 764
Verified initial main merge: 7627e99
Expected Phase 180 final tests: 770
Tag: v2.4.0 (must not exist before final production audit)
Migration: none
New dependency since 2.3.2: framer-motion@^12.42.2
Production audit: required after final main deploy and before tag
```

## Baseline فاز ۱۸۰

قبل از Gate مطمئن شو روی `dev` هستی و `HEAD` همان Merge مشترک اولیه `7627e99` است. سپس:

```powershell
npm install
npm run release:prepare:2.4.0
```

این دستور فقط baseline شروع Finalization را تأیید می‌کند و هیچ Tag یا Releaseای نمی‌سازد.

## Gate فاز ۱۸۰

```powershell
npm run check:release
npm run test:browser:pairing
npm run audit:vercel
git diff --check
git status
```

انتظار:

- [ ] `770/770` تست و صفر Failure.
- [ ] TypeScript و ESLint سبز.
- [ ] Build استاتیک ۲۲ Route سبز.
- [ ] Production Browser Smoke سبز.
- [ ] Freelancer Browser Smoke سبز.
- [ ] Employee Browser Smoke سبز.
- [ ] Pairing چهار chunk رمزنگاری‌شده + ACK سبز.
- [ ] `audit:vercel` سبز و Published output برابر `out/`.
- [ ] `git diff --check` بدون خروجی.
- [ ] `git status` فقط تغییرات Phase 180 را نشان دهد.

## Commit فاز ۱۸۰ روی dev

فقط بعد از Gate کامل سبز:

```powershell
git add -A
git commit -m "release: finalize Saatyar 2.4.0"
git push origin dev
```

## Merge نهایی dev به main

پس از Push و در حالی که هر دو branch تمیز هستند، PR یا Merge کنترل‌شده `dev -> main` را انجام بده. سپس روی `main`:

```powershell
git switch main
git pull --ff-only origin main
git status
git log -1 --oneline
```

Vercel باید همان Commit نهایی `main` را Deploy کند.

## Audit Production و Tag

بعد از Ready شدن Deployment نهایی:

```powershell
npm run audit:production
```

فقط اگر Audit سبز بود، `HEAD` با `origin/main` یکی بود و Working Tree تمیز بود:

```powershell
git tag -a v2.4.0 -m "Saatyar 2.4.0"
git push origin v2.4.0
```

Tag annotated `v2.4.0` منبع حقیقت Commit نهایی Release است؛ Manifest عمداً SHA نهایی خودِ Commit را داخل خودش ذخیره نمی‌کند تا self-reference ایجاد نشود.

## Recovery ثبت‌شده

در تلاش اولیه، Tag `v2.4.0` پیش از Finalization کامل روی Commit نادرست ساخته شده بود. Tag اشتباه حذف شد، سپس `dev` و `main` هر دو روی Merge `7627e99` همگام شدند. فاز ۱۸۰ از همین baseline تمیز ادامه پیدا می‌کند.
