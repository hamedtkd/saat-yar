## [Unreleased]

### افزوده شد

- Phase 178: Closure نهایی i18n با `audit:i18n` سراسری روی Runtime UI، Allowlist محدود و مستند برای Metadata/Parser/Tone classifier و Regression contract مستقل اضافه شد.
- Shared Dialog/AlertDialog/Select/Table/Picker geometry از RTL فیزیکی به Direction و Logical CSS تبدیل شد؛ Runtime errorهای Import/Device Pairing نیز از Bridge Locale عبور می‌کنند تا متن low-level زبان مقابل در UI نشت نکند.
- Excel Report اکنون `lang/dir` را از Locale فعال می‌گیرد؛ Metadata و Manifest استاتیک Release 2.3.2 عمداً Canonical فارسی باقی می‌مانند و Runtime title/lang/dir در مرورگر از Locale کاربر پیروی می‌کند.

- Phase 177: i18n در Settings، Onboarding، Import، About، Device Transfer، PWA Experience و پیام‌های System/Persistence/Notification تکمیل شد؛ Runtime title نیز از Locale فعال پیروی می‌کند.
- Production Browser Smoke اکنون Settings/Import/About و Re-entry واقعی Onboarding را در English/LTR پیش از Restore فارسی بررسی می‌کند؛ Static metadata و Manifest منتشرشده برای سازگاری Release 2.3.2 فعلاً Canonical فارسی باقی مانده‌اند.

- Phase 176: i18n به Clients، Projects، Project Detail/Expenses، Invoices و Leave گسترش یافت؛ Validation و Toastهای تجاری نیز از Locale فعال پیروی می‌کنند.
- Exportهای CSV/Excel گزارش‌ها اکنون Header، تاریخ، Yes/No، نام فایل و Toast را مطابق Locale فعال تولید می‌کنند و Browser Smoke مسیرهای تجاری English/LTR را پیش از بازگشت به Persian/RTL بررسی می‌کند.

- Phase 175: i18n از Shell/Settings به Today، Month و Reports گسترش یافت؛ متن‌ها، جدول‌ها، نمودارها، Pickerهای زمان/تاریخ و Empty Stateها از Catalog تایپ‌شده فارسی/انگلیسی استفاده می‌کنند.
- نمایش تاریخ/عدد/مدت/پول Locale-aware شد؛ `fa-IR` با RTL و ارقام فارسی و `en` با LTR و ارقام لاتین، در حالی که تقویم شمسی و کلیدهای ذخیره‌شده تاریخ/زمان بدون تغییر می‌مانند.
- Production Browser Smoke اکنون پس از ماندگاری English/LTR سه Route واقعی Today/Month/Reports را بررسی می‌کند و سپس Locale را به Persian/RTL بازمی‌گرداند.

- Phase 174: Foundation واقعی i18n اضافه شد؛ Catalog تایپ‌شده فارسی/انگلیسی، Locale مستقل Local-first، سوییچ زنده زبان از Settings و Bootstrap پیش از Hydration برای جلوگیری از پرش جهت صفحه.
- Shell، Header، Sidebar، Mobile Navigation، Profile Menu، Footer و سطح اصلی Settings اکنون بر اساس Locale مشترک فارسی RTL یا انگلیسی LTR رندر می‌شوند.
- Production Browser Smoke ماندگاری `en/LTR` در Reload و بازگشت امن به `fa-IR/RTL` را قبل از ادامه Journeyهای قدیمی بررسی می‌کند.

- Phase 173: آنبوردینگ بر اساس Employee/Freelancer/Hybrid شخصی می‌شود؛ فریلنسر می‌تواند مشتری و پروژه اول را بسازد، Hybrid شروع سریع هر دو جریان درآمد را دارد و Import امن Phase 171 داخل مرحله نهایی Onboarding در دسترس است.

### تغییر کرد

- Progress آنبوردینگ از شش به هفت مرحله توسعه یافت و برچسب مراحل ۳ و ۴ با Workspace انتخاب‌شده تغییر می‌کنند.
- Import داخل Onboarding وضعیت `onboarded` را تا Submit نهایی حفظ می‌کند تا Restore باعث خروج زودهنگام از Wizard نشود.

