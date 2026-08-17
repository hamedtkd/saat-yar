# Google OAuth Verification Kit — Saatyar

این راهنما برای Submit کردن نسخه Production ساعت‌یار به Google Auth Platform است.

## URLهای Production

- App homepage: `https://saat-yar.vercel.app/about/`
- Privacy Policy: `https://saat-yar.vercel.app/privacy/`
- Terms of Service: `https://saat-yar.vercel.app/terms/`
- Main app: `https://saat-yar.vercel.app/`

> برای کم‌کردن ریسک رد شدن Domain Ownership، دامنه اختصاصی که در Search Console مالکیتش را Verify کرده‌ای گزینه حرفه‌ای‌تر است. اگر با `vercel.app` ادامه می‌دهی، قبل از Submit مطمئن شو Google Search Console همان URL/domain مورد استفاده را قابل‌تأیید می‌داند.

## Scopeها

```text
https://www.googleapis.com/auth/calendar.calendarlist.readonly
https://www.googleapis.com/auth/calendar.events
```

## متن آماده Scope justification

این متن انگلیسی را در `How will the scopes be used?` قرار بده:

```text
Saatyar is a local-first work time and planning app. We use calendar.calendarlist.readonly only to list calendars the user can choose to display and synchronize; Saatyar never changes calendar-list membership. We use calendar.events for explicit user-facing calendar actions: viewing/syncing selected calendar events, creating, editing and deleting events, recurring-event operations, and conflict detection. A read-only event scope is not sufficient because users can create, update and delete events from Saatyar. Google Calendar data is used only for these visible features. OAuth access tokens stay in browser memory, sync cache stays on the device, and Google user data is not sold, used for advertising, or used for AI model training.
```

## Search Console / Domain verification

اگر Search Console روش HTML meta tag به تو داد، فقط مقدار `content` را در Vercel تنظیم کن:

```env
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=YOUR_SEARCH_CONSOLE_TOKEN
```

بعد Redeploy کن و در Search Console روی Verify بزن. اگر Google برای OAuth دامنه اختصاصی بخواهد، یک Custom Domain روی Vercel وصل کن و Homepage/Privacy/Terms/Authorized origin را به همان دامنه منتقل کن.

## Branding checklist

Google Auth Platform → Branding:

- App name: `Saatyar` یا `ساعت‌یار` مطابق همان نامی که در ویدیو و UI دیده می‌شود.
- User support email: ایمیل فعال خودت.
- Homepage: `/about/`
- Privacy Policy: `/privacy/`
- Terms: `/terms/`
- Authorized domain: دامنه Production.
- Developer contact: ایمیلی که مرتب چک می‌کنی.

## Demo video — سناریوی دقیق ضبط

ویدیو باید اجرای واقعی Production و OAuth واقعی را نشان دهد. زبان Consent Screen را قبل از ضبط روی English قرار بده.

1. `00:00–00:15` — باز کردن `/about/` و نشان دادن نام Saatyar، توضیح محصول، لینک Privacy و Terms.
2. `00:15–00:30` — باز کردن `/privacy/` و اسکرول به بخش Google Calendar؛ نشان دادن نحوه استفاده/نگه‌داری داده.
3. `00:30–00:45` — ورود به `Settings → Integrations` و کلیک روی Connect Google Calendar.
4. `00:45–01:10` — نمایش کامل OAuth Consent Screen با نام App و Scopeهای درخواستی. هیچ بخش Scope را از ویدیو cut نکن.
5. `01:10–01:30` — بعد از Allow، نمایش لیست Calendarها و انتخاب یک Calendar. این بخش مصرف `calendar.calendarlist.readonly` را اثبات می‌کند.
6. `01:30–02:20` — در Month/Calendar یک Event بساز، Edit کن و سپس Delete کن. اگر Recurring Event داری، occurrence/series flow را هم نشان بده. این بخش مصرف `calendar.events` را اثبات می‌کند.
7. `02:20–02:35` — Disconnect را اجرا کن و توضیح بده Token memory-only است و اتصال اختیاری است.

ویدیو را ترجیحاً به‌صورت YouTube Unlisted آپلود کن و لینک قابل‌مشاهده بدون درخواست Access را در Verification Center بده.

## قبل از Submit

- Production روی آخرین Commit deploy شده باشد.
- `/about/`, `/privacy/`, `/terms/` بدون login/onboarding قابل مشاهده باشند.
- Client ID Production origin را داشته باشد.
- Data Access دقیقاً Scopeهای بالا را نشان دهد.
- Consent Screen انگلیسی در Video کامل دیده شود.
- Scope justification با قابلیت‌هایی که در Video نشان داده می‌شود یکسان باشد.
