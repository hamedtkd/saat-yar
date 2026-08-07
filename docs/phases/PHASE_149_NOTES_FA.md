# فاز ۱۴۹ — Employee Input/Persistence Fidelity

## مسئله

Release Gate فاز ۱۴۸ تا انتهای Quality، Build، Production Smoke و Freelancer Smoke سبز بود، اما Employee Browser Journey بعد از ویرایش وقفه ۱۵ دقیقه‌ای هنوز `۸:۳۰` نشان می‌داد. Contract داخل DOM نشان می‌داد ورودی‌های `15:00` و `15:15` و Paid=false دیده می‌شوند، ولی این فقط state قابل مشاهده‌ی کنترل را ثابت می‌کرد و نه رسیدن تغییر به AppData/IndexedDB.

همچنین Employee Smoke برای Controlled Input از `Event("input")` استفاده می‌کرد، در حالی که مسیر Freelancer از فاز ۱۳۶ قرارداد اثبات‌شده‌ی `InputEvent` را برای React controlled fields استفاده می‌کند.

## تغییرات

- تزریق متن Employee Browser Smoke با native value setter + `InputEvent("input")` هم‌سطح مسیر Freelancer شد.
- یک Persistence Probe مستقل قبل از Clock-out اضافه شد که باید در IndexedDB صریحاً این قرارداد را ببیند:
  - ورود `08:00`
  - ناهار `12:00 → 12:30` و ۳۰ دقیقه
  - وقفه `15:00 → 15:15`
  - `paid === false`
- پس از ذخیره Draft روز کامل نیز Full Employee Persistence Probe قبل از assertion عدد `۸:۱۵` اجرا می‌شود. بنابراین اگر UI عدد اشتباه نشان دهد، می‌دانیم داده‌ی persisted درست است و خطا در Calculation/derived UI است؛ و اگر Probe رد شود، خطا دقیقاً در mutation/input fidelity است.
- Diagnostics Probe شامل start/end/paid و timestampهای Break است تا شکست بعدی بدون حدس قابل تشخیص باشد.

## قرارداد انتشار

- Package: `2.2.0`
- Schema: v17
- Migration: ندارد
- Dependency جدید: ندارد
- تغییر UI محصول: ندارد
- Release Candidate 2.3.0 فقط بعد از سبز شدن کامل Employee Browser Journey شروع می‌شود.
