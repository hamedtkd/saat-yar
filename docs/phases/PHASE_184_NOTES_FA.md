# Phase 184 — Privacy-safe Product Analytics

Baseline این فاز، سورس نهایی Phase 183 R4 روی شاخه `dev` است. Release تاریخی `v2.4.0` و Manifest آن دست‌نخورده روی AppData Schema v17 باقی می‌مانند؛ توسعه فعلی همچنان **Schema v19** است و این فاز Migration یا تغییر AppData ندارد.

## هدف

اندازه‌گیری Funnelهای محصول و کشف خطاهای UX بدون نقض Local-first بودن ساعت‌یار و بدون ارسال محتوای کاری یا مالی کاربر.

## تصمیم معماری

- Consent آمار محصول داخل AppData نیست؛ یک Preference مرورگر/دستگاه با کلید `saatyar-product-analytics-consent-v1` است و با Backup یا Device Transfer جابه‌جا نمی‌شود.
- پیش‌فرض `unset` است و تا Opt-in صریح هیچ درخواست Analytics ارسال نمی‌شود.
- رویدادهای امن پیش از تصمیم کاربر فقط در حافظه همان Runtime و با سقف محدود نگه داشته می‌شوند؛ با Opt-out پاک می‌شوند و با Reload از بین می‌روند.
- Provider پیش‌فرض `none` است. Adapter فعلی فقط Plausible را می‌پذیرد و تنها وقتی `NEXT_PUBLIC_ANALYTICS_PROVIDER=plausible` و `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` تنظیم شده باشند قابل ارسال است.
- از Script خودکار Pageview استفاده نشده؛ فقط Eventهای Allowlist‌شده از Adapter داخلی ارسال می‌شوند تا URL/query و محتوای آزاد وارد Telemetry نشود.
- Dependency جدید اضافه نشده است.

## Event taxonomy

رویدادهای مجاز:

- `route_viewed` فقط با Route enum شناخته‌شده.
- `feature_discovered` فقط با Feature enum.
- `onboarding_step_viewed` با شماره Step و Workspace mode.
- `onboarding_completed` با مسیر `advanced / fast-setup / skip`، Workspace mode و Scheduled/Flexible.
- `work_started` و `work_completed` فقط با Workspace mode و Timing mode.
- `feature_used` برای Activity Segments و Notification Intelligence.
- `ux_error` فقط با Area/Code عمومی؛ متن Exception ارسال نمی‌شود.

موارد ممنوع شامل حقوق، درآمد، نام Client/Project، Note، تاریخ تقویمی، ساعت دقیق، ID رکورد، Payload انتقال دستگاه و هر Free-text کاربر است.

## UX

- در Step حریم داده Onboarding کنترل صریح Allow / Keep off اضافه شد.
- در Settings > Safety یک کارت مستقل «Privacy-safe product analytics» اضافه شد.
- کارت Provider فعال را نشان می‌دهد و اگر Build Analytics config نداشته باشد Opt-in را غیرفعال و صریحاً اعلام می‌کند که هیچ درخواست آماری از دستگاه خارج نمی‌شود.
- Opt-out همیشه در دسترس است و به Save Draftهای AppData وابسته نیست.

## Provider review

برای این فاز Plausible به‌عنوان Adapter privacy-first انتخاب شد، اما ارسال به‌صورت opt-in و build-configured باقی می‌ماند. GA4/GTM در این مرحله فعال نشد تا Local-first contract به Cookie/Consent Mode و تگ‌های عمومی وابسته نشود. Umami به‌عنوان گزینه self-hosted آینده قابل بررسی است ولی این فاز backend جدیدی وارد Static Vercel deployment نمی‌کند.

## Gate

۶ Contract جدید به `tests/phase184-privacy-safe-product-analytics.test.ts` اضافه شده است. هدف Gate کامل: **796/796**.

Browser Smoke باید علاوه بر Contractهای Phase 183، وجود کنترل Analytics در Onboarding و Settings، Opt-out صریح و حالت no-provider/no-network-safe را بررسی کند.
