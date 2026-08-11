# فاز ۱۷۹ — Release Candidate 2.4.0

Baseline: `887158c` (`dev`، پایان فاز ۱۷۸)

- Package قبل از فاز: `2.3.2`
- Package Candidate: `2.4.0`
- AppData Schema: `v17`
- Migration: ندارد
- Dependency جدید Candidate: `framer-motion@^12.42.2` برای Flip Clock تایمر
- Baseline tests: `758/758`

## هدف

بسته‌بندی توسعه پس از ۲.۳.۲، از آنبوردینگ مستقل تا Closure کامل i18n، به‌عنوان Release Candidate قابل Audit برای ۲.۴.۰؛ بدون ادعای Release Production یا Tag نهایی.

## چرا Minor Release

تغییرات فازهای ۱۶۶ تا ۱۷۸ فقط Patch نیستند: Route مستقل آنبوردینگ، Import Wizard، رفتار جدید Live Runtime، اصلاح قرارداد مرخصی و پشتیبانی کامل Locale انگلیسی/LTR قابلیت‌های قابل‌مشاهده محصول هستند. بنابراین نسخه از ۲.۳.۲ به ۲.۴.۰ می‌رود، در حالی که Schema v17 ثابت می‌ماند.

## قرارداد Candidate

- `package.json` و `package-lock.json` روی `2.4.0` قرار می‌گیرند.
- Manifest فعال جدید `docs/releases/2.4.0.json` وضعیت `release-candidate` دارد.
- Baseline معتبر فاز ۱۷۸ برابر `887158c` و `758/758` است.
- `releaseCommit` در Candidate برابر `null` است.
- Merge به `main`، Production Audit و Tag `v2.4.0` عمداً Pending می‌مانند.
- Manifestهای ۲.۳.۲ و قدیمی‌تر تاریخی و immutable باقی می‌مانند.

## Revision 3 — Quick Language UX + historical audit repair

- از نظر UX قرار دادن یک Select متنی دیگر در Header دسکتاپ رد شد، چون Header هم‌اکنون Workspace Switcher، Theme، Financial visibility و Profile را حمل می‌کند و افزودن Label دائمی hierarchy و فضای افقی را بدتر می‌کرد.
- Desktop: کنترل زبان با پرچم در Utility پایین Sidebar قرار گرفت؛ این محل برای Preference سراسری مناسب‌تر است و فضای Header را دست‌نخورده نگه می‌دارد.
- Tablet/Mobile: چون Sidebar پنهان است، همان کنترل به‌صورت Flag-only و icon-sized داخل utility shell Header دیده می‌شود؛ Financial control در عرض‌های باریک طبق قرارداد قبلی پنهان می‌ماند.
- Menu هر دو زبان را با پرچم + نام زبان + کد `FA/EN` نشان می‌دهد؛ Flag فقط cue بصری است و نام زبان همچنان label اصلی و accessible باقی می‌ماند.
- Locale همچنان در `saatyar-locale-v1` و خارج از AppData ذخیره می‌شود؛ Schema/backup/domain values تغییر نکرده‌اند.
- Regression قدیمی Phase 112 نیز با بازگرداندن Manifestهای 2.2.0/2.1.0 به required-files قرارداد Release Audit اصلاح شد.

## Revision 4 — Calendar preference + Settings runtime repair

