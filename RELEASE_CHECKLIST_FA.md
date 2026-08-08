# چک‌لیست انتشار ساعت‌یار 2.3.1

این فایل کنترل انسانی Patch Release نسخه ۲.۳.۱ است. Baseline تأییدشده روی commit prefix `7c675e1` با ۶۰۱/۶۰۱ تست، Build کامل، Browser Smokeهای Production/Freelancer/Employee، Pairing چهار chunk رمزنگاری‌شده، Audit قرارداد Vercel و Audit پس از Deploy روی Production سبز شده است. فاز ۱۵۹ فقط Finalization نسخه، مستندات و قرارداد Release را انجام می‌دهد.

## وضعیت نسخه

```text
Package: 2.3.1
Schema: v17
Manifest status: released
Verified baseline: 7c675e1
Verified baseline tests: 601
Expected final tests: 607
Tag: v2.3.1
Migration: none
New dependency: none
```

## Gate محلی پیش از Commit

- [ ] `npm run check:release` با `607/607` تست و بدون Failure تمام شود.
- [ ] Production Browser Smoke پاس شود.
- [ ] Freelancer Browser Smoke پاس شود.
- [ ] Employee Browser Smoke پاس شود.
- [ ] `npm run test:browser:pairing` انتقال ۴ chunk رمزنگاری‌شده + ACK را پاس کند.
- [ ] `npm run audit:vercel` پاس شود و `out/` خروجی منتشرشونده باشد.
- [ ] `git diff --check` بدون خروجی باشد.
- [ ] `git status` فقط تغییرات مورد انتظار فاز ۱۵۹ را نشان دهد.

## قرارداد Release

- [x] `package.json` و `package-lock.json` روی 2.3.1 هستند.
- [x] AppData Schema روی v17 باقی مانده و Migration جدیدی لازم نیست.
- [x] Dependency جدیدی اضافه نشده است.
- [x] `docs/releases/2.3.1.json` وضعیت `released` دارد.
- [x] Baseline تأییدشده `7c675e1` و Gate `601` تست در Manifest ثبت شده‌اند.
- [x] شواهد Production/Freelancer/Employee/Pairing/Vercel/Production Audit در Manifest ثبت شده‌اند.
- [x] Manifest تاریخی `docs/releases/2.3.0.json` و Tag تاریخی `v2.3.0` تغییر نمی‌کنند.
- [x] Manifest ۲.۳.۱ فیلد `releaseCommit` ندارد تا self-reference ایجاد نشود.
- [x] Release Notes فارسی و انگلیسی، Changelog، READMEها، Docs index و Roadmap نسخه ۲.۳.۱ را معرفی می‌کنند.

## Commit و Push

پس از سبز شدن Gate محلی:

```powershell
git add .
git commit -m "release: finalize Saatyar 2.3.1"
git push
```

سپس صبر کن Deployment همین Commit در Vercel **Ready** شود.

## Audit پس از Deploy

بعد از Ready شدن Deployment:

```powershell
npm run audit:production
```

- [ ] هر ۱۰ Route عمومی App Shell فارسی RTL را برگردانند.
- [ ] PWA Manifest و Service Worker سالم باشند.
- [ ] Precache شامل Build Asset واقعی باشد.
- [ ] آیکن‌ها، robots و sitemap سالم باشند.
- [ ] `Remote production audit passed.` دیده شود.

## Tag نهایی

فقط بعد از سبز شدن Audit Production و Clean بودن Working Tree:

```powershell
git status
git rev-parse HEAD
git rev-parse origin/main

git tag -a v2.3.1 -m "Saatyar 2.3.1"
git push origin v2.3.1
```

`HEAD` و `origin/main` باید یک Commit باشند. Tag annotated `v2.3.1` منبع حقیقت Commit نهایی انتشار است.
