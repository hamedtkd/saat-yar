# فاز ۱۵۹ — Final Release 2.3.1

## هدف

بسته‌بندی اصلاحات Post-release فازهای ۱۵۵ تا ۱۵۸ در یک Patch Release رسمی، بدون افزودن Feature جدید، Migration یا Dependency.

نسخه فعال از `2.3.0` به `2.3.1` افزایش می‌یابد. Manifest تاریخی ۲.۳.۰ دست‌نخورده باقی می‌ماند و Release Audit از این فاز روی Manifest فعال ۲.۳.۱ اجرا می‌شود.

## Baseline تأییدشده

Commit مرجع پیش از Finalization:

```text
7c675e1
```

شواهد ثبت‌شده روی این Commit:

- `npm run check:release`: 601/601
- Next.js production build: passed
- Production browser smoke: passed
- Freelancer browser smoke: passed
- Employee browser smoke: passed
- WebRTC pairing browser smoke: passed، چهار chunk رمزنگاری‌شده + ACK
- `npm run audit:vercel`: passed
- `npm run audit:production`: passed پس از Deploy
- Production PWA precache: 37 build assets

## محتوای Release 2.3.1

- فاز ۱۵۵: Audit واقعی دامنه Production.
- فاز ۱۵۶: اصلاح Parser مسیرهای Precache و حذف false negative.
- فاز ۱۵۷: قرارداد صریح Vercel Static Export و انتشار `out/`.
- فاز ۱۵۸: تشخیص روز غیرکاری `weeklySchedule` در Today و تقویم، با حفظ امکان ثبت کار استثنایی و جدایی از Holiday رسمی.

## تغییرات Finalization

- افزایش `package.json` و `package-lock.json` به `2.3.1`.
- ایجاد `docs/releases/2.3.1.json`.
- ایجاد Release Notes فارسی و انگلیسی ۲.۳.۱.
- انتقال آیتم‌های Unreleased فازهای ۱۵۵ تا ۱۵۸ به Changelog نسخه ۲.۳.۱.
- به‌روزرسانی READMEهای فارسی/انگلیسی، Docs index، Release Checklist و Roadmap.
- انتقال `scripts/release-audit.mjs` به Manifest فعال ۲.۳.۱.
- تبدیل قراردادهای Release ۲.۳.۰ و فازهای Post-release به تست‌های تاریخی تا افزایش Patch Version آن‌ها را نشکند.
- افزودن شش تست قرارداد فاز ۱۵۹.

## داده

- AppData Schema: v17
- Migration جدید: ندارد
- Dependency جدید: ندارد
- Tagهای تاریخی: بدون تغییر
- Manifest تاریخی 2.3.0: بدون تغییر

## Gate

فاز ۱۵۹ شش تست جدید اضافه می‌کند. Baseline برابر ۶۰۱ تست است، بنابراین انتظار نهایی:

```text
tests 607
pass 607
fail 0
```

قبل از Commit:

```bash
npm run check:release
npm run test:browser:pairing
npm run audit:vercel
git diff --check
git status
```

پس از Commit/Push و Ready شدن Deploy:

```bash
npm run audit:production
```

سپس در صورت سبز بودن Production:

```bash
git tag -a v2.3.1 -m "Saatyar 2.3.1"
git push origin v2.3.1
```

Tag annotated `v2.3.1` منبع حقیقت Commit نهایی انتشار است و Manifest نباید `releaseCommit` خودارجاع داشته باشد.
