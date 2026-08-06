# فاز ۷۵ — سخت‌گیری قوانین React Hooks و تکمیل مسیر Quality Check

## هدف

رفع خطاهای ESLint جدید React 19/Next 16 بدون غیرفعال‌کردن Ruleها و بدون تغییر رفتار محصول.

## تغییرات

- به‌روزرسانی Refهای محافظ تاریخچه داخل `useEffect` به‌جای مرحله Render.
- جداکردن Propertyهای موردنیاز `CompletedDayEditor` برای Dependencyهای دقیق `useCallback`.
- جداکردن آزادسازی Lock خارجی از تغییر State در Hook مالکیت تایمر.
- وابسته‌کردن وضعیت `blocked` به فعال‌بودن تایمر تا در حالت غیرفعال مالک قبلی UI را مسدود نکند.
- افزودن Regression Test برای سه قرارداد بالا.

## Migration

ندارد. Schema همچنان نسخه ۱۵ است.
