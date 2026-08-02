# مشارکت در ساعت‌یار

از مشارکت شما استقبال می‌کنیم. هدف پروژه، یک کدبیس قابل فهم، تست‌پذیر و مناسب
استفاده واقعی کاربران فارسی‌زبان است.

## راه‌اندازی

```bash
git clone <repository-url>
cd saatyar-worklog
npm ci
npm run dev
```

## قبل از شروع تغییر

1. برای تغییر بزرگ ابتدا Issue باز کنید و مسئله، UX و Migration احتمالی را توضیح دهید.
2. تغییر را کوچک و متمرکز نگه دارید.
3. منطق دامنه را در `lib/` و رابط را در `components/` نگه دارید.
4. برای اصلاح باگ، ابتدا یک تست بازتولیدکننده اضافه کنید.

## استاندارد کد

- TypeScript با حالت `strict` حفظ شود.
- از `any` بدون دلیل مستند استفاده نشود.
- کلاس‌های Tailwind کنار JSX و در همان Component نوشته شوند؛ Style Registry مرکزی نسازید.
- منطق محاسبات زمان و حقوق باید Pure و دارای تست باشد.
- داده‌های ذخیره‌شده بدون Migration سازگار شکسته نشوند.
- متن رابط فارسی، RTL و قابل استفاده با صفحه‌کلید باقی بماند.
- Secret، داده واقعی کاربر یا فایل Backup شخصی Commit نشود.

## بررسی پیش از Pull Request

```bash
npm run check
npm run build:pages
```

در Pull Request موارد زیر را بنویسید:

- مسئله‌ای که حل شده است
- تصمیم فنی و Trade-offها
- تست‌های اجراشده
- تصویر Desktop و Mobile برای تغییرات رابط
- اثر احتمالی روی داده‌های قبلی و Backup

## Commit

پیام Commit را روشن و امری بنویسید، برای مثال:

```text
fix: calculate daily salary from monthly salary
feat: allow editing lunch and break intervals
refactor: inline Tailwind classes in components
```
