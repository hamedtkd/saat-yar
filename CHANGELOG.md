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
