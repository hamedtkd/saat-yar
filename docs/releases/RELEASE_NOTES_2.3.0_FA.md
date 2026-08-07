# یادداشت انتشار ساعت‌یار ۲.۳.۰ — Release Candidate

نسخه ۲.۳.۰ ادامه‌ی مستقیم Release پایدار ۲.۲.۰ است و تمرکز آن روی پالیش تجربه کاربر، تکمیل Workflowهای فریلنسر و کارمند، کنترل‌های فارسی/جلالی و سخت‌گیری بیشتر Release Gate بوده است.

وضعیت فعلی این سورس `release-candidate` است. خط مبنای تأییدشده، commit prefix `ff0177f` با **۵۶۹ تست پاس، Build کامل و هر سه Browser Smoke تولید، فریلنسر و کارمند** است. فاز ۱۵۲ شش تست قراردادی Release اضافه می‌کند و Gate Candidate باید به **۵۷۵/۵۷۵** برسد.

## مهم‌ترین تغییرات نسبت به ۲.۲.۰

### تجربه و ناوبری

- Header و Profile Menu محلی سبک‌تر و یکدست‌تر شدند و Workspace Switcher، Bottom Navigation و Sidebar قرارداد Responsive مشخص‌تری دارند.
- صفحه امروز ناوبری روز قبل/بعد، برگشت به امروز و رفتار بهتر برای روزهای تاریخی دریافت کرد.
- Settings دارای جستجو، Anchor، Scroll Spy و گروه‌بندی مناسب دسکتاپ و موبایل است.
- صفحه «درباره و راهنما» برای توضیح Local-first بودن محصول و مسیرهای ارتباطی اضافه شد.

### فرم‌ها و Workflow فریلنسر

- Client و Project می‌توانند در Context همان فرم ساخته و خودکار انتخاب شوند.
- Invoice، Timer و ثبت دستی زمان از ساخت وابسته Client/Project بدون ترک Workflow پشتیبانی می‌کنند.
- Validation درون‌فرمی، submit با Keyboard، Empty Stateهای دارای CTA و Toastهای semantic جایگزین تعامل‌های خام مرورگر شدند.
- Date inputهای مالی به تقویم جلالی مشترک منتقل شدند و ورودی‌های عددی فارسی، Color و File پشت کنترل‌های Design System قرار گرفتند.
- Browser UX واقعی مسیر Client → Project → Time → Expense → Invoice تا IndexedDB، Hard Reload، Dialog focus و viewport موبایل پوشش داده می‌شود.

### Workflow کارمند

- Browser Journey واقعی Start/Lunch/Break/End، یادداشت روز، ویرایش تاریخی، Month و Reports را پوشش می‌دهد.
- Paid/Unpaid برای هر وقفه صریح است و تغییرات nested ناهار/وقفه به‌صورت اتمیک روی آخرین WorkRecord اعمال می‌شوند.
- سناریوی مرجع `08:00–17:00` با ناهار ۳۰ دقیقه و وقفه ۱۵ دقیقه‌ای بدون حقوق، کارکرد خالص `۸:۱۵` را در UI و IndexedDB تأیید می‌کند.
- Hard Reload، بازیابی یادداشت از مقدار واقعی Textarea و قرارداد Mobile Today نیز در Release Gate بررسی می‌شوند.

### پایداری Release Gate

- `check:release` اکنون Quality، Release Audit، Production/PWA Smoke، Freelancer Browser UX و Employee Browser UX را روی همان Build اجرا می‌کند.
- Startup مرورگر برای failure زیرساختی CDP یک Retry محدود با Port/Profile تازه دارد؛ شکست واقعی UX هرگز Retry نمی‌شود.
- Browser harness برای Controlled Input از InputEvent، Selectorهای section-scoped و Persistence Probe مستقیم IndexedDB استفاده می‌کند تا false-positive و false-timeout کاهش یابد.

## داده و سازگاری

- AppData Schema همچنان **v17** است.
- در ۲.۳.۰ Migration جدیدی نسبت به ۲.۲.۰ وجود ندارد.
- Backupهای v17 بدون تبدیل Schema قابل استفاده هستند و مسیر Migration تاریخی v16→v17 همچنان تست می‌شود.
- انتقال رمزنگاری‌شده دستگاه، WebRTC/QR، PWA Offline و Payroll Policy نسخه ۲.۲.۰ حفظ شده‌اند.

## رسانه و مستندات

رسانه‌های فعلی README از Fixture نمایشی تولید شده‌اند و در این Candidate دوباره Audit می‌شوند. دستور بازتولید همان `npm run media:capture` است و نباید داده واقعی کاربر را بخواند.

## Gate Candidate

برای تأیید Candidate روی سیستم Release اجرا شود:

```bash
npm run check:release
npm run test:browser:pairing
git diff --check
git status
```

انتظار `npm run check:release` در این فاز **۵۷۵ تست پاس و صفر شکست** به‌همراه سه پیام زیر است:

```text
Production browser smoke passed.
Freelancer browser UX smoke passed.
Employee browser UX smoke passed.
```

پس از ثبت commit Candidate و شواهد Gate، فاز ۱۵۳ Manifest را به `released` تبدیل می‌کند و Tag annotated `v2.3.0` روی Commit نهایی Release ساخته می‌شود.