- فاز ۱۷۲: تایمرهای فعال Today و Project از یک Runtime Clock مشترک و کم‌مصرف استفاده می‌کنند؛ تایمر اصلی با ثانیه زنده است و Summary/Metricها فقط در مرز دقیقه تازه می‌شوند.
- Runtime Clock در تب مخفی Timer ندارد و روی `visibilitychange`، `focus` و `pageshow` فوراً با زمان واقعی Sync می‌شود؛ Tickها هیچ Persistence، Network، Broadcast یا Heartbeat جدیدی ایجاد نمی‌کنند.
- محاسبه زنده فقط ناهار/وقفه واقعی بدون حقوق را کم می‌کند تا ناهار برنامه‌ریزی‌شده تایمر ابتدای روز را مصنوعی متوقف نکند؛ محاسبه نهایی تاریخی بدون تغییر باقی می‌ماند.

- فاز ۱۷۱: Route مستقل `/import` برای Import Wizard اضافه شد؛ Backup ساعت‌یار قبل از اعمال تحلیل می‌شود و مسیر پیش‌فرض «افزودن امن» تنظیمات و تعارض‌های فعلی را بازنویسی نمی‌کند.
- CSV/TSV اکنون برای روزهای کاری، مشتری‌ها، پروژه‌ها و هزینه‌ها با تشخیص Header فارسی/انگلیسی، Mapping قابل‌ویرایش، تاریخ شمسی/میلادی، اعداد فارسی، Validation ردیفی و Strategy صریح Skip/Replace پشتیبانی می‌شود.
- جایگزینی پرریسک قبل از اعمال یک Backup ایمنی دانلود می‌کند و Production Browser Smoke مسیر واقعی Upload → Preview → Apply → IndexedDB را بررسی می‌کند.

- فاز ۱۷۰: ویرایش روز تکمیل‌شده اکنون Action Bar چسبان زیر Header دارد؛ Dirty state، انصراف، بازنشانی و ذخیره همیشه هنگام کار با Editor در viewport می‌مانند.
- پس از ذخیره، تأیید موفقیت در همان viewport نمایش داده می‌شود و Browser Smoke کارمند دسترسی Desktop/Mobile به Action Bar پس از اسکرول تا ویرایش دقیق ناهار و وقفه‌ها را بررسی می‌کند.

- فاز ۱۶۹: آنبوردینگ به شش مرحله نام، نوع استفاده، برنامه کاری، حقوق، ظاهر و ذخیره‌سازی گسترش یافت؛ برنامه کاری از Editor واقعی Settings استفاده می‌کند و حقوق/تم نیز همان ابتدا قابل تنظیم‌اند.
- داده‌های `weeklySchedule`، `weeklyMinutes`، `workDays` و `defaultStart/defaultEnd` پس از تغییر برنامه کاری همگام می‌مانند و Browser Smoke دوام آن‌ها را در Reload و IndexedDB بررسی می‌کند.
- Shell دسکتاپ در نمایشگرهای 1920/2400+ عریض‌تر و نسبت به فضای باقی‌مانده کنار Sidebar متوازن شد؛ Dropdown پروفایل نیز بالاتر از Search Card تنظیمات قرار می‌گیرد.
- صفحه Welcome آنبوردینگ با کارت پروفایل و ورودی نام خواناتر بازطراحی شد.
- Revision 3 هندسه دسکتاپ عریض را با حذف padding افقی والد در breakpoint Sidebar اصلاح می‌کند تا مرکزشدن workspace در 2560px واقعاً متقارن بماند؛ قرارداد Browser Smoke شل نشده است.
- بازخورد UX ویرایش روز تکمیل‌شده برای فاز ۱۷۰ برنامه‌ریزی شد تا Save/Cancel و تأیید ذخیره در همان viewport و نزدیک editor دیده شوند.

