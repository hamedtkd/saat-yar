# چک‌لیست انتشار ساعت‌یار 2.1.0

این فایل آخرین کنترل انسانی پیش از ساخت Tag است. `npm run check:release` کنترل‌های ماشینی را اجرا می‌کند، اما جای بررسی دستی UI و Deploy نهایی را نمی‌گیرد.

## مشخصات Release Candidate

```text
Package: saatyar-worklog@2.1.0
AppData schema: v16
Node.js: 22.x
شواهد قبلی فاز ۹۸: 305 تست پاس
Browser gate: Chrome / Edge / Chromium
```

## کنترل خودکار

- [ ] `npm ci`
- [ ] `npm run check:release`
- [ ] `git diff --check`
- [ ] `git status` فقط تغییرات مورد انتظار Release را نشان دهد.
- [ ] خروجی `check:release:audit` نسخه ۲.۱.۰، Schema v16 و وضعیت `release-candidate` را تأیید کند.
- [ ] Smoke Test مرورگر پیام `Production browser smoke passed.` را نمایش دهد.

## داده و سازگاری

- [ ] Import یک Backup قدیمی و Migration آن تا Schema v16 بررسی شود.
- [ ] Export و Import Backup جدید بدون ورود متادیتای Envelope به `AppData` بررسی شود.
- [ ] بازیابی Snapshot اضطراری Local Storage بررسی شود.
- [ ] سطل بازیابی، بازیابی گروهی و پاک‌سازی رکوردهای منقضی بررسی شود.
- [ ] Merge دو Backup رکورد تکراری یا حذف ناخواسته ایجاد نکند.
- [ ] پاک‌کردن کامل داده از Factory مرکزی و Collectionهای مستقل استفاده کند.

## رابط، Responsive و RTL

- [ ] Routeهای `/today`، `/month`، `/reports`، `/leave`، `/projects`، `/clients`، `/invoices` و `/settings` مرور شوند.
- [ ] تم روشن، تاریک و System بررسی شود.
- [ ] پالت‌های Spotify، Emerald، Ocean، Violet، Sunset و Custom بررسی شوند.
- [ ] عرض‌های ۳۶۰، ۳۹۰، ۷۶۸، ۱۳۶۶، ۱۴۴۰ و ۱۹۲۰ پیکسل بررسی شوند.
- [ ] RTL، اعداد فارسی، متن‌های طولانی و Scroll داخلی تنظیمات بررسی شوند.
- [ ] Privacy Mode در کارت، جدول، نمودار، Tooltip، فیش و فاکتور بررسی شود.
- [ ] چاپ گزارش و فاکتور در اندازه A4 بررسی شود.

## جریان‌های اصلی محصول

- [ ] Onboarding کامل شود و Reload داده را حفظ کند.
- [ ] شروع کار، ناهار، وقفه، پایان کار و ویرایش رکورد تاریخی بررسی شوند.
- [ ] تغییر تاریخ با Draft ذخیره‌نشده هشدار صحیح نمایش دهد.
- [ ] حذف رکورد، Undo، انتقال به سطل بازیابی و Restore بررسی شوند.
- [ ] مالکیت تایمر میان دو Tab و انتقال کنترل بررسی شود.
- [ ] تعارض Draft و تاریخچه همگام‌سازی چند Tab بررسی شوند.
- [ ] Import، Export و Merge Backup از صفحه تنظیمات بررسی شوند.

## دسترسی‌پذیری

- [ ] حرکت کامل با Keyboard و Skip Link بررسی شود.
- [ ] Focus trap و بازگشت Focus در Alert Dialogها بررسی شود.
- [ ] Escape برای بستن Dialogها و جلوگیری از تعامل پشت Modal بررسی شود.
- [ ] Reduced Motion بررسی شود.
- [ ] کنتراست Accentهای روشن، تاریک و Custom بررسی شود.
- [ ] کنترل‌های فرم دارای Label و نام قابل‌دسترسی باشند.

## مستندات و انتشار

- [ ] `CHANGELOG.md` و Release Notes فارسی و انگلیسی مرور شوند.
- [ ] نسخه‌های `package.json`، `package-lock.json` و Manifest برابر `2.1.0` باشند.
- [ ] لینک‌های README و مستندات Release سالم باشند.
- [ ] Deploy نهایی Vercel بررسی شود.
- [ ] Manifest از `release-candidate` به وضعیت انتشار مورد توافق تغییر کند، در صورت استفاده از این فیلد پس از Tag.
- [ ] Tag امضاشده یا Annotated با نام `v2.1.0` ساخته شود.
- [ ] GitHub Release با متن `docs/releases/RELEASE_NOTES_2.1.0_FA.md` یا نسخه انگلیسی منتشر شود.

## ساخت Tag پس از تکمیل همه کنترل‌ها

```bash
git tag -a v2.1.0 -m "Saatyar 2.1.0"
git push origin v2.1.0
```
