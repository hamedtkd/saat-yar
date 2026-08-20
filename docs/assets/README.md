# رسانه‌های محصول

همه تصاویر این پوشه از **Build واقعی ساعت‌یار** و Fixture نمایشی مستقل ساخته می‌شوند؛ هیچ داده واقعی کاربر خوانده نمی‌شود.

```bash
npm run media:capture
```

این دستور ابتدا `build:vercel` را اجرا می‌کند و سپس خروجی واقعی `out/` را در Chromium/Chrome/Edge باز می‌کند و رسانه‌ها را می‌سازد. اگر Build تازه از قبل وجود دارد:

```bash
npm run media:capture:built
```

خروجی‌های اصلی:

- `screenshots/onboarding.png`
- `screenshots/today-light-desktop.png`
- `screenshots/today-dark-desktop.png`
- `screenshots/today-mobile.png`
- `screenshots/work-calendar-light-desktop.png`
- `screenshots/work-calendar-dark-desktop.png`
- `screenshots/reports-light.png`
- `screenshots/reports-dark.png`
- `screenshots/settings.png`
- `media/onboarding.gif` در صورت نصب بودن `ffmpeg`

Frameهای میانی Onboarding فقط در پوشه موقت سیستم ساخته می‌شوند و حتی در صورت خطای Capture داخل repository باقی نمی‌مانند.

Capture با تم پیش‌فرض بنفش Release 2.6.0 انجام می‌شود و قبل از ثبت تصویر، دیتای Demo را در یک Browser Profile موقت Seed می‌کند.
