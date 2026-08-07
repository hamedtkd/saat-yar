# فاز ۱۴۶ — همگام‌سازی Employee Browser Smoke با Checkbox native

## مسئله واقعی

Gate فاز ۱۴۵ از TypeScript، Lint، ۵۴۶/۵۴۶ تست، Build، Production Smoke و Freelancer Smoke عبور کرد. Employee Browser Journey نیز Start و Lunch را رد کرد، اما در مرحله تثبیت وقفه بدون حقوق با خطای زیر متوقف شد:

```text
Break paid/unpaid control not found.
```

بررسی DOM contract نشان داد `Checkbox` مشترک ساعت‌یار یک `input[type="checkbox"]` واقعی است. Smoke هنوز قرارداد قدیمی Radix (`role="checkbox"` + `data-state`/`aria-checked`) را جست‌وجو می‌کرد؛ بنابراین کنترل موجود در UI را نمی‌دید.

## اصلاح

- `ensureFirstBreakUnpaid` اکنون مستقیماً `input[type="checkbox"][aria-label="وقفه 1 با حقوق"]` را پیدا می‌کند.
- وضعیت از property استاندارد `HTMLInputElement.checked` خوانده می‌شود.
- اگر checked باشد، click واقعی روی همان input انجام می‌شود و سپس `checked === false` تأیید می‌شود.
- وابستگی Harness به `role="checkbox"`، `data-state` و `aria-checked` حذف شد.
- Product UI فاز ۱۴۳ تغییر نکرده است؛ این فاز فقط Browser Harness را با قرارداد واقعی Design System همگام می‌کند.
- تست فاز ۱۴۵ نیز از شماره ثابت Release Candidate مستقل شد تا Hotfixهای بین راه stale-test جدید تولید نکنند.

## قرارداد داده

- AppData Schema: v17
- Migration جدید: ندارد
- Dependency جدید: ندارد
- تغییر Persistence: ندارد
- تغییر UI محصول: ندارد

## Release sequencing

Release Candidate نسخه 2.3.0 فقط بعد از سبزشدن کامل Employee Browser Journey شروع می‌شود. به همین دلیل Candidate به فاز ۱۴۷ و Final Release به فاز ۱۴۸ منتقل شد.
