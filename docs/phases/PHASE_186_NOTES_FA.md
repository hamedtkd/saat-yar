# فاز ۱۸۶ — Motion & Perceived Performance

## هدف

حرکت در ساعت‌یار باید به فهم تغییر وضعیت کمک کند، نه اینکه صرفاً تزئینی باشد. این فاز بدون دست‌زدن به داده دامنه یا AppData، Boot اولیه و جابه‌جایی بین Routeها را نرم‌تر می‌کند و در عین حال `prefers-reduced-motion`، Local-first بودن و نبود Layout Shift را حفظ می‌کند.

## تغییرات اصلی

- Loading اولیه‌ی متن‌محور با `AppLoadingState` جایگزین شد؛ این State همان footprint اصلی Shell را رزرو می‌کند: Sidebar دسکتاپ، Header، Content width و Bottom Navigation موبایل. بنابراین هنگام آماده‌شدن IndexedDB، رابط از یک Spinner مرکزی به Shell کامل نمی‌پرد.
- Loading State برند ساعت‌یار را نشان می‌دهد و Skeletonها ابعاد ثابت دارند. تنها حرکت تکرارشونده یک progress sweep کوچک با `motion-safe` است؛ BrandMark نیز همان animation محدود قبلی را نگه می‌دارد.
- `RouteMotionBoundary` با `framer-motion` موجود پروژه اضافه شد. تغییر Route با key نرمال‌شده‌ی pathname اکنون فقط `opacity` را برای حدود ۱۸۰ms تغییر می‌دهد؛ هیچ transform یا property مؤثر بر layout روی ancestor صفحه باقی نمی‌ماند، بنابراین action barهای `position: fixed` موبایل همچنان نسبت به viewport ثابت می‌مانند.
- `useReducedMotion()` در Route boundary فعال است. وقتی سیستم Reduced Motion را درخواست کند، transition به duration صفر می‌رسد. Global CSS قبلی نیز animation/transitionهای باقی‌مانده را محدود می‌کند.
- هیچ Timer جدید، Network request، Persistence write، BroadcastChannel، Service Worker mutation یا dependency جدیدی اضافه نشده است.

## قرارداد Performance

- Motion باید state-driven باشد؛ route key منبع transition است.
- Layout-affecting property انیمیت نمی‌شود؛ Route transition عمداً opacity-only است تا هیچ transformed ancestor برای عناصر fixed ساخته نشود.
- Loading shell باید geometry کلی اپ را قبل از آماده‌شدن Local data حفظ کند.
- Animationهای loop محدود و `motion-safe` هستند.
- `prefers-reduced-motion: reduce` همیشه مسیر بدون animation دارد.

## داده و Schema

- Development AppData: **Schema v19**
- Released 2.4.0 AppData: **Schema v17**
- Migration: ندارد
- Dependency جدید: ندارد؛ از `framer-motion@^12.42.2` موجود از Release 2.4.0 استفاده می‌شود.

## Gate

- Unit/source contracts جدید Phase 186
- Quality gate کامل
- Production browser smoke برای route-motion + Reduced Motion
- Visual QA روی Desktop/Mobile، فارسی RTL/English LTR و Light/Dark

## R2 — Gate hardening

- قرارداد قدیمی Phase 100 اکنون مالک واقعی BrandMark در loading shell را بررسی می‌کند، نه import مستقیم منسوخ در `saatyar-shell.tsx`.
- markerهای `data-route-motion*` روی یک wrapper ساده DOM قرار گرفتند و motion فقط روی child composited اجرا می‌شود تا browser smoke به forwarding داخلی Framer Motion وابسته نباشد.
- EOF اضافی READMEهای فارسی و انگلیسی حذف شد.

## R6 — Visual Polish

- Skeleton اولیه Route-aware شد: `/today` هندسه Hero، Smart Summary، Focus/Timer و Time Strip واقعی را رزرو می‌کند و `/month` ساختار Heading، KPI، Calendar/Weekly و سه کارت Activity Intelligence را تقلید می‌کند؛ Generic skeleton فقط برای Routeهای دیگر باقی می‌ماند.
- ردیف Activity Intelligence در Desktop از `items-stretch` و Header مشترک استفاده می‌کند؛ Heatmap، Recent 7 Days و Month Intelligence در یک baseline عمودی قرار می‌گیرند و در breakpoint تک‌ستونه دوباره ارتفاع طبیعی می‌گیرند.
- Theme Toggle روی مرورگرهای دارای View Transition API، تم بصری بعدی را با radial reveal از مرکز همان دکمه گسترش می‌دهد. مختصات و شعاع از viewport واقعی محاسبه می‌شوند و در `prefers-reduced-motion: reduce` یا مرورگر بدون API، تغییر تم فوری و بدون animation است.
- Theme reveal هیچ Schema، Persistence contract یا dependency جدیدی اضافه نمی‌کند و ThemeRuntime همچنان منبع اعمال tokenهای Accent/Surface و favicon پویاست.


## R7 — Gate hardening after visual polish

- Route transition از translate+opacity به opacity-only تغییر کرد تا wrapper متحرک برای action barهای `position: fixed` یک containing block محلی نسازد؛ این همان رگرسیونی بود که در Employee mobile smoke باعث می‌شد نوار ویرایش completed day چند هزار پیکسل پایین‌تر از viewport گزارش شود.
- English Reports در Production smoke دیگر به `Page.loadEventFired` شکننده متکی نیست و بعد از `Page.navigate` مستقیماً readiness واقعی Route و محتوای localized را بررسی می‌کند.
- Theme reveal، route-aware skeletonها و alignment سه کارت Month بدون تغییر باقی مانده‌اند. Schema همچنان v19 و dependency جدید همچنان صفر است.

### R8 — پایداری Browser Smoke گزارش‌ها

- بررسی English Reports به‌جای navigation کامل صفحه، از لینک واقعی داخل اپ استفاده می‌کند تا همان مسیر SPA/Route Guard محصول تست شود.
- قرارداد route و قرارداد محتوای Reports جدا شده‌اند؛ محتوای نمودارها فرصت بیشتری برای mount شدن دارد بدون اینکه خطای route پنهان شود.
- هیچ تغییری در Product UI، schema یا dependency ایجاد نشده است.

## Revision 9 — Dev console hygiene

- فایل قدیمی `public/manifest.webmanifest` به فهرست `clean:obsolete` اضافه شد تا با مسیر canonical `app/manifest.ts` در Next.js تداخل نکند.
- `predev` قبل از `next dev` همین cleanup را اجرا می‌کند، در حالی که قرارداد تاریخی `dev = next dev` بدون تغییر باقی مانده است.
- چون ریشه‌ی `<html>` عمداً `scroll-smooth` دارد، `data-scroll-behavior="smooth"` اضافه شد تا Next.js 16 هنگام route navigation مدیریت scroll را بدون warning انجام دهد.
- این Revision هیچ تغییر Schema، dependency یا رفتار دامنه‌ای ندارد.

