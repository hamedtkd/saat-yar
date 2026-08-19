## Phase 200 R3 — Work Calendar naming + gate compatibility

- «ماه من» در UI به **«تقویم کاری»** و در English به **`Work Calendar`** تغییر کرد؛ route `/month` برای compatibility ثابت ماند.
- Navigation، page metadata، Help، Google Calendar copy، multi-tab status، PWA shortcut و browser smoke با نام جدید همگام شدند.
- Manifest دوباره `name: PWA_APP_NAME` را مستقیماً نگه می‌دارد و قراردادهای تاریخی Phase 105/177 با PWA identity دوزبانه فعلی reconcile شدند.
- AppData v21، dependencyها و package-lock بدون تغییرند.

## Phase 200 R1 — Release hardening polish

- PWA install identity به `Saatyar | ساعت یار` ارتقا یافت و short name برای launcher روی `Saatyar` فشرده ماند.
- نمایش تاریخ بلند در فارسی و انگلیسی از ترتیب مستقل و طبیعی هر زبان پیروی می‌کند؛ override تقویم باعث مخلوط‌شدن زبان‌ها نمی‌شود.
- runtime favicon/brand theming به helper تست‌پذیر منتقل شد و از accent فعال پیروی می‌کند؛ icon نصب‌شده PWA برای حفظ identity ثابت می‌ماند.
- AppData v21، dependencyها و package version در این hardening checkpoint تغییر نکردند.

- Phase 199 R11: marker معنایی عنوان Activity زنده برای Employee Browser Smoke بعد از refactor بصری Running panel بازگردانده شد؛ بدون تغییر UI، Timer، Schema v21، dependency یا lockfile.
- Phase 199 R8: Footer GitHub CTA بدون dependency جدید با GitHub mark داخلی compile-safe شد؛ لینک‌های About/Help/Privacy/Terms و responsive polish R7 حفظ شدند.
- Phase 199 R5 — Compact Active Activity + Duration Order: حالت Running دوباره داخل همان shell فشرده فرم شروع فعالیت قرار گرفت؛ نوع فعالیت، عنوان کار و پروژه به داده‌های read-only تبدیل می‌شوند و FlipClock موجود همراه دکمه پایان در همان ناحیه اکشن قرار می‌گیرد. در مودال ویرایش مدت نیز ساعت همیشه سمت چپ و دقیقه همیشه سمت راست است، درحالی‌که labelها RTL/LTR و ورودی عددی LTR باقی می‌مانند. Schema همچنان v21 و dependency/lockfile بدون تغییر است.
- Phase 199 R4 — Live Activity polish: Duration editor برای RTL/LTR ترتیب منطقی ساعت/دقیقه را با NumberField عددی LTR حفظ می‌کند؛ Timer فعالیت جاری با FlipClock compact هم‌خط، unit label و live-state مبتنی بر accent نمایش داده می‌شود و Category/Recent cards geometry منظم‌تری دارند. Schema همچنان v21 و dependency/lockfile بدون تغییر است.
- Phase 199 R3 — Activity UX polish: Live Employee/Hybrid activity با FlipClock کوچک boxed و accent live-state نمایش داده می‌شود؛ Work Item/Project labels هم‌تراز و inline-optional شدند و Recent activity امکان ویرایش صرفاً مدت‌زمان و حذف Segment کامل‌شده را دارد، بدون ویرایش مستقیم Start/End یا تغییر Schema v21.
- Phase 199 R2 — Employee Activity Context: پروژه‌های کاری Employee/Hybrid داخل `workProjects` از پروژه‌های مشتریان Freelancer جدا شدند؛ ساخت پروژه کاری از همان فرم Today ممکن است، Hybrid می‌تواند context کاری یا فریلنسری را انتخاب کند و alignment نوع فعالیت/عنوان کار/پروژه یکپارچه شد. عنوان اختیاری کار، Recent suggestion و Event→Activity title همچنان روی AppData v21 و بدون Task Manager مستقل باقی می‌مانند.
- Phase 198.1 R17 — Tiny Mobile 320px Hardening: مسیرهای Today اختصاصی Freelancer/Employee تا عرض 320px بدون overflow افقی فشرده شدند؛ FlipClock، Header، Bottom Nav، Activity Details، Summary/Timeline، Date/Time Picker و loading skeletonها density اختصاصی <=359px دارند و Browser Smoke مستقیم 320×800 اضافه شده است؛ بدون Schema/dependency/lockfile change.
- Phase 198.1 R15 — Freelancer Browser Input Fidelity Hotfix: رفع warning صفر-تحمل ESLint و یکپارچه‌سازی focus + native value setter برای controlled fieldهای Expense/Invoice تا Browser Smoke پس از Timer flow به race بین focus و rerender حساس نباشد؛ بدون تغییر Product/Schema/dependency/lockfile.
- Phase 198.1 R11: Gate hotfix برای React purity، dependency پایدار recovery hook و پاک‌سازی خودکار analog-clock قدیمی؛ mode-specific Today routes بدون تغییر باقی می‌مانند.
# فهرست قابلیت‌های نسخه بعدی ساعت‌یار — منبع Release/LinkedIn

