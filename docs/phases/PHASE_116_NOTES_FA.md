# فاز ۱۱۶ — End-to-End hardening انتقال دستگاه

## هدف

قبل از توسعه قابلیت جدید، مسیر انتقال موبایل/لپ‌تاپ از QR تا WebRTC و اعمال داده با تست‌های رفتاری تثبیت شد.

## اصلاحات

- تست فاز ۱۱۵ دیگر از فلگ RegExp `s` استفاده نمی‌کند و با target فعلی `ES2017` سازگار است.
- مسیر navigation در Service Worker یک timeout محدود ۲.۵ ثانیه‌ای دارد؛ وقتی origin در دسترس نیست سریع به cache برمی‌گردد و Browser Smoke روی fetch معلق نمی‌ماند.
- تست End-to-End وابسته به implementation اضافه شد: Payload → AES-GCM → Chunking → ACK → Decrypt → Preview → Merge.
- Smoke واقعی مرورگر برای `RTCPeerConnection` و DataChannel مرتب `saatyar-transfer` اضافه شد و ACK واقعی را بررسی می‌کند.
- Smoke واقعی WebRTC با دستور `npm run test:browser:pairing` در دسترس است؛ فعلاً به Release Gate اجباری وصل نشده تا محدودیت‌های شبکه/Headless محیط CI باعث False Negative نشود.

## داده و Schema

هیچ Migration یا تغییر Schema در این فاز وجود ندارد. Schema فعلی v17 باقی می‌ماند.
