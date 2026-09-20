import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { createAppearancePreviewTokens } from "../lib/appearance-settings.ts";
import type { AppearanceSettings } from "../lib/types.ts";

const fixture: AppearanceSettings = {
  mode: "dark",
  preset: "violet",
  accent: "#8b5cf6",
  neutralTone: "slate",
  bodyFont: "mikhak",
  headingFont: "lalezar",
  density: "comfortable",
  radius: "none",
  surface: "tinted",
  sidebarStyle: "soft",
  sidebarAccent: "filled",
  sidebarWidth: "default",
};

function sourceFiles(root: string): string[] {
  return readdirSync(root).flatMap((name) => {
    const path = join(root, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(?:ts|tsx|js|jsx)$/.test(name) ? [path] : [];
  });
}

test("Persian appearance fonts get their own runtime CSS variables", () => {
  const tokens = createAppearancePreviewTokens(fixture, "dark", "fa");
  assert.match(tokens["--app-body-font-fa"], /^"Mikhak"/);
  assert.match(tokens["--app-heading-font-fa"], /^"Lalezar"/);
  assert.equal(tokens["--micro-radius"], "0px");
});

test("document runtime and early bootstrap apply Persian font variables", () => {
  const runtime = readFileSync("components/theme/theme-runtime.tsx", "utf8");
  const bootstrap = readFileSync("components/theme/theme-bootstrap.tsx", "utf8");
  const globals = readFileSync("app/globals.css", "utf8");

  assert.match(runtime, /setProperty\("--app-body-font-fa", appearanceFontStack\(safe\.bodyFont, "fa"\)\)/);
  assert.match(runtime, /setProperty\("--app-heading-font-fa", appearanceFontStack\(safe\.headingFont, "fa"\)\)/);
  assert.match(bootstrap, /--app-body-font-fa/);
  assert.match(bootstrap, /--app-heading-font-fa/);
  assert.match(globals, /:root\[lang="fa"\] \.saatyar-app-font \{[\s\S]*?font-family: var\(--app-body-font-fa\)/);
  assert.match(globals, /:root\[lang="fa"\] \.saatyar-app-font :is\(h1, h2, h3, h4, h5, h6\) \{[\s\S]*?font-family: var\(--app-heading-font-fa\)/);
});

test("production source has no fixed Tailwind or arbitrary pixel radius bypasses", () => {
  const files = [...sourceFiles("app"), ...sourceFiles("components")];
  const violations: string[] = [];
  const fixedRadius = /rounded-\[\d+px\]|\brounded-(?:sm|md|lg|xl|2xl|3xl)\b|\brounded-(?:t|b|s|e)-(?:sm|md|lg|xl|2xl|3xl)\b/g;

  for (const path of files) {
    const source = readFileSync(path, "utf8");
    const matches = source.match(fixedRadius);
    if (matches?.length) violations.push(`${path}: ${matches.join(", ")}`);
  }

  assert.deepEqual(violations, [], `Fixed radius classes bypass Appearance Studio:\n${violations.join("\n")}`);
});

test("padded badges and chips use theme radius instead of rounded-full", () => {
  const files = [...sourceFiles("app"), ...sourceFiles("components")];
  const violations: string[] = [];
  const paddedFullRadius = /(?:rounded-full[^"'`\n]*\bpx-|\bpx-[^"'`\n]*rounded-full)/g;

  for (const path of files) {
    const source = readFileSync(path, "utf8").replace(/\[[^\]]+\]:rounded-full/g, "");
    const matches = source.match(paddedFullRadius);
    if (matches?.length) violations.push(`${path}: ${matches.join(", ")}`);
  }

  assert.deepEqual(violations, [], `Padded theme chips must follow the radius contract:\n${violations.join("\n")}`);
});
