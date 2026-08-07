# چک‌لیست انتشار ساعت‌یار 2.3.0

این فایل کنترل انسانی Release Candidate نسخه ۲.۳.۰ است. خط مبنای تأییدشده روی commit prefix `ff0177f` با ۵۶۹ تست، Build کامل و سه Browser Smoke تولید، فریلنسر و کارمند سبز است. فاز ۱۵۲ سورس Candidate را آماده می‌کند؛ Tag فقط پس از Gate سبز Candidate، Finalization فاز ۱۵۳ و Commit نهایی ساخته شود.

## مشخصات Release Candidate

```text
Package: saatyar-worklog@2.3.0
AppData schema: v17
Migration نسبت به 2.2.0: ندارد
Node.js: 22.x
Baseline commit prefix: ff0177f
Baseline verified tests: 569
Candidate expected tests: 575
Production browser gate: Chrome / Edge / Chromium
Freelancer browser gate: Client → Project → Time → Expense → Invoice
Employee browser gate: Attendance → Month → Reports → IndexedDB → Hard Reload → Mobile
Pairing browser gate: WebRTC encrypted multi-chunk transfer + ACK
Manifest status: release-candidate
```

## کنترل خودکار

- [ ] `npm ci`
- [ ] `npm run check:release`
- [ ] خروجی تست‌ها `575 pass / 0 fail` باشد.
- [ ] Production Smoke با `Production browser smoke passed.` تمام شود.
- [ ] Freelancer Smoke با `Freelancer browser UX smoke passed.` تمام شود.
- [ ] Employee Smoke با `Employee browser UX smoke passed.` تمام شود.
- [ ] `npm run test:browser:pairing`
- [ ] Browser Pairing انتقال چندبخشی رمزنگاری‌شده و ACK را تأیید کند.
- [ ] `git diff --check`
- [ ] `git status` فقط تغییرات مورد انتظار Release Candidate را نشان دهد.
- [ ] `check:release:audit` نسخه `2.3.0`، Schema v17، وضعیت `release-candidate` و baseline `ff0177f` را تأیید کند.

## داده، Backup و سازگاری

- [ ] `APP_DATA_SCHEMA_VERSION` همچنان 17 باشد.
- [ ] Upgrade از 2.2.0 به 2.3.0 بدون Migration جدید انجام شود.
- [ ] Backup v17 Export/Import بدون ورود Envelope metadata به AppData بررسی شود.
- [ ] مسیر Migration تاریخی v16→v17 همچنان پاس باشد.
- [ ] Backup با Schema جدیدتر از v17 رد شود.
- [ ] Recycle Bin، Recovery Snapshot، Merge Backup و Device Transfer داده را بدون حذف ناخواسته حفظ کنند.

## حالت کارمند

- [ ] Start/End روز و ویرایش دقیق ورود/خروج بررسی شود.
- [ ] ناهار و چند وقفه با Paid/Unpaid درست ذخیره شوند.
- [ ] سناریوی `08:00–17:00` با ناهار ۳۰ دقیقه و وقفه ۱۵ دقیقه بدون حقوق نتیجه `8:15` بدهد.
- [ ] یادداشت روز پس از Hard Reload از Textarea بازیابی شود.
- [ ] Month و Reports همان رکورد و Payroll Policy ذخیره‌شده را منعکس کنند.
- [ ] Mobile Today در عرض 390px بدون overflow افقی باشد.

## حالت فریلنسر

- [ ] ساخت Client با Validation و Enter submit بررسی شود.
- [ ] ساخت Project مرتبط از Dialog و Focus trap بررسی شود.
- [ ] Timer/Manual Time رابطه Client/Project را حفظ کنند.
- [ ] Expense در Context پروژه ذخیره شود.
- [ ] Invoice رابطه Client/Project، تاریخ جلالی و validation را حفظ کند.
- [ ] Hard Reload داده‌های Workflow را از IndexedDB بازیابی کند.

## PWA و رابط

- [ ] نصب PWA روی Chrome/Edge دسکتاپ بررسی شود.
- [ ] Reload آفلاین پس از یک بار بارگذاری Online بررسی شود.
- [ ] Update Prompt در حضور Draft ذخیره‌نشده reload ناگهانی ایجاد نکند.
- [ ] Routeهای `/today`، `/month`، `/reports`، `/leave`، `/projects`، `/clients`، `/invoices`، `/settings` و `/about` مرور شوند.
- [ ] تم روشن، تاریک، System و Accentهای قابل انتخاب بررسی شوند.
- [ ] RTL، Keyboard، Focus trap، Reduced Motion و کنتراست بررسی شوند.
- [ ] چاپ Reports و Invoice در A4 بررسی شود.

## انتقال دستگاه

- [ ] Pairing QR محلی روی دو دستگاه واقعی ترجیحاً در یک شبکه بررسی شود.
- [ ] Copy/Paste fallback بررسی شود.
- [ ] Offer منقضی‌شده رد شود.
- [ ] Preview additions/conflicts قبل از اعمال داده نمایش داده شود.
- [ ] Merge Keep-local و Prefer-incoming فقط با انتخاب صریح رفتار کنند.
- [ ] Replace و Reject هیچ تغییر ناخواسته‌ای ایجاد نکنند.
- [ ] تاریخچه انتقال Payload یا Session Key را ذخیره نکند.

## رسانه و مستندات

- [ ] Screenshotهای Today Light/Dark/Mobile و Reports در README فارسی و انگلیسی قابل نمایش باشند.
- [ ] `docs/assets/media/onboarding.gif` در README قابل نمایش باشد.
- [ ] `npm run media:capture` فقط Fixture نمایشی را استفاده کند.
- [ ] `CHANGELOG.md` بخش `[2.3.0] - 2026-08-08` داشته باشد.
- [ ] Release Notes فارسی و انگلیسی ۲.۳.۰ مرور شوند.
- [ ] نسخه‌های `package.json`، `package-lock.json` و Manifest همگی `2.3.0` باشند.
- [ ] Manifestهای تاریخی `2.2.0` و `2.1.0` دست‌نخورده باقی بمانند.

## نهایی‌سازی پس از تأیید Candidate

این بخش در فاز ۱۵۳ انجام می‌شود:

- [ ] Commit فاز ۱۵۲ به‌عنوان Candidate ثبت و Push شود.
- [ ] SHA Candidate و تعداد تست Candidate در Manifest نهایی ثبت شود.
- [ ] وضعیت `docs/releases/2.3.0.json` از `release-candidate` به `released` تغییر کند.
- [ ] `releaseCommit` از Manifest نهایی حذف شود؛ Tag annotated منبع حقیقت Commit نهایی باشد.
- [ ] `npm run check:release` روی سورس Final دوباره پاس شود.
- [ ] `npm run test:browser:pairing` روی Final دوباره پاس شود.
- [ ] سورس Final Commit و Push شود.
- [ ] Tag annotated `v2.3.0` دقیقاً روی Commit نهایی ساخته و Push شود.
- [ ] در صورت استفاده از GitHub Releases، Release 2.3.0 با Release Notes منتشر شود.

```bash
git tag -a v2.3.0 -m "Saatyar 2.3.0"
git push origin v2.3.0
```
