# فاز ۱۵۰ — Scope دقیق Selectorهای زمان در Employee Browser Journey

## مسئله

فاز ۱۴۹ برای اولین بار قبل از Clock-out وضعیت واقعی IndexedDB را گزارش کرد و مشخص شد مشکل از موتور محاسبه یا Persistence عمومی نیست. Snapshot واقعی این وضعیت را داشت:

- `start = 08:00`
- `lunchStart = 15:00`
- `lunchEnd = 15:15`
- Break واقعی هنوز زمان لحظه‌ای ساخته‌شده توسط Quick Control را داشت.

یعنی Browser Smoke هنگام تلاش برای ویرایش «وقفه‌ها»، فیلدهای «ناهار» را تغییر می‌داد.

## ریشه

تابع `setSectionTimeValue` اولین `<section>`ای را انتخاب می‌کرد که در هر عمقی یک `<strong>` با عنوان موردنظر داشت. چون Time Strip یک Section والد دارد که Sectionهای «ناهار» و «وقفه‌ها» داخل آن هستند، جست‌وجوی «وقفه‌ها» می‌توانست Section والد را برگرداند. سپس اولین Label با عنوان «شروع» یا «پایان» در آن والد، متعلق به ناهار بود.

همین Scope اشتباه در `assertFirstBreakEditorContract` باعث می‌شد Contract ظاهری نیز با ترکیب ساعت‌های ناهار و Checkbox وقفه به‌اشتباه سبز شود.

## اصلاح

Selector اکنون ابتدا Heading دقیق را پیدا می‌کند و مالک مستقیم آن را می‌گیرد:

```js
const heading = [...document.querySelectorAll("strong")]
  .find((item) => norm(item.textContent) === sectionTitle);
const section = heading?.closest("section") || null;
```

بنابراین «ناهار» فقط در Section ناهار و «وقفه‌ها» فقط در Section وقفه ویرایش و بررسی می‌شوند. Persistence Probe فاز ۱۴۹ بدون تضعیف باقی مانده و همچنان قبل از Clock-out باید جدایی واقعی `12:00–12:30` و Break بدون حقوق `15:00–15:15` را در IndexedDB اثبات کند.

## قرارداد انتشار

- Schema: v17، بدون تغییر
- Migration: ندارد
- Dependency جدید: ندارد
- Product UI: بدون تغییر
- Release Candidate 2.3.0 فقط بعد از سبزشدن کامل Employee Browser Journey شروع می‌شود.
