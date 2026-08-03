# فاز ۱۲ — رفع Build و ممیزی Reusable UI

## اصلاح بحرانی

پاک‌کردن همه داده‌ها در `DangerZone` یک شیء ناقص `AppData` می‌ساخت و فیلدهای `expenses` و `invoices` را جا می‌انداخت. این خطا باعث شکست TypeScript در Vercel شد.

اکنون تمام resetها از factory مرکزی `createInitialData()` استفاده می‌کنند. این factory ساختار کامل AppData را می‌سازد و nested settingها را نیز clone می‌کند تا state مشترک ناخواسته ایجاد نشود.

## ریفکتور Header

`app-header.tsx` از ۳۷۶ خط به یک facade کوچک تبدیل شد و navigation، actionها و workspace switcher در فایل‌های مستقل قرار گرفتند.

## ممیزی کامپوننت‌های مشترک

فایل `docs/REUSABLE_COMPONENT_AUDIT.md` کامپوننت‌های موجود، کاندیداهای extraction و معیار تصمیم‌گیری را ثبت می‌کند.

## گام بعد

شکستن فایل‌های بزرگ reports و today و تبدیل الگوهای تکراری به `SurfaceCard`، `EmptyState`، `AlertBanner` و `PrivateMoney`.
