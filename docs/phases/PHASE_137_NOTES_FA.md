# فاز ۱۳۷ — وفاداری ناوبری SPA و دوام Workflow فریلنسر

## مسئله مشاهده‌شده

اجرای واقعی Windows در فاز ۱۳۶ تمام ۵۰۹ تست، TypeScript، ESLint، Build و Production/PWA smoke را پاس کرد. Freelancer Browser UX smoke نیز Client و Quick Project Dialog را با موفقیت عبور داد، اما بلافاصله پس از ساخت Project با `Page.navigate` یک Hard Navigation مستقیم به `/projects` انجام می‌داد و Project تازه‌ساخته‌شده دیگر دیده نمی‌شد.

این شکست دو مفهوم متفاوت را با هم مخلوط کرده بود:

1. **ناوبری واقعی کاربر داخل App Router** که باید state جاری را حفظ کند و از Linkهای خود برنامه استفاده کند.
2. **دوام داده پس از Reload** که باید فقط بعد از تکمیل Persistence در IndexedDB سنجیده شود.

Persistence ساعت‌یار عمداً با یک debounce کوتاه انجام می‌شود؛ بنابراین Hard Reload چند میلی‌ثانیه بعد از Mutation، رفتار معادل کلیک واقعی کاربر روی Sidebar نیست.

## تغییرات

- Helper جدید `navigateInApp` لینک واقعی Route را در DOM پیدا و Click می‌کند و سپس تغییر `location.pathname` را بررسی می‌کند.
- عبور از Client به Projects و از Project workflow به Invoices دیگر با CDP `Page.navigate` انجام نمی‌شود؛ همان مسیر App Router کاربر را طی می‌کند.
- بعد از تکمیل Client → Project → Time → Expense → Invoice، Smoke مستقیماً IndexedDB را Poll می‌کند تا وجود Client، Project، Time Entry، Expense و Invoice تازه‌ساخته‌شده را تأیید کند.
- فقط پس از مشاهده داده پایدار در IndexedDB، یک Hard Reload واقعی انجام می‌شود؛ بنابراین Reload durability و SPA navigation دو Contract مستقل و قابل تشخیص دارند.
- Mobile Dialog contract همچنان بعد از Hard Reload اجرا می‌شود و ثابت می‌کند داده Workflow بعد از Reload نیز باقی مانده است.

## قرارداد داده

- AppData Schema: v17
- Migration: ندارد
- Dependency جدید: ندارد
- تغییر در ساختار Persistence: ندارد

## هدف Gate

شکست بعدی Freelancer Browser UX smoke، اگر وجود داشته باشد، باید بعد از عبور از Project navigation رخ دهد و به یکی از مراحل واقعی Timer، Expense، Invoice یا Mobile Dialog مربوط باشد؛ نه به Hard Navigation مصنوعی Harness.
