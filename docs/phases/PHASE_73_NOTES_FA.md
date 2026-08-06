# فاز ۷۳ — پایداری Runtime و رفع شکست Quality Gate

## هدف

رفع خطاهای TypeScript فاز ۷۲ و حذف چرخه بازثبت Draft که در Production می‌توانست به خطای React 185 و صفحه خطای Vercel منجر شود.

## تغییرات

- بازنویسی جمع‌آوری سلامت داده با آرایه صریح `DataHealthItem[]` برای جلوگیری از استنتاج ناسازگار `flatMap`.
- اصلاح Fixture تست با نام واقعی `lunchPaid` و مقدار خالی `end` مطابق قرارداد `WorkRecord`.
- پایدارسازی callbackهای ذخیره و انصراف ویرایش تاریخی با `useCallback`.
- جلوگیری از انتشار غیرضروری رجیستری هنگام حذف Draft غیرکثیف؛ این کار چرخه Provider → cleanup → emit → Provider را قطع می‌کند.

## تشخیص خطای Vercel

هشدار Node.js خطای Build نیست؛ مقدار `engines.node = 22.x` عمداً تنظیم Project Settings را override می‌کند. خطای اصلی در مرورگر، React 185 یا Maximum update depth exceeded بود.
