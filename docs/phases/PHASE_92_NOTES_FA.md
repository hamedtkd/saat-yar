# فاز ۹۲ — Smoke Test مرورگر Production و Preflight وابستگی‌ها

## هدف

رفع خطاهای TypeScript باقی‌مانده از مهاجرت Alert Dialog رسمی و اضافه‌کردن تست واقعی مرورگر برای Build تولیدی بدون افزودن Playwright یا Dependency آزمایشی جدید.

## اصلاح خطای فاز ۹۱

Callback تمام Alert Dialogهای کنترل‌شده اکنون قرارداد صریح `open: boolean` دارد. این کار حتی در شرایطی که TypeScript هنوز پکیج Radix نصب‌نشده را resolve نکرده باشد، از خطای `implicit any` جلوگیری می‌کند.

پکیج `@radix-ui/react-alert-dialog` از فاز ۹۱ در `package.json` و Lockfile وجود دارد، اما پس از جایگزینی سورس باید یک‌بار `npm install` اجرا شود تا وارد `node_modules` شود.

## Dependency Preflight

فرمان جدید:

```bash
npm run check:dependencies
```

این بررسی پیش از Schema Audit و TypeScript اجرا می‌شود و اگر Dependency مستقیم نصب نشده باشد، نام پکیج و دستور اصلاح را نمایش می‌دهد. در نتیجه خطای مبهم `Cannot find module` به راهنمای عملی تبدیل می‌شود.

## Smoke Test واقعی Production

فرمان جدید:

```bash
npm run test:browser:production
```

این فرمان:

1. Build نهایی Next.js را می‌سازد.
2. `next start` را روی پورت آزاد اجرا می‌کند.
3. Chrome، Edge یا Chromium نصب‌شده را در حالت Headless باز می‌کند.
4. با Chrome DevTools Protocol و APIهای داخلی Node.js به مرورگر متصل می‌شود.
5. بارگذاری اولیه برنامه را بررسی می‌کند.
6. Onboarding را تا پایان طی می‌کند.
7. ورود به Route امروز را بررسی می‌کند.
8. تقویم شمسی را باز می‌کند و یک تاریخ واقعی دیگر را انتخاب می‌کند.
9. تغییر برچسب تاریخ و نبود Runtime Exception را کنترل می‌کند.

این تست Dependency جدیدی مانند Playwright اضافه نمی‌کند. مسیر مرورگر در صورت نیاز با `SAATYAR_BROWSER_PATH` قابل تعیین است.

## Release Check

```bash
npm run check:release
```

ابتدا Quality کامل و Build را اجرا می‌کند و سپس Smoke Test مرورگر را روی همان Build انجام می‌دهد.

## وضعیت داده

- Schema: نسخه ۱۶
- Migration جدید: ندارد
- تغییر در Backup یا IndexedDB: ندارد
- Dependency جدید: ندارد
