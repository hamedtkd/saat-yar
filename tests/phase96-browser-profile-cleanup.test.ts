import test from "node:test";
import assert from "node:assert/strict";
import {
  cleanupBrowserProfile,
  removeBrowserProfileDirectory,
} from "../scripts/browser-profile-cleanup.mjs";

test("browser profile cleanup retries transient Windows locks", async () => {
  let calls = 0;
  const delays: number[] = [];
  const result = await removeBrowserProfileDirectory("C:\\Temp\\saatyar-profile", {
    attempts: 4,
    retryDelayMs: 10,
    remove: async (directory, options) => {
      calls += 1;
      assert.equal(directory, "C:\\Temp\\saatyar-profile");
      assert.equal(options.recursive, true);
      assert.equal(options.force, true);
      if (calls < 3) throw Object.assign(new Error("locked"), { code: "EBUSY" });
    },
    sleep: async (delayMs) => { delays.push(delayMs); },
  });

  assert.deepEqual(result, { removed: true, attempts: 3 });
  assert.deepEqual(delays, [10, 20]);
});

test("browser profile cleanup preserves non-transient filesystem failures", async () => {
  await assert.rejects(
    removeBrowserProfileDirectory("C:\\Temp\\saatyar-profile", {
      remove: async () => {
        throw Object.assign(new Error("access denied"), { code: "EACCES" });
      },
      sleep: async () => {},
    }),
    /access denied/,
  );
});

test("best-effort smoke cleanup reports a lingering lock without failing the run", async () => {
  const warnings: string[] = [];
  let calls = 0;
  const result = await cleanupBrowserProfile("C:\\Temp\\saatyar-profile", {
    attempts: 3,
    retryDelayMs: 0,
    remove: async () => {
      calls += 1;
      throw Object.assign(new Error("still locked"), { code: "EBUSY" });
    },
    sleep: async () => {},
    warn: (message) => warnings.push(message),
  });

  assert.equal(calls, 3);
  assert.deepEqual(result, { removed: false, attempts: 3 });
  assert.equal(warnings.length, 1);
  assert.match(warnings[0] ?? "", /cleanup was deferred \(EBUSY\)/);
});
