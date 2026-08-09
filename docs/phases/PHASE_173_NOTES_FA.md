# فاز ۱۷۳ — Personalized Onboarding

این فاز جریان راه‌اندازی اولیه را از یک Wizard یکسان برای همه کاربران به مسیر متناسب با Workspace تبدیل می‌کند، بدون تغییر Schema یا پاک‌کردن داده‌های موجود.

## قرارداد مسیرها

- مرحله ۱ و ۲ برای همه مشترک‌اند: نام و انتخاب نوع استفاده.
- **Employee** در مرحله ۳ برنامه کاری واقعی و در مرحله ۴ حقوق/ضرایب را می‌بیند.
- **Freelancer** به‌جای تنظیمات کارمندی، در مرحله ۳ مشتری اول و در مرحله ۴ پروژه، نرخ ساعتی و بودجه زمانی را می‌بیند. هر دو مرحله اختیاری‌اند.
- **Hybrid** در مرحله ۳ برنامه کاری کارمندی را نگه می‌دارد و مرحله ۴ را به تنظیم درآمد ترکیبی تبدیل می‌کند: حقوق ماهانه + شروع سریع مشتری/پروژه فریلنسری.
- مرحله ۵ Appearance و مرحله ۶ توضیح Local-first/Privacy برای همه مشترک می‌مانند.
- مرحله ۷ Import اختیاری است و همان موتور امن Phase 171 را داخل Onboarding استفاده می‌کند.

## Import داخل Onboarding

Backup و CSV داخل خود Route آنبوردینگ Preview می‌شوند و لازم نیست کاربر به `/import` برود. هنگام Import، مقدار `settings.onboarded` عمداً از وضعیت فعلی حفظ می‌شود تا Restore/Replace نتواند کاربر جدید را قبل از زدن دکمه نهایی از Wizard خارج کند. تکمیل Onboarding فقط در Submit مرحله ۷ اتفاق می‌افتد.

## ایمنی داده

ساخت مشتری و پروژه فریلنسری اختیاری و duplicate-safe است. نام‌های تکراری دوباره ساخته نمی‌شوند، پروژه فقط با Client معتبر ایجاد می‌شود و تنظیمات Employee هنگام ساخت Workspace فریلنسری دست‌نخورده می‌مانند. Re-entry از Settings نیز مانند قبل هیچ رکورد، پروژه، مرخصی یا داده مالی را Reset نمی‌کند.

## سازگاری و Migration

- Package: `2.3.2`
- AppData Schema: `v17`
- Migration: ندارد
- Dependency جدید: ندارد
- کلید Progress همان `saatyar-onboarding-step-v1` باقی مانده و قدم‌های قدیمی ۱ تا ۶ معتبرند؛ فقط قدم اختیاری ۷ به دامنه افزوده شده است.

## Browser contract

Production Browser Smoke مسیر Employee را تا Schedule/Payroll/Appearance ادامه می‌دهد، مرحله Import داخلی را باز می‌کند، یک CSV مشتری را Preview و Apply می‌کند، تأیید می‌کند که قبل از Submit نهایی `onboarded=false` باقی مانده و سپس Onboarding را کامل می‌کند. Phase 171 همچنان Route مستقل `/import` را جداگانه تست می‌کند.


## Revision 2 — جلوگیری از submit ناخواسته داخل Import

در Gate واقعی Windows مشخص شد دکمه‌های داخلی پنل Import چون `type="button"` صریح نداشتند، هنگام reuse شدن داخل فرم Onboarding می‌توانستند submit پیش‌فرض HTML را فعال کنند و مرحله نهایی را زودتر از کلیک کاربر روی «شروع ساعت‌یار» تمام کنند. تمام actionهای داخلی Backup/CSV اکنون `type="button"` دارند و فقط CTA نهایی Onboarding با `type="submit"` و `data-onboarding-submit` فرم را تکمیل می‌کند. Browser smoke نیز پس از Import صریحاً باقی‌ماندن روی Step 7 و وجود CTA نهایی را بررسی می‌کند.
