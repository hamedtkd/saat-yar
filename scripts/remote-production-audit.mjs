import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

export const DEFAULT_PRODUCTION_URL = "https://saat-yar.vercel.app/";

const EXPECTED_ROUTE_PATHS = [
  "/",
  "/today/",
  "/month/",
  "/leave/",
  "/reports/",
  "/clients/",
  "/projects/",
  "/invoices/",
  "/settings/",
  "/about/",
];

const EXPECTED_ICON_PATHS = [
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-512.png",
];

const REQUEST_TIMEOUT_MS = 20_000;

function normalizeBaseUrl(value) {
  const url = new URL(value || DEFAULT_PRODUCTION_URL);
  if (url.protocol !== "https:") {
    throw new Error(`Production audit requires HTTPS: ${url.toString()}`);
  }
  url.hash = "";
  url.search = "";
  if (!url.pathname.endsWith("/")) url.pathname += "/";
  return url;
}

function sameOriginPath(base, path) {
  return new URL(path.replace(/^\//, ""), base);
}

async function request(url, { binary = false } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal,
      headers: { "user-agent": "Saatyar-Production-Audit/1.0" },
    });
    const body = binary ? new Uint8Array(await response.arrayBuffer()) : await response.text();
    return { response, body };
  } finally {
    clearTimeout(timeout);
  }
}

function assertOk(label, response, expectedOrigin) {
  if (!response.ok) throw new Error(`${label} returned HTTP ${response.status}: ${response.url}`);
  const finalUrl = new URL(response.url);
  if (finalUrl.origin !== expectedOrigin) {
    throw new Error(`${label} redirected outside the production origin: ${response.url}`);
  }
}

