# Phase 189A — Calendar UX Polish + Weekly Accuracy

این زیر‌فاز بعد از Phase 188، ایرادهای Visual QA واقعی Google Calendar و صفحه «ماه من» را می‌بندد؛ Phase 189 اصلی برای تقسیم Settings به routeهای مستقل همچنان جدا باقی می‌ماند.

## اصلاح‌های اصلی

- نمودار «کارکرد هفتگی» دیگر همه شنبه/یکشنبه‌های ماه را با هم جمع نمی‌کند. نمودار دقیقاً هفت روزِ شامل `selectedDate` را نشان می‌دهد تا عدد Tooltip با همان خانه روز در تقویم یکی باشد.
- وضعیت تعطیلی و مرخصی همان هفته کنار نمودار علامت می‌خورد و Tooltip تاریخ/تعطیلی را نشان می‌دهد. Google Holiday همچنان فقط context است و Source of Truth تعطیلات ساعت‌یار را تغییر نمی‌دهد.
- لوگوی ساعت‌یار به Header موبایل بازگشت بدون حذف Workspace/Privacy/Language/Theme/Profile controls.
- Modal ساخت/ویرایش Event به Header و Footer ثابت و Body اسکرولی تبدیل شد تا اکشن اصلی همیشه در viewport بماند.
- ردیف «ارسال به‌روزرسانی برای مهمانان» و Source Listهای Settings با `!flex` از قرارداد global label-grid جدا شدند تا RTL/LTR alignment نشکند.
- Event card حذف مستقیمِ امن با Confirmation دارد و دیگر برای حذف لازم نیست ابتدا وارد Edit شد.
- Create/Edit/Delete موفق و خطای Google Calendar از Toast مشترک اپ بازخورد می‌گیرند.
- کاربرِ متصل‌نشده در «ماه من» CTA اتصال Google Calendar می‌بیند؛ کاربران بدون Google همچنان Month کامل و مستقل دارند.
- کنار جدول رکوردهای ماه Quick Create برای روز انتخاب‌شده اضافه شد تا برای ساخت Event نیاز به اسکرول به Agenda نباشد.
- کارت Google Calendar در Settings از نظر alignment و action grouping پالیش شد.

## قرارداد داده و امنیت

- Development AppData: Schema v19
- Released 2.4.0: Schema v17
- Schema bump: ندارد
- Dependency جدید: ندارد
- Access Token: memory-only
- Google Event / Google Holiday: هیچ اثر خودکاری بر WorkRecord، حقوق، کسری/اضافه‌کار یا Holiday domain ساعت‌یار ندارد.

## Quality

- Contract test جدید: `tests/phase189-calendar-ux-polish.test.ts`
- Full Gate هدف: 835/835
- Visual QA الزامی: Month desktop/mobile، Event create/edit/delete modal، Google Settings، FA/EN، RTL/LTR، light/dark.
