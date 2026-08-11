# یادداشت Release Candidate ساعت‌یار ۲.۴.۰

تاریخ Candidate: ۲۰ مرداد ۱۴۰۵ / 2026-08-11

نسخه ۲.۴.۰ اولین Minor Release پس از ۲.۳.۲ است و تغییرات فازهای ۱۶۶ تا ۱۷۸ را بسته‌بندی می‌کند. این فایل وضعیت **Release Candidate** را مستند می‌کند؛ انتشار Production و Tag نهایی هنوز انجام نشده‌اند.

## مهم‌ترین تغییرات

- آنبوردینگ به Route مستقل `/onboarding` منتقل شد، Recovery/Re-entry واقعی گرفت و بر اساس Employee/Freelancer/Hybrid شخصی شد.
- قرارداد مرخصی اصلاح شد تا سهمیه قانونی، روزهای کاری واقعی، تعطیلات و Carry-over به‌درستی از هم جدا شوند.
- ویرایش روز تکمیل‌شده Action Bar پایدار، Dirty state و بازخورد ذخیره نزدیک Editor دارد.
- Import Wizard برای Backup و CSV/TSV با Preview، Mapping، تاریخ شمسی/میلادی، اعداد فارسی و Conflict Strategy امن اضافه شد.
- Runtime Clock مشترک و کم‌مصرف برای تایمرهای زنده اضافه شد و در تب مخفی Tick اضافی ندارد.
- زیرساخت i18n کامل شد: فارسی RTL و انگلیسی LTR در Shell، Core، Business، Settings، Onboarding، Import، About و System/PWA surfaceها.
- CSV/Excel/Print، Validation/Toast، Runtime error bridge، عنوان Routeها و هندسه RTL/LTR با Locale فعال هماهنگ شدند.
- Audit سراسری `npm run audit:i18n` از ورود دوباره Hard-coded Persian UI خارج از Allowlist محدود جلوگیری می‌کند.
- تغییر سریع زبان با پرچم به‌صورت Responsive اضافه شد: در دسکتاپ داخل Utility سایدبار است و در تبلت/موبایل به کنترل فشرده Header تبدیل می‌شود تا Navigation و Alignment شلوغ یا شکسته نشوند.
- نمایش تقویم از زبان مستقل ولی Language-aware شد: حالت خودکار برای English تقویم میلادی و برای فارسی تقویم شمسی می‌آورد و در Settings می‌توان هر ترکیب را صریح Override کرد؛ کلیدهای تاریخ ذخیره‌شده تغییر نمی‌کنند.
- Dotهای وضعیت تقویم ماه Logical شدند تا در LTR روی عدد روز نیفتند و در RTL نیز سمت درست باقی بمانند.
- ریز محاسبه حقوق دیگر Label فارسی را از Domain engine نمی‌گیرد و با Key خنثی از Catalog Locale فعال ترجمه می‌شود.
- Encoder داخلی QR یک Entry Point امن ESM برای Browser گرفت و خطای Runtime صفحه Settings در Dev/Vite بدون Dependency جدید رفع شد.
- مسیر پیش‌فرض `npm run dev` به Next.js منتقل شد تا محیط توسعه محلی با مسیر Build تولیدی همسو باشد و خطای Dev-only مربوط به HMR/RSC در Vite/Vinext که در Visual QA ویندوز دیده شد مانع کار نشود؛ `npm run dev:vinext` همچنان صریحاً در دسترس است.
- توضیحات تکراری زیر عنوان Page و Section به Info Tooltip فشرده و قابل Focus منتقل شدند؛ Hintهای ضروری فرم، هشدارها و Empty Stateها برای حفظ Discoverability همچنان Inline مانده‌اند.
- بازه ورود/خروج در جزئیات ماه برای RTL/LTR به‌صورت Bidi-isolated رندر می‌شود و رکورد صفرطول مثل `۱۰:۳۲ تا ۱۰:۳۲` دیگر «کامل» محسوب نمی‌شود و نیازمند اصلاح است.
- پرچم ایران در کنترل زبان عمداً فقط سه نوار سبز/سفید/قرمز دارد و نشان مرکزی حذف شده است.
- تایمر زنده Today به Flip Clock هماهنگ با تم ارتقا یافت، بدون اینکه Interval مستقل جدیدی بسازد؛ Runtime Clock مشترک کم‌مصرف همچنان source of truth زمان است.
- ارقام فارسی UI و تایمر از build رسمی `Vazirmatn FD` در پکیج `vazirmatn@33.0.3` رندر می‌شوند؛ نیازی به تبدیل JavaScript ارقام نیست.
- کارت‌های ورود/خروج در Tablet/Desktop دوباره فضای کافی می‌گیرند و دیگر داخل یک ستون فشرده نمی‌شوند.
- Visibility مالی، تغییر زبان و Theme به‌عنوان Actionهای مستقل از یکدیگر جدا شدند؛ Mobile header برای حفظ همه کنترل‌ها در عرض کم، Route label و Workspace label را breakpoint-aware جمع می‌کند.
- Navigation موبایل Settings scrollbar قابل‌مشاهده ندارد و Groupها در عرض باریک به Grid دو ستونه تبدیل می‌شوند.
- Label «زبان و جهت» به «زبان» کوتاه شد؛ جهت همچنان خودکار از Locale می‌آید.

## قرارداد داده و وابستگی

- AppData Schema: **v17**
- Migration جدید: **ندارد**
- Dependency جدید در فاز Candidate: **`framer-motion@^12.42.2`** برای انیمیشن Digitهای Flip Clock
- فرمت Backup و مقادیر Domain/Storage برای i18n تغییر نکرده‌اند.
- Metadata و Manifest استاتیک در Candidate همچنان Canonical فارسی هستند؛ Runtime `lang/dir/title` از Locale کاربر پیروی می‌کند.

## شواهد Baseline

Baseline فاز ۱۷۸ روی Commit `887158c` این Gateها را پاس کرده است:

```text
758 / 758 tests passed
TypeScript passed
ESLint passed
Next.js production build: 22 / 22 routes
PWA precache: 44 build assets
Production browser smoke passed
Freelancer browser smoke passed
Employee browser smoke passed
WebRTC pairing: 4 encrypted chunks + ACK
Vercel static-export audit passed
i18n closure audit passed
```

فاز ۱۷۹ شش Contract Test مربوط به Candidate اضافه می‌کند؛ بنابراین Gate این فاز باید به **764/764** برسد. Gate هدف Finalization فاز ۱۸۰ برابر **770/770** است.

## Rollout

این Candidate فقط روی `dev` آماده می‌شود. در فاز ۱۷۹ Merge به `main`، Audit نهایی Production و Tag `v2.4.0` انجام نمی‌شوند. پس از Commit/Push و سبزشدن Gate، فاز ۱۸۰ Candidate Commit را ثبت می‌کند، rollout کنترل‌شده را انجام می‌دهد و فقط پس از `audit:production` سبز Tag annotated نهایی ساخته می‌شود.
