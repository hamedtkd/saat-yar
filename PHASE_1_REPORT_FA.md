# گزارش فاز ۱ — زیرساخت داده و Migration

## انجام‌شده

- نسخه مرکزی Schema داده با نسخه ۴
- Snapshot نسخه‌بندی‌شده برای IndexedDB
- Migration مرحله‌ای نسخه‌های ۱ تا ۴
- پشتیبانی از داده خام قدیمی، Backup envelope و Local Storage قدیمی
- ذخیره مجدد خودکار داده مهاجرت‌یافته با فرمت جدید
- رد امن Backupهایی که از نسخه برنامه جدیدترند
- جداسازی Data Normalisation از Format utilities
- تست Migration، Snapshot و نسخه ناسازگار آینده
- مستندات معماری و دستورالعمل تغییر Schema

## بررسی‌های اجراشده

- تست‌های مستقل Migration، موتور زمان و حقوق: ۱۳ تست موفق
- TypeScript محدود روی ماژول‌های جدید: موفق

## محدودیت محیط بررسی

`npm ci` به‌علت 404 رجیستری داخلی برای `zod-validation-error@4.0.2` کامل نشد. به همین دلیل اجرای کامل lint و Next build در این محیط ممکن نبود. پس از جایگزینی پروژه، دستورات زیر را روی سیستم خود اجرا کنید:

```bash
npm ci
npm run check
npm run build:pages
```
