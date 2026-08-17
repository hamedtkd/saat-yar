# Phase 185 — GitHub-style Activity Graph & Month Intelligence

Baseline توسعه: `49c517f` — `feat(analytics): add privacy-safe product analytics`

## مسئله

صفحه «ماه من» پیش از این تقویم وضعیت، نمودار تجمیعی روزهای هفته و جدول رکوردها را داشت، اما برای پاسخ سریع به این سؤال‌ها باید چند سطح مختلف را خواند: شدت واقعی کار در طول ماه کجا متمرکز بوده، چند روز پشت‌سرهم فعال بوده‌ایم و سهم اضافه‌کار/کسری ماه چه الگویی دارد.

## تغییرات اصلی

- یک Heatmap شبیه GitHub به صفحه Month اضافه شد که شدت هر روز را فقط از `worked` واقعی و Target همان روز محاسبه می‌کند.
- Heatmap از Calendar فعال برنامه پیروی می‌کند و با هر دو حالت `Persian/Gregorian` همان ماه انتخاب‌شده را می‌سازد؛ Calendar موازی یا تاریخ ذخیره‌شده جدیدی ایجاد نمی‌شود.
- شدت خانه‌ها پنج سطح دارد: بدون کار، کمتر از ۲۵٪ Target، کمتر از ۵۰٪، تا ۱۰۰٪ و بالاتر از Target. روز با Target صفر ولی کار واقعی در بالاترین سطح Activity قرار می‌گیرد.
- Tooltip هر خانه تاریخ Locale-aware، کارکرد واقعی و تراز همان روز را نشان می‌دهد.
- Grid با صفحه‌کلید قابل استفاده است؛ Arrow Up/Down بین روزهای همان هفته و Arrow Left/Right بین ستون‌های هفته حرکت می‌کند و جهت افقی در RTL/LTR معکوس می‌شود.
- Month Intelligence شامل تعداد روزهای فعال، طولانی‌ترین streak، تعداد و دقیقه اضافه‌کار/کسری، روزهای متعادل، قوی‌ترین روز و یک Balance Distribution فشرده است.
- همه اعداد مشتق‌شده‌اند و هیچ داده جدیدی در AppData ذخیره نمی‌شود.
- توضیح قدیمی Month و Header CSV که به‌صورت ثابت «شمسی» نوشته شده بود Calendar-neutral شد تا Override میلادی نیز قرارداد صحیح داشته باشد.
- Production Browser Smoke حالا Heatmap را در Persian/RTL و Gregorian/English-LTR می‌بیند، موبایل 425px را از نظر overflow نگه می‌دارد و حرکت واقعی Keyboard را روی Heatmap بررسی می‌کند.
- Visual QA پس از Commit `c119754` نشان داد Intelligence قبل از Calendar سلسله‌مراتب صفحه را برعکس کرده و Stretch پیش‌فرض Grid در Desktop فضای خالی ایجاد می‌کند؛ Follow-up این فاز Calendar را بلافاصله بعد از KPIها قرار می‌دهد، Gridها را `items-start` می‌کند و Heatmap را در عرض محتوای خودش مرکز می‌کند.
- Visual QA دوم نشان داد Tooltip داخل Cell زیر Surface مجاور می‌افتد و دو کارت Heatmap/Intelligence هنوز نسبت فضای اشغال‌شده به اطلاعات ضعیفی دارند؛ R3 Tooltip را با Portal ثابت و viewport-clamp به `document.body` منتقل می‌کند و بلوک «۷ روز اخیر» را با الگوی متراکم dashboard کنار Heatmap می‌آورد.
- «۷ روز اخیر» کارکرد، هدف واقعی و تراز هر روز را از همان `calc()` و Schedule اصلی محاسبه می‌کند و با کلیک روی هر ردیف Day Details همان تاریخ انتخاب می‌شود؛ داده جدیدی ذخیره نمی‌شود.
- Desktop Activity Intelligence حالا سه بلوک مستقل Heatmap + Recent 7 Days + Month Intelligence دارد تا عرض بزرگ صفحه به اطلاعات مفید تبدیل شود؛ در عرض‌های کمتر از 1180px این بلوک‌ها عمودی می‌شوند.
- R5 نمایش Tooltip روی Focus صفحه‌کلید را از React synthetic focus به listener بومی `focusin/focusout` روی خود Grid منتقل می‌کند تا Programmatic/keyboard focus در Browser Gate و مرورگر واقعی قرارداد یکسانی داشته باشد؛ Hover همچنان مستقل باقی می‌ماند.
- R6 قرارداد Browser را از Focus برنامه‌نویسی‌شده DevTools جدا می‌کند: باگ واقعی stacking با Hover واقعی `Input.dispatchMouseEvent` و Portal/viewport/z-index سنجیده می‌شود، در حالی که Keyboard navigation جداگانه با Focus + Arrow key واقعی بررسی می‌شود. برای UX واقعی، `onFocus/onBlur` نیز در کنار listener بومی Grid حفظ شده است.

