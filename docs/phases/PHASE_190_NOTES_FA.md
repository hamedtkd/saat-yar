# Phase 190 — Calendar Intelligence

Baseline شروع این فاز روی `dev` برابر `a904631` است؛ همان baseline تمیز بعد از بسته‌شدن Phase 189C.

## هدف

Phase 190 اتصال Google Calendar را از CRUD ساده به یک لایه برنامه‌ریزی هوشمند ارتقا می‌دهد، بدون اینکه Calendar به Source of Truth حضور، کارکرد یا حقوق تبدیل شود.

## Incremental Sync

- Full Sync اولیه برای هر تقویم انتخاب‌شده از یک سال قبل تا آینده انجام می‌شود و `nextSyncToken` دریافت می‌کند.
- Syncهای بعدی فقط با `syncToken` اجرا می‌شوند و تغییر/حذف رویدادها را روی cache محلی merge می‌کنند.
- در Incremental Sync پارامترهای ناسازگار مثل `timeMin`/`timeMax`/`orderBy` ارسال نمی‌شوند.
- اگر Google برای token منقضی/نامعتبر پاسخ `410` بدهد، cache همان تقویم پاک می‌شود و Full Sync سالم دوباره انجام می‌شود.
- metadata رویدادها و sync token در IndexedDB جداگانه `saatyar-calendar-cache` ذخیره می‌شوند؛ این cache عضو AppData نیست، وارد Backup نمی‌شود و با Disconnect/Revoke پاک می‌شود.
- OAuth Access Token همچنان فقط در RAM نشست مرورگر است و در IndexedDB/localStorage/AppData ذخیره نمی‌شود.

## Conflict و Duplicate Handling

- `etag` هر Event نگهداری می‌شود.
- Edit/Delete با `If-Match` انجام می‌شود تا نسخه stale نتواند تغییر جدیدتر Google را بی‌صدا overwrite کند.
- پاسخ `412` به‌عنوان Conflict شناخته می‌شود؛ SaatYar آخرین داده را Sync می‌کند و از overwrite اجباری خودداری می‌کند.
- کپی‌های یک occurrence با `iCalUID + originalStart` collapse می‌شوند و Badge تعداد duplicate نمایش داده می‌شود.
- Eventهای timed که overlap دارند در Day/Week Agenda با Conflict badge مشخص می‌شوند.

## Day / Week Planning

Agenda مشترک Month اکنون دو حالت دارد:

- Day: جزئیات روز انتخاب‌شده، CRUD، Conflict/Duplicate و Activity import.
- Week: همان هفته هفت‌روزه روز انتخاب‌شده، تعداد Event، Conflict و duplicate پنهان برای هر روز.

این قابلیت Route تقویم جداگانه ایجاد نمی‌کند؛ «ماه من» همچنان سطح اصلی Calendar ساعت‌یار است.

## Event → Activity

تبدیل Event به Activity فقط با اقدام صریح کاربر انجام می‌شود:

1. Event timed و تک‌روزه انتخاب می‌شود.
2. کاربر نوع Activity ساعت‌یار را انتخاب می‌کند.
3. یک `ActivitySegment` deterministic روی همان روز ساخته می‌شود.
4. Import تکراری همان Google Event نادیده گرفته می‌شود.

این عملیات **WorkRecord را شروع یا پایان نمی‌دهد**، زمان کارکرد/Payroll را افزایش نمی‌دهد و Attendance را تغییر نمی‌دهد. Activity فقط context و breakdown فعالیت است.

## Recurring Series Editing

برای Event تکرارشونده در Edit دو Scope روشن وجود دارد:

- فقط همین occurrence
- کل series

ویرایش occurrence همان instance را تغییر می‌دهد. ویرایش کل series ابتدا parent recurring event را می‌خواند، `etag` parent را برای `If-Match` استفاده می‌کند و metadata/time-of-day را بدون بازنویسی recurrence pattern و تاریخ‌های series patch می‌کند. Delete occurrence/series نیز همین مرز ایمن را حفظ می‌کند.

حالت «این occurrence و رخدادهای بعدی» در این فاز پیاده نشده است؛ چون نیازمند split کردن series است و بدون UX صریح نباید به‌صورت ضمنی انجام شود.

## قرارداد داده و Privacy

- Development AppData schema: **v20** (بدون تغییر نسبت به Phase 189C)
- Released 2.4.0 schema: **v17** و immutable
- dependency جدید: ندارد
- Google Calendar cache: IndexedDB جدا از AppData
- Access token: memory-only
- Google Event/Holiday: هیچ اثر خودکار روی Target، Deficit، Payroll، Leave یا Holiday engine داخلی ندارد

## QA مورد انتظار

- Full Sync → Incremental Sync و نمایش وضعیت آخرین sync در Settings.
- شبیه‌سازی 410 و بازگشت سالم به Full Sync.
- Event overlap و duplicate badge در Day/Week.
- stale edit بعد از تغییر همان Event در Google → Conflict بدون overwrite.
- Event → Activity و اثبات عدم تغییر worked time/payroll.
- recurring edit روی occurrence و whole series؛ delete occurrence/series.
- FA/EN، RTL/LTR، Light/Dark، Desktop و Mobile 425px.
