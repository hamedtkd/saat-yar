# یادداشت Release ساعت‌یار ۲.۶.۰

تاریخ Candidate: ۲۹ مرداد ۱۴۰۵ / 2026-08-20
تاریخ Final Release: 2026-08-20

ساعت‌یار ۲.۶.۰ Final Minor Release پس از ۲.۵.۰ است و تغییرات محصولی و hardening فازهای ۱۹۵ تا ۲۰۰ را بسته‌بندی می‌کند. Phase 200 روی commit `15f5af8` با **958/958 تست** بسته شد. Candidate فاز ۲۰۱ روی commit `3e5bcbf` با **964/964 تست** و Full Production/Freelancer/Employee/Pairing/Vercel Gate تأیید شده است. Phase 202 فقط Release است و Feature جدیدی وارد این نسخه نمی‌شود.

## قرارداد Final Release

- Candidate تأییدشده: `3e5bcbf` با `964/964` تست Node و Full Browser/Pairing/Vercel Gate.
- Target سورس نهایی Phase 202: **970/970** تست Node پس از اضافه‌شدن قراردادهای Release.
- AppData: **v21** با migration رسمی از Schema **v20** نسخه ۲.۵.۰.
- ترتیب Rollout اجباری است: merge commit نهایی به `main` → صبر برای Deploy Production در Vercel → اجرای `npm run audit:production` → سپس و فقط سپس tag annotated `v2.6.0`.
- Tag باید دقیقاً روی همان commit از `main` باشد که در Production audit شده است.

## مهم‌ترین تغییرات

- Visual lock نهایی: Violet (`#8b5cf6`) preset پیش‌فرض برند است، آیکون‌های نصب/اشتراک‌گذاری بازسازی شده‌اند و رسانه‌های README از Build واقعی دوباره Capture می‌شوند.

- صفحات عمومی About / Help / Privacy / Terms و disclosure شفاف Google Calendar برای آمادگی OAuth Verification.
- GA4 واقعی با Consent و Opt-out محلی، payload محدود و بدون ارسال متن فعالیت، عنوان پروژه یا محتوای کاری کاربر.
- Leave Intelligence اصلاح‌شده در تقویم و Recent Activity؛ مرخصی زمان کاری جعلی تولید نمی‌کند اما کسری روز را مطابق قرارداد محصول پوشش می‌دهد.
- Tooltip مشترک portal-safe و viewport-aware برای Heatmap و توضیحات UI، همراه با Production Observability گسترده‌تر.
- Onboarding و First-run بازطراحی‌شده و workflow فریلنسر مبتنی بر Project Timer به‌جای semantics حضور و غیاب.
- Work Session فریلنسر با Start / Pause / Resume / Finish، recovery بعد از reload، Timeline واقعی و جلوگیری از timerهای هم‌زمان.
- Todayهای مستقل Employee / Freelancer / Hybrid با routeهای mode-specific و compatibility مسیر `/today`.
- Date/Time Picker مشترک: Drawer موبایل، Popover دسکتاپ، Time Wheel و ویرایش تاریخ/زمان بدون native datetime-local.
- hardening مستقیم برای موبایل 320px و ماتریس 360/375/425px در RTL و LTR.
- Employee Activity Context با Work Item اختیاری، Work Project مستقل از پروژه مشتری، live activity timer و edit/delete تاریخچه فعالیت.
- ویرایش مستقیم Clock-in / Clock-out / Lunch / Break بدون بازکردن ویرایش کامل روز.
- Footer و صفحات اعتماد محصول، GitHub stars با cache/fallback امن و polish نهایی Header/Mobile Navigation.
- نام صفحه «ماه من» به **«تقویم کاری»** و English به **Work Calendar** تغییر کرده؛ route فنی `/month` برای compatibility حفظ شده است.
- نام نصب PWA به `Saatyar | ساعت یار` ارتقا یافته و launcher label فشرده `Saatyar` باقی مانده است.
- ترتیب تاریخ مستقل هر زبان اصلاح شده؛ نمونه فارسی: `پنجشنبه، ۲۹ مرداد ۱۴۰۵` و English: `Thursday, August 20, 2026`.
- favicon و brand داخل runtime از accent فعال پیروی می‌کنند، در حالی که install icon برای identity پایدار PWA ثابت می‌ماند.
- Release Hardening شامل audit برای dynamic code، OAuth token persistence، unsafe external links، inline HTML، Vercel security headers و revalidation صریح Manifest/Service Worker.

## قرارداد داده و Migration

- Schema نسخه منتشرشده ۲.۵.۰: **v20**
- Schema Release ۲.۶.۰: **v21**
- Migration تحت Audit: **v20 → v21**
- v21: `ActivitySegment.title?`، `workProjects` و `workProjectId?` برای Activity Context فضای Employee/Hybrid.
- پروژه‌های کاری Employee از پروژه‌های مشتری Freelancer مستقل‌اند؛ Hybrid می‌تواند هر دو context را بدون leakage ببیند.
- Google Calendar cache/token، Analytics consent و preferenceهای PWA/Locale خارج از AppData باقی می‌مانند.
- Backup/Restore و Device Transfer روی v21 در Phase 200 behavioral gate دارند.

## شواهد Baseline Phase 200

```text
958 / 958 tests passed
TypeScript passed
ESLint passed
Hardening audit passed
AppData schema v21 audit passed
Migration v17 -> v21 behavioral audit passed
Next.js 37/37 static routes passed
Production browser smoke passed
Freelancer browser smoke passed
Employee browser smoke passed
WebRTC pairing smoke passed
Vercel static-export + security header audit passed
PWA offline reload passed
RTL 360/375/425 + LTR 375 + Employee/Freelancer 320 passed
```

## مرز Rollout نهایی

Phase 202 سورس و اسناد Final Release را می‌بندد، اما Release عمومی تا قبل از Gate سبز Production تمام‌شده محسوب نمی‌شود:

- سورس Finalization روی `dev` commit شود؛
- همان commit دقیق به `main` merge شود؛
- Deploy Production همان commit در Vercel کامل شود؛
- `npm run audit:production` سبز شود؛
- فقط بعد از آن tag annotated `v2.6.0` ساخته شود؛
- Tag باید دقیقاً روی همان commit audit‌شده `main` باشد.

در Phase 202 هیچ Feature جدید، Schema change، dependency update یا code change پس از Production Audit مجاز نیست.
