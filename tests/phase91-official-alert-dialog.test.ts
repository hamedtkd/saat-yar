import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("alert dialog uses the official Radix primitive through the shadcn wrapper", async () => {
  const source = await read("components/ui/alert-dialog.tsx");
  const pkg = JSON.parse(await read("package.json")) as { dependencies: Record<string, string> };
  const lock = JSON.parse(await read("package-lock.json")) as { packages: Record<string, { version?: string }> };

  assert.equal(pkg.dependencies["@radix-ui/react-alert-dialog"], "^1.1.23");
  assert.equal(lock.packages["node_modules/@radix-ui/react-alert-dialog"]?.version, "1.1.23");
  assert.equal(lock.packages["node_modules/@radix-ui/react-dialog"]?.version, "1.1.23");
  assert.match(source, /import \* as AlertDialogPrimitive from "@radix-ui\/react-alert-dialog"/);
  assert.match(source, /AlertDialogPrimitive\.Portal/);
  assert.match(source, /AlertDialogPrimitive\.Overlay/);
  assert.match(source, /AlertDialogPrimitive\.Content/);
  assert.match(source, /AlertDialogPrimitive\.Cancel/);
  assert.match(source, /AlertDialogPrimitive\.Action/);
});

test("manual dialog state and escape handlers are removed", async () => {
  const source = await read("components/ui/alert-dialog.tsx");

  assert.doesNotMatch(source, /createContext<AlertDialogContextValue/);
  assert.doesNotMatch(source, /document\.addEventListener\("keydown"/);
  assert.doesNotMatch(source, /cloneElement/);
  assert.doesNotMatch(source, /aria-label="بستن پنجره"/);
});

test("the shared wrapper preserves RTL styling and accessible action variants", async () => {
  const source = await read("components/ui/alert-dialog.tsx");

  assert.match(source, /dir="rtl"/);
  assert.match(source, /outline-none/);
  assert.match(source, /buttonVariants\(\)/);
  assert.match(source, /buttonVariants\(\{ variant: "outline" \}\)/);
});
