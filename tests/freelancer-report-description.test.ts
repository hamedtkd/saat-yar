import assert from "node:assert/strict";
import test from "node:test";
import { getFreelancerReportDescription } from "../lib/freelancer-report-description.ts";
import { serializeCsv } from "../lib/exporters.ts";

test("freelancer Reports description prefers note over task", () => {
  assert.equal(getFreelancerReportDescription({ note: "Note value", task: "Task value" }), "Note value");
});

test("freelancer Reports description falls back from an empty note to task", () => {
  assert.equal(getFreelancerReportDescription({ note: "", task: "Task value" }), "Task value");
});

test("freelancer Reports description falls back when note is absent or null at runtime", () => {
  assert.equal(getFreelancerReportDescription({ task: "Task value" } as Parameters<typeof getFreelancerReportDescription>[0]), "Task value");
  assert.equal(getFreelancerReportDescription({ note: null, task: "Task value" } as unknown as Parameters<typeof getFreelancerReportDescription>[0]), "Task value");
});

test("freelancer Reports description preserves whitespace and empty fallback semantics", () => {
  assert.equal(getFreelancerReportDescription({ note: "   ", task: "Task value" }), "   ");
  assert.equal(getFreelancerReportDescription({ note: "", task: "" }), "");
});

test("freelancer CSV export keeps task descriptions and applies existing formula safety", () => {
  const description = getFreelancerReportDescription({ note: "", task: "=SUM(1,1)" });
  assert.equal(serializeCsv(["Description"], [[description]]), `Description\n"'=SUM(1,1)"`);
});

test("freelancer CSV export preserves Persian task descriptions", () => {
  const description = getFreelancerReportDescription({ note: "", task: "پیگیری پروژه مشتری" });
  assert.equal(serializeCsv(["شرح"], [[description]]), "شرح\nپیگیری پروژه مشتری");
});
