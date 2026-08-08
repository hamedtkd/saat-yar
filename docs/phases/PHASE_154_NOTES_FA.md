# فاز ۱۵۴ — Hotfix لینک Roadmap پیش از Tag 2.3.0

## دلیل فاز

اجرای واقعی Gate فاز ۱۵۳ روی Commit `12d2933` از ۵۸۱ تست، ۵۸۰ تست را پاس کرد. تنها Failure تست تاریخی `phase60-docs-agent-guide` بود که از README انتظار دارد مسیر منتقل‌شده نقشه راه یعنی `docs/roadmap/BACKLOG_FA.md` همچنان به‌صورت صریح لینک شده باشد.

در همان اجرا TypeScript، ESLint، Schema Audit و ۵۸۰ تست دیگر سبز بودند. Pairing Browser Smoke نیز انتقال مستقیم WebRTC شامل ۴ chunk رمزنگاری‌شده و ACK را پاس کرد.

## تغییر

- لینک صریح نقشه راه به README فارسی بازگردانده شد.
- README انگلیسی نیز برای تقارن مستندات به همان Roadmap لینک می‌دهد.
- Release Checklist و Release Notes مشخص می‌کنند که Commit فاز ۱۵۳ به‌دلیل Gate قرمز Tag نمی‌شود.
- Tag annotated `v2.3.0` فقط روی آخرین Commit فاز ۱۵۴ با Gate کامل `581/581` ساخته می‌شود.
- تست جدیدی اضافه نشده است؛ همان Regression تاریخی Phase 60 این قرارداد را نگهبانی می‌کند.

## قرارداد داده و محصول

- Package: `2.3.0`
- Manifest: `released`
- Schema: `v17`
- Migration جدید: ندارد
- Dependency جدید: ندارد
- تغییر Product UI: ندارد
- تعداد تست مورد انتظار: `581/581`

## Gate

```powershell
npm run check:release
npm run test:browser:pairing
git diff --check
git status
```

فقط بعد از سبزشدن کامل این Gate، Commit/Push فاز ۱۵۴ و سپس Tag نهایی انجام می‌شود.
