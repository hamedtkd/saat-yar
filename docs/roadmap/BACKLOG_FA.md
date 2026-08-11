# بک‌لاگ ساعت‌یار

## تنظیمات و الگوی ویرایش — برنامه‌ریزی‌شده برای فازهای بعد

- تمام کارت‌های تنظیمات در حالت مشاهده باز شوند و ویرایش فقط با دکمه مداد آغاز شود.
- هر بخش دکمه‌های «ذخیره» و «انصراف» مستقل داشته باشد و تغییرات تا زمان ذخیره وارد داده اصلی نشوند.
- ذخیره خودکار به‌صورت پیش‌فرض خاموش باشد.
- گزینه‌ای در تنظیمات عمومی برای فعال‌کردن ذخیره خودکار اضافه شود.
- هنگام وجود تغییر ذخیره‌نشده، خروج از صفحه یا تغییر بخش با هشدار همراه باشد.
- وضعیت‌های مشاهده، ویرایش، ذخیره‌شدن، خطا و تغییر ذخیره‌نشده در تمام کارت‌ها یک قرارداد مشترک داشته باشند.
- کارت برنامه کاری و کارت اعلان‌ها از نظر ترازبندی، فاصله‌گذاری، ترتیب کنترل‌ها و نمایش موبایل بازطراحی شوند.
- تغییر هدف هفتگی باید بلافاصله میان روزهای فعال توزیع شود و ساعت پایان و هدف نمایشی هر روز را هماهنگ به‌روزرسانی کند.

## ترتیب پیشنهادی اجرا

1. ✅ زیرساخت Draft و Dirty State مشترک برای کارت‌های تنظیمات.
2. ✅ تنظیم عمومی ذخیره خودکار و Migration داده.
3. ✅ تبدیل کارت برنامه کاری به الگوی مداد، ذخیره و انصراف.
4. تبدیل سایر کارت‌های تنظیمات به همان الگو.
   - [x] کارت مزایا و کسورات حقوق
   - [x] کارت تعطیلات و استثناهای دستی
   - [x] کارت ظاهر و رنگ‌بندی
   - [x] کارت رفتار ذخیره تنظیمات
5. هشدار خروج با تغییرات ذخیره‌نشده و تست کامل Keyboard/Accessibility.

## فازهای رابط کاربری بعدی
- [x] چسبان‌کردن ناوبری داخلی تنظیمات هنگام اسکرول دسکتاپ.
- [x] نمایش نام کاربر و خوشامدگویی متناسب با ساعت روز در صفحه امروز.
- [x] تبدیل توضیحات کارمند به Textarea و متعادل‌کردن کارت اصلی امروز.
- [x] بهینه‌سازی خروجی چاپ گزارش و حذف نمودارهای تعاملی از نسخه چاپی.
- [x] بازطراحی کامل نمودارهای گزارش با محورهای شمسی، Empty State و Tooltip موبایل.
- [x] افزودن تنظیم ویرایش نام کاربر در کارت عمومی با الگوی مداد، ذخیره و انصراف.
- [x] مهاجرت کارت برنامه کاری به Draft دستی و ذخیره صریح.
- [x] مهاجرت کارت مزایا و کسورات حقوق به Draft دستی، ذخیره صریح و تأیید حذف.
- [x] مهاجرت کارت تعطیلات و استثناهای دستی به Draft دستی، ویرایش ردیفی و تأیید حذف.
- [x] مهاجرت کارت ظاهر و رنگ‌بندی به Draft دستی با پیش‌نمایش Scoped و بازنشانی امن.
- [x] مهاجرت کارت رفتار ذخیره تنظیمات به ویرایش صریح و جلوگیری از فعال‌سازی ناامن ذخیره خودکار.

## آمادگی انتشار ۲.۱.۰

- [x] هماهنگ‌کردن نسخه `package.json` و `package-lock.json` با ۲.۱.۰.
- [x] ایجاد Release Manifest و یادداشت انتشار فارسی و انگلیسی.
- [x] افزودن Audit خودکار نسخه، Schema، مستندات و ترتیب Release Gate.
- [x] به‌روزرسانی Changelog و چک‌لیست انتشار برای Schema v16 و تست مرورگر Production.
- [x] اضافه‌کردن تست قراردادی فاز ۹۹ به Quality Pipeline.


## مسیر نهایی‌سازی طراحی و PWA — نسخه بعد از ۲.۱.۰

