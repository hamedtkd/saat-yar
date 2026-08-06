import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("browser back and forward wait for unsaved draft confirmation", async () => {
  const source = await read("components/layout/navigation/use-browser-history-guard.ts");

  assert.match(source, /addEventListener\("popstate", handlePopState, true\)/);
  assert.match(source, /event\.stopImmediatePropagation\(\)/);
  assert.match(source, /window\.history\.pushState\(window\.history\.state, "", currentHref\)/);
  assert.match(source, /requestNavigationRef\.current\(\(\) => \{/);
  assert.match(source, /window\.location\.assign\(targetHref\)/);
});

test("normal browser history remains available without unsaved drafts", async () => {
  const source = await read("components/layout/navigation/use-browser-history-guard.ts");

  assert.match(source, /!hasUnsavedRef\.current/);
  assert.match(source, /acceptedHref\.current = targetHref;[\s\S]*return;/);
  assert.match(source, /removeEventListener\("popstate", handlePopState, true\)/);
});

test("the shell-level provider installs the browser history guard", async () => {
  const provider = await read("components/layout/navigation/unsaved-navigation-provider.tsx");
  const backlog = await read("docs/roadmap/BACKLOG_FA.md");

  assert.match(provider, /useBrowserHistoryGuard/);
  assert.match(provider, /hasUnsavedChanges: guard\.unsaved\.hasUnsavedChanges/);
  assert.match(provider, /requestNavigation: guard\.requestNavigation/);
  assert.match(backlog, /\[x\] محافظت از دکمه Back و Forward مرورگر/);
});
