# فاز ۱۰۹ — PWA lint hotfix و زیرساخت رسانه نهایی

## هدف

این فاز ابتدا خطای `react-hooks/set-state-in-effect` فاز ۱۰۸ را می‌بندد و سپس مسیر تکرارپذیر تولید اسکرین‌شات و GIF پس از Design Freeze را اضافه می‌کند.

## اصلاح PWA

`PwaExperience` دیگر وضعیت‌های بیرونی مرورگر مانند `navigator.onLine`، standalone mode و install prompt را با `setState` هم‌زمان داخل Effect کپی نمی‌کند. این وضعیت‌ها از `useSyncExternalStore` خوانده می‌شوند و Effect فقط برای eventهای واقعی نصب و Update subscription ایجاد می‌کند.

## رسانه قابل بازتولید

دستور زیر Build تولیدی را اجرا می‌کند و سپس با Chrome/Edge/Chromium واقعی رسانه‌ها را می‌سازد:

```powershell
npm run media:capture
```

خروجی‌ها:

- `docs/assets/screenshots/onboarding.png`
- `docs/assets/screenshots/today-light-desktop.png`
- `docs/assets/screenshots/today-dark-desktop.png`
- `docs/assets/screenshots/today-mobile.png`
- `docs/assets/screenshots/reports-light.png`
- `docs/assets/screenshots/reports-dark.png`
- `docs/assets/screenshots/settings.png`
- `docs/assets/media/onboarding.gif` در صورت وجود `ffmpeg`

Capture از دیتای واقعی کاربر استفاده نمی‌کند. `scripts/media/demo-data.ts` یک Fixture نمایشی مستقل می‌سازد و Script آن را فقط داخل پروفایل موقت مرورگر در IndexedDB قرار می‌دهد.

تاریخ Capture عمداً روی یک زمان ثابت نگه داشته شده تا تصاویر README با اجرای مجدد بی‌دلیل تغییر نکنند.

## داده و Schema

- Schema: v16
- Migration جدید: ندارد
- Backup format: بدون تغییر
- IndexedDB production contract: بدون تغییر
- Dependency جدید: ندارد
