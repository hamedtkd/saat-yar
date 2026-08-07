# چک‌لیست انتشار ساعت‌یار 2.2.0

این فایل کنترل نهایی انتشار نسخه ۲.۲.۰ است. Candidate روی commit prefix `f659456` با ۴۲۳ تست، Production/Offline PWA Smoke و انتقال واقعی WebRTC شامل ۴ chunk رمزنگاری‌شده + ACK تأیید شده است. فاز ۱۲۰ سورس Release نهایی را آماده می‌کند؛ Tag فقط پس از سبزشدن Gate نهایی و Commit شدن همین سورس ساخته شود.

## مشخصات Release 2.2.0

```text
Package: saatyar-worklog@2.2.0
AppData schema: v17
Migration baseline: v16 → v17
Node.js: 22.x
شواهد تأییدشده پیش از فاز ۱۱۹: 417 تست پاس
تعداد تست Candidate تأییدشده فاز ۱۱۹: 423 تست
تعداد مورد انتظار Gate نهایی فاز ۱۲۰: 429 تست
Candidate commit prefix: f659456
Production browser gate: Chrome / Edge / Chromium
Pairing browser gate: WebRTC encrypted multi-chunk transfer + ACK
Manifest status: released
```

## کنترل خودکار

- [ ] `npm ci`
- [ ] `npm run check:release`
- [ ] خروجی تست‌ها `429 pass / 0 fail` باشد.
- [ ] `npm run test:browser:pairing`
- [ ] Browser Pairing حداقل یک انتقال چندبخشی رمزنگاری‌شده و ACK را تأیید کند.
- [ ] `git diff --check`
- [ ] `git status` فقط تغییرات مورد انتظار Release را نشان دهد.
- [ ] `check:release:audit` نسخه `2.2.0`، Schema v17، وضعیت `released` و شواهد Candidate `f659456` را تأیید کند.
- [ ] Production Smoke پیام `Installed shell reloads while offline` و `Production browser smoke passed.` را نمایش دهد.

## داده، Migration و Backup

- [ ] یک Backup مربوط به v16 Import شود و Policy حقوق به Schema v17 Migration شود.
- [ ] نتیجه Preset مهاجرت‌یافته با رفتار حقوق نسخه قبلی یکسان باشد.
- [ ] Export و Import Backup v17 بدون ورود metadata انتقال/Envelope به `AppData` بررسی شود.
- [ ] Backup با Schema جدیدتر از v17 توسط این نسخه رد شود.
- [ ] سطل بازیابی، بازیابی گروهی و پاک‌سازی رکوردهای منقضی بررسی شود.
- [ ] Merge Backup و Merge انتقال دستگاه داده تکراری یا حذف ناخواسته ایجاد نکند.

## حقوق قابل‌سفارشی‌سازی

- [ ] روش ماهانه متناسب با داده قدیمی نتیجه سازگار بدهد.
- [ ] ماهانه ثابت، ساعتی و روزکاری با Preview تنظیمات بررسی شوند.
- [ ] اضافه‌کاری، تعطیل‌کاری و کسرکار در حالت ضریب، نرخ ثابت و غیرفعال بررسی شوند.
- [ ] گردکردن مبلغ در حالت nearest/floor/ceil بررسی شود.
- [ ] Breakdown گزارش با جمع نهایی حقوق یکسان باشد.
- [ ] Draft، Save، Cancel و Unsaved Navigation Guard کارت Policy حقوق بررسی شوند.

## انتقال موبایل و لپ‌تاپ

- [ ] Pairing با QR محلی روی دو دستگاه واقعی ترجیحاً در یک Wi-Fi بررسی شود.
- [ ] Pairing با Copy/Paste به‌عنوان fallback بررسی شود.
- [ ] Offer منقضی‌شده رد شود.
- [ ] Preview قبل از اعمال داده، additions و conflicts را درست نمایش دهد.
- [ ] `Merge + Keep local` روی Conflict داده محلی را حفظ کند.
- [ ] `Merge + Use incoming` مقدار ورودی را فقط با انتخاب صریح اعمال کند.
- [ ] `Replace` فقط پس از انتخاب صریح کاربر انجام شود.
- [ ] Reject Preview هیچ تغییری در AppData ایجاد نکند.
- [ ] تاریخچه انتقال Payload یا Session Key را ذخیره نکند.
- [ ] Retry/Cancel و تکمیل نشست روی موبایل و دسکتاپ واضح باشد.

