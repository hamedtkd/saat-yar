# فاز ۱۸۲ — Flexible Work Mode & Activity Segments

## هدف

بازخورد اصلی این فاز این بود که «برنامه کاری» نباید همیشه به معنی ورود و خروج از پیش تعیین‌شده باشد. کاربر Flexible باید بتواند فقط هدف خالص روز را تعیین کند، هر زمان لازم بود کار را شروع یا متوقف کند، وقفه‌های واقعی را ثبت کند و در پایان بفهمد زمان فعالش صرف چه نوع فعالیتی شده است.

## تصمیم Schema

بررسی قبل از اجرا نشان داد این قابلیت فقط یک Preference نمایشی نیست: `workTimingMode`، `targetMinutes` مستقل هر روز و `activitySegments` باید در Backup/Restore و انتقال دستگاه پایدار بمانند. بنابراین AppData از Schema v17 به **Schema v18** ارتقا یافت.

Migration `v17 -> v18` عمداً رفتار کاربران 2.4.0 را تغییر نمی‌دهد:

- `workTimingMode` برای داده قدیمی `scheduled` می‌شود.
- `targetMinutes` هر روز از Start/End/Lunch همان داده قبلی استخراج می‌شود.
- `activitySegments` برای WorkRecord و Recycle Bin قدیمی با آرایه خالی مقداردهی می‌شود.
- Manifest منتشرشده `docs/releases/2.4.0.json` همچنان تاریخی و روی Schema v17 می‌ماند؛ Release Audit اجازه می‌دهد Schema توسعه بعد از Release جلوتر باشد، ولی قرارداد 2.4.0 را تغییر نمی‌دهد.

## Flexible Work

در Settings و Onboarding دو مدل زمان‌بندی وجود دارد:

- **Fixed schedule:** Start/End همان منبع حقیقت Target روز است؛ رفتار قبلی حفظ شده است.
- **Flexible schedule:** Start/End اجباری نیست و Target خالص روز به‌صورت مستقل ذخیره می‌شود. تغییر هدف هفتگی فقط Target روزهای فعال را توزیع می‌کند و ساعت‌های ثابت را جابه‌جا نمی‌کند.

`Apply to active days` در حالت Flexible فقط Target و تنظیم Lunch را کپی می‌کند و Start/End روز مقصد یا روزهای غیرفعال را دست‌کاری نمی‌کند.

برای Roll-over روز قبل در Flexible، سیستم به‌جای ساختن خروج مصنوعی از Schedule ثابت، آخرین timestamp ذخیره‌شده را به‌عنوان تخمین محافظه‌کارانه می‌گیرد و رکورد را همچنان `needsReview` نگه می‌دارد.

## Activity Segments

Today می‌تواند Segmentهای زیر را درون Workday فعال ثبت کند:

- Deep Work
- Meeting
- Learning
- Admin
- Project
- Other

Project segment در صورت انتخاب پروژه فقط رابطه فعالیت را ثبت می‌کند و هیچ Billing/Financial mutation جدیدی ایجاد نمی‌کند.

قواعد ایمنی:

- Segment فقط وقتی Workday فعال است شروع می‌شود.
- حین Lunch یا Break Segment جدید شروع نمی‌شود.
- شروع Segment جدید، Segment باز قبلی را می‌بندد.
- شروع Lunch/Break، Clock-out و Auto-close نشست، Segment باز را با همان timestamp می‌بندند.
- Reports مجموع دقیقه و سهم هر نوع فعالیت را برای رکوردهای فیلترشده نشان می‌دهد.

## قرارداد فنی

- AppData schema: **v18**
- Migration جدید: `17 -> 18`
- Dependency جدید: **ندارد**
- Package version: همچنان `2.4.0` تا Release بعدی تصمیم‌گیری شود.
- Manifest/Tag تاریخی `v2.4.0`: بدون تغییر و Schema v17.
- Phase 181 baseline روی `dev`: `1033192`
- Gate قبلی: `776/776`
- شش Contract جدید Phase 182؛ Target این Revision: **782/782**.

## Visual QA لازم

به‌دلیل تغییر UI، قبل از Commit باید Desktop/Mobile، فارسی RTL/English LTR و Light/Dark بررسی شوند؛ تمرکز روی Settings schedule mode، Onboarding schedule، Activity card در Today و Activity breakdown در Reports است.

## R3 — Responsive Gate Hardening

Visual QA روی viewport واقعی `425×608` نشان داد Shell در صفحات Month و Leave می‌تواند از عرض موبایل خارج شود. R3 این Regression را در لایه Shell/Header و چند Surface مشترک اصلاح می‌کند، بدون تغییر قرارداد داده Flexible Work یا Activity Segment:

- Shell و Surfaceهای مشترک `min-width: 0` و سقف عرض viewport دارند و `overflow-x: clip` فقط به‌عنوان safety belt غیر-scroll-container اعمال می‌شود.
- Header زیر 520px Route context تکراری را حذف می‌کند و Workspace/Privacy/Language/Theme/Profile را در عرض موجود shrink می‌کند.
- Workspace Switcher در موبایل flex-shrink واقعی دارد و آیکن تزئینی آن حذف می‌شود.
- Month selected-day header در موبایل یک‌ستونه می‌شود و CTA و تاریخ بلند دیگر عرض صفحه را تحمیل نمی‌کنند.
- Mobile bottom navigation سقف صریح مبتنی بر viewport دارد.
- Production Browser Smoke اکنون Month و Leave را روی `425×608` تست می‌کند و `scrollWidth` و bounding boxهای Header/Main/Nav را می‌سنجد.
- Warning مربوط به import بلااستفاده `AppData` در Contract Test فاز ۱۸۲ حذف شد تا ESLint با `--max-warnings=0` Gate را متوقف نکند.

