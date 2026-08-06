import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFile(new URL(path, root), "utf8");

test("browser history guard updates mutable refs inside an effect", async () => {
  const source = await read("components/layout/navigation/use-browser-history-guard.ts");
  assert.match(source, /useEffect\(\(\) => \{\s*hasUnsavedRef\.current = hasUnsavedChanges;/);
  assert.doesNotMatch(source, /const requestNavigationRef = useRef\(requestNavigation\);\s*\n\s*hasUnsavedRef\.current/);
});

test("completed day callbacks depend on destructured stable props", async () => {
  const source = await read("components/pages/today/completed-day-editor.tsx");
  assert.match(source, /const \{ record, selectedDate, updateRecord \} = props;/);
  assert.match(source, /\}, \[draft, updateRecord\]\);/);
  assert.doesNotMatch(source, /\[draft, props\.updateRecord\]/);
});

test("inactive timer effect releases storage lock without synchronous state update", async () => {
  const source = await read("hooks/use-live-timer-ownership.ts");
  assert.match(source, /const releaseLock = useCallback/);
  assert.match(source, /if \(!active\) \{\s*releaseLock\(\);\s*return;/);
  assert.doesNotMatch(source, /const release = useCallback[\s\S]*setOwner\(null\)/);
  assert.match(source, /const blocked = active && Boolean\(owner\);/);
});
