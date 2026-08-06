# راهنمای سریع Agentها و مشارکت‌کنندگان ساعت‌یار

این فایل نقطه شروع Agentهای کدنویسی و توسعه‌دهندگان انسانی است.

- راهنمای جامع فارسی: [`docs/agents/AGENT_GUIDE_FA.md`](./docs/agents/AGENT_GUIDE_FA.md)
- English agent guide: [`docs/agents/AGENT_GUIDE_EN.md`](./docs/agents/AGENT_GUIDE_EN.md)
- چک‌لیست تغییرات حساس: [`docs/agents/CHANGE_CHECKLISTS.md`](./docs/agents/CHANGE_CHECKLISTS.md)

## قبل از هر تغییر

1. `README.md`، این فایل و راهنمای کامل Agent را بخوان.
2. وضعیت Git را بررسی کن و روی Working Tree ناشناخته یا آلوده بازنویسی انجام نده.
3. وضعیت فعلی را با `npm run check:quality` بررسی کن.
4. مالک واقعی رفتار را پیدا کن؛ تست را به نام تابع داخلی یا ساختار موقت وابسته نکن.
5. تغییر را کوچک، قابل بازبینی و همراه تست Regression نگه دار.

## قراردادهای غیرقابل مذاکره

- رابط کاربری فارسی، RTL، Local-first و قابل استفاده در تم روشن و تاریک باقی بماند.
- فایل‌های Production تا حد امکان کمتر از ۲۵۰ خط باشند.
- از توکن‌های Semantic تم استفاده کن؛ رنگ ثابت Tailwind برای سطح، متن و وضعیت نساز.
- برای کامپوننت عمومی جدید، ابتدا کامپوننت رسمی shadcn/ui را نصب و با Design System پروژه سفارشی کن. از ساخت نسخه دست‌ساز موازی خودداری کن.
- داده‌های کاربر بدون Migration معتبر تغییر نکنند.
- هر تغییر Schema باید Factory، Normalization، Migration، Backup، Recovery، Merge و Audit را هم‌زمان بررسی کند.
- تنظیمات در حالت ذخیره خودکار خاموش باید Draft، ذخیره و انصراف داشته باشند.
- مستندات هر فاز فقط در `docs/phases/` قرار می‌گیرند؛ فایل فاز جدید را در ریشه پروژه نساز.
- بک‌لاگ مرجع در `docs/roadmap/BACKLOG_FA.md` است.

## کنترل کیفیت

```bash
npm ci
npm run check:quality
npm run check:release
```

برای تغییر صرفاً مستنداتی نیز حداقل تست قراردادی مرتبط را اجرا کن. هیچ Agentی نباید شکست TypeScript، lint، تست، Build یا Smoke Test را نادیده بگیرد یا تست را صرفاً برای سبزشدن حذف کند.
