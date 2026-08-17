# فاز ۱۸۷ — Google Calendar Architecture + Read Integration

## هدف

ساعت‌یار در این فاز Google Calendar را به‌صورت **فقط‌خواندنی** و Opt-in به رابط Today/Month اضافه می‌کند، بدون اینکه رویدادهای بیرونی را به `WorkRecord` تبدیل کند یا قرارداد Local-first داده کاری را تغییر دهد.

## معماری امنیت و OAuth

- اتصال مرورگر از Google Identity Services و Token Model استفاده می‌کند.
- Scope ثابت این فاز فقط `https://www.googleapis.com/auth/calendar.readonly` است.
- `NEXT_PUBLIC_GOOGLE_CALENDAR_CLIENT_ID` تنها تنظیم لازم در Build است؛ Client Secret وارد سورس یا Browser Bundle نمی‌شود.
- Google Identity Script فقط پس از اقدام صریح کاربر برای اتصال Load می‌شود؛ Build بدون Client ID کاملاً قابل استفاده می‌ماند.
- Access Token کوتاه‌عمر فقط در `useRef` حافظه نگه‌داری می‌شود و داخل `AppData`، IndexedDB، `localStorage`، Backup، Analytics یا Log persistence نوشته نمی‌شود.
- در Expiry/401/403، Session محلی منقضی می‌شود و کاربر باید دوباره با Gesture خودش مجوز بگیرد.
- Disconnect محلی Token را فراموش می‌کند؛ Revoke علاوه بر آن مجوز Google را از طریق API خود Google لغو می‌کند.

## داده و Privacy Boundary

- فقط ID تقویم‌های انتخاب‌شده در Preference مرورگر با کلید `saatyar-external-calendar-v1` نگه‌داری می‌شود.
- Calendar List و Eventها مستقیم از REST API گوگل و با CORS دریافت می‌شوند.
- Adapter رویداد فقط فیلدهای نمایشی حداقلی را Normalize می‌کند: ID، عنوان، زمان شروع/پایان، All-day، نوع Context، نام تقویم و لینک اختیاری رویداد.
- Description، Attendeeها و سایر محتوای جزئی برای Phase 187 وارد مدل ساعت‌یار نمی‌شوند.
- رویدادها فقط در حافظه Session نگه‌داری می‌شوند و در Backup یا انتقال دستگاه ظاهر نمی‌شوند.

## Provider-neutral boundary

- UI به مدل `ExternalCalendarSource` و `ExternalCalendarEvent` متصل است، نه Resource خام Google.
- Google Adapter مسئول Pagination، Timezone، All-day، recurring-instance expansion و خطاهای API است.
- Event typeهای Google به Context ساده `meeting / focus / availability / activity` نگاشت می‌شوند.
- این جداسازی اجازه می‌دهد Provider دیگری در آینده بدون تغییر قرارداد Today/Month اضافه شود.

## UX

- Settings یک کارت مستقل Google Calendar دارد: وضعیت اتصال، انتخاب تقویم‌ها، Preview، Disconnect و Revoke.
- Today فقط در حالت Connected یک Agenda فقط‌خواندنی برای تاریخ انتخابی نشان می‌دهد.
- Month کل Range 42-cell تقویم فعال را می‌خواند، روی روزهای دارای Event شمارنده نشان می‌دهد و Agenda روز انتخابی را زیر Overview می‌آورد.
- Eventهای خارجی هیچ اثری روی Attendance، Target، Payroll، Overtime/Deficit، Activity Segment یا Totalهای ماه ندارند.
- رابط فارسی/RTL و English/LTR از همان Catalog تایپ‌شده موجود استفاده می‌کند.

## قرارداد Fetch

- Calendar List با `calendarList.list` و Pagination دریافت می‌شود.
- Eventها با `events.list`، `singleEvents=true` و `orderBy=startTime` خوانده می‌شوند تا instanceهای recurring در Range واقعی نمایش داده شوند.
- `timeMin/timeMax` از Date Range صفحه ساخته می‌شوند و Timezone مرورگر به Google ارسال می‌شود.
- Phase 187 از `syncToken` یا Cache پایدار Event استفاده نمی‌کند؛ Incremental Sync و Write/Conflict handling برای Phase 188 باقی می‌ماند.

## داده و Schema

- Development AppData: **Schema v19**
- Released 2.4.0 AppData: **Schema v17**
- Migration: ندارد
- Dependency جدید: ندارد
- Google Calendar event data: **memory-only**

## خارج از Scope

- ساخت، ویرایش یا حذف Event در Google Calendar
- Two-way sync
- Refresh token یا Backend token vault
- تبدیل خودکار Event به WorkRecord/TimeEntry
- Sync Token پایدار، conflict resolution و duplicate handling

این موارد فقط در صورت تأیید معماری Phase 187 وارد Phase 188 می‌شوند.

## R2 — Hook dependency hardening

- `useCalendarRange` دیگر کل آبجکت `integration` یا `range` را داخل Effect مصرف نمی‌کند؛ فیلدهای پایدار Range و callback موردنیاز destructure شده‌اند تا قرارداد `react-hooks/exhaustive-deps` بدون suppress رعایت شود.
- Failure مرورگر R1 ناشی از Build قدیمی بود: `check:quality` در مرحله Lint متوقف شد و `test:browser:production:built` ناچار `out/` قبلی Phase 186 را اجرا کرد؛ بنابراین نبودن Google Calendar در آن Smoke شواهد Product Regression نبود.
- Schema، dependency، OAuth scope و رفتار Product نسبت به R1 تغییر نکرده‌اند.
