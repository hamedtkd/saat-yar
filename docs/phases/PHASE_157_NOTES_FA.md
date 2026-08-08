# فاز ۱۵۷ — قرارداد Deploy استاتیک Vercel برای PWA نهایی‌شده

Audit واقعی Production در فازهای ۱۵۵ و ۱۵۶ نشان داد Routeها، Manifest و Browser Journeyها سالم‌اند، اما فایل `pwa-precache-manifest.js` روی دامنه Production هنوز همان placeholder سورس را سرو می‌کند:

```js
self.__SAATYAR_PRECACHE = [];
```

در حالی که `npm run build:vercel` بعد از `next build` فایل نهایی را داخل `out/` با Assetهای واقعی `_next/static/...` بازنویسی می‌کند. بنابراین مشکل Product یا generator نیست؛ قرارداد Deploy باید صریحاً خروجی نهایی `out/` را منتشر کند.

## اصلاح Deploy

`vercel.json` اکنون Vercel را به‌عنوان یک Static Host برای خروجی exportشده تنظیم می‌کند:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": null,
  "buildCommand": "npm run build:vercel",
  "outputDirectory": "out"
}
```

این قرارداد سه نکته را قطعی می‌کند:

- `framework: null` یعنی Framework Preset روی **Other** قرار می‌گیرد و Next.js adapter دیگر فایل placeholder موجود در `public/` را به‌عنوان خروجی نهایی انتخاب نمی‌کند.
- `buildCommand` همچنان `next build` و سپس `finalize-static-pwa.mjs` را اجرا می‌کند.
- `outputDirectory: out` باعث می‌شود فقط Static Export نهایی‌شده، شامل `pwa-precache-manifest.js` واقعی، منتشر شود.

`next.config.ts` همچنان `output: "export"` و `trailingSlash: true` دارد؛ بنابراین Routeهای فعلی `/settings/` و دیگر مسیرهای directory-index حفظ می‌شوند.

## Audit محلی جدید

```powershell
npm run audit:vercel
```

این دستور بدون نیاز به Vercel CLI بررسی می‌کند که Framework Preset، Build Command، Output Directory، Static Export و PWA finalizer با هم سازگار باشند.

## ترتیب تأیید این فاز

قبل از Push:

```powershell
npm run check:release
npm run test:browser:pairing
npm run audit:vercel
git diff --check
git status
```

`npm run audit:production` **قبل از Push قرار نیست سبز شود** چون دامنه هنوز Deployment قبلی را سرو می‌کند. پس از سبز شدن Gateهای محلی، فاز ۱۵۵ تا ۱۵۷ با یک Commit Push می‌شوند تا Vercel Deployment تازه بسازد. بعد از پایان Deploy:

```powershell
npm run audit:production
```

باید Precache واقعی و حداقل یک `_next/static/...` را روی دامنه Production پیدا کند.

## قرارداد نسخه

- Package: `2.3.0`
- Release Manifest: بدون تغییر و همچنان `released`
- Schema: `v17`
- Migration: ندارد
- Dependency جدید: ندارد
- Tag `v2.3.0`: تاریخی و بدون تغییر
- تغییر Product/UI: ندارد؛ فقط قرارداد Deploy پس از Release اصلاح شده است.
