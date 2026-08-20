# Phase 202 — Final Release 2.6.0

## Baseline

- Phase 200 final hardening: `15f5af8` — 958/958.
- Phase 201 verified candidate: `3e5bcbf` — 964/964 + full Production/Freelancer/Employee/Pairing/Vercel gate.
- AppData: v21.
- Released 2.5.0 schema baseline: v20.
- Dependency graph: unchanged.

## Scope

Phase 202 is release-only. No product feature, schema migration, dependency or UI redesign is allowed. It finalizes release evidence, updates stable-release documentation, aligns the remote production audit with the Phase 200 PWA identity/security contract, and adds the final release gate.

## Important production-audit correction

The old remote audit still expected the pre-Phase-200 manifest identity (`ساعت‌یار` / `ساعت‌یار`, `dir=rtl`). The real manifest is now `Saatyar | ساعت یار`, short name `Saatyar`, and `dir=auto`. Phase 202 updates the remote audit to the actual shipped PWA contract and also verifies live Vercel security headers plus `must-revalidate` on the manifest/service worker.

## Final source gate

Run on `dev` while HEAD is the verified Phase 201 candidate `3e5bcbf`:

```powershell
npm ci
npm run check:release:final:2.6.0

git diff --check
git diff -- package-lock.json
git status
```

Expected Node target: **970/970**. `package-lock.json` must remain byte-identical to the Phase 201 candidate.

## Rollout order after the finalization commit

1. Commit and push Finalization source on `dev`.
2. Merge that exact finalization commit to `main` and push.
3. Wait for the Vercel Production deployment of that exact main commit.
4. Run `npm run audit:production`.
5. Confirm production audit is green.
6. Create annotated `v2.6.0` tag on that exact `main` commit.
7. Push the tag.

Never create the tag before the production audit.
## R2 — README backlog compatibility

Final gate R1 reached **969/970**. The only failure was historical Phase 60 documentation compatibility: the rewritten root README no longer contained the canonical `docs/roadmap/BACKLOG_FA.md` reference. R2 restores that real documentation link in both English and Persian READMEs. No runtime, release manifest, schema, dependency, PWA, or production-audit behavior changed.

## Revision 3 — Violet brand + real release media

- رنگ پیش‌فرض نصب تازه از cyan به Violet `#8b5cf6` تغییر کرد؛ presetهای قبلی برای کاربران/داده‌های تاریخی حفظ می‌شوند.
- آیکون PWA/Apple/Favicon از آیکون تأییدشده‌ی کاربر به نسخه‌ی بنفش بازسازی شد و alpha/mask گوشه‌ی چپ پاک‌سازی شد.
- Social cardهای OpenGraph/Twitter با هویت بنفش همگام شدند.
- `media:capture` اکنون Today، Work Calendar، Reports، Settings و موبایل را از Build واقعی Capture می‌کند؛ README فارسی/انگلیسی فقط همین assetهای واقعی را نمایش می‌دهند.
- AppData v21، dependencyها و package-lock تغییری ندارند.

## Revision 4 — PWA cache contract test compatibility

- اجرای R3 روی سیستم release به **968/970** رسید و هر دو failure فقط از دو تست تاریخی Phase 108 و Phase 110 بودند که شماره‌ی cache قدیمی `v7` را literal کرده بودند، در حالی که Revision 3 عمداً Service Worker را برای invalidate کردن icon cache به `v8` برده است.
- خود Service Worker و رفتار update/offline تغییر نکرده‌اند. تست‌های تاریخی اکنون به‌جای pin کردن یک شماره‌ی cache، وجود قرارداد versioned برای `CACHE_NAME` و `STATIC_CACHE` را بررسی می‌کنند؛ بنابراین bumpهای عمدی بعدی دوباره false-negative ایجاد نمی‌کنند.
- Node 24 warning علت failure نیست؛ release target همچنان Node 22.x باقی می‌ماند.
- AppData v21، dependencyها، package.json و package-lock تغییری ندارند.

## Revision 5 — Media Capture reset hardening + lockfile-safe release install

- اجرای R4 روی سیستم release به **970/970** رسید و Build/Production/Freelancer smokeها سبز شدند؛ failure بعدی فقط در `media:capture:built` بود.
- علت Media Capture یک انتظار متنی قدیمی (`ساعت‌یار را برای خودت تنظیم کن`) بعد از پاک‌سازی Browser Storage بود. Capture حالا به‌جای copy متغیر، route واقعی `/onboarding` و marker ساختاری `data-onboarding-step-index` را منتظر می‌ماند و سپس Demo AppData را seed می‌کند.
- Frameهای موقت GIF دیگر داخل `docs/assets/screenshots` نوشته نمی‌شوند؛ در یک temporary directory ساخته و در `finally` پاک می‌شوند، بنابراین شکست میانی Capture repository را با فایل‌های `onboarding-frame-*` کثیف نمی‌کند.
- دستور نصب Final Gate از `npm install` به `npm ci` تغییر کرد. Release target همچنان Node 22.x است؛ اجرای `npm install` با Node 24/npm 11 می‌تواند metadata اختیاری lockfile را بازنویسی کند بدون اینکه dependency واقعی عوض شده باشد.
- AppData v21، package.json، dependencyها، Service Worker v8 و package-lock خود سورس بدون تغییر هستند.

## Revision 6 — Media Capture CDP expression syntax fix

- اجرای R5 روی Node 22.16.0 کل Final Release Gate را با **970/970**، Build، Production/Freelancer/Employee/Pairing و Vercel سبز کرد؛ تنها failure باقی‌مانده در `media:capture:built` و بعد از فریم‌های Onboarding رخ داد.
- علت دقیق `SyntaxError: Unexpected end of input` یک regex داخل رشته‌ی JavaScript ارسالی به CDP بود: escape شدن `/` در template literal باعث می‌شد expression نهایی به شکل parser-unsafe ساخته شود.
- شرط readiness مربوط به Onboarding به helper مستقل `scripts/media/capture-expressions.mjs` منتقل شد و بدون regex ساخته می‌شود؛ route با حذف امن trailing slash و marker ساختاری `data-onboarding-step-index` بررسی می‌شود.
- تست تاریخی Phase 110 اکنون خود expression نهایی را با parser Node (`node:vm`) compile می‌کند تا خطاهای syntax در JavaScript تولیدشده قبل از اجرای Browser Capture گرفته شوند.
- هیچ تغییر محصولی، AppData، dependency، package version، Service Worker یا package-lock در R6 وجود ندارد.
