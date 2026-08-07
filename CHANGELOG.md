## [Unreleased]

### Fixed

- همگام‌سازی نمایش `TimePicker` با مقدار کنترل‌شده بعد از توزیع مجدد هدف هفتگی؛ ساعت پایان دیگر مقدار قدیمی را کنار هدف جدید نشان نمی‌دهد.
- همگام‌سازی `weeklyMinutes` با ویرایش مستقیم برنامه روزها و حذف warning بلااستفاده فاز ۱۲۶.
- رفع crash زمان اجرا در Workspace Switcher ناشی از استفاده نادرست `SelectLabel` رادیکس و بهبود تشخیص فوری Runtime exception در Production Browser Smoke.


### اصلاح شد

- Production browser smoke now starts from a clean `about:blank` target, clears origin storage before boot, and follows structural onboarding step markers with timeout diagnostics.
- همگام‌سازی Anchorهای Settings بدون setState داخل Effect انجام می‌شود و Deep Linkهای Profile همچنان از Unsaved Navigation Guard عبور می‌کنند.
- دو قرارداد تست قدیمی ناوبری با معماری Hash-based فاز ۱۲۱ هماهنگ شدند.

### تغییر کرد

- نمایش هدف خالص روز از عدد اعشاری به ساعت و دقیقه دقیق تغییر کرد و چیدمان یادآوری استراحت خواناتر شد.
- Footer به صفحه جدید «درباره و راهنما» با GitHub، حمایت مالی، LinkedIn، Telegram و راهنمای سریع متصل شد.
- Bottom Navigation موبایل Active state خواناتر و هم‌اندازه دریافت کرد و underline کم‌کنتراست حذف شد.
- Navigation داخلی Settings همه کارت‌های اصلی، از جمله انتقال بین موبایل و لپ‌تاپ، را نشان می‌دهد و Section فعال را هنگام Scroll دنبال می‌کند.
- Search و Navigation تنظیمات از یک مدل مقصد مشترک استفاده می‌کنند تا Deep Linkها و برچسب‌ها از هم جدا نشوند.
- کنترل‌های Header از نظر ارتفاع، Radius، Surface و اندازه آیکن یکدست شدند؛ Profile Trigger به Avatar دایره‌ای ارتقا یافت و لوگوی Sidebar میانبر امن صفحه امروز شد.
- Header با منوی پروفایل محلی واقعی، وضعیت ذخیره موقت و Workspace Switcher توضیح‌دار ساده‌تر شد.
- Hero صفحه امروز ناوبری یک‌کلیکی روز قبل/بعد، برگشت سریع به امروز و عنوان مناسب برای روزهای تاریخی دریافت کرد.
- صفحه تنظیمات جستجوی سریع، Anchorهای مستقیم برای کارت‌های مهم و ناوبری داخلی هماهنگ با ترتیب واقعی محتوا دریافت کرد.
- لایه Border اضافی گروه‌های Settings کاهش یافت و کارت پروفایل محلی خواناتر شد.

## [2.2.0] - 2026-08-07

### افزوده شد

- موتور Rule-based حقوق با روش‌های ماهانه متناسب، ماهانه ثابت، ساعتی و روزکاری، Preview زنده و Breakdown قابل توضیح.
- Policy پایدار حقوق در AppData Schema v17 با Migration سازگار از v16.
- انتقال مستقیم و رمزنگاری‌شده AppData میان دستگاه‌ها با AES-GCM، SHA-256، Preview تعارض و Merge/Replace صریح.
- Pairing مستقیم WebRTC DataChannel و QR محلی چندفریمی بدون سرویس QR یا دیتابیس مرکزی.
- تاریخچه محدود metadata-only برای انتقال دستگاه و Browser E2E انتقال چند chunk رمزنگاری‌شده همراه ACK.
- Capture تکرارپذیر Screenshot/GIF با Fixture نمایشی مستقل از داده واقعی کاربر.

