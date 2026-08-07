# فاز ۱۵۲ — Release Candidate 2.3.0

## هدف

تبدیل خط توسعه پس از ۲.۲.۰ به Candidate قابل Audit برای نسخه ۲.۳.۰، بدون ادعای انتشار نهایی یا Tag قبل از اجرای Gate روی سیستم اصلی.

## خط مبنا

آخرین سورس تأییدشده پیش از این فاز روی commit prefix `ff0177f` این شواهد را دارد:

```text
569 / 569 tests passed
TypeScript passed
ESLint passed
Next.js production build passed
Static export 20/20
Production browser smoke passed
Freelancer browser UX smoke passed
Employee browser UX smoke passed
```

Employee Journey در همین baseline سناریوی `08:00–17:00`، ناهار ۳۰ دقیقه، وقفه ۱۵ دقیقه بدون حقوق، نتیجه `8:15`، Month، Reports، IndexedDB، Hard Reload و Mobile را کامل کرده است.

## Version و Manifest

- `package.json` و `package-lock.json` از `2.2.0` به `2.3.0` افزایش یافتند.
- `docs/releases/2.3.0.json` Manifest فعال جدید است.
- وضعیت Candidate برابر `release-candidate` و `releaseCommit` برابر `null` است.
- Schema همان v17 و Node همان 22.x است.
- Manifest تاریخی ۲.۲.۰ و ۲.۱.۰ تغییر نمی‌کنند.
- سه Browser Gate اصلی Production، Freelancer و Employee به‌صورت صریح در Manifest ثبت شدند.

## Release Audit

Audit فعال اکنون روی Manifest ۲.۳.۰ اجرا می‌شود و موارد زیر را کنترل می‌کند:

- هماهنگی Package/Lockfile/Manifest/Schema/Node.
- وضعیت Candidate و عدم ادعای Commit نهایی.
- baseline تأییدشده `ff0177f` با ۵۶۹ تست و سه Browser Smoke سبز.
- وجود Release Notes فارسی/انگلیسی، Changelog، Checklist و رسانه‌های README.
- ترتیب کامل `check:release`: Quality → Audit → Production → Freelancer → Employee.
- حضور تمام فایل‌های `*.test.ts` داخل `npm test`.
- بسته‌بودن فاز ۱۵۲ و بازماندن فاز ۱۵۳ تا زمان نهایی‌سازی.

## Quality

فاز ۱۵۲ شش تست Release Contract اضافه می‌کند؛ بنابراین Candidate روی سیستم Release باید به این نتیجه برسد:

```text
575 tests
575 pass
0 fail
```

`npm run test:browser:pairing` همچنان Gate مکمل Release است و جدا از `check:release` اجرا می‌شود تا محدودیت‌های محیطی WebRTC/ICE باعث false negative در Pipeline اصلی نشوند.

## داده

- AppData Schema: v17
- Migration جدید: ندارد
- Backup format جدید: ندارد
- تغییر داده‌ای Product در این فاز: ندارد

## مرحله بعد

پس از سبزشدن Candidate و Commit/Push فاز ۱۵۲، SHA همان Candidate و نتیجه Pairing Gate ثبت می‌شود. فاز ۱۵۳ فقط Finalization نسخه ۲.۳.۰، Manifest `released`، Gate نهایی و Tag annotated `v2.3.0` را انجام می‌دهد.
