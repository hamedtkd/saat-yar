# فاز ۴۲ — تثبیت Lint و Effectها

## هدف

رفع خطای `react-hooks/set-state-in-effect` در ناوبری تنظیمات و هشدار `react-hooks/exhaustive-deps` در پوسته اصلی، بدون تغییر رفتار کاربر.

## تغییرات

- مقدار اولیه بخش فعال تنظیمات مستقیماً از Hash در initializer تابعی `useState` خوانده می‌شود.
- Effect تنظیمات فقط اسکرول اولیه را با `requestAnimationFrame` هماهنگ می‌کند و cleanup دارد.
- وابستگی‌های Effect پوسته از آبجکت بزرگ controller به مقادیر و callbackهای پایدار محدود شدند.
- تست regression برای هر دو قانون Lint اضافه شد.

## Migration

ندارد. نسخه Schema همچنان ۱۳ است.
