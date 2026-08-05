# فاز ۴۱ — تثبیت ناوبری تنظیمات

## اصلاح‌ها

- خطای TypeScript در `SettingsNav` با تعریف نوع دقیق `SettingsSectionId` رفع شد.
- هدف‌های اسکرول از عناصر `display: contents` به Anchorهای واقعی منتقل شدند تا `scrollIntoView` در مرورگرها قابل اتکا باشد.
- بخش فعال تنظیمات در URL hash ثبت می‌شود و بعد از Reload بازیابی می‌گردد.
- تست Regression برای نوع، Anchorها و حفظ Hash اضافه شد.

## مدل داده

- Schema همچنان نسخه ۱۳ است.
- Migration جدیدی وجود ندارد.
