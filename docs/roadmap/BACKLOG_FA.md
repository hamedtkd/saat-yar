# بک‌لاگ ساعت‌یار

## مسیر فعال پس از 2.5.0

- [x] Phase 195 — OAuth Verification Readiness + GA4 + Public Help.
- [x] Phase 196 — GA4 Runtime + Leave Intelligence Hardening.
- [x] Phase 197 — Tooltip System + Production Observability.
- [x] **Phase 198 — Onboarding + Freelancer Workflow Redesign**
  - بازطراحی Welcome/Step shell بر اساس reference جدید و اتصال شماره مراحل با خط progress.
  - ارتقای نرخ پروژه Freelancer با amount grouping، unit ساعتی/روزانه و معادل واضح.
  - حذف semantics ورود/خروج/ناهار از مسیر اصلی Freelancer Today.
  - یکپارچه‌سازی CTA زمان‌سنج Freelancer روی Project Timer و اصلاح Running/Stop state.
  - کاهش فضای خالی و اصلاح alignment کارت Focus/Timer.
- [ ] **Phase 198.1 — Today Timer Experience Redesign (فعال)**
  - [x] R2: بستن i18n/type regressionهای R1.
  - [x] R2: اتصال Local Clock به Runtime Clock مشترک و حذف CTA تکراری Freelancer.
  - [x] R2: بازگردانی Heatmap Tooltip browser-smoke contract.
  - [x] Date/Time Picker foundation برای Manual Entry و مسیرهای Calendar/Edit.
  - [x] R4: هم‌راستا کردن تست‌های تاریخی Accessibility/Theme با Responsive Picker Surface مشترک.
  - [x] R4 Full Gate confirmed: 900/900 tests plus Production/Freelancer/Employee/Pairing browser gates and Vercel audit.
  - [x] R5 source: visual timer redesign, wheel time picker, and shared DateTimePicker replacement for native datetime editing.
  - [x] R5 Full Gate جای خود را به R6 Visual QA follow-up داد؛ R5 به‌دلیل UI/interaction رد شد و baseline commit نیست.
  - [x] R6 source: Freelancer Work Session Controller با stateهای IDLE/RUNNING/PAUSED، Start/Pause/Resume/Finish و حذف کامل Analog/Local Clock از Hero.
  - [x] R6 source: Activity Details دوپنله، Today summary/timeline و mini 7-day trend فقط از داده واقعی.
  - [x] R6 source: DateTimePicker desktop روی body portal/fixed collision-safe و Time Wheel با mouse/pen drag علاوه بر touch/keyboard.
  - [x] R6 Full Gate در Visual QA بعدی جای خود را به R7 داد؛ R6 به دلیل End edit/Timeline density/Recent Projects conflict/Trend readability هنوز baseline commit نیست.
  - [x] R7 source: End DateTime edit برای TimeEntryهای تکمیل‌شده؛ live end همچنان فقط از Finish ثبت می‌شود تا state machine desync نشود.
  - [x] R7 source: Timeline table با max-height و scroll داخلی/sticky header تا تعداد زیاد رکورد ارتفاع صفحه را منفجر نکند.
  - [x] R7 source: Recent Projects هنگام session فعال یا paused دیگر Start متداخل نشان نمی‌دهد؛ پروژه جاری status می‌گیرد و بقیه قفل توضیح‌دار می‌شوند.
  - [x] R7 source: Timer در display box compact قرار گرفت و mini trend هفت‌روزه به barهای روزانه با توضیح قابل‌فهم و tooltip دسترس‌پذیر تبدیل شد.
  - [x] R7 Visual QA رد شد؛ timer box، trend card و Recent Projects هنوز با reference نهایی هم‌راستا نبودند و R7 baseline commit نیست.
  - [x] R8 source: elapsed timer به سه tile مستقل ساعت/دقیقه/ثانیه با geometry ثابت و radius/tokenهای ساعت‌یار تبدیل شد.
  - [x] R8 source: Timer Hero و Today Summary داخل یک Work Session Controller واحد ادغام شدند؛ nested card اضافی و radius ناهماهنگ حذف شد.
  - [x] R8 source: 7-day trend داخل Today Summary و با همان chart theme صفحه Month رندر می‌شود؛ کارت مستقل و padding نامتناسب R7 حذف شد.
  - [x] R8 source: Recent Projects برای Running/Paused/Blocked shrink-safe شد و status دیگر layout را عمودی نمی‌شکند.
  - [x] R9 source: mobile density/minimal polish روی Timer Controller؛ checkpoint بصری و نه commit baseline.
  - [x] R10 source: Project Timer به FlipClock موجود `components/ui` با digit box کوچک و animation reduced-motion-safe مهاجرت کرد؛ dependency جدیدی اضافه نشد.
  - [x] R10 source: Today routeها به `/employee/today`، `/freelancer/today` و `/hybrid/today` تفکیک شدند؛ `/today` compatibility entry باقی ماند و پس از resolve شدن mode به route اختصاصی همان workspace هدایت می‌شود.
  - [x] R10 source: loading/skeleton مستقل Employee/Freelancer و route-aware AppLoading اضافه شد؛ analytics/multi-tab همچنان logical Today واحد می‌مانند.
  - [x] R16 Full Gate: 927/927 tests + production build + Production/Freelancer/Employee/Pairing browser smokes + release/Vercel audits سبز شد.
  - [x] R17 source: responsive hardening اختصاصی <=359px برای Todayهای mode-specific، FlipClock/Header/BottomNav/Pickers/Skeletons و runtime smoke مستقیم 320×800.
  - [ ] R17 Full Gate + final visual QA across 320/360/375/425px before commit.



