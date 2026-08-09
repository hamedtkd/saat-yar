# چک‌لیست انتشار ساعت‌یار 2.3.2

این فایل کنترل انسانی Patch Release نسخه ۲.۳.۲ است. Baseline فاز ۱۶۴ با ۶۳۳/۶۳۳ تست، Build کامل، Browser Smokeهای Production/Freelancer/Employee، Pairing چهار chunk رمزنگاری‌شده، Audit قرارداد Vercel و Audit پس از Deploy روی Production سبز شده است.

## وضعیت نسخه

```text
Package: 2.3.2
Schema: v17
Manifest status: released
Verified baseline: e3c0a03
Verified baseline tests: 633
Expected final tests: 639
Tag: v2.3.2
Migration: none
New dependency: none
```

## آماده‌سازی Baseline

بلافاصله پس از Replace و قبل از اجرای Gate:

```powershell
npm run release:prepare:2.3.2
```

این دستور باید روی `HEAD` همان Commit فاز ۱۶۴ اجرا شود که Vercel آن Ready شده و `npm run audit:production` روی آن پاس شده است.

## Gate محلی پیش از Commit

- [ ] `npm run check:release` با `639/639` تست و بدون Failure تمام شود.
- [ ] Production Browser Smoke پاس شود.
- [ ] Freelancer Browser Smoke پاس شود.
- [ ] Employee Browser Smoke پاس شود.
- [ ] `npm run test:browser:pairing` انتقال ۴ chunk رمزنگاری‌شده + ACK را پاس کند.
- [ ] `npm run audit:vercel` پاس شود و `out/` خروجی منتشرشونده باشد.
- [ ] `git diff --check` بدون خروجی باشد.
- [ ] `git status` فقط تغییرات مورد انتظار فاز ۱۶۵ را نشان دهد.

## قرارداد Release

- [x] Package و Lockfile روی 2.3.2 هستند.
- [x] AppData Schema روی v17 باقی مانده است.
- [x] Migration و Dependency جدید نداریم.
- [x] Manifest 2.3.2 وضعیت `released` و Tag `v2.3.2` دارد.
- [x] Baseline فاز ۱۶۴ با 633 تست و شواهد Browser/Pairing/Vercel/Production ثبت شده است.
- [x] Manifestهای تاریخی 2.3.1 و قدیمی‌تر تغییر نمی‌کنند.
- [x] Manifest 2.3.2 فیلد `releaseCommit` ندارد.
- [x] Release Notes فارسی/انگلیسی، Changelog، READMEها، Docs index و Roadmap به 2.3.2 اشاره می‌کنند.

## Commit و Push

```powershell
git add .
git commit -m "release: finalize Saatyar 2.3.2"
git push
```

سپس صبر کن Deployment همین Commit در Vercel **Ready** شود.

## Audit پس از Deploy

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

git tag -a v2.3.2 -m "Saatyar 2.3.2"
git push origin v2.3.2
```

`HEAD` و `origin/main` باید یک Commit باشند. Tag annotated `v2.3.2` منبع حقیقت Commit نهایی انتشار است.
