# Phase 192 — Behavioral Test Modernization

Baseline: `7fc0f48` (`fix(payroll): unify period compensation calculations`)

## هدف

کاهش وابستگی تست‌ها به متن سورس، نام فایل و regexهای شکننده بدون حذف guardهای معماری و release تاریخی.

## تغییرات

- منطق Report Summary از React hook به `lib/report-summary.ts` منتقل شد تا ورودی/خروجی واقعی آن مستقل از شکل داخلی component قابل تست باشد.
- تست Phase 191 برای Reports و Payroll Preview از خواندن source به مقایسه رفتار واقعی دو مسیر تبدیل شد.
- `scripts/audit-test-coupling.mjs` اضافه شد و در `npm run check` اجرا می‌شود.
- audit فعلی بدهی تاریخی را budget می‌کند و اجازه رشد آن را نمی‌دهد:
  - source-coupled test files: حداکثر 167
  - per-file `scripts.test` wiring assertions: حداکثر 36
- هر تست Phase 192 به بعد که برای اثبات Product behavior فایل repository را با `readFile/readFileSync` بخواند fail می‌شود.
- generic discovery یعنی `tests/**/*.test.ts` باید در `npm test` باقی بماند تا تست جدید نیازمند ثبت filename جداگانه نباشد.
- Architecture/release guards تاریخی حذف نشده‌اند؛ migration آن‌ها باید تدریجی و فقط وقتی behavioral replacement معادل وجود دارد انجام شود.

## مرز داده و انتشار

- AppData Schema: v20 بدون تغییر
- Package version: 2.4.0 بدون تغییر
- dependency جدید: ندارد
- package-lock: نباید تغییر کند

## Validation

- Phase 191 + Phase 192 behavioral tests باید سبز باشند.
- `npm run audit:tests` باید budget و no-new-coupling contract را تأیید کند.
- Full quality/release/browser gate روی محیط Windows توسعه اجرا می‌شود.

- Phase 112 stale Reports assertion was migrated to observable `createReportSummary` behavior; it no longer inspects the Reports/Today implementation names.
