import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("reminder architecture test stays compatible with the repository TypeScript target", async () => {
  const source = await readFile(
    new URL("./phase48-reminder-stability.test.ts", import.meta.url),
    "utf8",
  );

  assert.equal(source.includes("/s);"), false);
  assert.equal(source.includes("[\\s\\S]*?"), true);
});
