import {
  APP_DATA_COLLECTION_KEYS,
  APP_DATA_KEYS,
  type AppDataKey,
} from "./app-data-contract.ts";

export type AppDataFieldIssue = {
  path: string;
  expected: string;
  received: string;
};

export type AppDataContractDiff = {
  missing: AppDataKey[];
  unexpected: string[];
  invalid: AppDataFieldIssue[];
};

function describeValue(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

export function inspectAppDataContract(value: unknown): AppDataContractDiff {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      missing: [...APP_DATA_KEYS],
      unexpected: [],
      invalid: [{ path: "$", expected: "object", received: describeValue(value) }],
    };
  }

  const candidate = value as Record<string, unknown>;
  const actualKeys = Object.keys(candidate);
  const expectedKeys = new Set<string>(APP_DATA_KEYS);
  const missing = APP_DATA_KEYS.filter((key) => !Object.prototype.hasOwnProperty.call(candidate, key));
  const unexpected = actualKeys.filter((key) => !expectedKeys.has(key)).sort();
  const invalid: AppDataFieldIssue[] = [];

  if (Object.prototype.hasOwnProperty.call(candidate, "settings")) {
    const settings = candidate.settings;
    if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
      invalid.push({ path: "settings", expected: "object", received: describeValue(settings) });
    }
  }

  if (Object.prototype.hasOwnProperty.call(candidate, "records")) {
    const records = candidate.records;
    if (!records || typeof records !== "object" || Array.isArray(records)) {
      invalid.push({ path: "records", expected: "object", received: describeValue(records) });
    }
  }

  for (const key of APP_DATA_COLLECTION_KEYS) {
    if (key === "records" || !Object.prototype.hasOwnProperty.call(candidate, key)) continue;
    if (!Array.isArray(candidate[key])) {
      invalid.push({ path: key, expected: "array", received: describeValue(candidate[key]) });
    }
  }

  return { missing, unexpected, invalid };
}

export function hasAppDataContractDiff(diff: AppDataContractDiff): boolean {
  return diff.missing.length > 0 || diff.unexpected.length > 0 || diff.invalid.length > 0;
}

function renderList(title: string, values: string[]): string[] {
  return values.length > 0 ? [title, ...values.map((value) => `- ${value}`), ""] : [];
}

export function formatAppDataAuditFailure(
  label: string,
  schemaVersion: number,
  diff: AppDataContractDiff,
): string {
  const invalid = diff.invalid.map(
    (issue) => `${issue.path}: expected ${issue.expected}, received ${issue.received}`,
  );
  const suggestions = [
    ...(diff.missing.length > 0
      ? ["Add every missing key to the AppData factory, migrations and round-trip paths."]
      : []),
    ...(diff.unexpected.length > 0
      ? ["Remove stale top-level keys or add an explicit migration before accepting them."]
      : []),
    ...(diff.invalid.length > 0
      ? ["Repair invalid collection shapes before storage, backup or recovery code receives them."]
      : []),
  ];

  return [
    "AppData schema audit failed",
    "",
    `Path: ${label}`,
    `Schema: v${schemaVersion}`,
    "",
    ...renderList("Missing:", diff.missing),
    ...renderList("Unexpected:", diff.unexpected),
    ...renderList("Invalid:", invalid),
    ...renderList("Suggested action:", suggestions),
  ].join("\n").trimEnd();
}

export function formatAppDataAuditExecutionError(
  label: string,
  schemaVersion: number,
  error: unknown,
): string {
  const message = error instanceof Error ? error.message : String(error);
  return [
    "AppData schema audit failed",
    "",
    `Path: ${label}`,
    `Schema: v${schemaVersion}`,
    "",
    "Execution error:",
    `- ${message}`,
    "",
    "Suggested action:",
    "- Inspect the failing factory, migration or round-trip path before changing the schema contract.",
  ].join("\n");
}