- خطای Runtime صفحه Settings در `npm run dev` از interop مستقیم فایل CommonJS محلی QR با Vite می‌آمد. Encoder vendored بدون Dependency جدید به یک ESM bundle مرورگر-ایمن متصل شد؛ فایل‌های CommonJS تاریخی دست‌نخورده باقی مانده‌اند.
- Preference مستقل تقویم با سه حالت `auto | persian | gregory` اضافه شد و مثل Locale فقط در همان Browser ذخیره می‌شود؛ AppData/Schema/Backup تغییر نکرده‌اند.
- در حالت `auto`، رابط انگلیسی تقویم Gregorian و رابط فارسی تقویم Persian/Jalali می‌گیرد. Override صریح اجازه می‌دهد مثلاً English + Persian calendar یا فارسی + Gregorian داشته باشیم.
- Date formatting، Date Picker، Month grid، حرکت ماه و انتخاب رکوردهای همان ماه از Calendar فعال پیروی می‌کنند، در حالی که کلید ذخیره تاریخ همچنان Gregorian `YYYY-MM-DD` باقی می‌ماند.
- Status dot تقویم ماه از موقعیت فیزیکی `left` به `end` منتقل شد تا در LTR روی عدد روز نیفتد و در RTL هم سمت مقابل Label باقی بماند.
- Breakdown حقوق دیگر Title فارسی را داخل Payroll engine حمل نمی‌کند؛ UI Label را با `line.key` از Catalog فعال ترجمه می‌کند تا English Reports متن فارسی نشت ندهد.
- Production browser smoke اکنون قرارداد `English → Gregorian`، Override انگلیسی + تقویم فارسی و Restore خودکار فارسی + تقویم فارسی را هم پوشش می‌دهد.

## Revision 5 — Dev runtime stability + density polish

- Visual QA نشان داد `npm run dev` در مسیر Vite/Vinext می‌تواند در Windows با قطع HMR WebSocket و خطای Dev-only `Performance.measure` در React RSC متوقف شود، در حالی که Build و Browser Gate تولیدی سبز هستند. مسیر توسعه محلی پیش‌فرض به `next dev` منتقل شد و Vite/Vinext با `npm run dev:vinext` به‌صورت اختیاری حفظ شد تا Dev Runtime با همان Next.jsای که Release Build را تولید می‌کند هم‌راستا باشد.
- توضیحات غیرضروری زیر Page/Section heading از Flow اصلی حذف شدند و پشت یک Info tooltip سبک، قابل Hover و Keyboard-focus قرار گرفتند. متن‌های ضروری فرم، Empty State و هشدارها عمداً Inline باقی ماندند تا Discoverability عملیات مهم قربانی کاهش شلوغی نشود.
- نمایش بازه ورود/خروج در جزئیات ماه از یک رشته Bidirectional به دو `bdi dir="ltr"` مستقل با Separator ترجمه‌شده تبدیل شد تا `۱۰:۳۲ تا ۱۰:۳۲` و معادل انگلیسی در RTL/LTR جابه‌جا نشوند.
- Record Health اکنون بازه کاری صفرطول مثل `10:32 → 10:32` را `invalid-work-span` می‌داند؛ چنین رکوردی دیگر به‌اشتباه Badge «کامل» نمی‌گیرد.
- پرچم ایران در Language switcher به سه نوار ساده سبز/سفید/قرمز بدون نشان مرکزی تبدیل شد.
- این Revision Dependency جدید ندارد؛ Tooltip برای Headingها application-specific و CSS/focus-based است تا Candidate درگیر Dependency و رفتار اضافی Hover نشود.

## Revision 6 — timer motion + responsive header cleanup

- تایمر زنده Today بر اساس الگوی Flip Clock بازطراحی شد، اما برخلاف نمونه خام، `setInterval` مستقل اضافه نمی‌کند؛ همان Runtime Clock مشترک و visibility-aware فاز ۱۷۲ ثانیه‌ها را تأمین می‌کند و فقط Digitهای تغییرکرده با `framer-motion` انیمیت می‌شوند.
- `components/ui/flip-clock.tsx` داخل مسیر استاندارد shadcn قرار گرفت و تم، ارقام فارسی/لاتین، Reduced Motion و Bidi-safe `LTR` clock layout را رعایت می‌کند.
- مشکل فشردگی کارت‌های «ورود/خروج» از ساختار grid بود: `TimeInputs` در grid چهارسوتونه فقط یک ستون می‌گرفت و خودش دوباره دو ستون می‌شد. اکنون Attendance در Desktop/Tablet دو ستون والد را اشغال می‌کند و Lunch/Break هرکدام یک ستون مستقل دارند؛ موبایل همچنان تک‌ستونه می‌شود.
- Financial visibility و Theme دیگر داخل یک Surface مشترک شبیه Segmented/Button Group نیستند. چون دو Action مستقل و نامرتبط‌اند، هرکدام Button مستقل با مرز، focus و tooltip خود دارند. Quick Language نیز Button مستقل باقی می‌ماند.
- Privacy control دیگر در عرض ۴۶۰px ناپدید نمی‌شود. برای حفظ قابلیت و جلوگیری از Overflow، Route label زیر ۵۲۰px جمع می‌شود و Workspace switcher زیر ۳۸۰px به icon-only تبدیل می‌شود.
- Navigation تنظیمات در موبایل scrollbar بصری را حذف می‌کند؛ Groupها زیر ۵۲۰px به Grid دو ستونه تبدیل می‌شوند و Item strip با Swipe/Snap بدون scrollbar قابل استفاده می‌ماند.
- عنوان «زبان و جهت / Language & direction» به «زبان / Language» کوتاه شد؛ Direction نتیجه Locale است و نیاز به Label جداگانه در Navigation ندارد.
- پرچم ایران همان سه نوار ساده سبز/سفید/قرمز Revision 5 را حفظ می‌کند.

