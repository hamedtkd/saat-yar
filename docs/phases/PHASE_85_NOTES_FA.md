# فاز ۸۵ — Audit خودکار قرارداد AppData

## مسئله

اضافه‌شدن `deletedRecords` در Schema نسخه ۱۶ نشان داد که تغییر یک فیلد سطح بالای `AppData` می‌تواند در Factory، Migration، Backup، Recovery یا تست‌های قدیمی فراموش شود. TypeScript بخشی از این اختلاف‌ها را پیدا می‌کند، اما نبود یک قرارداد اجرایی مشترک باعث می‌شد خطاها مرحله‌به‌مرحله ظاهر شوند.

همچنین تست قدیمی فاز ۶۹ هنوز ساختار پیام Sync قبل از اضافه‌شدن `changeKind` را انتظار داشت.

## تغییرات اصلی

- ایجاد `lib/data/app-data-contract.ts` به‌عنوان فهرست اجرایی Collectionهای اجباری `AppData`.
- تعریف Factoryهای مستقل برای مقدار اولیه تمام Collectionها.
- ساخت `APP_DATA_KEYS` و `APP_DATA_COLLECTION_KEYS` از قرارداد مرکزی.
- افزودن `assertCompleteAppData` برای تشخیص فیلدهای حذف‌شده و نوع نادرست Collectionها.
- بازنویسی `createCompleteAppData` بر پایه Defaultهای قرارداد مرکزی.
- افزودن فرمان `npm run audit:schema` به Quality Pipeline، قبل از Typecheck.
- Audit مسیرهای Factory، داده اولیه، Normalisation، Migration نسخه جاری و قبلی، Backup، Recovery، Snapshot و Merge.
- هماهنگ‌کردن تست فاز ۶۹ با فیلد `changeKind: "general"`.

## قرارداد آینده Schema

برای اضافه‌کردن Collection جدید به `AppData` باید Factory مربوط به آن نیز در `APP_DATA_COLLECTION_FACTORIES` اضافه شود. نوع Mapped این شیء باعث می‌شود TypeScript در صورت نبود کلید جدید خطا بدهد. Audit اجرایی نیز بررسی می‌کند خروجی همه مسیرهای ساخت و بازیابی داده، تمام کلیدهای قرارداد را داشته باشند.

## Quality Pipeline

ترتیب جدید بخش ابتدایی بررسی کیفیت:

```text
clean:obsolete
clean:docs
check:imports
audit:schema
typecheck
lint
test
```

فرمان مستقل:

```bash
npm run audit:schema
```

## Migration و Dependency

- نسخه Schema همچنان ۱۶ است.
- Migration جدیدی اضافه نشده است.
- Dependency جدیدی اضافه نشده است.
- ساختار IndexedDB و Backup تغییر نکرده است.

## تست‌ها

- فهرست کلیدهای قرارداد بدون تکرار و کامل است.
- Factoryهای Collection در هر اجرا آرایه و Object مستقل می‌سازند.
- داده ناقص با نام کلیدهای مفقود رد می‌شود.
- Factory و داده اولیه قرارداد Runtime را پاس می‌کنند.
- Quality Pipeline فرمان Audit را قبل از Typecheck اجرا می‌کند.
- تست پیام Sync ساختار فعلی شامل `changeKind` را بررسی می‌کند.

## پیام Commit پیشنهادی

```text
feat(data): audit AppData schema contracts
```
