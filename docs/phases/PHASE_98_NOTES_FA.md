# فاز ۹۸ — مستندات انتشار، README انگلیسی و سازگاری مرورگر

## هدف

بستن بخش غیرتصویری مستندات انتشار پیش از تهیه Screenshot و ویدیوی نهایی، بدون تغییر رفتار Runtime یا قرارداد داده.

## تغییرات

- ایجاد `README_EN.md` مستقل با معرفی محصول، مدل Local-first، قابلیت‌ها، معماری، دستورات Quality، Migration و مشارکت.
- افزودن لینک دوطرفه فارسی و انگلیسی در ابتدای هر README.
- اصلاح شمارنده قدیمی تست‌ها در README فارسی و استفاده از عبارت پایدار `300+` به‌جای عدد قدیمی ۱۶۵.
- ایجاد راهنمای عیب‌یابی فارسی و انگلیسی برای Windows، `npm ci`، Registry، خطاهای `E404`، `EPERM`، `EBUSY`، `index.lock`، Cache Build و Smoke Test مرورگر.
- ایجاد ماتریس سازگاری مرورگر با تفکیک پشتیبانی API، انتظار پروژه و مرورگرهای واقعاً اجراشده در Release Gate.
- مستندسازی محدودیت‌های Local Notification، PWA، Private Mode، Origin و Browser Profile.
- به‌روزرسانی فهرست مستندات، راهنمای مشارکت و بک‌لاگ.
- اضافه‌شدن تست قراردادی فاز ۹۸ به `npm test`.

## موارد عمداً باقی‌مانده

- Screenshotهای واقعی تم روشن، تاریک، موبایل و گزارش‌ها.
- GIF یا ویدیوی کوتاه Onboarding، ثبت روز و گزارش.
- کاهش تدریجی تست‌های شکننده مبتنی بر Regex سورس.

این موارد به Build و Capture واقعی UI نیاز دارند و باید در فاز رسانه‌ای جدا انجام شوند تا مستندات متنی و دارایی‌های تصویری با هم مخلوط نشوند.

## داده و Dependency

```text
Schema version: 16
Migration جدید: ندارد
Dependency جدید: ندارد
فرمت Backup: بدون تغییر
IndexedDB: بدون تغییر
Runtime behavior: بدون تغییر
```

## بررسی پیشنهادی

```bash
node --test --experimental-strip-types tests/phase98-release-documentation.test.ts
npm run check:quality
npm run check:release
git diff --check
```
