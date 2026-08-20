# Phase 198.1 — Today Timer Experience Redesign

## R2 — 2026-08-18

### هدف

بستن Regressionهای R1 و تثبیت Project Timer به‌عنوان تنها CTA زمان‌سنج فضای Freelancer، بدون تغییر Schema یا Dependency.

### تغییرات R2

- کلیدهای i18n جاافتاده `today.timer.localClock` و `today.timer.ready` برای فارسی و انگلیسی اضافه شدند.
- lookup نام پروژه از قرارداد واقعی `Project.name` استفاده می‌کند؛ ارجاع اشتباه `project.title` حذف شد.
- ساعت محلی Project Timer Hero از Runtime Clock مشترک پروژه استفاده می‌کند و با Locale فعال نمایش داده می‌شود؛ Interval مستقل جدیدی ساخته نشده است.
- CTA تکراری پایین کارت Freelancer حذف شد؛ CTA اصلی فقط داخل Project Timer Hero باقی می‌ماند.
- قرارداد Browser Smoke برای Heatmap Tooltip با `data-activity-tooltip` روی همان Portal مشترک بازگردانده شد.
- تست Regression مستقل `phase1981-today-timer-r2.test.ts` برای i18n، Project field، CTA واحد و Tooltip smoke contract اضافه شد.

### مرز داده و معماری

- AppData schema روی v20 می‌ماند.
- `Project.rate` و قرارداد hourly canonical بدون تغییر است.
- Dependency جدیدی اضافه نشده است.
- Employee و Hybrid attendance flow تغییر نکرده‌اند.
- Primitive مشترک Floating Tooltip حفظ شده و فقط marker اختصاصی Heatmap به‌صورت opt-in به آن اضافه شده است.

### Validation این بسته

- Targeted Phase 198 + Phase 198.1 R2 tests: سبز.
- Full dependency-backed gates در محیط ساخت این بسته اجرا نشدند؛ Registry npm در محیط Sandbox با `EAI_AGAIN` قابل دسترس نبود و `npm ci --offline` نیز به‌دلیل cache ناقص متوقف شد.
- Gate نهایی همچنان باید پس از جایگزینی ZIP در محیط توسعه اصلی با دستورهای استاندارد پروژه اجرا شود.

## ادامه Phase 198.1

پس از سبزشدن Gate کامل R2:

1. Date/Time Picker foundation برای Manual Entry و مسیرهای بعدی.
2. Visual QA صفحه Today و Pickerها در Freelancer / Employee / Hybrid و Light / Dark.
3. Commit فقط پس از Gate سبز.

## R2 Gate Confirmation — 2026-08-18

Gate کامل R2 در محیط توسعه اصلی تأیید شد:

- `npm run check:quality`: سبز با 898/898 تست و Build موفق Next.js 16.2.6.
- Static export: 34 route و 79 asset در PWA precache.
- `npm run check:release:audit`: سبز؛ AppData توسعه v20 و released schema v17 بدون تغییر.
- Browser Smokeهای Production، Freelancer، Employee و Pairing: همگی سبز.
- `npm run audit:vercel`: سبز با خروجی `out/`.
- `git diff --check`: بدون خطا.
- `git diff -- package-lock.json`: بدون تغییر.

بنابراین R2 از نظر Gate فنی بسته است و کار بعدی روی همان baseline به Picker foundation منتقل شد.

## R3 — Date/Time Picker Foundation — 2026-08-18

### مبنای طراحی

معماری R3 از الگوی PersianLabs/ui الهام گرفته شده است: API مشترک برای Picker، Popover در Desktop و Drawer در Mobile، با breakpoint مرجع 800px. کد به‌صورت source-owned داخل خود پروژه نگه داشته شده و registry package یا dependency runtime جدید وارد نشده است.

### تغییرات R3

- `ResponsivePickerSurface` مشترک برای Date و Time اضافه شد.
- presentation مشترک با `useSyncExternalStore` و snapshot امن SSR تعیین می‌شود:
  - `< 800px` → `drawer`
  - `>= 800px` → `popover`
- Date Picker در Desktop دیگر modal مرکزی تمام‌صفحه نیست و کنار Trigger باز می‌شود.
- Date Picker در Mobile به Bottom Drawer با safe-area، backdrop و drag-handle بصری تبدیل شد.
- Time Picker همان presentation مشترک را می‌گیرد و بلوک انتخاب ساعت/دقیقه در یک Surface واضح‌تر قرار گرفت.
- `useDialogAccessibility` اکنون modal بودن را می‌پذیرد؛ Scroll lock و Tab focus trap فقط برای Drawer modal فعال‌اند و Popover دسکتاپ Escape/restore-focus را بدون قفل‌کردن صفحه حفظ می‌کند.
- Locale، تقویم Persian/Gregorian، typed time input، Today shortcut، Holiday/recorded markers و storage contract بدون تغییر باقی مانده‌اند.
- AppData schema روی v20 باقی می‌ماند و `package.json` / `package-lock.json` تغییر ندارند.

### Validation داخل بسته R3

