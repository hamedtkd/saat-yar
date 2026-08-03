# ممیزی کامپوننت‌های قابل استفاده مجدد

این سند از فاز ۱۲ به‌عنوان چک‌لیست جلوگیری از تکرار UI نگهداری می‌شود.

## کامپوننت‌های مشترک موجود

- `Button`: همه دکمه‌های عملیاتی و آیکنی
- `StatusBadge`: وضعیت‌های کامل/ناقص و موفق/ناموفق
- `MetricCard`: KPIهای متنی همراه آیکن و tone
- `Brand`: هویت بصری Header و Onboarding
- `MinuteDurationField`: ورودی مدت زمان
- `JalaliDatePicker` و `TimePicker`: انتخاب تاریخ و ساعت
- `Select`: انتخابگر عمومی بر پایه Radix

قبل از ساخت Badge، Button، KPI یا Card جدید باید این فهرست بررسی شود.

## موارد استخراج‌شده در فاز ۱۲

Header به اجزای مستقل زیر تقسیم شد:

- `HeaderNav`
- `HeaderActions`
- `WorkspaceSwitcher`
- `nav-items`

فایل اصلی `app-header.tsx` اکنون فقط orchestration و redirectهای مرتبط با mode را نگه می‌دارد.

## کاندیداهای فازهای بعد

| الگو | محل‌های تکرار | اقدام پیشنهادی |
|---|---|---|
| کارت سطح صفحه | reports، month، settings، projects | `SurfaceCard` با padding/tone قابل تنظیم |
| وضعیت خالی | month، reports، clients، invoices | `EmptyState` مشترک |
| ردیف جزئیات آیکن‌دار | month day details، invoice، project detail | `DetailStat` |
| نوار هشدار | today، budget، storage، record health | `AlertBanner` با severity |
| عنوان Section | settings و reports | `SectionHeader` |
| مقدار مالی مخفی‌شونده | payroll، projects، invoices، reports | `PrivateMoney` به‌جای شرط‌های پراکنده |
| Progress ring/bar | today و project budget | Primitive مشترک progress |

## قانون تصمیم‌گیری

یک UI باید استخراج شود اگر حداقل یکی از این شرایط برقرار باشد:

1. در دو محل یا بیشتر با markup و رفتار مشابه تکرار شده باشد.
2. بیش از یک مسئولیت یا بیش از ۸۰ خط JSX داشته باشد.
3. دارای منطق نمایش مستقل، accessibility یا حالت‌های variant باشد.
4. تست مستقل آن ارزش داشته باشد.

استخراج صرفاً برای کم‌کردن تعداد خطوط، بدون مرز معنایی روشن، ممنوع است.
