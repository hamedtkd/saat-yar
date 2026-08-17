# فاز ۱۸۱ — Onboarding & First-run UX

## مسئله

بعد از Release `2.4.0`، آنبوردینگ از نظر قابلیت کامل بود اما برای کاربر جدید هنوز بیش از حد طولانی می‌شد: حتی کاربری که فقط می‌خواست سریع وارد Today شود باید از مسیر هفت‌مرحله‌ای عبور می‌کرد. علاوه بر آن، برنامه کاری برای روزهای مشابه نیاز به ویرایش تکراری داشت و کاربر فریلنسر بعد از خروج از Wizard لزوماً نمی‌دانست اولین اقدام عملی چیست.

## Baseline

- Release پایدار: `v2.4.0`
- Commit نهایی Release: `71f67329d8a0b8adb0da3011e8e5fcd30ade1785`
- Gate Release: `770/770`
- AppData Schema: `v17`

## تغییرات اصلی

### ۱. Fast Setup بدون حذف Wizard کامل

- مسیر هفت‌مرحله‌ای موجود حفظ شده تا Recovery، Re-entry و تنظیم جزئی همچنان در دسترس باشند.
- در مرحله Workspace یک CTA صریح `Fast setup` اضافه شده که با Defaultهای امن فعلی کاربر را مستقیم وارد محصول می‌کند.
- در First-run دکمه `Skip for now` اضافه شده تا کاربر بتواند ادامه تنظیمات را به Settings موکول کند.
- Re-entry از Settings همچنان مسیر کامل Wizard را نگه می‌دارد و Skip اولیه در آن نمایش داده نمی‌شود.

### ۲. Apply schedule to all enabled days

- Helper دامنه `applyScheduleDayToEnabledDays` اضافه شد.
- از هر ردیف روز فعال می‌توان Start/End/Lunch/Lunch-paid همان روز را روی همه روزهای فعال اعمال کرد.
- روزهای غیرفعال عمداً دست‌نخورده می‌مانند.
- `weeklyMinutes` بعد از Bulk Apply از Schedule واقعی دوباره محاسبه می‌شود.

### ۳. اولین اقدام روشن بعد از Onboarding

- تکمیل، Fast Setup یا Skip اولیه یک marker کوچک Local-first خارج از AppData ایجاد می‌کند.
- در اولین ورود به Today یک کارت راهنمای موقت نمایش داده می‌شود.
- Employee و Hybrid مستقیماً CTA «شروع کار امروز» می‌گیرند.
- Freelancer بر اساس وضعیت واقعی داده هدایت می‌شود: ساخت Client، ساخت Project، یا انتخاب Project و شروع Timer.
- Marker راهنما هیچ داده کاری، مالی یا محتوای شخصی ذخیره نمی‌کند و با شروع واقعی کار یا dismiss دیگر مزاحم جریان عادی نیست.

### ۴. Responsive polish

- Footer آنبوردینگ روی موبایل به‌صورت fixed و safe-area aware در دسترس می‌ماند تا Continue/Skip هنگام فرم‌های بلند از viewport خارج نشوند.
- CTA Fast Setup در موبایل ستونی و در نمایشگر بزرگ افقی می‌شود.
- First-run guide با توکن‌های Semantic و layout واکنش‌گرا پیاده‌سازی شده و با RTL/LTR سازگار است.

## تصمیم معماری

- Flow تاریخی هفت مرحله‌ای و `OnboardingStep` تغییر Schema نمی‌دهند؛ بنابراین sessionهای نیمه‌تمام نسخه 2.4.0 همچنان قابل Resume هستند.
- وضعیت First-run guide در Local Storage مستقل از `AppData` است تا Backup/Migration و promise محلی داده‌های اصلی تغییر نکند.
- Bulk schedule در helper دامنه قرار دارد و UI فقط آن را فراخوانی می‌کند.
- هیچ تنظیم Advanced از AppData حذف نشده است؛ Payroll، Appearance، Import و برنامه کاری دقیق همچنان از Settings و Re-entry قابل دسترسی‌اند.

## داده و Dependency

- AppData Schema: `v17`
- Migration جدید: ندارد
- Dependency جدید: ندارد
- Manifest تاریخی `2.4.0` تغییر نمی‌کند.

## تست و Gate

Phase 181 شش قرارداد جدید اضافه می‌کند؛ هدف تست پایه از `770` به `776` می‌رسد.

Gate پیشنهادی:

```powershell
npm run check:quality
npm run test:browser:production:built
npm run test:browser:freelancer:built
npm run test:browser:employee:built
npm run test:browser:pairing
npm run audit:vercel
git diff --check
git status
```

Production Browser Smoke علاوه بر مسیر کامل تاریخی، ظاهرشدن First-run action guide بعد از تکمیل Onboarding را نیز بررسی می‌کند.

## Visual QA لازم قبل از Commit

به‌دلیل تغییر UI، قبل از Commit باید حداقل این Matrix دیده شود:

- Desktop فارسی RTL — Fast Setup، Skip، Schedule Apply، First-run guide
- Mobile فارسی RTL — Footer ثابت و CTAها بدون overflow
- Desktop English LTR — Fast Setup و First-run guide
- Mobile English LTR — Schedule row و First-run guide
- Light و Dark برای کارت First-run و Footer آنبوردینگ

## Commit پیشنهادی

```text
feat(onboarding): streamline first-run setup
```
