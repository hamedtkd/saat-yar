import { rm } from "node:fs/promises";

const obsoletePaths = [
  "app/date-time-pickers.tsx",
  "app/storage.ts",
  "lib/tw.ts",
  // Phase 178 R1 compatibility experiment; superseded by the system i18n closure.
  "lib/i18n/live-timer.ts",
  "tests/phase178-i18n-final-closure.test.ts",
];

await Promise.all(obsoletePaths.map((path) => rm(path, { force: true })));
console.log(`Removed ${obsoletePaths.length} obsolete paths when present.`);