- [x] فاز ۱۰۰: یکپارچه‌سازی لوگوی جدید، متادیتای Routeها، FavIcon زنده، Open Graph و پایه نصب PWA.
- [x] فاز ۱۰۱: بازطراحی پیکسل‌پرفکت صفحه امروز در تمام تم‌ها با حفظ رفتارهای فعلی.
- [x] فاز ۱۰۲: تثبیت App Shell، Header، Sidebar و Bottom Navigation در دسکتاپ و موبایل.
- [x] فاز ۱۰۳: پالیش کارت تایمر و Progress، اصلاح روز بدون هدف، تثبیت رنگ پیش‌فرض فیروزه‌ای و Surfaceهای خنثی.
- [x] فاز ۱۰۴: رفع رگرسیون SVG کارت تایمر و Tight Crop کردن FavIcon.
- [x] فاز ۱۰۵: اصلاح هویت نصب PWA، آیکن‌های any/maskable و نام کوتاه نصب.
- [x] فاز ۱۰۶: انتقال زبان طراحی نهایی به ماه، گزارش‌ها و تنظیمات.
- [x] فاز ۱۰۷: انتقال زبان طراحی نهایی به مرخصی، مشتری‌ها، پروژه‌ها و فاکتورها.
- [x] فاز ۱۰۸: تکمیل UX نصب PWA، وضعیت Offline، Update Prompt و تست نصب‌پذیری.
- [x] فاز ۱۰۹: زیرساخت Screenshot و GIF و Capture نهایی تولید و در مخزن ثبت شد.

## مستندات و معرفی پروژه

- [x] بازنویسی README اصلی با معرفی محصول، قابلیت‌ها، حریم خصوصی، راه‌اندازی، معماری، کیفیت، نقشه راه و لینک حمایت مالی.
- [x] افزودن اسکرین‌شات‌های به‌روز از تم روشن، تاریک، موبایل و گزارش‌ها به README.
- [x] افزودن GIF کوتاه Onboarding تولیدشده از Fixture نمایشی به README.
- [x] ایجاد README انگلیسی مستقل و لینک‌دادن دوطرفه میان نسخه فارسی و انگلیسی.
- [x] افزودن راهنمای عیب‌یابی نصب در Windows و خطاهای رایج `npm ci`.
- [x] اضافه‌کردن جدول سازگاری مرورگر و محدودیت‌های Notification/PWA.

## نگهداری مخزن و مشارکت Agentها

- [x] انتقال یادداشت همه فازها به `docs/phases/`
- [x] انتقال بک‌لاگ به `docs/roadmap/`
- [x] ایجاد `AGENTS.md` در ریشه برای کشف خودکار Agentها
- [x] ایجاد راهنمای جامع معماری، تست و shadcn برای Agentها
- [x] افزودن قالب Pull Request و Issue
- [x] افزودن راهنمای انگلیسی Agentها
- [x] اضافه‌کردن دستور بررسی خودکار فایل‌های مستندات خارج از مسیر مجاز

## محافظت از تغییرات ذخیره‌نشده

- [x] رجیستری مشترک Dirty State کارت‌های تنظیمات
- [x] هشدار جابه‌جایی بین بخش‌های تنظیمات
- [x] انتخاب ذخیره، دورریختن یا ماندن
- [x] هشدار مرورگر هنگام Reload یا بستن صفحه
- [x] گسترش محافظ به ناوبری اصلی بین Routeها
- [x] نمایش نام کارت‌های دارای تغییر ذخیره‌نشده داخل Dialog
- [x] جایگزینی پیاده‌سازی Alert Dialog با نسخه رسمی shadcn/Radix و Focus trap کامل

## ایمنی ناوبری و نشست — فازهای بعد

- [x] محافظت از دکمه Back و Forward مرورگر در حضور Draft ذخیره‌نشده.
- [x] افزودن Heartbeat برای نشست کاری باز و بازیابی پس از Crash یا خاموشی ناگهانی.
- [x] همگام‌سازی فوری ورودی شروع ناهار با دکمه شروع تایمر.
- [x] هماهنگی نشست و Draft میان چند Tab با BroadcastChannel.

## ایمنی شروع روز

- [x] جلوگیری از شروع روز جدید تا تعیین تکلیف خروج ثبت‌نشده روز قبل
- [x] امکان ثبت خروج پیشنهادی یا رفتن به روز قبل برای اصلاح
- [x] نمایش خلاصه همه رکوردهای باز قدیمی در یک صفحه سلامت داده

## UX رکوردهای روزانه

- [x] ایزوله‌کردن Draftهای موقت هنگام تغییر تاریخ
- [x] اتصال یادداشت کارمند به رکورد همان روز
- [x] فقط‌خواندنی‌کردن روزهای تکمیل‌شده با ویرایش صریح
- [x] افزودن ذخیره و انصراف واقعی برای ویرایش رکوردهای تاریخی
- [x] نمایش Diff تغییرات قبل از ذخیره رکورد تاریخی
- [x] محافظت از تغییر تاریخ هنگام وجود Draft تاریخی ذخیره‌نشده

## هماهنگی چند تب

- [x] همگام‌سازی ذخیره موفق میان تب‌ها با `BroadcastChannel`
- [x] بارگذاری خودکار تغییرات تب دیگر در نبود Draft محلی
- [x] توقف همگام‌سازی خودکار و نمایش هشدار هنگام وجود تغییر ذخیره‌نشده
- [x] قفل مالکیت تایمر زنده برای جلوگیری از کنترل هم‌زمان یک نشست در دو تب
- [x] نمایش زمان و شناسه تب آخرین تغییر در صفحه سلامت داده

