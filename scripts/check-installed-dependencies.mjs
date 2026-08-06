import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
const declared = {
  ...(packageJson.dependencies ?? {}),
  ...(packageJson.devDependencies ?? {}),
};

const packagePath = (name) => resolve(root, "node_modules", ...name.split("/"), "package.json");
const missing = Object.keys(declared).filter((name) => !existsSync(packagePath(name)));

if (missing.length > 0) {
  console.error("وابستگی‌های نصب‌نشده یا قدیمی شناسایی شدند:");
  for (const name of missing) console.error(`- ${name}`);
  console.error("\nپس از دریافت فاز جدید، یک‌بار npm install را اجرا کن و سپس دوباره npm run check:quality را بزن.");
  process.exitCode = 1;
} else {
  console.log(`Dependency preflight passed for ${Object.keys(declared).length} direct packages.`);
}
