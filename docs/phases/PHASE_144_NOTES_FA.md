# فاز ۱۴۴ — مقاوم‌سازی Startup مرورگر در Release Gate

## مسئله واقعی

اجرای Windows فاز ۱۴۳ نشان داد تمام تست‌های واحد/قراردادی (`539/539`)، TypeScript، ESLint، Build و Production Browser Smoke سبز هستند؛ اما بلافاصله در شروع Freelancer Browser Smoke، Chrome پیام `DevTools listening on ws://...` را چاپ کرد و در عین حال endpoint محلی `/json/version` در مهلت تست آماده نشد. این شکست قبل از اجرای حتی یک سناریوی UX رخ داد و بنابراین failure محصول نبود؛ یک startup race زیرساختی CDP بود.

## اصلاح

- helper مشترک `scripts/browser-debug-startup.mjs` اضافه شد.
- Freelancer و Employee Browser Journey دیگر Port/Profile/Chrome/CDP را جداگانه مدیریت نمی‌کنند و از helper مشترک استفاده می‌کنند.
- startup فقط در صورت شکست مرحله‌ی راه‌اندازی CDP، حداکثر یک بار Retry می‌شود.
- Retry دوم همیشه Port و `user-data-dir` تازه می‌گیرد تا state یا lock تلاش قبلی منتقل نشود.
- تلاش شکست‌خورده قبل از Retry به‌طور کامل terminate و Profile آن پاک می‌شود.
- شکست‌های واقعی بعد از اتصال CDP، Validation، Focus، Persistence یا UI هرگز Retry نمی‌شوند و همان بار اول Release Gate را قرمز می‌کنند.
- diagnostics در صورت وجود خط `DevTools listening on ws://...` آن را کنار علت failure نگه می‌دارد تا race بین WebSocket و endpoint HTTP قابل تشخیص باشد.
- `close()` نشست idempotent است و cleanup موفقیت‌آمیز را یک بار انجام می‌دهد.

## قرارداد انتشار

- AppData Schema: v17
- Migration: ندارد
- Dependency جدید: ندارد
- تغییر Product UI: ندارد
- نسخه package در این فاز تغییر نمی‌کند.
- Release Candidate 2.3.0 به فاز ۱۴۵ و Release نهایی به فاز ۱۴۶ منتقل می‌شود؛ Candidate فقط پس از سبزشدن کامل Release Gate شامل Production + Freelancer + Employee Browser Smoke شروع می‌شود.
