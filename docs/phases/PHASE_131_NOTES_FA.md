# فاز ۱۳۱ — تعمیم ساخت آیتم وابسته

## هدف

بستن دو شکست Theme Compliance فاز ۱۳۰ و تعمیم الگوی Quick Create به فرم‌هایی که کاربر برای ادامه کار واقعاً باید Client/Project انتخاب کند.

## تغییرات

- Toast دیگر از `text-white` یا `text-black` ثابت استفاده نمی‌کند و Icon toneها نیز semantic token هستند.
- Invoice می‌تواند Client جدید را داخل همان فرم بسازد و انتخاب کند.
- بعد از انتخاب Client، Invoice می‌تواند Project مرتبط جدید بسازد و همان Project را خودکار انتخاب کند.
- Live Timer در صفحه امروز Client و Project را مستقل و بدون انتخاب تصادفی اولین Project مدیریت می‌کند.
- Manual Time Entry همان Quick Create مشتری/پروژه را دارد.
- `QuickProjectDialog` نتیجه ساخت را از طریق `onCreated` به فرم مالک برمی‌گرداند.

## درباره Expense

Expense فعلی فقط داخل Project Detail ساخته می‌شود و `projectId` از Context همان صفحه می‌آید. افزودن Project selector یا Quick Project داخل همان فرم، مسیر موجود را پیچیده و مبهم می‌کرد؛ بنابراین عمداً selector تکراری اضافه نشده است. الگوی Quick Create فقط در فرم‌هایی استفاده می‌شود که رابطه باید توسط کاربر انتخاب شود.

## قرارداد داده

Schema همچنان v17 است. Migration، Backup contract و Dependency جدیدی اضافه نشده است.
