type Cell = string | number;

const escapeXml = (value: Cell) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function exportExcel(
  filename: string,
  title: string,
  headers: string[],
  rows: Cell[][],
) {
  const rowXml = [headers, ...rows]
    .map(
      (row, rowIndex) =>
        `<Row>${row
          .map((cell) => {
            const isNumber = typeof cell === "number";
            return `<Cell${rowIndex === 0 ? ' ss:StyleID="Header"' : ""}><Data ss:Type="${isNumber ? "Number" : "String"}">${escapeXml(cell)}</Data></Cell>`;
          })
          .join("")}</Row>`,
    )
    .join("");
  const workbook = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Horizontal="Right" ss:ReadingOrder="RightToLeft"/><Font ss:FontName="Vazirmatn"/></Style>
  <Style ss:ID="Header"><Font ss:Bold="1"/><Interior ss:Color="#E6F5EF" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center" ss:ReadingOrder="RightToLeft"/></Style>
 </Styles>
 <Worksheet ss:Name="${escapeXml(title).slice(0, 31)}"><Table>${rowXml}</Table>
 <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel"><DisplayRightToLeft/></WorksheetOptions>
 </Worksheet></Workbook>`;
  download(
    new Blob(["\uFEFF", workbook], { type: "application/vnd.ms-excel;charset=utf-8" }),
    filename.endsWith(".xls") ? filename : `${filename}.xls`,
  );
}

export function exportCsv(filename: string, headers: string[], rows: Cell[][]) {
  const encode = (cell: Cell) => `"${String(cell).replaceAll('"', '""')}"`;
  const csv = [headers, ...rows].map((row) => row.map(encode).join(",")).join("\r\n");
  download(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }), filename);
}
