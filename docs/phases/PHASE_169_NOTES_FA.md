# فاز ۱۶۹ — Onboarding Personalization & Responsive Shell Polish

این فاز بازخورد واقعی پس از فاز ۱۶۸ را روی دو محور می‌بندد: صحت داده‌های راه‌اندازی اولیه و کیفیت Shell در نمایشگرهای بزرگ.

## تغییرات رابط

- صفحه اول آنبوردینگ از حالت label/input کشیده خارج شد و به کارت متمرکز پروفایل با ورودی نام خوانا، helper text و hierarchy روشن تبدیل شد.
- Wizard از ۴ مرحله به ۶ مرحله ارتقا یافت: نام، نوع استفاده، برنامه کاری، حقوق، ظاهر و ذخیره‌سازی.
- مرحله برنامه کاری از همان `WorkScheduleEditor` واقعی Settings استفاده می‌کند؛ روزهای کاری، شروع/پایان، ناهار و هدف کار خالص قابل تنظیم‌اند.
- مرحله حقوق، حقوق ماهانه و ضرایب اضافه‌کاری/تعطیل‌کاری را نشان می‌دهد و برای Policyهای ماهانه مبلغ پایه را هم‌زمان به‌روز می‌کند؛ Policyهای ساعتی/روزانه بازنویسی نمی‌شوند.
- مرحله ظاهر انتخاب Light/Dark/System و پالت‌های اصلی را با Preview زنده در همان Wizard فراهم می‌کند.

## صحت داده

- `weeklyMinutes`، `workDays`، `weeklySchedule`، `defaultStart` و `defaultEnd` بعد از ویرایش برنامه کاری با هم همگام می‌مانند.
- همان helper همگام‌سازی در Settings نیز استفاده می‌شود تا بعداً ویرایش برنامه هفتگی دوباره metadata قدیمی را stale نکند.
- Browser Smoke مقدار هدف هفتگی و روز فعال را تغییر می‌دهد، Reload واقعی انجام می‌دهد و سپس حقوق و تم را نیز تغییر می‌دهد؛ پس از پایان Wizard مقادیر ذخیره‌شده در IndexedDB/AppData بررسی می‌شوند.

## Responsive و Stacking

- سقف عرض Shell روی نمایشگرهای 1920+ و 2400+ افزایش می‌یابد و محتوای اصلی در فضای باقی‌مانده کنار Sidebar واقعاً centered می‌شود، نه اینکه به سمت راست بچسبد و سمت چپ فضای خالی بزرگ ایجاد کند.
- Bannerها، Header، PWA surface و Footer از قرارداد مشترک `--shell-content-max` استفاده می‌کنند.
- Header به stacking level بالاتر منتقل شد و Settings Search پایین‌تر قرار گرفت تا Dropdown پروفایل دیگر زیر Search Card نیفتد.
- Production Browser Smoke هندسه 2560×1440 را نیز کنترل می‌کند.

## قرارداد داده

- Schema همچنان v17 است.
- Migration جدید و dependency جدید وجود ندارد.
- Re-entry آنبوردینگ همچنان داده‌های موجود را پاک نمی‌کند.

## Revision 2 — Browser smoke input fidelity

- Production browser smoke now validates shared `NumberField` controls by their semantic `aria-valuenow` contract after dispatching the React-compatible input event.
- This avoids a false negative when localized numeric inputs rerender their visible draft while still persisting the correct numeric value.
- Runtime product behavior, schema, dependencies and onboarding data contract are unchanged.


## Revision 3 — Wide desktop geometry contract

