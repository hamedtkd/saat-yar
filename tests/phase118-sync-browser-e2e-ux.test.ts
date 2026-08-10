import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { getDeviceTransferSessionView } from "../lib/device-transfer-session-ui.ts";

const read = (path: string) => readFileSync(path, "utf8");

test("sync session steps expose a deterministic path from pairing to completion", () => {
  assert.deepEqual(getDeviceTransferSessionView("idle", "idle"), {
    currentStep: 0,
    completed: false,
    label: "آماده Pairing",
  });
  assert.equal(getDeviceTransferSessionView("sender", "waiting").currentStep, 2);
  assert.equal(getDeviceTransferSessionView("receiver", "received").currentStep, 3);
  assert.deepEqual(getDeviceTransferSessionView("receiver", "completed"), {
    currentStep: 4,
    completed: true,
    label: "انتقال این نشست تکمیل شد",
  });
});

test("QR scan advances sender and receiver flows without a redundant confirmation click", () => {
  const card = read("components/pages/settings/device-transfer-card.tsx");
  const hook = read("hooks/use-device-transfer-pairing.ts");
  assert.match(card, /pairing\.role === "sender"\) void pairing\.acceptAnswer\(code\)/);
  assert.match(card, /else void pairing\.startReceiver\(code\)/);
  assert.match(hook, /startReceiver = React\.useCallback\(async \(code = remoteCode\)/);
  assert.match(hook, /acceptAnswer = React\.useCallback\(async \(code = remoteCode\)/);
});

test("sync UI shows progress completion and an explicit safe rejection path", () => {
  const card = read("components/pages/settings/device-transfer-card.tsx");
  const steps = read("components/pages/settings/device-transfer-steps.tsx");
  const preview = read("components/pages/settings/device-transfer-preview.tsx");
  assert.match(card, /<DeviceTransferSteps role=\{pairing\.role\} state=\{pairing\.state\}/);
  assert.match(card, /pairing\.state === "completed"/);
  assert.match(steps, /aria-label=\{s\("Device transfer steps"\)\}/);
  assert.match(preview, /s\("Reject transfer and end session"\)/);
  assert.match(preview, /onCancel/);
});

test("real browser pairing smoke transfers encrypted multi-chunk data before ACK", () => {
  const smoke = read("scripts/device-pairing-browser-smoke.mjs");
  assert.match(smoke, /AES-GCM/);
  assert.match(smoke, /PROBE_NOTE_LENGTH = 30_000/);
  assert.match(smoke, /"x"\.repeat\(PROBE_NOTE_LENGTH\)/);
  assert.match(smoke, /kind: "start"/);
  assert.match(smoke, /kind: "chunk"/);
  assert.match(smoke, /kind: "end"/);
  assert.match(smoke, /value\.transferId !== value\.ackTransferId/);
  assert.match(smoke, /value\.chunks < 2/);
  assert.match(smoke, /encrypted Saatyar chunks/);
});

test("phase 118 stays inside architecture limits and is wired into sync quality", () => {
  const packageJson = JSON.parse(read("package.json"));
  const roadmap = read("docs/roadmap/BACKLOG_FA.md");
  const files = [
    "hooks/use-device-transfer-pairing.ts",
    "components/pages/settings/device-transfer-card.tsx",
    "components/pages/settings/device-transfer-steps.tsx",
    "components/pages/settings/device-transfer-preview.tsx",
  ];
  for (const file of files) {
    const lineCount = read(file).split(/\r?\n/).length;
    assert.ok(lineCount <= 250, `${file} exceeded 250 lines: ${lineCount}`);
  }
  assert.match(packageJson.scripts.test, /phase118-sync-browser-e2e-ux/);
  assert.match(packageJson.scripts["test:device-transfer:e2e"], /phase118-sync-browser-e2e-ux/);
  assert.match(roadmap, /\[x\] فاز ۱۱۸:.*Browser E2E.*پالیش نهایی/);
});
