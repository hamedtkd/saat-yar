# فاز ۱۵۱ — Hard Reload یادداشت کارمند با Form Value واقعی

## مسئله

فاز ۱۵۰ مسیر واقعی کارمند را تا انتهای محاسبه، Month، Reports و Persistence کامل سبز کرد. شکست فقط بعد از Hard Reload موبایل رخ داد: Browser Smoke منتظر متن کامل یادداشت در `document.body.innerText` بود.

Snapshot IndexedDB قبل از Reload قبلاً قرارداد کامل را پاس کرده بود و صفحه Reloadشده نیز رکورد کامل، `08:00–17:00` و کارکرد `۸:۱۵` را نشان می‌داد. بنابراین مشکل از Persistence نبود.

## ریشه

یادداشت کارمند داخل یک `<textarea>` کنترل‌شده رندر می‌شود. مقدار یک Form Control در property `textarea.value` قرار دارد و جزو `body.innerText` نیست. پس این انتظار:

```js
document.body.innerText.includes(EMPLOYEE_NOTE)
```

می‌توانست با وجود Restore صحیح یادداشت تا Timeout ادامه پیدا کند.

## اصلاح

Hard Reload اکنون ابتدا با متن ساختاری «یادداشت روز کاری» آماده‌شدن صفحه را تشخیص می‌دهد، سپس hydration واقعی داده را از Form Control بررسی می‌کند:

```js
const note = document.querySelector('textarea[placeholder*="کارهای انجام‌شده"]');
note instanceof HTMLTextAreaElement && note.value === EMPLOYEE_NOTE
```

همان قرارداد در Mobile viewport نیز استفاده می‌شود. در کنار آن، وضعیت Completed و مقدار `۸:۱۵` همچنان باید در UI دیده شوند؛ Persistence Probe قبلی نیز بدون تغییر و بدون تضعیف باقی مانده است.

## قرارداد انتشار

- Schema: v17، بدون تغییر
- Migration: ندارد
- Dependency جدید: ندارد
- Product UI: بدون تغییر
- اصلاح فقط Browser Harness است.
- Release Candidate 2.3.0 به فاز ۱۵۲ منتقل می‌شود و فقط بعد از سبزشدن کامل Employee Browser Journey شروع خواهد شد.