## Revision 7 — Record Health localization completion

- کد `invalid-work-span` که در Revision 5 به Record Health اضافه شده بود، در Data Health Center نیز به Catalog سیستم متصل شد تا TypeScript mapping کامل بماند.
- پیام فارسی و انگلیسی برای «خروج باید بعد از ورود باشد» به قرارداد System i18n اضافه شد.
- این Revision هیچ تغییر Schema، Dependency یا رفتار ذخیره‌سازی ندارد.

## Revision 8 — Historical contract repair after Flip Clock dependency

- سه تست تاریخی فازهای ۱۷۶، ۱۷۷ و ۱۷۸ دیگر تعداد Dependency فعلی Repository را به عدد تاریخی `32` قفل نمی‌کنند؛ نبود Dependency جدید در هر فاز از Notes همان فاز اثبات می‌شود، در حالی که Dependency جدید `framer-motion` متعلق به فاز ۱۷۹ است.
- مالکیت تعداد Dependency فعال به Contract فاز ۱۷۹ منتقل شد و اکنون `33` پکیج مستقیم را همراه با `framer-motion@^12.42.2` کنترل می‌کند.
- تست قدیمی Shell Density با UX جدید Header هم‌راستا شد: Privacy و Theme باید `headerStandaloneIconButton` مستقل داشته باشند و نباید دوباره داخل `headerControlShell` یا الگوی `gap-0.5 p-1` گروه‌بندی شوند.
- این Revision فقط Contractهای تست را با رفتار تاییدشده محصول همگام می‌کند و هیچ Product behavior را برای عبور از Gate عقب‌گرد نمی‌دهد.

## Revision 9 — Flip Clock sizing + workspace durability

- Visual QA نشان داد Digitهای Flip Clock داخل Progress Arc بیش از حد کوچک‌اند و در فارسی رقم `۰` به‌دلیل شکل طبیعی رقم فارسی شبیه نقطه دیده می‌شود. Face تایمر برای خوانایی عملیاتی از رقم لاتین ثابت استفاده می‌کند، در حالی که `aria-label` و متن‌های اطراف همچنان با Locale فعال ترجمه می‌شوند.
- اندازه Hero Clock با `clamp()` بزرگ‌تر و Responsive شد: Digitها تا 40×56px رشد می‌کنند اما روی موبایل به‌صورت سیال کوچک می‌شوند تا از Arc بیرون نزنند. Separator و فاصله‌ها نیز متناسب با عرض صفحه Scale می‌شوند.
- Production browser smoke پس از تغییر Workspace فقط به state رندرشده اکتفا نمی‌کند و قبل از navigation کامل، ذخیره‌شدن `settings.mode` در IndexedDB را هم انتظار می‌کشد. این کار race بین UI switch و RouteGuard در static export را حذف می‌کند.
- خطای Dev-only `Performance.measure: NotFound cannot have a negative time stamp` مربوط به Vite/Vinext روی پورت 5173 است؛ مسیر پیش‌فرض پروژه همچنان `next dev` روی پورت 3000 است.
- این Revision Schema/Dependency جدید ندارد و شمارش Candidate همان 764 تست باقی می‌ماند.

