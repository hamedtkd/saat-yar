# Phase 200 — Release Hardening & Scope Freeze

## هدف

Phase 200 فاز Feature Expansion نیست. هدف، بستن regressionها و آماده‌کردن baseline قابل اتکا برای RC بعدی است. AppData روی v21 می‌ماند و نسخه package هنوز 2.5.0 است؛ bump نسخه در Phase 201 انجام می‌شود.

## R1 — PWA identity + theme identity + locale date order

### PWA install identity

- نام کامل نصب به `Saatyar | ساعت یار` تغییر کرد تا هر دو نام انگلیسی و فارسی در metadata نصب حضور داشته باشند.
- `short_name` عمداً `Saatyar` باقی می‌ماند تا launcherهای کم‌عرض label فشرده و خوانا داشته باشند.
- `applicationName` و Apple web-app title نیز از همین identity استفاده می‌کنند.
- `dir` مانیفست روی `auto` قرار گرفت تا رشته دوزبانه با جهت ثابت RTL خراب نشود و shortcutهای فارسی نیز جهت خودشان را حفظ کنند.
- جست‌وجوی launcher/Start/Spotlight یک رفتار OS/browser است و Web App Manifest تضمین نمی‌کند هر دو alias حتماً index شوند؛ داشتن هر دو نام در `name` بهترین metadata استاندارد و کم‌ریسک برای این هدف است.

### Theme-aware brand

- BrandMark داخل اپ همچنان از `--accent` استفاده می‌کند و با preset/custom accent تغییر می‌کند.
- منطق تولید SVG favicon از ThemeRuntime به helper خالص `lib/brand-theme.ts` منتقل شد تا رفتار رنگی مستقیم تست شود.
- favicon و browser chrome/theme-color در runtime از accent فعال پیروی می‌کنند.
- آیکن نصب‌شده روی launcher عمداً dynamic نشده است: استاندارد PWA راه قابل اتکایی برای تغییر icon نصب‌شده بر اساس theme داخلی ذخیره‌شده در localStorage ارائه نمی‌کند. تغییر theme بعد از نصب نباید identity اپ را بشکند یا manifestهای چندگانه با رفتار مرورگر-وابسته ایجاد کند.

### Date ordering

`formatLocaleDate` برای تاریخ‌هایی که weekday + day + month دارند، ترتیب را صریح و مستقل از default نامناسب Intl می‌سازد:

- فارسی: `چهارشنبه، ۲۸ مرداد ۱۴۰۵`
- English/Gregorian: `Wednesday, August 19, 2026`
- English/Persian override: `Wednesday, Mordad 28, 1405 AP`
- فارسی/Gregorian override: `چهارشنبه، ۱۹ اوت ۲۰۲۶`

به این ترتیب زبان UI و تقویم انتخابی مستقل می‌مانند و نام ماه/روز از زبان مقابل وارد UI نمی‌شود.

## Safety boundary

- AppData: v21 بدون تغییر
- Migration: ندارد
- Dependency جدید: ندارد
- package version: 2.5.0 تا Phase 201
- Freelancer/Employee/Hybrid domain behavior: بدون تغییر
- Payroll/attendance/activity duration semantics: بدون تغییر

## Gate لازم برای بستن R1

- `npm run check:quality`
- `npm run check:release:audit`
- Production/Freelancer/Employee/Pairing browser gates
- `npm run audit:vercel`
- RTL/LTR visual QA روی 320/375/425/Desktop
- PWA reinstall/update sanity روی حداقل یک Chromium desktop/mobile target


## R2 — Regression gate hardening

- قرارداد تاریخی Phase 177 برای metadata حفظ شد: `app/manifest.ts` همچنان `SITE_NAME` را به عنوان fallback معتبر برای نام PWA می‌شناسد، در حالی که نام نصب اصلی `Saatyar | ساعت یار` باقی می‌ماند.
- برای Smoke تاریخ Today یک hook پایدار `data-date-picker-selected-label` اضافه شد تا تست به ساختار داخلی `strong` وابسته نباشد.
- بعد از بازگردانی زبان فارسی، Production Smoke حالا قبل از assert تاریخ منتظر `lang=fa`، `dir=rtl`، تقویم Persian و render شدن label تاریخ می‌ماند.
- علت اجرای Smoke نامعتبر R1: `check:quality` قبل از `build:vercel` روی تست تاریخی متوقف شده بود؛ بنابراین Smokeهای بعدی روی `out/` قبلی اجرا شده بودند.
- AppData همچنان v21، بدون migration و بدون dependency جدید.

## R3 — Work Calendar naming + PWA contract reconciliation

