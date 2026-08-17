# Phase 189B — Settings Information Architecture + Calendar Day Quick Actions

## هدف

این فاز دو مسئله UX باقی‌مانده پس از Phase 189A را می‌بندد:

1. صفحه‌ی سنگین و طولانی `/settings` به چند Route مستقل و قابل Deep-link تقسیم شود.
2. تقویم «ماه من» برای هر روز یک مسیر Quick Action واقعی داشته باشد تا کاربر بدون اسکرول یا رفتن به Settings بتواند رویداد و وضعیت تعطیلی همان روز را مدیریت کند.

## Settings Information Architecture

`/settings` اکنون Overview است و دسته‌های سنگین در Routeهای مستقل باز می‌شوند:

- `/settings/profile`
- `/settings/appearance`
- `/settings/work`
- `/settings/payroll`
- `/settings/notifications`
- `/settings/integrations`
- `/settings/data`
- `/settings/sync`
- `/settings/privacy`

Search، Desktop/Mobile Settings Navigation، Profile deep-link و Unsaved Draft Guard همگی از یک destination model مشترک استفاده می‌کنند. Subrouteهای Settings همچنان از نگاه RouteGuard، Product Analytics، Locale Runtime و Multi-tab Sync یک Tab واحد به نام `settings` هستند.

## Calendar Day Quick Actions

روی خانه‌های تقویم Month، Context Menu مرورگر با منوی داخلی ساعت‌یار جایگزین شده است. مسیر Keyboard استاندارد `ContextMenu` و `Shift+F10` نیز پشتیبانی می‌شود.

منوی روز شامل این مسیرهاست:

- رفتن به جزئیات و ویرایش همان روز
- ساخت سریع Google Calendar Event برای همان تاریخ
- ویرایش/حذف سریع Eventهای قابل‌ویرایش همان روز
- Mark as Holiday / Mark as Workday
- بازگشت از Override دستی به قوانین خودکار تعطیلات

Holiday override فقط در `holidayOverrides` ساعت‌یار ثبت می‌شود و Google Holiday یا Google Event همچنان Source of Truth محاسبات حضور/حقوق نیست.

## Weekly chart note

توضیح طولانی Phase 189A از پایین کارت Weekly Chart حذف شد و به `DescriptionTooltip` مشترک منتقل شد تا با الگوی بقیه‌ی سایت یکدست باشد.

## قرارداد داده و Dependency

- Development AppData: **Schema v19**
- Released 2.4.0 AppData: **Schema v17**
- بدون Schema bump
- بدون migration جدید
- بدون dependency جدید
- `package-lock.json` نباید به‌دلیل این فاز تغییر کند.

## Gate

Gate هدف پس از اضافه‌شدن قراردادهای این فاز:

- 843/843 Node tests
- Next static build
- Production Browser Smoke شامل Settings subroutes
- Freelancer / Employee / Pairing browser smoke
- Vercel static export audit
- `git diff --check`
- بدون diff ناخواسته در `package-lock.json`

## Revision R2 — historical ownership test alignment

- پس از split شدن Settings به routeهای مستقل، پنج تست تاریخی هنوز owner قدیمی `app/settings/page.tsx` یا prop-shape قبل از route split را جستجو می‌کردند.
- قراردادهای Phase 72/77/78/114 به owner واقعی جدید (`settings-route-entry.tsx` و `settings-page.tsx` روی route `sync`) منتقل شدند؛ رفتار محصول تغییری نکرد.
- قرارداد Phase 177 نیز با browser labels جدید routeهای Profile/Sync/Notifications/Privacy/Integrations هم‌راستا شد.
- این Revision فقط test ownership/documentation hardening است؛ Schema، dependency، package lock و Product UI/behavior تغییر نکرده‌اند.

## Revision R3 — profile-route locale smoke hardening

- Gate R2 تمام 843 تست Node و build را پاس کرد، اما Production Browser Smoke در سوییچ زبان روی `/settings/profile` منتظر عنوان قدیمی Root Settings یعنی `Settings & data` ماند.
- خود UI در همان لحظه English/LTR و Gregorian شده بود؛ failure فقط از predicate قدیمی harness بود.
- Browser smoke اکنون روی markerهای ساختاری `#settings-profile` و `data-settings-language` تکیه می‌کند و همچنان `lang/dir/calendar/localStorage` را بررسی می‌کند.
- Product/UI، Settings IA، Calendar Day Actions، Schema، dependency و package lock در این Revision تغییر نکرده‌اند.
