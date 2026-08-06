# فاز ۱۱ — بازآرایی کنترلر و جداسازی منطق از رابط کاربری

در این فاز `useSaatyarController` از یک فایل چندمسئولیتی به یک facade کوچک تبدیل شد.
منطق محاسبات، حضور، پروژه و مرخصی، پشتیبان، گزارش و اعلان‌ها در hookهای مستقل قرار گرفت.

## قانون معماری

- فایل‌های جدید و فایل‌های بازآرایی‌شده حداکثر ۲۵۰ خط هستند.
- component فقط orchestration و rendering را انجام می‌دهد.
- منطق domain و side effectها داخل custom hook یا ماژول `lib` قرار می‌گیرند.
- facade نباید دوباره به God Hook تبدیل شود.

## ماژول‌ها

- `use-controller-derived`: داده‌های مشتق‌شده و memoization
- `use-attendance-actions`: ورود، خروج، ناهار و وقفه
- `use-business-actions`: پروژه، مشتری، تایمر پروژه و مرخصی
- `use-backup-actions`: export/import و merge
- `use-report-actions`: خروجی CSV و Excel
- `use-notification-reminders`: مجوز و زمان‌بندی اعلان‌ها

## تست معماری

`npm run test:architecture` محدودیت ۲۵۰ خط را برای لایه کنترلر و وجود delegation را بررسی می‌کند.
فایل‌های بزرگ UI موجود در فاز بعدی به componentهای کوچک‌تر شکسته می‌شوند تا قانون ۲۵۰ خط در کل `components` برقرار شود.
