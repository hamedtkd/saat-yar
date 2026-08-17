# Phase 195 — OAuth Verification Readiness + GA4 Analytics

## Baseline

- Release baseline: `v2.5.0`
- Main merge baseline: `860d74f`
- Final 2.5.0 gate: 880/880
- AppData schema: v20 (بدون تغییر)

## Scope

1. افزودن Privacy Policy و Terms عمومی و تقویت About به‌عنوان OAuth homepage.
2. Public کردن `/about`, `/privacy`, `/terms` حتی قبل از تکمیل onboarding.
3. مستندسازی کامل Google OAuth scope justification و سناریوی ویدیوی Verification.
4. مهاجرت Analytics اختیاری از Plausible به GA4 بدون dependency جدید.
5. حفظ Consent contract: قبل از opt-in هیچ GA tag/request بارگذاری نمی‌شود.
6. Manual page_view برای SPA، غیرفعال‌سازی Google signals و advertising personalization.

## Environment

```env
NEXT_PUBLIC_ANALYTICS_PROVIDER=ga4
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_CALENDAR_CLIENT_ID=...apps.googleusercontent.com
NEXT_PUBLIC_SITE_URL=https://saat-yar.vercel.app
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=... # فقط در صورت استفاده از Search Console meta verification
```

## Data safety

- هیچ Schema/Migration جدیدی ندارد.
- Google OAuth access token memory-only باقی می‌ماند.
- Calendar sync cache browser-local باقی می‌ماند.
- Analytics taxonomy همچنان فقط coarse/allowlisted است.

### R6 - Public help and responsive shell
- Visual QA موبایل نشان داد About/Privacy/Terms در viewport باریک overflow افقی دارند؛ public shell با قرارداد `min-w-0/max-w-full/overflow-x-clip` و wrap امن سخت‌گیری شد.
- header سبک عمومی با بازگشت به اپ، Settings، Help، تغییر زبان و Theme برای routeهای عمومی اضافه شد.
- `/help` به‌عنوان راهنمای جامع دوزبانه و public اضافه شد و در sitemap/footer قرار گرفت.
