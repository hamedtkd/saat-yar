# فاز ۳۹ — تثبیت پاک‌سازی فایل‌های Legacy

## مشکل

تست `visual-consistency-cleanup` انتظار دارد فایل قدیمی `lib/tw.ts` وجود نداشته باشد. هنگام استخراج ZIP روی پوشه موجود، فایل‌های حذف‌شده نسخه جدید ممکن است در پوشه مقصد باقی بمانند. اسکریپت پاک‌سازی فقط دو entrypoint قدیمی را حذف می‌کرد و `lib/tw.ts` را پوشش نمی‌داد.

## اصلاح

مسیر `lib/tw.ts` به `scripts/remove-obsolete-entrypoints.mjs` اضافه شد. چون `npm run check` پیش از Import، TypeScript، lint و test این اسکریپت را اجرا می‌کند، فایل legacy باقی‌مانده نیز خودکار حذف می‌شود.

## اثر

- رفع تست `obsolete legacy Tailwind style registry stays removed`
- جلوگیری از بازگشت تصادفی توکن‌ها و رنگ‌های قدیمی
- بدون تغییر مدل داده یا رفتار برنامه
- Schema همچنان نسخه ۱۳ است
