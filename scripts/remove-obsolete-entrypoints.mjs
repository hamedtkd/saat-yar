import { rm } from "node:fs/promises";

const obsoletePaths = [
  "app/date-time-pickers.tsx",
  "app/storage.ts",
  "lib/tw.ts",
];

await Promise.all(obsoletePaths.map((path) => rm(path, { force: true })));
console.log(`Removed ${obsoletePaths.length} obsolete paths when present.`);
