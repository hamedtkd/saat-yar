import assert from "node:assert/strict";
import test from "node:test";

import { isoToLocalDateTimeValue, localDateTimeValueToIso } from "../lib/pickers/date-time.ts";
import {
  PICKER_MOBILE_BREAKPOINT,
  resolvePickerPresentation,
  resolvePickerPresentationPreference,
} from "../lib/pickers/responsive-presentation.ts";
import { createPaddedNumberOptions, wheelIndexFromScroll } from "../lib/pickers/wheel.ts";

test("Phase 198.1 picker foundation switches to a mobile drawer below the shared breakpoint", () => {
  assert.equal(PICKER_MOBILE_BREAKPOINT, 800);
  assert.equal(resolvePickerPresentation(320), "drawer");
  assert.equal(resolvePickerPresentation(425), "drawer");
  assert.equal(resolvePickerPresentation(799), "drawer");
});

test("Phase 198.1 picker foundation keeps desktop fields in an anchored popover", () => {
  assert.equal(resolvePickerPresentation(800), "popover");
  assert.equal(resolvePickerPresentation(1280), "popover");
  assert.equal(resolvePickerPresentation(1920), "popover");
});


test("Phase 198.1 R5 time wheel exposes complete 24-hour and minute option sets", () => {
  const hours = createPaddedNumberOptions(24);
  const minutes = createPaddedNumberOptions(60);
  assert.deepEqual([hours[0], hours[23]], ["00", "23"]);
  assert.deepEqual([minutes[0], minutes[59]], ["00", "59"]);
  assert.equal(wheelIndexFromScroll(44 * 17 + 8, hours.length), 17);
  assert.equal(wheelIndexFromScroll(44 * 59 + 30, minutes.length), 59);
});

test("Phase 198.1 R5 date-time editor preserves the local calendar day and minute", () => {
  const input = { date: "2026-08-18", time: "09:30" };
  const iso = localDateTimeValueToIso(input);
  assert.deepEqual(isoToLocalDateTimeValue(iso), input);
});


test("Phase 198.1 R5 DateTimePicker keeps the PersianLabs-style auto presentation contract", () => {
  assert.equal(resolvePickerPresentationPreference("auto", 390), "drawer");
  assert.equal(resolvePickerPresentationPreference("auto", 1280), "popover");
  assert.equal(resolvePickerPresentationPreference("popover", 390), "popover");
  assert.equal(resolvePickerPresentationPreference("drawer", 1280), "drawer");
});
