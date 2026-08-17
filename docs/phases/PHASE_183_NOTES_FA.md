# فاز ۱۸۳ — Notification Intelligence

این فاز سیستم اعلان ساعت‌یار را از چند Reminder ساده به یک لایه هوشمند مبتنی بر **Active Work Time** ارتقا می‌دهد.

Baseline این فاز Commit `37223f5` فاز ۱۸۲ روی شاخه `dev` است.

## هدف

- هیچ Reminder کاری نباید زمان ناهار یا Break را به‌عنوان کار فعال حساب کند.
- اعلان‌ها هنگام Pause نباید مزاحم کاربر شوند.
- کاربر باید بتواند Quiet hours داشته باشد.
- کاربر باید بتواند همه Reminderها را برای یک بازه کوتاه Snooze کند و بعد دوباره فعالشان کند.
- تا پنج Reminder سفارشی مستقل و تکرارشونده بر اساس Active Work Time در دسترس باشد.
- ناوبری Settings در موبایل نباید بخش بزرگی از viewport را اشغال کند.

## قرارداد داده

AppData در توسعه از **Schema v18** به **Schema v19** ارتقا یافت.

Migration `v18 -> v19` فقط تنظیمات Notification Intelligence را اضافه می‌کند:

- `quietHours`
- `customReminders[]` (حداکثر ۵ Rule مستقل)
- `snoozeMinutes`

Release منتشرشده `v2.4.0` همچنان تاریخی و immutable روی Schema v17 باقی می‌ماند.

## رفتار Reminderها

`lib/notification-reminders.ts` اکنون تصمیم Reminder را به‌صورت pure و قابل تست محاسبه می‌کند.

Active Work Time:

- Lunch باز یا بسته از زمان فعال کم می‌شود.
- Break باز یا بسته از زمان فعال کم می‌شود.
- هنگام Lunch/Break باز، Reminderهای کاری متوقف می‌شوند.
- Daily target notification بر اساس Active Work Time محاسبه می‌شود، نه credited time.

## Quiet hours

کاربر می‌تواند بازه سکوت را فعال کند. بازه‌های عادی و عبوری از نیمه‌شب پشتیبانی می‌شوند، برای مثال `22:00 -> 07:00`.

در Quiet hours هیچ Reminder کاری ارسال نمی‌شود.

## Snooze

Snooze عمومی با یک timestamp Local-first در `localStorage` نگه‌داری می‌شود و با Reload از بین نمی‌رود. کاربر می‌تواند مدت پیش‌فرض Snooze را بین ۵ تا ۲۴۰ دقیقه تنظیم و هر زمان Resume کند.

Snooze قدیمی Break تا پایان روز برای سازگاری حفظ شده است.

## Custom reminders

کاربر می‌تواند تا پنج Reminder شخصی مستقل بسازد. هر Rule شامل این موارد است:

- فاصله بر حسب Active Work Minutes
- عنوان
- متن

هر Reminder سفارشی فقط هنگام Tracking واقعی و خارج از Lunch/Break، Quiet hours و Snooze اجرا می‌شود. Bucket و dedupe هر Rule با `id` خودش مستقل است.

برای داده‌های موقت R1 همین فاز که با Schema v19 و `customReminder` ذخیره شده باشند، Normalizer بدون bump جدید Schema آن Rule را به `customReminders[]` تبدیل می‌کند.

## UI

Settings > Notifications and reminders شامل این بخش‌های جدید است:

- Quiet hours
- Custom active-work reminders با Add/Edit/Disable/Delete و سقف ۵ Rule
- Default snooze duration
- Snooze reminders / Resume reminders
- توضیح شفاف Active-work intelligence

همه متن‌ها از Catalog دو زبانه استفاده می‌کنند و UI باید در فارسی RTL و English LTR بررسی شود.

در موبایل، Navigator قبلی دوطبقه Settings حذف شده و یک Trigger فشرده برای Section جاری نمایش داده می‌شود. با لمس آن، Dialog گروه‌بندی‌شده همه مقصدهای Settings را نشان می‌دهد. Quick chips جست‌وجو نیز در موبایل مخفی هستند تا chrome بالای صفحه حداقل شود.

## تست

۸ Contract در `tests/phase183-notification-intelligence.test.ts` نگه‌داری می‌شود؛ دو Contract R2 برای Multi Reminder و Compact Mobile Settings Navigation اضافه شده‌اند.

هدف Full Gate فاز ۱۸۳:

- `790/790`
- Schema audit روی v19
- i18n closure سبز
- TypeScript و ESLint سبز
- Static build سبز
- Browser smokeهای موجود بدون Regression

## Visual QA

به‌دلیل تغییر Settings UI، قبل از Commit باید این حالت‌ها بررسی شوند:

- Desktop / Mobile
- Persian RTL / English LTR
- Light / Dark
- Quiet hours خاموش و روشن
- چند Custom reminder با Add/Edit/Disable/Delete
- Snooze و Resume
- Settings mobile picker فشرده، Dialog داخل viewport و عدم horizontal overflow
