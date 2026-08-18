# فاز ۱۹۸ — Onboarding + Freelancer Workflow Redesign

## هدف

کاهش اصطکاک First-run و حذف دوگانگی «حضور و غیاب» با «Project Timer» در فضای Freelancer، بدون تغییر Schema یا قرارداد ذخیره‌سازی نرخ پروژه.

## محدوده

- بازطراحی Welcome و Step shell آنبوردینگ با hierarchy و spacing جدید.
- اتصال بصری شماره مراحل با خط progress و حفظ Focus/Keyboard contract.
- ارتقای مرحله پروژه Freelancer با مبلغ گروه‌بندی‌شده و انتخاب واحد ساعتی/روزانه.
- نگهداری `Project.rate` به‌صورت نرخ ساعتی canonical؛ نرخ روزانه فقط representation ورودی با مبنای ۸ ساعت است.
- حذف Attendance strip، Lunch/Break quick actions و Activity Segments از مسیر اصلی Freelancer Today.
- تبدیل Project Timer به تنها CTA زمان‌سنج اصلی Freelancer؛ حالت Running همیشه CTA توقف نشان می‌دهد.
- کاهش ارتفاع و فضای خالی کارت Focus فریلنسر و alignment بهتر Timer panel.
- حفظ Employee و Hybrid attendance behavior بدون تغییر.
- انتقال Analytics Dashboard پیشرفته به Backlog؛ GA4 فعلی برای اندازه‌گیری usage سطح بالا کافی است.

## مرز داده

- AppData schema روی v20 می‌ماند.
- `Project.rate` همچنان hourly canonical است و migration لازم نیست.
- unit روزانه در onboarding ذخیره نمی‌شود و فقط برای UX تبدیل می‌شود.
