# فهرست قابلیت‌های نسخه بعدی ساعت‌یار — منبع Release/LinkedIn

این سند برای جمع‌کردن قابلیت‌های پس از 2.4.0 است تا هنگام Release Notes، پست LinkedIn، README و معرفی محصول چیزی جا نماند.

## تکمیل‌شده

- Phase 181 — Onboarding & First-run UX: Fast Setup، Skip، Apply برنامه به روزهای فعال و CTA شروع واضح.
- Phase 182 — Flexible Work Mode & Activity Segments: هدف مستقل، ساعت کاری منعطف، Segmentهای فعالیت و Breakdown گزارش.
- Phase 183 — Notification Intelligence: Quiet Hours، Snooze و چند Reminder سفارشی بر اساس Active Work Time.
- Phase 184 — Privacy-safe Product Analytics: Consent محلی، taxonomy امن و provider اختیاری بدون ارسال محتوای کاری.
- Phase 185 — Activity Graph & Month Intelligence: Heatmap، streak، Recent 7 Days، overtime/deficit intelligence.
- Phase 186 — Motion & Perceived Performance: route-aware skeleton، motion امن، reduced-motion و radial theme transition.
- Phase 187 — Google Calendar Read Integration: OAuth browser token، انتخاب Calendar و نمایش رویداد در Today/Month.
- Phase 188 — Google Calendar Write + Unified Month UX: Create/Edit/Delete Event، Modal مشترک، recurring delete، Google layer روی ماه من، Settings compact و sortable Month records table.
- Phase 189A — Calendar UX Polish & Weekly Accuracy: نمودار هفتگی واقعیِ همان هفته، Holiday/Leave context، لوگوی موبایل، Modal با Header/Footer ثابت، Toast CRUD، Quick Delete، CTA اتصال و Quick Create نزدیک جدول.
- Phase 189B — Settings IA + Calendar Day Quick Actions: Settings چندصفحه‌ای، Search/Deep-link route-aware، Context Menu هر روز در Month، Event CRUD سریع و Holiday/Workday override از خود تقویم.
- Phase 189C — Payroll Rate Basis & Standard Monthly Hours: اصلاح نرخ غیرواقعی اضافه‌کاری روش ماهانه، مبنای استاندارد ماه با پیش‌فرض ۲۲۰ ساعت قابل تنظیم، حالت اختیاری ساعات موظفی بازه و Live Preview نرخ ساعتی.
- Phase 190 — Calendar Intelligence: Full/Incremental Sync با syncToken و fallback 410، ETag conflict protection، duplicate/overlap intelligence، Day/Week planner، Event → Activity صریح و recurring occurrence/series editing ایمن.
- Phase 191 — Payroll & Reports Hardening: Payroll Period Facts مشترک، جلوگیری از masking کسری توسط تعطیل‌کاری، Paid Leave consistency و Rate Summary واحد برای base/overtime/holiday/deficit.
- Phase 192 — Behavioral Test Modernization: قرارداد pure برای Report Summary، تست رفتاری مشترک Reports/Payroll Preview و audit خودکار برای جلوگیری از رشد source/regex coupling در تست‌های جدید.

## Release 2.5.0

- Phase 193 — Release Candidate 2.5.0: بسته‌بندی فازهای 181–192، migration audit از v17 تا v20، manifest/notes دو‌زبانه و Release Matrix روی Candidate `d81e094` با 874/874 تست.
- Phase 194 — Finalization/Release: Final source با هدف 880/880؛ rollout فقط با ترتیب merge کنترل‌شده به `main` → deploy → `audit:production` → tag annotated `v2.5.0`.

## پیام‌های مهم برای معرفی نسخه

- Local-first بودن داده‌های کاری حفظ شده است.
- Google Calendar اختیاری است؛ کاربران بدون Google هیچ workflow اضافه‌ای نمی‌بینند.
- Google Event به‌صورت خودکار کارکرد یا حقوق تولید نمی‌کند.
- حریم خصوصی و least-privilege OAuth جزو قرارداد محصول است.


## پس از Release 2.5.0 — Trust & Measurement

- Phase 195 — OAuth Verification Readiness + GA4 Analytics: صفحات عمومی About/Help/Privacy/Terms، disclosure Google Calendar و GA4 privacy-safe.
- Phase 196 — GA4 Runtime + Leave Intelligence Hardening: ارسال واقعی GA4، opt-out محلی، Leave credit در Month/Recent 7 Days و اصلاح RTL نمودار هفتگی.
- Phase 197 — Tooltip System + Production Observability: Tooltip مشترک portal-safe/viewport-aware و گسترش remote production audit به routeهای عمومی جدید.
- Phase 198 — Onboarding + Freelancer Workflow Redesign: بازطراحی First-run، نرخ پروژه ساعتی/روزانه با نمایش مبلغ خوانا، و Project Timer واحد برای فضای Freelancer.

## Backlog پس از Phase 198

- Analytics Dashboard & Product Insights پیشرفته فعلاً ضروری نیست؛ GA4 فعلی برای فهم usage کلی کاربران کافی است و طراحی funnel/custom dimensions به backlog منتقل شد.