## فایل‌های مهم

- `lib/month-intelligence.ts`
- `components/pages/month/activity-heatmap/activity-heatmap.tsx`
- `components/pages/month/activity-heatmap/activity-heatmap-tooltip.tsx`
- `components/pages/month/activity-heatmap/recent-activity-card.tsx`
- `components/pages/month/activity-heatmap/month-intelligence-card.tsx`
- `components/pages/month/month-page.tsx`
- `lib/i18n/fa.ts`
- `lib/i18n/en.ts`
- `scripts/production-browser-smoke.mjs`
- `tests/phase185-month-activity-intelligence.test.ts`

## تصمیم معماری

منطق محاسبه شدت، streak و توزیع Balance در helper خالص `lib/month-intelligence.ts` قرار گرفت تا UI فقط نمایش و تعامل را مدیریت کند. محاسبات روزانه همچنان از `calc()` و `getDailyTargetMinutes()` استفاده می‌کنند و Month یک موتور زمان موازی نمی‌سازد.

Tooltip همچنان domain-specific و بدون Dependency تازه است، اما برای شکستن stacking-context کارت‌ها داخل Cell رندر نمی‌شود؛ یک Portal ثابت به `document.body` با z-index بالا، viewport-clamp و reposition روی scroll/resize دارد. Cell متن دسترس‌پذیر مستقل دارد و Tooltip با Hover و Keyboard Focus نمایش داده می‌شود.

بلوک «۷ روز اخیر» نیز Derived-only است و از `shiftDateKey()`، `getDailyTargetMinutes()` و `calc()` استفاده می‌کند؛ بنابراین Month هیچ موتور زمان یا مدل ذخیره‌سازی موازی نمی‌سازد.

## Schema و Migration

- Current development AppData: **Schema v19**
- Released `v2.4.0`: **Schema v17**
- Schema bump: ندارد
- Migration: ندارد
- Dependency جدید: ندارد

Activity Graph و Month Intelligence کاملاً Derived هستند و وارد Backup، Recovery یا Device Transfer نمی‌شوند.

## تست‌ها

شش Contract جدید فاز ۱۸۵ اضافه شد:

1. Heatmap با Persian/Gregorian از Calendar واقعی برنامه پیروی می‌کند.
2. سطح شدت از `worked / target` واقعی مشتق می‌شود.
3. streak و توزیع overtime/deficit محاسبه می‌شوند.
4. Cellها از Schedule و Time Engine Canonical استفاده می‌کنند.
5. UI دارای Grid/Tooltip/Keyboard و Copy دو زبانه است.
6. فاز Derived-only روی Schema v19 می‌ماند و در Docs/Quality/Browser Smoke سیم‌کشی می‌شود.

Baseline فاز ۱۸۴: `796/796`.
هدف Gate فاز ۱۸۵: **802/802**.

## Visual QA لازم

- Desktop و Mobile (حداقل 425×608)
- `fa-IR / RTL / Persian calendar`
- `en / LTR / Gregorian calendar`
- Light و Dark
- Hover و Keyboard Focus روی Cellها
- عدم خروج Tooltip و Heatmap از viewport و قرارگرفتن Tooltip بالاتر از همه Surfaceها
- نمایش فشرده «۷ روز اخیر» و تغییر Day Details با انتخاب هر ردیف
- خوانایی پنج سطح شدت با Accentهای مختلف
- انتخاب Cell باید روز انتخاب‌شده Month را تغییر دهد و Day Details همان روز را دنبال کند
- Calendar باید قبل از Activity Intelligence دیده شود و کارت‌های کوتاه‌تر در Desktop به ارتفاع کارت بلندتر Stretch نشوند

## Commit پیشنهادی

```text
feat(month): add activity heatmap and month intelligence
```