## Phase 198.1 R6 historical checkpoint

- [x] R4 full gate remains the last dependency-backed green baseline: 900/900 tests plus production build and all browser gates.
- [x] R5 visual QA was rejected; its analog-clock-heavy composition and picker interaction are not a commit baseline.
- [x] R6 source: remove Analog Clock and Local Clock from the Freelancer centerpiece and reduce timer scale.
- [x] R6 source: explicit IDLE/RUNNING/PAUSED controller with Start, Pause, Resume and Finish; paused time is excluded by closing/reopening normal TimeEntry segments.
- [x] R6 source: paused controller metadata is browser-local and recoverable without changing AppData v20.
- [x] R6 source: Current Activity panel follows the approved reference; Client/Project stay locked while active, Task/Description/Billable remain editable.
- [x] R6 source: no Tags invented because the current Freelancer TimeEntry/Project contract has no tag field.
- [x] R6 source: DateTimePicker desktop content is portaled to `document.body` with fixed positioning, viewport collision handling and z-index above app surfaces.
- [x] R6 source: Time Wheel supports mouse/pen press-drag while retaining touch momentum and keyboard navigation.
- [x] R6 source: Today summary, work/gap timeline and 7-day mini trend use real persisted time entries only.
- [x] R6 source: no package, lockfile or schema change.
- [x] R6 gate superseded by R7 before commit; do not use R6 as release baseline.
- [x] R6 Visual QA produced the R7 follow-up issues; continue validation on R7.
- [x] No commit was created from R6.


## Phase 198.1 R7 current checkpoint

- [x] End DateTimePicker برای TimeEntry تکمیل‌شده در Timeline فعال است؛ entry زنده عمداً End editor ندارد چون تعیین End معادل Finish است و باید همراه با session metadata انجام شود.
- [x] تغییر Start/End نامعتبر که End <= Start شود reject می‌شود و Toast توضیحی می‌دهد.
- [x] Timeline table در Desktop روی 360px و Mobile روی 320px سقف ارتفاع دارد، scroll داخلی و header sticky دارد.
- [x] Recent Projects از projectTimerSession/activeEntry آگاه است: پروژه جاری Running/Paused badge می‌گیرد؛ پروژه‌های دیگر تا پایان session CTA Start ندارند.
- [x] elapsed timer داخل display box کم‌ارتفاع و token-driven قرار گرفت؛ shared FlipClock تاریخی تغییر نکرد تا قرارداد Phase 179 نشکند.
- [x] 7-day trend به seven-bar visualization با weekday label، visible hint، DescriptionTooltip و tooltip دقیق هر روز تبدیل شد.
- [x] AppData v20، dependencyها و package-lock بدون تغییر.
- [ ] Run full dependency-backed R7 gate.
- [ ] Final visual QA: completed end edit, long Timeline scroll, active/paused Recent Projects, boxed timer, week-trend hover/focus on Desktop/Mobile.
- [ ] Credential scan, commit and push only after Gate + Visual QA are green.

## Phase 198.1 R8 current checkpoint

