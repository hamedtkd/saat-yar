# فاز ۱۶: ریفکتور صفحه گزارش و کنترل Importها

## هدف

- شکستن `reports-page.tsx` به کامپوننت‌ها و Hookهای کوچک‌تر
- جداکردن محاسبات گزارش از JSX
- استفاده واقعی از Primitiveهای مشترک مالی و Surface
- جلوگیری از خطاهای Build ناشی از Import محلی اشتباه یا فراموش‌شده

## ساختار جدید

```text
components/pages/reports/overview/
├── employee-summary.tsx
├── financial-charts-guard.tsx
├── freelancer-summary.tsx
├── month-summary.tsx
├── report-actions.tsx
├── types.ts
└── use-report-summary.ts
```

فایل `reports-page.tsx` از ۳۲۵ خط به کمتر از ۱۰۰ خط کاهش یافته و فقط orchestration انجام می‌دهد.

## Build safety

اسکریپت زیر اضافه شده است:

```bash
npm run check:imports
```

این دستور تمام Import و Exportهای محلی در `app`، `components`، `hooks`، `lib` و `tests` را بررسی می‌کند و اگر مسیر `@/` یا relative resolve نشود، قبل از TypeScript و Build شکست می‌خورد.

این بررسی به ابتدای `npm run check` نیز اضافه شده است.

## اصلاحات ضمنی

- JSX اضافه و نامعتبر در کارت فیش حقوقی حذف شد.
- نمایش مبالغ فیش حقوقی به `PrivateMoney` منتقل شد.
- `SurfaceCard` به شکل polymorphic درآمد تا برای section و عناصر semantic دیگر قابل استفاده باشد.
- تست معماری صفحه گزارش و محدودیت ۲۵۰ خط اضافه شد.
