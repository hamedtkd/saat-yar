# فاز ۸۴ — سخت‌سازی قرارداد Schema v16 و Backup

## مسئله

پس از اضافه‌شدن `deletedRecords` در Schema نسخه ۱۶، دو مصرف‌کننده با قرارداد جدید کامل نشده بودند:

- Route صفحه امروز، عملیات Undo حذف رکورد را به `TodayPage` منتقل نمی‌کرد.
- `mergeAppData` در جریان Import و Merge پشتیبان، مجموعه سطل بازیابی را در خروجی قرار نمی‌داد.

این دو نقص در TypeScript شناسایی شدند و Build را متوقف کردند.

## تغییرات اصلی

- اتصال `resetUndoDate`، `undoResetRecord` و `dismissResetUndo` از Controller به صفحه امروز.
- اضافه‌شدن `deletedRecords` به Merge پشتیبان با حذف شناسه‌های تکراری.
- ایجاد Factory مرکزی `createCompleteAppData` برای ساخت خروجی کامل `AppData`.
- استفاده از Factory مرکزی در داده اولیه، Normalisation و Backup Merge.
- جداسازی Merge خالص داده از Parser وابسته به Zod برای تست‌پذیری و مرزبندی بهتر.
- افزودن تست Regression برای قرارداد کامل Schema، استقلال آرایه‌های اولیه، Merge سطل بازیابی و اتصال Undo صفحه امروز.

## تصمیم معماری

`createCompleteAppData` مالک فهرست Collectionهای اجباری `AppData` است. هر مسیر ساخت کامل داده باید از این Factory استفاده کند؛ به‌روزرسانی‌های جزئی که با Spread روی داده موجود انجام می‌شوند همچنان مجازند.

این الگو باعث می‌شود اضافه‌شدن Collection جدید در Schema یک نقطه مرکزی برای مقدار پیش‌فرض داشته باشد و احتمال فراموش‌شدن فیلد در Reset، Normalisation یا Merge کمتر شود.

## Migration و Dependency

- نسخه Schema همچنان ۱۶ است.
- Migration جدیدی لازم نیست.
- Dependency جدیدی اضافه نشده است.
- ساختار Backup تغییر نکرده؛ فقط Merge اکنون سطل بازیابی را نیز حفظ می‌کند.

## تست‌ها

- Factory همه Collectionهای اجباری را ایجاد می‌کند.
- دو داده اولیه آرایه سطل بازیابی مشترک ندارند.
- Merge پشتیبان رکوردهای حذف‌شده هر دو منبع را بدون تکرار نگه می‌دارد.
- Normalisation داده ناقص را با `deletedRecords: []` ترمیم می‌کند.
- Route امروز قرارداد کامل Undo را ارسال می‌کند.

## پیام Commit پیشنهادی

```text
fix(data): complete schema v16 app data contracts
```