- [x] Approved reference is authoritative for the Freelancer timer/activity module; no unrelated page redesign.
- [x] Hour, minute and second values render in independent tiles with LTR numeric geometry inside RTL UI.
- [x] IDLE/RUNNING/PAUSED retain the same controller geometry; only status, elapsed value and actions change.
- [x] Today summary owns the 7-day chart; Month chart theme tokens and bar-chart language are reused instead of a new standalone card style.
- [x] Recent Projects active/paused/busy states remain readable in a 300px aside without vertical status text.
- [x] Timeline max-height/end-time editing/portal picker/mouse-drag wheel behavior from R6/R7 are preserved.
- [x] AppData v20, package.json and package-lock.json remain unchanged.
- [x] R8/R9 توسط Visual QA supersede شدند؛ commit baseline نیستند.

## Phase 198.1 R10 current checkpoint

- [x] Compact boxed FlipClock روی Project Timer با استفاده از `framer-motion` از قبل نصب‌شده.
- [x] route ownership مستقل برای Employee/Freelancer/Hybrid Today؛ `/today` فقط compatibility entry است و به route mode-specific هدایت می‌شود.
- [x] Freelancer و Employee loading skeleton ownership جدا.
- [x] navigation/route guard/analytics/multi-tab semantics با mode-specific Today هماهنگ شدند.
- [x] AppData v20 و package/lockfile بدون تغییر.
- [ ] Full dependency-backed R10 gate.
- [ ] Final visual QA روی 425px + desktop برای سه workspace.
- [ ] Credential scan و commit فقط پس از Gate + Visual QA.

## Backlog محصول

- [ ] Analytics Dashboard & Product Insights پیشرفته (custom dimensions/funnels/dashboard) — **deferred**؛ فعلاً GA4 برای شمارش usage و رفتار کلی کافی است.
- [ ] Month Intelligence v2 — drill-down توضیح‌پذیر work/leave/overtime/deficit.
- [ ] Reports v2 — فیلتر و breakdown پیشرفته و export/print تکمیلی.
- [ ] Backup & Device Transfer v2 — health/conflict/restore UX.
- [ ] Calendar Integration v2 — sync diagnostics و multi-calendar UX.
- [ ] PWA Reliability v2، Accessibility pass و Performance budget پیش از RC بعدی.

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
- [x] فاز ۱۸۰: Final Release 2.4.0؛ Candidate فاز ۱۷۹ روی `1cabdb4` با Gate `۷۶۴/۷۶۴` حفظ شد، Merge اولیه کنترل‌شده `7627e99` ثبت شد، Gate نهایی ۷۷۰/۷۷۰ سبز شد، Merge نهایی روی `71f6732` Deploy شد، `audit:production` پاس شد و Tag annotated `v2.4.0` دقیقاً روی همان Commit منتشر شد.
- [x] AppData Schema روی v17 باقی می‌ماند و Phase 179 Migration یا Dependency جدید ندارد.
- [x] Manifestهای ۲.۳.۲ و قدیمی‌تر تاریخی و immutable باقی می‌مانند.
- [x] Static metadata/PWA در Candidate همچنان Canonical فارسی است و Runtime Locale فارسی RTL / انگلیسی LTR را اعمال می‌کند.

## توسعه پس از ۲.۴.۰ — First-run، انعطاف و تحلیل