این سند برای جمع‌کردن قابلیت‌های پس از 2.4.0 است تا هنگام Release Notes، پست LinkedIn، README و معرفی محصول چیزی جا نماند.

## تکمیل‌شده

- Phase 181 — Onboarding & First-run UX: Fast Setup، Skip، Apply برنامه به روزهای فعال و CTA شروع واضح.
- Phase 182 — Flexible Work Mode & Activity Segments: هدف مستقل، ساعت کاری منعطف، Segmentهای فعالیت و Breakdown گزارش.
- Phase 183 — Notification Intelligence: Quiet Hours، Snooze و چند Reminder سفارشی بر اساس Active Work Time.
- Phase 184 — Privacy-safe Product Analytics: Consent محلی، taxonomy امن و provider اختیاری بدون ارسال محتوای کاری.
- Phase 185 — Activity Graph & Month Intelligence: Heatmap، streak، Recent 7 Days، overtime/deficit intelligence.
- Phase 186 — Motion & Perceived Performance: route-aware skeleton، motion امن، reduced-motion و radial theme transition.
- Phase 187 — Google Calendar Read Integration: OAuth browser token، انتخاب Calendar و نمایش رویداد در Today/Month.
- Phase 188 — Google Calendar Write + Unified Month UX: Create/Edit/Delete Event، Modal مشترک، recurring delete، Google layer روی ماه من، Settings compact و sortable Month records table.
- Phase 189A — Calendar UX Polish & Weekly Accuracy: نمودار هفتگی واقعیِ همان هفته، Holiday/Leave context، لوگوی موبایل، Modal با Header/Footer ثابت، Toast CRUD، Quick Delete، CTA اتصال و Quick Create نزدیک جدول.
- Phase 189B — Settings IA + Calendar Day Quick Actions: Settings چندصفحه‌ای، Search/Deep-link route-aware، Context Menu هر روز در Month، Event CRUD سریع و Holiday/Workday override از خود تقویم.
- Phase 189C — Payroll Rate Basis & Standard Monthly Hours: اصلاح نرخ غیرواقعی اضافه‌کاری روش ماهانه، مبنای استاندارد ماه با پیش‌فرض ۲۲۰ ساعت قابل تنظیم، حالت اختیاری ساعات موظفی بازه و Live Preview نرخ ساعتی.
- Phase 190 — Calendar Intelligence: Full/Incremental Sync با syncToken و fallback 410، ETag conflict protection، duplicate/overlap intelligence، Day/Week planner، Event → Activity صریح و recurring occurrence/series editing ایمن.
- Phase 191 — Payroll & Reports Hardening: Payroll Period Facts مشترک، جلوگیری از masking کسری توسط تعطیل‌کاری، Paid Leave consistency و Rate Summary واحد برای base/overtime/holiday/deficit.
- Phase 192 — Behavioral Test Modernization: قرارداد pure برای Report Summary، تست رفتاری مشترک Reports/Payroll Preview و audit خودکار برای جلوگیری از رشد source/regex coupling در تست‌های جدید.

