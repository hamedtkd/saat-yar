# فاز ۱۷۷ — تکمیل i18n در Setup / Settings / System Surfaces

## Baseline

- Branch هدف: `dev`
- Baseline معتبر: `581f153` (`feat(i18n): localize business workflows`)
- Package: `2.3.2`
- AppData Schema: `v17`
- Migration: ندارد
- Dependency جدید: ندارد

## هدف

بستن بزرگ‌ترین شکاف باقی‌مانده i18n بعد از فازهای ۱۷۴ تا ۱۷۶، بدون تغییر قرارداد داده یا منطق دامنه. این فاز Settings، Onboarding، Import، About و Surfaceهای سیستمی/PWA را از متن‌های مستقیم فارسی جدا می‌کند و همان قرارداد `fa-IR / RTL` و `en / LTR` را ادامه می‌دهد.

## تغییرات اصلی

- Catalog تایپ‌شده `lib/i18n/system.ts` برای متن‌های Setup، Settings، Import، About، Device Transfer، PWA و پیام‌های سیستمی اضافه شد.
- `useSystemUi()` روی `useLocaleUi()` ساخته شده و با `useMemo` هویت Callbackها را بین Renderهای عادی ثابت نگه می‌دارد.
- تمام هفت مرحله Onboarding، مسیر Re-entry و Import داخلی از Catalog سیستم استفاده می‌کنند؛ Guard دکمه‌های Import با `type="button"` از فازهای ۱۷۳/۱۷۴ حفظ شده است.
- Import Wizard، About، PWA Experience، Multi-tab banner و تمام کارت‌های Settings ترجمه‌پذیر شدند.
- Settings Navigation دیگر Label/Group فارسی موازی نگه نمی‌دارد؛ Labelها از Catalog اصلی و Keywordهای فنی مستقل از زبان استفاده می‌شوند.
- Device Transfer شامل QR، Session status، Preview، History و Stepper به Locale فعال متصل شد و Helperهای Session/QR با Default فارسی سازگار باقی ماندند.
- Toastهای Persistence، Backup، Attendance، Multi-tab و Notification و متن Notificationهای native از Locale فعال پیروی می‌کنند.
- `AppToast` علاوه بر کلیدواژه‌های تاریخی فارسی، پیام‌های موفق/خطا/هشدار انگلیسی را هم برای Tone تشخیص می‌دهد.
- Formatter عدد حالا `Intl.NumberFormatOptions` می‌پذیرد و نمایش مدت به کلمات (`durationWords`) برای فارسی و انگلیسی مشترک شده است.
- `LocaleRuntime` علاوه بر `html.lang/dir`، Title Routeهای Runtime را هنگام تغییر Locale/Route هماهنگ می‌کند.

## Metadata / PWA

Metadata استاتیک و Manifest نصب همچنان Canonical فارسی باقی می‌مانند تا قراردادهای Release 2.3.2 و SEO/PWA تاریخی بدون تغییر بمانند. در Runtime، عنوان Route بر اساس Locale فعال تغییر می‌کند. Audit نهایی Metadata/Manifest دو Locale در فاز ۱۷۸ انجام می‌شود.

## Browser contract

Production Browser Smoke در حالت English/LTR علاوه بر Today/Month/Reports و Business routes، این مسیرها را نیز بررسی می‌کند:

- `/settings`
- `/import`
- `/about`
- Re-entry واقعی `/settings` → `/onboarding` → `/settings`

Smoke روی متن انگلیسی، جهت LTR و Runtime title تأیید می‌گیرد و بعد Locale را مثل قبل به Persian/RTL بازمی‌گرداند تا Journeyهای تاریخی فارسی بدون تضعیف ادامه پیدا کنند.

## قراردادهای ایمنی

- AppData و Schema بدون تغییر هستند.
- هیچ Migration یا Dependency جدیدی اضافه نشده است.
- Domain valueها و Storage keyها ترجمه نشده‌اند.
- Static metadata منتشرشده بازنویسی نشده است.
- Browser selectorهای interaction تا جای ممکن ساختاری هستند و به Copy ترجمه‌شده وابسته نیستند.
- Helperهای قدیمی با Default `fa-IR` سازگاری عقب‌رو را حفظ می‌کنند.

