# یادداشت انتشار ساعت‌یار ۲.۳.۲

تاریخ انتشار: ۱۴۰۵/۰۵/۱۸ — 2026-08-09

نسخه ۲.۳.۲ یک Patch Release برای تثبیت تجربه کارمند، تنظیمات برنامه کاری، کنتراست تم‌ها، CI و مستندات پروژه است. AppData همچنان روی Schema v17 باقی می‌ماند و Migration یا Dependency جدیدی اضافه نشده است.

## مهم‌ترین تغییرات

- **قرارداد ناهار و خروج پیشنهادی:** هدف هفتگی به‌صورت «کار خالص» تعریف شده و ناهار بدون حقوق به ساعت خروج پیشنهادی اضافه می‌شود. تغییر مدت ناهار، هدف خالص روز را تغییر نمی‌دهد.
- **پالیش تنظیمات برنامه کاری:** کارت‌های خلاصه برنامه، ناهار پیش‌فرض و هدف هفتگی Responsive و هم‌تراز شدند.
- **CI همسو با Vercel:** Deploy بلااستفاده GitHub Pages از GitHub Actions حذف شد تا Pushهای سالم به‌دلیل Pages غیرفعال Fail نشوند.
- **بازیابی نشست:** Reload عادی دیگر روز باز را خودکار نمی‌بندد. برای Auto-close ناشی از قطع طولانی، «از سرگیری کار» رکورد را باز می‌کند و فاصله قطع ارتباط را به‌عنوان وقفه بدون حقوق ثبت می‌کند.
- **کنتراست Accent:** کنترل‌های پرشده در تم‌های فیروزه‌ای و آبی foreground سفید و سطح Fill خواناتر دارند.
- **مستندات GitHub:** README اصلی انگلیسی شده، README کامل فارسی حفظ شده و برنامه i18n رابط فارسی RTL / انگلیسی LTR در Roadmap ثبت شده است.

## کیفیت و سازگاری

- Baseline قبل از Finalization: فاز ۱۶۴ با **633/633** تست.
- Gate نهایی مورد انتظار فاز ۱۶۵: **639/639** تست.
- Production/Freelancer/Employee Browser Smoke: الزامی.
- WebRTC Pairing: چهار chunk رمزنگاری‌شده + ACK.
- Vercel Static Export Audit و Production Domain Audit: الزامی.
- PWA precache: 37 build asset.
- AppData Schema: `v17`.
- Migration جدید: ندارد.
- Dependency جدید: ندارد.

Baseline commit فاز ۱۶۴ هنگام اجرای `npm run release:prepare:2.3.2` از `HEAD` ثبت می‌شود تا Manifest نهایی به Commit واقعاً Production-audited اشاره کند.

## انتشار

پس از سبز شدن Gate محلی، Commit/Push فاز ۱۶۵، Ready شدن Vercel و پاس شدن `npm run audit:production`، Tag annotated زیر روی همان Commit نهایی ساخته می‌شود:

```bash
git tag -a v2.3.2 -m "Saatyar 2.3.2"
git push origin v2.3.2
```

Manifest عمداً `releaseCommit` ندارد؛ Tag annotated منبع حقیقت Commit نهایی Release است.