- [x] فاز ۱۸۱: Onboarding & First-run UX؛ Fast Setup و Skip for now بدون حذف Wizard کامل، Apply یک برنامه به همه روزهای فعال، CTA روشن اولین اقدام برای Employee/Freelancer/Hybrid و پالیش Responsive/RTL/LTR.
- [x] فاز ۱۸۲: Flexible Work Mode & Activity Segments؛ حالت Flexible بدون الزام Start/End ثابت، Target مستقل روزانه، وقفه‌های شناور و Segmentهای جلسه/یادگیری/کار عمیق/اداری/پروژه با Breakdown گزارش؛ بررسی معماری به ارتقای AppData از Schema v17 به v18 با Migration امن منجر شد.
- [x] فاز ۱۸۳: Notification Intelligence؛ تا پنج Reminder سفارشی مستقل، Snooze و Quiet hours بر اساس Active Work Time، به‌همراه بازطراحی ناوبری Settings موبایل به Section Picker فشرده و بدون اشغال viewport.
- [x] فاز ۱۸۴: Product Analytics privacy-safe؛ Event taxonomy تایپ‌شده، Consent/Opt-out محلی خارج از AppData، Plausible adapter اختیاری بدون Auto-tracking و ممنوعیت ارسال حقوق، درآمد، نام/عنوان، یادداشت، تاریخ/ساعت دقیق، ID یا Free-text.
- [x] فاز ۱۸۵: GitHub-style Activity Graph & Month Intelligence؛ Heatmap کارکرد واقعی با Persian/Gregorian، Tooltip portal-safe و keyboard accessibility، Recent 7 Days، streak، قوی‌ترین روز و توزیع deficit/overtime؛ همه داده‌ها Derived و بدون Schema bump روی v19 باقی ماندند.
- [x] فاز ۱۸۶: Motion & Perceived Performance؛ Loading Skeletonهای Route-aware برای Today/Month، Route Motion محدود به opacity/transform، radial Theme Reveal از خود دکمه با fallback Reduced Motion، و alignment یکدست کارت‌های Month بدون Schema/Dependency جدید.
- [x] فاز ۱۸۷: Google Calendar Architecture + Read Integration؛ OAuth فقط‌خواندنی با Token memory-only، انتخاب Calendar محلی، Preview و Context رویداد در Today/Month بدون تبدیل به WorkRecord.
- [x] فاز ۱۸۸: Google Calendar Write + Unified Month UX؛ Scope حداقلی `calendar.events` + `calendar.calendarlist.readonly`، Create/Edit/Delete رویداد با Modal مشترک، حذف occurrence/series، Google به‌عنوان لایه اختیاری روی «ماه من» و sortable records table بدون تغییر Source of Truth کارکرد/تعطیلات.
- [x] فاز ۱۸۹A: Calendar UX Polish؛ اصلاح دقت نمودار هفتگی و وضعیت تعطیلات، Header موبایل، Modal sticky، Toast CRUD، Quick Delete، CTA اتصال در Month، Quick Create کنار جدول و Alignment تنظیمات Google.
- [x] فاز ۱۸۹B: Settings Information Architecture + Calendar Day Quick Actions؛ `/settings` به Overview و routeهای مستقل Profile/Appearance/Work/Payroll/Notifications/Integrations/Data/Sync/Privacy تقسیم شد و Context Menu روز در Month برای Event CRUD، Holiday/Workday override و دسترسی سریع اضافه شد؛ Search، Deep-link و Unsaved Draft Guard حفظ شدند.
- [x] فاز ۱۸۹C: Payroll Rate Basis & Standard Monthly Hours؛ نرخ ساعتی روش‌های ماهانه از ساعات سپری‌شده جدا شد، مبنای پیش‌فرض ۲۲۰ ساعت استاندارد ماه قابل تنظیم است، حالت اختیاری ساعات موظفی بازه حفظ شد و Schema توسعه به v20 ارتقا یافت.
- [x] فاز ۱۹۰: Calendar Intelligence؛ incremental sync token با fallback پاسخ 410، ETag/If-Match برای conflict-safe mutation، collapse کردن duplicate occurrenceها، Event → Activity کاملاً اختیاری و duplicate-safe، Day/Week planning و recurring occurrence/series editing بدون تبدیل خودکار Calendar به WorkRecord.
- [x] فاز ۱۹۱: Payroll & Reports Hardening؛ ساخت Payroll Period Facts مشترک برای Reports/Preview، جداسازی holiday work از regular balance، همسان‌سازی Paid Leave با credited time و مشتق‌سازی واحد نرخ Base/Overtime/Holiday/Deficit بدون تغییر Schema v20.
- [x] فاز ۱۹۲: Behavioral Test Modernization؛ استخراج Report Summary به قرارداد pure و رفتاری، حذف source-inspection از تست‌های جدید Phase 192، ثبت budget بدهی تاریخی source-coupled tests و افزودن `audit:tests` برای جلوگیری از رشد دوباره وابستگی تست‌ها به filename/ساختار داخلی.
- [ ] Technical debt پس از 2.4.0: کاهش Regex source tests و افزایش behavioral/component/browser contracts به‌صورت تدریجی.

## بین‌المللی‌سازی آینده — پس از Patch بعدی

