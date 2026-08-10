import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  cloneHolidayOverrides,
  createHolidayOverrideInput,
  normalizeHolidayOverrides,
  upsertHolidayOverride,
  validateHolidayOverrideInput,
} from "../lib/holiday-overrides.ts";
import type { HolidayOverride } from "../lib/types.ts";

const fixture = (overrides: Partial<HolidayOverride> = {}): HolidayOverride => ({
  id: "holiday-1",
  date: "2026-08-06",
  title: "تعطیلی شرکت",
  kind: "company",
  isHoliday: true,
  ...overrides,
});

test("holiday override drafts clone and normalize without mutating source data", () => {
  const source = [fixture({ title: "  جلسه داخلی  ", multiplier: -2 })];
  const cloned = cloneHolidayOverrides(source);
  cloned[0].title = "ویرایش محلی";
  assert.equal(source[0].title, "  جلسه داخلی  ");

  const normalized = normalizeHolidayOverrides(source);
  assert.equal(normalized[0].title, "جلسه داخلی");
  assert.equal(normalized[0].multiplier, undefined);
});

test("holiday override validation rejects invalid dates, empty titles and edit conflicts", () => {
  const input = createHolidayOverrideInput("2026-08-06");
  assert.match(validateHolidayOverrideInput({ ...input, date: "2026-02-30", title: "نمونه" }, []) ?? "", /تاریخ/);
  assert.match(validateHolidayOverrideInput(input, []) ?? "", /عنوان تعطیلی/);
  assert.match(
    validateHolidayOverrideInput({ ...input, date: "2026-08-07", title: "نمونه" }, [fixture({ id: "holiday-2", date: "2026-08-07" })], "holiday-1") ?? "",
    /قبلاً یک استثنا/,
  );
  assert.equal(validateHolidayOverrideInput({ ...input, title: "نمونه" }, []), null);
});

test("holiday override upsert adds new dates and updates an existing date deterministically", () => {
  const added = upsertHolidayOverride(
    [fixture()],
    { date: "2026-08-08", title: "  تعطیلی اضطراری  ", kind: "emergency", isHoliday: true },
    () => "holiday-2",
  );
  assert.equal(added.updated, false);
  assert.equal(added.item.id, "holiday-2");
  assert.equal(added.item.title, "تعطیلی اضطراری");
  assert.deepEqual(added.items.map((item) => item.date), ["2026-08-08", "2026-08-06"]);

  const updated = upsertHolidayOverride(
    added.items,
    { date: "2026-08-06", title: "روز کاری مجموعه", kind: "manual", isHoliday: false },
    () => "unused",
  );
  assert.equal(updated.updated, true);
  assert.equal(updated.item.id, "holiday-1");
  assert.equal(updated.items.find((item) => item.id === "holiday-1")?.isHoliday, false);
});

test("holiday settings use shared draft editing and confirmed deletion", async () => {
  const source = await readFile("components/pages/settings/holiday-overrides-card.tsx", "utf8");
  assert.match(source, /useSettingsDraft/);
  assert.match(source, /EditableCardActions/);
  assert.match(source, /prepare: normalizeHolidayOverrides/);
  assert.match(source, /editor\.editing &&/);
  assert.match(source, /AlertDialogTitle>\{s\("Delete this holiday exception\?"\)\}<\/AlertDialogTitle>/);
  assert.match(source, /s\("Exception was removed from the draft; save to apply"\)/);
  assert.doesNotMatch(source, /function remove\(/);
});
