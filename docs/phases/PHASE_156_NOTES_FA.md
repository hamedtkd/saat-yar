# فاز ۱۵۶ — اصلاح False Negative در Audit Precache Production

فاز ۱۵۵ در تمام Gateهای محلی و Browser Journeyها سبز شد و Audit دامنه واقعی نیز Routeها و Manifest را تأیید کرد، اما هنگام بررسی `pwa-precache-manifest.js` با پیام «بدون Next.js build assets» متوقف شد.

این شکست از Production نبود؛ قرارداد Audit با فرمت واقعی generator هم‌راستا نبود. `scripts/finalize-static-pwa.mjs` مسیر Assetها را به‌صورت نسبی می‌نویسد:

```text
_next/static/...
```

اما Audit فاز ۱۵۵ فقط الگوی دارای slash ابتدایی را می‌شمرد:

```text
/_next/static/...
```

## اصلاح

- `pwa-precache-manifest.js` اکنون از assignment واقعی `self.__SAATYAR_PRECACHE = [...]` parse می‌شود.
- مسیرهای `_next/static/...` و `/_next/static/...` هر دو معتبر شناخته می‌شوند.
- Audit علاوه بر شمارش، اولین Build Asset ثبت‌شده در Precache را از همان Origin درخواست می‌کند تا وجود واقعی Asset نیز تأیید شود.
- پیام خطا در صورت نبود Build Asset چند ورودی نخست Manifest را برای diagnosis نشان می‌دهد.

## قرارداد نسخه

- Package: `2.3.0`
- Release Manifest: بدون تغییر و همچنان `released`
- Schema: `v17`
- Migration: ندارد
- Dependency جدید: ندارد
- Tag `v2.3.0`: تاریخی و بدون تغییر
- تغییر Product/UI: ندارد؛ فقط Post-release audit tooling اصلاح شده است.
