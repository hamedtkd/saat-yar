# فاز ۱۴۲ — تکمیل Transition روز کارمند و Browser Journey

وضعیت: تکمیل سورس

AppData Schema: v17

Migration: ندارد

Dependency جدید: ندارد

## مسئله واقعی کشف‌شده در فاز ۱۴۱

اجرای Windows نشان داد مسیر کارمند تا Start، Lunch و Break درست پیش می‌رود، اما پس از «پایان روز» CTA «ویرایش این روز» ظاهر نمی‌شود. علت Harness نبود: `CompletedDayEditor` از ابتدای روز با `editing=true` mount می‌شد و هنگام اضافه‌شدن `record.end` همان instance باقی می‌ماند؛ در نتیجه state ویرایش از حالت Active به Completed منتقل می‌شد و UI به‌جای حالت قفل‌شده و CTA ویرایش، وارد حالت Draft می‌ماند.

## اصلاح محصول

`TodayPage` اکنون کلید `CompletedDayEditor` را از دو بخش می‌سازد:

```text
<selectedDate>:active
<selectedDate>:completed
```

بنابراین تغییر واقعی روز از Active به Completed فقط همان ویرایشگر را remount می‌کند. در mount جدید، `completed=true` و مقدار اولیه `editing=false` است؛ پس رکورد کامل‌شده read-only می‌شود و CTA صریح «ویرایش این روز» نمایش داده می‌شود. تغییر یادداشت، ناهار، وقفه یا سایر داده‌های همان وضعیت باعث remount نمی‌شود.

## Browser Smoke

Employee smoke بعد از کلیک «پایان روز» فقط به متن success اکتفا نمی‌کند؛ منتظر می‌ماند CTA فعال «ویرایش این روز» واقعاً در DOM حاضر شود و سپس وارد Draft تاریخی می‌شود. این انتظار هم race احتمالی UI را حذف می‌کند و هم regression همین transition را مستقیم آشکار می‌سازد.

## سازگاری

- Schema همان v17 است.
- Migration ندارد.
- Dependency جدید ندارد.
- قرارداد قدیمی Phase 66 برای reset شدن editor با تغییر تاریخ به کلید جدید Active/Completed به‌روزرسانی شد.
- Release Candidate 2.3.0 تا سبزشدن کامل Employee Browser Gate به فاز ۱۴۳ منتقل شد؛ Final Release به فاز ۱۴۴.