- [x] ایجاد Catalog/Dictionary تایپ‌شده و استخراج متن‌های Shell/Navigation/Settings بدون تغییر رفتار دامنه؛ پوشش صفحه‌های محتوایی در فاز ۱۷۵ ادامه دارد.
- [x] افزودن Locale انگلیسی و قرارداد LTR برای Shell/Navigation/Settings؛ ترجمه کامل صفحه‌های دامنه و سیاست تقویم/اعداد در فاز ۱۷۵ ادامه دارد.
- [x] ذخیره Locale انتخابی به‌صورت Local-first خارج از AppData و تغییر آن از Settings بدون Reload مخرب یا دست‌زدن به Draftهای AppData.
- [x] گسترش Regression و Browser Smoke دوطرفه `fa-IR / RTL` و `en / LTR` از Shell/Settings به Today، Month و Reports در فاز ۱۷۵.
- [x] گسترش همین قرارداد به Clients/Projects/Invoices/Leave و Journeyهای تجاری در فاز ۱۷۶.
- [x] ترجمه Validation/Toastهای تجاری و خروجی CSV/Excel/سطح چاپ مرتبط در فاز ۱۷۶، بدون تغییر داده دامنه.
- [x] تکمیل متن‌های System/PWA و سطوح باقی‌مانده Settings/Onboarding/Import/About در فاز ۱۷۷؛ Metadata استاتیک فعلاً Canonical فارسی و Runtime title دو Locale است.
- [x] فاز ۱۷۸: Audit نهایی Hard-coded UI، Metadata/PWA، Print/CSV و هندسه دو جهت پیش از تصمیم Rollout زبان دوم؛ Audit اجرایی به Quality Gate متصل شد.

## آمادگی انتشار ۲.۵.۰

- [x] فاز ۱۹۱: Payroll & Reports Hardening؛ Payroll Period Facts مشترک، Paid Leave consistency و rate summary واحد.
- [x] فاز ۱۹۲: Behavioral Test Modernization؛ Report Summary رفتاری و جلوگیری از رشد source-coupled tests.
- [x] فاز ۱۹۳: Release Candidate 2.5.0؛ bump نسخه، Manifest Schema v20، Migration audit v17→v20، Release Notes دو‌زبانه و Browser/Production matrix روی Baseline `0c4c22e` با ۸۷۴/۸۷۴ تست و Candidate commit `d81e094`.
- [x] فاز ۱۹۴: Finalization/Release 2.5.0؛ Final source و ۸۸۰-test contract، سپس Merge کنترل‌شده به `main`، Deploy، `audit:production` و Tag annotated `v2.5.0` فقط به همین ترتیب.


## توسعه پس از ۲.۵.۰ — Trust & Measurement

- [x] فاز ۱۹۵: OAuth Verification Readiness + GA4 Analytics؛ صفحات عمومی About/Privacy/Terms/Help، disclosure Google Calendar، Verification Kit و مهاجرت consent-safe از Plausible به GA4 بدون Schema/Dependency جدید.
- [x] فاز ۱۹۶: GA4 Runtime + Leave Intelligence Hardening؛ ارسال واقعی GA4 روی Production، opt-out محلی، اتصال مرخصی ثبت‌شده به Month Intelligence/Recent 7 Days، تفکیک کار/مرخصی/کسری و اصلاح ترتیب نمودار هفتگی RTL.
- [x] فاز ۱۹۷: Tooltip System + Production Observability؛ یکپارچه‌سازی Tooltipهای توضیحی/Heatmap روی primitive مشترک portal-safe و viewport-aware، پوشش routeهای عمومی جدید در Production Audit و بستن diagnostics اعتمادپذیر بعد از 2.5.0.
- [x] فاز ۱۹۸: Onboarding + Freelancer Workflow Redesign؛ بازطراحی First-run، نرخ پروژه ساعتی/روزانه و جداسازی Project Timer از Attendance در فضای Freelancer.
- [x] فاز ۱۹۸.۱ R2: Today Timer Stabilization؛ بستن regressionهای i18n/type/tooltip، اتصال Local Clock به Runtime Clock مشترک و حذف CTA تکراری Freelancer. Gate کامل محیط توسعه اصلی با ۸۹۸/۸۹۸ تست، Build استاتیک و Browser Smokeهای Production/Freelancer/Employee/Pairing سبز شد.
- [x] فاز ۱۹۸.۱ R3: Date/Time Picker Foundation؛ Surface مشترک Responsive برای Date/Time با Popover دسکتاپ و Drawer موبایل زیر ۸۰۰px، SSR-safe presentation store و modal focus/scroll فقط روی Drawer؛ بدون Schema/Dependency جدید.
- [x] فاز ۱۹۸.۱ R4: Gate Contract Hotfix؛ اصلاح دو تست تاریخی source-coupled برای دنبال‌کردن delegation به ResponsivePickerSurface و مالکیت مشترک Accessibility/Overlay، بدون تغییر Product code یا داده.
- [x] فاز ۱۹۸.۱ R11: Gate Hotfix؛ حذف `Date.now()` از renderهای Timer/Summary، تثبیت dependency recovery و پاک‌سازی خودکار `project-clock-face.tsx` باقی‌مانده از Revisionهای قبلی.
- [x] فاز ۱۹۸.۱ R12: Full Test Gate Contract Hotfix؛ به‌روزرسانی قراردادهای تاریخی route برای Todayهای workspace-specific، رفع import alias تست مستقیم Time Picker و حفظ ownership guard روی Start/Pause/Resume/Finish پروژه بدون تغییر Schema/Dependency.
- [ ] فاز ۱۹۸.۱ Final Visual QA: بررسی Today و Pickerها در Freelancer/Employee/Hybrid، تم روشن/تاریک، فارسی RTL/انگلیسی LTR و Mobile/Desktop پیش از Commit.
- [ ] فاز ۱۹۹: Month Intelligence v2؛ explainability مانده، drill-down روزها، work/leave/overtime/deficit و anomaly detection.