- [x] نمایش نام دستگاه و زمان آخرین Heartbeat در پنجره انتقال کنترل تایمر.
- [x] افزودن مرکز سلامت داده برای رکوردهای ناقص، ناسالم و نشست‌های نیازمند بررسی.
- [x] افزودن وضعیت تعارض‌های چند تب و آخرین ذخیره خارجی به مرکز سلامت داده.
- [x] افزودن تاریخچه کوتاه رخدادهای همگام‌سازی و امکان پاک‌کردن وضعیت ثبت‌شده.
- [x] افزودن جزئیات صفحه مبدأ به رخدادهای همگام‌سازی.
- [x] افزودن نوع دقیق تغییر به رخدادهای همگام‌سازی.

## پایداری Runtime

- [x] رفع خطاهای TypeScript مرکز سلامت داده
- [x] قطع چرخه بازثبت Draft و خطای React 185 در Production
- [x] افزودن تست مرورگر Production برای بارگذاری اولیه و ناوبری بین تاریخ‌ها
- [x] اجرای Smoke Test روی خروجی واقعی `output: export` با سرور Static داخلی.
- [x] مقاوم‌سازی پاک‌سازی پروفایل موقت Chrome/Edge در Windows در برابر قفل‌های کوتاه‌مدت `EBUSY`.

## پایداری قرارداد تست‌ها

- [x] ایجاد Fixture مشترک و Type-safe برای `WorkRecord` و حذف Fixture ناقص مرکز سلامت داده.
- [x] مهاجرت تدریجی سایر تست‌های دارای رکورد دستی به Fixture مشترک.

## پایداری React Hooks

- [x] انتقال به‌روزرسانی Refهای ناوبری از Render به Effect.
- [x] حذف SetState هم‌زمان از Effect مالکیت تایمر.
- [x] دقیق‌کردن Dependencyهای Callback ویرایش رکورد تاریخی.

## پایداری Quality Pipeline

- [x] هماهنگ‌کردن تست‌های قدیمی با شناسه‌های فعلی بدون بازگرداندن نام‌های منسوخ.
- [x] پاک‌سازی خودکار مستندات فازی خارج از `docs/phases/` پیش از اجرای Quality Check.
- [ ] کاهش تست‌های وابسته به Regex سورس و جایگزینی تدریجی آن‌ها با تست رفتاری.
- [x] تفکیک هماهنگی چند تب از Hook اصلی Persistence و بازگرداندن سقف ۲۵۰ خط.

## ایمنی عملیات مخرب

- [x] تأیید حذف رکورد روز پیش از پاک‌کردن کامل داده.
- [x] افزودن Undo کوتاه‌مدت برای عملیات حذف رکورد.
- [x] افزودن سطل بازیابی چندرکوردی با مهلت ۳۰ روزه در مرکز سلامت داده.
- [x] افزودن بازیابی گروهی و پاک‌سازی یکجای رکوردهای منقضی‌شده.

## دقت ورودی آنبوردینگ

- [x] پشتیبانی از هدف هفتگی اعشاری مانند 42.5 ساعت.

## پایداری Schema و Backup

- [x] ایجاد Factory مرکزی برای Collectionهای اجباری `AppData`.
- [x] تکمیل قرارداد Schema v16 در Route امروز و Merge فایل پشتیبان.
- [x] حفظ رکوردهای سطل بازیابی هنگام Merge بدون شناسه تکراری.
- [x] افزودن Audit خودکار برای تغییرات آینده Schema در Factory، Migration، Backup و Recovery.
- [x] افزودن گزارش قابل‌خواندن از اختلاف Schema هنگام شکست Audit در CI.

## فریز طراحی و PWA — پس از انتشار ۲.۱.۰

- [x] بازطراحی صفحه «امروز» با ساختار چندتمی و حفظ همه قابلیت‌های کارمند/فریلنسر.
- [x] تثبیت App Shell، Header، Sidebar و Bottom Navigation در دسکتاپ و موبایل.
- [x] انتقال زبان طراحی نهایی به ماه، گزارش‌ها و تنظیمات.
- [x] انتقال زبان طراحی نهایی به مرخصی، مشتری‌ها، پروژه‌ها و فاکتورها.
- [x] تکمیل تجربه PWA شامل نصب، وضعیت آفلاین و اعلان نسخه جدید.
- [x] تولید اسکرین‌شات‌ها و GIFهای نهایی بعد از Design Freeze.
  - [x] ساخت Fixture نمایشی مستقل و Capture تکرارپذیر دسکتاپ/موبایل/لایت/دارک.
  - [x] افزودن تولید اختیاری GIF آنبوردینگ با ffmpeg.
  - [x] اجرای Capture نهایی و Commit کردن Assetهای خروجی در مخزن.
  - [x] افزودن انتخاب نهایی Screenshot/GIF به README فارسی و انگلیسی.


## آمادگی انتشار ۲.۲.۰

