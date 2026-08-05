import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("obsolete legacy Tailwind style registry stays removed", async () => {
  await assert.rejects(access(new URL("../lib/tw.ts", import.meta.url)));
});

test("month calendar delegates elevation to the shared surface card", async () => {
  const source = await read("components/pages/month/month-calendar.tsx");
  assert.match(source, /SurfaceCard as="article"/);
  assert.doesNotMatch(source, /0_18px_55px|0_20px_70px/);
});

test("search controls use the shared compact focus ring", async () => {
  const source = (await Promise.all([
    read("components/pages/clients/clients-table.tsx"),
    read("components/pages/reports/report-filters.tsx"),
  ])).join("\n");
  assert.match(source, /focus-within:ring-2/);
  assert.doesNotMatch(source, /focus-within:ring-[34]/);
});

test("floating mobile and picker surfaces keep restrained elevation", async () => {
  const source = (await Promise.all([
    read("components/layout/navigation/mobile-bottom-nav.tsx"),
    read("components/pickers/jalali-date-picker/date-picker-dialog.tsx"),
    read("components/pickers/time-picker/time-picker-dialog.tsx"),
    read("components/pages/month/weekly-chart/weekly-tooltip.tsx"),
  ])).join("\n");
  assert.doesNotMatch(source, /0_2[48]px_(70|80|90)px|0_18px_50px|0_16px_45px/);
});