## Release Audit

`npm run check:release:audit` اکنون Candidate ۲.۴.۰ را source of truth می‌داند و این موارد را کنترل می‌کند:

- هماهنگی Package/Lockfile/Manifest/Node/Schema.
- وضعیت Candidate و نبود ادعای Release نهایی.
- Baseline `887158c` با ۷۵۸ تست و شواهد Browser/Pairing/Vercel/i18n.
- Release Notes فارسی/انگلیسی، Changelog، Checklist، Docs index و READMEها.
- ثابت‌ماندن Manifest تاریخی ۲.۳.۲.
- ترتیب پنج‌مرحله‌ای `check:release`.
- حضور همه `*.test.ts`ها در `npm test`.
- بسته‌بودن فاز ۱۷۹ و بازبودن فاز ۱۸۰ تا Finalization.

## شمارش تست

فاز ۱۷۹ شش Contract Test اضافه می‌کند:

```text
764 tests
764 pass
0 fail
```

Pairing، Vercel audit و `git diff --check` همچنان خارج از شمارش Node Test و به‌صورت Gate مکمل اجرا می‌شوند.

## مرحله بعد

پس از سبزشدن کامل Candidate، Commit و Push روی `dev` انجام می‌شود. فاز ۱۸۰ SHA همین Candidate را ثبت می‌کند و مسیر Merge/Deploy/Production Audit/Tag را نهایی می‌کند. تا آن زمان `main` و Tag دست‌نخورده می‌مانند.

## Revision 10 — mobile dialog viewport hardening

- دیالوگ مشترک در موبایل به‌جای centering شکننده با `translate`، با inset امن ۱۲px از بالا و دو طرف باز می‌شود.
- ارتفاع دیالوگ به `100dvh - 1.5rem` محدود شده و محتوای بلند داخل خود دیالوگ scroll می‌شود.
- قرارداد Browser Freelancer حالا علاوه بر چپ/راست/بالا، پایین دیالوگ را هم داخل viewport بررسی می‌کند و در failure ابعاد دقیق dialog/viewport را گزارش می‌دهد.
- این Revision هیچ Schema migration، dependency یا تغییر test-count جدیدی ندارد؛ Candidate همچنان 764 تست است.

### Revision 12 — dev reload-loop guard + viewport-safe dialog

- Dev mode دیگر Service Worker تولیدی را روی localhost فعال نگه نمی‌دارد؛ registrationهای قدیمی و cacheهای `saatyar-*` در توسعه پاک می‌شوند تا Next HMR/refresh وارد reload loop نشود.
- رفتار PWA در production بدون تغییر مانده و همچنان توسط Production Browser Smoke پوشش داده می‌شود.
- Dialog مشترک دیگر برای geometry به breakpointهای rem-based وابسته نیست و همیشه با `min(100vw - 1.5rem, 520px)` داخل viewport مرکز می‌شود؛ این اصلاح failure موبایل Freelancer را هدف می‌گیرد.

### Revision 13 — Vazirmatn timer digits + break paid alignment

- تایمر زنده داخل Progress Dial روی اندازه ثابت `32px` قرار گرفت تا در فارسی و انگلیسی بدون بریدگی یا خروج از دایره خوانا بماند.
- Countdown/Live Clock همچنان هر ثانیه از Runtime Clock مشترک فاز ۱۷۲ به‌روزرسانی می‌شود و یک transition بسیار کوتاه Framer Motion دارد؛ `setInterval` مستقل اضافه نشده است.
- رشته ساعت عمداً به‌صورت ASCII `HH:MM:SS` و `dir="ltr"` باقی می‌ماند تا Bidi ترتیب زمان را در RTL به‌هم نزند.
- فارسی‌سازی بصری ارقام تایمر دیگر با تبدیل JavaScript انجام نمی‌شود. Vazirmatn Variable که از قبل self-host شده بود، با OpenType feature رسمی `ss01` در Locale فارسی و `tnum` برای عرض ثابت ارقام استفاده می‌شود. در Locale انگلیسی `ss01` فعال نیست.
- Font family اصلی اپ از نام صحیح Fontsource یعنی `"Vazirmatn Variable"` استفاده می‌کند؛ feature فارسی نیز براساس `html[lang="fa"]` فعال می‌شود تا English UI ارقام لاتین خود را حفظ کند.
- کنترل «با حقوق» در Break Editor به یک کنترل مستقل ۴۴px و `self-end` تبدیل شد تا baseline آن با TimePickerهای شروع/پایان یکی باشد و label تکراری بالای آن حذف شود.
- این Revision هیچ Schema migration یا Dependency جدیدی ندارد و Candidate همچنان 764 تست دارد.