- [x] افزایش نسخه `package.json` و `package-lock.json` به ۲.۲.۰.
- [x] ایجاد Release Candidate Manifest برای Schema v17 با حفظ Manifest تاریخی ۲.۱.۰.
- [x] ایجاد Release Notes فارسی و انگلیسی برای حقوق قابل‌سفارشی‌سازی، PWA و انتقال رمزنگاری‌شده دستگاه.
- [x] انتقال تغییرات بعد از ۲.۱.۰ از Unreleased به Changelog نسخه ۲.۲.۰.
- [x] بازنویسی چک‌لیست انتشار برای Migration v16→v17، Payroll Policy، Offline PWA و WebRTC/QR Sync.
- [x] افزودن Screenshotهای Light/Dark/Mobile/Reports و GIF آنبوردینگ به README فارسی و انگلیسی.
- [x] ثبت Browser Pairing واقعی به‌عنوان Gate دستی مکمل `check:release`.
- [x] افزودن تست قراردادی Release Candidate و Audit تطبیق نسخه، Schema، رسانه و مستندات.

## قابلیت‌های پس از Design Freeze

- [x] فاز ۱۱۰: مقاوم‌سازی Offline PWA و Media Capture؛ precache دارایی‌های build، تست reload واقعی و پاک‌سازی امن Storage در Capture.
- [x] فاز ۱۱۱: طراحی و پیاده‌سازی موتور محاسبه حقوق Rule-based با Presetهای ماهانه متناسب، ماهانه ثابت، ساعتی و روزکاری؛ بدون تغییر نتیجه محاسبه فعلی.
- [x] فاز ۱۱۲: افزودن Policy حقوق به Settings، ارتقای Schema v17/Migration/Backup و ساخت UI، Preview و Breakdown شفاف در گزارش‌ها.
- [x] فاز ۱۱۳: طراحی پروتکل انتقال دستگاه‌به‌دستگاه با Payload نسخه‌دار، Checksum، Merge/Replace، Conflict Preview و رمزنگاری AES-GCM session.
- [x] فاز ۱۱۴: Pairing مستقیم موبایل و لپ‌تاپ با WebRTC DataChannel و لینک/کد دوطرفه بدون دیتابیس یا Signaling دائمی؛ همراه با انتقال رمزنگاری‌شده و Preview قبل از اعمال.
- [x] فاز ۱۱۵: افزودن QR محلی و اسکن دوربین روی Pairing Code فاز ۱۱۴؛ شامل QR چندفریمی برای Offer/Answerهای بزرگ و fallback امن Copy/Paste، بدون سرویس QR شخص ثالث.
- [x] فاز ۱۱۶: تست End-to-End انتقال دستگاه؛ رفع Typecheck فاز ۱۱۵، تست کامل رمزنگاری/Chunk/ACK/Preview/Merge، Smoke اختیاری WebRTC در مرورگر و bounded fallback برای Offline PWA.
- [x] فاز ۱۱۷: رفع Gate قرمز Lint در QR vendor و Scanner، افزودن وضعیت نشست و تاریخچه انتقال privacy-safe با مسیر روشن برای شروع دوباره Pairing.
- [x] فاز ۱۱۸: Browser E2E انتقال رمزنگاری‌شده چندبخشی روی WebRTC واقعی و پالیش نهایی UX Sync؛ Stepper، پیشروی خودکار QR، وضعیت تکمیل و رد امن Preview.
- [x] فاز ۱۱۹: آماده‌سازی Release Candidate 2.2.0؛ همگام‌سازی README/Changelog/Release Manifest با Schema v17، حقوق سفارشی و Device Sync و افزودن رسانه‌های نهایی به README فارسی و انگلیسی.
- [x] فاز ۱۲۰: نهایی‌سازی Release 2.2.0؛ Gate نهایی ۴۲۹/۴۲۹، ثبت شواهد Candidate `f659456` و انتشار Tag `v2.2.0` روی Commit نهایی `d197b7d`.
- [x] فاز ۱۲۱: پالیش UX پس از 2.2.0؛ Profile Menu محلی و Responsive، Header سبک‌تر، Save State موقت، جستجوی Settings و ناوبری سریع روز قبل/بعد در صفحه امروز.
- [x] فاز ۱۲۲: Hotfix پس از فاز ۱۲۱؛ حذف setState مبتنی بر Effect از Settings Hash Navigation و هماهنگی تست‌های قدیمی Unsaved Guard با Deep Linkهای Profile.
- [x] Phase 123: harden the production onboarding browser smoke with deterministic pre-boot storage reset, structural step markers, and actionable timeout diagnostics.
- [x] فاز ۱۲۴: رفع Runtime crash ناشی از `SelectLabel` خارج از `SelectGroup` در Workspace Switcher و fail-fast کردن Browser Smoke روی خطاهای hydration/runtime.
- [x] فاز ۱۲۵: یکدست‌سازی کنترل‌های Header و ارتقای هویت Profile و میانبر امن لوگوی Sidebar.
- [x] فاز ۱۲۶: بازطراحی Active state ناوبری موبایل، نمایش همه مقصدهای Settings و دنبال‌کردن Section فعال هنگام Scroll.
- [x] فاز ۱۲۷: همگام‌سازی دقیق هدف هفتگی با ساعت پایان قابل مشاهده، پالیش Reminder UI و افزودن صفحه درباره/راهنما و راه‌های ارتباط.
- [x] فاز ۱۲۸: گروه‌های Settings قابل باز/بسته‌شدن با Scroll Spy، حفظ Active section و رفتار مناسب موبایل/دسکتاپ.
- [x] فاز ۱۲۹: الگوی reusable ساخت موجودیت وابسته در همان فرم؛ ساخت سریع Client از Project با انتخاب خودکار و ساخت Project مرتبط از Client بدون خروج از صفحه.
- [x] فاز ۱۳۰: افزایش خوانایی Toastهای سراسری با سطح opaque و Toneهای معنایی، و حذف `input[type=date]` خام از فرم‌های مالی با جایگزینی کامل تقویم جلالی/فارسی مشترک.
- [x] فاز ۱۳۱: تعمیم ساخت وابسته به Invoice → Client/Project و Timer/Manual Time → Client/Project با Empty State و انتخاب خودکار؛ Expense داخل ProjectDetail از قبل Project-contextual است و selector تکراری به آن اضافه نمی‌شود.
- [x] فاز ۱۳۲: Audit کنترل‌های native باقی‌مانده مرورگر؛ حذف Number spinnerهای مرورگر با ورودی عددی فارسی/کیبوردی، پنهان‌سازی trigger خام Color/File پشت کنترل‌های Design System و تثبیت Audit برای date/time/range/selectهای خام.
- [x] فاز ۱۳۳: Audit فرم‌های مالی/فریلنسر؛ Validation درون‌فرمی، submit کیبوردی، Empty Stateهای دارای CTA و حذف alert مرورگر از ثبت زمان دستی؛ بدون افزودن relation تکراری به Expense پروژه.
- [x] فاز ۱۳۴: Browser UX smoke برای مسیر واقعی Client → Project → Time Entry → Expense → Invoice؛ شامل Validation، Enter submit، Focus trap دیالوگ و قرارداد viewport موبایل روی خروجی Production.
- [x] فاز ۱۳۵: همگام‌سازی قرارداد Release Gate تاریخی با Freelancer Browser UX smoke؛ حفظ ترتیب Quality → Audit → Production/PWA → Freelancer UX و جلوگیری از شکست کاذب Phase 99.
- [x] فاز ۱۳۶: مقاوم‌سازی Freelancer Browser UX smoke پس از اجرای واقعی Windows؛ تزریق React-compatible برای Controlled Input، Enter native-like، diagnostics دقیق و حذف noise مرورگر.
- [x] فاز ۱۳۷: اصلاح وفاداری Freelancer Browser UX smoke به ناوبری واقعی App Router و جداسازی SPA navigation از Reload durability با تأیید صریح IndexedDB.
- [x] فاز ۱۳۸: اصلاح Navigation Discovery در Static Export با پشتیبانی از `trailingSlash`، تشخیص Route نرمال‌شده و diagnostics لینک‌های واقعی DOM.
- [x] فاز ۱۳۹: رفع SyntaxError در Browser Route Expression فاز ۱۳۸ با جداکردن سازنده Expression، حذف Regex شکننده از کد تزریق‌شده CDP و افزودن Compile Contract پیش از اجرای Browser Smoke.
- [x] فاز ۱۴۰: همگام‌سازی Persistence Probe فریلنسر با snapshot envelope واقعی AppData و قرارداد `Invoice.lines`، همراه با diagnostics جزئی و تأیید Hard Reload از IndexedDB.
- [x] فاز ۱۴۱: Browser UX Journey کامل حالت کارمند؛ Start/Lunch/Break/End، یادداشت، محاسبه خالص، Month/Reports، دوام IndexedDB، Hard Reload و قرارداد viewport موبایل.
- [x] فاز ۱۴۲: رفع transition واقعی Active → Completed در Today؛ remount امن ویرایشگر روز پس از ثبت خروج، نمایش قطعی CTA «ویرایش این روز» و ادامه Employee Browser Journey روی UI واقعی.
- [x] فاز ۱۴۳: تثبیت محاسبه وقفه بدون حقوق در Employee Browser Journey، جلوگیری از stale patch رکورد و افزودن کنترل صریح «با حقوق» برای وقفه‌ها.
- [x] فاز ۱۴۴: مقاوم‌سازی startup مرورگر در Release Gate؛ Retry محدود و تمیز فقط برای failure زیرساختی CDP با Port/Profile تازه، بدون تکرار شکست‌های واقعی UX.
- [x] فاز ۱۴۵: رفع TypeScript contract در Browser Debug Startup؛ جلوگیری از استنتاج `never[]` برای `extraArgs` در مصرف‌کننده‌های strict بدون تغییر رفتار Runtime.
- [x] فاز ۱۴۶: همگام‌سازی Employee Browser Smoke با Checkbox native واقعی؛ استفاده از `HTMLInputElement.checked` به‌جای قرارداد قدیمی Radix و حفظ Gate واقعی وقفه بدون حقوق.
- [x] فاز ۱۴۷: اتمیک‌کردن ویرایش nested رکورد کارمند؛ اعمال Lunch/Break روی آخرین WorkRecord، تثبیت Paid/Unpaid و اضافه‌کردن Browser contract برای 15:00–15:15 قبل از Clock-out.
- [x] فاز ۱۴۸: رفع Regression صرفاً Lint در Time Strip پس از اتمیک‌کردن Break؛ کوچک‌سازی dependency contract هوک و بازگرداندن `--max-warnings=0` به Gate سبز.
- [x] فاز ۱۴۹: همگام‌سازی Employee Browser Smoke با InputEvent اثبات‌شده و افزودن Persistence Probe قبل از Clock-out/محاسبه برای جداسازی دقیق input fidelity از calculation.
- [x] فاز ۱۵۰: اصلاح Scope Selectorهای زمان در Employee Browser Smoke؛ اتصال Heading دقیق به `closest("section")` تا Break editor دیگر فیلدهای Lunch را تغییر/تأیید نکند و Persistence Probe قبل از Clock-out مرجع نهایی بماند.
- [x] فاز ۱۵۱: اصلاح Hard Reload Employee Browser Smoke برای خواندن مقدار واقعی `textarea.value` یادداشت؛ چون مقدار Form Control در `body.innerText` نمایش داده نمی‌شود، بدون تضعیف قرارداد IndexedDB/8:15/Mobile.
- [x] فاز ۱۵۲: آماده‌سازی Release Candidate نسخه 2.3.0؛ نسخه، Manifest، Changelog، Release Notes، رسانه‌ها و Gate evidence.
- [x] فاز ۱۵۳: نهایی‌سازی Release 2.3.0؛ ثبت Candidate `75b7be6`، Pairing Gate، Manifest `released` و آماده‌سازی Tag annotated روی Commit نهایی.