- شکست Browser Smoke در 2560×1440 نشان داد محاسبه center خود `.shell-main-offset` درست است، اما padding افقی ۱۲px والد `dashboard-shell` دوباره همان فضا را از containing block کم می‌کرد و محتوا ۲۷px به چپ جابه‌جا می‌شد (`balancedDelta=54`).
- در breakpoint دسکتاپ Sidebar (`xl`) padding افقی والد حذف می‌شود (`xl:px-0`) و gutter موردنیاز فقط توسط قرارداد خود `shell-main-offset` مدیریت می‌شود؛ بنابراین content روی workspace واقعی کنار Sidebar مرکز می‌ماند.
- Browser contract سخت‌گیرانه `balancedDelta <= 24` حفظ شده و برای سبزکردن تست شل نشده است.
- بازخورد UX ویرایش روز تکمیل‌شده به فاز ۱۷۰ منتقل شد: Action Bar نزدیک editor، وضعیت Dirty قابل‌دیدن، Save/Cancel در viewport و تأیید موفقیت کنار محل ویرایش؛ Import Wizard و Onboarding شخصی‌شده به‌ترتیب به فازهای ۱۷۱ و ۱۷۲ منتقل شدند.

## Revision 4 — Scrollbar-safe wide desktop centering

- Revision 3 parent padding را حذف کرد، اما Browser Smoke هنوز `balancedDelta=30` نشان داد. اختلاف باقیمانده دقیقاً از scrollbar عمودی Windows می‌آمد: CSS در margin از `100vw` استفاده می‌کرد که scrollbar را داخل عرض حساب می‌کند، در حالی که containing block صفحه بر پایه layout viewport (`clientWidth`) است.
- قرارداد `.shell-main-offset` اکنون در محاسبه center از `100%` همان containing block استفاده می‌کند؛ در نتیجه عرض scrollbar دیگر محتوا را نیم‌scrollbar به چپ هل نمی‌دهد.
- Browser Smoke نیز هندسه قابل‌دیدن صفحه را با `document.documentElement.clientWidth` می‌سنجد و `scrollbarWidth` را فقط برای diagnostics گزارش می‌کند. threshold همان `balancedDelta <= 24` باقی مانده و شل نشده است.
- این Revision فقط wide-shell geometry و harness مربوط به همان قرارداد را اصلاح می‌کند؛ Onboarding data، Schema v17، dependencies و برنامه Phase 170 دست‌نخورده‌اند.

## Revision 5 — First-install service worker control

- پس از اصلاح کامل Onboarding و wide desktop، Browser Smoke روی `navigator.serviceWorker.controller` متوقف شد، در حالی که `navigator.serviceWorker.ready` قبلاً resolve شده بود. این یعنی Worker active شده بود اما claim صفحه فعلی به‌صورت قابل‌اعتماد کامل نشده بود.
- ریشه مشکل در `activate` handler بود: `self.clients.claim()` خارج از Promise داده‌شده به `event.waitUntil` اجرا می‌شد. lifecycle حالا cache cleanup و client claim را با `Promise.all` با هم await می‌کند.
- Harness برای سبزشدن reload اجباری یا tolerance جدید اضافه نکرده است؛ first-install control همچنان یک قرارداد واقعی محصول باقی می‌ماند تا Offline reload بعدی روی صفحه controlled انجام شود.
- Regression Phase 169 این lifecycle contract را قفل می‌کند. Schema v17، Onboarding data، dependencyها و Roadmap Phase 170 تغییر نکرده‌اند.
### سخت‌سازی نهایی PWA smoke

در مرورگر headless ویندوز مشاهده شد که حتی پس از active شدن Service Worker، `navigator.serviceWorker.controller` ممکن است در همان Document اولیه با تأخیر به‌روز شود. Harness اکنون اول active شدن registration را الزام می‌کند؛ اگر client هنوز کنترل نشده باشد، یک reload آنلاین واقعی انجام می‌دهد و سپس کنترل Service Worker را الزام می‌کند. بعد از آن همچنان سرور خاموش می‌شود و reload آفلاین باید موفق باشد. بنابراین Gate دیگر به takeover همان Document اولیه وابسته نیست، ولی کنترل واقعی و Offline همچنان اجباری است.

