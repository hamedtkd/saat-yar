# فاز ۹۴ — گزارش خوانای اختلاف Schema در CI

## هدف

رفع هشدار ESLint باقی‌مانده از سرور Static Export و تبدیل Audit قرارداد `AppData` از یک خطای خام به گزارشی که مسیر شکست، نسخه Schema و نوع اختلاف را دقیق نشان دهد.

## تغییرات

- حذف Import استفاده‌نشده `join` از سرور Static Export.
- اضافه‌شدن بازرسی مستقل قرارداد `AppData` برای تفکیک موارد زیر:
  - کلیدهای اجباری حذف‌شده
  - کلیدهای بالادستی ناشناخته یا قدیمی
  - Collectionهای دارای نوع نامعتبر
- گزارش جداگانه برای هر مسیر Factory، Normalisation، Migration، Backup، Recovery، Snapshot و Merge.
- ادامه Audit پس از شکست یک مسیر و نمایش تمام شکست‌ها در یک اجرای CI.
- ثبت `exitCode = 1` پس از چاپ گزارش کامل، به‌جای توقف در اولین Exception.
- اضافه‌شدن تست رگرسیون برای متن گزارش، دسته‌بندی اختلاف‌ها و هشدار ESLint فاز قبل.

## نمونه خروجی شکست

```text
AppData schema audit failed

Path: backup round-trip
Schema: v16

Missing:
- deletedRecords

Unexpected:
- archivedRecords

Invalid:
- records: expected object, received array

Suggested action:
- Add every missing key to the AppData factory, migrations and round-trip paths.
```

## سازگاری

- Schema همچنان نسخه ۱۶ است.
- Migration جدیدی اضافه نشده است.
- ساختار Backup و IndexedDB تغییر نکرده است.
- Dependency جدیدی اضافه نشده است.
