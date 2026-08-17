# قرارداد Privacy-safe Product Analytics ساعت‌یار

## اصل صفر

داده کاری ساعت‌یار Local-first است. Analytics نباید به مسیر دوم انتقال داده‌های شخصی تبدیل شود.

## Provider

Adapter فعلی Plausible است و به‌صورت دستی از Events API استفاده می‌کند. Script خودکار Analytics داخل Layout تزریق نمی‌شود.

فعال‌سازی Production فقط با هر دو متغیر زیر ممکن است:

```env
NEXT_PUBLIC_ANALYTICS_PROVIDER=plausible
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=saat-yar.vercel.app
```

برای endpoint سفارشی یا self-hosted compatible می‌توان این مقدار را نیز تعیین کرد:

```env
NEXT_PUBLIC_PLAUSIBLE_ENDPOINT=https://plausible.io/api/event
```

اگر Provider یا Domain تنظیم نشده باشد، Runtime در حالت `none` است و حتی با Consent کاربر هیچ درخواست Analytics ارسال نمی‌شود.

## Consent

Consent روی همان Browser نگه داشته می‌شود و بخشی از AppData، Backup یا Device Transfer نیست. حالت‌ها:

- `unset`: هیچ Event به Network نمی‌رود؛ Eventهای امن همان Session فقط در حافظه محدود Buffer می‌شوند.
- `granted`: فقط Eventهای taxonomy مجاز ارسال می‌شوند.
- `denied`: Buffer پاک و همه ارسال‌ها متوقف می‌شوند.

## داده مجاز

Properties فقط Enum یا Number محدود هستند: Route، Feature، Workspace mode، Scheduled/Flexible، Onboarding step/path و Error category عمومی.

## داده ممنوع

هرگز Property یا Payload شامل این موارد اضافه نکن:

- نام کاربر، Client یا Project
- Salary، Income، Rate، Invoice/Expense amount
- Note، Task، Reminder text یا هر Free-text
- تاریخ روز کاری یا Clock time دقیق
- Record/Client/Project/Invoice/Device IDs
- Backup، QR/WebRTC payload یا هر Snapshot
- raw URL، query string، hash یا search term
- متن Exception یا Stack trace

## افزودن Event جدید

Event باید ابتدا به union تایپ‌شده `ProductAnalyticsEvent` اضافه شود و Contract تست داشته باشد. API عمومی `trackProductAnalytics` نباید به `Record<string, unknown>` یا Property آزاد تبدیل شود.

## منابع تصمیم Provider

بررسی رسمی Phase 184 بر مستندات Privacy/Events Plausible، Consent/Data collection Google Analytics و مستندات privacy/event tracking Umami تکیه دارد. نتیجه این فاز: Provider abstraction کوچک، Plausible adapter اختیاری، و عدم فعال‌سازی GA4/GTM یا Backend جدید به‌صورت پیش‌فرض.
