import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(path, "utf8");

test("application exposes a keyboard skip link and main landmark", () => {
  const shell = read("components/saatyar-shell.tsx");
  const skipLink = read("components/common/skip-link.tsx");
  assert.match(shell, /<SkipLink \/>/);
  assert.match(shell, /id="main-content"/);
  assert.match(shell, /role="main"/);
  assert.match(skipLink, /href="#main-content"/);
});

test("picker dialogs use the shared focus trap and accessible names", () => {
  for (const path of [
    "components/pickers/jalali-date-picker/date-picker-dialog.tsx",
    "components/pickers/time-picker/time-picker-dialog.tsx",
  ]) {
    const source = read(path);
    assert.match(source, /useDialogAccessibility/);
    assert.match(source, /aria-modal="true"/);
    assert.match(source, /aria-labelledby=/);
    assert.match(source, /tabIndex=\{-1\}/);
  }
});

test("global styles support visible focus and reduced motion", () => {
  const css = read("app/globals.css");
  assert.match(css, /focus-visible/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});
