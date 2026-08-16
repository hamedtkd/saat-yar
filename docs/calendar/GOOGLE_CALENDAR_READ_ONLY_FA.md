# راه‌اندازی Google Calendar فقط‌خواندنی

Phase 187 از Google Identity Services در مرورگر و Scope فقط‌خواندنی Calendar استفاده می‌کند. ساعت‌یار Client Secret یا Refresh Token سمت سرور ندارد.

## ۱. Google Cloud

1. یک Google Cloud Project بساز یا Project موجود را انتخاب کن.
2. Google Calendar API را برای Project فعال کن.
3. OAuth consent screen را برای نوع کاربر مناسب پروژه تنظیم کن.
4. یک OAuth Client از نوع **Web application / Web browser** بساز.
5. Authorized JavaScript Originها را اضافه کن. برای توسعه معمول ساعت‌یار حداقل:

```text
http://localhost:3000
```

اگر Dev روی Port دیگری اجرا می‌شود همان Origin دقیق، مثلاً `http://localhost:3001`، نیز باید در Google Cloud ثبت شود. Origin Production ساعت‌یار را هم جداگانه اضافه کن.

Client Secret ساخته‌شده برای این Browser integration استفاده نمی‌شود و نباید در `NEXT_PUBLIC_*` یا Repository قرار بگیرد.

## ۲. Environment

فقط Client ID عمومی را تنظیم کن:

```text
NEXT_PUBLIC_GOOGLE_CALENDAR_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

بعد Dev/Build را Restart کن.

## ۳. Scope

Scope ثابت Phase 187:

```text
https://www.googleapis.com/auth/calendar.readonly
```

این Scope برای خواندن Calendar List و Eventها استفاده می‌شود. Phase 187 هیچ Scope نوشتنی درخواست نمی‌کند.

## ۴. رفتار ساعت‌یار

- Google Identity Script تا قبل از کلیک کاربر روی اتصال Load نمی‌شود.
- Access Token فقط در حافظه Session است و با Reload از بین می‌رود؛ پس اتصال دوباره ممکن است لازم شود.
- فقط ID تقویم‌های انتخاب‌شده در Local Storage مرورگر ذخیره می‌شود.
- Eventها وارد AppData، IndexedDB یا Backup نمی‌شوند.
- Today و Month فقط Context تقویم را نشان می‌دهند و محاسبات کارکرد را تغییر نمی‌دهند.

## ۵. تست دستی

1. Settings → Google Calendar را باز کن.
2. Connect Google Calendar را بزن و Scope فقط‌خواندنی را تأیید کن.
3. یک یا چند Calendar را انتخاب کن.
4. Preview باید Eventهای نزدیک را نشان دهد.
5. Today باید Eventهای تاریخ انتخابی را نمایش دهد.
6. Month باید روی روزهای دارای Event شمارنده داشته باشد و Agenda روز انتخابی را نشان دهد.
7. Disconnect locally را بزن؛ Eventها باید فوراً از UI حذف شوند.
8. دوباره Connect کن؛ انتخاب Calendarهای قبلی باید از Preference محلی بازیابی شود.
9. Revoke Google access را تست کن؛ پس از آن دسترسی Google باید از سمت Provider نیز لغو شود.

## ۶. محدودیت این فاز

Phase 187 عمداً Write/Sync ندارد. Create/Edit/Delete، Two-way sync، `syncToken` پایدار و Conflict handling در Phase 188 بررسی می‌شوند.
