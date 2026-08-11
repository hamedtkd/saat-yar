# فاز ۱۷۴ — i18n Core Foundation و Locale Local-first

## هدف

زبان دوم را به‌صورت یک تغییر عظیم و پرریسک روی همه صفحه‌ها فعال نمی‌کنیم. این فاز فقط زیرساخت واقعی و قابل‌اعتماد i18n را می‌سازد تا فازهای بعدی بتوانند صفحه‌ها را بدون دست‌زدن به مدل داده یا شکستن RTL فعلی ترجمه کنند.

## قرارداد Locale

- Localeهای پشتیبانی‌شده در این فاز: `fa-IR` و `en`.
- فارسی Locale پیش‌فرض و تجربه اصلی محصول باقی می‌ماند.
- فارسی `rtl` و انگلیسی `ltr` است.
- Locale در کلید مستقل `saatyar-locale-v1` داخل `localStorage` ذخیره می‌شود.
- Locale عمداً داخل `AppData` نیست؛ بنابراین Backup/Restore، Schema و Migration را تغییر نمی‌دهد.
- تغییر زبان از Settings بدون Reload اجباری و بدون دست‌زدن به Draftهای تنظیمات انجام می‌شود.
- Bootstrap داخل `<head>` قبل از Hydration مقدار ذخیره‌شده را روی `html[lang]` و `html[dir]` اعمال می‌کند تا Reload انگلیسی با Flash اولیه RTL شروع نشود.

## سطح ترجمه‌شده در Phase 174

این فاز Foundation است و نه ترجمه کامل محصول. سطح‌های زیر وارد Catalog تایپ‌شده شدند:

- Shell و Loading state
- Header و Route title
- Sidebar و Mobile Bottom Navigation
- Workspace Switcher
- Theme toggle و Save status
- Profile menu
- Footer
- عنوان/Sectionهای اصلی Settings
- Settings navigation/search
- کارت جدید «زبان و جهت»

صفحه‌های دامنه مثل Today، Month، Reports، Clients، Projects، Invoices و Leave همچنان در فاز ۱۷۵ به Catalog منتقل می‌شوند. این جداسازی عمدی است تا هر Gate blast radius محدود و قابل‌تشخیص داشته باشد.

## LTR Layout

Sidebar از مختصات منطقی `start` استفاده می‌کند؛ بنابراین در فارسی سمت راست و در انگلیسی سمت چپ قرار می‌گیرد. قرارداد `shell-main-offset` نیز برای `html[dir="ltr"]` معکوس می‌شود تا محتوای دسکتاپ کنار Sidebar انگلیسی متوازن بماند.

## Browser Smoke

Production Browser Smoke بعد از Journey آنبوردینگ و Import:

1. وارد Settings می‌شود.
2. Locale را روی English می‌گذارد.
3. `html.lang=en`، `html.dir=ltr`، متن انگلیسی Shell/Settings و هندسه Sidebar را بررسی می‌کند.
4. یک Reload واقعی انجام می‌دهد و ماندگاری Locale را از Local Storage تأیید می‌کند.
5. Locale را دوباره روی فارسی می‌گذارد و `fa/rtl` را بررسی می‌کند.
6. سپس Journeyهای PWA و تاریخ موجود را با فارسی ادامه می‌دهد تا تست‌های تاریخی شل نشوند.

## داده و Release

- Package version: `2.3.2`
- AppData: Schema v17
- Migration جدید: ندارد
- Dependency جدید: ندارد
- Release tagهای قبلی: بدون تغییر

## مرحله بعد

Phase 175 پوشش Catalog را به Today/Month/Reports و جریان‌های Employee/Freelancer گسترش می‌دهد و سپس Validation/Toast/Print/CSV/PWA metadata به‌صورت مرحله‌ای سیاست‌گذاری می‌شوند.

## Revision 2 — حفظ Hotfix مرحله Import آنبوردینگ

بسته اولیه Phase 174 ناخواسته از Artifact قدیمی Phase 173 ساخته شده بود و Hotfix محلی `b2ee6b1` را که دکمه‌های Import داخلی را `type="button"` می‌کرد، بازگردانده بود. در نتیجه `data-import-apply` داخل فرم Onboarding می‌توانست Submit والد را زودتر از دکمه نهایی اجرا کند و Browser Smoke با `Button not found: شروع ساعت‌یار` متوقف شود. Revision 2 همه Actionهای Import قابل‌استفاده داخل فرم را صریحاً non-submit می‌کند و تست رگرسیون Phase 173 را برمی‌گرداند. قرارداد i18n Phase 174 تغییری نکرده است.
