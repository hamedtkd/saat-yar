import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { APP_DATA_SCHEMA_VERSION } from "../lib/data/version.ts";

const read = (path: string) => readFileSync(path, "utf8");

test("boot loading state preserves the real shell footprint instead of flashing a centered spinner", () => {
  const loading = read("components/motion/app-loading-state.tsx");
  assert.match(loading, /data-app-loading-state/);
  assert.match(loading, /aria-busy="true"/);
  assert.match(loading, /dashboard-shell/);
  assert.match(loading, /shell-main-offset/);
  assert.match(loading, /var\(--shell-sidebar-width\)/);
  assert.match(loading, /data-app-loading-state[\s\S]*BrandMark/);
  assert.doesNotMatch(loading, /setInterval|setTimeout|requestAnimationFrame/);
});

test("route motion is state-driven and avoids transformed ancestors that break fixed mobile actions", () => {
  const routeMotion = read("components/motion/route-motion-boundary.tsx");
  assert.match(routeMotion, /data-route-motion[\s\S]*data-route-motion-path=\{routeKey\}/);
  assert.match(routeMotion, /<motion\.div[\s\S]*key=\{routeKey\}/);
  assert.match(routeMotion, /initial=\{reducedMotion \? false : \{ opacity: 0 \}\}/);
  assert.match(routeMotion, /animate=\{\{ opacity: 1 \}\}/);
  assert.doesNotMatch(routeMotion, /\by\s*:|transform\s*:/);
  assert.doesNotMatch(routeMotion, /height:|width:|margin:|padding:|top:|left:/);
  assert.doesNotMatch(routeMotion, /setInterval|setTimeout/);
});