- Responsive presentation behavioral tests: 2/2 سبز.
- Local import audit: 684 source file سبز.
- i18n closure audit: سبز.
- Test-coupling audit: 197 test file سبز و تست جدید Phase 192+ source-inspection ندارد.
- Full dependency-backed Quality/Build/Browser Gate باید پس از جایگزینی ZIP در محیط توسعه اصلی دوباره اجرا شود.

## ادامه Phase 198.1

1. اجرای Full Gate روی R3.
2. Visual QA روی Today و Pickerها در:
   - Freelancer / Employee / Hybrid
   - Light / Dark
   - Persian RTL / English LTR
   - Mobile / Desktop
3. فقط پس از Gate و Visual QA سبز: credential scan، commit و push.
4. سپس Phase 199 — Month Intelligence v2.
## R4 — Gate Contract Hotfix — 2026-08-18

### علت

Full Gate محیط توسعه اصلی روی R3 با 900 تست اجرا شد و 898 تست سبز ماند، اما دو تست تاریخی معماری شکست خوردند:

- `tests/accessibility-architecture.test.ts` هنوز `aria-modal="true"` را مستقیماً داخل هر Date/Time Dialog جست‌وجو می‌کرد.
- `tests/final-theme-responsive-audit.test.ts` هنوز انتظار داشت `var(--overlay)` مستقیماً داخل هر Dialog باشد.

در R3 این قراردادها عمداً به `ResponsivePickerSurface` مشترک منتقل شده‌اند؛ بنابراین شکست‌ها از mismatch تست تاریخی با معماری جدید بودند، نه از TypeScript، i18n، schema یا dependency.

### تغییرات R4

- تست دسترس‌پذیری تاریخی اکنون بررسی می‌کند Date/Time Dialogها به `ResponsivePickerSurface` و `useDialogAccessibility` delegate شوند و خود Surface قراردادهای `aria-modal` پویا، `aria-labelledby` و `tabIndex={-1}` را مالک باشد.
- تست Theme تاریخی اکنون delegation هر دو Picker به Surface مشترک را بررسی می‌کند و token `var(--overlay)` را در owner واقعی Overlay یعنی `ResponsivePickerSurface` assert می‌کند.
- هیچ Product code در R4 تغییر نکرد.
- AppData همچنان v20 است.
- `package.json` و `package-lock.json` بدون تغییرند و dependency جدیدی اضافه نشده است.

### وضعیت Gate

- R3 Full Gate: 900 total / 898 pass / 2 fail؛ در نتیجه **Gate سبز محسوب نمی‌شود**.
- `check:release:audit` و `audit:vercel` در اجرای R3 سبز بودند.
- Production Browser Smoke پس از شکست `check:quality` روی خروجی Build جدید R3 قابل استناد نیست، چون `build:vercel` در زنجیره `check:quality` بعد از شکست تست‌ها اجرا نشد.
- خروجی Freelancer/Employee/Pairing در لاگ R3 کامل ثبت نشده است.
- R4 باید از ابتدا با Full Gate استاندارد پروژه validate شود و تا آن زمان commit مجاز نیست.

## R4 Full Gate Confirmation - 2026-08-18

R4 was validated in the primary Windows development environment and is the green dependency-backed baseline for R5:

- `npm run check:quality`: PASS with 900/900 tests.
- Next.js 16.2.6 static production build: PASS; 34 static routes and 80 PWA precache assets.
- `npm run check:release:audit`: PASS; development AppData v20 and released schema v17 remain unchanged.
- Production, Freelancer, Employee and WebRTC Pairing browser smokes: PASS.
- `npm run audit:vercel`: PASS with `out/` as the published static output.
- `git diff --check`: clean.
- `package-lock.json`: unchanged.

The npm `EPERM` cleanup warning did not block dependency preflight, TypeScript, lint, tests, build, or any browser gate.

## R5 - Visual QA Timer + Wheel DateTime Redesign - 2026-08-18

### Why R5 exists

Visual QA rejected the R4 Freelancer timer presentation even though its technical gate was green. The ready and running states looked like two different components, the timer was too small compared with the approved reference, and the Today timeline edit path still exposed the browser-native `datetime-local` control.

### Product changes

- Freelancer Project Timer ready/running now share the exact same composition. State changes update status, elapsed time and CTA only; the card geometry no longer jumps.
- The timer hero now follows the approved visual direction more closely: status pill, live local clock, source-owned analog clock face, strong timer title, large 00:00:00 surface, contextual project label, helper copy and one full-width primary timer action.
- Active project display is resolved from the active entry before the editable draft, so changing the draft while a timer is running does not relabel the live session.
- `LiveDuration` accepts a local `className` override so the Project Timer can be visually large without changing Employee timer sizing.
- The existing Time Picker now uses a source-owned hour/minute wheel with touch scrolling, momentum/snap behavior, keyboard navigation, LTR numeric geometry inside RTL, and an explicit center selection band.
- The remaining Today timeline `datetime-local` edit field was removed. It now uses the shared DateTimePicker with Persian/Gregorian calendar support plus the same hour/minute wheel and explicit confirmation.
- The DateTimePicker supports `presentation="auto" | "popover" | "drawer"`; auto keeps the existing 800px responsive boundary.
- No runtime dependency was added; the PersianLabs interaction pattern was merged into Saatyar-owned source.

