# فاز ۱۲۲ — Hotfix قرارداد ناوبری پس از فاز ۱۲۱

فاز ۱۲۱ از نظر TypeScript، ESLint، Schema و ۴۳۳ تست سالم بود، اما دو تست قراردادی قدیمی Gate را قرمز کردند. این فاز هر دو مورد را بدون عقب‌گرد UX رفع می‌کند.

## تغییرها

- `SettingsNav` دیگر برای همگام‌سازی Hash داخل `useEffect`، `setState` اجرا نمی‌کند.
- Active section با `useSyncExternalStore` مستقیماً از `location.hash` و رویداد `hashchange` خوانده می‌شود.
- تغییر Anchor با `history.replaceState` همچنان History اضافه ایجاد نمی‌کند و پس از تغییر، Snapshot ناوبری به‌صورت صریح refresh می‌شود.
- تست قدیمی فاز ۴۲ از قرارداد `useState` به قرارداد معماری فعلی `useSyncExternalStore` منتقل شد.
- تست فاز ۶۲ اکنون Deep Link محافظت‌شده `/settings#...` را به‌جای مسیر منسوخ `/settings` بررسی می‌کند.
- تست قراردادی فاز ۱۲۲ اضافه شد تا این دو رگرسیون دوباره برنگردند.

## داده و انتشار

- AppData Schema بدون تغییر: v17
- Package بدون تغییر: 2.2.0
- Dependency جدید: ندارد
- Migration جدید: ندارد
