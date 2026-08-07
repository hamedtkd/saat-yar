# فاز ۱۳۹ — ایمن‌سازی Browser Route Expression

## مسئله واقعی

اجرای Windows فاز ۱۳۸ تمام ۵۱۷ تست، TypeScript، ESLint، Build و Production/PWA Smoke را پاس کرد، اما Freelancer Browser UX Smoke بعد از ساخت Client و Project با خطای زیر متوقف شد:

```text
SyntaxError: Unexpected token 'return'
```

مشکل از UI، App Router یا داده Project نبود. کد مسیر‌یابی Browser Smoke داخل یک Template String ساخته و با `Runtime.evaluate` به CDP فرستاده می‌شد. Regex مربوط به حذف trailing slash در متن تولیدشده می‌توانست escape خود را از دست بدهد و JavaScript نامعتبر بسازد. در این حالت Parser قبل از اجرای IIFE به `return` بعدی می‌رسید و همان خطا را گزارش می‌کرد.

## تغییرات

- ساخت expressionهای Route از `freelancer-browser-ux-smoke.mjs` جدا و به `scripts/browser-route-expression.mjs` منتقل شد.
- نرمال‌سازی trailing slash دیگر داخل کد تزریق‌شده از Regex استفاده نمی‌کند؛ با `endsWith("/")` و `slice` انجام می‌شود.
- Expression مربوط به پیدا کردن Link و Expression مربوط به انتظار Route هر دو از Builderهای مشترک تولید می‌شوند.
- تست تاریخی فاز ۱۳۸ با معماری جدید همگام شد و علاوه بر قرارداد trailing slash، parse شدن expression را هم بررسی می‌کند.
- تست فاز ۱۳۹ تمام Routeهای اصلی Freelancer Smoke را با `new Function` compile می‌کند تا SyntaxError قبل از رسیدن به Browser Gate پیدا شود.
- Inventory لینک‌ها و fallback بر اساس label که در فاز ۱۳۸ اضافه شده بود حفظ شده است.

## قرارداد داده

- AppData Schema: v17
- Migration جدید: ندارد
- Dependency جدید: ندارد
- تغییر Product UI: ندارد
- تغییر Persisted Data: ندارد

## انتظار از Gate

پس از این فاز، `npm run check:release` باید از مرحله Navigation Syntax عبور کند و Freelancer Browser UX Smoke به اولین مرحله واقعی بعدی در Project Detail، Timer، Expense، Invoice یا Mobile Dialog برسد.