## فاز بعدی

فاز ۱۷۸ یک Closure/Audit محدود برای i18n است: جست‌وجوی سراسری Hard-coded UI، مرور LTR/RTL geometry، Metadata/PWA policy، CSV/Print و Release readiness پیش از تصمیم Merge به `main`.

## Revision 2 — TypeScript contract hotfix

پس از اجرای gate روی محیط واقعی پروژه، دو خطای TypeScript در تحویل اولیه پیدا شد و بدون تغییر دامنه محصول اصلاح شد:

- نگاشت نام روزهای هفته در `work-schedule-editor.tsx` اکنون از کلیدهای واقعی `WeekdayKey` یعنی `saturday` تا `friday` استفاده می‌کند؛ کلیدهای کوتاه `sat` تا `fri` با قرارداد دامنه سازگار نبودند.
- مقدار محلی `message` در `translateSystem` به‌صورت صریح `string` تایپ شد تا نتیجه `replaceAll()` با union literal تولیدشده از catalog ناسازگار نباشد.
- تست Phase 177 برای هر دو قرارداد به‌روزرسانی شد تا این دو regression دوباره وارد بسته نشوند.

هیچ تغییری در AppData Schema، migration، dependency، نسخه package یا رفتار runtime ایجاد نشده است.

## Revision 3 — پایداری عنوان Runtime و تشخیص Browser Smoke

در Gate واقعی Revision 2، TypeScript/Lint/746 تست/Build سبز شدند اما Production Browser Smoke روی Settings انگلیسی timeout شد. بدنه Settings به انگلیسی/LTR رندر شده بود، اما قرارداد عنوان Runtime می‌توانست با metadata استاتیک فارسی Next.js race داشته باشد.

Revision 3:
- عنوان Runtime را بدون polling با `MutationObserver` روی `<head>` پایدار نگه می‌دارد تا metadata استاتیک منتشرشده همچنان canonical فارسی بماند اما عنوان تب پس از انتخاب locale فعال دوباره به فارسی برنگردد.
- assertion Settings را به دو surface واقعی `#settings-onboarding` و `#settings-device-transfer` scope می‌کند؛ متن ترجمه‌شده همچنان الزام تست است و Harness ضعیف نشده است.
- snapshot خطای Browser حالا `document.title` را ثبت می‌کند و escaping regex whitespace اصلاح شده تا حرف `s` از diagnostics حذف نشود.
- Schema، migration، dependency و نسخه package تغییری نکرده‌اند.

## Revision 4 — Workspace-aware business browser matrix

در Gate واقعی Revision 3، تست‌های واحد `746/746`، TypeScript، Lint و Build سبز بودند اما Production Browser Smoke هنگام رفتن مستقیم به `/projects` به `/today` برگشت. Snapshot دقیق نشان داد Workspace همچنان `Employee` است. این رفتار محصول صحیح است: `RouteGuard` در حالت Employee مسیرهای `clients/projects/invoices` را مجاز نمی‌داند.

Revision 4 به‌جای دورزدن Guard یا ضعیف‌کردن assertion:
- روی Workspace Switcher hookهای ساختاری و مستقل از ترجمه اضافه می‌کند (`data-workspace-switch-trigger` و `data-workspace-mode-option`).
- Browser Smoke قبل از Matrix مسیرهای Business از طریق همان Switcher واقعی به `Hybrid` می‌رود، سپس Clients/Projects/Invoices/Leave انگلیسی را بررسی می‌کند.
- پس از Matrix، Workspace را از همان UI دوباره به `Employee` برمی‌گرداند تا Journey تاریخی Settings/PWA/Today با همان mode انتخاب‌شده در Onboarding ادامه پیدا کند.
- تست Phase 177 این قرارداد را بدون افزودن Test case جدید پوشش می‌دهد؛ شمارش مورد انتظار همچنان `746/746` است.

پیام‌های `PHONE_REGISTRATION_ERROR` و `DEPRECATED_ENDPOINT` مربوط به سرویس‌های پس‌زمینه Chrome هستند و علت این failure نبودند.
