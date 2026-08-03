## فاز ۱۰ — ذخیره مقاوم و بازیابی محلی

- نمایش وضعیت واقعی ذخیره خودکار در Header
- Snapshot بازیابی مستقل پیش از نوشتن در IndexedDB
- بازیابی اضطراری هنگام شکست ذخیره اصلی
- تلاش دوباره، ساخت دستی، بازگردانی و حذف نسخه بازیابی
- تست‌های مستقل Recovery


## فاز ۹

- داشبورد هوشمند امروز و نمایش زمان باقی‌مانده
- اعلان‌های محلی مرورگر برای تایمر و پایان روز
- اصلاح پوشش سراسری حالت مخفی‌سازی اطلاعات مالی
- migration نسخه ۱۰ به ۱۱


## فاز ۸

- تقویم ماهانه تعاملی و پنل جزئیات روز
- فیلتر بازه تاریخ و وضعیت رکوردها
- اعمال فیلترها روی خروجی گزارش

# تاریخچه تغییرات

این پروژه از قالب Keep a Changelog و نسخه‌گذاری معنایی پیروی می‌کند.

## [Unreleased]

### Added

- زیرساخت Migration مرحله‌ای و نسخه‌بندی‌شده برای داده‌های Local-first
- Snapshot نسخه‌بندی‌شده برای ذخیره‌سازی IndexedDB
- تست‌های بازگشت‌ناپذیری Migration و رد نسخه‌های جدیدتر ناسازگار
- مستندات معماری و سیاست تغییر Schema داده

### Changed

- Normalisation داده از ابزارهای قالب‌بندی جدا شد
- Backupهای قدیمی هنگام Import به نسخه جاری منتقل می‌شوند
- داده‌های قدیمی IndexedDB و Local Storage پس از Migration با فرمت جدید ذخیره می‌شوند

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
