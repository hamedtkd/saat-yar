# فاز ۱۳۶ — مقاوم‌سازی ورودی و Keyboard در Freelancer Browser UX Smoke

## مسئله مشاهده‌شده

اجرای واقعی `check:release` روی Windows تمام ۵۰۴ تست، TypeScript، ESLint، Build و Production/PWA smoke را پاس کرد، اما Freelancer Browser UX smoke در مرحله ذخیره Client با Enter متوقف شد.

خروجی نشان می‌داد فرم Client باز است و فیلد نام قابل دسترس است؛ بنابراین شکست به‌جای یک Runtime crash محصول، به fidelity تزریق متن/کلید در CDP محدود شد. Helper قبلی با `Input.insertText` مقدار کنترل‌شده React را تغییر می‌داد و بلافاصله Enter می‌فرستاد؛ این مسیر تضمین نمی‌کرد state کنترل‌شده React قبل از submit commit شده باشد.

## تغییرات

- مقداردهی فیلدهای کنترل‌شده با native `value` setter خود `HTMLInputElement`/`HTMLTextAreaElement` انجام می‌شود.
- بعد از مقداردهی، `input` و `change` واقعی با `bubbles: true` dispatch می‌شوند تا React state همان مسیر کاربر را دریافت کند.
- دو `requestAnimationFrame` قبل از ادامه Workflow صبر می‌کنند تا Controlled state و Render پایدار شوند.
- Enter اکنون `nativeVirtualKeyCode` و `text/unmodifiedText` مناسب را نیز از CDP می‌فرستد تا Default form submit شبیه Keyboard واقعی باشد.
- Timeoutها علاوه بر متن صفحه، URL، active element، مقدار فیلد فعال، Alertها و Dialog فعال را گزارش می‌کنند.
- Background networking غیرضروری Chrome/Edge در Profile تست غیرفعال و noise شناخته‌شده GCM/TFLite از گزارش خطای smoke حذف شده است.

## قرارداد داده

- AppData Schema: v17
- Migration: ندارد
- Dependency جدید: ندارد
- تغییر Persistence: ندارد

## هدف Gate

`check:release` همچنان همان چهار مرحله فاز ۱۳۵ را اجرا می‌کند. این فاز فقط fidelity Browser UX smoke را اصلاح می‌کند تا شکست بعدی، اگر وجود داشت، از Workflow واقعی محصول باشد نه روش تزریق ورودی تست.
