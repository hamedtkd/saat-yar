# فاز ۱۴۱ — Browser UX Journey حالت کارمند

وضعیت: تکمیل سورس

AppData Schema: v17

Migration: ندارد

Dependency جدید: ندارد

## هدف

همان سطح اطمینان Browser E2E که در فاز ۱۴۰ برای مسیر فریلنسر به دست آمد، برای حالت کارمند نیز وارد Release Gate شود؛ بدون Build دوباره و با استفاده از همان Static Export تولیدشده در `check:quality`.

## مسیر واقعی مرورگر

Smoke جدید روی خروجی Production این سناریو را اجرا می‌کند:

1. Seed حالت `employee` با برنامه کاری 08:00–17:00 و ناهار ۳۰ دقیقه.
2. شروع روز از CTA واقعی صفحه Today.
3. ثبت شروع و پایان ناهار از Quick Controls و نرمال‌سازی زمان به 12:00–12:30 از ویرایشگر داخلی.
4. ثبت وقفه واقعی و تنظیم بازه 15:00–15:15.
5. ثبت یادداشت روز کاری در Controlled Textarea.
6. پایان روز از CTA واقعی، ورود به Draft روز تکمیل‌شده و ذخیره خروج 17:00.
7. تأیید محاسبه خالص `۸:۱۵` برای 08:00–17:00 منهای ۳۰ دقیقه ناهار و ۱۵ دقیقه وقفه.
8. ناوبری واقعی App Router به «ماه من» و بررسی جزئیات روز.
9. ناوبری به «گزارش‌ها» و بررسی Summary حقوق و فیش تخمینی.
10. تأیید Snapshot واقعی IndexedDB و قرارداد دقیق رکورد روز.
11. Hard Reload روی Today و بررسی بازگشت رکورد، یادداشت و محاسبه.
12. اجرای قرارداد viewport موبایل 390×844 بدون Horizontal Overflow.

## Release Gate

ترتیب Gate اکنون:

```text
check:quality
→ check:release:audit
→ production/PWA browser smoke
→ freelancer browser UX smoke
→ employee browser UX smoke
```

هر دو Browser Journey از خروجی `out/` موجود استفاده می‌کنند و Build اضافی انجام نمی‌دهند.

## فایل‌های اصلی

- `scripts/employee-browser-ux-smoke.mjs`
- `scripts/employee-persistence-expression.mjs`
- `tests/phase141-employee-browser-ux.test.ts`
- `tests/phase99-release-readiness.test.ts`
- `tests/phase135-release-gate-contract.test.ts`
- `package.json`

## ادامه پیشنهادی

پس از سبزشدن این Gate روی Windows، فاز ۱۴۲ برای آماده‌سازی Release Candidate نسخه 2.3.0 انجام می‌شود و فاز ۱۴۳ نهایی‌سازی Release 2.3.0 خواهد بود.
