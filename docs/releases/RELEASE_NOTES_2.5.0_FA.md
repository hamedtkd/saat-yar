# یادداشت Release Candidate ساعت‌یار ۲.۵.۰

تاریخ Candidate: ۲۶ مرداد ۱۴۰۵ / 2026-08-17

ساعت‌یار ۲.۵.۰ تغییرات توسعه پس از ۲.۴.۰، یعنی فازهای ۱۸۱ تا ۱۹۲ را بسته‌بندی می‌کند. Baseline تأییدشده فاز ۱۹۲ روی `0c4c22e` با **۸۷۰/۸۷۰ تست** بسته شده است. فاز ۱۹۳ فقط Candidate را آماده می‌کند؛ Merge به `main`، Rollout Production، تاریخ Final Release و Tag annotated تا سبزشدن کامل Release Matrix همچنان Pending هستند.

## مهم‌ترین تغییرات

- First-run سریع‌تر با Fast Setup، Skip، اعمال یک روز کاری روی روزهای فعال و CTA واضح برای Employee/Freelancer/Hybrid.
- Flexible Daily Target و Activity Segment برای Deep Work، Meeting، Learning، Admin، Project و Other بدون الزام Start/End ثابت.
- Notification Intelligence با Quiet Hours، Snooze عمومی، چند Reminder بر اساس Active Work Time و محاسبه pause-aware.
- Product Analytics امن با Consent محلی مرورگر، Event taxonomy محدود و بدون ارسال محتوای کاری.
- Month Intelligence شامل Activity Heatmap شبیه GitHub، Streak، Recent Activity و توزیع Overtime/Deficit.
- Route transition و Loading Skeletonهای Route-aware با احترام صریح به Reduced Motion و بدون تغییر Domain state.
- Google Calendar اختیاری برای Read/Write با Scope حداقلی، Access Token فقط در حافظه، Preferenceهای Calendar محلی مرورگر و بدون تبدیل خودکار Event به کارکرد یا حقوق.
- Incremental Sync مبتنی بر `syncToken` با fallback امن 410، Cache مستقل از AppData، محافظت ETag/`If-Match` در برابر Stale Write، تشخیص Overlap/Duplicate، برنامه‌ریز Day/Week، Event → Activity صریح و ویرایش امن recurring occurrence/series.
- اصلاح مبنای نرخ حقوق ماهانه با «ماه استاندارد» قابل تنظیم و پیش‌فرض ۲۲۰ ساعت، همراه با گزینه صریح Period Target.
- Payroll Period Facts مشترک بین Reports و Payroll Preview تا Holiday Work کسری روز عادی را پنهان نکند، Paid Leave یکسان Credit شود و Base/Overtime/Holiday/Deficit از یک Engine بیایند.
- Modernization تست‌های رفتاری با Report Summary خالص و Audit مخزن که از Phase 192 به بعد ورود تست Product وابسته به Source/Regex را متوقف می‌کند.

## قرارداد داده و Migration

- Schema نسخه منتشرشده ۲.۴.۰: **v17** و تاریخی/immutable
- Schema Candidate ۲.۵.۰: **v20**
- زنجیره Migration تحت Audit: **v17 → v18 → v19 → v20**
- v18: Flexible Daily Target و Activity Segment.
- v19: Notification Intelligence؛ Analytics امن خارج از AppData باقی می‌ماند.
- v20: مبنای نرخ ساعتی Payroll و Standard Monthly Minutes.
- Metadata و Cache رویدادهای Google Calendar خارج از AppData و در Cache مستقل مرورگر می‌ماند؛ OAuth Access Token فقط در حافظه است.
- Phase 193 Dependency جدیدی اضافه نمی‌کند.

## Baseline Candidate

Commit فاز ۱۹۲ یعنی `0c4c22e` این Gateها را پاس کرده است:

```text
870 / 870 tests passed
TypeScript passed
ESLint passed
Next.js static build passed
Production browser smoke passed
Freelancer browser smoke passed
Employee browser smoke passed
WebRTC pairing smoke passed
Vercel static-export audit passed
Schema v20 audit passed
i18n closure audit passed
Test-coupling audit passed
```

فاز ۱۹۳ Contractهای Release Candidate را اضافه می‌کند و قبل از Commit باید به **874/874** تست Node برسد.

## مرز Rollout Candidate

این Final Release نیست. در فاز ۱۹۳:

- کار فقط روی `dev` می‌ماند؛
- `main` تغییر نمی‌کند؛
- `releaseDate` برابر `null` می‌ماند؛
- وضعیت Manifest برابر `release-candidate` می‌ماند؛
- Manifest هیچ Release Commit خودارجاعی ذخیره نمی‌کند؛
- Tag `v2.5.0` ساخته نمی‌شود.

یک فاز Finalization بعدی باید Candidate تأییدشده را به `main` منتقل کند، Deploy Production را انجام دهد، `npm run audit:production` را سبز کند و فقط بعد از آن Tag annotated `v2.5.0` را روی همان Commit نهایی بسازد.
