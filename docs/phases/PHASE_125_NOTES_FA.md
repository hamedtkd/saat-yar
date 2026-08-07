# فاز ۱۲۵ — پالیش کنترل‌های Header و هویت Profile

## هدف

یکدست‌کردن اندازه و فرم کنترل‌های Header بعد از فاز ۱۲۱ و تبدیل Profile Trigger به یک نقطه ورود واضح‌تر و حرفه‌ای‌تر، بدون تغییر Schema یا منطق داده.

## تغییرات

- قرارداد بصری مشترک برای کنترل‌های Header با ارتفاع ۴۴px، Radius یکسان، Border/Surface و Focus state مشترک اضافه شد.
- Workspace Switcher دیگر یک Wrapper جدا با ارتفاع متفاوت ندارد و خود `SelectTrigger` کنترل اصلی است.
- گروه Privacy/Theme با همان ارتفاع خارجی Header و دکمه‌های داخلی ۳۶px یکدست شد.
- Profile Trigger با Avatar دایره‌ای، نشان Local/Ready و اندازه Responsive بازطراحی شد.
- کارت بالای Profile Menu Avatar بزرگ‌تر و هویت Local-first واضح‌تری دارد.
- لوگوی Sidebar با `GuardedLink` به `/today` متصل شد تا با رعایت Unsaved Navigation Guard به صفحه اصلی برگردد.
- قرارداد Responsive فاز ۱۰۲ برای عرض جدید Workspace Trigger به‌روزرسانی شد.

## داده و سازگاری

- AppData Schema همچنان v17 است.
- Migration یا Dependency جدیدی اضافه نشده است.
- منطق Mode، Theme، Privacy و Profile Settings تغییر نکرده است.
