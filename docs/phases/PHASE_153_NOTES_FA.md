# فاز ۱۵۳ — Final Release 2.3.0

## هدف

نهایی‌سازی سورس نسخه ۲.۳.۰ پس از سبزشدن کامل Release Candidate و Pairing Browser Gate.

## شواهد Candidate

- Commit کاندید تأییدشده: `75b7be6`
- Candidate test gate: `575/575`
- TypeScript: passed
- ESLint: passed
- Next.js static build: `20/20`
- Production Browser Smoke: passed
- Freelancer Browser UX Smoke: passed
- Employee Browser UX Smoke: passed
- Employee reference day: `495` دقیقه (`8:15`)
- Device Pairing Browser Smoke: passed
- Pairing transfer: `4` encrypted chunks + ACK

## تغییرات Finalization

- `docs/releases/2.3.0.json` از `release-candidate` به `released` منتقل شد.
- Candidate commit و تعداد تست Candidate در Manifest نهایی حفظ شدند.
- شواهد هر چهار Browser Gate در Manifest ثبت شدند.
- `releaseCommit` عمداً از Manifest حذف شد تا Manifest مجبور به اشاره به Hash Commitی نباشد که خودش بخشی از آن Commit است.
- README فارسی/انگلیسی، Release Notes، Release Checklist، Docs index و Roadmap به وضعیت انتشار نهایی منتقل شدند.
- قرارداد Phase 152 برای نگهداری شواهد Candidate بعد از Finalization بازنویسی شد.
- شش تست Final Release اضافه شد؛ Gate نهایی مورد انتظار `581/581` است.

## قرارداد Commit نهایی

Tag annotated `v2.3.0` منبع حقیقت Commit نهایی انتشار است. بنابراین Tag فقط **بعد از** Commit و Push همین فاز ساخته می‌شود و Manifest هیچ `releaseCommit` خودارجاعی ندارد.

```powershell
git add .
git commit -m "chore(release): finalize 2.3.0"
git push
git tag -a v2.3.0 -m "Saatyar 2.3.0"
git push origin v2.3.0
```

## داده و Dependency

- Schema: v17
- Migration جدید: ندارد
- Dependency جدید: ندارد
- تغییر Product UI: ندارد