### Data and release safety

- AppData remains v20.
- No migration was added.
- `package.json` and `package-lock.json` stay unchanged.
- No raw `type="date"`, `type="time"`, or `type="datetime-local"` remains in app/components/hooks/lib.
- Phase 192+ test-coupling rules remain intact; new R5 behavior checks do not inspect source.

### Sandbox validation before packaging

- Local imports: PASS across 689 source files.
- i18n closure: PASS.
- test-coupling audit: PASS across 197 test files; historical source-coupled budget remains 167/167 and Phase 192+ stays source-inspection free.
- Focused R5 regression tests: 20/20 PASS.
- Additional Today/i18n/runtime regressions: 38/38 PASS.
- Picker/theme regressions: 6/6 PASS.
- Dependency-backed TypeScript/build/browser gates are intentionally not claimed in the sandbox because the extracted source has no installed node_modules.

## Remaining Phase 198.1 work

1. Run the full dependency-backed R5 gate in the main development environment.
2. Repeat Visual QA on Freelancer ready/running, Employee and Hybrid, Persian/English, Light/Dark, Desktop/Mobile.
3. Verify DateTimePicker in Today timeline editing and Wheel Time Picker in all existing time edit paths.
4. Only after both gate and Visual QA are green: credential scan, commit, push.


## R6 — Freelancer Work Session Controller + Picker Interaction Fix — 2026-08-18

### نتیجه بررسی Codebase قبل از Implementation

1. **Timer فعلی کجاست؟** مسیر اصلی Freelancer Today از `TodayFocusCard` به `ProjectTimerHero` می‌رسد. داده زنده قبلاً از `activeEntry` و draft فرم می‌آمد.
2. **State از کجا می‌آید؟** AppData/IndexedDB از `useSaatyarController` و derived `activeEntry` می‌آید. برای Pause/Resume یک session metadata کوچک browser-local اضافه شد تا AppData contract دست نخورد.
3. **API/Action زمان‌سنج چه بود؟** قبل از R6 فقط `toggleProjectTimer` عملاً Start/Stop داشت. R6 actionهای صریح `startProjectTimer`، `pauseProjectTimer`، `resumeProjectTimer` و `finishProjectTimer` را روی همان persistence موجود اضافه می‌کند و `toggleProjectTimer` را برای call-siteهای قدیمی نگه می‌دارد.
4. **Client/Project/Task از کجا می‌آیند؟** Client/Project از `AppData.clients` و `AppData.projects`؛ Task/Note/Billable روی `TimerDraft` و `TimeEntry` هستند.
5. **Chart library داریم؟** Recharts در پروژه موجود است؛ برای mini trend این ماژول از SVG سبک استفاده می‌کند تا chart surface جدید و سنگین ساخته نشود.
6. **UI library چیست؟** Design System فعلی shadcn-style است و Select/Dialogهای پروژه روی Radix Portal هستند؛ Button/Input/Textarea/SurfaceCard نیز shared هستند. R5 desktop Picker Surface خودش Radix Popover نبود و با `absolute` داخل ancestor باز می‌شد، که ریشه clipping بود.
7. **چه componentهایی reuse شدند؟** `SurfaceCard`، `Button`، `Input`، `Textarea`، `Select`/Portal موجود، Quick Client/Project dialogs، `FlipClock`، locale formatterها و CSS tokenهای فعلی.
8. **فایل‌های اصلی تغییر** شامل Timer hero/details/summary، relation fields، controller/business actions، session hook/lib، responsive picker surface، time wheel، i18n و تست رفتاری R6 است.
9. **DB/schema change لازم است؟** خیر. AppData روی v20 می‌ماند. Pause metadata در browser-local session نگه داشته می‌شود و Work segmentها همچنان TimeEntry استاندارد هستند.
10. **بزرگ‌ترین ریسک regression** persistence/reload و multi-tab ownership، تغییر relation وسط session، stacking Picker، interaction pointer روی Wheel و آسیب ناخواسته به Employee/Hybrid است؛ R6 این مرزها را isolate کرده است.

### Plan اجرایی R6

- Freelancer module فقط در Today بازطراحی شود؛ shell/header/sidebar و Employee/Hybrid layout دست نخورند.
- Analog Clock و Local Clock از centerpiece حذف شوند و elapsed timer با scale محدود محور hierarchy باشد.
- state machine واضح IDLE → RUNNING → PAUSED → RUNNING → Finish پیاده شود.
- Pause با بستن segment فعال و Resume با ساخت segment جدید انجام شود تا gap به work duration اضافه نشود.
- Activity Details با Client/Project/Task/Description/Billable مطابق reference بازچینش شود؛ relationهای Client/Project هنگام session فعال قفل بمانند.
- Today Summary/Timeline/7-day trend فقط از data واقعی `timeEntries` مشتق شوند.
- desktop DateTimePicker از ancestor stacking context خارج و روی `document.body` portal شود.
- Time Wheel برای mouse/pen press-drag همان حس gesture عمودی را اضافه کند و Touch/Keyboard حفظ شود.