### Revision 14 — official Vazirmatn FD + per-digit flip motion

- Fontsource حذف و پکیج رسمی `vazirmatn@33.0.3` جایگزین شد؛ همان پکیجی که Repository اصلی منتشر می‌کند و پوشه `misc/Farsi-Digits` را در فایل‌های npm قرار می‌دهد.
- برای فارسی، `Vazirmatn-FD-font-face.css` رسمی بارگذاری می‌شود و `html[lang="fa"]` از خانواده `Vazirmatn FD` استفاده می‌کند. بنابراین متن تایمر همچنان ASCII `HH:MM:SS` و LTR است، اما خود Font glyphهای فارسی را نمایش می‌دهد؛ تبدیل JavaScript و `ss01` روی Fontsource دیگر وجود ندارد.
- Flip Clock مثل نمونه مرجع، هر Digit را مستقل انیمیت می‌کند: Digit جدید از بالا وارد و قبلی به پایین خارج می‌شود. هیچ Box/Background/Border دور Digitها اضافه نشده و فقط خود اعداد داخل Dial حرکت می‌کنند.
- اندازه Hero Clock روی `32px` باقی مانده و `prefers-reduced-motion` همچنان رعایت می‌شود. Runtime Clock مشترک فاز ۱۷۲ منبع زمان است و `setInterval` جدیدی اضافه نشده است.
- تعداد Dependency مستقیم Candidate همچنان `33` است چون Fontsource با پکیج رسمی Vazirmatn جایگزین شده، نه اینکه Dependency دیگری به مجموعه اضافه شود.

### Revision 15/16 — final Today visual lock for release

- Visual QA نهایی نشان داد glyphهای رسمی `Vazirmatn FD` در اندازه‌های ۲۸–۳۰px هنوز داخل Flip slot تایمر متراکم دیده می‌شوند. Hero Clock برای Release روی `20px` قفل شد؛ خود Digit slot، Flip motion، `dir="ltr"` و Runtime Clock فاز ۱۷۲ بدون تغییر باقی مانده‌اند.
- کارت یادداشت روز کاری کارمند از فضای خالی قبلی خارج شد: Note surface حالا ارتفاع مفید، textarea بزرگ‌تر و footer ذخیره‌ی خودکار منسجم دارد و نسبت ستون Timer/Note متعادل‌تر شده است.
- این Revision آخرین Product/UI تغییر Candidate 2.4.0 است. Schema همچنان v17، تعداد Dependency مستقیم 33 و شمارش Candidate همان 764 تست است. پس از Gate سبز، تغییر Product دیگری قبل از Release انجام نمی‌شود؛ فقط Commit/Push و Finalization فاز ۱۸۰ باقی می‌ماند.


### Final gate regression sync — R16

- سه تست تاریخی فازهای ۵۳، ۱۰۳ و ۱۰۴ با طراحی فعلی Today همگام شدند؛ Product UI برای پاس‌کردن تست‌های قدیمی عقب‌گرد نکرد.
- قرارداد Progress Arc اکنون circumference-based است (`strokeDasharray={circumference}` / `strokeDashoffset={dashOffset}`) و layout آن responsive `aspect-square` با سقف ۳۲۰px است.
- قرارداد یادداشت کارمند، چیدمان `content-start gap-4` و Textarea شش‌ردیفه فعلی را به‌عنوان baseline محافظت می‌کند.
- این Revision هیچ تغییر Schema، Dependency یا رفتار دامنه‌ای ندارد و صرفاً Release Gate را با Source of Truth فعلی همگام می‌کند.

