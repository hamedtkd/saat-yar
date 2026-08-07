const CACHE_NAME = "saatyar-shell-v6";
const STATIC_CACHE = "saatyar-static-v6";
const APP_ROUTES = ["", "today/", "month/", "leave/", "reports/", "clients/", "projects/", "invoices/", "settings/"];
const STATIC_ASSETS = [
  "manifest.webmanifest",
  "favicon.svg",
  "brand/saatyar-mark.svg",
  "brand/saatyar-mark-accent.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable-512.png",
  "og/saatyar-social-card.png",
];

const scopedUrl = (path) => new URL(path, self.registration.scope).toString();

async function warmCache(cacheName, paths) {
  const cache = await caches.open(cacheName);
  await Promise.allSettled(
    paths.map(async (path) => {
      const request = new Request(scopedUrl(path), { cache: "reload" });
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response);
    }),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(Promise.all([warmCache(CACHE_NAME, APP_ROUTES), warmCache(STATIC_CACHE, STATIC_ASSETS)]));
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => ![CACHE_NAME, STATIC_CACHE].includes(key)).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request))
      || (await cache.match(scopedUrl("today/")))
      || (await cache.match(scopedUrl("")))
      || new Response("ساعت‌یار در حالت آفلاین آماده نیست. پس از اتصال دوباره تلاش کنید.", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  const update = fetch(request).then((response) => {
    if (response.ok) void cache.put(request, response.clone());
    return response;
  }).catch(() => cached || Response.error());
  return cached || update;
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;
  if (event.request.mode === "navigate") {
    event.respondWith(networkFirst(event.request));
    return;
  }
  if (["style", "script", "image", "font"].includes(event.request.destination)) {
    event.respondWith(staleWhileRevalidate(event.request));
  }
});
