# مشارکت در ساعت‌یار

از مشارکت شما استقبال می‌کنیم. هدف پروژه، یک کدبیس قابل فهم، تست‌پذیر و مناسب استفاده واقعی کاربران فارسی‌زبان است.

راهنمای Agentها و چک‌لیست تغییرات حساس:

- [`AGENTS.md`](./AGENTS.md)
- [`docs/agents/AGENT_GUIDE_FA.md`](./docs/agents/AGENT_GUIDE_FA.md)
- [`docs/agents/AGENT_GUIDE_EN.md`](./docs/agents/AGENT_GUIDE_EN.md)
- [`docs/agents/CHANGE_CHECKLISTS.md`](./docs/agents/CHANGE_CHECKLISTS.md)

## راه‌اندازی

```bash
git clone https://github.com/hamedtkd/saat-yar.git
cd saat-yar
npm ci
npm run dev
```

## قبل از شروع تغییر

1. برای تغییر بزرگ ابتدا Issue باز کنید و مسئله، UX و Migration احتمالی را توضیح دهید.
2. `git status` را بررسی کنید و تغییرات موجود دیگران را بازنویسی نکنید.
3. تغییر را کوچک و متمرکز نگه دارید.
4. منطق دامنه را در `lib/` و رابط را در `components/` نگه دارید.
5. برای اصلاح باگ، ابتدا یک تست بازتولیدکننده یا قرارداد رفتاری روشن اضافه کنید.

## استاندارد کد

- TypeScript با حالت `strict` حفظ شود.
- از `any` بدون دلیل مستند استفاده نشود.
- کلاس‌های Tailwind کنار JSX و در همان Component نوشته شوند؛ Style Registry مرکزی نسازید.
- منطق محاسبات زمان و حقوق باید Pure و دارای تست باشد.
- داده‌های ذخیره‌شده بدون Migration سازگار شکسته نشوند.
- متن رابط فارسی، RTL و قابل استفاده با صفحه‌کلید باقی بماند.
- Secret، داده واقعی کاربر یا فایل Backup شخصی Commit نشود.
- تست‌های Source-based فقط برای قراردادهای معماری و مخزن استفاده شوند؛ رفتار محصول با تست رفتاری پوشش داده شود.

## تغییرات داده و Schema

در هر تغییری که روی `AppData`، Backup یا IndexedDB اثر دارد، چک‌لیست داده را کامل کنید. حداقل این مسیرها باید بررسی شوند:

- Schema version و Migration مرحله‌ای
- Factory و Normalization
- Backup و Restore round-trip
- Recovery، Snapshot و Merge
- داده قدیمی و کلیدهای ناشناخته
- تست Regression و `npm run audit:schema`

## بررسی پیش از Pull Request

```bash
npm run check:quality
npm run check:release
```

اگر `check:release` در محیط شما قابل اجرا نیست، دلیل دقیق و دستورهای جایگزین اجراشده را در Pull Request بنویسید. ادعای «تست پاس شد» بدون نام دستور و خروجی قابل قبول نیست.

در Pull Request موارد زیر را بنویسید:

- مسئله‌ای که حل شده است
- محدوده تغییر و مواردی که عمداً تغییر نکرده‌اند
- تصمیم فنی و Trade-offها
- تست‌های اجراشده و نتیجه آن‌ها
- تصویر Desktop و Mobile برای تغییرات رابط
- اثر احتمالی روی Schema، Migration، IndexedDB، Backup و Recovery
- ریسک Rollback و روش بازگشت

## Commit

پیام Commit را روشن و امری بنویسید، برای مثال:

```text
fix: calculate daily salary from monthly salary
feat: allow editing lunch and break intervals
refactor: inline Tailwind classes in components
```
