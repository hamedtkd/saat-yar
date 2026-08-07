# فاز ۱۲۶ — پالیش Navigation موبایل و Settings

## هدف

رفع دو مشکل UX پس از فاز ۱۲۵: Active state نامشخص Bottom Navigation موبایل و ناقص‌بودن/ثابت‌ماندن Navigation داخلی Settings هنگام اسکرول.

## تغییرات

- underline باریک Active state در Bottom Navigation موبایل حذف شد و همه مقصدها، از جمله «بیشتر»، از یک Capsule یکسان و خواناتر استفاده می‌کنند.
- اندازه، Radius و فضای آیکن/Label در پنج سلول Bottom Navigation یکدست شد تا «بیشتر» از سایر مقصدها سنگین‌تر دیده نشود.
- مدل مقصدهای Settings به فایل مشترک `settings-navigation-model.ts` منتقل شد تا Search و Navigation یک Source of Truth داشته باشند.
- تمام کارت‌های مهم Settings در Navigation دیده می‌شوند؛ شامل Profile، Appearance، Data Health، Recycle Bin، Storage، Recovery، Backup، Restore، انتقال بین دستگاه‌ها، برنامه کاری، تعطیلات، Payroll، مزایا/کسورات، Notifications و Danger Zone.
- Active item تنظیمات با Scroll/Resize/Hash و `useSyncExternalStore` دنبال می‌شود؛ بدون بازگرداندن setState داخل Effect.
- Navigation تنظیمات در موبایل Sticky و افقی/قابل اسکرول است و در دسکتاپ با ارتفاع محدود خودش Scroll می‌شود.
- تست قدیمی Shell Density با abstraction جدید `header-control-styles.ts` هماهنگ شد و دیگر به رشته Tailwind منتقل‌شده در فایل HeaderActions وابسته نیست.

## داده و سازگاری

- AppData Schema همچنان v17 است.
- Migration و Dependency جدیدی اضافه نشده است.
- منطق Unsaved Navigation Guard، Search Deep Link و Hash navigation حفظ شده است.
