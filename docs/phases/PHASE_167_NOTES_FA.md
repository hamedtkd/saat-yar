# فاز ۱۶۷ — Onboarding Recovery & Re-entry

## هدف

پایدارکردن Wizard مستقل `/onboarding` بعد از فاز ۱۶۶؛ کاربر نباید با Reload یا بستن ناگهانی مرورگر مرحله فعلی را از دست بدهد و کاربر Onboardشده نیز باید بتواند از Settings دوباره Wizard را اجرا کند، بدون اینکه داده‌های کاری موجود پاک یا Reset شوند.

## قرارداد Recovery

- Progress مرحله فعال خارج از `AppData` و با کلید Local-first مستقل نگه‌داری می‌شود.
- مقدار مرحله فقط بین ۱ تا ۴ معتبر است و مقدار خراب یا ناشناخته به مرحله پیش‌فرض امن ۱ (Welcome/Name) برمی‌گردد.
- تغییر مرحله همان لحظه Progress را ذخیره می‌کند.
- اگر مرورگر در مرحله ۳ بسته یا Reload شود، Boot بعدی همان مرحله ۳ را نمایش می‌دهد.
- با پایان موفق آنبوردینگ، Progress موقت پاک می‌شود.

این Progress عمداً بخشی از Backup دامنه کاربر نیست؛ یک وضعیت UI/session است و Schema داده را تغییر نمی‌دهد.

## اجرای دوباره از Settings

در بخش «عمومی و ظاهر» کارت جدید «راه‌اندازی اولیه» اضافه شده است. دکمه «اجرای دوباره راه‌اندازی» یک Session صریح Re-entry می‌سازد و کاربر را به `/onboarding` می‌برد.

در Re-entry:

- Wizard از مرحله ۱ شروع می‌شود.
- پروژه‌ها، رکوردهای زمانی، مرخصی‌ها، فاکتورها، مشتری‌ها و داده‌های مالی Reset نمی‌شوند.
- تغییرات تنظیمات Wizard روی همان تنظیمات Local-first فعلی اعمال می‌شوند.
- اگر مرورگر بسته شود، Session و مرحله فعال باقی می‌مانند و Route Guard ادامه Wizard را باز می‌کند.
- «بازگشت به تنظیمات» Session موقت را می‌بندد و کاربر را به `settings#settings-onboarding` برمی‌گرداند.
- مرحله آخر در Re-entry با «ذخیره و بازگشت» بسته می‌شود.

## Route Guard

Route Guard اکنون علاوه بر `settings.onboarded` وجود Session فعال Re-entry را نیز بررسی می‌کند:

- کاربر جدید: همیشه تا پایان راه‌اندازی به `/onboarding` هدایت می‌شود.
- کاربر Onboardشده بدون Re-entry: ورود مستقیم به `/onboarding` همچنان به Workspace برمی‌گردد.
- کاربر Onboardشده با Re-entry فعال: تا پایان یا خروج صریح، Session آنبوردینگ بازیابی می‌شود.

## Browser Gate

Production Browser Smoke پس از رسیدن به مرحله «برنامه کاری» یک Reload واقعی اجرا می‌کند و قبل از ادامه، وجود دوباره `data-onboarding-step-index="3"` را تأیید می‌کند. این تست Recovery را روی Static Export واقعی پوشش می‌دهد.

## داده و سازگاری

- Package: `2.3.2`
- AppData schema: `v17`
- Migration: ندارد
- Dependency جدید: ندارد
- Tag `v2.3.2`: تاریخی و immutable؛ این فاز آن را تغییر نمی‌دهد.

## Revision 2

- خطای ESLint `react-hooks/set-state-in-effect` در `use-onboarding-session` با تبدیل Local Storage به External Store مبتنی بر `useSyncExternalStore` رفع شد؛ Recovery بدون SetState هم‌زمان داخل Effect انجام می‌شود.
- `DEFAULT_ONBOARDING_STEP` از ۲ به ۱ اصلاح شد تا کاربر جدید واقعاً از صفحه Welcome و دریافت نام شروع کند.
- Scope این Revision عمداً مرخصی/حقوق/تم را تغییر نمی‌دهد؛ این موارد در فازهای مستقل بعدی آمده‌اند.

## Revision 3

- Browser Smoke با شروع صحیح Wizard از مرحله ۱ همگام شد؛ Gate قبلی هنوز مرحله ۲ را به عنوان اولین سطح انتظار داشت و با وجود سالم بودن `/onboarding` Timeout می‌کرد.
- Smoke اکنون نام کاربر تست را با setter بومی React/InputEvent وارد می‌کند، سپس مرحله نوع استفاده را می‌بیند و بعد به مرحله برنامه کاری می‌رود.
- منطق Runtime، Session Recovery، Schema و داده‌های کاربر تغییری نکرده‌اند.

## Revision 4

- Browser Smoke در CDP دیگر نتیجه خام predicate را با `returnByValue` serialize نمی‌کند؛ `waitFor` هر predicate (شامل DOM node یا Promise) را پس از `await` به Boolean تبدیل می‌کند.
- این اصلاح خطای Harness با پیام `Object reference chain is too long` را حذف می‌کند؛ خطا از تلاش CDP برای serialize کردن `HTMLInputElement` مرحله ۱ بود، نه از Runtime محصول.
- هیچ تغییری در UI، Session Recovery، Schema یا داده کاربر ایجاد نشده است.

## Revision 5

- Production Browser Smoke در Revision 4 سبز شد، اما Freelancer Smoke هنوز قبل از Seed کردن Fixture منتظر متن قدیمی مرحله ۲ (`ساعت‌یار را برای خودت تنظیم کن`) می‌ماند و روی Welcome/Name مرحله ۱ Timeout می‌کرد. Employee Smoke همان قرارداد قدیمی را داشت و در ادامه Gate به همان Fail می‌رسید.
- هر دو Workflow Smoke اکنون بدون وابستگی به Copy فارسی، Route مستقل `/onboarding` و marker ساختاری `data-onboarding-step-index="1"` را صبر می‌کنند و سپس Fixture مربوط به freelancer/employee را در IndexedDB Seed می‌کنند.
- تست Phase 167 این قرارداد را برای هر دو Harness قفل می‌کند تا متن قدیمی مرحله ۲ دوباره برنگردد.
- Runtime محصول، Recovery/Re-entry، Schema و داده کاربر تغییر نکرده‌اند.

## ادامه مسیر

- فاز ۱۶۸: اصلاح قرارداد مرخصی استحقاقی و حذف سهمیه اشتباه ۴۲ ساعت؛ مبنای استاندارد ماهانه `۷:۲۰ × ۲۶ ÷ ۱۲`.
- فاز ۱۶۹: تکمیل Onboarding با نام، حقوق دلخواه و انتخاب Theme/Appearance.
- فاز ۱۷۰: Import Wizard با Preview/Validation برای Backup و CSV.
- فاز ۱۷۱: شخصی‌سازی مراحل Onboarding بر اساس Employee/Freelancer/Hybrid.

## Gate مورد انتظار

این فاز ۶ تست جدید اضافه می‌کند. Baseline فاز ۱۶۶ برابر ۶۴۵ تست است، بنابراین انتظار:

```text
tests 651
pass 651
fail 0
```
