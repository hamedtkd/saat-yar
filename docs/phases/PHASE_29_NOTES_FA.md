# فاز ۲۹ — بازطراحی مرخصی و گزارش‌ها + Theme Compliance

## هدف
هماهنگ‌کردن کامل صفحات گزارش و مرخصی با تم روشن، تاریک و Accent سفارشی، بدون تغییر رفتار محاسبات، فیلترها، خروجی‌ها یا Privacy Mode.

## تغییرات
- جایگزینی رنگ‌های ثابت در فرم‌ها، جدول‌ها، کارت‌های موبایل، KPIها و Empty Stateها با Design Tokenهای معنایی.
- اضافه‌شدن Tokenهای success، info، chart grid و رنگ ثانویه نمودار.
- Theme-aware شدن نمودارهای Recharts، محور، grid، legend، tooltip و dotها.
- Theme-aware شدن AlertBanner، StatusBadge و destructive Button.
- اصلاح Preview چاپ: پوسته تابع تم است ولی خود کاغذ همچنان برای چاپ واقعی خوانا باقی می‌ماند.
- اضافه‌شدن تست Theme Compliance برای جلوگیری از بازگشت bg-white، bg-black و Hex colorهای پراکنده.

## ریسک باقی‌مانده
- بررسی بصری در 360px، 390px، 1366px، 1440px و 1920px باید روی مرورگر واقعی انجام شود.
- خروجی چاپ باید در Chrome و Edge یک بار دستی بررسی شود.

## بررسی پیشنهادی
```bash
npm ci
npm run check:quality
```
