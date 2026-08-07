# فاز ۱۴۰ — همگام‌سازی Browser Smoke با قرارداد واقعی Persistence

## شکست واقعی فاز ۱۳۹

اجرای Windows فاز ۱۳۹ تمام ۵۲۱ تست، TypeScript، ESLint، Build و Production/PWA Smoke را پاس کرد. Freelancer Browser UX Smoke نیز مسیر واقعی Client → Project → Timer → Expense → Invoice را کامل کرد، اما در مرحله تأیید دوام IndexedDB timeout شد.

UI فاکتور نهایی را نمایش می‌داد؛ بنابراین مسئله در persistence probe بررسی شد، نه در فرم‌ها.

## ریشه مشکل

Persistence واقعی ساعت‌یار از `AppDataStorageAdapter` استفاده می‌کند و پس از اولین save مقدار Store را به شکل snapshot envelope ذخیره می‌کند:

```text
{
  format: "saatyar-app-data",
  schemaVersion: 17,
  savedAt: "...",
  data: { ...AppData }
}
```

Smoke قدیمی مستقیماً `stored.projects` و collectionهای root را بررسی می‌کرد. این فقط با seed خام اولیه سازگار بود و بعد از autosave دیگر قرارداد واقعی Store را نمی‌خواند.

همچنین Invoice فعلی از `lines` استفاده می‌کند، اما probe هنوز نام قدیمی `items` را بررسی می‌کرد. در نتیجه حتی یک Invoice کاملاً ذخیره‌شده نیز هرگز ready نمی‌شد.

## تغییرات

- persistence probe به فایل مستقل و قابل‌تست `scripts/freelancer-persistence-expression.mjs` منتقل شد.
- probe هم snapshot envelope فعلی و هم raw payload قدیمی seed را می‌خواند.
- بررسی Invoice از `items` قدیمی به `lines` فعلی تغییر کرد.
- به‌جای boolean مبهم، probe وضعیت Client، Project، Time Entry، Expense و Invoice، تعداد collectionها، shape ذخیره و schema version را برمی‌گرداند.
- timeout جدید آخرین probe را گزارش می‌دهد تا collection ناقص دقیقاً مشخص باشد.
- پس از تأیید IndexedDB، یک Hard Reload واقعی `/invoices` انجام می‌شود و وجود Invoice persist‌شده در UI دوباره بررسی می‌شود.

## قرارداد داده

- AppData Schema: v17
- snapshot envelope: `saatyar-app-data`
- Migration جدید: ندارد
- Dependency جدید: ندارد
- تغییر Product UI: ندارد
- تغییر Persisted Data: ندارد

## انتظار از Gate

Freelancer Browser UX Smoke باید پس از ساخت Invoice، snapshot v17 را در IndexedDB تأیید کند، سپس Hard Reload را انجام دهد و Invoice را از داده persist‌شده دوباره در UI ببیند. اولین شکست بعد از این نقطه باید مربوط به Mobile Dialog یا یک ایراد واقعی Product باشد، نه shape اشتباه test harness.
