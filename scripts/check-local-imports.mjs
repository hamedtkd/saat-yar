import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";

const root = process.cwd();
const sourceRoots = ["app", "components", "hooks", "lib", "tests"];
const sourceExtensions = [".ts", ".tsx", ".mts", ".cts", ".js", ".jsx"];
const importPattern = /(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g;
const dynamicImportPattern = /import\(\s*["']([^"']+)["']\s*\)/g;

function walk(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) return walk(path);
    return sourceExtensions.includes(extname(path)) ? [path] : [];
  });
}

function candidatePaths(basePath) {
  const candidates = [basePath];
  for (const extension of sourceExtensions) candidates.push(`${basePath}${extension}`);
  for (const extension of sourceExtensions) candidates.push(join(basePath, `index${extension}`));
  return candidates;
}

function resolveLocalImport(importer, specifier) {
  if (specifier.startsWith("@/")) return resolve(root, specifier.slice(2));
  if (specifier.startsWith(".")) return resolve(dirname(importer), specifier);
  return null;
}

const unresolved = [];
const files = sourceRoots.flatMap((directory) => walk(resolve(root, directory)));

for (const file of files) {
  const source = readFileSync(file, "utf8");
  const specifiers = [];
  for (const pattern of [importPattern, dynamicImportPattern]) {
    pattern.lastIndex = 0;
    for (let match = pattern.exec(source); match; match = pattern.exec(source)) {
      specifiers.push(match[1]);
    }
  }

  for (const specifier of specifiers) {
    const localBase = resolveLocalImport(file, specifier);
    if (!localBase) continue;
    if (!candidatePaths(localBase).some(existsSync)) {
      unresolved.push(`${file} -> ${specifier}`);
    }
  }
}

if (unresolved.length) {
  console.error("Unresolved local imports:\n" + unresolved.join("\n"));
  process.exit(1);
}

console.log(`Checked ${files.length} source files: all local imports resolve.`);