### تغییرات Product/UX

- Analog clock component از Freelancer Timer حذف شد؛ ساعت محلی نیز دیگر فضای Hero را اشغال نمی‌کند.
- Timer با یک geometry ثابت و scale کوچک‌تر برای IDLE/RUNNING/PAUSED نمایش داده می‌شود.
- کنترل‌ها semantics جدا دارند:
  - IDLE: شروع تایمر
  - RUNNING: توقف موقت + پایان فعالیت
  - PAUSED: ادامه + پایان فعالیت
- Pause duration جزو کار محاسبه نمی‌شود: Pause، TimeEntry جاری را finalize می‌کند؛ Resume یک TimeEntry segment جدید با همان activity details می‌سازد.
- paused state metadata با key نسخه‌دار browser-local ذخیره می‌شود و پس از refresh قابل بازیابی است؛ AppData schema تغییر نمی‌کند.
- Activity Details مطابق reference به panel واضح‌تر تبدیل شد. هنگام Running/Paused، Client/Project قفل می‌شوند اما Task/Description/Billable قابل اصلاح‌اند.
- Tags اضافه نشد چون `TimeEntry`/`Project` فعلی tag contract ندارد.
- Today Summary مجموع کار ثبت‌شده، شروع روز، تعداد segment/gap، timeline فشرده و trend هفت‌روزه واقعی را نشان می‌دهد.

### Break Reason و Schema

Freelancer `TimeEntry` فیلد break reason ندارد. `BreakItem` فعلی متعلق به Employee `WorkRecord` است و semantic متفاوتی دارد. بنابراین R6 دلیل وقفه اختیاری را به production contract اضافه نمی‌کند. برای اینکه break reason در Backup/Transfer/AppData portable باشد باید قرارداد داده توسعه یابد و migration/normalization آن جداگانه طراحی شود؛ در این فاز عمداً انجام نشده است.

### Picker/Popover Fix

- Root cause R5: Desktop `ResponsivePickerSurface` یک surface سفارشی `absolute` داخل ancestor بود، نه Radix/shadcn Popover portaled؛ بنابراین timeline/card stacking و overflow می‌توانست آن را زیر محتوا ببرد.
- R6 سطح desktop را با `createPortal(..., document.body)` و `position: fixed` باز می‌کند، anchor geometry را اندازه می‌گیرد، به viewport clamp می‌کند، در کمبود فضای پایین به بالا flip می‌شود و روی resize/scroll/ResizeObserver reposition می‌شود.
- z-index محتوا `1200` و overlay Drawer `1190` است تا از Surfaceهای اپ و Select portal فعلی بالاتر بماند.
- dependency جدید برای Radix Popover اضافه نشد؛ package/lockfile ثابت ماند.

### Time Wheel Mouse Drag

- Wheel همچنان touch scroll/momentum و keyboard navigation دارد.
- Mouse/Pen با Pointer Capture روی press-and-drag عمودی scroll می‌کند؛ drag به scrollTop تبدیل می‌شود و هنگام release روی نزدیک‌ترین option snap/commit می‌شود.
- click تصادفی بعد از drag suppress می‌شود.
- Numeric wheel داخل RTL همچنان `dir=ltr` دارد.

### Validation Sandbox قبل از Full Gate

- Phase 198/198.1 targeted behavioral tests: 16/16 PASS; expanded historical/browser-contract regression set: 57/57 PASS.
- Local import audit: PASS across 694 source files.
- i18n closure: PASS.
- test-coupling audit: PASS across 198 test files؛ historical budget 167/167 و Phase 192+ source-inspection free.
- Syntax diagnostics روی فایل‌های تغییرکرده: PASS.
- Dependency-backed TypeScript/Lint/Build/Browser gates در بسته نهایی claim نمی‌شوند و باید در محیط توسعه اصلی اجرا شوند.

### وضعیت

R6 تا قبل از Full Gate و Visual QA جدید **commit-ready نیست**. اسکرین‌شات‌های جدید حداقل باید Freelancer IDLE/RUNNING/PAUSED و DateTimePicker/TimeWheel را روی Desktop/Mobile پوشش دهند و Employee/Hybrid regression نیز بررسی شود.

## R7 — Timeline Edit + Density + Timer Readability QA — 2026-08-18

### دلیل R7

Visual QA روی R6 چهار مسئله واقعی نشان داد: End زمان در Timeline برای رکورد تکمیل‌شده قابل ویرایش نبود، جدول Timeline می‌توانست با تعداد زیاد ردیف بیش از حد بلند شود، Recent Projects هنگام session فعال همچنان CTA «شروع» متداخل نشان می‌داد، و mini trend هفت‌روزه برای کاربر قابل‌فهم نبود. همچنین Timer برای خوانایی بهتر باید به یک display box فشرده و مرجع‌محور منتقل می‌شد.

### تصمیم UX درباره End زمان

