import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(path, "utf8");
const smoke = read("scripts/freelancer-browser-ux-smoke.mjs");

test("browser smoke writes controlled fields through the native value setter and React input event", () => {
  assert.match(smoke, /Object\.getOwnPropertyDescriptor\(prototype, "value"\)\?\.set/);
  assert.match(smoke, /setter\.call\(field,/);
  assert.match(smoke, /new InputEvent\("input", \{ bubbles: true/);
  assert.match(smoke, /field\.dispatchEvent\(new Event\("change", \{ bubbles: true \}\)\)/);
  assert.doesNotMatch(smoke, /Input\.insertText/);
});

test("controlled input updates settle before keyboard submit and Enter carries native key data", () => {
  assert.match(smoke, /function settleUi/);
  assert.match(smoke, /requestAnimationFrame\(\(\) => requestAnimationFrame\(resolve\)\)/);
  assert.match(smoke, /await settleUi\(client\);/);
  assert.match(smoke, /nativeVirtualKeyCode: windowsVirtualKeyCode/);
  assert.match(smoke, /unmodifiedText: text/);
});

test("freelancer smoke timeout reports actionable form and focus state", () => {
  for (const marker of ["href: location.href", "document.activeElement", "role=\"alert\"", "role=\"dialog\""]) {
    assert.match(smoke, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(smoke, /State: \$\{JSON\.stringify\(diagnostics\)\}/);
});

test("headless freelancer smoke suppresses known background networking noise", () => {
  assert.match(smoke, /--disable-background-networking/);
  assert.match(smoke, /--disable-component-update/);
  assert.match(smoke, /--disable-sync/);
  assert.match(smoke, /DEPRECATED_ENDPOINT/);
  assert.match(smoke, /TensorFlow Lite XNNPACK/);
});

test("phase 136 is documented and wired without schema or dependency changes", () => {
  const pkg = read("package.json");
  const notes = read("docs/phases/PHASE_136_NOTES_FA.md");
  const roadmap = read("docs/roadmap/BACKLOG_FA.md");
  assert.match(pkg, /phase136-freelancer-smoke-input-fidelity\.test\.ts/);
  assert.match(roadmap, /\[x\] فاز ۱۳۶:/);
  assert.match(notes, /AppData Schema: v17/);
  assert.match(notes, /Dependency جدید: ندارد/);
});
