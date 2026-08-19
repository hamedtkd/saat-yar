import assert from "node:assert/strict";
import test from "node:test";

import { browserInputValuesEquivalent } from "../scripts/browser-input-fidelity.ts";

test("Phase 198.1 R16 browser input fidelity accepts localized Persian digits for the same numeric value", () => {
  assert.equal(browserInputValuesEquivalent("۱۲۵۰۰۰", "125000"), true);
  assert.equal(browserInputValuesEquivalent("۲٬۵۰۰٬۰۰۰", "2500000"), true);
});

test("Phase 198.1 R16 browser input fidelity stays strict for non-numeric controlled text", () => {
  assert.equal(browserInputValuesEquivalent("هزینه مرورگر", "هزینه مرورگر"), true);
  assert.equal(browserInputValuesEquivalent("هزینه مرورگر", "خدمات مرورگر"), false);
});

test("Phase 198.1 R16 browser input fidelity does not hide a different numeric value", () => {
  assert.equal(browserInputValuesEquivalent("۱۲۵۰۰۱", "125000"), false);
});
