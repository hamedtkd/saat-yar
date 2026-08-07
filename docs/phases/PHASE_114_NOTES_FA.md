# فاز ۱۱۴ — WebRTC Pairing و رفع BufferSource

## هدف

اتصال دو دستگاه ساعت‌یار بدون حساب کاربری، دیتابیس مرکزی یا سرور Signaling دائمی و انتقال AppData روی پروتکل رمزنگاری‌شده فاز ۱۱۳.

## اصلاح TypeScript فاز ۱۱۳

TypeScript 5.9 نوع `Uint8Array` را با `ArrayBufferLike` مدل می‌کند، درحالی‌که Web Crypto DOM overloadها `BufferSource` مبتنی بر `ArrayBuffer` می‌خواهند. برای جلوگیری از Cast ناامن، `toArrayBuffer()` یک کپی واقعی `ArrayBuffer` می‌سازد و همه ورودی‌های `importKey`، `encrypt`، `decrypt` و `digest` از آن عبور می‌کنند.

## Pairing بدون Backend

فاز ۱۱۴ از WebRTC DataChannel ordered استفاده می‌کند و ICE server خارجی ندارد. برای همین بهترین سناریو، موبایل و لپ‌تاپ روی یک Wi-Fi است.

Signaling دوطرفه به‌جای Backend با Pairing Code انجام می‌شود:

1. دستگاه فرستنده Offer می‌سازد.
2. Offer با کد یا لینک Fragment به دستگاه گیرنده منتقل می‌شود.
3. گیرنده Answer می‌سازد.
4. Answer به دستگاه فرستنده برگردانده می‌شود.
5. DataChannel مستقیم باز می‌شود.
6. بسته AES-GCM فاز ۱۱۳ به Chunkهای کوچک تقسیم و ارسال می‌شود.
7. گیرنده بعد از Verify/Decrypt، Preview و انتخاب Merge/Replace را می‌بیند.

Offer فقط ده دقیقه اعتبار دارد. لینک Pairing داده را در URL fragment قرار می‌دهد تا مرورگر آن را به HTTP server نفرستد، ولی همچنان یک bearer secret است و نباید عمومی منتشر شود.

## چرا QR در همین فاز Vendor نشد؟

هدف پروژه Local-first است؛ فرستادن SDP و Session Key به APIهای عمومی ساخت QR قابل قبول نیست. همچنین dependency جدید QR به‌خاطر Registry بسته‌بندی فعلی اضافه نشد. فاز ۱۱۵ یک QR renderer و camera scanner محلی را روی همین Pairing Code اضافه می‌کند، بدون تغییر WebRTC یا پروتکل انتقال.

## DataChannel

Envelope رمزنگاری‌شده در پیام‌های ۱۲هزارکاراکتری ارسال می‌شود تا بسته‌های بزرگ AppData به یک پیام بزرگ WebRTC وابسته نباشند. گیرنده بعد از دریافت کامل، ACK می‌فرستد.

## Data safety

- Schema همچنان v17 است.
- Migration جدیدی نیاز نیست.
- Merge امن به‌صورت پیش‌فرض داده محلی را در Conflict نگه می‌دارد.
- Replace فقط با انتخاب صریح کاربر اجرا می‌شود.
- کلید AES نشست در Pairing Offer است و داخل IndexedDB ذخیره دائمی نمی‌شود.