function assertHtmlContract(path, html) {
  if (!/<html[^>]*\blang=["']fa["']/i.test(html)) throw new Error(`${path} is missing html[lang=fa].`);
  if (!/<html[^>]*\bdir=["']rtl["']/i.test(html)) throw new Error(`${path} is missing html[dir=rtl].`);
  if (!/manifest\.webmanifest/i.test(html)) throw new Error(`${path} is missing the PWA manifest link.`);
  if (!html.includes("ساعت‌یار")) throw new Error(`${path} does not expose the Saatyar product identity.`);
  if (/Internal Server Error|Application error: a client-side exception/i.test(html)) {
    throw new Error(`${path} contains an application error marker.`);
  }
}

function assertManifestContract(manifest) {
  if (manifest?.name !== "ساعت‌یار" || manifest?.short_name !== "ساعت‌یار") {
    throw new Error(`Manifest identity mismatch: ${JSON.stringify({ name: manifest?.name, short_name: manifest?.short_name })}`);
  }
  if (manifest?.dir !== "rtl" || manifest?.lang !== "fa" || manifest?.display !== "standalone") {
    throw new Error(`Manifest locale/display mismatch: ${JSON.stringify({ dir: manifest?.dir, lang: manifest?.lang, display: manifest?.display })}`);
  }
  if (manifest?.start_url !== "/today/") throw new Error(`Manifest start_url mismatch: ${manifest?.start_url}`);
  if (!Array.isArray(manifest?.icons) || manifest.icons.length < 3) throw new Error("Manifest does not expose the expected install icons.");
}

function extractSitemapLocations(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

export function parsePrecacheEntries(source) {
  const match = source.match(/self\.__SAATYAR_PRECACHE\s*=\s*(\[[\s\S]*?\])\s*;/);
  if (!match) throw new Error("PWA precache manifest does not expose self.__SAATYAR_PRECACHE.");
  let entries;
  try {
    entries = JSON.parse(match[1]);
  } catch {
    throw new Error("PWA precache manifest does not contain a valid JSON asset array.");
  }
  if (!Array.isArray(entries) || entries.some((entry) => typeof entry !== "string")) {
    throw new Error("PWA precache manifest asset list is invalid.");
  }
  return entries;
}

export function normalizePrecachePath(path) {
  return path.replace(/^\/+/, "");
}

export function isNextStaticAsset(path) {
  return normalizePrecachePath(path).startsWith("_next/static/");
}

export async function runRemoteProductionAudit(inputUrl = process.env.SAATYAR_PRODUCTION_URL || DEFAULT_PRODUCTION_URL) {
  const base = normalizeBaseUrl(inputUrl);
  const origin = base.origin;
  console.log(`Saatyar production audit: ${base.toString()}`);

  for (const path of EXPECTED_ROUTE_PATHS) {
    const url = sameOriginPath(base, path);
    const { response, body } = await request(url);
    assertOk(`Route ${path}`, response, origin);
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("text/html")) throw new Error(`Route ${path} is not HTML: ${contentType}`);
    assertHtmlContract(path, body);
  }
  console.log(`✓ ${EXPECTED_ROUTE_PATHS.length} production routes return the Persian RTL app shell`);

  const manifestUrl = sameOriginPath(base, "/manifest.webmanifest");
  const manifestResult = await request(manifestUrl);
  assertOk("PWA manifest", manifestResult.response, origin);
  let manifest;
  try {
    manifest = JSON.parse(manifestResult.body);
  } catch {
    throw new Error("PWA manifest is not valid JSON.");
  }
  assertManifestContract(manifest);
  console.log("✓ PWA manifest exposes Saatyar standalone/RTL install metadata");

  const swResult = await request(sameOriginPath(base, "/sw.js"));
  assertOk("Service worker", swResult.response, origin);
  if (!/importScripts\(["']pwa-precache-manifest\.js["']\)/.test(swResult.body) || !/saatyar-shell-v\d+/.test(swResult.body)) {
    throw new Error("Service worker does not expose the expected Saatyar cache/precache contract.");
  }

  const precacheResult = await request(sameOriginPath(base, "/pwa-precache-manifest.js"));
  assertOk("PWA precache manifest", precacheResult.response, origin);
  const precacheEntries = parsePrecacheEntries(precacheResult.body);
  const buildAssets = precacheEntries.filter(isNextStaticAsset);
  if (buildAssets.length < 1) {
    throw new Error(`Production PWA precache manifest contains no Next.js build assets. Entries: ${JSON.stringify(precacheEntries.slice(0, 5))}`);
  }

  const firstBuildAsset = `/${normalizePrecachePath(buildAssets[0])}`;
  const firstBuildAssetResult = await request(sameOriginPath(base, firstBuildAsset));
  assertOk(`Precached build asset ${firstBuildAsset}`, firstBuildAssetResult.response, origin);
  console.log(`✓ Service worker and generated precache are live (${buildAssets.length} build asset reference(s))`);

  for (const path of EXPECTED_ICON_PATHS) {
    const { response, body } = await request(sameOriginPath(base, path), { binary: true });
    assertOk(`Icon ${path}`, response, origin);
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("image/png") || body.byteLength < 256) {
      throw new Error(`Install icon ${path} is invalid (${contentType}, ${body.byteLength} bytes).`);
    }
  }
  console.log("✓ Install icons are reachable as non-empty PNG assets");

  const robotsResult = await request(sameOriginPath(base, "/robots.txt"));
  assertOk("robots.txt", robotsResult.response, origin);
  if (!/User-agent:\s*\*/i.test(robotsResult.body) || !robotsResult.body.includes(`${origin}/sitemap.xml`)) {
    throw new Error("robots.txt does not advertise the production sitemap.");
  }

  const sitemapResult = await request(sameOriginPath(base, "/sitemap.xml"));
  assertOk("sitemap.xml", sitemapResult.response, origin);
  const locations = extractSitemapLocations(sitemapResult.body);
  const locationPaths = new Set(locations.map((value) => {
    try { return new URL(value).pathname; } catch { return ""; }
  }));
  for (const path of EXPECTED_ROUTE_PATHS) {
    if (!locationPaths.has(path)) throw new Error(`sitemap.xml is missing ${path}`);
  }
  console.log(`✓ robots.txt and sitemap.xml expose all ${EXPECTED_ROUTE_PATHS.length} audited routes`);

  console.log("Remote production audit passed.");
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isDirectRun) {
  const inputUrl = process.argv[2] || process.env.SAATYAR_PRODUCTION_URL || DEFAULT_PRODUCTION_URL;
  runRemoteProductionAudit(inputUrl).catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
