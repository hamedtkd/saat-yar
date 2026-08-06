import { readdir, mkdir, rename, rm, access } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const phasesDir = path.join(root, "docs", "phases");
await mkdir(phasesDir, { recursive: true });

const entries = await readdir(root, { withFileTypes: true });
const misplaced = entries
  .filter((entry) => entry.isFile() && /^PHASE_.*\.md$/.test(entry.name))
  .map((entry) => entry.name);

for (const name of misplaced) {
  const source = path.join(root, name);
  const target = path.join(phasesDir, name);
  try {
    await access(target);
    await rm(source, { force: true });
  } catch {
    await rename(source, target);
  }
}

const legacyBacklog = path.join(root, "BACKLOG_FA.md");
const backlogTarget = path.join(root, "docs", "roadmap", "BACKLOG_FA.md");
try {
  await access(legacyBacklog);
  try {
    await access(backlogTarget);
    await rm(legacyBacklog, { force: true });
  } catch {
    await mkdir(path.dirname(backlogTarget), { recursive: true });
    await rename(legacyBacklog, backlogTarget);
  }
} catch {
  // Already normalized.
}

console.log(`Normalized ${misplaced.length} misplaced phase document(s).`);
