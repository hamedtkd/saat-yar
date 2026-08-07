# فاز ۱۳۵ — Release Gate Contract Hotfix

## هدف

بستن شکست کاذب Phase 99 بعد از اضافه شدن Freelancer Browser UX smoke به `check:release` در فاز ۱۳۴.

## علت شکست

خود `package.json` عمداً چهار مرحله‌ی Release Gate را اجرا می‌کرد، اما تست تاریخی `phase99-release-readiness.test.ts` هنوز فقط سه مرحله‌ی قدیمی را به‌صورت `deepEqual` انتظار داشت. بنابراین ۵۰۰ از ۵۰۱ تست پاس می‌شد و Gate پیش از رسیدن به Browser UX smoke متوقف می‌شد.

## تغییرات

- به‌روزرسانی قرارداد Phase 99 برای ترتیب فعلی Gate:
  1. `check:quality`
  2. `check:release:audit`
  3. `test:browser:production:built`
  4. `test:browser:freelancer:built`
- افزودن تست مستقل Phase 135 که وجود، ترتیب و build-once contract را ثابت می‌کند.
- حفظ Production/PWA smoke پیش از Freelancer smoke تا خروجی `out/` فقط یک بار ساخته شود.
- هیچ تغییر Business/UI/Data در این Hotfix انجام نشده است.

## قرارداد داده

- AppData Schema: v17
- Migration جدید: ندارد
- Dependency جدید: ندارد

## نتیجه مورد انتظار

بعد از این Hotfix، `npm test` باید از تست Phase 99 عبور کند و `check:release` برای اولین بار واقعاً به Freelancer Browser UX smoke برسد. اگر آن Smoke شکست بخورد، خطای آن یک مشکل Runtime/UX واقعی‌تر است و مبنای فاز ۱۳۶ خواهد بود.