## آمادگی انتشار ۲.۳.۰

- [x] فاز ۱۵۲: Release Candidate 2.3.0؛ افزایش نسخه Package/Lockfile، Manifest فعال Schema v17، Release Notes فارسی/انگلیسی، Changelog، Checklist، Audit رسانه و ثبت baseline سبز `ff0177f` با ۵۶۹ تست و سه Browser Smoke.
- [x] فاز ۱۵۳: Final Release 2.3.0؛ Candidate `75b7be6` با ۵۷۵ تست و Pairing چهار chunk رمزنگاری‌شده ثبت شد، Manifest به `released` تبدیل شد و Tag annotated `v2.3.0` پس از Commit/Push نهایی ساخته می‌شود.
- [x] فاز ۱۵۴: Hotfix مستندات Release 2.3.0؛ بازگرداندن لینک صریح `docs/roadmap/BACKLOG_FA.md` به README و الزام ساخت Tag فقط روی آخرین Commit با Gate کاملاً سبز.
- [x] فاز ۱۵۵: Audit پس از انتشار روی دامنه واقعی `https://saat-yar.vercel.app/`؛ بررسی read-only Routeهای عمومی، Settings، PWA Manifest/Service Worker/Precache، آیکون‌ها، robots و sitemap بدون تغییر Manifest تاریخی 2.3.0.
- [x] فاز ۱۵۶: اصلاح false negative Audit Precache Production؛ parse مستقیم `self.__SAATYAR_PRECACHE`، پشتیبانی از مسیر نسبی `_next/static/...` و تأیید reachability اولین Build Asset.
- [x] فاز ۱۵۷: قرارداد Deploy استاتیک Vercel؛ انتخاب Framework Preset=Other، اجرای `build:vercel` و انتشار صریح `out/` تا Precache نهایی‌شده به‌جای placeholder سورس Deploy شود.
- [x] فاز ۱۵۸: آگاهی Today از روزهای غیرفعال برنامه هفتگی؛ نمایش «تعطیل طبق برنامه کاری»، موظفی صفر، CTA ثبت کار استثنایی و علامت مستقل در تقویم بدون تبدیل آن به Holiday رسمی.

