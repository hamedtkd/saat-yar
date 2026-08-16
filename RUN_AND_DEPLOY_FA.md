# راهنمای اجرا و انتشار ساعت‌یار

این راهنما برای نسخه نهایی ساعت‌یار است. پروژه Backend و دیتابیس سروری ندارد،
هیچ ENV اجباری نمی‌خواهد و داده‌ها را در IndexedDB مرورگر نگه می‌دارد.
فونت Vazirmatn داخل وابستگی‌های پروژه بسته‌بندی شده و برای نمایش آن نیازی به
دسترسی اینترنت یا بارگذاری فونت از سرویس خارجی نیست.

## پیش‌نیاز مشترک

- Node.js `22.x`
- npm همراه Node.js
- برای انتشار GitHub Pages: یک Repository در GitHub
- برای انتشار Vercel: حساب Vercel

بررسی نسخه:

```text
node --version
npm --version
```

## Windows — PowerShell 7 و Windows PowerShell 5.1

از داخل پوشه پروژه:

```powershell
$ErrorActionPreference = "Stop"
Set-Location "D:\my-workspace\saatyar-worklog"

node --version
npm.cmd --version
npm.cmd ci

if ($LASTEXITCODE -ne 0) { throw "npm ci ناموفق بود." }

npm.cmd run check
if ($LASTEXITCODE -ne 0) { throw "بررسی کیفیت ناموفق بود." }

npm.cmd run dev
```

سپس آدرسی را که Vite جلوی `Local` نشان می‌دهد باز کنید؛ معمولاً:

```text
http://localhost:5173
```

برای ساخت خروجی Static:

```powershell
npm.cmd run build:pages
```

خروجی در پوشه `out` ساخته می‌شود.

> Git Bash، WSL و `/bin/bash` برای اجرای عادی پروژه لازم نیست.

## Windows — Command Prompt

```bat
cd /d D:\my-workspace\saatyar-worklog
node --version
npm.cmd ci
npm.cmd run check
npm.cmd run dev
```

ساخت Static:

```bat
npm.cmd run build:pages
```

## macOS و Linux

```bash
cd /path/to/saatyar-worklog
node --version
npm ci
npm run check
npm run dev
```

ساخت Static:

```bash
npm run build:pages
```

## اجرای خروجی Production روی کامپیوتر

بعد از `npm run build:pages`:

```bash
npx serve@latest out
```

PowerShell:

```powershell
npx.cmd serve@latest out
```

آدرس معمول:

```text
http://localhost:3000
```

فایل‌های خروجی را مستقیماً با `file://` باز نکنید؛ Service Worker و بعضی
قابلیت‌های مرورگر به HTTP یا HTTPS نیاز دارند.

## ENVهای لازم

برای هسته Local-first ساعت‌یار هیچ ENV اجباری وجود ندارد. Google Calendar کاملاً اختیاری است.

اگر Google Calendar را فعال می‌کنید، فقط Client ID عمومی OAuth را در `.env.local` بگذارید:

```env
NEXT_PUBLIC_GOOGLE_CALENDAR_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
```

Client Secret نباید در پروژه، متغیر `NEXT_PUBLIC_*` یا Bundle مرورگر قرار بگیرد. در Google Auth Platform برای Phase 188 این دو Scope را ثبت کنید:

```text
https://www.googleapis.com/auth/calendar.calendarlist.readonly
https://www.googleapis.com/auth/calendar.events
```

برای Production همان Client ID عمومی را در Environment Variables میزبان (مثلاً Vercel) تنظیم کنید و Origin دقیق دامنه Production را در Authorized JavaScript origins همان OAuth Client ثبت کنید.

متغیر اختیاری زیر فقط هنگام Build خودکار GitHub Pages استفاده می‌شود:

```env
PAGES_BASE_PATH=/repository-name
```

در اجرای Local آن را تعریف نکنید.

## انتشار روی GitHub Pages

فایل `.github/workflows/deploy-pages.yml` آماده است و مراحل `npm ci`،
Typecheck، Lint، Test و Build را اجرا می‌کند.

### بارگذاری اولیه پروژه

```bash
git init
git add .
git commit -m "Release Saatyar"
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

در GitHub:

1. وارد `Settings` شوید.
2. بخش `Pages` را باز کنید.
3. در `Build and deployment` گزینه `GitHub Actions` را انتخاب کنید.
4. Workflow را در تب `Actions` بررسی کنید.

آدرس نهایی:

```text
https://USERNAME.github.io/REPOSITORY/
```

نام Repository به‌صورت خودکار به `basePath`، Assetها، Manifest و Service
Worker اعمال می‌شود.

## انتشار روی Vercel از GitHub

1. Repository را در Vercel Import کنید.
2. Framework را `Next.js` نگه دارید.
3. هیچ Environment Variable اضافه نکنید.
4. Deploy را اجرا کنید.

فایل `vercel.json` دستور `npm run build:vercel` و خروجی Static پوشه `out` را
مشخص کرده است.

## انتشار روی Vercel با PowerShell

```powershell
Set-Location "D:\my-workspace\saatyar-worklog"