- **رکورد تکمیل‌شده:** دلیل UX برای read-only بودن End وجود ندارد؛ R7 همان DateTimePicker مشترک را برای End نیز فعال می‌کند.
- **رکورد در حال اجرا:** End عمداً editable نیست. تعیین End برای یک entry باز از نظر domain همان Finish است و باید همزمان TimeEntry، ProjectTimerSession، Pause/Resume metadata و ownership را finalize کند. ویرایش مستقیم End می‌توانست UI را «تمام‌شده» کند ولی session را Running باقی بگذارد. برای همین live end فقط از CTA «پایان فعالیت» ثبت می‌شود و در Edit یک توضیح Tooltip نمایش داده می‌شود.
- Start/End نامعتبر (`end <= start`) reject می‌شود و Toast واضح دارد.

### Timeline density

Timeline table یک scroll region داخلی دارد: max-height دسکتاپ 360px و موبایل 320px، overscroll-contained و header sticky. در نتیجه تعداد زیاد TimeEntry ارتفاع کل Today را بی‌نهایت افزایش نمی‌دهد و DateTimePicker portal همچنان بالای scroll container باز می‌شود.

### Recent Projects conflict

Recent Projects اکنون از `projectTimerSession` و `activeEntry` وضعیت Timer را می‌فهمد. در حالت idle فقط Start نمایش داده می‌شود. اگر session Running/Paused باشد، پروژه جاری badge همان state را می‌گیرد و پروژه‌های دیگر به جای Start یک state قفل‌شده با توضیح «ابتدا فعالیت جاری را پایان بده» دارند.

### Timer display

Shared `FlipClock` تاریخی دست نخورده ماند تا قرارداد Release 2.4.0/Phase 179 حفظ شود. فقط Project Timer آن را داخل یک display box token-driven با seam میانی، scale محدود و label ساعت/دقیقه/ثانیه قرار می‌دهد؛ بنابراین ظاهر به reference countdown نزدیک می‌شود بدون اینکه Live Timer کارمند یا release contractهای قدیمی تغییر کنند.

### 7-day trend readability

Sparkline مبهم حذف شد. کارت جدید «ساعت کاری ۷ روز اخیر» هفت bar روزانه با weekday label دارد، زیر عنوان توضیح ثابت «مدت کار ثبت‌شده در هر روز» دیده می‌شود، آیکون info توضیح semantic chart را در Tooltip می‌دهد و Hover/Focus روی هر bar تاریخ و مدت دقیق همان روز را نشان می‌دهد. داده همچنان فقط از TimeEntry واقعی مشتق می‌شود.

### Safety

- AppData: v20 بدون تغییر.
- Migration: ندارد.
- Dependency جدید: ندارد.
- package.json / package-lock.json: بدون تغییر.
- Phase 192+ test جدید source-inspection ندارد.


## R8 — Reference-aligned Timer Polish — 2026-08-18

### علت

Visual QA روی R7 نشان داد با وجود اصلاحات عملکردی، ظاهر Freelancer controller هنوز از reference نهایی فاصله دارد: elapsed time داخل یک قاب کشیده بود، radius/padding لایه‌های Timer ناهماهنگ بود، mini trend یک کارت مستقل و سنگین داشت و status پروژه فعال در Recent Projects در عرض باریک می‌شکست.

### تغییرات R8

- Elapsed Timer بدون تغییر منطق timestamp به سه tile مستقل ساعت/دقیقه/ثانیه تبدیل شد. Row عددی `dir=ltr` دارد تا ترتیب `HH:MM:SS` در RTL ثابت بماند و هر tile label و border مستقل دارد.
- Work Session Controller اکنون یک Surface واحد با radius و padding مشترک است؛ Hero و Today Summary درون همان Surface قرار می‌گیرند و nested timer card اضافی R7 حذف شده است.
- Header تایمر به زبان reference نزدیک شد: نام ساعت‌یار + status pill، سپس elapsed timer، current activity و actionهای Start/Pause/Resume/Finish. Analog/local clock همچنان حذف باقی می‌مانند.
- 7-day trend از کارت مستقل خارج و داخل Today Summary قرار گرفت. Visualization با `recharts` موجود پروژه و `MONTH_CHART_THEME` همان صفحه Month ساخته می‌شود؛ dependency جدیدی اضافه نشده است.
- Recent Projects به row/cardهای shrink-safe با `min-w-0`, truncate و status جدا از action تبدیل شد تا Running/Paused/Blocked در aside باریک عمودی یا درهم نشوند.
- End DateTime edit، سقف ارتفاع Timeline، Picker portal و mouse-drag Time Wheel از R6/R7 بدون تغییر قرارداد داده حفظ شدند.

### مرز داده و معماری

- AppData schema: v20 بدون تغییر.
- Migration جدید: ندارد.
- Dependency جدید: ندارد؛ `recharts` از قبل dependency پروژه است.
- `package.json` و `package-lock.json`: بدون تغییر.
- تست جدید Phase 198.1 R8 فقط helper رفتاری elapsed parts و قرارداد Recent Project state را تست می‌کند و source-inspection ندارد.

### Validation بسته

- Local import audit: سبز.
- i18n closure: سبز.
- test-coupling audit: سبز و Phase 192+ source-inspection free.
- Phase 198.1 focused tests و Today architecture/visual regressionهای dependency-free: سبز.
- Full dependency-backed TypeScript/Lint/Build/Browser Gate باید در محیط توسعه اصلی اجرا شود؛ تا آن زمان R8 مجاز به commit نیست.