## آمادگی انتشار ۲.۳.۱

- [x] فاز ۱۵۹: Final Release 2.3.1؛ افزایش Package/Lockfile به 2.3.1، فعال‌سازی Manifest جدید روی Schema v17، ثبت Baseline تأییدشده `7c675e1` با ۶۰۱/۶۰۱ تست و Gateهای Production/Freelancer/Employee/Pairing/Vercel/Production Audit، انتقال تغییرات فازهای ۱۵۵ تا ۱۵۸ از Unreleased به Changelog و افزودن شش قرارداد Release برای Gate نهایی ۶۰۷/۶۰۷.
- [x] Manifest و Tag تاریخی `v2.3.0` بدون تغییر باقی می‌مانند و `v2.3.1` فقط پس از Commit/Push فاز ۱۵۹، Ready شدن Vercel و سبز شدن `npm run audit:production` روی همان Commit نهایی ساخته می‌شود.

## توسعه پس از ۲.۳.۱

- [x] فاز ۱۶۰: قرارداد ناهار و ساعت خروج؛ تست مثال‌های واقعی 07:30→16:15، 07:15→16:00 و ناهار کوتاه‌تر، تفکیک ناهار باحقوق/بدون‌حقوق، تنظیم جمعی ناهار برای همه روزها و حفظ هدف کار خالص هنگام تغییر مدت ناهار.
- [x] فاز ۱۶۱: پالیش چیدمان برنامه کاری؛ سه کارت هم‌ارتفاع و Responsive برای خلاصه قرارداد، ناهار پیش‌فرض و هدف کار خالص، همراه با alignment یکدست کنترل‌ها و حفظ کامل منطق Phase 160.