## Release 2.5.0

- Phase 193 — Release Candidate 2.5.0: بسته‌بندی فازهای 181–192، migration audit از v17 تا v20، manifest/notes دو‌زبانه و Release Matrix روی Candidate `d81e094` با 874/874 تست.
- Phase 194 — Finalization/Release: Final source با هدف 880/880؛ rollout فقط با ترتیب merge کنترل‌شده به `main` → deploy → `audit:production` → tag annotated `v2.5.0`.

## پیام‌های مهم برای معرفی نسخه

- Local-first بودن داده‌های کاری حفظ شده است.
- Google Calendar اختیاری است؛ کاربران بدون Google هیچ workflow اضافه‌ای نمی‌بینند.
- Google Event به‌صورت خودکار کارکرد یا حقوق تولید نمی‌کند.
- حریم خصوصی و least-privilege OAuth جزو قرارداد محصول است.


## پس از Release 2.5.0 — Trust & Measurement

- Phase 199 R7 — Employee Today + Shell Polish: scroll داخلی تاریخچه Activity بدون truncation، ویرایش مستقیم ورود/خروج/ناهار/وقفه از جدول، هم‌ترازی نهایی Timer/CTA، Help alignment، Footer کامل با About/Privacy/Terms و CTA ستاره GitHub، و Header موبایل compact؛ بدون تغییر Schema v21 یا dependency.

- Phase 199 R6 — Running Activity Final Polish: status زنده با logical direction در RTL راست/LTR چپ، FlipClock تأییدشده بدون تغییر اندازه، و جداسازی CTA پایان فعالیت از Timer با ستون و divider منطقی؛ بدون تغییر Schema/dependency.

- Phase 199 R2 — Employee Activity Context: نوع فعالیت = نحوه کار، عنوان = کاری که انجام می‌شود، پروژه = context اختیاری. AppData v21 علاوه بر `ActivitySegment.title?`، مجموعه مستقل `workProjects` و `workProjectId?` را برای فضای Employee/Hybrid نگه می‌دارد؛ `projectId?` فقط context فریلنسری Hybrid است و Task entity/priority/due-date/kanban ایجاد نمی‌شود.

- Phase 195 — OAuth Verification Readiness + GA4 Analytics: صفحات عمومی About/Help/Privacy/Terms، disclosure Google Calendar و GA4 privacy-safe.
- Phase 196 — GA4 Runtime + Leave Intelligence Hardening: ارسال واقعی GA4، opt-out محلی، Leave credit در Month/Recent 7 Days و اصلاح RTL نمودار هفتگی.
- Phase 197 — Tooltip System + Production Observability: Tooltip مشترک portal-safe/viewport-aware و گسترش remote production audit به routeهای عمومی جدید.
- Phase 198 — Onboarding + Freelancer Workflow Redesign: بازطراحی First-run، نرخ پروژه ساعتی/روزانه با نمایش مبلغ خوانا، و Project Timer واحد برای فضای Freelancer.
- Phase 198.1 R2 — Today Timer Stabilization: بستن i18n/type regressionهای R1، ساعت محلی زنده با Runtime Clock مشترک، حذف CTA تکراری Freelancer و بازگردانی Browser Smoke قرارداد Heatmap Tooltip.
- Phase 198.1 R3 — Date/Time Picker Foundation: یک Surface مشترک source-owned برای Date/Time Picker با breakpoint برابر 800px؛ Popover متصل به فیلد در Desktop و Bottom Drawer در Mobile، بدون dependency/runtime جدید و بدون تغییر AppData.
- Phase 198.1 R4 — Picker Gate Contract Hotfix: هم‌راستا کردن دو تست تاریخی Accessibility/Theme با owner جدید قراردادهای modal/overlay در ResponsivePickerSurface؛ بدون تغییر Product code، Schema، dependency یا lockfile.
- Phase 198.1 R5 - Timer + Wheel DateTime Visual QA Redesign: stable ready/running Freelancer timer composition aligned to the approved reference, source-owned analog clock, wheel-based hour/minute selection, and replacement of the final native datetime editor with the shared responsive DateTimePicker; no schema/dependency/lockfile change.
- Phase 198.1 R6 — Freelancer Work Session Controller: حذف ساعت عقربه‌ای/ساعت محلی از Hero، stateهای صریح Start/Pause/Resume/Finish با pause خارج از work duration، Activity Details مرجع‌محور، Today summary/timeline/7-day trend واقعی، DateTimePicker portaled و viewport-safe، و mouse-drag واقعی برای Time Wheel؛ بدون migration یا dependency جدید.