## R9 — Mobile Density Follow-up — 2026-08-18

Visual QA روی R8 نشان داد Controller در 425px هنوز بیش از حد بزرگ و تزئینی است. R9 padding/gradient/shadow را سبک‌تر کرد، summary را در موبایل جمع‌وجورتر کرد و اندازه Timer را متعادل‌تر نگه داشت. این Revision صرفاً checkpoint بصری بود و commit baseline محسوب نمی‌شود.

## R10 — Compact Flip Timer + Workspace-specific Today Routes — 2026-08-18

### Timer

- پروژه از قبل `framer-motion` و `components/ui/flip-clock.tsx` داشت؛ بنابراین dependency جدید نصب نشد.
- `FlipClock` موجود به variant اختیاری `boxed` و size مخصوص `project` توسعه یافت؛ مسیرهای تاریخی که variant پیش‌فرض `plain` را مصرف می‌کنند بدون تغییر می‌مانند.
- Project Timer دیگر سه tile بزرگ ساعت/دقیقه/ثانیه ندارد؛ شش digit کوچک flip-style با animation کوتاه، seam میانی و label واحدها رندر می‌شوند.
- Project Timer همچنان از `useRuntimeNow` و timestamp واقعی استفاده می‌کند؛ هیچ `setInterval` مستقل یا clock wall-time از prompt نمونه وارد منطق product نشده است.
- `prefers-reduced-motion` از primitive موجود FlipClock حفظ شده است.
- Hero/Today summary spacing و trend height برای mobile کوچک‌تر و مینیمال‌تر شدند.

### Route ownership

Today اکنون route ownership مستقل برای workspaceها دارد:

- `/employee/today`
- `/freelancer/today`
- `/hybrid/today`
- `/today` به‌عنوان compatibility entry تاریخی باقی می‌ماند و RouteGuard پس از resolve شدن mode آن را به Today اختصاصی همان workspace منتقل می‌کند.

`getPathTab` همه این مسیرها را logical tab برابر `today` می‌داند؛ navigation برای mode فعال href مناسب را تولید می‌کند و تغییر Workspace از Today مستقیماً به Today همان mode می‌رود. RouteGuard ورود اشتباه به `/freelancer/today` با mode کارمند (و برعکس) را به route صحیح replace می‌کند؛ ورود از `/today` قدیمی نیز به route اختصاصی mode فعال canonicalize می‌شود.

### Loading / Skeleton

- Freelancer Today skeleton مستقل بر اساس Work Session Controller + Activity Details ساخته شد.
- Employee Today skeleton قرارداد Attendance-heavy قبلی را مالک است.
- `AppLoadingState` از pathname route-specific استفاده می‌کند، بنابراین cold boot مستقیم روی `/freelancer/today` نیز skeleton فریلنسر را نشان می‌دهد.
- `loading.tsx` مستقل برای employee/freelancer/hybrid اضافه شد تا route transitionهای App Router نیز skeleton درست داشته باشند.

### Semantics

Analytics و Multi-tab sync مسیرهای mode-specific را همچنان یک feature منطقی `today` / change kind `attendance` می‌بینند تا taxonomy و history تکه‌تکه نشود.

### Data / Dependency boundary

- AppData schema: v20 بدون تغییر.
- Migration: ندارد.
- dependency جدید: ندارد (`framer-motion` از قبل وجود داشت).
- `package.json` و `package-lock.json`: بدون تغییر.


## R11 — Gate Hotfix پس از تست محلی R10

لاگ Full Gate روی R10 نشان داد `check:quality` قبل از Build در ESLint متوقف می‌شود: دو `Date.now()` داخل render مسیر Freelancer و یک dependency هشداردهنده در recovery hook. همچنین فایل قدیمی `project-clock-face.tsx` در سیستم کاربر از Revision قبلی باقی مانده بود، چون جایگزینی ZIP به‌صورت overlay فایل حذف‌شده را پاک نمی‌کند.

اصلاح R11:
- fallback زمان در `ProjectTimerElapsed` و `ProjectTodaySummary` دیگر `Date.now()` را هنگام render صدا نمی‌زند؛ Runtime Clock مشترک همچنان تنها منبع tick زنده است.
- `useProjectTimerSession()` در Controller destructure می‌شود تا dependencyهای Effect صریح و پایدار باشند.
- `clean:obsolete` فایل `project-clock-face.tsx` باقی‌مانده از Revisionهای قبلی را حذف می‌کند.
- Browser Smokeهای گزارش‌شده بعد از شکست Quality روی `out/` قبلی اجرا شده‌اند؛ پس route failure آنها evidence معتبر R10 نیست و باید بعد از Build تازه دوباره اجرا شوند.

Schema v20، package.json و package-lock.json بدون تغییر مانده‌اند.
## R12 — Full Test Gate Contract Hotfix — 2026-08-18

### علت

