# فاز ۱۷۸ — Closure و Hardening نهایی i18n

Baseline: `fff7537` (`dev`، پایان فاز ۱۷۷)

- Package: `2.3.2`
- AppData Schema: `v17`
- Migration: ندارد
- Dependency جدید: ندارد
- تغییر قرارداد ذخیره‌سازی/Backup: ندارد

## هدف

این فاز Feature جدید اضافه نمی‌کند. هدف، بستن i18n پس از فازهای ۱۷۴ تا ۱۷۷ با Audit قابل‌اجرا، حذف Copyهای UI جاافتاده، اصلاح هندسه مشترک RTL/LTR و تثبیت سیاست Metadata/Export است.

## تغییرات اصلی

- Audit جدید `npm run audit:i18n` روی مرز Runtime UI (`app/`, `components/`, `hooks/`) اجرا می‌شود و هر Hard-coded Persian جدید را خارج از Exceptionهای مستند Fail می‌کند.
- `check` اکنون Audit i18n را قبل از TypeScript/Lint/Test اجرا می‌کند تا Regressionهای ترجمه و Direction زودتر دیده شوند.
- Shared primitiveهای `Dialog`، `AlertDialog` و `Select` از Direction فعال استفاده می‌کنند؛ padding/position/text alignment به کلاس‌های Logical مانند `ps/pe/start/end/text-start` منتقل شد.
- `TableShell`، Jalali Date Picker trigger، Onboarding step shell و Minute Duration field از alignment فیزیکی RTL آزاد شدند.
- `ColorField`، `PageHeading`، `ProgressRing`، Loading صفحه Root، Autosave copy و Duration labels از Catalog فعال استفاده می‌کنند.
- Header navigation دیگر Parallel Persian label ندارد و فقط از `MessageKey` تایپ‌شده استفاده می‌کند.
- Timer ownership، نام دستگاه و Heartbeat در هر دو Locale رندر می‌شوند؛ Persian default برای سازگاری APIهای تاریخی حفظ شده است.
- Runtime error bridge اضافه شد تا Errorهای low-level فارسی در UI انگلیسی یا Errorهای low-level انگلیسی در UI فارسی نشت نکنند. Import CSV، Device Pairing و QR Scanner از این Bridge استفاده می‌کنند.
- Excel HTML خروجی Report اکنون `lang` و `dir` را از Locale فعال می‌گیرد و Report Actions Locale را صریحاً به Exporter می‌فرستد.
- Runtime title همه Routeهای محصول را پوشش می‌دهد و MutationObserver فاز ۱۷۷ همچنان title زنده را پس از Hydration authoritative نگه می‌دارد.

## سیاست Metadata / PWA

برای Patch منتشرشده `2.3.2`، Metadata استاتیک، Root HTML اولیه و Manifest همچنان Canonical فارسی/RTL باقی می‌مانند. دلیل این تصمیم، جلوگیری از تغییر قرارداد SEO/PWA در یک فاز Closure بدون Release جدید است. پس از Hydration، `LocaleRuntime`، `lang/dir` و title را مطابق Locale کاربر اعمال می‌کند.

Exceptionهای Persian در Audit عمداً محدود به شش مسیر هستند:

1. `app/layout.tsx` — Metadata/HTML canonical فارسی.
2. `app/manifest.ts` — PWA manifest canonical فارسی.
3. `app/import/layout.tsx` — Metadata استاتیک Route.
4. `app/onboarding/layout.tsx` — Metadata استاتیک/noindex Route.
5. `components/pickers/time-picker/time-utils.ts` — Parser compatibility؛ UI واقعی بر اساس error code ترجمه می‌شود.
6. `components/common/app-toast.tsx` — Keyword lexicon دو زبانه برای تشخیص Tone؛ این رشته‌ها Copy رندرشده نیستند.

اضافه‌شدن Exception جدید باید آگاهانه و همراه با تغییر Audit/Test باشد؛ Allowlist عمومی یا Directory-level وجود ندارد.

## Browser و Release contract

Production Browser Smoke موجود باید همچنان این Matrix را پاس کند:

- Today / Month / Reports در English/LTR.
- Clients / Projects / Invoices / Leave در English/LTR با Workspace switch واقعی و RouteGuard دست‌نخورده.
- Settings / Onboarding / Import / About در English/LTR.
- Persistence Locale و بازگشت به Persian/RTL.
- PWA installability و Offline reload.
- Freelancer Browser Journey تاریخی.
- Employee Browser Journey تاریخی.
- WebRTC Pairing چهار chunk رمزنگاری‌شده + ACK.

فاز ۱۷۸ Harnessهای تاریخی را شل نمی‌کند.

## شمارش تست

Baseline فاز ۱۷۷ روی محیط کامل: `746/746`.

فاز ۱۷۸ دوازده Contract Test جدید اضافه می‌کند؛ انتظار Gate کامل:

`758/758`

## Rollout

این فاز فقط روی `dev` بسته می‌شود. Merge به `main` یا Release/Tag جدید بخشی از فاز ۱۷۸ نیست و باید در فاز Release Candidate/rollout جداگانه، پس از Gate سبز و بررسی Production انجام شود.