- قرارداد مرخصی استحقاقی اصلاح شد: پیش‌فرض اشتباه ۴۲ ساعت حذف و مبنای قانونی `۷:۲۰ × ۲۶ ÷ ۱۲` به سهمیه ماهانه حدود ۱۵:۵۳ و سهمیه سالانه ۱۹۰:۴۰ تبدیل شد.
- مصرف مرخصی کامل/نیم‌روز اکنون روزبه‌روز و با برنامه واقعی همان تاریخ محاسبه می‌شود؛ تعطیلات رسمی، جمعه و روزهای غیرفعال برنامه کاری از سهمیه کسر نمی‌شوند و جفت legacy `26h + 16h` هنگام خواندن داده به قرارداد صحیح ترمیم می‌شود.

- Recovery آنبوردینگ بدون `setState` هم‌زمان داخل Effect و با External Store محلی انجام می‌شود؛ مرحله پیش‌فرض کاربر جدید نیز از ۲ به ۱ اصلاح شد تا Wizard واقعاً از دریافت نام شروع شود.
- پیشرفت آنبوردینگ اکنون به‌صورت Local-first ذخیره می‌شود و Reload/بستن مرورگر مرحله فعال را از بین نمی‌برد.
- Settings یک کارت «راه‌اندازی اولیه» برای اجرای دوباره Wizard بدون پاک‌کردن پروژه‌ها، رکوردها، مرخصی‌ها یا داده‌های مالی دارد.
- Session بازاجرای آنبوردینگ صریح است؛ تا زمانی که کاربر Wizard را تمام نکرده یا به تنظیمات برنگشته، Route Guard همان Session را از `/onboarding` ادامه می‌دهد.
- Production Browser Smoke یک Hard Reload واقعی در مرحله برنامه کاری انجام می‌دهد و بازگشت به همان مرحله را تأیید می‌کند.

- راه‌اندازی اولیه از Overlay سراسری روی صفحه Today به Route مستقل `/onboarding` منتقل شد؛ کاربر جدید پیش از ورود به Workspace به این Route هدایت می‌شود و پس از تکمیل به `/today` می‌رود.
- Shell آنبوردینگ از Header/Sidebar/Bottom Navigation داشبورد جدا شد و Route راه‌اندازی برای موتور جستجو `noindex` باقی می‌ماند.
- Production Browser Smoke اکنون Redirect واقعی `/` → `/onboarding` → `/today` را روی Storage خالی تأیید می‌کند.

## [2.3.2] - 2026-08-09

### مستندات

- `README.md` اکنون README اصلی و انگلیسی GitHub است؛ نسخه کامل فارسی به `README_FA.md` منتقل شده و `README_EN.md` برای سازگاری لینک‌های قدیمی به مسیر جدید اشاره می‌کند.
- لینک‌های مستندات و قرارداد Release با ساختار جدید README هماهنگ شدند و نقشه راه i18n برای رابط فارسی RTL و انگلیسی LTR ثبت شد.

### اصلاح شد

- تم‌های فیروزه‌ای و آبی اکنون برای کنترل‌های پرشده از سطح Accent تیره‌تر با متن و آیکن سفید استفاده می‌کنند؛ رنگ Accent اصلی برای نمودار، Focus و هویت تم حفظ شده است.
- Reload عادی دیگر صرفاً به‌خاطر `beforeunload` روز باز را خودکار نمی‌بندد و بازیابی نشست بر Heartbeat تکیه می‌کند.
- رکوردی که پس از قطع طولانی یا بستن ناگهانی خودکار بسته شده، در روز جاری CTA «از سرگیری کار» دارد؛ فاصله بین Auto-close و Resume به‌عنوان وقفه بدون حقوق ثبت می‌شود تا کارکرد به‌اشتباه افزایش پیدا نکند.
- «ویرایش این روز» برای اصلاح رکوردهای واقعا تمام‌شده در کنار مسیر Resume باقی مانده است.

