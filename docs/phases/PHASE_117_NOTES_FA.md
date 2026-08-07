# فاز ۱۱۷ — Sync Lint & History Hardening

## هدف

بستن خطاهای ESLint باقی‌مانده از QR محلی و افزودن بازخورد عملیاتی بهتر به تجربه انتقال دستگاه، بدون تغییر Schema یا محتوای AppData.

## تغییرات

- استثنای ESLint فقط برای فایل‌های CommonJS vendored QR و فقط برای `no-require-imports`.
- حذف `any` از declaration فایل‌های vendor و افزودن type adapter در `local-qr.ts`.
- نگه‌داشتن reference پایدار عنصر video در cleanup اسکنر QR.
- نمایش وضعیت جاری نشست Pairing در کارت انتقال.
- نگه‌داری حداکثر پنج رخداد آخر انتقال در LocalStorage به‌صورت metadata-only.
- ثبت ACK ارسال و نتیجه اعمال Merge/Replace، بدون ذخیره Payload، Session Key یا محتوای AppData.
- امکان پاک‌کردن تاریخچه از UI.

## قرارداد داده

Schema برنامه همچنان v17 است. تاریخچه انتقال بخشی از AppData/Backup نیست و فقط metadata محلی UX است.

## تست

`tests/phase117-sync-lint-history.test.ts` قرارداد Lint، cleanup دوربین، bounded history و اتصال UI به history را پوشش می‌دهد.
