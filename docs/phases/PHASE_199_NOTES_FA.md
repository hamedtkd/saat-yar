# Phase 199 — Employee Activity Context / Work Projects

Baseline: `dev` روی commit `d0d71cd` (Phase 198.1/R17).

## تصمیم محصول

Phase 199 همچنان Task Manager نمی‌سازد. سه مفهوم جدا هستند:

- **Activity Type** = چگونه کار می‌کنی.
- **Work Item / Title** = دقیقاً روی چه کاری کار می‌کنی.
- **Project Context** = این کار متعلق به کدام زمینه است.

## R2 — اصلاح مرز Employee / Freelancer

Visual QA نسخه R1 دو ایراد محصولی واقعی را آشکار کرد:

1. Employee project selector از `data.projects` استفاده می‌کرد و پروژه‌های مشتریان Freelancer را نشان می‌داد.
2. Employee نمی‌توانست از همان جریان Activity یک پروژه کاری بسازد.
3. label «روی چه کاری کار می‌کنی؟» از نظر hierarchy و alignment با Type/Project هم‌سطح نبود.

R2 این مرز را اصلاح می‌کند.

### Data contract v21

Schema همچنان **v21** است چون Phase 199 هنوز Commit/Release نشده و R2 قرارداد نهایی همان migration v20→v21 است:

- `ActivitySegment.title?: string`
- `ActivitySegment.workProjectId?: string` برای پروژه کاری Employee/Hybrid.
- `ActivitySegment.projectId?: string` فقط برای context پروژه Freelancer در Hybrid.
- `AppData.workProjects: WorkProject[]`

`WorkProject` سبک است و Client/Rate/Budget مالی جعلی ندارد:

```ts
{
  id: string;
  name: string;
  status: "active" | "archived";
  createdAt: string;
}
```

v20→v21 همیشه `workProjects: []` می‌سازد. Normalizer همچنین transitional v21 نسخه R1 را که این collection را نداشت repair می‌کند.

## UX نهایی

### Employee

- نوع فعالیت
- روی چه کاری کار می‌کنی؟ (اختیاری)
- پروژه کاری (اختیاری)
- دکمه `+` برای ساخت پروژه کاری بدون خروج از Today
- شروع فعالیت

Employee هیچ پروژه Freelancer را در این Select نمی‌بیند.

### Hybrid

Project selector دو گروه دارد:

- پروژه‌های کاری
- پروژه‌های فریلنسری

ساخت Inline همیشه یک **پروژه کاری** می‌سازد؛ پروژه Freelancer همچنان از workflow مشتری/پروژه خودش ساخته می‌شود.

### Alignment

Type، Work Item و Project اکنون یک label hierarchy، ارتفاع label و فاصله field مشترک دارند. سؤال «روی چه کاری کار می‌کنی؟» label مستقیم Input است و دیگر به‌صورت متن معلق بین ستون‌ها دیده نمی‌شود.

## Safety

- Freelancer Project/Client/Rate model تغییر نکرد.
- Payroll، worked minutes، overtime، deficit، lunch، break و attendance بدون تغییرند.
- Device transfer، backup merge و backup schema `workProjects` را حفظ می‌کنند.
- Calendar Event title همچنان فقط metadata عنوان Activity است.
- dependency جدید وجود ندارد.

## تست رفتاری

- v20→v21 با `workProjects: []`.
- ساخت/normalize/deduplicate پروژه کاری.
- `workProjectId` برای Deep Work/Meeting مستقل از ActivityKind.
- `projectId` فریلنسری همچنان برای Hybrid قابل نگهداری است.
- Employee browser smoke صریحاً بررسی می‌کند پروژه Freelancer داخل selector نشت نکند، پروژه کاری از Today ساخته شود، segment آن را ذخیره کند و IndexedDB relation صحیح را نگه دارد.
- تست‌های Phase 192+ همچنان source-inspection free هستند.

## Visual QA

- Employee desktop: ستون‌های Type / Work Item / Work Project / CTA هم‌تراز.
- Employee project select: هیچ پروژه Freelancer نمایش داده نشود.
- Inline create dialog: نام پروژه، Save، auto-select.
- Hybrid: دو گروه Work/Freelance واضح.
- 320/360/375/425px: فرم stacked و بدون overflow.
- Running/Recent: نام پروژه از source درست resolve شود.

## R3 — Live Timer + Activity History Editing

Visual QA نسخه R2 چهار اصلاح UX دیگر را مشخص کرد:

