import type { Locale } from "./i18n/locales.ts";

function download(content: BlobPart, type: string, filename: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function escapeCsv(value: unknown) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function exportCsv(filename: string, headers: string[], rows: unknown[][]) {
  const content = [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
  download(`\uFEFF${content}`, "text/csv;charset=utf-8", filename);
}

export function exportExcel(filename: string, title: string, headers: string[], rows: unknown[][], locale: Locale = "fa-IR") {
  const tableRows = [headers, ...rows]
    .map((row, index) => `<tr>${row.map((cell) => `<${index === 0 ? "th" : "td"}>${String(cell ?? "")}</${index === 0 ? "th" : "td"}>`).join("")}</tr>`)
    .join("");
  const html = `<!doctype html><html lang="${locale === "en" ? "en" : "fa"}" dir="${locale === "en" ? "ltr" : "rtl"}"><head><meta charset="utf-8"><title>${title}</title></head><body><table>${tableRows}</table></body></html>`;
  download(html, "application/vnd.ms-excel;charset=utf-8", filename);
}