- Workflow گیت‌هاب از Deploy بلااستفاده GitHub Pages به CI همسو با Vercel تبدیل شد؛ Build و Audit قرارداد `out/` باقی مانده‌اند اما `deploy-pages` و مجوزهای Pages حذف شدند تا Pushهای سالم به‌دلیل Pages غیرفعال ضربدر قرمز نگیرند.
- چیدمان بالای برنامه کاری در تنظیمات با سه کارت هم‌ارتفاع و Responsive بازطراحی شد؛ کنترل‌های ناهار و هدف کار خالص اکنون alignment، فاصله و hierarchy یکدست دارند و در تبلت/موبایل بدون min-width ثابت شکسته می‌شوند.
- محاسبه خروج پیشنهادی کارمند با قرارداد «کار خالص + ناهار بدون حقوق» صریح شد؛ ورود 07:30 با هدف خالص 8 ساعت و ناهار 45 دقیقه خروج 16:15 می‌دهد و ناهار واقعی کوتاه‌تر/بلندتر همان روز بلافاصله ساعت خروج پیشنهادی را جابه‌جا می‌کند.
- تنظیمات برنامه کاری اکنون «هدف کار خالص هفتگی» را شفاف نام‌گذاری می‌کند و توضیح می‌دهد که ناهار بدون حقوق جزو هدف خالص نیست.
- تنظیم جمعی مدت ناهار و وضعیت «با حقوق» به برنامه هفتگی اضافه شد؛ تغییر جمعی یا روزانه ناهار، ساعت پایان را طوری تنظیم می‌کند که هدف کار خالص آن روز ناخواسته تغییر نکند.
- رکوردهای جدید وضعیت باحقوق/بدون‌حقوق ناهار را از برنامه همان روز می‌گیرند، در حالی که رکوردهای تاریخی قرارداد ذخیره‌شده خودشان را حفظ می‌کنند.
- نتایج جستجوی تنظیمات اکنون در stacking context بالاتری از Sidebar چسبان نمایش داده می‌شوند و دیگر Sidebar روی گزینه‌های جستجو را نمی‌پوشاند.
- تست Responsive تاریخی تنظیمات با ساختار جدید کنترل‌های هدف خالص و ناهار جمعی همگام شد.

## [2.3.1] - 2026-08-08

### اصلاح شد

- صفحه «امروز» اکنون روزهای غیرفعال `weeklySchedule` را صریحاً «تعطیل طبق برنامه کاری» نمایش می‌دهد، ساعت موظفی را صفر توضیح می‌دهد و در صورت نیاز ثبت کار استثنایی را با CTA جداگانه نگه می‌دارد؛ این وضعیت عمداً از تعطیلی رسمی و Holiday Pay جدا است.
- تقویم جلالی صفحه امروز روزهای غیرکاری برنامه هفتگی را با وضعیت بصری مستقل از تعطیلات رسمی نشان می‌دهد.
- Audit Production فرمت واقعی `self.__SAATYAR_PRECACHE` و مسیر نسبی `_next/static/...` را parse می‌کند و reachability یک Build Asset را نیز می‌سنجد تا false negative قبلی حذف شود.

### استقرار و سخت‌گیری Release

- Audit read-only دامنه Production با `npm run audit:production` برای Routeها، PWA، Service Worker/Precache، آیکن‌ها، robots و sitemap به قرارداد Release اضافه شد.
- قرارداد Deploy استاتیک Vercel صریح شد: Framework Preset روی `Other`، Build با `npm run build:vercel` و انتشار فقط از `out/` تا Precache نهایی‌شده PWA به‌جای placeholder سورس روی Production سرو شود.
- دستور `npm run audit:vercel` قرارداد Static Export → PWA finalizer → Vercel output را به‌صورت محلی بررسی می‌کند.
- Patch Release 2.3.1 اصلاحات فازهای ۱۵۵ تا ۱۵۸ را با Baseline تأییدشده `7c675e1` و ۶۰۱ تست سبز بسته‌بندی می‌کند؛ فاز ۱۵۹ شش قرارداد Release اضافه می‌کند و Gate نهایی ۶۰۷ تست است.

## [2.3.0] - 2026-08-08

