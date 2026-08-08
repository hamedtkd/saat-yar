# فاز ۱۵۵ — Audit پس از انتشار روی دامنه واقعی

نسخه `v2.3.0` در فاز ۱۵۴ با Gate کامل سبز و Tag نهایی منتشر شد. این فاز اولین مرحله پس از Release است و سورس Release/Manifest تاریخی 2.3.0 را تغییر نمی‌دهد.

دامنه Production مرجع:

```text
https://saat-yar.vercel.app/
```

مسیر ارسالی برای Settings نیز به‌صورت مستقیم در Audit پوشش داده می‌شود:

```text
https://saat-yar.vercel.app/settings/
```

## قرارداد Audit

اسکریپت `scripts/remote-production-audit.mjs` روی خود دامنه Deploy‌شده این موارد را بررسی می‌کند:

- پاسخ سالم تمام Routeهای عمومی Product؛ شامل Today، Month، Leave، Reports، Clients، Projects، Invoices، Settings و About.
- حفظ `lang=fa`، `dir=rtl`، هویت «ساعت‌یار» و لینک Manifest در HTML تولیدشده.
- Manifest نصب PWA با `start_url=/today/`، حالت standalone و آیکون‌های نصب.
- در دسترس بودن Service Worker و `pwa-precache-manifest.js` واقعی Build.
- در دسترس بودن سه PNG نصب PWA.
- `robots.txt`، `sitemap.xml` و حضور تمام Routeهای Auditشده در Sitemap.
- جلوگیری از Redirect شدن Routeها یا Assetها به Origin دیگر.

Audit داده کاربر را تغییر نمی‌دهد؛ فقط GETهای read-only به Production ارسال می‌کند.

## اجرا

```powershell
npm run audit:production
```

برای Audit دامنه دیگری:

```powershell
$env:SAATYAR_PRODUCTION_URL="https://example.com/"
npm run audit:production
```

یا:

```powershell
node scripts/remote-production-audit.mjs "https://example.com/"
```

## قرارداد نسخه

- Package: `2.3.0`
- Release Manifest: بدون تغییر و همچنان `released`
- Schema: `v17`
- Migration: ندارد
- Dependency جدید: ندارد
- Tag `v2.3.0`: تاریخی و بدون تغییر
