# Phase 176 — i18n جریان‌های تجاری

## هدف

گسترش زیرساخت i18n فازهای 174 و 175 به مسیرهای تجاری ساعت‌یار، بدون تغییر مدل داده یا رفتار دامنه. این فاز Clients، Projects، Project Detail/Expenses، Invoices و Leave را در دو Locale فارسی RTL و انگلیسی LTR پوشش می‌دهد و Validation/Toast/Exportهای CSV/Excel و سطح چاپ فاکتور را از متن hard-coded جدا می‌کند.

## قرارداد

- Package: `2.3.2`
- AppData Schema: `v17`
- Migration: ندارد
- Dependency جدید: ندارد
- Locale ذخیره‌شده همچنان خارج از AppData و با کلید مستقل Phase 174 نگه‌داری می‌شود.
- تاریخ‌های ذخیره‌شده همچنان `YYYY-MM-DD` و زمان‌ها همچنان قرارداد قبلی خود را دارند؛ i18n فقط Presentation/Output را تغییر می‌دهد.
- Persian: `fa-IR / RTL` با تقویم شمسی و ارقام فارسی.
- English: `en / LTR` با همان semantics تقویم شمسی محصول و ارقام لاتین.

## تغییرات

- Catalog تایپ‌شده مستقل `lib/i18n/business.ts` برای متن‌های Clients/Projects/Expenses/Invoices/Leave، Validation و Toastهای تجاری اضافه شد.
- `useBusinessUi()` روی `useLocaleUi()` ساخته شد و خروجی آن memoized است تا callbackهای formatter/translation در renderهای عادی identity پایدار داشته باشند.
- صفحات Clients، Projects، جزئیات پروژه و هزینه‌ها، Invoices و Leave متن فارسی hard-coded رابط را حذف کرده و از Catalog مشترک استفاده می‌کنند.
- Validationهای Client/Project/Expense/Invoice پارامتر Locale اختیاری می‌گیرند؛ پیش‌فرض فارسی برای سازگاری تست‌ها و رفتار تاریخی حفظ شده است.
- Toastهای ساخت مشتری/پروژه، تایمر پروژه، مرخصی و تغییر Workspace در لحظه از Locale فعال مرورگر استفاده می‌کنند.
- دسته‌بندی هزینه و وضعیت فاکتور به Message Key تایپ‌شده تبدیل شدند تا Domain value ذخیره‌شده (`software`, `paid`, ...) با ترجمه UI مخلوط نشود.
- Exportهای CSV/Excel گزارش‌ها Header، تاریخ، Yes/No، عنوان، نام فایل و Toast را بر اساس Locale فعال تولید می‌کنند؛ داده دامنه و فرمول‌ها تغییر نکرده‌اند.
- Print فاکتور همان DOM locale-aware را چاپ می‌کند و Action/Status/Date/Amount آن قبل از `window.print()` از Locale فعال رندر می‌شود.
- layoutهای هدف از `text-start`/logical positioning استفاده می‌کنند تا LTR و RTL بدون duplicate markup درست بمانند.

## Browser Gate

Production Browser Smoke در وضعیت English/LTR مسیرهای `/clients`، `/projects`، `/invoices` و `/leave` را باز می‌کند و سپس قبل از Journeyهای تاریخی Locale را به Persian/RTL بازمی‌گرداند.

Freelancer Browser Smoke نیز قبل از Journey قدیمی، Client surface انگلیسی را باز می‌کند، Validation واقعی «نام مشتری خالی» را به انگلیسی بررسی می‌کند و سپس Locale را به فارسی برمی‌گرداند تا مسیر کامل Client → Project → Timer → Expense → Invoice بدون تضعیف Contract قبلی ادامه پیدا کند.

## نکات Regression

- تست‌های تاریخی Phase 107/129/131/133 به‌جای جست‌وجوی copy فارسی داخل JSX، همان hierarchy/action را از Message Keyها و Catalog فارسی بررسی می‌کنند؛ رفتار مورد انتظار حذف نشده است.
- Persian literals داخل پوشه‌های UI هدف مجاز نیستند؛ copy فقط در Catalog قرار دارد.
- `useBusinessUi()` باید memoized باقی بماند تا Regression render-loop مشابه Phase 175 برنگردد.

## Handoff

Phase 177 می‌تواند i18n را به بخش‌های باقی‌مانده Settings، Onboarding، Import/About و متن‌های System/PWA metadata گسترش دهد و در پایان یک audit سراسری hard-coded copy برای هر دو Locale اجرا کند.
