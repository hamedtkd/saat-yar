import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createInitialData } from "../lib/constants.ts";
import { listenForDeviceTransferEnvelope, sendDeviceTransferEnvelope } from "../lib/device-pairing-channel.ts";
import {
  applyDeviceTransfer,
  createDeviceTransferPayload,
  createDeviceTransferSessionKey,
  decryptDeviceTransferEnvelope,
  encryptDeviceTransferPayload,
  previewDeviceTransfer,
} from "../lib/device-transfer.ts";
import type { EncryptedDeviceTransferEnvelope } from "../lib/device-transfer-types.ts";

const read = (path: string) => readFileSync(path, "utf8");

type MessageListener = (event: MessageEvent<string>) => void;

class MemoryDataChannel {
  readyState = "open" as const;
  peer?: MemoryDataChannel;
  listeners = new Set<MessageListener>();

  send(value: string) {
    const peer = this.peer;
    if (!peer) throw new Error("Memory channel is not paired.");
    queueMicrotask(() => {
      const event = new MessageEvent<string>("message", { data: value });
      for (const listener of peer.listeners) listener(event);
    });
  }

  addEventListener(type: string, listener: EventListenerOrEventListenerObject) {
    if (type === "message" && typeof listener === "function") this.listeners.add(listener as MessageListener);
  }

  removeEventListener(type: string, listener: EventListenerOrEventListenerObject) {
    if (type === "message" && typeof listener === "function") this.listeners.delete(listener as MessageListener);
  }
}

function channelPair() {
  const left = new MemoryDataChannel();
  const right = new MemoryDataChannel();
  left.peer = right;
  right.peer = left;
  return { left, right };
}

function deviceData() {
  const laptop = createInitialData({ onboarded: true });
  const mobile = createInitialData({ onboarded: true });
  laptop.settings.name = "لپ‌تاپ";
  mobile.settings.name = "موبایل";
  laptop.records["2026-08-01"] = { date: "2026-08-01", start: "08:00", end: "16:00", lunchMinutes: 30, breaks: [], leaveMinutes: 0, leaveType: "none", note: "local", holiday: false };
  mobile.records["2026-08-01"] = { ...laptop.records["2026-08-01"], note: "incoming" };
  mobile.records["2026-08-02"] = { ...laptop.records["2026-08-01"], date: "2026-08-02", note: "mobile-only" };
  return { laptop, mobile };
}

test("encrypted device transfer completes chunking, ACK, preview and safe merge end to end", async () => {
  const { laptop, mobile } = deviceData();
  const session = createDeviceTransferSessionKey();
  const payload = await createDeviceTransferPayload(mobile, { deviceId: "mobile-1", deviceName: "Mobile" });
  const envelope = await encryptDeviceTransferPayload(payload, session);
  const { left: sender, right: receiver } = channelPair();

  let acknowledged = "";
  const ackPromise = new Promise<void>((resolve) => {
    listenForDeviceTransferEnvelope(sender as unknown as RTCDataChannel, () => {}, (transferId) => {
      acknowledged = transferId;
      resolve();
    });
  });

  const receivedPromise = new Promise<EncryptedDeviceTransferEnvelope>((resolve) => {
    listenForDeviceTransferEnvelope(receiver as unknown as RTCDataChannel, resolve);
  });

  sendDeviceTransferEnvelope(sender as unknown as RTCDataChannel, envelope);
  const received = await receivedPromise;
  await ackPromise;
  assert.equal(acknowledged, envelope.transferId);

  const decrypted = await decryptDeviceTransferEnvelope(received, session);
  const preview = previewDeviceTransfer(laptop, decrypted.data, "merge");
  assert.ok(preview.conflictCount >= 2);
  assert.equal(preview.collections.records.additions, 1);

  const merged = applyDeviceTransfer(laptop, decrypted.data, { mode: "merge", conflicts: "keep-local" });
  assert.equal(merged.settings.name, "لپ‌تاپ");
  assert.equal(merged.records["2026-08-01"].note, "local");
  assert.equal(merged.records["2026-08-02"].note, "mobile-only");
});

test("phase 115 test stays compatible with the repository ES2017 target", () => {
  const source = read("tests/phase115-local-qr-pairing.test.ts");
  assert.equal(/\/s(?:[^a-z]|$)/.test(source), false);
  assert.match(source, /\[\\s\\S\]\*/);
});

test("offline navigation has a bounded network wait before cache fallback", () => {
  const worker = read("public/sw.js");
  assert.match(worker, /NAVIGATION_NETWORK_TIMEOUT_MS = 2_500/);
  assert.match(worker, /new AbortController\(\)/);
  assert.match(worker, /fetch\(request, \{ signal: controller\.signal \}\)/);
  assert.match(worker, /controller\.abort\(\)/);
});

test("repository exposes an opt-in real browser WebRTC data-channel smoke", () => {
  const packageJson = JSON.parse(read("package.json"));
  const browserSmoke = read("scripts/device-pairing-browser-smoke.mjs");
  assert.match(packageJson.scripts["test:browser:pairing"], /device-pairing-browser-smoke/);
  assert.equal(packageJson.scripts["check:release"].includes("test:browser:pairing"), false);
  assert.match(browserSmoke, /new RTCPeerConnection/);
  assert.match(browserSmoke, /saatyar-transfer/);
  assert.match(browserSmoke, /kind: "ack"/);
  assert.match(browserSmoke, /AES-GCM/);
  assert.match(browserSmoke, /encrypted Saatyar chunks/);
});

test("phase 116 is wired into quality and documented as transfer hardening", () => {
  const packageJson = JSON.parse(read("package.json"));
  const roadmap = read("docs/roadmap/BACKLOG_FA.md");
  assert.match(packageJson.scripts.test, /phase116-device-transfer-e2e/);
  assert.match(roadmap, /\[x\] فاز ۱۱۶:.*End-to-End/);
});
