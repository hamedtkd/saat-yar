# فاز ۱۱۲ — Policy حقوق در Settings و Schema v17

در این فاز موتور Rule-based فاز ۱۱۱ وارد داده پایدار و رابط کاربری شد.

- Schema از v16 به v17 ارتقا یافت و `settings.payrollPolicy` اضافه شد.
- Migration v16→v17 از `salary` و ضرایب قدیمی یک Policy کاملاً سازگار می‌سازد.
- Backup/Restore پس از Migration قرارداد Policy را با Zod اعتبارسنجی می‌کند.
- Settings کارت مستقل «روش محاسبه حقوق» با Draft/Save/Cancel، Preview زنده و کنترل‌های پیشرفته دارد.
- گزارش ماهانه و حقوق روز از Policy ذخیره‌شده استفاده می‌کنند.
- Breakdown قابل توضیح در گزارش نمایش داده می‌شود.
- Release manifest نسخه 2.1.0 تاریخی و immutable باقی می‌ماند؛ Release Audit اجازه می‌دهد Schema توسعه بعد از انتشار جلوتر از Schema نسخه منتشرشده باشد.
- دو تست قدیمی Roadmap از شماره‌گذاری سخت به قرارداد معنایی پایدار منتقل شدند.