- Release documentation دوباره لینک صریح `docs/roadmap/BACKLOG_FA.md` را در README نگه می‌دارد تا قرارداد تاریخی Docs/Agent Guide در Gate نهایی ۲.۳.۰ سبز بماند.

- Employee Browser Smoke در Hard Reload یادداشت کارمند را از `textarea.value` می‌خواند، نه `body.innerText`؛ بنابراین Restore واقعی Form Control پس از IndexedDB hydration بدون false timeout تأیید می‌شود.

- Employee Browser Smoke اکنون فیلدهای ناهار و وقفه را از Heading دقیق و `closest("section")` scope می‌کند؛ بنابراین ویرایش Break دیگر به‌اشتباه TimePickerهای Lunch را هدف نمی‌گیرد و Probe قبل از Clock-out جدایی واقعی آن‌ها را در IndexedDB اثبات می‌کند.

- Employee Browser Smoke اکنون همان `InputEvent` اثبات‌شده‌ی مسیر Freelancer را برای Controlled Inputها استفاده می‌کند و قبل از Clock-out، رسیدن `08:00`، ناهار `12:00–12:30` و وقفه بدون حقوق `15:00–15:15` به IndexedDB را صریحاً تأیید می‌کند.

- Fixed a lint-only regression in the employee Time Strip action hook by removing the now-unused `record` dependency after functional WorkRecord patches.

- مسیر کارمند اکنون وضعیت Paid/Unpaid هر وقفه را صریحاً در ویرایشگر نمایش می‌دهد و Browser Journey قرارداد وقفه ۱۵ دقیقه‌ای بدون حقوق را تا محاسبه خالص `۸:۱۵` بررسی می‌کند.

- Release Gate اکنون Browser UX Journey حالت کارمند را نیز بعد از مسیر فریلنسر اجرا می‌کند؛ Start/Lunch/Break/End، یادداشت، محاسبه ۸:۱۵، Month/Reports، Snapshot IndexedDB، Hard Reload و viewport موبایل روی خروجی Production بررسی می‌شوند.

- Freelancer Browser UX smoke اکنون snapshot envelope واقعی IndexedDB را باز می‌کند، قرارداد فعلی `Invoice.lines` را بررسی می‌کند و پس از تأیید persistence یک Hard Reload واقعی برای بازگشت Invoice اجرا می‌کند.
- Browser route expressionهای Freelancer Smoke پیش از ارسال به CDP از سازنده‌های قابل‌تست تولید می‌شوند؛ نرمال‌سازی trailing slash دیگر از Regex شکننده داخل template string استفاده نمی‌کند و خطای `Unexpected token 'return'` رفع شد.
- Freelancer Browser UX smoke اکنون Routeهای Static Export دارای `trailingSlash` را هنگام کشف Link و انتظار برای App Router navigation به‌صورت نرمال‌شده مقایسه می‌کند و در شکست، Inventory لینک‌های DOM را گزارش می‌دهد.
- تست Browser مسیر فریلنسر اکنون بین صفحات کسب‌وکار از Linkهای واقعی App Router استفاده می‌کند و فقط پس از تأیید دوام Client/Project/Expense/Invoice در IndexedDB، Hard Reload را اجرا می‌کند.
- فرم پروژه حالا ساخت سریع مشتری را داخل Dialog رسمی Radix انجام می‌دهد و مشتری جدید را خودکار انتخاب می‌کند؛ فهرست مشتری‌ها نیز ساخت پروژه مرتبط را بدون خروج از صفحه ممکن می‌کند.
- Settings navigation now supports collapsible desktop groups and a two-level mobile section navigator while preserving scroll-spy state.

### Fixed

