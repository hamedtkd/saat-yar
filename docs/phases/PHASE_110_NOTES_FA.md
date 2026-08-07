# فاز ۱۱۰ — مقاوم‌سازی Offline PWA و Media Capture

این فاز یک فاز اصلاحی است و قبل از ورود به موتور حقوق، دو شکست باقی‌مانده از فاز ۱۰۹ را می‌بندد.

## مسئله

- Release Gate بعد از فعال‌کردن حالت Offline در Chrome/Edge هنگام reload منتظر می‌ماند و timeout می‌شد.
- `media:capture` در بعضی اجراهای Windows فقط `Uncaught (in promise)` چاپ می‌کرد و محل خطا مشخص نبود.

## اصلاح PWA

- بعد از `next build` اسکریپت `scripts/finalize-static-pwa.mjs` تمام فایل‌های `out/_next/static` را پیدا می‌کند.
- فایل `out/pwa-precache-manifest.js` به‌صورت build-specific ساخته می‌شود.
- Service Worker در install، علاوه بر Routeها و Brand Assets، فایل‌های JS/CSS/Font خروجی واقعی Next را precache می‌کند.
- Cache generation به `v7` ارتقا یافت.
- Smoke Test پیش از Offline شدن وجود حداقل یک build asset در Cache Storage را بررسی می‌کند.
- reload آفلاین با `Page.reload` و `Page.loadEventFired` تست می‌شود، نه `location.reload()` داخل Runtime evaluation.

## اصلاح Media Capture

- Browser Target ابتدا روی `about:blank` ساخته می‌شود.
- Storage از طریق Chrome DevTools Protocol و قبل از boot برنامه پاک می‌شود؛ دیگر `indexedDB.deleteDatabase` در صفحه‌ای که ممکن است اتصال باز داشته باشد اجرا نمی‌شود.
- پیش از Seed کردن Demo Data، Origin دوباره با `Storage.clearDataForOrigin` پاک می‌شود.
- خطاهای Runtime اکنون description/stack واقعی را گزارش می‌کنند.
- stderr مرورگر هنگام شکست Capture چاپ می‌شود.
- اجرای Linux/root نیز `--no-sandbox` را فقط در همان محیط اضافه می‌کند.

## داده و Schema

- AppData Schema همچنان v16 است.
- Migration جدید نداریم.
- فرمت Backup تغییر نکرده است.
- Dependency جدید اضافه نشده است.
