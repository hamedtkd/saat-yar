## خلاصه

این تغییر زیرساخت داده ساعت‌یار را برای توسعه فازهای بعدی پایدار می‌کند.

## تغییرات

- اضافه‌شدن نسخه مرکزی Schema داده
- ذخیره IndexedDB به‌صورت Snapshot نسخه‌بندی‌شده
- Migration مرحله‌ای برای داده‌ها و Backupهای قدیمی
- پشتیبانی از داده خام قدیمی و Local Storage قدیمی
- جلوگیری از Import نسخه‌های جدیدتر و ناسازگار
- جداسازی Normalisation از ابزارهای Format
- تست‌های Migration و مستندات معماری داده

## تست

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build:pages`