1. Label «روی چه کاری کار می‌کنی؟» باید همراه `(اختیاری)` در یک خط و با alignment مشترک Fieldها باشد.
2. فعالیت‌های کامل‌شده باید قابل ویرایش و حذف باشند، اما ویرایش نباید کاربر را مجبور به تغییر Start/End کند.
3. Activity جاری باید یک Timer زنده با همان زبان بصری FlipClock فریلنسر، ولی در سایز کوچک‌تر داشته باشد.
4. حالت Running نباید با یک سطح سبز بزرگ نمایش داده شود؛ زنده‌بودن با accent، pulse و Timer مشخص می‌شود.

### قرارداد ویرایش مدت

- فقط Segment کامل‌شده قابل ویرایش/حذف است.
- Dialog فقط `ساعت` و `دقیقه` زمان صرف‌شده را می‌گیرد.
- `start` و metadata (`kind/title/project`) ثابت می‌مانند.
- `end` و `endedAt` از روی همان start + duration جدید مشتق می‌شوند.
- Segment فعال از duration edit و delete محافظت می‌شود.
- این تغییر روی worked minutes/payroll/attendance اثری ندارد؛ ActivitySegment همچنان metadata دسته‌بندی زمان است.
- mutationهای Activity از updater اختصاصی استفاده می‌کنند و `manuallyEdited` رکورد Attendance را فقط به‌خاطر Start/Stop/Edit/Delete فعالیت روشن نمی‌کنند.

### Live surface

- `FlipClock` یک size variant جدید `activity` دارد؛ boxed digits کوچک‌تر از Project Timer هستند.
- Runtime از scheduler مشترک `useRuntimeNow("second")` استفاده می‌کند و timer موازی `setInterval` ساخته نمی‌شود.
- سطح Running از `surface-2 + accent border` استفاده می‌کند و فقط dot/ping کوچک وضعیت زنده را نشان می‌دهد.

### Data

- Schema همچنان **v21** است.
- migration یا collection جدید وجود ندارد.
- dependency جدید وجود ندارد.

### Browser QA

Employee smoke حالا علاوه بر R2 بررسی می‌کند:

- Live activity timer وجود داشته باشد.
- زمان یک Activity کامل‌شده فقط از طریق duration editor به ۷ دقیقه تغییر کند و در IndexedDB persist شود.
- یک Activity آزمایشی از Recent حذف شود.
- رابطه Work Project و title اصلی بعد از edit/delete سالم بماند.

## R4 — Live Activity Visual Alignment + Direction-Safe Duration Editor

Visual QA نسخه R3 دو ایراد باقی‌مانده را مشخص کرد:

1. Duration editor در RTL/LTR باید ترتیب منطقی و جای فیلدهای «ساعت/دقیقه» را بدون وارونگی حفظ کند.
2. FlipClock فعالیت جاری باید compact، هم‌خط و متوازن باشد؛ باکس‌های رقم نباید باریک/کشیده یا از baseline خارج شوند.

### Duration editor

- ترتیب منطقی fieldها همیشه `Hours → Minutes` است و container جهت فعال Locale را می‌گیرد؛ در فارسی ساعت در سمت inline-start (راست) و دقیقه بعد از آن قرار می‌گیرد و در English/LTR همان ترتیب به چپ→راست منتقل می‌شود.
- NumberField عددی همچنان `dir=ltr` و tabular است تا ورود عدد در هر Locale پایدار بماند.
- هر فیلد اکنون stepper قابل‌دسترسی بالا/پایین دارد و مقدار داخل کنترل centered است.
- Dialog همچنان فقط duration را تغییر می‌دهد و Start/End مستقیم در UX نمایش داده نمی‌شوند.

### Live activity surface

- Running surface به دو بخش context و live timer تقسیم شد و divider از logical border استفاده می‌کند؛ بنابراین RTL/LTR هر دو بدون hard-coded left/right layout کار می‌کنند.
- وضعیت زنده با accent badge + pulse کوچک نمایش داده می‌شود و success-green surface بزرگ بازنمی‌گردد.
- `FlipClock size="activity"` نسبت عرض/ارتفاع متوازن‌تری دارد، separatorها ارتفاع خود digit row را می‌گیرند و HH:MM:SS همراه unit labelها روی یک baseline دیده می‌شود.
- روی نمایشگرهای کوچک، CTA پایان فعالیت زیر Timer stack می‌شود؛ از 420px به بالا timer و CTA در یک ردیف پایدار قرار می‌گیرند.
- Project context و عنوان Activity در hierarchy واضح‌تری قرار گرفتند.

### Activity overview

- دسته‌های فعالیت اکنون header مستقل و cardهای هم‌اندازه‌تر دارند.
- Recent Activity rowها border و action geometry واضح‌تری دارند تا Edit/Delete همیشه پیدا باشند.

### Safety

