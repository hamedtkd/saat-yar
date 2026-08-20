# Phase 203 — Cloudflare Web Analytics Privacy Hotfix / v2.6.1

تاریخ: 2026-08-20

## هدف

بعد از انتشار 2.6.0 مشخص شد نیاز فعلی Analytics ساعت‌یار بسیار محدودتر از GA4 است: فقط فهمیدن بازدید کلی، visitor، referrer و عملکرد صفحات. نگه‌داشتن GA4، consent state و custom event taxonomy برای این نیاز پیچیدگی اضافه ایجاد می‌کرد.

Phase 203 این مسیر را ساده می‌کند و 2.6.1 را به عنوان Privacy/Analytics hotfix آماده می‌کند.

## تغییر Runtime

- `GoogleAnalyticsRuntime` حذف شد.
- `gtag.js` و Google Tag Manager برای Analytics دیگر توسط ساعت‌یار load نمی‌شوند.
- consent hook و UIهای opt-in/opt-out Analytics حذف شدند.
- custom product events مانند `work_started`, `work_completed`, `feature_used`, `route_viewed` و onboarding analytics از runtime حذف شدند.
- `ProductAnalyticsRuntime` حذف شد.
- Cloudflare Web Analytics Beacon فقط با `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` معتبر load می‌شود.
- SPA pageview tracking به Beacon رسمی Cloudflare سپرده شده و ساعت‌یار pageview دستی ارسال نمی‌کند.

## Privacy boundary

- AppData همچنان v21 است.
- هیچ migration دیتایی لازم نیست.
- هیچ dependency جدیدی اضافه نشده است.
- هیچ cookie banner یا Analytics consent state جدیدی به اپ اضافه نشده است.
- WorkData، timer actions، onboarding choices، نام مشتری/پروژه، یادداشت، مبلغ، تاریخ/ساعت کاری، record IDs، Device Transfer و AppData به Analytics ارسال نمی‌شوند.

## UX / Legal

- Privacy onboarding دیگر toggle تحلیلی ندارد و فقط disclosure واضح Cloudflare را نشان می‌دهد.
- Settings > Privacy به یک کارت read-only برای وضعیت Cloudflare Web Analytics تبدیل شده است.
- Privacy Policy، Terms و Help برای provider جدید به‌روز شدند.

## تنظیم Production

Vercel باید این متغیر را برای Production داشته باشد:

```env
NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN=<Cloudflare Web Analytics site token>
```

توکن داخل repository ذخیره نمی‌شود.

## Release contract

- Version: 2.6.1
- Base release: v2.6.0 / `d95f6a2`
- AppData: v21 بدون تغییر
- Node: 22.x
- Full gate authority: `npm run check:release:full`
- بعد از main deployment: `npm run audit:production`
- tag فقط بعد از production audit ساخته شود.