### تغییر کرد

- زبان طراحی نهایی چندتمی به Today، Month، Reports، Settings، Leave، Clients، Projects و Invoices گسترش یافت.
- هویت نصب PWA، آیکن‌های any/maskable، Install UX، Offline state و Update Prompt تکمیل شد.
- گزارش‌ها و حقوق روز از Policy ذخیره‌شده حقوق استفاده می‌کنند و نتیجه محاسبه را شفاف‌تر نمایش می‌دهند.
- README فارسی و انگلیسی با رسانه‌های واقعی محصول، قابلیت‌های حقوق و انتقال دستگاه و اسناد Release 2.2.0 به‌روزرسانی شدند.

### اصلاح شد

- Offline shell با precache دارایی‌های تولیدشده Next.js و fallback شبکه محدودشده مقاوم‌تر شد.
- مشکلات TypeScript 5.9 در WebCrypto BufferSource و narrowing جریان Pairing رفع شدند.
- QR scanner cleanup و lint فایل‌های vendored QR بدون تضعیف قوانین عمومی ESLint اصلاح شد.
- Smoke آفلاین Production و Browser Pairing واقعی روی Windows/Chromium به مسیر قابل تکرار تبدیل شدند.

## [2.1.0] - 2026-08-07

### افزوده شد

- سطل بازیابی رکوردها با نگهداری ۳۰روزه، بازیابی گروهی و پاک‌سازی رکوردهای منقضی.
- قفل مالکیت تایمر زنده، جزئیات دستگاه، انتقال کنترل و تاریخچه رخدادهای همگام‌سازی چند Tab.
- Audit قرارداد `AppData` در Factory، Migration، Backup، Recovery، Snapshot و Merge با گزارش Missing، Unexpected و Invalid.
- تست مرورگر Production روی Static Export واقعی برای Onboarding، Route امروز و تغییر تاریخ.
- Release Audit ماشینی برای تطبیق نسخه Package، Lockfile، Schema، Node، Changelog، Release Notes و ترتیب Gateها.
- README انگلیسی، راهنمای عیب‌یابی Windows و npm، ماتریس سازگاری مرورگر و راهنمای انگلیسی Agentها.

### تغییر کرد

- تمام کارت‌های اصلی تنظیمات به قرارداد مشاهده، ویرایش، ذخیره و انصراف مستقل منتقل شدند.
- هشدارهای عملیات مخرب و خروج با Draft ذخیره‌نشده به Alert Dialog رسمی Radix/shadcn منتقل شدند.
- تست‌های دارای `WorkRecord` دست‌ساز به Fixture مشترک Type-safe نزدیک‌تر شدند.
- Quality Pipeline اکنون Dependency preflight، Schema audit، Release audit، Build و Browser smoke را اجرا می‌کند.
- نسخه Package به `2.1.0` و قرارداد داده فعال به Schema v16 ارتقا یافت.

### اصلاح شد

- جلوگیری از ورود متادیتای Envelope فایل Backup به State اصلی `AppData`.
- جلوگیری از فعال‌سازی ناخواسته ذخیره خودکار هنگام وجود Draft در کارت‌های دیگر.
- مقاوم‌سازی پاک‌سازی پروفایل موقت Chrome و Edge در Windows در برابر قفل‌های کوتاه‌مدت `EBUSY`.
- خواناترشدن شکست Schema Audit و نمایش همه مسیرهای خراب در یک اجرای CI.

## [2.0.0] - 2026-08-05

### افزوده شد

- بازطراحی کامل Spotify-inspired با تم روشن، تاریک، System و پالت سفارشی.
- Sidebar دسکتاپ، Top Bar و Bottom Navigation موبایل.
- برنامه کاری روزانه، شیفت شب، تعطیلات رسمی و Override دستی.
- موتور حقوق، فیش حقوقی، مزایا، کسورات و Privacy Mode سراسری.
- هزینه و سود پروژه، هشدار بودجه و فاکتور قابل چاپ.
- ذخیره مقاوم، Snapshot بازیابی و Migration نسخه‌بندی‌شده تا Schema ۱۳.
- تست‌های معماری، Workflow، Theme Compliance و Accessibility.

