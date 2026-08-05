import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = join(process.cwd(), "components/pages/leave");

function countLines(path: string) {
  return readFileSync(path, "utf8").split(/\r?\n/).length;
}

test("leave table modules stay below 250 lines", () => {
  const files = [join(root, "leave-table.tsx"), ...readdirSync(join(root, "table")).filter((name) => /\.(ts|tsx)$/.test(name)).map((name) => join(root, "table", name))];
  for (const file of files) assert.ok(countLines(file) <= 250, `${file} exceeds 250 lines`);
});

test("leave table delegates desktop and mobile rendering", () => {
  const source = readFileSync(join(root, "leave-table.tsx"), "utf8");
  assert.match(source, /<LeaveDesktopTable/);
  assert.match(source, /<LeaveMobileCards/);
});
