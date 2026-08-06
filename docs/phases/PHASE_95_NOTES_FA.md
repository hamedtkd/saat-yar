# فاز ۹۵ — اصلاح قرارداد Backup و یکپارچه‌سازی Fixture رکورد کاری

## هدف

رفع False Positive گزارش Schema Audit در مسیر Backup و تکمیل مهاجرت تست‌های دارای `WorkRecord` دست‌ساز به Fixture مشترک و Type-safe.

## تغییرات

- اصلاح `parseBackupEnvelope` تا فقط payload واقعی `AppData` را برگرداند و متادیتای انتقالی `appName`، `schemaVersion` و `exportedAt` وارد State برنامه نشوند.
- اضافه‌شدن `pickAppData` برای انتخاب قطعی کلیدهای ثبت‌شده در قرارداد `AppData`.
- تغییر مسیر `backup round-trip` در Audit به API صحیح Envelope.
- اضافه‌شدن تست رفتاری برای تضمین نبود متادیتای Backup در خروجی Restore.
- مهاجرت تست‌های Time Engine، Report Filter، Record Health، Reminder، Session Heartbeat، Previous Day Guard، Historical Draft و Workflow Integration به `makeWorkRecord`.
- بسته‌شدن آیتم باقی‌مانده Fixtureهای دستی در بک‌لاگ.

## سازگاری

- Schema همچنان نسخه ۱۶ است.
- Migration جدیدی اضافه نشده است.
- فرمت فایل Backup تغییر نکرده است؛ فقط خروجی Parser داخلی با Type اعلام‌شده هماهنگ شده است.
- Dependency جدیدی اضافه نشده است.
