# یادداشت انتشار ساعت‌یار ۲.۲.۰

نسخه ۲.۲.۰ مهم‌ترین ارتقای محصول بعد از انتشار ۲.۱.۰ است: زبان طراحی نهایی در تمام صفحات اصلی تثبیت شده، تجربه PWA و Offline مقاوم‌تر شده، موتور حقوق قابل‌سفارشی‌سازی وارد Schema و تنظیمات شده و انتقال مستقیم و رمزنگاری‌شده داده میان موبایل و لپ‌تاپ بدون دیتابیس مرکزی آماده استفاده است.

## نکات برجسته

### حقوق قابل‌سفارشی‌سازی

- موتور Rule-based با روش‌های ماهانه متناسب، ماهانه ثابت، ساعتی و روزکاری.
- Policy مستقل برای اضافه‌کاری، تعطیل‌کاری، کسرکار و گردکردن مبلغ.
- Preview زنده و Breakdown قابل توضیح در تنظیمات و گزارش‌ها.
- ارتقای AppData از Schema v16 به v17 با Migration سازگار؛ داده قدیمی با Preset هم‌ارز رفتار قبلی منتقل می‌شود.

### انتقال مستقیم دستگاه‌به‌دستگاه

- Payload نسخه‌دار با SHA-256 و Preview پیش از اعمال.
- Merge با حفظ داده محلی، Merge با اولویت داده ورودی و Replace صریح.
- رمزنگاری Session با AES-GCM-256 و کلید موقت غیرپایدار.
- WebRTC DataChannel برای انتقال مستقیم میان دو مرورگر.
- Pairing QR کاملاً Local و چندفریمی برای Offer/Answerهای بزرگ؛ Copy/Paste و Share Link به‌عنوان fallback باقی مانده‌اند.
- تاریخچه محدود انتقال فقط با metadata و بدون ذخیره Payload یا Session Key.
- Browser E2E واقعی برای انتقال چند chunk رمزنگاری‌شده و ACK.

### طراحی و PWA

- فریز زبان طراحی چندتمی در Today، Month، Reports، Settings، Leave، Clients، Projects و Invoices.
- هویت نصب PWA، آیکن‌های any/maskable، Install UX، Offline state و Update Prompt.
- precache دارایی‌های واقعی Next.js و fallback آفلاین با timeout محدود.
- Capture تکرارپذیر Screenshot/GIF با Fixture نمایشی مستقل از داده واقعی کاربر.

## حریم خصوصی

ساعت‌یار همچنان Local-first است. انتقال بین دستگاه‌ها Backend دائمی یا دیتابیس مرکزی اضافه نمی‌کند. Pairing Code یک Bearer Secret کوتاه‌عمر است و باید خصوصی بماند؛ خود AppData پس از اتصال با AES-GCM منتقل می‌شود.

## سازگاری داده

```text
Package candidate: 2.2.0
Released baseline schema: v16
Current schema: v17
Migration: v16 → v17
Node.js: 22.x
```

Backupهای قدیمی از مسیر Migration فعلی به v17 می‌رسند. Backup مربوط به Schema جدیدتر همچنان توسط نسخه قدیمی‌تر رد می‌شود.

## شواهد Quality پیش از Release Candidate

آخرین Gate کامل پیش از آماده‌سازی این Release Candidate:

```text
417 tests passed
Next.js production build passed
Static export: 19/19 routes
PWA offline reload smoke passed
Encrypted WebRTC browser pairing smoke passed (4 chunks + ACK)
```

فاز آماده‌سازی Release شش تست قراردادی جدید اضافه می‌کند؛ بنابراین Gate نهایی Candidate باید ۴۲۳ تست را پاس کند.

## وضعیت انتشار

Manifest این نسخه در فاز ۱۱۹ با وضعیت `release-candidate` ساخته می‌شود. پس از اجرای Gate نهایی، بررسی دستی و ثبت Commit نهایی، وضعیت Manifest باید به `released` تغییر کند و Tag زیر روی همان Commit ساخته شود:

```bash
git tag -a v2.2.0 -m "Saatyar 2.2.0"
git push origin v2.2.0
```
