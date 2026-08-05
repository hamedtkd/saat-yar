# فاز ۴۳ — تثبیت Build و Suspense برای Search Params

## هدف

رفع خطای prerender مربوط به `useSearchParams` در مسیر `/_not-found` و جلوگیری از CSR bailout سراسری App Shell.

## تغییرات

- استفاده از `useSearchParams` از `SaatyarShell` خارج شد.
- کامپوننت کوچک `RouteSync` فقط مسئول خواندن Query تاریخ است.
- `RouteSync` داخل `Suspense` با fallback خالی رندر می‌شود.
- منطق انتخاب تاریخ از `/today?date=YYYY-MM-DD` حفظ شده است.
- تست Regression برای جلوگیری از بازگشت `useSearchParams` به Shell اضافه شد.

## Migration

ندارد. Schema همچنان نسخه ۱۳ است.
