import { existsSync } from "node:fs";
import { readdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "out");
const NEXT_STATIC = resolve(OUT, "_next", "static");
const MANIFEST_PATH = resolve(OUT, "pwa-precache-manifest.js");

async function collectFiles(directory) {
  if (!existsSync(directory)) return [];
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(absolute));
    else if (entry.isFile()) files.push(absolute);
  }
  return files;
}

function toPublicPath(file) {
  return relative(OUT, file).split(sep).join("/");
}

const assets = (await collectFiles(NEXT_STATIC))
  .map(toPublicPath)
  .filter((path) => path.length > 0)
  .sort();

if (!existsSync(resolve(OUT, "sw.js"))) {
  throw new Error("Static export service worker is missing. Run next build before finalizing the PWA.");
}
if (assets.length === 0) {
  throw new Error("No Next.js static assets were found for the offline PWA shell.");
}

const source = `self.__SAATYAR_PRECACHE = ${JSON.stringify(assets, null, 2)};\n`;
await writeFile(MANIFEST_PATH, source, "utf8");
console.log(`PWA static precache finalized with ${assets.length} build asset(s).`);