npm.cmd ci
npm.cmd run check
npm.cmd run build:vercel

npx.cmd vercel@latest login
npx.cmd vercel@latest --prod
```

اگر خطای Token گرفتید:

```powershell
Remove-Item Env:VERCEL_TOKEN -ErrorAction SilentlyContinue
[Environment]::SetEnvironmentVariable("VERCEL_TOKEN", $null, "User")
npx.cmd vercel@latest logout
npx.cmd vercel@latest login
```

## Docker — فقط برای اجرای Static

Docker برای ساعت‌یار لازم نیست، اما در صورت نیاز:

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:pages

FROM nginx:alpine
COPY --from=build /app/out /usr/share/nginx/html
EXPOSE 80
```

Build و Run:

```bash
docker build -t saatyar .
docker run --rm -p 8080:80 saatyar
```

آدرس:

```text
http://localhost:8080
```

## تفاوت Storage با دیتابیس سروری

- اپ بدون دیتابیس سروری کاملاً کار می‌کند.
- هر مرورگر و هر دامنه IndexedDB جداگانه دارد.
- داده Localhost خودکار به دامنه Vercel یا GitHub Pages منتقل نمی‌شود.
- قبل از تغییر دامنه، Backup JSON بگیرید و در دامنه جدید Restore کنید.
- برای کاهش احتمال حذف داده، در تنظیمات روی «درخواست ذخیره پایدار» بزنید.
- Persistent Storage تضمین دائمی نیست؛ Backup منظم همچنان ضروری است.

## تست مرورگر نسخه Production

برای بررسی جریان واقعی برنامه در مرورگر، شامل بارگذاری اولیه، تکمیل Onboarding و جابه‌جایی میان تاریخ‌ها:

```powershell
npm.cmd install
npm.cmd run test:browser:production
```

اسکریپت به‌ترتیب Chrome، Edge و Chromium را پیدا می‌کند. برای تعیین دستی مرورگر:

```powershell
$env:SAATYAR_BROWSER_PATH = "C:\Program Files\Google\Chrome\Application\chrome.exe"
npm.cmd run test:browser:production
```

برای کنترل نهایی پیش از Release که Build تکراری انجام ندهد:

```powershell
npm.cmd run check:release
```

پس از دریافت فازی که Dependency جدید دارد، حتماً `npm install` اجرا شود. دستور `npm run check:dependencies` پیش از TypeScript، پکیج‌های نصب‌نشده را با پیام قابل‌فهم گزارش می‌کند.

Smoke Test این پروژه با `next start` اجرا نمی‌شود؛ چون تنظیم `output: export` فعال است. اسکریپت، پوشه `out/` را با یک سرور Static داخلی و بدون Dependency اضافه سرو می‌کند.

در Windows ممکن است Chrome یا Edge پس از پایان تست برای چند لحظه فایل پروفایل موقت را قفل نگه دارد. اسکریپت حذف را چند بار تکرار می‌کند و اگر تست محصول موفق شده باشد، باقی‌ماندن یک قفل موقت فقط به‌صورت هشدار گزارش می‌شود و `check:release` را شکست نمی‌دهد.

اگر پس از نصب با تعداد زیادی خطای فایل گم‌شده در `lucide-react` روبه‌رو شدی، نصب محلی ناقص است. در PowerShell اجرا کن:

```powershell
Remove-Item -Recurse -Force ".\node_modules" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force ".\.next" -ErrorAction SilentlyContinue
npm cache verify
npm ci
```

هشدار `EPERM` در مرحله cleanup به‌تنهایی شکست نصب نیست؛ معیار اصلی پایان موفق `npm ci` و عبور `npm run check:dependencies` است.

## دستورات مرجع

| هدف | دستور |
| --- | --- |
| نصب تکرارپذیر | `npm ci` |
| توسعه | `npm run dev` |
| بررسی کامل کیفیت | `npm run check:quality` |
| بررسی Dependencyهای نصب‌شده | `npm run check:dependencies` |
| Smoke Test مرورگر Production | `npm run test:browser:production` |
| کنترل نهایی Release | `npm run check:release` |
| Typecheck | `npm run typecheck` |
| تست واحد | `npm test` |
| Lint | `npm run lint` |
| Build برای GitHub/Vercel | `npm run build:pages` |
| Build مخصوص Sites | `npm run build` |
| بررسی خروجی Sites | `npm run validate:artifact` |

## رفع خطاهای رایج

### PowerShell دستور npm را اجرا نمی‌کند

از `npm.cmd` و `npx.cmd` استفاده کنید.

### پورت ۵۱۷۳ اشغال است

```powershell
npm.cmd run dev -- --port 5174
```

### داده‌ها بعد از تغییر دامنه دیده نمی‌شوند

این رفتار طبیعی امنیت مرورگر است. در دامنه قبلی Backup بگیرید و در دامنه
جدید Restore کنید.

### PWA آفلاین نیست

یک بار برنامه را با اینترنت و از طریق HTTPS یا localhost باز کنید، سپس صفحه را
Reload کنید تا Service Worker فعال شود.