- Phase 198.1 R14 — Resume Timer Clock Hotfix: حفظ Runtime Clock مشترک در طول Pause و استفاده از `segmentStartedAt` session به‌عنوان مرجع segment جاری تا Pause/Hard Reload/Resume بدون reset یا freeze elapsed ادامه پیدا کند؛ بدون Schema/dependency/lockfile change.
- Phase 198.1 R16 — Localized Browser Input Fidelity: Browser gate ارقام فارسی/عربی NumberField را با مقدار عددی لاتین تزریق‌شده به‌صورت semantic مقایسه می‌کند، در حالی که متن عادی و مقدار عددی متفاوت همچنان fail می‌شوند؛ بدون تغییر Product/Schema/Dependency/Lockfile.

## Backlog پس از Phase 198

- Analytics Dashboard & Product Insights پیشرفته فعلاً ضروری نیست؛ GA4 فعلی برای فهم usage کلی کاربران کافی است و طراحی funnel/custom dimensions به backlog منتقل شد.
- Phase 198.1 R7 — Timeline + Timer Readability QA: ویرایش تاریخ/زمان پایان برای رکوردهای تکمیل‌شده، سقف ارتفاع Timeline با scroll داخلی، جلوگیری از CTA «شروع» متداخل در Recent Projects هنگام session فعال/paused، Timer display باکس‌دار و compact، و نمودار ۷روزه خواناتر با bar/day labels و Tooltip توضیحی؛ بدون تغییر Schema/dependency/lockfile.
- Phase 198.1 R8 — Reference-aligned Timer Polish: تایمر سه‌کاشی مستقل ساعت/دقیقه/ثانیه، یکپارچه‌سازی Hero و Today Summary داخل یک Controller Card با radius/padding اصلاح‌شده، انتقال نمودار ۷روزه به زبان بصری Bar Chart صفحه Month و بازطراحی shrink-safe وضعیت Recent Projects؛ بدون تغییر Schema/dependency/lockfile.
- Phase 198.1 R9 — Mobile Density Follow-up: کاهش visual weight و padding تایمر در موبایل؛ checkpoint بصری و نه commit baseline.
- Phase 198.1 R10 — Workspace-specific Today + Compact Flip Timer: مسیرهای مستقل `/employee/today`، `/freelancer/today` و `/hybrid/today` با loading/skeleton route-aware، حفظ `/today` به‌عنوان compatibility entry با redirect داخلی به route همان workspace، و استفاده از FlipClock موجود پروژه با digit box کوچک برای Project Timer؛ بدون Schema/dependency/lockfile جدید.
- Phase 198.1 R12 — Full Test Gate Contract Hotfix: هم‌راستا کردن قراردادهای تاریخی Today/Unsaved Navigation/Employee Hard Reload با routeهای workspace-specific، رفع Node alias failure در Time Picker helper و حفظ صریح ownership guard روی چهار mutation واقعی Project Timer؛ بدون Schema/dependency/lockfile change.

- Phase 198.1 R13 — Freelancer Reload Ownership Hotfix: آزادسازی lock خود تب روی pagehide و ارزیابی مجدد روی pageshow تا Pause/Hard Reload/Resume بدون takeover اشتباه کار کند؛ قفل واقعی تب دیگر همچنان محافظت می‌شود.

- Phase 199 R9: Footer GitHub star count با cache/offline fallback و حذف outline ناخواسته‌ی `#main-content` روی tap موبایل؛ بدون تغییر schema/dependency.
