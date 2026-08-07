# فاز ۱۲۴ — Runtime Select Hotfix

## مسئله

پس از فاز ۱۲۱، `WorkspaceSwitcher` از `SelectLabel` رادیکس خارج از `SelectGroup` استفاده می‌کرد. این ترکیب در build/typecheck/lint قابل تشخیص نبود اما در Runtime با خطای زیر کل App Router را وارد error boundary می‌کرد:

`SelectLabel must be used within SelectGroup`

به همین دلیل هم نسخه مستقر روی Vercel صفحه «This page couldn’t load» نشان می‌داد و هم Production Browser Smoke پیش از رسیدن به Onboarding timeout می‌شد.

## اصلاح

- `SelectLabel` و آیتم‌های Workspace داخل `SelectGroup` رسمی Radix قرار گرفتند.
- Browser Smoke خطاهای `Runtime.exceptionThrown` را در خود CDP client نگه می‌دارد.
- `waitFor` در صورت مشاهده Runtime exception بلافاصله Fail می‌شود و Browser state را گزارش می‌کند؛ دیگر یک crash واقعی پشت timeout آنبوردینگ پنهان نمی‌شود.
- تست قراردادی فاز ۱۲۴ برای ساختار Select و fail-fast مرورگر اضافه شد.

## قرارداد داده

هیچ تغییری در Schema v17، Migration، Backup یا persisted data وجود ندارد.