- ویرایش‌های nested ناهار و وقفه اکنون با Functional Patch روی آخرین WorkRecord اعمال می‌شوند تا تغییر ساعت، Paid/Unpaid و Clock-out نتوانند آرایه Break تازه را با snapshot قدیمی بازنویسی کنند.
- Patchهای حضور و غیاب روی آخرین WorkRecord موجود در state merge می‌شوند تا تعامل‌های سریع Lunch/Break/Clock-out داده تازه را با snapshot قدیمی بازنویسی نکنند.
- پس از ثبت «پایان روز» در حالت کارمند، ویرایشگر روز اکنون از حالت Live به Completed remount می‌شود؛ رکورد کامل‌شده بلافاصله read-only است و CTA «ویرایش این روز» به‌درستی نمایش داده می‌شود.
- همگام‌سازی نمایش `TimePicker` با مقدار کنترل‌شده بعد از توزیع مجدد هدف هفتگی؛ ساعت پایان دیگر مقدار قدیمی را کنار هدف جدید نشان نمی‌دهد.
- همگام‌سازی `weeklyMinutes` با ویرایش مستقیم برنامه روزها و حذف warning بلااستفاده فاز ۱۲۶.
- رفع crash زمان اجرا در Workspace Switcher ناشی از استفاده نادرست `SelectLabel` رادیکس و بهبود تشخیص فوری Runtime exception در Production Browser Smoke.


### اصلاح شد

- Production browser smoke now starts from a clean `about:blank` target, clears origin storage before boot, and follows structural onboarding step markers with timeout diagnostics.
- همگام‌سازی Anchorهای Settings بدون setState داخل Effect انجام می‌شود و Deep Linkهای Profile همچنان از Unsaved Navigation Guard عبور می‌کنند.
- دو قرارداد تست قدیمی ناوبری با معماری Hash-based فاز ۱۲۱ هماهنگ شدند.

### تغییر کرد

- Release 2.3.0 با Candidate تأییدشده `75b7be6`، Gate کامل Production/Freelancer/Employee و Pairing چهار-chunk رمزنگاری‌شده نهایی شد.

- نمایش هدف خالص روز از عدد اعشاری به ساعت و دقیقه دقیق تغییر کرد و چیدمان یادآوری استراحت خواناتر شد.
- Footer به صفحه جدید «درباره و راهنما» با GitHub، حمایت مالی، LinkedIn، Telegram و راهنمای سریع متصل شد.
- Bottom Navigation موبایل Active state خواناتر و هم‌اندازه دریافت کرد و underline کم‌کنتراست حذف شد.
- Navigation داخلی Settings همه کارت‌های اصلی، از جمله انتقال بین موبایل و لپ‌تاپ، را نشان می‌دهد و Section فعال را هنگام Scroll دنبال می‌کند.
- Search و Navigation تنظیمات از یک مدل مقصد مشترک استفاده می‌کنند تا Deep Linkها و برچسب‌ها از هم جدا نشوند.
- کنترل‌های Header از نظر ارتفاع، Radius، Surface و اندازه آیکن یکدست شدند؛ Profile Trigger به Avatar دایره‌ای ارتقا یافت و لوگوی Sidebar میانبر امن صفحه امروز شد.
- Header با منوی پروفایل محلی واقعی، وضعیت ذخیره موقت و Workspace Switcher توضیح‌دار ساده‌تر شد.
- Hero صفحه امروز ناوبری یک‌کلیکی روز قبل/بعد، برگشت سریع به امروز و عنوان مناسب برای روزهای تاریخی دریافت کرد.
- صفحه تنظیمات جستجوی سریع، Anchorهای مستقیم برای کارت‌های مهم و ناوبری داخلی هماهنگ با ترتیب واقعی محتوا دریافت کرد.
- لایه Border اضافی گروه‌های Settings کاهش یافت و کارت پروفایل محلی خواناتر شد.

## [2.2.0] - 2026-08-07

### افزوده شد

- موتور Rule-based حقوق با روش‌های ماهانه متناسب، ماهانه ثابت، ساعتی و روزکاری، Preview زنده و Breakdown قابل توضیح.
- Policy پایدار حقوق در AppData Schema v17 با Migration سازگار از v16.
- انتقال مستقیم و رمزنگاری‌شده AppData میان دستگاه‌ها با AES-GCM، SHA-256، Preview تعارض و Merge/Replace صریح.
- Pairing مستقیم WebRTC DataChannel و QR محلی چندفریمی بدون سرویس QR یا دیتابیس مرکزی.
- تاریخچه محدود metadata-only برای انتقال دستگاه و Browser E2E انتقال چند chunk رمزنگاری‌شده همراه ACK.
- Capture تکرارپذیر Screenshot/GIF با Fixture نمایشی مستقل از داده واقعی کاربر.