- AppData همچنان v21 است.
- هیچ migration یا dependency جدیدی اضافه نشده است.
- Activity duration semantics، payroll، attendance، break/lunch و multi-tab ownership تغییر نکرده‌اند.


## R5 — Compact Active Shell + Fixed Duration Field Order

### Visual QA follow-up

- پنل بزرگ Running از R4 حذف شد و حالت فعال دوباره همان shell فشرده فرم Start را استفاده می‌کند تا ارتفاع کارت ثابت بماند.
- نوع فعالیت، «روی چه کاری کار می‌کنی؟» و پروژه در حالت Running به surfaceهای read-only با همان ارتفاع کنترل‌های فرم تبدیل می‌شوند.
- FlipClock موجود بدون تغییر در اندازه/animation داخل ناحیه اکشن قرار می‌گیرد و دکمه «پایان فعالیت» کنار آن باقی می‌ماند.
- live state فقط با dot/pulse کوچک کنار برچسب زمان زنده مشخص می‌شود؛ banner یا surface سبز بزرگ وجود ندارد.
- در Duration Dialog ترتیب بصری عمداً locale-independent است: `Hours` همیشه ستون چپ و `Minutes` همیشه ستون راست. هر field جهت متن label را از locale می‌گیرد و NumberField همچنان `dir=ltr` دارد.

### Safety

- منطق timer، start/stop، duration edit و persistence تغییر نکرده است.
- AppData همچنان v21 است.
- dependency، package.json و package-lock تغییر نکرده‌اند.

## R6 — Final Running Bar Polish

Visual QA نسخه R5 ترکیب کلی را تأیید کرد و فقط دو اصلاح نهایی خواست:

1. وضعیت زنده `در حال ثبت` باید از جهت صفحه پیروی کند: در فارسی/RTL در سمت راست و در English/LTR در سمت چپ.
2. دکمه `پایان فعالیت` نباید داخل همان surface تایمر فشرده شود؛ Timer و CTA باید از نظر hierarchy از هم جدا باشند، بدون تغییر اندازه و ظاهر FlipClock تأییدشده.

### Running layout

- shell فشرده R5 حفظ شده است و پنل بزرگ Running بازنمی‌گردد.
- status pill در یک logical inline-start row قرار دارد؛ بنابراین با `direction` صفحه خودکار mirror می‌شود و هیچ `left/right` hard-code وجود ندارد.
- Type / Work Item / Project همان display fieldهای read-only و همان ارتفاع کنترل‌های Start form را نگه می‌دارند.
- `FlipClock size="activity" variant="boxed"` بدون تغییر dimension/animation استفاده می‌شود.
- Stop action ستون مستقل دارد و در Desktop با `border-inline-start` از Timer جدا می‌شود؛ در RTL divider سمت درست و در LTR به‌صورت mirror دیده می‌شود.
- در عرض‌های کوچک grid همچنان stack می‌شود و CTA تمام‌عرض می‌ماند.

### Safety

- هیچ business logic یا Timer runtime تغییر نکرده است.
- Start/Stop/Edit/Delete semantics بدون تغییرند.
- AppData همچنان v21 است.
- migration، dependency، package.json و package-lock تغییر نکرده‌اند.

## R7 — History Scroll + Attendance Event Editing + Shell Polish

Visual QA نسخه R6 چند polish مستقل از Schema را مشخص کرد:

- لیست «آخرین بخش‌های فعالیت» دیگر به چهار Segment محدود نیست؛ ارتفاع کنترل‌شده دارد و با scroll داخلی همه فعالیت‌های کامل‌شده همان روز را نشان می‌دهد.
- FlipClock فعالیت جاری تغییر نکرد؛ CTA پایان فعالیت با ارتفاع و baseline Timer هماهنگ شد تا Timer بزرگ‌تر از Action دیده نشود.
- جدول ورود/خروج/ناهار/وقفه بازطراحی شد و هر رویداد Action ویرایش مستقیم دارد. Clock-in/out فقط زمان را ویرایش می‌کنند؛ Lunch و Break بازه و وضعیت باحقوق را نیز ویرایش می‌کنند و مدت ناهار بعد از تغییر مرزها دوباره محاسبه می‌شود.
- Mobile Attendance به card layout تبدیل می‌شود تا جدول افقی اجباری نباشد.
- Help surface از `text-start` و logical alignment صریح در RTL/LTR استفاده می‌کند.
- Footer مسیرهای `/about`، `/help`، `/privacy` و `/terms` را مستقیم در دسترس قرار می‌دهد و CTA «ستاره در گیت‌هاب» به repository رسمی ساعت‌یار اضافه شد.
- Header موبایل compact شد: Profile فقط Avatar است، Workspace Switcher در عرض کوچک icon-only است و Brand mark بزرگ‌تر شد.

