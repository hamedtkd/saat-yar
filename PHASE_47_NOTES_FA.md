# فاز ۴۷ — قرارداد معنایی StatusBadge و رفع خطای اعلان

## هدف

رفع خطای TypeScript کارت اعلان و تبدیل `StatusBadge` به یک primitive معنایی قابل استفاده برای وضعیت‌های خنثی، موفق، هشدار، خطر و اطلاعات.

## تغییرات

- اضافه‌شدن نوع `StatusBadgeTone`.
- پشتیبانی از toneهای `neutral`، `success`، `warning`، `danger` و `info`.
- حفظ prop قدیمی `success` برای جلوگیری از شکستن مصرف‌کننده‌های موجود.
- Type-safe شدن `permissionTone` در تنظیمات اعلان.
- اضافه‌شدن تست regression برای قرارداد کامپوننت.

## داده و Migration

- Schema همان نسخه ۱۴ است.
- هیچ Migration یا تغییر در داده کاربران وجود ندارد.
