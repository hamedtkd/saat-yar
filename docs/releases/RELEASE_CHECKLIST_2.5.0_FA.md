# چک‌لیست Final Release ساعت‌یار 2.5.0

Candidate معتبر: `d81e094` — Phase 193 — `874/874`

## Final source روی dev

- [ ] `npm run release:prepare:2.5.0` روی `dev` و Candidate `d81e094` پاس شود.
- [ ] `package.json` و `package-lock.json` روی `2.5.0` باشند.
- [ ] Manifest نهایی `2.5.0` روی Schema v20 و status `released` باشد.
- [ ] Manifest تاریخی `2.4.0` روی Schema v17 immutable بماند.
- [ ] هیچ `releaseCommit` خودارجاع در Manifest ثبت نشود.
- [ ] Node gate نهایی **880/880** باشد.
- [ ] Production/Freelancer/Employee browser smoke، Pairing و Vercel audit سبز باشند.

## Rollout اجباری

1. Finalization commit روی `dev` ساخته و push شود.
2. همان commit به‌صورت کنترل‌شده به `main` منتقل شود.
3. Deploy production کامل شود.
4. `npm run audit:production` روی production PASS شود.
5. فقط بعد از Production Audit، tag annotated ساخته شود:

```powershell
git tag -a v2.5.0 -m "Saatyar 2.5.0"
git push origin v2.5.0
```

Tag قبل از Production Audit ممنوع است.
