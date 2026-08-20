# Privacy-safe Traffic Analytics — Cloudflare Web Analytics

از نسخه 2.6.1 ساعت‌یار برای پاسخ به یک سؤال ساده از Cloudflare Web Analytics استفاده می‌کند:

> آیا کاربران وارد ساعت‌یار می‌شوند و کدام صفحه‌ها بیشتر دیده می‌شوند؟

هدف این integration ساخت funnel رفتاری، دنبال‌کردن کاربر یا ارسال محتوای کاری نیست.

## Provider فعال

`Cloudflare Web Analytics`

ساعت‌یار Beacon رسمی Cloudflare را فقط وقتی بارگذاری می‌کند که token معتبر در Build تنظیم شده باشد:

```env
NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN=YOUR_SITE_TOKEN
```

اگر این مقدار وجود نداشته باشد یا نامعتبر باشد، Beacon اصلاً بارگذاری نمی‌شود و اپ بدون Analytics کار می‌کند.

## چه چیزی اندازه‌گیری می‌شود؟

Cloudflare Web Analytics برای آمار کلی ترافیک و عملکرد صفحه استفاده می‌شود، از جمله page view، visitor، referrer و معیارهای عملکرد صفحه‌ای که خود Cloudflare Web Analytics ارائه می‌کند.

Routing ساعت‌یار SPA است. Beacon رسمی Cloudflare تغییرات History API را برای SPA track می‌کند؛ ساعت‌یار هیچ pageview دستی یا custom event جداگانه‌ای ارسال نمی‌کند.

## چه چیزی ارسال نمی‌شود؟

ساعت‌یار custom product event ندارد و این موارد را به Analytics نمی‌فرستد:

- Start / Pause / Resume / Finish تایمر
- مراحل یا انتخاب‌های Onboarding
- WorkRecord یا ActivitySegment
- نام مشتری یا پروژه
- عنوان فعالیت یا یادداشت
- حقوق، درآمد، نرخ یا مبلغ
- تاریخ کاری یا ساعت دقیق
- شناسه رکورد یا شناسه دستگاه
- payload انتقال دستگاه
- Backup یا AppData
- متن آزاد کاربر

## Cookie و Browser Storage

Cloudflare Web Analytics برای Analytics از cookie یا شناسه ذخیره‌شده در `localStorage`، `sessionStorage` یا `IndexedDB` ساعت‌یار استفاده نمی‌کند. ساعت‌یار هم consent state تحلیلی جداگانه‌ای در AppData یا storage ایجاد نمی‌کند.

انتخاب قبلی GA4 که در نسخه 2.6.0 ممکن بود در `saatyar-product-analytics-consent-v1` ذخیره شده باشد، از 2.6.1 دیگر خوانده یا استفاده نمی‌شود.

## GA4

Runtime فعلی ساعت‌یار هیچ Google Analytics / `gtag.js` / Google Tag Manager برای Analytics بارگذاری نمی‌کند. فایل‌ها، hookها، event taxonomy و consent controls مربوط به GA4 از runtime حذف شده‌اند.

اسناد Phase 195 و Phase 196 فقط به عنوان تاریخچه نسخه 2.6.0 باقی مانده‌اند.

## راه‌اندازی روی Vercel

1. در Cloudflare Dashboard وارد Web Analytics شو.
2. برای hostname تولیدی ساعت‌یار یک Site بساز.
3. Site Token را از snippet رسمی Cloudflare بردار.
4. در Vercel Project Settings → Environment Variables این متغیر را برای Production تعریف کن:

```text
NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN
```

5. یک deployment جدید بساز.
6. بعد از deploy، صفحه Production را باز کن و در Network مطمئن شو `static.cloudflareinsights.com/beacon.min.js` بارگذاری می‌شود.
7. در Cloudflare Web Analytics چند دقیقه بعد page viewها را بررسی کن.

## Privacy boundary

Cloudflare Analytics جایگزین Local-first بودن ساعت‌یار نیست. داده‌های اصلی کاربر همچنان در IndexedDB همان مرورگر می‌مانند و هیچ backend مرکزی ساعت‌یار برای WorkData ایجاد نشده است.
