# فاز ۱۶۴ — README اصلی انگلیسی و نقشه راه i18n

## هدف

GitHub باید به‌صورت پیش‌فرض معرفی انگلیسی پروژه را نشان دهد، بدون حذف مستندات فارسی یا شکستن لینک‌های قدیمی. هم‌زمان مسیر دو زبانه‌کردن خود رابط ساعت‌یار باید به‌صورت صریح در Roadmap ثبت شود، اما در این فاز هیچ تغییر Runtime یا Schema انجام نمی‌شود.

## تغییرات

- `README.md` به README canonical انگلیسی تبدیل شد.
- محتوای کامل فارسی در `README_FA.md` حفظ شد و از README اصلی لینک مستقیم دارد.
- `README_EN.md` به compatibility pointer تبدیل شد تا لینک‌های قدیمی نشکنند.
- `docs/README.md` و `CONTRIBUTING.md` با مسیرهای canonical جدید هماهنگ شدند.
- Release Audit و تست‌های تاریخی مستندات به‌جای فرض قدیمی «README.md فارسی» از مسیرهای canonical جدید استفاده می‌کنند.
- Roadmap آینده برای i18n شامل Dictionary تایپ‌شده، Locale انگلیسی LTR، ذخیره Local-first زبان و Browser Regression دوطرفه ثبت شد.

## قرارداد داده و Runtime

- Package version: `2.3.1`
- AppData schema: `v17`
- Migration جدید: ندارد
- Dependency جدید: ندارد
- Runtime behavior: بدون تغییر

## Gate مورد انتظار

فاز ۱۶۳ روی `628/628` سبز بود. فاز ۱۶۴ پنج تست مستندات/قرارداد مخزن اضافه می‌کند، بنابراین Full Gate مورد انتظار `633/633` است.
