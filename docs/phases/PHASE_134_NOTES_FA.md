# فاز ۱۳۴ — Browser UX Smoke مسیر فریلنسر

## هدف

تبدیل Audit فرم‌های فاز ۱۳۳ به یک Gate رفتاری روی خروجی Production، به‌جای اتکا صرف به Regex سورس.

## تغییرات

- رفع ناسازگاری تست فاز ۱۳۳ با target فعلی ES2017؛ فلگ Regex `/s` حذف شد.
- افزودن `scripts/freelancer-browser-ux-smoke.mjs` روی خروجی واقعی `out/`.
- Fixture مرورگر با فضای کاری Freelancer و بدون Client/Project/Time/Expense/Invoice اولیه.
- اجرای مسیر واقعی `Client → Project → Time Entry → Expense → Invoice`.
- بررسی Validation درون‌فرمی Client قبل از ذخیره.
- بررسی Submit با Enter برای Client و Expense.
- بررسی Focus خودکار و Focus trap دیالوگ Quick Project/Quick Client.
- بررسی شروع/پایان Timer واقعی پروژه و ایجاد Time Entry.
- بررسی اتصال Client و Project در Invoice از طریق Select واقعی Radix.
- اجرای بخش پایانی Smoke در viewport موبایل `390×844` و کنترل overflow و fit شدن Dialog.
- اتصال Smoke جدید به `check:release` بعد از Production/PWA smoke.

## قرارداد داده

- AppData Schema: v17
- Migration جدید: ندارد
- Dependency جدید: ندارد
- داده Smoke فقط در Browser Profile موقت ساخته می‌شود و به داده واقعی کاربر دست نمی‌زند.

## نتیجه مورد انتظار

`check:release` تنها زمانی سبز است که علاوه بر Unit/Architecture/Build/PWA، مسیر اصلی Freelancer نیز روی Browser واقعی قابل انجام باشد.