R11 TypeScript و ESLint را عبور داد، اما Full `npm test` شش failure نشان داد. پنج failure ناشی از قراردادهای تاریخی pre-192 بود که هنوز مسیر ثابت `/today` یا شکل قدیمی `toggleProjectTimer` را بررسی می‌کردند؛ failure دیگر از import alias در `time-utils.ts` هنگام اجرای مستقیم Node با `--experimental-strip-types` می‌آمد.

### اصلاحات

- `time-utils.ts` برای helper pure مربوط به Wheel Picker از import نسبی استفاده می‌کند تا تست مستقیم Node به tsconfig path alias وابسته نباشد.
- قرارداد تاریخی Sidebar به `getTodayHref(mode)` به‌روزرسانی شد.
- قرارداد تاریخی Unsaved Navigation به `router.push(getTodayHref(mode))` به‌روزرسانی شد.
- قرارداد Hard Reload کارمند مسیر canonical جدید `/employee/today` را دنبال می‌کند.
- تست ownership قدیمی اکنون وجود `ensureLiveTimerOwnership()` را روی `startProjectTimer`، `pauseProjectTimer`، `resumeProjectTimer` و `finishProjectTimer` جداگانه بررسی می‌کند و سپس delegation تابع `toggleProjectTimer` را تأیید می‌کند؛ در نتیجه پوشش امنیتی ضعیف نشده است.

### Validation بسته

- پنج فایل تست failureدار R11 به‌صورت targeted اجرا شدند: 22/22 سبز.
- Local imports، i18n closure، test-coupling، release audit و Vercel static contract سبز.
- Historical source-coupled budget همچنان 167/167 و Phase 192+ source-inspection برابر صفر است.
- AppData v20، `package.json` و `package-lock.json` بدون تغییر هستند.
- Full dependency-backed `check:quality` و Browser Gate باید روی محیط توسعه اصلی دوباره اجرا شود.


## R13 — Freelancer Hard Reload Ownership Hotfix — 2026-08-18

Full Gate روی R12 به 920/920 تست، Build تولیدی، Production/Employee/Pairing سبز رسید؛ تنها Freelancer Browser Smoke در سناریوی Pause → Hard Reload → Resume شکست خورد. بعد از reload، hook مالکیت یک `tabId` تازه می‌ساخت و lock تازه همان tab را به اشتباه «تب دیگری» تشخیص می‌داد؛ Banner انتقال کنترل ظاهر می‌شد و Resume عمداً توسط ownership guard مسدود می‌شد.

اصلاح R13:
- تب مالک هنگام `pagehide` فقط lock متعلق به خودش را آزاد می‌کند.
- بعد از Hard Reload، instance تازه بدون انتظار ۴۵ ثانیه‌ای می‌تواند lock را دوباره بگیرد.
- روی `pageshow` نیز ownership دوباره ارزیابی می‌شود تا بازگشت از BFCache امن بماند.
- lock واقعی تب دیگر هرگز حذف نمی‌شود و localStorage/BroadcastChannel همچنان مرجع multi-tab است.
- تست رفتاری Phase 198.1 برای reload-stable ownership اضافه شد؛ تست جدید هیچ source inspection ندارد.

Schema v20، package.json و package-lock.json بدون تغییر مانده‌اند.
## R14 — Resume Elapsed Clock Hotfix — 2026-08-19

R13 ownership پس از Hard Reload را درست کرد، اما Full Browser Gate نشان داد بعد از `Pause → Reload → Resume`، Hero به حالت Running برمی‌گشت ولی elapsed display در همان مقدار pause باقی می‌ماند.

اصلاح R14:

- Runtime Clock مشترک در تمام طول Project Timer session، حتی در حالت Paused، subscribed می‌ماند؛ elapsed در حالت Pause همچنان توسط domain helper ثابت نگه داشته می‌شود. بنابراین Resume دیگر subscription ثانیه‌ای را از صفر recreate نمی‌کند.
- در sessionهای Running، `segmentStartedAt` ذخیره‌شده در ProjectTimerSession مرجع اصلی segment جاری است. اگر `activeEntry` در یک render کوتاه از persistence عقب باشد، زمان segment قبلی جای segment جدید استفاده نمی‌شود.
- Browser Smoke به‌جای sleep ثابت 1.2 ثانیه، حداکثر 5 ثانیه منتظر تغییر واقعی aria-label تایمر می‌ماند؛ بنابراین هم regression واقعی را می‌گیرد و هم به alignment مرز ثانیه وابسته نیست.
- دو تست رفتاری Phase 192+ اضافه شد: یکی authoritative بودن segment جدید بعد Resume و دیگری frozen ماندن Pause با Runtime Clock گرم را بررسی می‌کند. هیچ source inspection اضافه نشده است.
- AppData v20، package.json و package-lock.json بدون تغییر هستند و dependency/migration جدیدی وجود ندارد.
## R15 — Freelancer Browser Input Fidelity Hotfix — 2026-08-19

R14 در محیط اصلی نشان داد سناریوی Pause → Reload → Resume اکنون عبور می‌کند، اما `check:quality` قبل از Build تازه به‌دلیل warning بدون استفاده `resumedElapsed` متوقف شد. سپس Freelancer smoke بعد از Timer flow هنگام نوشتن Expense/Invoice روی helper دو-مرحله‌ای focus/write دچار race شد.

