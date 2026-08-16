# Google Calendar Write Integration — Phase 188

## هدف

Phase 188 اتصال Phase 187 را از نمایش فقط‌خواندنی به مدیریت امن رویداد ارتقا می‌دهد، بدون اینکه Google Calendar به منبع حقیقت کارکرد، حضور، حقوق یا تعطیلات ساعت‌یار تبدیل شود.

## OAuth

Client ID عمومی از متغیر زیر می‌آید:

```env
NEXT_PUBLIC_GOOGLE_CALENDAR_CLIENT_ID=...
```

Client Secret در اپ مرورگر استفاده نمی‌شود.

Scopeهای فعال:

```text
https://www.googleapis.com/auth/calendar.calendarlist.readonly
https://www.googleapis.com/auth/calendar.events
```

Scope وسیع `https://www.googleapis.com/auth/calendar` عمداً درخواست نمی‌شود.

## مدل داده و حریم خصوصی

- Access Token فقط در RAM همان نشست مرورگر است.
- هیچ Access/Refresh Token داخل AppData، IndexedDB، Backup یا localStorage ذخیره نمی‌شود.
- فقط ID تقویم‌های انتخاب‌شده به‌عنوان preference مرورگر ذخیره می‌شود.
- Eventهای Google به WorkRecord، Activity Segment، حقوق یا مرخصی تبدیل نمی‌شوند مگر در فاز آینده با اقدام صریح کاربر.
- تعطیلات داخلی ساعت‌یار همچنان تنها Source of Truth برای محاسبات کاری هستند؛ Holiday calendarهای Google فقط Context بصری‌اند.

## UX نوشتن

- Today و Month یک Agenda مشترک دارند.
- روی تقویم‌های `writer/owner` دکمه «رویداد جدید» فعال می‌شود.
- Modal مشترک Create/Edit از DatePicker و TimePicker خود ساعت‌یار استفاده می‌کند.
- Create از تکرار ساده روزانه/هفتگی/ماهانه پشتیبانی می‌کند.
- Edit روی occurrence تکرارشونده فقط همان occurrence را تغییر می‌دهد.
- Delete برای recurring event انتخاب «همین رخداد» یا «کل سری» دارد.
- کاربر می‌تواند ارسال Update برای مهمانان را خاموش کند.

## ماه من

Google Calendar یک لایه اختیاری روی Calendar خود ساعت‌یار است؛ Route یا تقویم موازی جدید ساخته نمی‌شود.

- کاربر بدون Google همان تجربه قبلی را دارد.
- روزهای دارای Event شمارنده دارند.
- انتخاب روز Agenda همان روز را نشان می‌دهد.
- تعطیلات Google روی Target/Deficit/Payroll اثر ندارند.

## جدول رکوردهای ماه

- Sort بر اساس تاریخ، ورود، خروج، کارکرد، استراحت و تراز اضافه شد.
- Desktop header قابل کلیک و `aria-sort` دارد.
- ستون تاریخ هنگام Horizontal scroll sticky می‌ماند.
- Mobile یک Sort picker مستقل دارد و همان ترتیب Desktop را استفاده می‌کند.
