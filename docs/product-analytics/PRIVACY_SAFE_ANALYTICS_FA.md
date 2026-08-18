# قرارداد Privacy-safe Product Analytics ساعت‌یار

## اصل صفر

داده کاری ساعت‌یار Local-first است. Analytics نباید به مسیر دوم انتقال داده‌های شخصی تبدیل شود.

## Provider فعال: Google Analytics 4

از Phase 195 transport اختیاری Analytics روی GA4 است. هیچ SDK یا dependency جدیدی اضافه نشده و `gtag.js` فقط **بعد از opt-out صریح کاربر** به‌صورت runtime بارگذاری می‌شود.

فعال‌سازی Production:

```env
NEXT_PUBLIC_ANALYTICS_PROVIDER=ga4
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

اگر Provider یا Measurement ID معتبر تنظیم نشده باشد، Runtime در حالت `none` است و حتی با Consent کاربر هیچ درخواست Analytics ارسال نمی‌شود.

## Consent

Consent روی همان Browser نگه داشته می‌شود و بخشی از AppData، Backup یا Device Transfer نیست:

- `unset`: هیچ Tag یا Request Analytics به Network نمی‌رود؛ Eventهای امن همان Session فقط در حافظه محدود Buffer می‌شوند.
- `granted`: GA4 tag بارگذاری می‌شود و فقط Eventهای taxonomy مجاز ارسال می‌شوند.
- `denied`: Buffer پاک، ارسال متوقف و consent runtime برای Analytics denied می‌شود.

Advertising storage، ad user data، ad personalization و Google signals برای این integration غیرفعال‌اند.

## Page view در SPA

Saatyar `send_page_view: false` تنظیم می‌کند و Route Viewهای خودش را به `page_view` تبدیل می‌کند تا App Router باعث double-count نشود. URL ارسالی فقط Origin + Route allowlisted است؛ query string و hash ارسال نمی‌شوند.

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

## گزارش Event parameters در GA4

Custom event parameterها collect می‌شوند؛ برای نمایش آن‌ها در Reports/Explore باید در GA4 از مسیر Admin → Data display → Custom definitions، dimension متناظر بسازی. پیشنهاد اولیه:

- `saatyar_route`
- `feature`
- `mode`
- `timing`
- `path`
- `area`
- `code`

## افزودن Event جدید

Event باید ابتدا به union تایپ‌شده `ProductAnalyticsEvent` اضافه شود و Contract تست داشته باشد. API عمومی `trackProductAnalytics` نباید به `Record<string, unknown>` یا Property آزاد تبدیل شود.


## رفتار پیش‌فرض GA4 در Phase 196
- در buildهایی که GA4 پیکربندی شده، آمار ناشناس محصول به‌صورت پیش‌فرض فعال است و کاربر در Settings > Privacy می‌تواند آن را خاموش کند.
- سیگنال‌های تبلیغاتی، `ad_storage`، `ad_user_data` و `ad_personalization` همیشه غیرفعال‌اند.
- برای EEA/UK/CH، `analytics_storage` با Consent Mode به‌صورت denied شروع می‌شود تا تا زمان اجازه صریح storage تحلیلی ایجاد نشود.
- payload همچنان فقط taxonomy محدود محصول را می‌فرستد و داده کاری/مالی/متن آزاد ارسال نمی‌شود.
