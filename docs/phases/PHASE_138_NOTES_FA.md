# فاز ۱۳۸ — اصلاح Navigation Discovery در Static Export

## شکست مشاهده‌شده

اجرای واقعی Windows در فاز ۱۳۷ همه ۵۱۳ تست، TypeScript، ESLint، Build و Production/PWA smoke را پاس کرد. Freelancer Browser UX smoke نیز ساخت Client و Project را با موفقیت انجام داد، اما هنگام انتقال درون‌برنامه‌ای به `/projects` با پیام `App navigation link not found: /projects` متوقف شد.

علت از خود App Router یا Sidebar نبود. تنظیم `trailingSlash: true` در Next.js باعث می‌شود href خروجی Static Export به‌شکل `/projects/` رندر شود، در حالی که Harness مقدار مورد انتظار را `/projects` مقایسه می‌کرد. همان اختلاف می‌توانست بعد از Click نیز در شرط انتظار `location.pathname === "/projects"` شکست ایجاد کند.

## تغییرات

- `navigateInApp` اکنون pathname مقصد و href لینک‌های DOM را پیش از مقایسه Normalize می‌کند و Slash انتهایی را نادیده می‌گیرد.
- برای سازگاری با `basePath` احتمالی Static Export، Route candidate می‌تواند علاوه بر تطابق کامل، به Route مورد انتظار ختم شود.
- شرط انتظار پس از Click نیز `/projects` و `/projects/` را یک Route واحد در نظر می‌گیرد.
- اگر لینک پیدا نشود، خطا اکنون Inventory محدود و قابل‌خواندن از href، pathname نرمال‌شده و متن Anchorهای واقعی DOM را چاپ می‌کند؛ بنابراین شکست بعدی بدون حدس قابل تشخیص است.
- هیچ تغییر Product UI، Data Model یا Persistence در این فاز انجام نشده است.

## قرارداد داده

- AppData Schema: v17
- Migration: ندارد
- Dependency جدید: ندارد

## هدف Gate

Freelancer Browser UX smoke باید از Client و Quick Project عبور کند، Route `/projects/` خروجی Static Export را با لینک واقعی App Router دنبال کند و سپس شکست بعدی—اگر وجود داشت—در یکی از مراحل واقعی Project Detail، Timer، Expense، Invoice یا Mobile Dialog رخ دهد.
