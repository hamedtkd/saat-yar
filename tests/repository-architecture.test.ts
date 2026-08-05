import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const ROOT = process.cwd();
const SOURCE_ROOTS = ["app", "components", "hooks"];
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx"]);
const MAX_LINES = 250;

async function collectSourceFiles(directory: string): Promise<string[]> {
  const absoluteDirectory = path.join(ROOT, directory);
  const entries = await readdir(absoluteDirectory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const relativePath = path.join(directory, entry.name);
      if (entry.isDirectory()) return collectSourceFiles(relativePath);
      return SOURCE_EXTENSIONS.has(path.extname(entry.name)) ? [relativePath] : [];
    }),
  );
  return files.flat();
}

async function lineCount(relativePath: string) {
  const source = await readFile(path.join(ROOT, relativePath), "utf8");
  return source.split(/\r?\n/).length;
}

test("application UI and hooks stay below 250 lines", async () => {
  const files = (await Promise.all(SOURCE_ROOTS.map(collectSourceFiles))).flat();
  const oversized: string[] = [];

  for (const file of files) {
    const count = await lineCount(file);
    if (count > MAX_LINES) oversized.push(`${file} (${count})`);
  }

  assert.deepEqual(
    oversized,
    [],
    `Split oversized modules into focused components or hooks:\n${oversized.join("\n")}`,
  );
});

test("obsolete duplicate storage and picker entrypoints stay removed", async () => {
  const obsoleteFiles = ["app/date-time-pickers.tsx", "app/storage.ts"];

  for (const file of obsoleteFiles) {
    await assert.rejects(
      stat(path.join(ROOT, file)),
      undefined,
      `${file} duplicates the maintained implementation and must not return`,
    );
  }
});
