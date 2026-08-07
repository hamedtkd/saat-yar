# فاز ۱۳۲ — Audit کنترل‌های Native مرورگر

این فاز بعد از سبز شدن کامل فاز ۱۳۱، کنترل‌های ورودی باقی‌مانده را از نظر ظاهر خام مرورگر و سازگاری با Design System ساعت‌یار بررسی می‌کند.

## تغییرات

- `NumberField` دیگر از `input[type=number]` و spinner بومی مرورگر استفاده نمی‌کند.
- ورودی عددی با `type=text`، `inputMode` مناسب، نقش `spinbutton`، کلیدهای ArrowUp/ArrowDown و پشتیبانی از رقم‌های فارسی/عربی کار می‌کند.
- مقدارهای اعشاری مثل `42.5` یا ضریب‌های `1.4` همچنان قابل ورود هستند و min/max/step حفظ شده‌اند.
- ورودی عددی سفارشی `MinuteDurationField` نیز به همین قرارداد مشترک منتقل شده است.
- انتخاب رنگ سفارشی پشت یک Trigger واضح Design System قرار گرفته؛ کنترل native رنگ دیگر به‌صورت خام دیده نمی‌شود و Hex input مستقل باقی مانده است.
- انتخاب فایل Backup به `FileDropField` مشترک منتقل شده؛ input فایل native نامرئی است و Drop Surface دسترس‌پذیر مالک تعامل است.
- Audit تستی از بازگشت `date/time/range/select/number` خام در UI محصول جلوگیری می‌کند. `color` و `file` فقط در wrapperهای اختصاصی و نامرئی مجاز هستند.

## قرارداد داده

- AppData Schema: v17
- Migration جدید: ندارد
- Dependency جدید: ندارد
- فرمت persisted اعداد، رنگ و Backup تغییر نکرده است.
