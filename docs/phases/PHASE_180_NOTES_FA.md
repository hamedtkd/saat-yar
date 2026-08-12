# فاز ۱۸۰ — Final Release 2.4.0

## هدف

بستن رسمی Release `2.4.0` پس از Candidate فاز ۱۷۹، بدون Feature جدید، Migration جدید یا تغییر Schema.

## شواهد ورودی

- Baseline فاز ۱۷۸: `887158c` با `758/758` تست.
- Candidate فاز ۱۷۹: `1cabdb4` با هدف و Gate تأییدشده `764/764`.
- Merge کنترل‌شده اولیه `dev -> main`: `7627e99`.
- پس از Recovery، `dev` و `main` هر دو روی `7627e99` همگام و Working Tree تمیز هستند.
- Tag اشتباه اولیه `v2.4.0` حذف شده و نباید تا Audit نهایی Production دوباره ساخته شود.

## تغییرات Finalization

- Manifest `2.4.0` از `release-candidate` به `released` منتقل می‌شود.
- Candidate SHA و Candidate test count به‌صورت immutable ثبت می‌شوند.
- Merge اولیه `7627e99` به‌عنوان evidence rollout ثبت می‌شود.
- README، Release Notes، Docs index، Checklist و Roadmap از Candidate به Stable/Final Release منتقل می‌شوند.
- Release Audit از قرارداد Phase 179 به قرارداد Phase 180 تغییر می‌کند.
- شش Contract Test جدید Phase 180 اضافه می‌شود و Gate از `764` به `770` می‌رسد.
- SHA نهایی Release داخل Manifest ذخیره نمی‌شود؛ annotated tag `v2.4.0` منبع حقیقت Commit نهایی است و self-reference ایجاد نمی‌شود.

## داده و Dependency

- AppData Schema: `v17`
- Migration جدید: ندارد
- Dependency جدید در Phase 180: ندارد
- `framer-motion@^12.42.2` همان Dependency اضافه‌شده در Candidate برای Flip Clock است.
- Manifestهای 2.3.2 و قدیمی‌تر immutable باقی می‌مانند.

## Gate قبل از Commit

```powershell
npm run release:prepare:2.4.0
npm run check:release
npm run test:browser:pairing
npm run audit:vercel
git diff --check
git status
```

هدف:

```text
tests 770
pass 770
fail 0
```

## Commit و Rollout

فقط بعد از Gate کامل سبز:

```powershell
git add -A
git commit -m "release: finalize Saatyar 2.4.0"
git push origin dev
```

سپس Merge کنترل‌شده `dev -> main`، انتظار برای Ready شدن Vercel و اجرای:

```powershell
npm run audit:production
```

فقط بعد از Audit سبز و تأیید یکی بودن `HEAD` و `origin/main`:

```powershell
git tag -a v2.4.0 -m "Saatyar 2.4.0"
git push origin v2.4.0
```

## تعریف Done

Phase 180 زمانی از نظر Release عملیاتی بسته است که Finalization Commit روی `main` Deploy شده باشد، `audit:production` سبز باشد و annotated tag `v2.4.0` دقیقاً روی همان Commit نهایی قرار گرفته باشد.
