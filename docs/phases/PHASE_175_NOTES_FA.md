# فاز ۱۷۵ — i18n صفحات اصلی Today / Month / Reports

وضعیت: آماده Gate کامل روی `dev`

- Package: `2.3.2`
- AppData Schema: v17
- Migration: ندارد
- Dependency جدید: ندارد
- Baseline توسعه: Phase 174 Revision 2 / commit کاربر `8ca8a51`

## هدف

زیرساخت Locale فاز ۱۷۴ از Shell و Settings به سه سطح اصلی و پرتکرار محصول گسترش پیدا می‌کند: Today، Month و Reports. هدف فقط جایگزینی متن نیست؛ تاریخ، رقم، مدت زمان، پول، Tooltip، Empty State، جدول، نمودار و Picker نیز باید با Locale فعال هماهنگ شوند، بدون اینکه ساختار AppData یا محاسبات دامنه تغییر کند.

## قرارداد Locale

- `fa-IR`: رابط RTL، تقویم شمسی و ارقام فارسی.
- `en`: رابط LTR، همان تقویم شمسی محصول با نام/رقم انگلیسی و ارقام لاتین.
- کلیدهای ذخیره‌شده تاریخ (`YYYY-MM-DD`) و زمان (`HH:mm`) تغییر نمی‌کنند.
- Locale همچنان در `saatyar-locale-v1` و خارج از AppData ذخیره می‌شود.
- تغییر Locale هیچ Persistence جدیدی روی رکوردهای کار، پروژه، حقوق یا گزارش ایجاد نمی‌کند.

## تغییرات اصلی

- Today: Hero، Summary، Metrics، Focus Card، Attendance Log، Timeline، Time Strip، Editor روز تکمیل‌شده، Manual Entry و پیام‌های ویرایش از Catalog تایپ‌شده استفاده می‌کنند.
- Month: Header، تقویم، جزئیات روز، جدول Desktop/Mobile و نمودار هفتگی Locale-aware شدند.
- Reports: فیلترها، Summaryهای Employee/Freelancer، جدول‌ها، Print Preview، نمودارها و Tooltipها از Catalog مشترک و Formatterهای Locale استفاده می‌کنند.
- `JalaliDatePicker` و `TimePicker` Locale را مصرف می‌کنند ولی مقدار ذخیره‌شده را همان قرارداد قبلی نگه می‌دارند.
- `LiveDuration`، `LiveWorkDuration` و `PrivateMoney` نمایش اعداد/زمان/پول را از Locale فعال می‌گیرند؛ Scheduler فاز ۱۷۲ دست‌نخورده باقی می‌ماند.
- Formatter تاریخ اکنون علاوه بر date key، `Date` و ISO timestamp را بدون ساخت تاریخ نامعتبر می‌پذیرد.

## Browser contract

Production Browser Smoke پس از سوییچ به English/LTR و Reload، سه Route زیر را واقعاً باز می‌کند:

1. `/today` و متن‌های انگلیسی Today.
2. `/month` و عنوان/Section انگلیسی Month.
3. `/reports` و عنوان/Analytics انگلیسی Reports.

بعد به Settings برمی‌گردد، Locale را به `fa-IR/RTL` بازمی‌گرداند و Journeyهای تاریخی فارسی ادامه پیدا می‌کنند.

## حفاظت Regression

تست‌های تاریخی که قبلاً متن فارسی را مستقیماً داخل JSX جستجو می‌کردند به قرارداد جدید Catalog/Key مهاجرت داده شدند؛ رفتار اصلی آن تست‌ها حذف یا ضعیف نشده است. متن‌های فارسی Today/Month/Reports از Componentها خارج شده‌اند و Source of Truth آن‌ها Catalog فارسی است.

## خارج از Scope

ترجمه کامل Clients، Projects، Invoices، Leave، About و همه کارت‌های عمیق Settings در این فاز انجام نمی‌شود. این سطوح برای فاز ۱۷۶ نگه داشته می‌شوند تا Blast Radius کنترل شود.

## Revision 2 — Completed-day diff typing

- `RecordChangeSummary` دوباره قرارداد ساختاری `WorkRecordChange[]` را حفظ می‌کند و دیگر آن را به `string[]` تقلیل نمی‌دهد.
- برچسب و مقدار تغییرات روز تکمیل‌شده در UI بر اساس locale نمایش داده می‌شوند؛ ساختار domain و AppData تغییر نکرده است.
- این اصلاح خطای TypeScript فاز ۱۷۵ در `completed-day-editor.tsx` را پوشش می‌دهد.

## Revision 3 — Stable locale UI callbacks

- Formatterهای `useLocaleUi` با `useMemo` پایدار شدند تا `digits`/`date`/`duration` و سایر callbackها در هر render هویت جدید نسازند.
- این اصلاح loop ثبت/حذف draft در `CompletedDayEditor` را می‌بندد؛ همان loop در build production به React error #185 و صفحه fallback منجر می‌شد.
- قرارداد Domain، AppData، Scheduler و Locale persistence تغییری نکرده است.
- یک regression test صریح اضافه شد تا پایداری referential این facade در refactorهای بعدی حفظ شود.

## Revision 4 — Employee smoke selector hardening

پس از سبز شدن 722 تست و Production/Freelancer smoke، Employee smoke روی selector متنی `وقفه 1 با حقوق` شکست خورد؛ چون i18n رقم پویا را در فارسی به `۱` تبدیل می‌کند. رفتار محصول صحیح بود و مشکل از coupling تست مرورگر به متن/رقم محلی‌شده بود. برای حفظ قدرت Gate بدون وابستگی به copy، Break editor اکنون hookهای ساختاری `data-breaks-editor`، `data-break-row`، `data-break-field` و `data-break-paid-toggle` دارد و smoke از همان contract استفاده می‌کند.

