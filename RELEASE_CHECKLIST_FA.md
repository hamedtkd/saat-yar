# چک‌لیست انتشار ساعت‌یار 2.3.0

این فایل کنترل انسانی Release نهایی نسخه ۲.۳.۰ است. Candidate روی commit prefix `75b7be6` با ۵۷۵ تست، Build کامل و Browser Smokeهای Production، Freelancer و Employee سبز شده و Pairing Browser Smoke نیز انتقال ۴ chunk رمزنگاری‌شده همراه ACK را پاس کرده است. فاز ۱۵۳ Finalization سورس را انجام داد؛ اجرای Gate آن یک شکست صرفاً مستنداتی در لینک Roadmap نشان داد و فاز ۱۵۴ همین قرارداد را قبل از ساخت Tag اصلاح می‌کند.

## وضعیت نسخه

```text
Package: 2.3.0
Schema: v17
Manifest status: released
Verified candidate commit: 75b7be6
Verified candidate tests: 575
Expected final tests: 581
Tag: v2.3.0
```

## Gate نهایی سورس

- [ ] `npm run check:release` بدون Warning یا Failure تمام شود.
- [ ] تعداد تست‌ها دقیقاً `581/581` باشد.
- [ ] TypeScript و ESLint سبز باشند.
- [ ] Next.js Static Build هر ۲۰ Route را تولید کند.
- [ ] PWA precache بدون خطا نهایی شود.
- [ ] Production Browser Smoke پاس شود.
- [ ] Freelancer Browser UX Smoke پاس شود.
- [ ] Employee Browser UX Smoke پاس شود و reference day برابر ۴۹۵ دقیقه / ۸:۱۵ باشد.
- [ ] `npm run test:browser:pairing` دوباره پاس شود و ۴ chunk رمزنگاری‌شده با ACK منتقل شوند.
- [ ] `git diff --check` بدون خروجی باشد.
- [ ] `git status` فقط تغییرات مورد انتظار فاز ۱۵۴ را نشان دهد.

## قرارداد Release

- [x] `package.json` و `package-lock.json` روی 2.3.0 هستند.
- [x] AppData Schema روی v17 باقی مانده و Migration جدیدی لازم نیست.
- [x] `docs/releases/2.3.0.json` وضعیت `released` دارد.
- [x] Candidate تأییدشده `75b7be6` و Gate `575` تست در Manifest حفظ شده‌اند.
- [x] شواهد Production/Freelancer/Employee/Pairing در Manifest ثبت شده‌اند.
- [x] Manifest فیلد `releaseCommit` ندارد تا self-reference ایجاد نشود.
- [x] Release Notes فارسی و انگلیسی، Changelog، READMEها و Docs index نسخه نهایی را معرفی می‌کنند.

## Commit و Tag نهایی

پس از سبز شدن Gate بالا:

```powershell
git add .
git commit -m "docs(release): restore roadmap link before 2.3.0 tag"
git push

git tag -a v2.3.0 -m "Saatyar 2.3.0"
git push origin v2.3.0
```

Tag annotated `v2.3.0` منبع حقیقت Commit نهایی انتشار است. قبل از ساخت Tag، `git status` باید Clean باشد و Tag نباید روی Candidate `75b7be6` ساخته شود؛ باید روی آخرین Commit سبز فاز ۱۵۴ قرار بگیرد؛ Commit فاز ۱۵۳ (`12d2933`) به‌دلیل شکست یک تست مستندات نباید Tag شود.