test("motion explicitly respects reduced-motion preferences", () => {
  const routeMotion = read("components/motion/route-motion-boundary.tsx");
  const css = read("app/globals.css");
  const loading = read("components/motion/app-loading-state.tsx");
  assert.match(routeMotion, /useReducedMotion/);
  assert.match(routeMotion, /reducedMotion \? \{ duration: 0 \}/);
  assert.match(routeMotion, /data-route-motion-reduced/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(loading, /motion-safe:animate-\[saatyar-loading-sweep/);
});

test("Saatyar shell owns branded loading and one route-motion boundary without changing domain state", () => {
  const shell = read("components/saatyar-shell.tsx");
  assert.match(shell, /<AppLoadingState label=\{t\("app\.loading"\)\}/);
  assert.match(read("tests/phase100-brand-metadata-pwa.test.ts"), /components\/motion\/app-loading-state\.tsx/);
  assert.match(shell, /<RouteMotionBoundary pathname=\{pathname\}>\{children\}<\/RouteMotionBoundary>/);
  assert.doesNotMatch(shell, /motion\.div|AnimatePresence/);
  assert.ok(APP_DATA_SCHEMA_VERSION >= 19);
});

test("loading motion is intentionally limited to one progress sweep and existing brand breathing", () => {
  const loading = read("components/motion/app-loading-state.tsx");
  const css = read("app/globals.css");
  const sweepUses = loading.match(/saatyar-loading-sweep/g) ?? [];
  assert.equal(sweepUses.length, 1);
  assert.match(css, /@keyframes saatyar-loading-sweep/);
  assert.match(css, /transform: translateX/);
  assert.doesNotMatch(css, /@keyframes saatyar-loading-sweep[\s\S]{0,220}(width|height|margin|padding):/);
});

test("Phase 186 is documented, browser-covered, dependency-neutral, and keeps schema v19", () => {
  const pkg = JSON.parse(read("package.json")) as { scripts: Record<string, string>; dependencies: Record<string, string> };
  const notes = read("docs/phases/PHASE_186_NOTES_FA.md");
  const roadmap = read("docs/roadmap/BACKLOG_FA.md");
  const smoke = read("scripts/production-browser-smoke.mjs");
  const layout = read("app/layout.tsx");
  const obsoleteCleanup = read("scripts/remove-obsolete-entrypoints.mjs");
  assert.match(pkg.scripts.test, /tests\/phase186-motion-perceived-performance\.test\.ts/);
  assert.equal(pkg.scripts.predev, "npm run clean:obsolete");
  assert.equal(pkg.scripts.dev, "next dev");
  assert.match(layout, /data-scroll-behavior="smooth"/);
  assert.match(obsoleteCleanup, /public\/manifest\.webmanifest/);
  assert.equal(pkg.dependencies["framer-motion"], "^12.42.2");
  assert.match(notes, /Schema v19/);
  assert.match(notes, /prefers-reduced-motion/);
  assert.match(roadmap, /\[x\] فاز ۱۸۶: Motion & Perceived Performance/);
  assert.match(smoke, /data-route-motion-reduced/);
  assert.match(smoke, /reduced-motion route contract/);
  assert.match(smoke, /querySelectorAll\('a\[href\]'\)/);
  assert.match(smoke, /pathname\.endsWith\('\/'\)/);
  assert.match(smoke, /pathname\.slice\(0, -1\)/);
  assert.match(smoke, /Theme changes reveal from the header control/);
  assert.doesNotMatch(smoke, /waitForEvent\(client, "Page\.loadEventFired", "English Reports route"\)/);
  assert.match(smoke, /clickRouteLink\(client, "\/reports"\)/);
  assert.doesNotMatch(smoke, /Page\.navigate[\s\S]{0,100}\$\{origin\}\/reports\//);
  assert.match(smoke, /data-theme-toggle/);
  assert.doesNotMatch(smoke, /pathname\.replace\(\/\\\/\+\$\//);

  const lock = JSON.parse(read("package-lock.json")) as { packages: Record<string, { dependencies?: Record<string, string> }> };
  const rootDependencyOrder = Object.keys(lock.packages[""]?.dependencies ?? {});
  assert.deepEqual(rootDependencyOrder.slice(-2), ["vazirmatn", "zod"]);
  assert.ok(APP_DATA_SCHEMA_VERSION >= 19);
});

test("loading skeletons follow the active Today or Month route instead of showing one generic dashboard", () => {
  const shell = read("components/saatyar-shell.tsx");
  const loading = read("components/motion/app-loading-state.tsx");
  const routes = read("components/motion/route-loading-skeleton.tsx");
  assert.match(shell, /<AppLoadingState[\s\S]*pathname=\{pathname\}/);
  assert.match(loading, /<RouteLoadingSkeleton pathname=\{pathname\}/);
  assert.match(routes, /data-loading-route="today"/);
  assert.match(routes, /data-loading-route="month"/);
  assert.match(routes, /route === "\/today"/);
  assert.match(routes, /route === "\/month"/);
  assert.match(routes, /min-h-\[124px\]/);
  assert.match(routes, /grid-cols-\[minmax\(340px,.95fr\)_minmax\(300px,.78fr\)_minmax\(340px,1fr\)\]/);
});

test("month intelligence cards share one header geometry and stretch to a clean desktop baseline", () => {
  const month = read("components/pages/month/month-page.tsx");
  const header = read("components/pages/month/activity-heatmap/analytics-card-header.tsx");
  const heatmap = read("components/pages/month/activity-heatmap/activity-heatmap.tsx");
  const recent = read("components/pages/month/activity-heatmap/recent-activity-card.tsx");
  const intelligence = read("components/pages/month/activity-heatmap/month-intelligence-card.tsx");
  assert.match(month, /data-month-intelligence-section[\s\S]*items-stretch/);
  assert.match(header, /data-month-analytics-card-header/);
  assert.match(header, /min-h-9/);
  assert.match(heatmap, /className="flex h-full[^"]*flex-col/);
  assert.match(recent, /className="flex h-full flex-col/);
  assert.match(intelligence, /className="flex h-full flex-col/);
  for (const source of [heatmap, recent, intelligence]) assert.match(source, /<AnalyticsCardHeader/);
});

test("theme toggle reveals the next visual theme from the control and skips the reveal for reduced motion", () => {
  const toggle = read("components/theme/theme-toggle.tsx");
  const runtime = read("components/theme/theme-runtime.tsx");
  const css = read("app/globals.css");
  assert.match(toggle, /data-theme-toggle/);
  assert.match(toggle, /getBoundingClientRect/);
  assert.match(toggle, /Math\.hypot/);
  assert.match(toggle, /prefers-reduced-motion: reduce/);
  assert.match(toggle, /startViewTransition/);
  assert.match(toggle, /--theme-reveal-x/);
  assert.match(toggle, /--theme-reveal-radius/);
  assert.match(runtime, /export function applyAppearanceToDocument/);
  assert.match(css, /@keyframes saatyar-theme-reveal/);
  assert.match(css, /clip-path: circle\(0 at var\(--theme-reveal-x\) var\(--theme-reveal-y\)\)/);
  assert.match(css, /300ms cubic-bezier/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*data-theme-transition="active"/);
});
