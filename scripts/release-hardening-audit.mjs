import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCAN_ROOTS = ["app", "components", "hooks", "lib", "public", "scripts"];
const TEXT_EXTENSIONS = new Set([".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx", ".html"]);
const AUDIT_SELF = "scripts/release-hardening-audit.mjs";
const INLINE_HTML_ALLOWLIST = new Set([
  "components/i18n/locale-bootstrap.tsx",
  "components/theme/theme-bootstrap.tsx",
]);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    else if (TEXT_EXTENSIONS.has(path.extname(entry.name))) files.push(absolute);
  }
  return files;
}

function relative(file) {
  return path.relative(ROOT, file).replaceAll("\\", "/");
}

function hasPersistentTokenStorage(source) {
  return /\baccessToken\b/.test(source)
    && /\b(?:localStorage|sessionStorage|indexedDB|IDBDatabase|IDBObjectStore)\b/.test(source);
}

function blankTargetWithoutRel(source) {
  const anchors = source.match(/<a\b[\s\S]*?>/g) ?? [];
  return anchors.some((anchor) => /target=["']_blank["']/.test(anchor) && !/rel=["'][^"']*(?:noreferrer|noopener)[^"']*["']/.test(anchor));
}

function findDangerousRuntimePattern(source) {
  const patterns = [
    ["eval()", /\beval\s*\(/],
    ["new Function()", /\bnew\s+Function\s*\(/],
    ["document.write()", /\bdocument\.write\s*\(/],
  ];
  return patterns.find(([, pattern]) => pattern.test(source))?.[0] ?? null;
}

export async function inspectReleaseHardening() {
  const failures = [];
  const scannedFiles = [];

  for (const root of SCAN_ROOTS) {
    const absoluteRoot = path.join(ROOT, root);
    const files = await walk(absoluteRoot);
    for (const file of files) {
      const name = relative(file);
      const source = await readFile(file, "utf8");
      scannedFiles.push(name);

      const dangerousPattern = name === AUDIT_SELF ? null : findDangerousRuntimePattern(source);
      if (dangerousPattern) failures.push(`${name}: forbidden dynamic-code primitive detected (${dangerousPattern}).`);

      if (name !== AUDIT_SELF && /dangerouslySetInnerHTML/.test(source) && !INLINE_HTML_ALLOWLIST.has(name)) {
        failures.push(`${name}: dangerouslySetInnerHTML is not in the reviewed bootstrap allowlist.`);
      }

      if (hasPersistentTokenStorage(source)) {
        failures.push(`${name}: Google access tokens must remain memory-only and must not be persisted.`);
      }

      if ((name.endsWith(".tsx") || name.endsWith(".jsx")) && blankTargetWithoutRel(source)) {
        failures.push(`${name}: target=\"_blank\" link is missing noreferrer/noopener protection.`);
      }
    }
  }

  const vercel = JSON.parse(await readFile(path.join(ROOT, "vercel.json"), "utf8"));
  const globalHeaders = (vercel.headers ?? []).find((entry) => entry?.source === "/(.*)")?.headers ?? [];
  const responseHeaders = new Map(globalHeaders.map((entry) => [String(entry.key).toLowerCase(), String(entry.value)]));
  const requiredHeaders = new Map([
    ["x-content-type-options", "nosniff"],
    ["x-frame-options", "DENY"],
    ["referrer-policy", "strict-origin-when-cross-origin"],
    ["permissions-policy", "camera=(self), microphone=(), geolocation=()"],
    ["strict-transport-security", "max-age=31536000"],
  ]);

  for (const [key, expected] of requiredHeaders) {
    if (responseHeaders.get(key) !== expected) failures.push(`vercel.json: required ${key} header is missing or differs from the hardened contract.`);
  }

  const swHeaders = (vercel.headers ?? []).find((entry) => entry?.source === "/sw.js")?.headers ?? [];
  const swCacheControl = swHeaders.find((entry) => String(entry.key).toLowerCase() === "cache-control")?.value;
  if (swCacheControl !== "public, max-age=0, must-revalidate") {
    failures.push("vercel.json: /sw.js must be revalidated so installed PWAs can discover updates promptly.");
  }

  const manifestHeaders = (vercel.headers ?? []).find((entry) => entry?.source === "/manifest.webmanifest")?.headers ?? [];
  const manifestCacheControl = manifestHeaders.find((entry) => String(entry.key).toLowerCase() === "cache-control")?.value;
  if (manifestCacheControl !== "public, max-age=0, must-revalidate") {
    failures.push("vercel.json: /manifest.webmanifest must be revalidated after PWA identity changes.");
  }

  return {
    ok: failures.length === 0,
    failures,
    scannedFiles: scannedFiles.length,
    reviewedInlineHtmlFiles: [...INLINE_HTML_ALLOWLIST],
  };
}

export async function runReleaseHardeningAudit() {
  const result = await inspectReleaseHardening();
  if (!result.ok) throw new Error(result.failures.join("\n"));
  console.log(`Release hardening audit passed across ${result.scannedFiles} runtime/source files.`);
  console.log("Dynamic code, persistent OAuth token storage, unsafe blank-target links, and unreviewed inline HTML: clean.");
  console.log("Vercel security headers and PWA revalidation headers: present.");
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isDirectRun) {
  runReleaseHardeningAudit().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
