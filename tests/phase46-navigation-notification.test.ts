import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(path, "utf8");

test("route pages import getTabHref from the shared navigation module", async () => {
  for (const path of ["app/clients/page.tsx", "app/today/page.tsx"]) {
    const source = await read(path);
    assert.match(source, /import \{ getTabHref \} from "@\/lib\/navigation"/);
    assert.doesNotMatch(source, /useSaatyarContext, getTabHref/);
  }
});

test("notification settings expose permission state and a test action", async () => {
  const source = await read("components/pages/settings/notification-settings-card.tsx");
  assert.match(source, /getPermissionState/);
  assert.match(source, /ارسال اعلان آزمایشی/);
  assert.match(source, /setBreakReminderEnabled/);
  assert.match(source, /permission === "denied"/);
});
