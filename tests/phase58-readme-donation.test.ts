import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("README documents the product, quality workflow and optional donation", async () => {
  const readme = await read("README.md");
  assert.match(readme, /https:\/\/saat-yar\.vercel\.app/);
  assert.match(readme, /npm run check:quality/);
  assert.match(readme, /Local-first/);
  assert.match(readme, /https:\/\/daramet\.com\/hamedtkd/);
  assert.match(readme, /کاملاً اختیاری/);
  assert.match(readme, /هیچ قابلیت اضافه‌ای را باز نمی‌کند/);
});

test("documentation roadmap remains visible in the backlog", async () => {
  const backlog = await read("BACKLOG_FA.md");
  assert.match(backlog, /مستندات و معرفی پروژه/);
  assert.match(backlog, /README انگلیسی/);
  assert.match(backlog, /اسکرین‌شات‌های به‌روز/);
});