### تغییر کرد

- زبان طراحی نهایی چندتمی به Today، Month، Reports، Settings، Leave، Clients، Projects و Invoices گسترش یافت.
- هویت نصب PWA، آیکن‌های any/maskable، Install UX، Offline state و Update Prompt تکمیل شد.
- گزارش‌ها و حقوق روز از Policy ذخیره‌شده حقوق استفاده می‌کنند و نتیجه محاسبه را شفاف‌تر نمایش می‌دهند.
- README فارسی و انگلیسی با رسانه‌های واقعی محصول، قابلیت‌های حقوق و انتقال دستگاه و اسناد Release 2.2.0 به‌روزرسانی شدند.

### اصلاح شد

- Offline shell با precache دارایی‌های تولیدشده Next.js و fallback شبکه محدودشده مقاوم‌تر شد.
- مشکلات TypeScript 5.9 در WebCrypto BufferSource و narrowing جریان Pairing رفع شدند.
- QR scanner cleanup و lint فایل‌های vendored QR بدون تضعیف قوانین عمومی ESLint اصلاح شد.
- Smoke آفلاین Production و Browser Pairing واقعی روی Windows/Chromium به مسیر قابل تکرار تبدیل شدند.

## [2.1.0] - 2026-08-07

### افزوده شد

- سطل بازیابی رکوردها با نگهداری ۳۰روزه، بازیابی گروهی و پاک‌سازی رکوردهای منقضی.
- قفل مالکیت تایمر زنده، جزئیات دستگاه، انتقال کنترل و تاریخچه رخدادهای همگام‌سازی چند Tab.
- Audit قرارداد `AppData` در Factory، Migration، Backup، Recovery، Snapshot و Merge با گزارش Missing، Unexpected و Invalid.
- تست مرورگر Production روی Static Export واقعی برای Onboarding، Route امروز و تغییر تاریخ.
- Release Audit ماشینی برای تطبیق نسخه Package، Lockfile، Schema، Node، Changelog، Release Notes و ترتیب Gateها.
- README انگلیسی، راهنمای عیب‌یابی Windows و npm، ماتریس سازگاری مرورگر و راهنمای انگلیسی Agentها.

### تغییر کرد

- تمام کارت‌های اصلی تنظیمات به قرارداد مشاهده، ویرایش، ذخیره و انصراف مستقل منتقل شدند.
- هشدارهای عملیات مخرب و خروج با Draft ذخیره‌نشده به Alert Dialog رسمی Radix/shadcn منتقل شدند.
- تست‌های دارای `WorkRecord` دست‌ساز به Fixture مشترک Type-safe نزدیک‌تر شدند.
- Quality Pipeline اکنون Dependency preflight، Schema audit، Release audit، Build و Browser smoke را اجرا می‌کند.
- نسخه Package به `2.1.0` و قرارداد داده فعال به Schema v16 ارتقا یافت.

### اصلاح شد

- جلوگیری از ورود متادیتای Envelope فایل Backup به State اصلی `AppData`.
- جلوگیری از فعال‌سازی ناخواسته ذخیره خودکار هنگام وجود Draft در کارت‌های دیگر.
- مقاوم‌سازی پاک‌سازی پروفایل موقت Chrome و Edge در Windows در برابر قفل‌های کوتاه‌مدت `EBUSY`.
- خواناترشدن شکست Schema Audit و نمایش همه مسیرهای خراب در یک اجرای CI.

## [2.0.0] - 2026-08-05

### افزوده شد