- نام محصولی صفحه `/month` از «ماه من» به **«تقویم کاری»** تغییر کرد؛ این عنوان هم برای ناوبری، عنوان صفحه، metadata، Help، وضعیت multi-tab و PWA shortcut استفاده می‌شود.
- نام انگلیسی همان سطح **`Work Calendar`** است؛ route فنی `/month` عمداً تغییر نکرد تا deep-link، static export و history موجود شکسته نشوند.
- متن‌های Google Calendar که به این سطح اشاره می‌کنند با نام جدید همگام شدند؛ عبارت‌های مفهومی مثل «ماه»، «هوشمندی ماه» و «گزارش ماهانه» که نام صفحه نیستند دست‌نخورده ماندند.
- Regression R2 در تست تاریخی Phase 105 رفع شد: `app/manifest.ts` دوباره قرارداد مستقیم `name: PWA_APP_NAME` را نگه می‌دارد. تست Phase 177 نیز به قرارداد فعلی اصلاح شد تا canonical site metadata را از bilingual PWA install identity جدا بسنجد، نه اینکه حضور `SITE_NAME` را داخل manifest تحمیل کند.
- Phase 200 یک تست رفتاری جدید برای نام `تقویم کاری / Work Calendar` در catalog و route metadata دارد؛ تست جدید source inspection انجام نمی‌دهد.
- AppData همچنان v21، بدون migration، dependency یا package-lock change است.

## R4 — Historical smoke label compatibility

- تغییر نام محصولی صفحه همچنان **تقویم کاری / Work Calendar** است و هیچ متن UI به «ماه من» برنگشته است.
- شکست R3 صرفاً از یک assertion تاریخی Phase 175 بود که نام diagnostic داخلی Browser Smoke را با عبارت قدیمی `English Month activity intelligence surface` بررسی می‌کرد.
- label داخلی waitFor به همان marker تاریخی برگردانده شد، اما predicate واقعی Smoke همچنان وجود `Work Calendar` در UI را assert می‌کند؛ بنابراین compatibility تست قدیمی بدون عقب‌گرد در نام محصول حفظ شده است.
- route `/month`، AppData v21، package 2.5.0، dependencyها و lockfile بدون تغییر باقی مانده‌اند.

## R5 — Final release hardening

- یک audit اجرایی جدید با نام `audit:hardening` به Quality Gate اضافه شد. این audit نبودن `eval`/`new Function`/`document.write`، نبود persistent storage برای Google OAuth access token، نبود لینک `_blank` بدون `noreferrer/noopener` و محدود ماندن `dangerouslySetInnerHTML` به دو bootstrap بازبینی‌شده Theme/Locale را بررسی می‌کند.
- Vercel برای تمام routeها headerهای `nosniff`، `DENY` frame policy، `strict-origin-when-cross-origin`، Permissions Policy محدود به camera روی same-origin و HSTS یک‌ساله دریافت کرد. برای `sw.js` و `manifest.webmanifest` نیز revalidation صریح فعال شد تا update و identity جدید PWA پشت cache قدیمی نماند.
- `audit:vercel` اکنون همین header contract و PWA revalidation را نیز بررسی می‌کند.
- یک behavioral suite جدید مسیر واقعی Migration `v17 -> v21`، Backup round-trip با `workProjects`/Activity title و Device Transfer merge را پوشش می‌دهد؛ تست جدید source inspection ندارد.
- Production Browser Smoke ماتریس responsive فارسی را برای Work Calendar/Leave/Settings روی 360/375/425px اجرا می‌کند و Work Calendar انگلیسی LTR را نیز روی 375px می‌سنجد. 320px همچنان در Employee/Freelancer Browser Smoke مالکیت مستقیم دارد.
- command تجمیعی `npm run check:release:full` برای Phase 201 اضافه شد؛ قرارداد تاریخی `check:release` دست‌نخورده مانده است.
- تغییر business logic، AppData، payroll، attendance یا timer در R5 وجود ندارد؛ Schema همچنان v21 و package version تا Phase 201 برابر 2.5.0 است.

## شرط بستن Phase 200

1. `npm run check:quality` شامل `audit:hardening` سبز باشد.
2. `npm run check:release:audit`، Production/Freelancer/Employee/Pairing Browser Smoke و `npm run audit:vercel` سبز باشند.
3. Visual QA نهایی در RTL/LTR، Light/Dark و 320/360/375/425/Desktop blocker نداشته باشد.
4. سپس Scope Freeze فعال می‌شود و هر قابلیت جدید به backlog بعد از 2.6.0 منتقل خواهد شد.

## R6 — Historical 425px viewport contract compatibility

- شکست R5 محصولی نبود؛ `957/958` تست سبز بود و تنها assertion تاریخی Phase 182 انتظار داشت literal قدیمی `width: 425, height: 608` هنوز در Production Browser Smoke وجود داشته باشد.
- ماتریس responsive فارسی به آرایه صریح viewportها تبدیل شد: `360x608`، `375x608` و `425x608`. رفتار واقعی R5 بدون کاهش coverage حفظ شده و قرارداد تاریخی 425px نیز دوباره قابل مشاهده است.
- هیچ تغییر UI، business logic، AppData، dependency، package version یا lockfile در R6 وجود ندارد.
