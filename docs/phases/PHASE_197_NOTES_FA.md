# فاز ۱۹۷ — Tooltip System + Production Observability

## هدف

بستن بدهی UX Tooltipهای سفارشی Month و افزایش پوشش Audit روی سطوح عمومی پس از 2.5.0، بدون تغییر AppData یا منطق دامنه.

## تغییرات

- استخراج primitive مشترک `FloatingTooltip` با Portal به `document.body`.
- محاسبه موقعیت pure و قابل تست با clamp افقی/عمودی نسبت به viewport.
- مهاجرت `DescriptionTooltip` و Activity Heatmap Tooltip به primitive مشترک.
- عرض محتوامحور محدود (`260px` عمومی، `220px` Heatmap)، wrap امن متن و Escape/Focus/Hover contract.
- گسترش `audit:production` از ۱۰ route به ۱۳ route با `/help/`, `/privacy/`, `/terms/`.
- همگام‌سازی Roadmap برای Phase195/196 و ثبت Phase197.

## محدودیت

- CLI رسمی shadcn در sandbox به registry دسترسی نداشت؛ dependency ناقص یا lockfile دستی اضافه نشد. primitive فعلی dependency-neutral است و contract رفتاری Radix/shadcn (Portal + focus/hover + viewport collision) را نگه می‌دارد.
- Schema v20 و package dependencyها بدون تغییر می‌مانند.
