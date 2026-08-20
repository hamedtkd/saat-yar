# Phase 200 — Final QA Matrix

این چک‌لیست آخرین مرز قبل از Phase 201 / Release Candidate است. در این مرحله Feature جدید اضافه نمی‌شود.

## Automated gate

```powershell
npm install
npm run check:quality
npm run check:release:audit
npm run test:browser:production:built
npm run test:browser:freelancer:built
npm run test:browser:employee:built
npm run test:browser:pairing
npm run audit:vercel
git diff --check
git diff -- package-lock.json
git status
```

پس از تثبیت Phase 200، معادل تجمیعی برای RC:

```powershell
npm run check:release:full
```

## Visual matrix

- Viewport: 320 / 360 / 375 / 425 / Desktop.
- Locale: Persian RTL / English LTR.
- Appearance: Light / Dark و حداقل accent پیش‌فرض + accent سفارشی بنفش.
- Employee Today: Start/Activity/Lunch/Break/Stop، edit history و no horizontal overflow.
- Freelancer Today: Start/Pause/Reload/Resume/Finish، Timeline و pickerها.
- Hybrid Today: هر دو context کاری و فریلنسری بدون project leakage.
- Work Calendar: Calendar/Heatmap/Recent/Intelligence/Google Calendar controls.
- Settings: Profile/Work/Appearance/Data/Sync/Notifications/Privacy/Integrations.
- Help/About/Privacy/Terms/Footer/Header/Mobile bottom navigation.

## PWA / offline

- Install identity: `Saatyar | ساعت یار` و compact launcher label `Saatyar`.
- Manifest و Service Worker بعد از update نسخه cache قدیمی را نگه ندارند.
- Offline reload بعد از یک بار load آنلاین کار کند.
- Favicon/brand داخل runtime از accent فعال پیروی کند؛ launcher icon ثابت بودن identity نصب را حفظ کند.

## Data safety

- Migration از released schema v17 تا v21.
- Backup export/import round-trip روی workProjects و Activity title.
- Device Transfer merge با keep-local و incoming additions.
- Replace/Merge فقط بعد از preview صریح کاربر.
- هیچ تغییر Schema یا dependency در Phase 200 R5 مجاز نیست مگر برای blocker release و با migration/test مستقل.

## Exit criteria

Phase 200 فقط وقتی بسته است که Automated Gate و Visual QA هر دو سبز باشند. بعد از آن Scope Freeze فعال است و Phase 201 فقط Release Candidate 2.6.0 را بسته‌بندی می‌کند.
