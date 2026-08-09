# فاز ۱۶۵ — Final Release 2.3.2

## هدف

بسته‌بندی تغییرات فازهای ۱۶۰ تا ۱۶۴ در Patch Release رسمی `2.3.2`، بدون Feature جدید، Migration یا Dependency جدید.

## Baseline تأییدشده

فاز ۱۶۴ پیش از Finalization با این شواهد بسته شده است:

- `npm run check:release`: 633/633
- Production browser smoke: passed
- Freelancer browser smoke: passed
- Employee browser smoke: passed
- WebRTC pairing browser smoke: passed، چهار chunk رمزنگاری‌شده + ACK
- `npm run audit:vercel`: passed
- `npm run audit:production`: passed پس از Deploy
- Production PWA precache: 37 build assets

Commit مرجع فاز ۱۶۴ به‌صورت پویا با دستور آماده‌سازی Release ثبت می‌شود:

```text
e3c0a03
```

## محتوای Release 2.3.2

- فاز ۱۶۰: قرارداد کار خالص، ناهار باحقوق/بدون‌حقوق و خروج پیشنهادی.
- فاز ۱۶۱: پالیش Responsive و alignment برنامه کاری در Settings.
- فاز ۱۶۲: حذف GitHub Pages deployment بلااستفاده و همسوسازی CI با Vercel.
- فاز ۱۶۳: Resume امن نشست Auto-close و کنتراست بهتر Filled Accent controls.
- فاز ۱۶۴: README اصلی انگلیسی، README فارسی مستقل و Roadmap i18n آینده.

## تغییرات Finalization

- افزایش Package/Lockfile از `2.3.1` به `2.3.2`.
- ایجاد Manifest و Release Notes فارسی/انگلیسی ۲.۳.۲.
- انتقال Unreleased فازهای ۱۶۰ تا ۱۶۴ به Changelog ۲.۳.۲.
- به‌روزرسانی READMEها، Docs index، Checklist و Roadmap.
- انتقال Release Audit فعال به Manifest ۲.۳.۲ و تاریخی‌کردن قرارداد ۲.۳.۱.
- افزودن شش تست قرارداد فاز ۱۶۵.

## داده

- AppData schema: `v17`
- Migration جدید: ندارد
- Dependency جدید: ندارد
- Tagهای تاریخی: بدون تغییر
- Manifestهای تاریخی 2.3.1 و قبل‌تر: بدون تغییر

## Gate

فاز ۱۶۵ شش تست جدید اضافه می‌کند. Baseline برابر ۶۳۳ تست است، بنابراین انتظار نهایی:

```text
tests 639
pass 639
fail 0
```

پس از Replace و **قبل از Gate**:

```powershell
npm run release:prepare:2.3.2
```

این دستور فقط commit prefix فعلی `HEAD` را به‌عنوان Baseline فاز ۱۶۴ در Manifest/Docs ثبت می‌کند و باید روی HEAD همان Commitی اجرا شود که Phase 164 آن Deploy و Production-audit شده است.

سپس:

```powershell
npm run check:release
npm run test:browser:pairing
npm run audit:vercel
git diff --check
git status
```

پس از Commit/Push و Ready شدن Vercel:

```powershell
npm run audit:production
```

و فقط در صورت سبز بودن Production و یکی بودن `HEAD` و `origin/main`:

```powershell
git tag -a v2.3.2 -m "Saatyar 2.3.2"
git push origin v2.3.2
```
