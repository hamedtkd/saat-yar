import type { ParsedCsv } from "./types.ts";

const DELIMITERS = [",", ";", "\t"] as const;

function countDelimiter(line: string, delimiter: string) {
  let count = 0;
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') index += 1;
      else quoted = !quoted;
    } else if (!quoted && char === delimiter) count += 1;
  }
  return count;
}

function detectDelimiter(text: string) {
  const firstMeaningfulLine = text.replace(/^\uFEFF/, "").split(/\r?\n/).find((line) => line.trim()) ?? "";
  return DELIMITERS
    .map((delimiter) => ({ delimiter, count: countDelimiter(firstMeaningfulLine, delimiter) }))
    .sort((a, b) => b.count - a.count)[0]?.delimiter ?? ",";
}

function parseRows(text: string, delimiter: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const source = text.replace(/^\uFEFF/, "");

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (char === '"') {
      if (quoted && source[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else quoted = !quoted;
      continue;
    }
    if (!quoted && char === delimiter) {
      row.push(cell.trim());
      cell = "";
      continue;
    }
    if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && source[index + 1] === "\n") index += 1;
      row.push(cell.trim());
      cell = "";
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      continue;
    }
    cell += char;
  }
  row.push(cell.trim());
  if (row.some((value) => value.length > 0)) rows.push(row);
  return rows;
}

export function parseCsvText(text: string): ParsedCsv {
  const delimiter = detectDelimiter(text);
  const table = parseRows(text, delimiter);
  if (table.length < 2) throw new Error("CSV must include a header and at least one data row.");

  const headers = table[0].map((header) => header.trim());
  if (!headers.length || headers.some((header) => !header)) throw new Error("CSV headers are required and cannot be empty.");
  const uniqueHeaders = new Set(headers.map((header) => header.toLocaleLowerCase("fa-IR")));
  if (uniqueHeaders.size !== headers.length) throw new Error("CSV headers must be unique.");

  const rows = table.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
  return { headers, rows, delimiter };
}
