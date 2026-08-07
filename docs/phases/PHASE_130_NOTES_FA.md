# فاز ۱۳۰ — Toast خوانا و تقویم جلالی یکپارچه

## هدف

این فاز دو رگرسیون UX را می‌بندد: Toastهایی که روی محتوای صفحه به‌اندازه کافی سطح بصری نداشتند، و ورودی‌های خام `input[type=date]` که تقویم میلادی/انگلیسی مرورگر را در فرم‌های مالی نشان می‌دادند.

## تغییرات

- Toast سراسری به یک سطح کاملاً opaque و theme-aware با متن اصلی خوانا، Shadow قوی‌تر و Toneهای `success / warning / danger / info` منتقل شد.
- API فعلی `setToast(message)` حفظ شده است؛ Tone فقط از متن برای Presentation استنباط می‌شود و Business Logic را تغییر نمی‌دهد.
- تاریخ هزینه پروژه از HTML date input به `JalaliDatePicker` مشترک ساعت‌یار منتقل شد.
- تاریخ صدور و سررسید فاکتور هم از HTML date input به همان `JalaliDatePicker` منتقل شدند.
- مقدار Persisted تاریخ همچنان ISO `YYYY-MM-DD` باقی می‌ماند؛ فقط ورودی/نمایش برای کاربر فارسی و جلالی است، بنابراین Schema و Backup تغییر نمی‌کنند.
- کل سورس UI برای باقی‌ماندن `input[type=date]` خام Audit می‌شود.

## فازبندی بعدی

- فاز ۱۳۱: تعمیم الگوی ساخت موجودیت وابسته درجا به Invoice → Client/Project و Timer/Expense → Project، با Empty State و انتخاب خودکار.
- فازهای بعد از ۱۳۱: Audit تدریجی سایر native controlهای وابسته به مرورگر و یکپارچه‌سازی با Design System در صورت وجود نمونه ناسازگار.

## قرارداد داده

- AppData Schema: v17، بدون تغییر.
- Migration: ندارد.
- Dependency جدید: ندارد.
