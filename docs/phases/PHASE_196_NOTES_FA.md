# Phase 196 — GA4 Delivery + Leave-aware Month Intelligence

- GA4 configured builds now default anonymous product analytics to on, with explicit opt-out and advertising signals disabled.
- Consent Mode keeps analytics storage denied by default in EEA/UK/CH until an explicit grant.
- Standalone leave entries are projected into derived daily records without mutating AppData records.
- Month stats, Month Intelligence, activity tooltip, and Recent 7 Days distinguish worked minutes from leave credit.
- Full/half/hourly leave credit prevents registered leave from appearing as work deficit.
- Schema, dependency set, and package lock remain unchanged.

## R4 — GA delivery + month intelligence visual fixes

- GA4 loader از `document.createElement("script")` سفارشی به `next/script` منتقل شد تا مطابق راهنمای رسمی Next.js بعد از hydration بارگذاری شود.
- shim استاندارد `gtag(){ dataLayer.push(arguments) }` استفاده می‌شود و eventهای زودهنگام تا آماده‌شدن tag در buffer می‌مانند.
- pageview دستی حذف شد تا با Enhanced Measurement / history pageview خود GA4 دوباره‌شماری نشود؛ `route_viewed` به‌عنوان event محصولی coarse باقی می‌ماند.
- نوار هوشمندی ماه اکنون سه سهم اضافه‌کار، مرخصی و کسری را با رنگ‌های سبز، آبی و زرد نشان می‌دهد.
- نمودار کارکرد هفتگی در RTL داده‌ی نمایشی را معکوس می‌کند تا شنبه در سمت راست و جمعه در سمت چپ باشد؛ date key و محاسبات زمانی تغییر نکرده‌اند.
