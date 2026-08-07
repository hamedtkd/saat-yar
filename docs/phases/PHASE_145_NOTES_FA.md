# فاز ۱۴۵ — رفع TypeScript contract در Browser Debug Startup

## مسئله

فاز ۱۴۴ در Runtime یک retry محدود و تمیز برای startup مرورگر اضافه کرد، اما اولین اجرای کامل روی Windows قبل از تست‌ها در `typecheck` متوقف شد:

```text
tests/phase144-browser-debug-startup-retry.test.ts:43:17
Type 'string' is not assignable to type 'never'.
```

علت، قرارداد استنتاج‌شده‌ی TypeScript برای فایل JavaScript ماژول `browser-debug-startup.mjs` بود. مقدار پیش‌فرض خالی `extraArgs = []` در مصرف strict TypeScript می‌توانست به `never[]` باریک شود.

## تغییر

- تعریف صریح `BrowserDebugLaunchOptions` با JSDoc روی helper مشترک startup.
- تثبیت `extraArgs` به‌صورت `string[]` بدون cast کردن تست به `any` یا `never`.
- افزودن یک TypeScript consumer contract که همان آرایه‌ی واقعی `--disable-sync` را compile می‌کند.
- حفظ کامل رفتار Runtime، retry، Port/Profile تازه و diagnostics فاز ۱۴۴.

## قرارداد انتشار

- نسخه برنامه: `2.2.0` بدون تغییر.
- Schema: `v17` بدون تغییر.
- Migration: ندارد.
- Dependency جدید: ندارد.
- Product UI/Data: بدون تغییر.
- Release Candidate نسخه 2.3.0 تا سبز شدن Gate کامل به فاز ۱۴۶ منتقل شد؛ Final Release به فاز ۱۴۷ منتقل شد.
