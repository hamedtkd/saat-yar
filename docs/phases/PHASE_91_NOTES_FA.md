# فاز ۹۱ — Alert Dialog رسمی shadcn/Radix

## هدف

جایگزینی پیاده‌سازی دستی Alert Dialog با Primitive رسمی Radix در قالب کامپوننت قابل‌سفارشی‌سازی shadcn، بدون تغییر API مصرف‌کننده‌های فعلی.

## تغییرات

- افزودن وابستگی `@radix-ui/react-alert-dialog`.
- بازنویسی `components/ui/alert-dialog.tsx` بر پایه Root، Trigger، Portal، Overlay، Content، Title، Description، Cancel و Action رسمی Radix.
- حذف Context دستی، Clone کردن Trigger، Listener دستی Escape و Overlay قابل‌کلیک.
- واگذاری Focus trap، انتقال Focus اولیه به Cancel، جلوگیری از تعامل با پشت Dialog و بازگرداندن Focus به Radix.
- حفظ RTL، توکن‌های تم، ظاهر دکمه‌ها و API کنترل‌شده `open/onOpenChange`.
- هماهنگ‌کردن تست قدیمی فاز ۶۱ با قرارداد رسمی جدید.

## نصب

این فاز Dependency جدید دارد. پس از جایگزینی سورس اجرا شود:

```bash
npm install
npm run check:quality
```

## داده و Migration

- نسخه Schema بدون تغییر: ۱۶
- Migration داده ندارد.
- ساختار Backup و IndexedDB تغییر نکرده است.
