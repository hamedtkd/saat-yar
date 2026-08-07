import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  addDevicePairingQrFrame,
  createDevicePairingQrFrames,
  getDevicePairingQrProgress,
} from "../lib/device-pairing-qr.ts";
import { createLocalQrMatrix, createQrSvgPath } from "../lib/local-qr.ts";

const read = (path: string) => readFileSync(path, "utf8");

test("phase 114 TypeScript narrowing regression is removed", () => {
  const card = read("components/pages/settings/device-transfer-card.tsx");
  assert.doesNotMatch(card, /\(pairing\.role === "idle" \|\| pairing\.role === "receiver"\).*pairing\.role !== "sender"/s);
  assert.match(card, /pairing\.role === "idle" \|\| pairing\.role === "receiver"/);
});

test("large pairing codes round-trip through deterministic multi-frame QR payloads", () => {
  const original = `saatyar-pair:${"A".repeat(2500)}`;
  const frames = createDevicePairingQrFrames(original);
  assert.ok(frames.length > 1);
  assert.ok(frames.every((frame) => frame.startsWith("SYQR1|")));
  let collection = null;
  let completeCode: string | null = null;
  for (const frame of [...frames].reverse()) {
    const result = addDevicePairingQrFrame(collection, frame);
    collection = result.collection;
    completeCode = result.completeCode;
  }
  assert.equal(completeCode, original);
  assert.deepEqual(getDevicePairingQrProgress(collection), { current: frames.length, total: frames.length });
});

test("vendored local QR encoder creates a scannable matrix contract without a network dependency", () => {
  const frame = createDevicePairingQrFrames(`saatyar-pair:${"B".repeat(1000)}`)[0];
  const matrix = createLocalQrMatrix(frame);
  assert.ok(matrix.size >= 21);
  assert.equal(matrix.size % 4, 1);
  assert.equal(matrix.cells.length, matrix.size);
  assert.ok(createQrSvgPath(matrix).startsWith("M"));
  const packageJson = JSON.parse(read("package.json"));
  assert.doesNotMatch(JSON.stringify(packageJson.dependencies), /qrcode|zxing|qr-scanner/i);
});

test("pairing QR is generated and scanned locally with animated frame support", () => {
  const display = read("components/pages/settings/device-pairing-qr-display.tsx");
  const scanner = read("components/pages/settings/device-pairing-qr-scanner.tsx");
  const card = read("components/pages/settings/device-transfer-card.tsx");
  assert.match(display, /createDevicePairingQrFrames/);
  assert.match(display, /setInterval/);
  assert.match(scanner, /BarcodeDetector/);
  assert.match(scanner, /getUserMedia/);
  assert.match(scanner, /addDevicePairingQrFrame/);
  assert.match(card, /<DevicePairingQrDisplay/);
  assert.match(card, /<DevicePairingQrScanner/);
  assert.doesNotMatch(display + scanner + card, /api\.qrserver|chart\.googleapis|quickchart|qrcode\.monkey/i);
});

test("QR camera flow keeps Copy/Paste as a safe fallback", () => {
  const card = read("components/pages/settings/device-transfer-card.tsx");
  const scanner = read("components/pages/settings/device-pairing-qr-scanner.tsx");
  assert.match(card, /کپی کد/);
  assert.match(card, /Copy\/Paste/);
  assert.match(scanner, /اسکن QR داخل این مرورگر در دسترس نیست/);
});

test("phase 115 is wired into quality and closes the QR pairing roadmap", () => {
  const packageJson = JSON.parse(read("package.json"));
  const roadmap = read("docs/roadmap/BACKLOG_FA.md");
  assert.match(packageJson.scripts.test, /phase115-local-qr-pairing/);
  assert.match(roadmap, /\[x\] فاز ۱۱۵:.*QR/);
});
