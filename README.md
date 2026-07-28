# ساعت‌یار

ساعت‌یار یک Time Tracker فارسی، RTL، Local-first و آفلاین برای کارمندان،
فریلنسرها و کاربران ترکیبی است. اطلاعات اصلی در IndexedDB همان مرورگر ذخیره
می‌شود و هیچ Backend، دیتابیس سروری، حساب کاربری، Secret یا ENV اجباری ندارد.

## امکانات نسخه نهایی

- راه‌اندازی چهارمرحله‌ای و انتخاب حالت کارمند، فریلنسر یا ترکیبی
- تغییر سریع فضای کار از نوار بالای همه صفحات، در کنار گزینه کامل تنظیمات
- ثبت شروع و پایان روز، خروج پیشنهادی، اضافه‌کاری، کسری، ناهار و وقفه
- بازیابی تایمرها پس از Refresh بر اساس Timestamp و جلوگیری از تایمر ناسازگار
- نمای «ماه من» با تقویم شمسی، نمودار سبک، جدول جزئیات و خروجی CSV
- مرخصی روزانه، نیم‌روز و ساعتی با کنترل هم‌پوشانی و سهمیه
- مشتری، پروژه، نرخ تاریخی، بودجه، تایمر پروژه و ورودی دستی
- گزارش زمان و درآمد، فیلتر، CSV، Excel و نمای مناسب چاپ
- IndexedDB ساخت‌یافته با Repository، Schema Version و مهاجرت نسخه قدیمی
- Backup/Restore نسخه‌بندی‌شده با اعتبارسنجی، Merge و Replace اتمیک
- نمایش مصرف فضا و درخواست Persistent Storage با اقدام صریح کاربر
- فونت فارسی Vazirmatn محلی و آفلاین، رابط RTL، اعداد فارسی و طراحی Responsive
- آماده انتشار Static روی GitHub Pages و Vercel

## شروع سریع

نیازمندی: Node.js نسخه `22.13` یا جدیدتر.

```bash
npm install
npm run dev
```

آدرس توسعه:

```text
http://localhost:5173
```

هیچ فایل `.env` و هیچ دیتابیس جداگانه‌ای لازم نیست.

## کنترل کیفیت

```bash
npm run typecheck
npm test
npm run lint
npm run build:pages
```

راهنمای دقیق اجرای Windows PowerShell، CMD، macOS، Linux، Docker،
GitHub Pages و Vercel در فایل زیر قرار دارد:

[RUN_AND_DEPLOY_FA.md](./RUN_AND_DEPLOY_FA.md)

## محل داده و حریم خصوصی

داده‌های ساخت‌یافته در IndexedDB مرورگر ذخیره می‌شوند. `localStorage` فقط برای
تشخیص مهاجرت نسخه قدیمی و تنظیمات بسیار کوچک استفاده می‌شود. اطلاعات برنامه
به سرور ارسال نمی‌شود. پاک‌کردن داده‌های مرورگر می‌تواند داده‌های محلی را حذف
کند؛ بنابراین از بخش «تنظیمات و داده‌ها» مرتب Backup JSON بگیرید.

## ساختار مهم

```text
app/
  page.tsx                 رابط و صفحات محصول
  storage.ts               Dexie، IndexedDB، Migration و Repositoryها
  backup-schema.ts         اعتبارسنجی Backup با Zod
  time-engine.ts           موتور مستقل محاسبات زمانی
  date-time-pickers.tsx    تاریخ شمسی و ساعت ۲۴ ساعته
  exporters.ts             CSV و Excel
public/
  manifest.webmanifest
  sw.js
tests/
  time-engine.test.ts
  backup-schema.test.ts
.github/workflows/
  deploy-pages.yml
```

## محدودیت آگاهانه

این نسخه بدون Backend طراحی شده است؛ بنابراین اطلاعات میان دستگاه‌ها یا
مرورگرهای مختلف همگام نمی‌شود. برای انتقال، از Backup/Restore استفاده کنید.