- بازطراحی کامل Spotify-inspired با تم روشن، تاریک، System و پالت سفارشی.
- Sidebar دسکتاپ، Top Bar و Bottom Navigation موبایل.
- برنامه کاری روزانه، شیفت شب، تعطیلات رسمی و Override دستی.
- موتور حقوق، فیش حقوقی، مزایا، کسورات و Privacy Mode سراسری.
- هزینه و سود پروژه، هشدار بودجه و فاکتور قابل چاپ.
- ذخیره مقاوم، Snapshot بازیابی و Migration نسخه‌بندی‌شده تا Schema ۱۳.
- تست‌های معماری، Workflow، Theme Compliance و Accessibility.

### اصلاح شد

- حذف پیاده‌سازی‌های Legacy تکراری Picker و Storage.
- استفاده از نسخه مرکزی Schema در تست Backup و جلوگیری از stale test.
- استانداردسازی Design Tokenها، نمودارها، فرم‌ها، جدول‌ها و Modalها.

## [1.2.0] - 2026-08-02

### Added

- ویرایش مستقیم ساعت شروع، پایان و مدت ناهار
- ویرایش، افزودن، حذف و تعیین وضعیت باحقوق برای هر وقفه
- موتور مستقل محاسبه حقوق روزانه و تست‌های آن
- اسناد مشارکت، امنیت و مجوز MIT

### Changed

- تمام کلاس‌های Tailwind از Style Registry مرکزی به Componentها منتقل شدند
- محاسبه کارکرد خالص و وقفه‌های باحقوق/بدون‌حقوق یکپارچه شد
- README و راهنمای معماری برای انتشار Open Source بازنویسی شد

### Fixed

- حقوق روزانه اکنون از تقسیم حقوق ماهانه بر ۳۰ محاسبه می‌شود
- روز شروع‌نشده دیگر به اشتباه دارای کارکرد و درآمد نمایش داده نمی‌شود
- منطق تکراری موتور زمان و فایل‌های بلااستفاده حذف شد

## Unreleased — Phase 2

- Added a per-weekday work schedule with independent start, end, lunch and enabled state.
- Added overnight-shift support when the end time is earlier than the start time.
- Daily and monthly attendance targets now follow the selected date's schedule.
- Upgraded app-data schema to v5 with migration from legacy `workDays` settings.
- Added work-schedule unit tests.
- Added financial privacy mode to the planned UX phase: a global eye button will hide salary, income, rates and payroll totals before sharing the screen.

## فاز ۶ — امور مالی پروژه

- ثبت و مدیریت هزینه‌های پروژه
- محاسبه درآمد، هزینه، سود خالص و حاشیه سود
- هشدار نزدیک‌شدن یا عبور از بودجه زمانی
- Migration داده از Schema 8 به 9

## Phase 12 - Build safety and reusable UI audit

- Fixed the Vercel type-check failure in the danger-zone reset by using a complete AppData factory.
- Added `createInitialData` as the single source of truth for blank application state.
- Split the 376-line app header into focused navigation, actions and workspace-switcher components.
- Added architecture checks for the 250-line layout limit and safe data reset.
- Added a reusable-component audit and extraction roadmap.

## Phase 16 - Report overview decomposition and import safety

- Split the oversized reports page into focused summaries, actions and a report-summary hook.
- Centralized payroll masking through `PrivateMoney` and reused `SurfaceCard`.
- Added a local import resolution check and included it in the main validation command.
- Added architecture coverage to keep report overview modules below 250 lines.
- Removed invalid nested JSX from the payroll summary section.
## فاز ۲۰ — بازآرایی نمای ماه

- جدول ماه به نسخه‌های دسکتاپ، موبایل و ابزارهای مشترک تقسیم شد.
- نمودار هفتگی به Hook داده، نمودار، Tooltip، خلاصه و Empty State تقسیم شد.
- استفاده از SurfaceCard و EmptyState در نمای ماه استاندارد شد.
- تست معماری سقف ۲۵۰ خط برای ماژول‌های ماه اضافه شد.


## فاز ۲۳

- بازآرایی جزئیات پروژه و فاکتورها به کامپوننت‌ها و Hookهای متمرکز.
- یکپارچه‌سازی نمایش اطلاعات مالی با PrivateMoney.
- افزودن تست معماری صفحات تجاری.
