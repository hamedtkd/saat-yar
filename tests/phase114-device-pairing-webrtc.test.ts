import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  createPairingLink,
  decodeDevicePairingSignal,
  encodeDevicePairingSignal,
  extractPairingCode,
} from "../lib/device-pairing-codec.ts";
import {
  DEVICE_PAIRING_PROTOCOL,
  DEVICE_PAIRING_VERSION,
  type DevicePairingOffer,
} from "../lib/device-pairing-types.ts";
import { createDeviceTransferSessionKey } from "../lib/device-transfer-crypto.ts";

const read = (path: string) => readFileSync(path, "utf8");

function offer(): DevicePairingOffer {
  const now = Date.now();
  return {
    protocol: DEVICE_PAIRING_PROTOCOL,
    version: DEVICE_PAIRING_VERSION,
    kind: "offer",
    pairingId: "pair-1",
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + 60_000).toISOString(),
    source: { deviceId: "desktop", deviceName: "رایانه", platform: "Windows" },
    sessionKey: createDeviceTransferSessionKey(),
    description: { type: "offer", sdp: "v=0\r\na=ice-ufrag:test\r\n" },
  };
}

test("WebCrypto inputs are copied to real ArrayBuffer values for TypeScript 5.9 DOM overloads", () => {
  const cryptoSource = read("lib/device-transfer-crypto.ts");
  const payloadSource = read("lib/device-transfer-payload.ts");
  assert.match(cryptoSource, /toArrayBuffer\(bytes\)/);
  assert.match(cryptoSource, /iv: toArrayBuffer\(iv\)/);
  assert.match(cryptoSource, /toArrayBuffer\(textToBytes/);
  assert.match(cryptoSource, /toArrayBuffer\(base64UrlToBytes/);
  assert.match(payloadSource, /digest\("SHA-256", toArrayBuffer/);
});

test("pairing offer round-trips through a compact session code", () => {
  const original = offer();
  const code = encodeDevicePairingSignal(original);
  const decoded = decodeDevicePairingSignal(code);
  assert.equal(decoded.kind, "offer");
  assert.equal(decoded.pairingId, original.pairingId);
  assert.equal(decoded.description.sdp, original.description.sdp);
});

test("pairing links keep the bearer secret in the URL fragment", () => {
  const code = encodeDevicePairingSignal(offer());
  const link = createPairingLink(code, "https://saatyar.example");
  assert.match(link, /^https:\/\/saatyar\.example\/settings#device-pair=/);
  assert.equal(extractPairingCode(link), code);
  assert.equal(link.includes("?device-pair="), false);
});

test("expired pairing offers are rejected before WebRTC setup", () => {
  const stale = offer();
  stale.expiresAt = new Date(Date.now() - 1_000).toISOString();
  assert.throws(() => decodeDevicePairingSignal(encodeDevicePairingSignal(stale)), /منقضی/);
});

test("WebRTC pairing is dependency-free and uses a direct ordered data channel", () => {
  const peer = read("lib/device-pairing-peer.ts");
  const channel = read("lib/device-pairing-channel.ts");
  const packageJson = JSON.parse(read("package.json"));
  assert.match(peer, /new RTCPeerConnection\(\{ iceServers: \[\] \}\)/);
  assert.match(peer, /createDataChannel\("saatyar-transfer", \{ ordered: true \}\)/);
  assert.match(channel, /CHUNK_SIZE = 12_000/);
  assert.doesNotMatch(JSON.stringify(packageJson.dependencies), /peerjs|simple-peer|qrcode/i);
});

test("settings exposes send receive preview and safe merge flows", () => {
  const page = read("components/pages/settings/settings-page.tsx");
  const card = read("components/pages/settings/device-transfer-card.tsx");
  const preview = read("components/pages/settings/device-transfer-preview.tsx");
  assert.match(page, /<DeviceTransferCard data=\{data\}/);
  assert.match(card, /ارسال از این دستگاه/);
  assert.match(card, /دریافت روی این دستگاه/);
  assert.match(card, /ارسال داده رمزنگاری‌شده/);
  assert.match(preview, /ادغام امن/);
  assert.match(preview, /جایگزینی کامل/);
});

test("phase 114 is wired into quality and QR camera UX stays explicit in the roadmap", () => {
  const packageJson = JSON.parse(read("package.json"));
  const roadmap = read("docs/roadmap/BACKLOG_FA.md");
  assert.match(packageJson.scripts.test, /phase114-device-pairing-webrtc/);
  assert.match(roadmap, /\[x\] فاز ۱۱۴:/);
  assert.match(roadmap, /\[ \] فاز ۱۱۵:.*QR/);
});
