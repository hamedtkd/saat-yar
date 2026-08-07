# فاز ۱۳۳ — Audit فرم‌های مالی و فریلنسر

## هدف

کاهش اصطکاک در فرم‌های Client، Project، Invoice، Manual Time و Expense بدون تغییر قرارداد داده یا افزودن relation مصنوعی.

## تغییرات

- فرم‌های اصلی Client، Project، Invoice و Expense به submit معنایی HTML منتقل شدند تا Enter مسیر طبیعی ذخیره باشد.
- Validation قابل مشاهده و field-level اضافه شد؛ خطا فقط با Toast یا سکوت ناپدید نمی‌شود.
- Invoice حالا تاریخ سررسید قبل از تاریخ صدور را قبل از ذخیره رد می‌کند.
- ثبت دستی Time Entry دیگر از `alert()` مرورگر استفاده نمی‌کند و خطای پروژه، بازه زمانی و overlap را داخل همان فرم نمایش می‌دهد.
- Empty Stateهای Client، Invoice، Expense و Time Entry یک CTA مستقیم برای قدم بعدی دارند.
- Quick Createهای فازهای ۱۲۹ و ۱۳۱ حفظ شدند؛ Audit نشان داد Expense داخل `ProjectDetail` از قبل Project-contextual است، بنابراین selector یا relation تکراری به آن اضافه نشد.
- Validationهای pure در `lib/business-form-validation.ts` متمرکز شدند تا رفتار فرم‌ها قابل تست باقی بماند.

## قرارداد داده

- AppData Schema: v17
- Migration: ندارد
- Backup contract: بدون تغییر
- Dependency جدید: ندارد

## فاز بعدی

فاز ۱۳۴ باید این جریان را در Browser واقعی و viewport موبایل با Focus/Keyboard بررسی کند:
Client → Project → Time Entry → Expense → Invoice.
