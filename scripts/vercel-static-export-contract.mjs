import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function readJson(path) {
  return JSON.parse(await readFile(resolve(ROOT, path), "utf8"));
}

async function readText(path) {
  return readFile(resolve(ROOT, path), "utf8");
}

export async function inspectVercelStaticExportContract() {
  const [vercel, pkg, nextConfig, finalizer] = await Promise.all([
    readJson("vercel.json"),
    readJson("package.json"),
    readText("next.config.ts"),
    readText("scripts/finalize-static-pwa.mjs"),
  ]);

  const failures = [];
  if (vercel.framework !== null) failures.push("vercel.json must select the Other framework preset with framework: null.");
  if (vercel.buildCommand !== "npm run build:vercel") failures.push("vercel.json must run npm run build:vercel.");
  if (vercel.outputDirectory !== "out") failures.push("vercel.json must publish the finalized out directory.");
  if (pkg.scripts?.["build:vercel"] !== "next build && node scripts/finalize-static-pwa.mjs") {
    failures.push("build:vercel must finalize the PWA after next build.");
  }
  if (!/output:\s*["']export["']/.test(nextConfig)) failures.push("next.config.ts must use output: export.");
  if (!/trailingSlash:\s*true/.test(nextConfig)) failures.push("next.config.ts must keep trailingSlash: true for directory-index routes.");
  if (!/resolve\(ROOT,\s*["']out["']\)/.test(finalizer)) failures.push("PWA finalizer must target the out directory.");
  if (!/pwa-precache-manifest\.js/.test(finalizer)) failures.push("PWA finalizer must emit pwa-precache-manifest.js.");

  return {
    ok: failures.length === 0,
    failures,
    framework: vercel.framework,
    buildCommand: vercel.buildCommand,
    outputDirectory: vercel.outputDirectory,
  };
}

export async function runVercelStaticExportContract() {
  const result = await inspectVercelStaticExportContract();
  if (!result.ok) throw new Error(result.failures.join("\n"));
  console.log("Vercel static export deployment contract passed.");
  console.log(`Framework preset: Other (${String(result.framework)})`);
  console.log(`Build command: ${result.buildCommand}`);
  console.log(`Published output: ${result.outputDirectory}/`);
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isDirectRun) {
  runVercelStaticExportContract().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