### Final gate regression sync — R17

- Gate نهایی R16 تمام 764 تست Node، Build، Production Browser Smoke، Pairing و Vercel contract را سبز کرد؛ تنها failure باقی‌مانده geometry دیالوگ Quick Client در Browser Freelancer موبایل بود.
- دیالوگ مشترک در viewportهای زیر `sm` دیگر از `left:50% + translateX(-50%)` استفاده نمی‌کند؛ با inset فیزیکی ۱۲px از چپ/راست و بالا باز می‌شود، عرضش `auto` است و ارتفاع به `100dvh - 1.5rem` محدود می‌ماند.
- از `sm` به بالا همان Modal centered قبلی با `left-1/2`, `top-1/2` و translate حفظ شده است. بنابراین Desktop behavior تغییر نمی‌کند و Mobile geometry دیگر به اختلاف layout viewport / emulation viewport وابسته نیست.
- قرارداد Phase 179 به‌روزرسانی شد تا mobile-safe inset و desktop centering هر دو محافظت شوند. Schema، Dependency، Domain behavior و test count تغییر نکرده‌اند.


## Final Gate R18 — Visual Viewport dialog hardening

- Browser smoke روی emulation موبایل نشان داد `window.innerWidth` می‌تواند از `visualViewport.width` بزرگ‌تر باشد.
- Dialog اکنون geometry خود را از `window.visualViewport` می‌گیرد تا در viewport واقعاً قابل‌دیدن باقی بماند.
- در موبایل ۱۲px gutter واقعی از visual viewport حفظ می‌شود؛ در desktop همان modal centered با سقف 520px باقی می‌ماند.
- تست Freelancer نیز fit را نسبت به visual viewport می‌سنجد و diagnostics مربوط به offset/scale را چاپ می‌کند.
- Schema، dependency، product behavior و test count تغییری نکرده‌اند.

## Revision 19 — RTL mobile dialog inline-start fix

- Mobile Dialog geometry now anchors with logical `inset-inline-start` instead of physical `left`.
- This prevents Persian/RTL dialogs from shifting outside Chrome mobile visual viewport when layout viewport width differs from the emulated visual viewport.
- Desktop centered dialog behavior remains unchanged.
- Schema, dependencies, release version, and candidate test target remain unchanged.



### Final Gate R20 — mobile dialog geometry
- اصلاح R19: logical inset در RTL همراه با visual viewport مختصات قابل اتکایی تولید نمی‌کرد.
- Dialog موبایل اکنون مستقل از direction روی مرکز physical visual viewport قرار می‌گیرد و فقط محتوای داخلی RTL/LTR است.
- smoke قبل از assertion منتظر پایدار شدن visual viewport می‌ماند و bounds را با offsetLeft/offsetTop واقعی می‌سنجد.


### Final Gate R21 — RTL layout/visual viewport compensation
- Diagnostics R20 ثابت کرد خود `left:195px` و `translateX(-50%)` درست محاسبه می‌شوند، اما در RTL فاصله‌ی `window.innerWidth - visualViewport.width` برابر 136px به مختصات `getBoundingClientRect()` تحمیل می‌شود.
- Dialog اکنون در RTL این اختلاف layout/visual viewport را به‌عنوان compensation افقی اعمال می‌کند؛ برای نمونه‌ی smoke فعلی مرکز CSS از 195px به 331px می‌رود تا rect نهایی 12px تا 378px داخل visual viewport 390px قرار بگیرد.
- LTR هیچ compensation اضافی نمی‌گیرد. Smoke diagnostics همچنین `pageLeft/pageTop`, `scrollX/scrollY` و root rect را ثبت می‌کند تا اگر مرورگر دیگری رفتار متفاوت داشت علت مستقیم دیده شود.
- Schema، dependency، release version و test count تغییری نکرده‌اند.