- [x] Phase 162 — حذف Deploy بلااستفاده GitHub Pages و نگه‌داشتن GitHub Actions به‌عنوان CI همسو با Vercel.

- [x] فاز ۱۶۳: بازیابی نشست و کنتراست Accent؛ Reload عادی بدون Auto-close اجباری، Resume امن برای Auto-close روز جاری با ثبت فاصله به‌عنوان وقفه بدون حقوق، و متن/آیکن سفید روی کنترل‌های پرشده تم فیروزه‌ای و آبی.
- [x] فاز ۱۶۴: انگلیسی‌کردن README اصلی GitHub، انتقال README فارسی به `README_FA.md`، حفظ مسیر سازگار `README_EN.md` و ثبت نقشه راه i18n برای دو زبانه‌کردن رابط کاربری در فازهای بعدی.


## آمادگی انتشار ۲.۳.۲

- [x] فاز ۱۶۰: قرارداد ناهار و هدف کار خالص هفتگی، همراه محاسبه خروج پیشنهادی بر اساس ناهار واقعی.
- [x] فاز ۱۶۱: پالیش Responsive چیدمان برنامه کاری در Settings.
- [x] فاز ۱۶۲: CI گیت‌هاب همسو با Vercel و حذف Deploy بلااستفاده GitHub Pages.
- [x] فاز ۱۶۳: Resume امن نشست Auto-close و Filled Accent خواناتر در تم‌های فیروزه‌ای/آبی.
- [x] فاز ۱۶۴: README اصلی انگلیسی، README فارسی مستقل و Roadmap i18n.
- [x] فاز ۱۶۵: Final Release 2.3.2؛ افزایش Package/Lockfile، Manifest/Release Notes جدید، ثبت Baseline `e3c0a03` با ۶۳۳/۶۳۳ تست و Gate نهایی ۶۳۹/۶۳۹، بدون تغییر Schema v17 یا افزودن Migration/Dependency.
- [x] Release 2.3.2 روی Commit `56c2c54` با Production Audit سبز نهایی شد و Tag annotated `v2.3.2` منتشر شد.


## توسعه پس از ۲.۳.۲ — آنبوردینگ و ورود داده

- [x] فاز ۱۶۶: تبدیل آنبوردینگ اولیه از Overlay داخل App Shell/Today به Route مستقل `/onboarding` با Redirect امن کاربر جدید، Shell متمرکز و Browser Smoke مسیر واقعی.
- [x] فاز ۱۶۷: Onboarding Recovery & Re-entry؛ ذخیره Progress مرحله‌ای، ادامه راه‌اندازی نیمه‌تمام، Hard Reload واقعی در Browser Smoke و اجرای دوباره Wizard از Settings بدون پاک‌کردن داده. Revision 2 مرحله پیش‌فرض کاربر جدید را به Welcome/Name برمی‌گرداند و Session را بدون `setState` داخل Effect از Local Storage می‌خواند.
- [x] فاز ۱۶۸: Leave Entitlement Contract؛ حذف سهمیه اشتباه ۴۲ ساعته، تفکیک سهمیه ماهانه/سالانه/مصرف/مانده، اعمال مبنای `۷:۲۰ × ۲۶ ÷ ۱۲`، ترمیم دقیق defaults قدیمی و محاسبه چندروزه با عدم کسر تعطیلات و روزهای غیرکاری.
- [x] فاز ۱۶۹: Onboarding Profile, Payroll & Appearance + Responsive Shell Polish؛ Wizard شش‌مرحله‌ای با برنامه کاری واقعی، حقوق و تم، همگام‌سازی metadata ساعت کار، اصلاح صفحه Welcome، هندسه نمایشگرهای بزرگ و stacking صحیح Dropdown پروفایل روی Settings Search.
- [x] فاز ۱۷۰: بازخورد و ذخیره ویرایش روز تکمیل‌شده؛ Action Bar چسبان زیر Header با Dirty state، Save/Cancel/Reset همیشه در viewport، تأیید ذخیره در همان محل و Browser Smoke واقعی Desktop/Mobile اضافه شد.
- [x] فاز ۱۷۱: Import Wizard؛ Route مستقل `/import` با Preview بدون تغییر داده، بازیابی امن Backup، CSV با تشخیص و Mapping ستون‌ها، پشتیبانی تاریخ شمسی/میلادی و اعداد فارسی، ورود روزهای کاری/مشتری/پروژه/هزینه، خطای ردیفی و Conflict Strategy صریح Skip/Replace.
- [x] فاز ۱۷۲: Live Runtime Clock & Low-Power Refresh؛ یک Scheduler مشترک و visibility-aware برای تایمرهای زنده، Refresh ثانیه‌ای فقط برای تایمر اصلی، Refresh دقیقه‌ای برای Summary/Metric/Project، توقف کامل Tick در تب مخفی و Sync فوری روی focus/pageshow بدون Persistence یا Network Tick.
- [x] فاز ۱۷۳: Onboarding شخصی‌شده بر اساس Employee/Freelancer/Hybrid؛ مراحل ۳ و ۴ متناسب با Workspace، ساخت اختیاری مشتری/پروژه برای Freelancer، درآمد ترکیبی برای Hybrid و Import داخلی امن در مرحله ۷ با حفظ وضعیت تکمیل تا Submit نهایی.
- [x] فاز ۱۷۴: زیرساخت i18n واقعی (Foundation)؛ Catalog/Dictionary تایپ‌شده، Locale مستقل Local-first، سوییچ بدون Reload، Shell/Navigation/Settings دوطرفه فارسی RTL و انگلیسی LTR و Browser Smoke ماندگاری Locale.
- [x] فاز ۱۷۵: گسترش i18n به Today/Month/Reports؛ متن‌ها، تقویم شمسی، اعداد، مدت، پول، Pickerها، جدول/نمودار و Browser Smoke واقعی English/LTR → Persian/RTL بدون تغییر Schema یا AppData.
- [x] فاز ۱۷۶: گسترش i18n به Clients/Projects/Invoices/Leave و سطوح تجاری، همراه با Validation/Toast/Print/CSV و Browser Journey دو Locale.
- [x] فاز ۱۷۷: تکمیل i18n در Settings/Onboarding/Import/About و Surfaceهای System/PWA، پیام‌های Runtime و Browser Smoke دو Locale بدون تغییر Schema یا Dependency.
- [x] فاز ۱۷۸: Closure/Audit نهایی i18n؛ Hard-coded UI audit سراسری، RTL/LTR geometry، Metadata/PWA policy، CSV/Print و Release readiness پیش از Merge کنترل‌شده.


