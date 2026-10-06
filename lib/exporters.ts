import type { Locale } from "./i18n/locales.ts";

function download(content: BlobPart, type: string, filename: string) {
  downloadBlob(new Blob([content], { type }), filename);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  let initiated = false;
  try {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    initiated = true;
  } finally {
    const revoke = () => URL.revokeObjectURL(url);
    if (!initiated) {
      revoke();
    } else {
      try {
        setTimeout(revoke, 0);
      } catch {
        revoke();
      }
    }
  }
}

export function protectCsvTextCell(value: string) {
  // Spreadsheet apps may ignore leading whitespace/control characters before formula markers.
  return /^[\s\u0000-\u001f\u007f-\u009f]*[=+\-@＝＋－＠]/u.test(value) ? `'${value}` : value;
}

function escapeCsv(value: unknown) {
  const text = typeof value === "string" ? protectCsvTextCell(value) : String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function serializeCsv(headers: string[], rows: unknown[][]) {
  return [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
}

export function exportCsv(filename: string, headers: string[], rows: unknown[][]) {
  const content = serializeCsv(headers, rows);
  download(`\uFEFF${content}`, "text/csv;charset=utf-8", filename);
}

function removeInvalidXml10Characters(value: string) {
  let safe = "";
  for (const character of value) {
    const codePoint = character.codePointAt(0)!;
    const isValid = codePoint === 0x9 || codePoint === 0xa || codePoint === 0xd ||
      (codePoint >= 0x20 && codePoint <= 0xd7ff) ||
      (codePoint >= 0xe000 && codePoint <= 0xfffd) ||
      (codePoint >= 0x10000 && codePoint <= 0x10ffff);
    if (isValid) safe += character;
  }
  return safe;
}

function escapeXmlMarkup(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;").replaceAll("\r", "&#13;");
}

function escapeXml(value: string) {
  // Remove invalid XML 1.0 code points from the exported representation only.
  return escapeXmlMarkup(removeInvalidXml10Characters(value));
}

function worksheetName(title: string) {
  return title.replace(/[\\/?*:\[\]]/g, " ").replace(/^'+|'+$/g, "").trim().slice(0, 31) || "Report";
}

function xlsxFilename(filename: string) {
  return `${filename.replace(/\.(?:xls|xlsx)$/i, "")}.xlsx`;
}

function columnName(index: number) {
  let name = "";
  for (let value = index + 1; value > 0; value = Math.floor((value - 1) / 26)) {
    name = String.fromCharCode(65 + (value - 1) % 26) + name;
  }
  return name;
}

function xlsxCell(value: unknown, address: string, header: boolean) {
  const style = header ? ' s="1"' : "";
  if (typeof value === "number" && Number.isFinite(value)) return `<c r="${address}"${style} t="n"><v>${value}</v></c>`;
  if (typeof value === "boolean") return `<c r="${address}"${style} t="b"><v>${value ? 1 : 0}</v></c>`;
  if (value == null) return `<c r="${address}"${style}/>`;
  return `<c r="${address}"${style} t="inlineStr"><is><t xml:space="preserve">${escapeXml(String(value))}</t></is></c>`;
}

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function zipStoredFiles(files: Record<string, string>) {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let localOffset = 0;
  const writeHeader = (length: number, values: Array<[number, number, 16 | 32]>) => {
    const bytes = new Uint8Array(length);
    const view = new DataView(bytes.buffer);
    for (const [offset, value, width] of values) {
      if (width === 16) view.setUint16(offset, value, true);
      else view.setUint32(offset, value, true);
    }
    return bytes;
  };

  for (const [path, content] of Object.entries(files)) {
    const name = encoder.encode(path);
    const data = encoder.encode(content);
    const checksum = crc32(data);
    const localHeader = writeHeader(30, [[0, 0x04034b50, 32], [4, 20, 16], [6, 0x0800, 16], [8, 0, 16], [10, 0, 16], [12, 0, 16], [14, checksum, 32], [18, data.length, 32], [22, data.length, 32], [26, name.length, 16], [28, 0, 16]]);
    const centralHeader = writeHeader(46, [[0, 0x02014b50, 32], [4, 20, 16], [6, 20, 16], [8, 0x0800, 16], [10, 0, 16], [12, 0, 16], [14, 0x0021, 16], [16, checksum, 32], [20, data.length, 32], [24, data.length, 32], [28, name.length, 16], [30, 0, 16], [32, 0, 16], [34, 0, 16], [36, 0, 16], [38, 0, 32], [42, localOffset, 32]]);
    localParts.push(localHeader, name, data);
    centralParts.push(centralHeader, name);
    localOffset += localHeader.length + name.length + data.length;
  }

  const centralDirectory = new Uint8Array(centralParts.reduce((size, part) => size + part.length, 0));
  let centralOffset = 0;
  for (const part of centralParts) { centralDirectory.set(part, centralOffset); centralOffset += part.length; }
  const localData = new Uint8Array(localOffset);
  localOffset = 0;
  for (const part of localParts) { localData.set(part, localOffset); localOffset += part.length; }
  const count = Object.keys(files).length;
  const end = writeHeader(22, [[0, 0x06054b50, 32], [4, 0, 16], [6, 0, 16], [8, count, 16], [10, count, 16], [12, centralDirectory.length, 32], [16, localData.length, 32], [20, 0, 16]]);
  const archive = new Uint8Array(localData.length + centralDirectory.length + end.length);
  archive.set(localData);
  archive.set(centralDirectory, localData.length);
  archive.set(end, localData.length + centralDirectory.length);
  return archive;
}

function createXlsxBytes(title: string, headers: string[], rows: unknown[][], locale: Locale) {
  const sheetData = [headers, ...rows];
  const lastColumn = columnName(Math.max(0, headers.length - 1));
  const lastRow = Math.max(1, sheetData.length);
  const columns = headers.map((header, index) => `<col min="${index + 1}" max="${index + 1}" width="${Math.min(36, Math.max(14, header.length + 2))}" customWidth="1"/>`).join("");
  const sheetRows = sheetData.map((row, rowIndex) => `<row r="${rowIndex + 1}">${row.map((cell, cellIndex) => xlsxCell(cell, `${columnName(cellIndex)}${rowIndex + 1}`, rowIndex === 0)).join("")}</row>`).join("");
  const direction = locale === "en" ? "ltr" : "rtl";
  const files = {
    "[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`,
    "_rels/.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    "xl/workbook.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView/></bookViews><sheets><sheet name="${escapeXml(worksheetName(title))}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    "xl/_rels/workbook.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    "xl/styles.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Vazirmatn"/></font><font><b/><sz val="11"/><name val="Vazirmatn"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`,
    "xl/worksheets/sheet1.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="A1:${lastColumn}${lastRow}"/><sheetViews><sheetView showGridLines="1" rightToLeft="${direction === "rtl" ? 1 : 0}" workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A2" sqref="A2"/></sheetView></sheetViews><cols>${columns}</cols><sheetData>${sheetRows}</sheetData></worksheet>`,
  };
  return zipStoredFiles(files);
}

export async function exportExcel(filename: string, title: string, headers: string[], rows: unknown[][], locale: Locale = "fa-IR") {
  const blob = new Blob([createXlsxBytes(title, headers, rows, locale)], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  downloadBlob(blob, xlsxFilename(filename));
  return blob;
}
