# فاز ۱۴۸ — Lint Contract Hotfix پیش از Release Candidate 2.3.0

## مسئله واقعی

فاز ۱۴۷ در سیستم Windows کاربر پیش از اجرای Test/Build/Browser Gate در ESLint متوقف شد:

```text
components/pages/today/time-strip/use-time-strip-actions.ts
11:39 warning 'record' is defined but never used @typescript-eslint/no-unused-vars
ESLint found too many warnings (maximum: 0).
```

علت این بود که بعد از انتقال ویرایش Break/Lunch به functional patch، هوک `useTimeStripActions` دیگر از `record` استفاده نمی‌کرد اما آن را همچنان در signature دریافت می‌کرد.

## اصلاح

- `ActionProps` فقط `updateRecord` را نگه می‌دارد.
- `useTimeStripActions` فقط همان dependency واقعی را destructure می‌کند.
- `AdvancedEditor` هوک را با `{ updateRecord: props.updateRecord }` فراخوانی می‌کند؛ `record` همچنان بدون تغییر برای `LunchEditor` و `BreaksEditor` استفاده می‌شود.
- تست فاز ۱۴۷ از شماره ثابت RC جدا شد تا Hotfixهای بین Gate باعث stale contract نشوند.
- تست فاز ۱۴۸ این قرارداد حداقلی و Roadmap جدید را قفل می‌کند.

## قرارداد انتشار

- Schema: v17
- Migration: ندارد
- Dependency جدید: ندارد
- تغییر UI/Product behavior: ندارد
- RC نسخه 2.3.0 فقط بعد از سبزشدن کامل `npm run check:release` شروع می‌شود.
