import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createInitialData } from "../lib/constants.ts";
import {
  applyDeviceTransfer,
  createDeviceTransferPayload,
  createDeviceTransferSessionKey,
  decryptDeviceTransferEnvelope,
  encryptDeviceTransferPayload,
  previewDeviceTransfer,
  verifyDeviceTransferPayload,
} from "../lib/device-transfer.ts";

const read = (path: string) => readFileSync(path, "utf8");

function devices() {
  const local = createInitialData({ onboarded: true });
  const incoming = createInitialData({ onboarded: true });
  local.settings.name = "لپ‌تاپ";
  incoming.settings.name = "موبایل";
  local.records["2026-08-01"] = { date: "2026-08-01", start: "08:00", end: "16:00", lunchMinutes: 30, breaks: [], leaveMinutes: 0, leaveType: "none", note: "local", holiday: false };
  incoming.records["2026-08-01"] = { ...local.records["2026-08-01"], note: "incoming" };
  incoming.records["2026-08-02"] = { ...local.records["2026-08-01"], date: "2026-08-02", note: "new" };
  local.clients.push({ id: "shared", name: "Local", color: "#000000", archived: false });
  incoming.clients.push({ id: "shared", name: "Incoming", color: "#000000", archived: false });
  incoming.clients.push({ id: "new", name: "New", color: "#ffffff", archived: false });
  return { local, incoming };
}

test("device transfer payload is versioned and checksum-protected", async () => {
  const { local } = devices();
  const payload = await createDeviceTransferPayload(local, { deviceId: "desktop-1", deviceName: "Laptop" }, "2026-08-07T10:00:00.000Z");
  assert.equal(payload.protocolVersion, 1);
  assert.equal(payload.appDataSchemaVersion, 17);
  assert.equal((await verifyDeviceTransferPayload(payload)).data.settings.name, "لپ‌تاپ");
  const tampered = structuredClone(payload);
  tampered.data.settings.name = "tampered";
  await assert.rejects(() => verifyDeviceTransferPayload(tampered), /Checksum/);
});

test("AES-GCM session encryption round-trips without exposing AppData in the envelope", async () => {
  const { local } = devices();
  const payload = await createDeviceTransferPayload(local, { deviceId: "desktop-1", deviceName: "Laptop" });
  const session = createDeviceTransferSessionKey();
  const encrypted = await encryptDeviceTransferPayload(payload, session);
  assert.equal(encrypted.algorithm, "AES-GCM-256");
  assert.equal("data" in encrypted, false);
  const decrypted = await decryptDeviceTransferEnvelope(encrypted, session);
  assert.equal(decrypted.transferId, payload.transferId);
  assert.equal(decrypted.data.settings.name, "لپ‌تاپ");
});

test("wrong session key cannot decrypt another device transfer", async () => {
  const { local } = devices();
  const payload = await createDeviceTransferPayload(local, { deviceId: "desktop-1", deviceName: "Laptop" });
  const sender = createDeviceTransferSessionKey();
  const wrong = createDeviceTransferSessionKey();
  const encrypted = await encryptDeviceTransferPayload(payload, sender);
  await assert.rejects(() => decryptDeviceTransferEnvelope(encrypted, wrong), /کلید نشست/);
});

test("preview reports additions and conflicts before any local data is mutated", () => {
  const { local, incoming } = devices();
  const preview = previewDeviceTransfer(local, incoming, "merge");
  assert.equal(preview.settingsChanged, true);
  assert.equal(preview.collections.records.additions, 1);
  assert.equal(preview.collections.records.conflicts, 1);
  assert.equal(preview.collections.clients.additions, 1);
  assert.equal(preview.collections.clients.conflicts, 1);
  assert.ok(preview.conflictCount >= 3);
  assert.equal(local.records["2026-08-02"], undefined);
});

test("merge can keep local conflicts while adding incoming-only data", () => {
  const { local, incoming } = devices();
  const merged = applyDeviceTransfer(local, incoming, { mode: "merge", conflicts: "keep-local" });
  assert.equal(merged.settings.name, "لپ‌تاپ");
  assert.equal(merged.records["2026-08-01"].note, "local");
  assert.equal(merged.records["2026-08-02"].note, "new");
  assert.equal(merged.clients.find((item) => item.id === "shared")?.name, "Local");
  assert.equal(merged.clients.some((item) => item.id === "new"), true);
});

test("merge can explicitly prefer incoming values on conflicts", () => {
  const { local, incoming } = devices();
  const merged = applyDeviceTransfer(local, incoming, { mode: "merge", conflicts: "use-incoming" });
  assert.equal(merged.settings.name, "موبایل");
  assert.equal(merged.records["2026-08-01"].note, "incoming");
  assert.equal(merged.clients.find((item) => item.id === "shared")?.name, "Incoming");
});

test("replace returns the incoming AppData contract without merging stale local collections", () => {
  const { local, incoming } = devices();
  local.clients.push({ id: "local-only", name: "Old", color: "#111111", archived: false });
  const replaced = applyDeviceTransfer(local, incoming, { mode: "replace" });
  assert.equal(replaced.settings.name, "موبایل");
  assert.equal(replaced.clients.some((item) => item.id === "local-only"), false);
});

test("phase 113 protocol is documented, dependency-free, and wired into quality", () => {
  const packageJson = JSON.parse(read("package.json"));
  assert.match(packageJson.scripts.test, /phase113-device-transfer-protocol/);
  assert.match(read("docs/roadmap/BACKLOG_FA.md"), /\[x\] فاز ۱۱۳:/);
  assert.match(read("lib/device-transfer-crypto.ts"), /AES-GCM/);
  assert.doesNotMatch(JSON.stringify(packageJson.dependencies), /qrcode|webrtc|peerjs/i);
});