## PWA، رابط و Responsive

- [ ] نصب PWA روی Chrome/Edge دسکتاپ بررسی شود.
- [ ] Add to Home Screen در Safari iOS به‌صورت دستی بررسی شود.
- [ ] Reload آفلاین پس از حداقل یک بار بارگذاری Online بررسی شود.
- [ ] Update Prompt در حضور Draft ذخیره‌نشده بدون Reload ناگهانی عمل کند.
- [ ] Routeهای `/today`، `/month`، `/reports`، `/leave`، `/projects`، `/clients`، `/invoices` و `/settings` مرور شوند.
- [ ] تم روشن، تاریک، System و Accentهای قابل انتخاب بررسی شوند.
- [ ] عرض‌های ۳۶۰، ۳۹۰، ۷۶۸، ۱۳۶۶، ۱۴۴۰ و ۱۹۲۰ پیکسل بررسی شوند.
- [ ] RTL، متن‌های طولانی و Scroll داخلی تنظیمات بررسی شوند.
- [ ] چاپ گزارش و فاکتور در A4 بررسی شود.

## رسانه و مستندات

- [ ] Screenshotهای Light، Dark، Mobile و Reports در README فارسی و انگلیسی درست نمایش داده شوند.
- [ ] `docs/assets/media/onboarding.gif` در GitHub README قابل نمایش باشد.
- [ ] `npm run media:capture` بدون خواندن داده واقعی کاربر رسانه‌ها را بازتولید کند.
- [ ] `CHANGELOG.md` و Release Notes فارسی و انگلیسی مرور شوند.
- [ ] نسخه‌های `package.json`، `package-lock.json` و Manifest برابر `2.2.0` باشند.
- [ ] Manifest فعلی Schema v17 را ثبت کند و Manifest تاریخی 2.1.0 دست‌نخورده باقی مانده باشد.
- [ ] Deploy نهایی Vercel بررسی شود.

## دسترسی‌پذیری

- [ ] حرکت کامل با Keyboard و Skip Link بررسی شود.
- [ ] Focus trap و بازگشت Focus در Alert Dialogها بررسی شود.
- [ ] Reduced Motion بررسی شود.
- [ ] کنتراست Accentهای روشن، تاریک و Custom بررسی شود.
- [ ] Scanner دوربین و دکمه‌های Sync نام قابل‌دسترسی داشته باشند.

## نهایی‌سازی Release و Tag

سورس فاز ۱۲۰ Manifest را به `released` تبدیل کرده و شواهد Candidate تأییدشده را ثبت می‌کند. `releaseCommit` عمداً در Manifest وجود ندارد؛ SHA نهایی Commit نمی‌تواند به‌طور پایدار داخل همان Commit ذخیره شود. Tag annotated منبع حقیقت Commit انتشار است.

- [x] Candidate `f659456` با ۴۲۳ تست و هر دو Browser Gate تأیید شده است.
- [x] `docs/releases/2.2.0.json` از `release-candidate` به `released` تغییر کرده است.
- [x] شواهد Candidate شامل commit prefix، ۴۲۳ تست و WebRTC چهار-chunk در Manifest ثبت شده است.
- [x] قرارداد self-referential `releaseCommit` از Manifest فعال حذف شده است.
- [ ] `npm run check:release` روی سورس فاز ۱۲۰ با ۴۲۹/۴۲۹ تست پاس شود.
- [ ] `npm run test:browser:pairing` دوباره پاس شود.
- [ ] سورس نهایی Release Commit و Push شود.
- [ ] Tag annotated `v2.2.0` دقیقاً روی همان Commit نهایی ساخته و Push شود.
- [ ] در صورت استفاده از GitHub Releases، Release با Release Notes نسخه ۲.۲.۰ منتشر شود.

```bash
git tag -a v2.2.0 -m "Saatyar 2.2.0"
git push origin v2.2.0
```
