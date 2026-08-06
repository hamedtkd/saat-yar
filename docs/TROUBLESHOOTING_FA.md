# عیب‌یابی نصب ساعت‌یار در Windows و خطاهای `npm ci`

این راهنما برای Clone تازه، جایگزینی ZIP یک فاز جدید و نصب مجدد Dependencyها نوشته شده است. دستورها را از ریشه مخزن، یعنی پوشه‌ای که `package.json` داخل آن قرار دارد، اجرا کنید.

## مسیر بررسی سریع

```powershell
node --version
npm --version
git status
Test-Path .\package.json
npm config get registry
npm ci
npm run check:dependencies
```

انتظار پروژه:

- Node.js روی شاخه `22.x` باشد.
- `package.json` و `package-lock.json` کنار هم باشند.
- `npm ci` از Lockfile فعلی استفاده کند.
- پس از نصب، `npm run check:dependencies` تمام Dependencyهای مستقیم را پیدا کند.

## خطای ناسازگاری نسخه Node.js

نسخه فعال را ببینید:

```powershell
node --version
where.exe node
```

اگر چند Node.js نصب است، خروجی `where.exe node` مشخص می‌کند کدام فایل زودتر از `PATH` پیدا می‌شود. ترمینال را بعد از نصب یا تغییر نسخه کامل ببندید و دوباره باز کنید.

پس از فعال‌شدن Node.js 22:

```powershell
npm ci
npm run check:dependencies
```

## نصب ناقص و خطاهای `Cannot find module`

اگر نصب قبلی نیمه‌کاره مانده یا فایل‌هایی از `node_modules` گم شده‌اند، Patch دستی روی پوشه Dependencyها نزنید. یک نصب تمیز انجام دهید:

```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item -Recurse -Force .\node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .\.next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .\out -ErrorAction SilentlyContinue
npm cache verify
npm ci
npm run check:dependencies
```

`package-lock.json` را فقط برای رفع نصب ناقص حذف نکنید. `npm ci` عمداً به Lockfile متکی است و حذف آن می‌تواند درخت Dependency متفاوتی بسازد.

## خطای `E404` هنگام دریافت یک Package

ابتدا Registry فعال را بررسی کنید:

```powershell
npm config get registry
npm config list
```

دلایل رایج:

- Registry سازمانی Package یا نسخه موردنیاز را Mirror نکرده است.
- Proxy یا VPN درخواست را به Registry دیگری هدایت می‌کند.
- Cache یا Metadata همان Registry ناقص شده است.
- دسترسی شبکه سازمان به Registry عمومی محدود است.

اقدام درست:

1. نام Package، نسخه و URL داخل پیام خطا را ثبت کنید.
2. بررسی کنید Registry نمایش‌داده‌شده همان Registry مورد انتظار شما باشد.
3. بدون هماهنگی سازمانی، `package-lock.json` را برای دورزدن خطا ویرایش نکنید.
4. اگر استفاده از npm عمومی طبق سیاست محیط مجاز است، Registry را فقط برای همان اجرا مشخص کنید:

```powershell
npm ci --registry=https://registry.npmjs.org
```

5. اگر Registry سازمانی اجباری است، Package گم‌شده باید در همان Registry اصلاح یا Mirror شود.

## خطاهای `EPERM`، `EBUSY` و فایل‌های قفل‌شده

این خطاها معمولاً یعنی Node.js، Dev Server، مرورگر، آنتی‌ویروس یا Indexer هنوز فایلی را باز نگه داشته است.

```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process chrome,msedge,chromium -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Remove-Item -Recurse -Force .\node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .\.next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .\out -ErrorAction SilentlyContinue
npm ci
```

اگر خطا ادامه داشت:

- VS Code و ترمینال‌های دیگر را ببندید.
- پوشه پروژه را از Sync هم‌زمان OneDrive خارج کنید.
- وضعیت آنتی‌ویروس یا Controlled Folder Access را بررسی کنید.
- سیستم را Restart کنید و پیش از بازکردن IDE نصب را اجرا کنید.

هشدار `EPERM` در Cleanup لزوماً شکست نصب نیست. معیار اصلی Exit Code نهایی `npm ci` و عبور `npm run check:dependencies` است.

## خطای `.git/index.lock`

ابتدا تمام عملیات Git و Editorهای Commit را ببندید. سپس بررسی کنید پردازش Git دیگری فعال نباشد:

```powershell
Get-Process git* -ErrorAction SilentlyContinue
```

اگر هیچ عملیات Git فعالی وجود ندارد و Lock از Crash قبلی مانده است:

```powershell
Remove-Item .\.git\index.lock

git status
```

فایل Lock را هنگام اجرای واقعی `git commit`، `git rebase` یا ابزار Git دیگر حذف نکنید.

## خطای Build پس از جایگزینی ZIP فاز جدید

ابتدا مطمئن شوید فایل‌های جدید روی همان مخزن دارای `.git` کپی شده‌اند و پوشه Git حذف نشده است:

```powershell
Test-Path .\.git
Test-Path .\package.json
git status
```

سپس Cacheهای Build را پاک کنید؛ اطلاعات Local-first کاربر داخل مرورگر است و این پوشه‌ها دیتای برنامه نیستند:

```powershell
Remove-Item -Recurse -Force .\.next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .\out -ErrorAction SilentlyContinue
npm ci
npm run check:quality
```

## پیدا نشدن Chrome یا Edge در Smoke Test

مسیر مرورگر را برای همان نشست PowerShell مشخص کنید:

```powershell
$env:SAATYAR_BROWSER_PATH = "C:\Program Files\Google\Chrome\Application\chrome.exe"
npm run test:browser:production
```

برای Edge:

```powershell
$env:SAATYAR_BROWSER_PATH = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
npm run test:browser:production
```

اسکریپت به‌صورت پیش‌فرض Chrome، Edge و Chromium را جست‌وجو می‌کند. باقی‌ماندن کوتاه‌مدت Lock پروفایل موقت مرورگر پس از موفقیت Smoke Test فقط باید هشدار Cleanup ایجاد کند، نه شکست محصول.

## Notification کار نمی‌کند

- برنامه را با HTTP محلی یا HTTPS اجرا کنید؛ بازکردن مستقیم فایل‌های Build با `file://` کافی نیست.
- مجوز Notification را از تنظیمات Site مرورگر بررسی کنید.
- بعد از ردکردن مجوز، مرورگر ممکن است درخواست دوباره را بدون تغییر دستی Site Settings نشان ندهد.
- رفتار Notification و PWA در مرورگرها و سیستم‌عامل‌ها یکسان نیست؛ جدول [سازگاری مرورگر](./BROWSER_COMPATIBILITY.md) را ببینید.

## داده بعد از تغییر مرورگر یا آدرس دیده نمی‌شود

IndexedDB برای هر Browser Profile و Origin جدا است. برای نمونه این آدرس‌ها Storage مشترک ندارند:

```text
http://localhost:3000
http://localhost:5173
https://saat-yar.vercel.app
```

از دامنه قبلی Backup بگیرید و در دامنه جدید Restore کنید. پاک‌کردن Site Data، استفاده از Private Mode یا تعویض Profile می‌تواند داده محلی را از دسترس خارج کند.

## کنترل نهایی قبل از Commit و Push

```powershell
npm run check:quality
npm run check:release
git diff --check
git status
```

در گزارش خطا همیشه این موارد را بفرستید:

- نسخه `node --version` و `npm --version`
- دستور دقیق اجراشده
- اولین خطای واقعی، نه فقط آخرین خط Log
- خروجی `npm config get registry` برای خطاهای دریافت Package
- وضعیت `git status`
