# ساعت‌یار 2.6.1 — Privacy-safe Analytics Hotfix

نسخه 2.6.1 یک patch کوچک و متمرکز روی Analytics و حریم خصوصی است و هیچ تغییری در AppData یا جریان‌های اصلی ثبت کار ایجاد نمی‌کند.

## تغییر اصلی

Google Analytics 4 از runtime ساعت‌یار حذف شده و Cloudflare Web Analytics جایگزین آن شده است.

هدف Analytics در ساعت‌یار فعلاً فقط فهمیدن بازدید کلی، visitor، referrer و عملکرد صفحات است؛ بنابراین دیگر custom product event، consent state داخلی یا GA4 event taxonomy نداریم.

## Privacy

- بدون GA4 / gtag.js در runtime فعلی
- بدون custom event برای تایمر، onboarding یا feature usage
- بدون ارسال WorkRecord، ActivitySegment، نام مشتری/پروژه، یادداشت، مبلغ، تاریخ/ساعت کاری، شناسه رکورد یا AppData
- بدون schema migration؛ AppData همچنان v21
- بدون dependency جدید
- Cloudflare Beacon فقط وقتی token مربوط به Site در build تنظیم شده باشد بارگذاری می‌شود

## تنظیم Deployment

در Vercel Production مقدار زیر باید از Cloudflare Web Analytics Site تنظیم شود:

```text
NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN
```

توکن داخل repository قرار نمی‌گیرد.
