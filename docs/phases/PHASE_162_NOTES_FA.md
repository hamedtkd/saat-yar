# فاز ۱۶۲ — قرارداد CI گیت‌هاب همسو با Vercel

## مسئله

مخزن روی هر Push به `main` علاوه بر Build، تلاش می‌کرد خروجی را با `actions/deploy-pages` روی GitHub Pages منتشر کند. اما Production واقعی ساعت‌یار روی Vercel است و GitHub Pages برای این مخزن فعال نشده بود؛ در نتیجه Build سبز می‌شد ولی Job مربوط به Deploy با پاسخ `404 Not Found` از Pages API شکست می‌خورد و کنار Commit یک ضربدر قرمز دیده می‌شد.

## تصمیم

GitHub Actions از این پس نقش CI را دارد، نه میزبان دوم Production:

- TypeScript، Lint و تست‌ها اجرا می‌شوند.
- همان Static Export مورد استفاده Vercel با `npm run build:vercel` ساخته می‌شود.
- قرارداد انتشار Vercel با `npm run audit:vercel` بررسی می‌شود.
- `actions/upload-pages-artifact` و `actions/deploy-pages` حذف شدند.
- مجوزهای `pages: write` و `id-token: write` حذف شدند و Workflow فقط `contents: read` دارد.
- Workflow روی Push و Pull Request شاخه `main` اجرا می‌شود.

نام فایل `deploy-pages.yml` عمداً برای اعمال مطمئن روی Working Tree موجود حفظ شده است؛ محتوای آن دیگر هیچ Deploy به GitHub Pages انجام نمی‌دهد.

## نتیجه

Vercel همچنان تنها مقصد Deploy برنامه است و خطای Pages دیگر نمی‌تواند وضعیت Commit را قرمز کند. تاریخچه Runهای قدیمی GitHub Actions پاک نمی‌شود، اما Runهای جدید باید فقط کیفیت و قرارداد Vercel را گزارش کنند.

## قرارداد داده

- Package: `2.3.1`
- Schema: `v17`
- Migration جدید: ندارد
- Dependency جدید: ندارد
- تغییر Runtime محصول: ندارد
