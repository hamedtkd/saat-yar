# فاز ۲۲ — پاک‌سازی کد مرده و Quality Gate سراسری

این فاز دو پیاده‌سازی قدیمی و بدون مصرف را حذف می‌کند:

- `app/date-time-pickers.tsx`
- `app/storage.ts`

انتخابگرهای تاریخ و زمان واقعی پروژه در `components/pickers` نگهداری می‌شوند و ذخیره‌سازی فعال نیز در `lib/storage.ts` و Hookهای persistence قرار دارد. نگه‌داشتن نسخه‌های موازی باعث سردرگمی، drift و اصلاح فایل اشتباه می‌شد.

## کنترل‌های جدید

- تمام فایل‌های `app`، `components` و `hooks` حداکثر ۲۵۰ خط هستند.
- بازگشت فایل‌های legacy با تست معماری متوقف می‌شود.
- ESLint با `--max-warnings=0` اجرا می‌شود؛ Warning دیگر خروجی قابل قبول نیست.
- دستور `npm run check:quality` کل check و Build ورسل را پشت سر هم اجرا می‌کند.

## قرارداد توسعه

قبل از Commit اجرا شود:

```bash
npm run check:quality
```

هر Warning، import جاافتاده، خطای TypeScript، تست ناموفق یا Build ناموفق باید قبل از Push رفع شود.
