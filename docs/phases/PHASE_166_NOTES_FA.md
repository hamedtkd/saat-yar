# فاز ۱۶۶ — Route مستقل آنبوردینگ

## هدف

جداکردن راه‌اندازی اولیه ساعت‌یار از صفحه `Today` و تبدیل آن به Route واقعی `/onboarding`، بدون تغییر قرارداد داده، Schema یا محتوای مراحل فعلی آنبوردینگ.

در نسخه‌های قبلی، Component آنبوردینگ به‌صورت Overlay سراسری داخل `SaatyarShell` رندر می‌شد. در نتیجه کاربر عملاً روی Route صفحه امروز قرار داشت، هرچند فقط آنبوردینگ را می‌دید. این فاز مسئولیت Route و App Shell را شفاف می‌کند.

## رفتار نهایی

- کاربر جدید با `settings.onboarded=false` از `/`، `/today` یا هر Route محصول به `/onboarding` هدایت می‌شود.
- `/onboarding` یک Route واقعی Static Export است و UI فعلی چهارمرحله‌ای را reuse می‌کند.
- Shell آنبوردینگ Sidebar، Header، Bottom Navigation و PWA bannerهای داشبورد را رندر نمی‌کند.
- بعد از تکمیل مرحله آخر و `onboarded=true`، Route Guard کاربر را به اولین Route مجاز Workspace (در حال حاضر `/today`) می‌فرستد.
- کاربری که قبلاً Onboard شده، با ورود مستقیم به `/onboarding` به Workspace برگردانده می‌شود.
- Route آنبوردینگ عمداً در Sitemap عمومی قرار نمی‌گیرد و `robots` آن `noindex` است.
- محتوای مراحل، Modeها، Schedule و Privacy در این فاز تغییر نمی‌کند.

## Browser Gate

Production Browser Smoke اکنون صریحاً بررسی می‌کند که Boot با Storage خالی ابتدا به `/onboarding` برسد، مراحل فعلی را تکمیل کند و سپس به `/today` منتقل شود.

## داده و سازگاری

- Package: `2.3.2`
- AppData schema: `v17`
- Migration: ندارد
- Dependency جدید: ندارد
- Tag `v2.3.2`: تاریخی و immutable؛ این فاز Tag را تغییر نمی‌دهد.

## ادامه نقشه راه آنبوردینگ

پس از تثبیت Route مستقل، توسعه آنبوردینگ می‌تواند بدون وابستگی به Today ادامه پیدا کند:

1. Resume/Progress واقعی برای راه‌اندازی نیمه‌تمام و امکان شروع دوباره از Settings.
2. مرحله ورود داده برای کاربرانی که قبلاً در ابزار دیگری ساعت، پروژه یا اطلاعات مالی داشته‌اند؛ ابتدا Backup ساعت‌یار و سپس Importهای ساخت‌یافته مثل CSV با Preview قبل از اعمال.
3. شخصی‌سازی مراحل بر اساس Employee/Freelancer/Hybrid تا کاربر فقط تنظیمات مرتبط را ببیند.
4. هماهنگی همین Wizard با برنامه i18n و نسخه انگلیسی/LTR در فازهای آینده.

## Gate مورد انتظار

این فاز ۶ تست قرارداد جدید اضافه می‌کند. Baseline Release قبلی ۶۳۹ تست بوده است، بنابراین انتظار:

```text
tests 645
pass 645
fail 0
```


## Revision 2 — سازگاری تست تاریخی Phase 42

تست تاریخی Phase 42 قبلاً Dependencyهای Route Guard را دقیقاً به شکل `mode, pathname, ready, router` بررسی می‌کرد. با مستقل‌شدن Route آنبوردینگ، `onboarded` یک Dependency واقعی و لازم برای همان Effect است. Revision 2 فقط Assertion تاریخی را با قرارداد جدید همگام می‌کند و هیچ Runtime behavior، Schema، Migration یا Dependency جدیدی اضافه نمی‌کند.
