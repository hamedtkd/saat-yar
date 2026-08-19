import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("onboarding is a first-class app route instead of a Today overlay", async () => {
  const [page, shell] = await Promise.all([
    read("app/onboarding/page.tsx"),
    read("components/saatyar-shell.tsx"),
  ]);
  assert.match(page, /useSaatyarContext/);
  assert.match(page, /<Onboarding/);
  assert.match(shell, /onboardingRoute = (?:normalizePathname\(pathname\)|normalizedPath) === "\/onboarding"/);
  assert.doesNotMatch(shell, /!data\.settings\.onboarded\s*&&\s*\(\s*<Onboarding/);
});

test("new users are routed to onboarding and completed users cannot remain there", async () => {
  const guard = await read("components/layout/navigation/route-guard.tsx");
  assert.match(guard, /const ONBOARDING_PATH = "\/onboarding"/);
  assert.match(guard, /if \(!onboarded(?: \|\| onboardingReentry)?\)/);
  assert.match(guard, /router\.replace\(ONBOARDING_PATH\)/);
  assert.match(guard, /if \(normalized === ONBOARDING_PATH\)/);
  assert.match(guard, /router\.replace\(fallback\)/);
});

test("onboarding owns a focused shell without dashboard navigation", async () => {
  const shell = await read("components/saatyar-shell.tsx");
  assert.match(shell, /onboardingRoute(?: \|\| publicRoute)? \? \(/);
  assert.match(shell, /id="main-content" role="main"/);
  assert.match(shell, /<SidebarNav/);
  assert.match(shell, /<MobileBottomNav/);
  const branchStart = shell.indexOf("{onboardingRoute || publicRoute ? (") >= 0
    ? shell.indexOf("{onboardingRoute || publicRoute ? (")
    : shell.indexOf("{onboardingRoute ? (");
  assert.ok(branchStart >= 0);
  const onboardingBranch = shell.slice(branchStart, shell.indexOf(") : (", branchStart));
  assert.doesNotMatch(onboardingBranch, /SidebarNav|AppHeader|MobileBottomNav|PwaExperience/);
});

test("onboarding is a page surface and is intentionally not search-indexed", async () => {
  const [onboarding, layout, sitemap] = await Promise.all([
    read("components/layout/onboarding.tsx"),
    read("app/onboarding/layout.tsx"),
    read("app/sitemap.ts"),
  ]);
  assert.match(onboarding, /min-h-screen bg-\[var\(--page\)\]/);
  assert.doesNotMatch(onboarding, /fixed inset-0 z-\[500\]/);
  assert.match(layout, /robots: \{ index: false, follow: false \}/);
  assert.doesNotMatch(sitemap, /onboarding/);
});

test("production smoke proves the initial redirect and completion route", async () => {
  const smoke = await read("scripts/production-browser-smoke.mjs");
  assert.match(smoke, /dedicated onboarding route/);
  assert.match(smoke, /\["\/onboarding", "\/onboarding\/"\]\.includes\(location\.pathname\)/);
  assert.match(smoke, /\['\/employee\/today', '\/employee\/today\/'\]\.includes\(location\.pathname\)/);
});

test("Phase 166 documents dedicated onboarding and future onboarding growth", async () => {
  const [pkg, notes, backlog] = await Promise.all([
    read("package.json"),
    read("docs/phases/PHASE_166_NOTES_FA.md"),
    read("docs/roadmap/BACKLOG_FA.md"),
  ]);
  assert.match(pkg, /tests\/phase166-dedicated-onboarding-route\.test\.ts/);
  assert.match(notes, /\/onboarding/);
  assert.match(backlog, /فاز ۱۶۶/);
  assert.match(backlog, /ورود داده|Import/);
});
