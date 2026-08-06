# فاز ۹۹ — ممیزی انتشار و آماده‌سازی ساعت‌یار ۲.۱.۰

## هدف

تبدیل خروجی فازهای پایداری ۹۰ تا ۹۸ به یک Release Candidate منسجم، نسخه‌بندی‌شده و قابل ممیزی بدون افزودن قابلیت محصول یا تغییر قرارداد داده.

## تغییرات

- افزایش نسخه Package و Lockfile از `2.0.0` به `2.1.0`.
- ایجاد Release Manifest ماشینی در `docs/releases/2.1.0.json`.
- ایجاد Release Notes فارسی و انگلیسی.
- بازنویسی Changelog بالادستی برای نسخه ۲.۱.۰.
- به‌روزرسانی چک‌لیست انتشار برای Schema v16، ۳۰۵ تست و Smoke Test مرورگر Production.
- افزودن `scripts/release-audit.mjs` برای تطبیق نسخه، Schema، Node، Release Notes، Changelog، README و ترتیب Release Gate.
- بررسی خودکار اینکه تمام فایل‌های `*.test.ts` در دستور اصلی `npm test` حضور داشته باشند.
- افزودن `check:release:audit` میان Quality Check و Browser Smoke.
- افزودن تست قراردادی فاز ۹۹.
- به‌روزرسانی README فارسی و انگلیسی و بستن بخش آمادگی انتشار در بک‌لاگ.

## وضعیت داده

```text
Package version: 2.1.0
AppData schema: 16
Migration جدید: ندارد
Dependency جدید: ندارد
فرمت Backup: بدون تغییر
IndexedDB: بدون تغییر
```

## اجرای نهایی

```bash
npm ci
npm run check:release
git diff --check
git status
```

پس از بررسی دستی چک‌لیست انتشار و پوش Commit، Tag نسخه ساخته شود:

```bash
git tag -a v2.1.0 -m "Saatyar 2.1.0"
git push origin v2.1.0
```
