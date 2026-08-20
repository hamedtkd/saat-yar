# Release Checklist — Saatyar 2.6.1

## Source

- [ ] branch از Release 2.6.0 شروع شده باشد.
- [ ] `package.json` و `package-lock.json` روی 2.6.1 باشند.
- [ ] AppData همچنان v21 باشد.
- [ ] GA4 runtime و consent controls در source فعال وجود نداشته باشند.
- [ ] Cloudflare Beacon فقط با token معتبر load شود.
- [ ] هیچ custom work event به Analytics ارسال نشود.

## Cloudflare / Vercel

- [ ] Site ساعت‌یار در Cloudflare Web Analytics ساخته شود.
- [ ] `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` در Vercel Production تنظیم شود.
- [ ] token در Git commit نشده باشد.

## Local gate

```powershell
nvm use 22.16.0
npm ci
npm run check:release:candidate:2.6.1
git diff --check
git diff -- package-lock.json
```

خروجی مورد انتظار Node test: `976/976`.

`package-lock.json` در این patch باید فقط دو خط version ریشه را از `2.6.0` به `2.6.1` تغییر داده باشد؛ dependency metadata نباید تغییر کند.

## Production

- [ ] main deploy مربوط به commit نهایی Ready باشد.
- [ ] `npm run audit:production` پاس شود.
- [ ] Cloudflare Beacon در Production قابل مشاهده باشد.
- [ ] در Production هیچ request به `googletagmanager.com` یا Google Analytics برای Analytics وجود نداشته باشد.
- [ ] Cloudflare Dashboard page view دریافت کند.

## Tag

فقط بعد از Production Audit:

```powershell
git tag -a v2.6.1 -m "Saatyar 2.6.1"
git push origin v2.6.1
```
