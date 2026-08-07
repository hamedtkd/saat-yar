import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(path, "utf8");

function pngSize(path: string) {
  const buffer = readFileSync(path);
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

test("PWA install identity uses the approved Saatyar mark and compact app name", () => {
  const manifest = read("app/manifest.ts");
  assert.match(manifest, /name: SITE_NAME,/);
  assert.match(manifest, /short_name: SITE_NAME,/);
  assert.doesNotMatch(manifest, /name: `\$\{SITE_NAME\} — مدیریت زمان و کارکرد`/);
  assert.match(read("public/icons/app-icon-source.svg"), /saatyar-app-mark\.svg/);
  assert.match(read("public/icons/maskable-icon-source.svg"), /saatyar-app-mark\.svg/);
});

test("install icons keep dedicated any and maskable assets at production sizes", () => {
  assert.deepEqual(pngSize("public/icons/icon-192.png"), { width: 192, height: 192 });
  assert.deepEqual(pngSize("public/icons/icon-512.png"), { width: 512, height: 512 });
  assert.deepEqual(pngSize("public/icons/maskable-512.png"), { width: 512, height: 512 });
  assert.deepEqual(pngSize("app/apple-icon.png"), { width: 180, height: 180 });
  assert.deepEqual(pngSize("public/fav-256.png"), { width: 256, height: 256 });
});

test("service worker cache version invalidates stale PWA icon assets", () => {
  const sw = read("public/sw.js");
  const shellVersion = sw.match(/saatyar-shell-v(\d+)/)?.[1];
  const staticVersion = sw.match(/saatyar-static-v(\d+)/)?.[1];
  assert.ok(shellVersion);
  assert.equal(shellVersion, staticVersion);
  assert.ok(Number(shellVersion) >= 5);
  assert.match(sw, /icons\/icon-192\.png/);
  assert.match(sw, /icons\/maskable-512\.png/);
});

test("roadmap captures customizable payroll and QR peer-to-peer transfer", () => {
  const backlog = read("docs/roadmap/BACKLOG_FA.md");
  assert.match(backlog, /فاز ۱۱۰: طراحی قرارداد و Schema موتور محاسبه حقوق قابل‌سفارشی‌سازی/);
  assert.match(backlog, /فاز ۱۱۳: Pairing سریع موبایل و لپ‌تاپ با QR و WebRTC DataChannel/);
  const notes = read("docs/phases/PHASE_105_NOTES_FA.md");
  assert.match(notes, /Cloud Sync دائمی/);
  assert.match(notes, /RTCDataChannel/);
});

test("phase 105 contract is part of the main quality command", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.ok(pkg.scripts.test.split(/\s+/).includes("tests/phase105-pwa-identity-roadmap.test.ts"));
});