## آمادگی انتشار ۲.۴.۰

- [x] فاز ۱۷۹: Release Candidate 2.4.0؛ افزایش Package/Lockfile به ۲.۴.۰، Manifest Candidate، Release Notes فارسی/انگلیسی، Release Audit فعال و ثبت Baseline فاز ۱۷۸ روی `887158c` با ۷۵۸/۷۵۸ تست. Candidate Gate با شش Contract Test جدید باید ۷۶۴/۷۶۴ باشد.
- [ ] فاز ۱۸۰: Final Release 2.4.0؛ ثبت SHA Candidate فاز ۱۷۹، Merge کنترل‌شده `dev` به `main`، Deployment، `audit:production`، Final Manifest و Tag annotated `v2.4.0` فقط پس از Gate کامل. هدف Gate نهایی ۷۷۰/۷۷۰ است.
- [x] AppData Schema روی v17 باقی می‌ماند و Phase 179 Migration یا Dependency جدید ندارد.
- [x] Manifestهای ۲.۳.۲ و قدیمی‌تر تاریخی و immutable باقی می‌مانند.
- [x] Static metadata/PWA در Candidate همچنان Canonical فارسی است و Runtime Locale فارسی RTL / انگلیسی LTR را اعمال می‌کند.

## بین‌المللی‌سازی آینده — پس از Patch بعدی

- [x] ایجاد Catalog/Dictionary تایپ‌شده و استخراج متن‌های Shell/Navigation/Settings بدون تغییر رفتار دامنه؛ پوشش صفحه‌های محتوایی در فاز ۱۷۵ ادامه دارد.
- [x] افزودن Locale انگلیسی و قرارداد LTR برای Shell/Navigation/Settings؛ ترجمه کامل صفحه‌های دامنه و سیاست تقویم/اعداد در فاز ۱۷۵ ادامه دارد.
- [x] ذخیره Locale انتخابی به‌صورت Local-first خارج از AppData و تغییر آن از Settings بدون Reload مخرب یا دست‌زدن به Draftهای AppData.
- [x] گسترش Regression و Browser Smoke دوطرفه `fa-IR / RTL` و `en / LTR` از Shell/Settings به Today، Month و Reports در فاز ۱۷۵.
- [x] گسترش همین قرارداد به Clients/Projects/Invoices/Leave و Journeyهای تجاری در فاز ۱۷۶.
- [x] ترجمه Validation/Toastهای تجاری و خروجی CSV/Excel/سطح چاپ مرتبط در فاز ۱۷۶، بدون تغییر داده دامنه.
- [x] تکمیل متن‌های System/PWA و سطوح باقی‌مانده Settings/Onboarding/Import/About در فاز ۱۷۷؛ Metadata استاتیک فعلاً Canonical فارسی و Runtime title دو Locale است.
- [x] فاز ۱۷۸: Audit نهایی Hard-coded UI، Metadata/PWA، Print/CSV و هندسه دو جهت پیش از تصمیم Rollout زبان دوم؛ Audit اجرایی به Quality Gate متصل شد.
