## [Unreleased]

- افزودن Policy قابل‌سفارشی‌سازی حقوق به Settings و ارتقای AppData به Schema v17 با Migration سازگار از v16.
- اتصال گزارش ماهانه و حقوق روز به موتور Rule-based و نمایش Breakdown شفاف محاسبه.

### Fixed

- Hardened the offline PWA shell by precaching generated Next.js assets and testing a real CDP page reload while offline.
- Made product media capture start from a clean browser origin and report actionable runtime exceptions instead of generic promise failures.


### افزوده شد

- موتور Rule-based محاسبه حقوق با روش‌های ماهانه متناسب، ماهانه ثابت، ساعتی و روزکاری و Breakdown قابل توضیح.

- هویت برند جدید، FavIcon هماهنگ با Accent، متادیتای Routeها و کارت اشتراک‌گذاری Open Graph.
- Manifest رسمی App Router، آیکن‌های نصب PWA و Service Worker ثبت‌شده در Root Layout.

### تغییر کرد

- لوگوی برنامه اکنون در تمام تم‌ها از Accent فعال استفاده می‌کند.
- Cache strategy PWA برای ناوبری و Assetهای ثابت تفکیک و مقاوم‌تر شد.

### برنامه‌ریزی‌شده

- افزودن اسکرین‌شات‌های واقعی و به‌روز به README.
- تهیه دموی کوتاه Onboarding، ثبت روز و گزارش.
- جایگزینی تدریجی تست‌های Source-based شکننده با تست رفتاری.

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
