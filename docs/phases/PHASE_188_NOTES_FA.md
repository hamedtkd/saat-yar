# Phase 188 — Google Calendar Write/Sync + Unified Month UX

Baseline: Phase 187 R2 روی `dev` پس از Phase 186 baseline `be502b0`.

## بسته این فاز

- Scope فعال از read-only Phase 187 به least-privilege write ارتقا یافت:
  - `calendar.calendarlist.readonly`
  - `calendar.events`
- Create/Edit/Delete مستقیم Google Event با REST API و بدون dependency جدید.
- Token همچنان memory-only و خارج از AppData/Backup/IndexedDB/localStorage است.
- Modal مشترک Event برای Today و Month، همراه DatePicker/TimePicker، all-day، repeat ساده، location، description و کنترل notification مهمان‌ها.
- recurring delete: همین occurrence یا کل سری؛ recurring edit در این فاز فقط occurrence فعلی.
- Settings Google Calendar فشرده شد؛ preview سنگین حذف و مدیریت Calendarها داخل details قرار گرفت.
- Month همان تقویم اصلی می‌ماند و Google فقط لایه اختیاری Context است.
- Google holiday event هیچ اثر دامنه‌ای روی تعطیلی/حقوق/هدف کاری ندارد.
- Month records table دارای sortable header، sticky date column و mobile sort picker شد.
- Schema توسعه همچنان v19 و Release 2.4.0 همچنان schema v17 است.
- dependency جدید اضافه نشد.

## خارج از این فاز

- attendee editor کامل
- edit «این و رخدادهای بعدی» برای recurring series
- incremental sync token / push notifications
- تبدیل خودکار Event به WorkRecord یا Activity Segment
- تقسیم Settings به routeهای مستقل؛ برای Phase 189 ثبت شد.

## R2 — Typed i18n closure

- خطای TypeScript مربوط به `common.save` و `common.delete` در مودال‌های Google Calendar رفع شد.
- کلیدهای عمومی Save/Delete به catalog اصلی FA/EN اضافه شدند تا `useLocaleUi().t` همان قرارداد typed را دنبال کند.
- تست Phase 188 وجود این دو کلید در هر دو catalog را قفل می‌کند.
- هیچ تغییر Product، OAuth scope، Schema، dependency یا package-lock در R2 وجود ندارد.

## R3 — Windows full-test command hardening

- `npm test` دیگر همه ۱۸۲ مسیر تست را به‌صورت literal روی command line ویندوز قرار نمی‌دهد؛ آن قرارداد از سقف `cmd.exe` عبور کرده بود و Gate را با `The command line is too long.` متوقف می‌کرد.
- Node 22 test runner اکنون با glob رسمی `tests/**/*.test.ts` همه تست‌ها را discovery می‌کند؛ نام testهای تاریخی‌ای که ownership testهای قدیمی هنوز در `scripts.test` بررسی می‌کنند فقط برای compatibility باقی مانده‌اند و runner مسیرهای تکراری را یک‌بار اجرا می‌کند.
- طول script از محدوده خطر Windows پایین نگه داشته شده و Phase 188 regression test آن را قفل می‌کند.
- این Revision هیچ تغییر Product، Google Calendar، Schema، dependency یا package-lock ندارد.

### R4 — Windows full-suite ownership hardening
- R3 ثابت کرد glob در Node 22 تمام تست‌ها را اجرا می‌کند، اما قراردادهای تاریخی مخزن هنوز حضور نام فایل‌های phase را داخل `scripts.test` بررسی می‌کردند و release audit نیز فقط مسیرهای صریح را می‌شناخت.
- `scripts.test` اکنون glob واقعی را برای اجرای کل suite نگه می‌دارد و نام تمام تست‌های `phase*.test.ts` را نیز برای سازگاری قراردادهای تاریخی به‌صورت صریح نگه می‌دارد؛ طول command همچنان زیر سقف Windows است.
- release audit اکنون `tests/**/*.test.ts` را به‌عنوان پوشش کامل suite می‌شناسد و دیگر core testها را به اشتباه missing گزارش نمی‌کند.
- `CalendarIntegrationProvider` به context و controller متمرکز شکسته شد تا قرارداد معماری حداکثر ۲۵۰ خط دوباره سبز شود؛ رفتار OAuth/Calendar CRUD تغییر نکرده است.

### R5 — Phase 187 ownership regression alignment
- بعد از split شدن Calendar integration در R4، نگهداری session/token از provider کوچک به `use-calendar-integration-controller.ts` منتقل شده بود، اما تست تاریخی Phase 187 هنوز `useRef<GoogleAccessSession | null>` را فقط داخل provider جست‌وجو می‌کرد.
- تست Phase 187 اکنون delegation provider و memory-only session ownership را در controller واقعی بررسی می‌کند و همچنان persistence توکن در localStorage/IndexedDB را رد می‌کند.
- هیچ تغییر Product، OAuth، Calendar CRUD، Schema، dependency، package.json یا package-lock در R5 وجود ندارد.
