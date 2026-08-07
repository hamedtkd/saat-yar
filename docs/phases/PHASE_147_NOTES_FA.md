# فاز ۱۴۷ — Atomic Break Edit Contract

## دلیل فاز

اجرای واقعی Phase 146 روی Windows نشان داد همه ۵۵۰ تست واحد، TypeScript، ESLint، Build، Production Smoke و Freelancer Smoke سبز هستند و Employee Journey تا ساخت وقفه ۱۵ دقیقه‌ای بدون حقوق جلو می‌رود؛ با این حال پس از ذخیره روز، خلاصه Today هنوز `۸:۳۰` نشان می‌داد و Gate منتظر `۸:۱۵` می‌ماند.

از آن‌جا که موتور زمان برای `08:00–17:00` با ناهار ۳۰ دقیقه و وقفه ۱۵ دقیقه‌ای بدون حقوق به‌صورت واحد `۴۹۵` دقیقه را محاسبه می‌کند، این فاز روی حفظ atomic قرارداد ویرایش nested record در UI تمرکز می‌کند، نه تغییر فرمول حقوق یا زمان.

## تغییر اصلی

`updateRecord` اکنون علاوه بر Patch ساده، Functional Patch را می‌پذیرد. ویرایش‌های Lunch و Break دیگر آرایه `breaks` را از snapshot رندر قبلی بازسازی نمی‌کنند؛ هر تغییر روی جدیدترین WorkRecord داخل `setData(previous => ...)` اعمال می‌شود. این موضوع برای Start/Finish Break، تغییر ساعت شروع/پایان، Paid/Unpaid و Add/Remove Break برقرار است.

CompletedDayEditor نیز همین قرارداد Functional Patch را در Draft تاریخی حفظ می‌کند تا ویرایش روز کامل‌شده و ویرایش روز زنده رفتار یکسان داشته باشند.

## Browser evidence

Employee Browser Smoke پیش از Clock-out حالا صریحاً قرارداد کنترل‌شده وقفه را می‌خواند و تأیید می‌کند:

- شروع: `15:00`
- پایان: `15:15`
- Paid: `false`

Persistence Probe نیز همین وقفه را فقط زمانی معتبر می‌داند که `paid === false` باشد و در شکست، start/end/paid همه Breakها را گزارش می‌کند.

## قرارداد انتشار

- AppData Schema: **v17**
- Migration جدید: ندارد
- Dependency جدید: ندارد
- تغییر فرمول Time Engine: ندارد
- RC نسخه 2.3.0 تا سبزشدن کامل Employee Browser Journey به فاز ۱۴۸ منتقل شد.