### Safety

- AppData همچنان **v21** است.
- Migration یا dependency جدیدی وجود ندارد.
- ویرایش Attendance از updater فعلی WorkRecord استفاده می‌کند و محاسبات روز پس از Save دوباره مشتق می‌شوند.
- تست رفتاری جدید Phase 192+ source-inspection ندارد و ویرایش Clock-in/Lunch/Break را مستقیم روی helper pure بررسی می‌کند.


## R8 — Footer GitHub Icon Compile Hotfix

اجرای واقعی R7 در Next.js 16 نشان داد نسخه نصب‌شده `lucide-react` آیکون برند `Github` را export نمی‌کند و در نتیجه `app-footer.tsx` در Dev/Build با خطای import متوقف می‌شود.

- import نامعتبر `Github` از Lucide حذف شد.
- CTA گیت‌هاب و Star حفظ شد و فقط GitHub mark به یک SVG سبک و source-owned داخل Footer تبدیل شد.
- هیچ dependency جدیدی اضافه نشد و package/lockfile تغییر نکرد.
- مسیرهای `/about`، `/help`، `/privacy` و `/terms` و responsive footer R7 بدون تغییر باقی مانده‌اند.
- AppData همچنان v21 است و migration جدیدی وجود ندارد.


## R9 — GitHub stars + mobile focus polish

- CTA گیت‌هاب Footer دیگر متن نمایشی ندارد؛ فقط GitHub mark، Star و تعداد ستاره زنده نمایش داده می‌شود.
- تعداد ستاره از endpoint عمومی repository در GitHub دریافت می‌شود و برای ۶ ساعت در localStorage cache می‌شود تا درخواست‌های تکراری کم و حالت آفلاین قابل‌تحمل باشد.
- اگر شبکه، CORS، rate limit یا localStorage در دسترس نباشد، Footer و کل Shell بدون خطا ادامه می‌دهند و در صورت وجود cache همان عدد قبلی نمایش داده می‌شود.
- `#main-content` همچنان target قابل فوکوس Skip Link است، اما tap روی موبایل دیگر outline بزرگ دور کل محتوای صفحه ایجاد نمی‌کند؛ focus-visible کنترل‌های تعاملی دست‌نخورده است.
- AppData v21، Timer/Attendance و dependencyها تغییری نکردند.


## R10 — Type-safe WorkProject Normalisation Gate Hotfix

- اجرای واقعی R9 در `check:quality` پیش از Build روی TypeScript متوقف شد؛ `normaliseData` مقدار `status` پروژه کاری را از نظر runtime درست normalize می‌کرد اما inference آرایه آن را `string` می‌دید و با قرارداد `WorkProject["status"] = "active" | "archived"` سازگار تشخیص نمی‌داد.
- Normalisation اکنون خروجی هر WorkProject را با return type صریح `WorkProject[]` می‌سازد؛ status نامعتبر به `active` repair می‌شود و `archived` حفظ می‌شود.
- یک تست رفتاری Phase 199 اضافه شد که repair یک status نامعتبر را بدون source-inspection بررسی می‌کند.
- Failure مشاهده‌شده در Employee Browser Smoke بعد از fail شدن Typecheck روی static export قبلی اجرا شده بود؛ Source فعلی Employee همچنان فقط `workProjects` را نمایش می‌دهد و Freelance Project فقط برای Hybrid مجاز است. پس Browser Smokes فقط بعد از Build تازه و سبز معتبرند.
- ICE timeout تک‌بار Pairing به‌عنوان failure محیط WebRTC شناخته شد؛ اجرای بعدی همان Gate بدون تغییر سورس PASS شده بود، بنابراین در این revision منطق Pairing تغییر نکرد.
- AppData v21، UI، Timer، Footer/GitHub stars، dependencyها و lockfile بدون تغییرند.


## R11 — Employee Browser Contract Marker Hotfix

- Full `check:quality` روی R10 با 949/949 تست و Build تازه سبز شد، اما Employee Browser Smoke بعد از Start Activity منتظر `data-active-activity-title` می‌ماند.
- در refactor بصری Running Activity، عنوان کار همچنان روی صفحه رندر می‌شد ولی marker معنایی تست از DOM حذف شده بود؛ بنابراین Start واقعاً انجام می‌شد اما Harness آن را تشخیص نمی‌داد و timeout می‌کرد.
- R11 فقط marker `data-active-activity-title` را به همان read-only Work Item field در `ActivityLivePanel` برمی‌گرداند. FlipClock، layout، Start/Stop، project isolation و persistence تغییر نکرده‌اند.
- AppData v21، migration، dependency، package.json و package-lock بدون تغییرند.
