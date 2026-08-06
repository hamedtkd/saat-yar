# فاز ۹۳ — سخت‌سازی Smoke Test خروجی Static

## هدف

رفع خطاهای واقعی فاز ۹۲ روی Windows و هماهنگ‌کردن تست مرورگر Production با معماری فعلی Next.js که از `output: export` استفاده می‌کند.

## اصلاح TypeScript

تابع کشف Chrome و Edge دیگر `NodeJS.ProcessEnv` کامل نمی‌خواهد. قرارداد ورودی آن `Record<string, string | undefined>` است؛ بنابراین Fixture تست لازم نیست `NODE_ENV` مصنوعی داشته باشد.

فیلتر مسیرهای مرورگر نیز Type Guard صریح دارد و خروجی همیشه `string[]` است. در نتیجه Callbackهای `endsWith` دیگر مقدار احتمالی `undefined` دریافت نمی‌کنند.

## سرور Static داخلی

`next start` با `output: export` سازگار نیست. Smoke Test اکنون به‌صورت مستقیم پوشه `out/` را با یک HTTP Server داخلی Node.js سرو می‌کند.

سرور جدید این موارد را پوشش می‌دهد:

- `out/index.html` برای مسیر ریشه
- مسیرهای دارای `trailingSlash` مانند `/today/`
- Assetهای واقعی `/_next/static/`
- MIME Typeهای CSS، JavaScript، فونت و تصویر
- Cache طولانی برای Assetهای Hashشده Next.js
- پاسخ `404.html` برای مسیر ناشناخته
- جلوگیری از خروج مسیر درخواست از پوشه `out/`

هیچ Dependency جدیدی برای سرو خروجی اضافه نشده است.

## پایداری نصب Windows

خطاهای متوالی فایل‌های گم‌شده Lucide نتیجه نصب ناقص `node_modules` بودند. راهنمای پاک‌سازی نصب Windows و توضیح هشدار غیرکشنده `EPERM` به مستندات اجرا اضافه شد.

## تست‌های Regression

تست فاز ۹۳ بررسی می‌کند:

- Browser discovery با Environment ناقص Type-safe باقی بماند.
- تمام Candidateها رشته باشند.
- مسیر ریشه، Route و Asset خروجی Static درست resolve شوند.
- سرور داخلی Route، Asset، MIME، Cache و صفحه ۴۰۴ را واقعاً سرو کند.

## وضعیت داده

- Schema: نسخه ۱۶
- Migration جدید: ندارد
- تغییر در Backup یا IndexedDB: ندارد
- Dependency جدید: ندارد
