import { rm } from "node:fs/promises";

const obsoletePaths = [
  "app/date-time-pickers.tsx",
  "app/storage.ts",
  "lib/tw.ts",
  // Phase 178 R1 compatibility experiment; superseded by the system i18n closure.
  "lib/i18n/live-timer.ts",
  "tests/phase178-i18n-final-closure.test.ts",
  // npm/package-lock.json is the canonical package-manager contract for Saatyar.
  "pnpm-lock.yaml",
  // Phase 198.1 R5 analog-clock experiment; the freelancer timer no longer renders a clock face.
  "components/pages/today/project-timer/project-clock-face.tsx",
  // Stale static manifest from older local builds conflicts with the App Router metadata route.
  "public/manifest.webmanifest",
];

await Promise.all(obsoletePaths.map((path) => rm(path, { force: true })));
console.log(`Removed ${obsoletePaths.length} obsolete paths when present.`);