### اصلاح شد

- حذف پیاده‌سازی‌های Legacy تکراری Picker و Storage.
- استفاده از نسخه مرکزی Schema در تست Backup و جلوگیری از stale test.
- استانداردسازی Design Tokenها، نمودارها، فرم‌ها، جدول‌ها و Modalها.

## [1.2.0] - 2026-08-02

### Added

- ویرایش مستقیم ساعت شروع، پایان و مدت ناهار
- ویرایش، افزودن، حذف و تعیین وضعیت باحقوق برای هر وقفه
- موتور مستقل محاسبه حقوق روزانه و تست‌های آن
- اسناد مشارکت، امنیت و مجوز MIT

### Changed

- تمام کلاس‌های Tailwind از Style Registry مرکزی به Componentها منتقل شدند
- محاسبه کارکرد خالص و وقفه‌های باحقوق/بدون‌حقوق یکپارچه شد
- README و راهنمای معماری برای انتشار Open Source بازنویسی شد

### Fixed

- حقوق روزانه اکنون از تقسیم حقوق ماهانه بر ۳۰ محاسبه می‌شود
- روز شروع‌نشده دیگر به اشتباه دارای کارکرد و درآمد نمایش داده نمی‌شود
- منطق تکراری موتور زمان و فایل‌های بلااستفاده حذف شد

## Unreleased — Phase 2

- Added a per-weekday work schedule with independent start, end, lunch and enabled state.
- Added overnight-shift support when the end time is earlier than the start time.
- Daily and monthly attendance targets now follow the selected date's schedule.
- Upgraded app-data schema to v5 with migration from legacy `workDays` settings.
- Added work-schedule unit tests.
- Added financial privacy mode to the planned UX phase: a global eye button will hide salary, income, rates and payroll totals before sharing the screen.

## فاز ۶ — امور مالی پروژه

- ثبت و مدیریت هزینه‌های پروژه
- محاسبه درآمد، هزینه، سود خالص و حاشیه سود
- هشدار نزدیک‌شدن یا عبور از بودجه زمانی
- Migration داده از Schema 8 به 9

## Phase 12 - Build safety and reusable UI audit

- Fixed the Vercel type-check failure in the danger-zone reset by using a complete AppData factory.
- Added `createInitialData` as the single source of truth for blank application state.
- Split the 376-line app header into focused navigation, actions and workspace-switcher components.
- Added architecture checks for the 250-line layout limit and safe data reset.
- Added a reusable-component audit and extraction roadmap.

## Phase 16 - Report overview decomposition and import safety

- Split the oversized reports page into focused summaries, actions and a report-summary hook.
- Centralized payroll masking through `PrivateMoney` and reused `SurfaceCard`.
- Added a local import resolution check and included it in the main validation command.
- Added architecture coverage to keep report overview modules below 250 lines.
- Removed invalid nested JSX from the payroll summary section.
## فاز ۲۰ — بازآرایی نمای ماه

- جدول ماه به نسخه‌های دسکتاپ، موبایل و ابزارهای مشترک تقسیم شد.
- نمودار هفتگی به Hook داده، نمودار، Tooltip، خلاصه و Empty State تقسیم شد.
- استفاده از SurfaceCard و EmptyState در نمای ماه استاندارد شد.
- تست معماری سقف ۲۵۰ خط برای ماژول‌های ماه اضافه شد.


## فاز ۲۳

- بازآرایی جزئیات پروژه و فاکتورها به کامپوننت‌ها و Hookهای متمرکز.
- یکپارچه‌سازی نمایش اطلاعات مالی با PrivateMoney.
- افزودن تست معماری صفحات تجاری.
