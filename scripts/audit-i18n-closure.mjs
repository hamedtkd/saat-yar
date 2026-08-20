import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const SOURCE_ROOTS = ["app", "components", "hooks"];
const PERSIAN = /[\u0600-\u06ff]/;

// These are deliberately not runtime-translated UI copy:
// - static document metadata stays canonical Persian; the Phase 200 bilingual install name uses manifest dir=auto.
// - time-utils keeps Persian compatibility errors for its low-level parser; rendered picker UI maps error codes.
// - app-toast keeps bilingual keyword lexicons used only to infer semantic toast tone.
const PERSIAN_UI_ALLOWLIST = new Set([
  "app/layout.tsx",
  "app/manifest.ts",
  "app/import/layout.tsx",
  "app/onboarding/layout.tsx",
  "components/pickers/time-picker/time-utils.ts",
  "components/common/app-toast.tsx",
]);

async function sourceFiles(root) {
  const absolute = path.join(ROOT, root);
  const entries = await readdir(absolute, { recursive: true });
  return entries
    .filter((entry) => /\.(ts|tsx)$/.test(entry))
    .map((entry) => path.posix.join(root, entry.split(path.sep).join("/")));
}

async function read(relative) {
  return readFile(path.join(ROOT, relative), "utf8");
}

const failures = [];
function requireMatch(file, source, pattern, message) {
  if (!pattern.test(source)) failures.push(`${file}: ${message}`);
}
function forbidMatch(file, source, pattern, message) {
  if (pattern.test(source)) failures.push(`${file}: ${message}`);
}

for (const root of SOURCE_ROOTS) {
  for (const file of await sourceFiles(root)) {
    const source = await read(file);
    if (PERSIAN.test(source) && !PERSIAN_UI_ALLOWLIST.has(file)) {
      failures.push(`${file}: hard-coded Persian script remains in the runtime UI boundary`);
    }
    if (/text-right/.test(source) && !/direction === "rtl"/.test(source)) {
      failures.push(`${file}: fixed text-right remains without an explicit direction branch`);
    }
  }
}

const directionContracts = {
  "components/ui/dialog.tsx": {
    required: [/dir=\{direction\}/, /text-start/, /end-3/, /pe-10/],
    forbidden: [/dir="rtl"/, /text-right/, /left-3/, /pl-10/],
  },
  "components/ui/alert-dialog.tsx": {
    required: [/dir=\{direction\}/, /text-start/],
    forbidden: [/dir="rtl"/, /text-right/, /flex-row-reverse/],
  },
  "components/ui/select.tsx": {
    required: [/dir=\{direction\}/, /text-start/, /ps-3 pe-10/, /end-3/, /ps-9 pe-3/, /start-3/],
    forbidden: [/dir="rtl"/, /text-right/, /\bpr-9\b/, /\bpl-10\b/, /\bright-3\b/, /\bleft-3\b/],
  },
  "components/common/minute-duration-field.tsx": {
    required: [/ps-16/, /start-3/, /useLocaleUi/],
    forbidden: [/pl-16/, /left-3/],
  },
  "components/common/table-shell.tsx": {
    required: [/text-start/],
    forbidden: [/text-right/],
  },
  "components/layout/onboarding/step-shell.tsx": {
    required: [/\[&>label\]:text-start/],
    forbidden: [/\[&>label\]:text-right/],
  },
  "components/pickers/jalali-date-picker/date-picker-trigger.tsx": {
    required: [/text-start/],
    forbidden: [/text-right/],
  },
};

for (const [file, contract] of Object.entries(directionContracts)) {
  const source = await read(file);
  for (const pattern of contract.required) requireMatch(file, source, pattern, `missing direction-safe contract ${pattern}`);
  for (const pattern of contract.forbidden) forbidMatch(file, source, pattern, `contains direction-locked contract ${pattern}`);
}

const runtime = await read("components/i18n/locale-runtime.tsx");
for (const route of ["/today", "/month", "/clients", "/projects", "/invoices", "/leave", "/reports", "/settings", "/about", "/onboarding", "/import"]) {
  if (!runtime.includes(`"${route}"`)) failures.push(`components/i18n/locale-runtime.tsx: route title coverage missing ${route}`);
}
requireMatch("components/i18n/locale-runtime.tsx", runtime, /MutationObserver/, "runtime title must stay authoritative after static metadata hydration");

const appLayout = await read("app/layout.tsx");
const manifest = await read("app/manifest.ts");
requireMatch("app/layout.tsx", appLayout, /<html lang="fa" dir="rtl"/, "static document metadata policy must remain canonical Persian for 2.3.2");
requireMatch("app/manifest.ts", manifest, /lang:\s*"fa"/, "manifest language must remain canonical Persian for 2.3.2");
requireMatch("app/manifest.ts", manifest, /dir:\s*"auto"/, "bilingual PWA install identity must use automatic manifest direction");

const exporters = await read("lib/exporters.ts");
const reportActions = await read("hooks/controller/use-report-actions.ts");
requireMatch("lib/exporters.ts", exporters, /locale: Locale = "fa-IR"/, "Excel exporter must accept locale");
requireMatch("lib/exporters.ts", exporters, /locale === "en" \? "ltr" : "rtl"/, "Excel document direction must follow locale");
requireMatch("hooks/controller/use-report-actions.ts", reportActions, /rows,\s*locale,\s*\);/s, "report actions must pass locale to Excel exporter");

const runtimeError = await read("lib/i18n/runtime-error.ts");
requireMatch("lib/i18n/runtime-error.ts", runtimeError, /locale === "en" && PERSIAN_SCRIPT/, "English runtime errors must not leak Persian low-level copy");
requireMatch("lib/i18n/runtime-error.ts", runtimeError, /locale === "fa-IR".*LATIN_SCRIPT/s, "Persian runtime errors must not leak English low-level copy");

if (failures.length) {
  console.error("i18n closure audit failed:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log(`i18n closure audit passed (${SOURCE_ROOTS.join(", ")}; ${PERSIAN_UI_ALLOWLIST.size} explicit Persian compatibility/metadata exceptions).`);
