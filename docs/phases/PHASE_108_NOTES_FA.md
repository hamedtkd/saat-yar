# فاز ۱۰۸ — تجربه کامل PWA

## هدف

تکمیل تجربه نصب و به‌روزرسانی PWA بدون تغییر در مدل Local-first داده‌ها، Schema یا Backup.

## تغییرات

- دریافت رویداد `beforeinstallprompt` و نمایش CTA نصب داخل خود ساعت‌یار.
- تشخیص نصب موفق با `appinstalled` و مخفی‌کردن CTA نصب.
- راهنمای مستقل iPhone/iPad برای `Add to Home Screen` در مرورگرهایی که Install Prompt استاندارد ندارند.
- نمایش وضعیت آفلاین به‌صورت واضح بدون ادعای نادرست درباره آمادگی Service Worker.
- بررسی Update هنگام بازگشت تب به foreground یا برگشت اتصال اینترنت.
- نگه‌داشتن Service Worker جدید در حالت `waiting` تا کاربر صریحاً به‌روزرسانی را تأیید کند.
- فعال‌سازی نسخه جدید با پیام `SKIP_WAITING` و Reload فقط پس از `controllerchange`.
- عبور Update از `UnsavedNavigationProvider` تا Draftهای ذخیره‌نشده پیش از Reload محافظت شوند.
- افزایش نسخه Cache سرویس‌ورکر به v6 برای پاک‌سازی Cacheهای قدیمی.

## نکته معماری

این فاز Cloud Sync اضافه نمی‌کند. داده‌های برنامه همچنان در IndexedDB همان دستگاه می‌مانند. PWA فقط تجربه نصب، Offline shell و به‌روزرسانی امن را بهتر می‌کند.

## وضعیت داده

- AppData schema: v16
- Migration: ندارد
- Dependency جدید: ندارد
- Backup format: بدون تغییر
- IndexedDB structure: بدون تغییر

## تست

تست قراردادی `tests/phase108-pwa-experience.test.ts` موارد زیر را بررسی می‌کند:

- ثبت Install Prompt و Update detection
- جلوگیری از فعال‌سازی خودکار Service Worker جدید
- Offline / Install / iOS / Update UI
- محافظت از Draft هنگام Update
- بسته‌شدن آیتم PWA در بک‌لاگ
