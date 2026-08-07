# فاز ۱۱۹ — آماده‌سازی Release Candidate 2.2.0

## هدف

تبدیل وضعیت توسعه بعد از ۲.۱.۰ به یک Release Candidate قابل Audit برای نسخه ۲.۲.۰، بدون ادعای انتشار نهایی پیش از اجرای Gate روی سیستم اصلی و ثبت SHA نهایی.

## نسخه و Manifest

- نسخه `package.json` و `package-lock.json` به `2.2.0` افزایش یافت.
- `docs/releases/2.2.0.json` به‌عنوان Manifest فعال با Schema v17 ساخته شد.
- وضعیت Manifest فعلاً `release-candidate` است و `releaseCommit` عمداً `null` باقی می‌ماند.
- Manifest تاریخی `2.1.0` با Schema v16 و Commit انتشار قبلی دست‌نخورده باقی می‌ماند.
- Release Audit اکنون Candidate و Released را از هم تفکیک می‌کند و برای Candidate اجازه ادعای Commit نهایی نمی‌دهد.

## مستندات و رسانه

- Release Notes فارسی و انگلیسی ۲.۲.۰ اضافه شدند.
- Changelog قابلیت‌های Payroll، PWA، Design Freeze و Device Sync را زیر نسخه ۲.۲.۰ ثبت می‌کند.
- چک‌لیست Release برای Migration v16→v17، Payroll Policy، QR/WebRTC، Offline PWA و رسانه بازنویسی شد.
- Screenshotهای Today روشن/تاریک، Reports روشن/تاریک، Mobile و GIF آنبوردینگ به README فارسی و انگلیسی متصل شدند.
- رسانه‌ها همچنان از Fixture نمایشی و دستور `npm run media:capture` تولید می‌شوند و داده واقعی کاربر را نمی‌خوانند.

## Quality

آخرین شواهد تأییدشده پیش از این فاز ۴۱۷ تست پاس، Build کامل، Offline PWA Smoke و Browser Pairing واقعی با انتقال ۴ chunk رمزنگاری‌شده و ACK است. این فاز شش تست Release Contract اضافه می‌کند؛ انتظار Gate Candidate برابر ۴۲۳ تست است.

`npm run test:browser:pairing` عمداً مکمل `check:release` باقی می‌ماند تا محدودیت ICE در بعضی CIها باعث False Negative در Gate اصلی نشود، اما برای نهایی‌سازی Release باید روی سیستم Release اجرا و ثبت شود.

## داده

- AppData Schema همان v17 است.
- Migration جدیدی اضافه نشده است.
- Backup format جدیدی اضافه نشده است.
- Dependency جدیدی اضافه نشده است.

## مرحله بعد

پس از سبزشدن Gate Candidate روی Commit فاز ۱۱۹، فاز ۱۲۰ فقط Release را نهایی می‌کند: ثبت SHA دقیق Commit، تغییر Manifest به `released`، اجرای Gate روی همان Commit و ساخت Tag annotated `v2.2.0`.
