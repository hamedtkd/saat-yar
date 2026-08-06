# سازگاری مرورگر / Browser compatibility

آخرین بازبینی مستندات: **اوت ۲۰۲۶**

این جدول میان «پشتیبانی APIهای وب»، «انتظار پروژه» و «مرورگر واقعاً اجراشده در Release Gate» تفاوت می‌گذارد. وجود یک API در مرورگر به‌تنهایی به معنی تست کامل تمام جریان‌های ساعت‌یار روی آن مرورگر نیست.

## ماتریس پشتیبانی پروژه

| محیط | قابلیت‌های اصلی و IndexedDB | هماهنگی چند تب | PWA و Service Worker | Notification داخل صفحه | وضعیت تست پروژه |
| --- | --- | --- | --- | --- | --- |
| Chrome دسکتاپ | پشتیبانی‌شده | پشتیبانی‌شده | پشتیبانی‌شده روی HTTP محلی یا HTTPS | وابسته به مجوز Site و تنظیمات سیستم | **Release Gate خودکار** |
| Edge دسکتاپ | پشتیبانی‌شده | پشتیبانی‌شده | پشتیبانی‌شده روی HTTP محلی یا HTTPS | وابسته به مجوز Site و تنظیمات سیستم | **Release Gate خودکار** |
| Chromium دسکتاپ | پشتیبانی‌شده | پشتیبانی‌شده | وابسته به Build و توزیع مرورگر | وابسته به Build و تنظیمات سیستم | **Release Gate خودکار** |
| Firefox دسکتاپ | انتظار پشتیبانی برای جریان اصلی | انتظار پشتیبانی | Service Worker پشتیبانی می‌شود؛ تجربه نصب با Chromium یکسان نیست | باید دستی بررسی شود | تست دستی برای تغییرات مهم |
| Safari روی macOS | انتظار پشتیبانی برای جریان اصلی | انتظار پشتیبانی در نسخه‌های جدید | رفتار نصب و Cache با Chromium متفاوت است | محدودیت‌ها و UX مجوز متفاوت است | تست دستی برای تغییرات مهم |
| Safari روی iPhone/iPad | جریان اصلی باید دستی بررسی شود | رفتار Background و Lifecycle می‌تواند متفاوت باشد | نصب از مسیر Add to Home Screen انجام می‌شود | اعلان وب محدودیت‌های سیستم‌عامل و حالت نصب دارد | بدون Release Gate خودکار |
| Private/Incognito | برای داده واقعی توصیه نمی‌شود | ممکن است عمر Storage کوتاه یا محدود باشد | Service Worker ممکن است محدود باشد | ممکن است محدود یا غیرفعال باشد | پشتیبانی تضمین‌شده نیست |

## قرارداد واقعی Release Gate

`npm run check:release` پس از Quality و Build، اسکریپت `scripts/production-browser-smoke.mjs` را اجرا می‌کند. این اسکریپت به‌ترتیب Chrome، Edge یا Chromium را پیدا می‌کند و موارد زیر را روی خروجی Static واقعی بررسی می‌کند:

1. قابل‌دسترسی بودن Export تولیدی
2. نمایش Onboarding در بارگذاری اولیه
3. تکمیل Onboarding
4. ورود به Route امروز
5. بازشدن تقویم و تغییر تاریخ
6. نبود Runtime Exception ثبت‌شده در مرورگر

Firefox و Safari در Release Gate فعلی اجرا نمی‌شوند. برای تغییرات مهم UI، Storage، چاپ، Notification یا PWA، بررسی دستی آن‌ها همچنان لازم است.

## قابلیت‌های وب پایه

- **IndexedDB:** محل اصلی ذخیره داده ساعت‌یار است و در مرورگرهای مدرن به‌طور گسترده در دسترس است.
- **BroadcastChannel:** برای هماهنگی تب‌های یک Origin استفاده می‌شود. پیام‌ها میان Origin یا Storage Partition متفاوت منتقل نمی‌شوند.
- **Service Worker:** برای Cache پوسته PWA استفاده می‌شود و به Secure Context نیاز دارد؛ `localhost` در توسعه استثنای متداول مرورگرها است.
- **Notification API:** ساعت‌یار اعلان محلی همان صفحه را با اجازه کاربر می‌سازد. این پروژه در حال حاضر Push Server و ارسال اعلان از Backend ندارد.

## محدودیت‌های مهم محصول

### داده Local-first

Storage بر اساس Browser Profile و Origin جدا است. بنابراین داده این آدرس‌ها مشترک نیست:

```text
http://localhost:3000
http://localhost:5173
https://saat-yar.vercel.app
```

همچنین تغییر Browser Profile، پاک‌کردن Site Data و Private Mode می‌تواند داده را از دسترس خارج کند. Backup JSON منظم بخشی از Workflow استفاده واقعی است.

### Notification

- مجوز باید در نتیجه تعامل کاربر درخواست شود.
- ردکردن مجوز ممکن است فقط از Site Settings قابل بازگشت باشد.
- Quiet notification، Focus mode، Battery Saver و تنظیمات سیستم‌عامل می‌توانند اعلان را پنهان کنند.
- اعلان ساعت‌یار فعلاً Local Notification است و برای تحویل Push در زمان بسته‌بودن کامل برنامه طراحی نشده است.
- در iOS/iPadOS، قابلیت‌های اعلان وب و نصب Home Screen شرایط نسخه و حالت نصب مخصوص پلتفرم دارند؛ این مسیر در Release Gate خودکار پروژه نیست.

### PWA و Offline

Service Worker فعلی یک Cache ساده Network-first برای Requestهای GET همان Origin دارد. این رفتار به معنی تضمین کامل Offline برای تمام Routeها و Assetها در همه مرورگرها نیست. پس از تغییر بزرگ Build یا Service Worker، موارد زیر دستی بررسی شوند:

- نصب و بازشدن Standalone
- Reload آفلاین Route اصلی
- به‌روزرسانی Cache پس از Deploy جدید
- عدم استفاده طولانی از Asset قدیمی
- Backup پیش از پاک‌کردن Site Data برای رفع مشکل PWA

## چک‌لیست بررسی دستی مرورگر

برای تغییرات Release-critical حداقل این موارد را بررسی کنید:

- بارگذاری اولیه و Onboarding
- صفحه امروز و تغییر تاریخ شمسی
- شروع/پایان روز، ناهار و وقفه
- Reload و بازیابی IndexedDB
- بازکردن دو Tab و وضعیت تعارض/مالکیت تایمر
- تم روشن و تاریک
- عرض موبایل و Desktop
- Print Preview گزارش
- مجوز و اعلان آزمایشی
- نصب PWA و Reload پس از نصب، در صورت ارتباط تغییر

## English summary

Saatyar's automated production browser gate currently covers Chrome, Edge, or Chromium. Core APIs used by the application are broadly implemented in modern browsers, but Firefox and Safari are manual-support targets rather than automated release targets. Browser profiles and origins own separate IndexedDB stores. Service workers require a secure context, and notification/PWA behavior remains platform-specific. The application creates local in-page notifications; it does not currently operate a backend push service.

## منابع مرجع / References

- MDN — IndexedDB: https://developer.mozilla.org/en-US/docs/Web/API/Window/indexedDB
- MDN — BroadcastChannel: https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel
- MDN — Service Worker: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorker
- MDN — Navigator.serviceWorker and private-mode note: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/serviceWorker
- Apple Developer — Web Push in Safari and Home Screen web apps: https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers
