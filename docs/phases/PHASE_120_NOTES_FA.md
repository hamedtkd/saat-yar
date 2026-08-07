# فاز ۱۲۰ — نهایی‌سازی Release 2.2.0

## هدف

تبدیل Release Candidate تأییدشده ۲.۲.۰ به سورس Release نهایی بدون ایجاد قرارداد نادرست برای SHA خود Commit.

## شواهد Candidate

Candidate روی commit prefix `f659456` در سیستم اصلی پروژه با شواهد زیر تأیید شد:

```text
423 tests passed
TypeScript passed
ESLint passed
Next.js production build passed
Static export 19/19
Offline PWA reload smoke passed
Encrypted WebRTC browser pairing passed: 4 chunks + ACK
```

## تصمیم درباره Commit نهایی

Manifest قبلی فیلد `releaseCommit` داشت و برنامه این بود که SHA Commit نهایی داخل همان Manifest نوشته شود. این قرارداد قابل تحقق پایدار نیست: تغییر Manifest برای نوشتن SHA، محتوای Commit را تغییر می‌دهد و در نتیجه SHA جدیدی تولید می‌شود.

در فاز ۱۲۰:

- `status` به `released` تغییر می‌کند.
- commit prefix Candidate تأییدشده `f659456` به‌عنوان evidence ثبت می‌شود.
- تعداد ۴۲۳ تست Candidate و Browser Gateهای تأییدشده در Manifest ثبت می‌شوند.
- `releaseCommit` از Manifest فعال حذف می‌شود.
- Tag annotated `v2.2.0` منبع حقیقت Commit نهایی انتشار است.

## Gate نهایی

این فاز شش تست قرارداد Release اضافه می‌کند؛ بنابراین انتظار Gate نهایی:

```text
429 tests
429 pass
0 fail
```

علاوه بر `npm run check:release`، `npm run test:browser:pairing` نیز باید دوباره پاس شود.

## Tag

پس از Green شدن Gate، Commit و Push سورس فاز ۱۲۰ انجام شود و سپس Tag دقیقاً روی همان Commit ساخته شود:

```bash
git tag -a v2.2.0 -m "Saatyar 2.2.0"
git push origin v2.2.0
```

ساخت Tag هیچ تغییر سورسی ایجاد نمی‌کند و به Phase دیگری نیاز ندارد.
