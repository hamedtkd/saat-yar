# فاز ۱۴ — تجزیه جدول گزارش و اعمال قانون ۲۵۰ خط

در این فاز فایل `components/pages/reports/report-table.tsx` از یک فایل ۹۸۷ خطی به یک Facade کوچک و ماژول‌های متمرکز تبدیل شد.

## ساختار جدید

- `report-table.tsx`: انتخاب renderer بر اساس mode
- `table/employee-desktop-table.tsx`: جدول دسکتاپ کارمند
- `table/employee-mobile-cards.tsx`: کارت‌های موبایل کارمند
- `table/employee-report-table.tsx`: پوسته گزارش کارمند
- `table/freelancer-desktop-table.tsx`: جدول دسکتاپ فریلنسر
- `table/freelancer-mobile-cards.tsx`: کارت‌های موبایل فریلنسر
- `table/freelancer-report-table.tsx`: پوسته گزارش فریلنسر
- `table/print-preview-aside.tsx`: پنل چاپ و خروجی
- `table/report-table-shared.tsx`: محاسبات و اجزای مشترک جدول

تمام فایل‌های این بخش کمتر از ۲۵۰ خط هستند. تست معماری از بازگشت فایل بزرگ جلوگیری می‌کند.

## مرحله بعد

`report-charts.tsx` همچنان فایل بزرگ گزارش‌هاست و باید در فاز بعد به chart data hooks، tooltipها و کارت‌های نمودار کارمند/فریلنسر تقسیم شود.
