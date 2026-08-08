# ساعت‌یار ۲.۳.۱ — یادداشت انتشار

نسخه **۲.۳.۱** یک Patch Release روی ۲.۳.۰ است. این نسخه قابلیت بزرگ جدیدی به محصول اضافه نمی‌کند؛ هدف آن بسته‌بندی و انتشار چهار اصلاح پس از ۲.۳.۰ است: Audit واقعی Production، اصلاح تشخیص Precache، قرارداد صریح Deploy استاتیک Vercel و آگاهی صفحه «امروز» از روزهای تعطیل طبق برنامه کاری.

Baseline تأییدشده برای این Release، commit prefix `7c675e1` است. روی آن **۶۰۱/۶۰۱ تست**، Build کامل Next.js، Browser Smokeهای Production/Freelancer/Employee، Pairing مستقیم WebRTC، `audit:vercel` و Audit پس از Deploy روی دامنه واقعی Production همگی پاس شده‌اند. فاز ۱۵۹ شش تست قراردادی Release اضافه می‌کند؛ بنابراین Gate نهایی این سورس باید به **۶۰۷/۶۰۷** برسد.

## مهم‌ترین تغییرات نسبت به ۲.۳.۰

### Production و PWA

- دستور `npm run audit:production` مسیرهای عمومی، App Shell فارسی/RTL، PWA Manifest، Service Worker، Precache، آیکن‌های نصب، robots و sitemap را روی `https://saat-yar.vercel.app/` بررسی می‌کند.
- Parser Precache با فرمت واقعی `self.__SAATYAR_PRECACHE` و مسیرهای نسبی `_next/static/...` هماهنگ شد تا false negative قبلی حذف شود.
- Audit علاوه بر شمارش Assetها، reachability اولین Build Asset را نیز بررسی می‌کند.
- قرارداد Vercel صریح شد: Framework Preset روی `Other`، Build با `npm run build:vercel` و انتشار فقط از `out/`.
- خروجی Production تأییدشده شامل **۳۷ Build Asset** در Precache است.

### روز غیرکاری طبق برنامه

- اگر یک روز در `weeklySchedule` غیرفعال باشد، صفحه «امروز» آن را صریحاً **«تعطیل طبق برنامه کاری»** نمایش می‌دهد.
- ساعت موظفی آن روز صفر است و دلیل صفر بودن هدف به‌جای پیام عمومی «روز بدون هدف» توضیح داده می‌شود.
- ثبت کار استثنایی همچنان ممکن است، اما CTA آن از شروع روز عادی جداست.
- تقویم جلالی روزهای غیرکاری برنامه را با وضعیت بصری مستقل نشان می‌دهد.
- این وضعیت عمداً به `holiday=true` تبدیل نمی‌شود و با تعطیلی رسمی، جمعه یا Holiday Pay مخلوط نمی‌شود.

## داده و سازگاری

- AppData Schema همچنان **v17** است.
- Migration جدیدی وجود ندارد.
- Dependency جدیدی اضافه نشده است.
- Backupهای v17 و مسیرهای Migration تاریخی بدون تغییر باقی مانده‌اند.
- Manifest و Tagهای تاریخی `v2.3.0`، `v2.2.0` و `v2.1.0` تغییر نمی‌کنند.

## Gate نهایی ۲.۳.۱

پیش از Commit نهایی:

```bash
npm run check:release
npm run test:browser:pairing
npm run audit:vercel
git diff --check
git status
```

انتظار تست:

```text
tests 607
pass 607
fail 0
```

پس از Commit و Push فاز ۱۵۹ و Ready شدن Deployment جدید Vercel:

```bash
npm run audit:production
```

اگر Audit Production نیز سبز بود، Tag annotated نسخه روی همان Commit نهایی ساخته می‌شود:

```bash
git tag -a v2.3.1 -m "Saatyar 2.3.1"
git push origin v2.3.1
```

Manifest عمداً فیلد `releaseCommit` ندارد؛ Tag annotated `v2.3.1` منبع حقیقت Commit نهایی انتشار است.