## Phase 198.1 R13 current checkpoint

- [x] Hard Reload lock قدیمی همان تب را در pagehide آزاد می‌کند و Resume به takeover اشتباه نیاز ندارد.
- [x] release فقط روی lock متعلق به همان tabId انجام می‌شود و lock تب دیگر دست‌نخورده می‌ماند.
- [ ] Full Browser Gate روی R13 در محیط اصلی توسعه.
## Phase 198.1 R14 current checkpoint

- [x] Resume timer elapsed از persisted `segmentStartedAt` استفاده می‌کند و در render transition به activeEntry قدیمی وابسته نیست.
- [x] Shared Runtime Clock در طول Paused session گرم می‌ماند ولی elapsed domain در Pause ثابت است.
- [x] Freelancer Browser Smoke تغییر واقعی timer بعد Resume را با wait condition بررسی می‌کند، نه fixed sleep.
- [ ] Full Browser Gate روی R14 در محیط اصلی توسعه.
## Phase 198.1 R15 current checkpoint

- [x] R14 Full Gate تا مرحله ESLint رسید و تنها یک warning بدون استفاده در smoke harness مانع Build تازه شد.
- [x] R15 warning متغیر `resumedElapsed` را حذف می‌کند.
- [x] Browser input helper برای Expense/Invoice، focus و native React-compatible setter را در یک transaction انجام می‌دهد تا rerender بین دو CDP call فوکوس را از بین نبرد.
- [x] Timer flow واقعی `Pause → Reload → Resume → Finish` در Browser Smoke محیط اصلی سبز شد.
- [x] R15 failure بعدی به false negative مقایسه `125000` با نمایش localized برابر `۱۲۵۰۰۰` محدود شد.

## Phase 198.1 R16 current checkpoint

- [x] Browser input verification ارقام فارسی/عربی NumberField را فقط در صورت برابری عددی semantic می‌پذیرد.
- [x] متن عادی exact باقی می‌ماند و مقدار عددی متفاوت fail می‌شود.
- [x] قرارداد native setter + React InputEvent تاریخی حفظ شده است.
- [x] Full dependency-backed Gate روی R16 در محیط اصلی توسعه: 927/927 و همه Browser Gateها سبز.
- [x] Freelancer Browser Smoke روی Build تازه R16 کامل سبز شد.
- [ ] Final Visual QA قبل از Commit.

## Phase 198.1 R17 current checkpoint

- [x] Tiny-mobile density layer برای viewportهای <=359px بدون تغییر عمدی layout پذیرفته‌شده 375/425px.
- [x] Freelancer Timer/Activity/Today Summary/Timeline/Recent Projects در 320px shrink-safe و بدون CTA overflow.
- [x] Employee Today editor و route-aware loading skeleton برای 320px فشرده شد.
- [x] Header controls، Workspace/Profile controls و Mobile Bottom Nav در 320px fit می‌شوند و safe-area حفظ می‌شود.
- [x] DateTime/Jalali/Time Wheel drawer surfaces برای 320px compact شدند.
- [x] Runtime Browser Smoke برای `/freelancer/today` و `/employee/today` روی viewport 320×800 no-horizontal-overflow check دارد.
- [ ] Full dependency-backed R17 Gate در محیط اصلی توسعه.
- [ ] Visual QA روی 320/360/375/425px در Running/Paused و Picker states؛ Commit فقط بعد از سبز شدن هر دو.