اصلاح R15:
- متغیر بدون استفاده حذف شد تا ESLint با `--max-warnings=0` عبور کند.
- Browser harness دیگر `focusField` و `replaceFocusedText` را در دو CDP call جدا اجرا نمی‌کند؛ `replaceLabeledText` label را پیدا می‌کند، همان input را focus می‌کند و native value setter + `InputEvent` + `change` را در یک browser transaction اجرا می‌کند.
- بعد از دو animation frame مقدار controlled field دوباره از همان label خوانده می‌شود؛ بنابراین تست همچنان persistence واقعی React را بررسی می‌کند و failure را پنهان نمی‌کند.
- قرارداد تاریخی Phase 136 حفظ شده: native setter و React-compatible InputEvent استفاده می‌شود و `Input.insertText` اضافه نشده است.
- Product UI و domain timer code در R15 تغییر نکرده‌اند. AppData v20، package.json و package-lock.json بدون تغییر هستند.

## R16 — Localized NumberField Browser Fidelity Hotfix — 2026-08-19

Full Browser Gate روی R15 نشان داد Timer flow اکنون کامل سبز است و failure بعدی صرفاً در Expense Amount رخ می‌دهد. Browser harness مقدار لاتین `125000` را با native setter وارد می‌کرد، اما NumberField کنترل‌شده‌ی محصول مقدار معادل `۱۲۵۰۰۰` را با ارقام فارسی بازتاب می‌داد. Harness این normalization صحیح UI را به‌اشتباه `immediate-value-mismatch` حساب می‌کرد.

اصلاح R16:
- مقایسه مقدار input به helper رفتاری `browserInputValuesEquivalent` منتقل شد.
- متن‌های عادی همچنان exact مقایسه می‌شوند.
- فقط وقتی هر دو مقدار واقعاً عدد قابل parse باشند، ارقام فارسی/عربی، جداکننده هزارگان و ممیز محلی normalize می‌شوند و مقدار عددی مقایسه می‌شود.
- بنابراین `۱۲۵۰۰۰` و `125000` معادل‌اند، اما `۱۲۵۰۰۱` و `125000` هرگز pass نمی‌شوند.
- native value setter + `InputEvent` + `change` فاز ۱۳۶ دست‌نخورده باقی مانده و Browser Smoke همچنان بعد از React settle مقدار controlled field را دوباره بررسی می‌کند.
- تست‌های جدید Phase 192+ فقط behavior helper را import/execute می‌کنند و source inspection ندارند.
- Product UI/Timer code، AppData v20، package.json و package-lock.json بدون تغییر هستند.

## R17 — Tiny Mobile 320px Responsive Hardening — 2026-08-19

Full Gate روی R16 در محیط اصلی توسعه کامل سبز شد: 927/927 تست، TypeScript/Lint/Build، Production/Freelancer/Employee/Pairing browser smoke، release audit و Vercel contract همگی عبور کردند. Visual QA بعدی نشان داد Desktop و 375/425px قابل قبول‌اند، اما Today در viewportهای خیلی باریک هنوز density و overflow مناسبی تا 320px ندارد.

اصلاح R17:

- یک density layer محدود به `max-[359px]` اضافه شد تا رفتار موجود 375/425px تغییر غیرضروری نکند و 320/360/375/425 به‌صورت پیوسته قابل استفاده بمانند.
- Freelancer Work Session Controller در 320px padding/gap/radius کوچک‌تر، FlipClock شش‌رقمی باریک‌تر، دکمه‌های Pause/Finish stack-safe و Current Activity/Summary/7-day trend متراکم‌تر دارد.
- Activity Details، Client/Project relation fields، textarea و Billable row در عرض کوچک بدون بریدگی و با targetهای لمسی قابل استفاده باقی می‌مانند.
- Today Hero، date navigation، Recent Projects، Timeline، metric cards و bannerهای first-run/holiday/multi-tab/live-owner برای عرض 320px shrink-safe شدند.
- App Header و Mobile Bottom Navigation در 320px عرض کنترل‌شده، gap و icon/label کوچک‌تر و safe-area پایین را حفظ می‌کنند.
- DateTimePicker، Jalali Date Picker، Time Wheel و Drawer مشترک در viewport باریک padding/height/navigation کوچک‌تر دارند و همچنان portal/drag/keyboard قراردادهای قبلی را حفظ می‌کنند.
- Employee و Freelancer route-aware loading skeletonها همان geometry کوچک صفحه واقعی را در 320px دنبال می‌کنند.
- Freelancer Browser Smoke و Employee Browser Smoke مستقیماً viewport `320x800` را باز می‌کنند و عدم overflow افقی صفحه، controller/editor و bottom navigation را بررسی می‌کنند. این checkها runtime هستند و تست source-inspection جدیدی اضافه نشده است.
- Product domain، Timer persistence، AppData v20، package.json و package-lock.json بدون تغییر هستند؛ migration/dependency جدیدی وجود ندارد.

R17 تا اجرای Full Gate در محیط اصلی و Visual QA روی 320/360/375/425px مجاز به commit نیست.
