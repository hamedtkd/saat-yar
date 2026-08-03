# ساعت‌یار (Saatyar)

ساعت‌یار یک وب‌اپ فارسی، راست‌به‌چپ، Local-first و قابل نصب برای ثبت ساعت کاری،
وقفه، ناهار، مرخصی، پروژه و درآمد است. داده‌های کاربر در مرورگر خودش ذخیره
می‌شوند و اجرای برنامه به Backend، حساب کاربری یا فایل `.env` نیاز ندارد.

> **English:** Saatyar is an open-source, Persian-first, RTL, local-first worklog
> and time-tracking web app for employees, freelancers, and hybrid workers.

## چرا ساعت‌یار؟

- سه فضای کاری: کارمند، فریلنسر و ترکیبی
- ثبت شروع/پایان روز، ناهار و چند وقفه مستقل
- ویرایش دقیق ساعت شروع، پایان و مدت ناهار و وقفه‌ها
- محاسبه کارکرد خالص، کسری، اضافه‌کاری و خروج پیشنهادی
- محاسبه صحیح حقوق روزانه بر پایه `حقوق ماهانه ÷ ۳۰`
- پشتیبانی از ضریب اضافه‌کاری و کار در روز تعطیل
- تقویم شمسی، مرخصی، گزارش ماهانه و خروجی CSV/Excel
- مشتری، پروژه، نرخ ساعتی، بودجه و تایمر قابل صورتحساب
- ذخیره‌سازی Local-first در IndexedDB و Backup/Restore نسخه‌بندی‌شده
- PWA، فونت Vazirmatn آفلاین و رابط Responsive

## وضعیت حریم خصوصی

ساعت‌یار به‌صورت پیش‌فرض هیچ داده‌ای را به سرور ارسال نمی‌کند. داده‌ها در
IndexedDB همان مرورگر و همان دامنه نگهداری می‌شوند. حذف داده‌های سایت، تغییر
دامنه یا تعویض مرورگر می‌تواند دسترسی به اطلاعات محلی را از بین ببرد؛ بنابراین
Backup منظم JSON ضروری است.

## شروع سریع

پیش‌نیازها:

- Node.js `22.x`
- npm همراه Node.js

```bash
npm ci
npm run dev
```

آدرس توسعه معمولاً `http://localhost:5173` است.

برای اجرای نسخه Next.js در حالت توسعه:

```bash
npm run dev:next
```

## کنترل کیفیت

```bash
npm run typecheck
npm run lint
npm test
npm run build:pages
```

یا همه بررسی‌های اصلی:

```bash
npm run check
```

## منطق محاسبه زمان و حقوق

### کارکرد خالص

```text
کارکرد خالص = زمان حضور − ناهار بدون حقوق − وقفه‌های بدون حقوق
زمان قابل محاسبه = کارکرد خالص + مرخصی قابل محاسبه
تراز روز = زمان قابل محاسبه − هدف روزانه
```

وقفه و ناهار «با حقوق» از کارکرد کم نمی‌شوند.

### حقوق روزانه

```text
حقوق پایه روزانه = حقوق ماهانه ÷ ۳۰
```

روز ناقص به نسبت زمان قابل محاسبه پرداخت می‌شود. زمان بیشتر از هدف روزانه با
ضریب اضافه‌کاری و کار روز تعطیل با ضریب تعطیل محاسبه می‌شود. این محاسبه یک
ابزار شخصی است و جایگزین فیش حقوقی یا مقررات سازمان شما نیست.

## معماری پروژه

```text
app/                         مسیرها و Layout برنامه
components/
  common/                    اجزای عمومی رابط
  layout/                    Header، Footer و Onboarding
  pages/                     Featureهای Today، Month، Reports و ...
  ui/                        Primitiveهای رابط
hooks/
  use-saatyar-controller.ts  هماهنگی state و عملیات محصول
  use-persisted-app-data.ts  بارگذاری و ذخیره Local-first
lib/
  time-engine.ts             موتور خالص محاسبات زمان
  payroll.ts                 محاسبات حقوق روزانه و اضافه‌کاری
  backup-schema.ts           اعتبارسنجی Backup با Zod
  storage.ts                 Adapter ذخیره‌سازی IndexedDB
  types.ts                   قراردادهای دامنه
  format.ts                  تاریخ، اعداد و قالب‌بندی فارسی
tests/                       تست‌های Node برای منطق دامنه
```


### نسخه‌بندی و Migration داده

داده‌های IndexedDB و فایل‌های پشتیبان پیش از ورود به برنامه از Migrationهای مرحله‌ای عبور می‌کنند. نسخه جاری در `lib/data/version.ts` تعریف شده است و هر تغییر ناسازگار در مدل داده باید Migration و تست متناظر داشته باشد. جزئیات در `docs/DATA_MIGRATIONS.md` آمده است.

### سیاست Tailwind

کلاس‌های Tailwind در همان Component و کنار Markup نوشته شده‌اند. پروژه هیچ
Style Registry مرکزی مانند `lib/tw.ts` ندارد. فایل `app/globals.css` فقط ورودی
ضروری Tailwind را import می‌کند:

```css
@import "tailwindcss";
```

این سیاست باعث می‌شود محل اثر هر Style روشن باشد و Tailwind بتواند همه کلاس‌ها
را به‌صورت ایستا تشخیص دهد.

## دستورات

| دستور | کاربرد |
| --- | --- |
| `npm run dev` | توسعه با Vite/Vinext |
| `npm run dev:next` | توسعه مستقیم با Next.js |
| `npm run typecheck` | بررسی TypeScript |
| `npm run lint` | بررسی ESLint |
| `npm test` | تست منطق زمان، حقوق و Backup |
| `npm run build:pages` | ساخت Static در پوشه `out` |
| `npm run build:vercel` | Build مناسب Vercel |
| `npm run check` | Typecheck + Lint + Test |

راهنمای کامل Windows، macOS، Linux، Docker، GitHub Pages و Vercel در
[RUN_AND_DEPLOY_FA.md](./RUN_AND_DEPLOY_FA.md) قرار دارد.

## مشارکت

پیش از Pull Request، فایل [CONTRIBUTING.md](./CONTRIBUTING.md) را بخوانید و
دستور `npm run check` را اجرا کنید. گزارش آسیب‌پذیری امنیتی باید طبق
[SECURITY.md](./SECURITY.md) انجام شود و نه در Issue عمومی.

## مجوز

این پروژه تحت مجوز [MIT](./LICENSE) منتشر می‌شود.
