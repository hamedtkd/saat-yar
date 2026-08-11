import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  appendDeviceTransferHistory,
  clearDeviceTransferHistory,
  DEVICE_TRANSFER_HISTORY_KEY,
  parseDeviceTransferHistory,
  readDeviceTransferHistory,
} from "../lib/device-transfer-history.ts";

const read = (path: string) => readFileSync(path, "utf8");

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem(key: string) { return values.get(key) ?? null; },
    setItem(key: string, value: string) { values.set(key, value); },
    removeItem(key: string) { values.delete(key); },
  };
}

test("vendored QR CommonJS has a narrowly scoped lint exception without weakening app rules", () => {
  const eslint = read("eslint.config.mjs");
  const declarations = read("lib/vendor/qrcode/vendor.d.ts");
  assert.match(eslint, /files: \["lib\/vendor\/qrcode\/\*\*\/\*\.cjs"\]/);
  assert.match(eslint, /"@typescript-eslint\/no-require-imports": "off"/);
  assert.doesNotMatch(eslint, /"@typescript-eslint\/no-explicit-any": "off"/);
  assert.match(declarations, /const value: unknown/);
});

test("QR scanner cleanup keeps the mounted video element instead of reading a mutable ref", () => {
  const scanner = read("components/pages/settings/device-pairing-qr-scanner.tsx");
  assert.match(scanner, /let videoElement: HTMLVideoElement \| null = null/);
  assert.match(scanner, /videoElement = videoRef\.current/);
  assert.match(scanner, /if \(videoElement\) videoElement\.srcObject = null/);
  assert.doesNotMatch(scanner, /if \(videoRef\.current\) videoRef\.current\.srcObject = null/);
});

test("device transfer history persists only compact transfer metadata and stays bounded", () => {
  const storage = memoryStorage();
  for (let index = 0; index < 7; index += 1) {
    appendDeviceTransferHistory({
      id: `transfer-${index}`,
      at: `2026-08-07T12:0${index}:00.000Z`,
      direction: index % 2 ? "sent" : "received",
      deviceName: index % 2 ? "رایانه" : "موبایل",
      status: index % 2 ? "acknowledged" : "applied",
      additions: index,
      conflicts: 0,
      mode: "merge",
      conflictResolution: "keep-local",
    }, storage);
  }
  const history = readDeviceTransferHistory(storage);
  assert.equal(history.length, 5);
  assert.equal(history[0]?.id, "transfer-6");
  assert.equal(Object.prototype.hasOwnProperty.call(history[0] ?? {}, "sessionKey"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(history[0] ?? {}, "data"), false);
  assert.ok(storage.getItem(DEVICE_TRANSFER_HISTORY_KEY));
  assert.deepEqual(clearDeviceTransferHistory(storage), []);
  assert.equal(storage.getItem(DEVICE_TRANSFER_HISTORY_KEY), null);
  assert.deepEqual(parseDeviceTransferHistory("not-json"), []);
});

test("sync settings expose session state, transfer history and a clear retry path", () => {
  const card = read("components/pages/settings/device-transfer-card.tsx");
  const history = read("components/pages/settings/device-transfer-history.tsx");
  const hook = read("hooks/use-device-transfer-pairing.ts");
  assert.match(card, /data-device-transfer-session-status/);
  assert.match(card, /<DeviceTransferHistory entries=\{pairing\.history\}/);
  assert.match(card, /s\("End session and start over"\)/);
  assert.match(history, /s\("Recent transfers"\)/);
  assert.match(history, /s\("This history stores only transfer metadata on this device; data content and session keys are never stored in it\."\)/);
  assert.match(hook, /useSyncExternalStore/);
  assert.match(hook, /appendDeviceTransferHistory/);
});

test("phase 117 is wired into quality and records sync UX hardening", () => {
  const packageJson = JSON.parse(read("package.json"));
  const roadmap = read("docs/roadmap/BACKLOG_FA.md");
  assert.match(packageJson.scripts.test, /phase117-sync-lint-history/);
  assert.match(roadmap, /\[x\] فاز ۱۱۷:.*Lint.*تاریخچه انتقال/);
});
