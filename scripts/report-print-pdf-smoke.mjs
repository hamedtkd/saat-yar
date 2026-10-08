import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";

const PRINT_LAYOUT_EXPRESSION = `(() => {
  const rect = (element) => {
    if (!(element instanceof HTMLElement || element instanceof SVGElement)) return null;
    const box = element.getBoundingClientRect();
    return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height };
  };
  const root = document.querySelector('[data-report-print-root]');
  const cards = [...(root?.querySelectorAll('.report-print-charts article') || [])];
  const charts = [...(root?.querySelectorAll('.report-print-charts [role="img"]') || [])];
  const svgs = [...(root?.querySelectorAll('.report-print-charts svg.recharts-surface') || [])];
  const activity = root?.querySelector('[data-activity-breakdown]');
  const table = root?.querySelector('.report-table-layout');
  const bounds = { root: rect(root), activity: rect(activity), table: rect(table) };
  bounds.cards = cards.map(rect);
  bounds.charts = charts.map(rect);
  bounds.svgs = svgs.map(rect);
  bounds.cardSvgContainment = svgs.map((svg) => {
    const card = svg.closest('article');
    const cardBox = rect(card);
    const svgBox = rect(svg);
    return Boolean(cardBox && svgBox && svgBox.left >= cardBox.left - 1 && svgBox.right <= cardBox.right + 1 && svgBox.top >= cardBox.top - 1 && svgBox.bottom <= cardBox.bottom + 1);
  });
  bounds.visiblePrintHeader = getComputedStyle(root?.querySelector('.report-print-header') || document.body).display !== 'none';
  bounds.visibleFloatingNotices = [...document.querySelectorAll('[data-floating-notice]')].filter((element) => getComputedStyle(element).display !== 'none').length;
  bounds.horizontalOverflow = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
  return bounds;
})()`;

async function evaluate(client, expression) {
  const result = await client.call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || "Print layout evaluation failed");
  return result.result?.value;
}

export async function captureReportPrintPdf(client, outputPath) {
  await client.call("Emulation.setEmulatedMedia", { media: "print" });
  await evaluate(client, "document.fonts?.ready");
  const layout = await evaluate(client, PRINT_LAYOUT_EXPRESSION);
  assert.ok(layout?.root, "Reports print root is present");

  const result = await client.call("Page.printToPDF", {
    preferCSSPageSize: true,
    printBackground: true,
    displayHeaderFooter: false,
    transferMode: "ReturnAsBase64",
  });
  const pdf = Buffer.from(result.data || "", "base64");
  assert.ok(pdf.subarray(0, 5).toString("ascii") === "%PDF-", "Chromium generated a real PDF");
  const pages = [...pdf.toString("latin1").matchAll(/\/Type\s*\/Page\b/g)].length;
  assert.ok(pages >= 1, "generated PDF contains at least one paginated page");
  assert.ok(pages <= 4, `fixed Employee report fixture should finish in four A4 landscape pages, not add an empty trailing page (got ${pages})`);
  await writeFile(outputPath, pdf);
  await client.call("Emulation.setEmulatedMedia", { media: "screen" });
  assert.ok(layout.visiblePrintHeader, `print header is visible in print media: ${JSON.stringify(layout)}`);
  assert.equal(layout.visibleFloatingNotices, 0, `floating app notices are hidden in print: ${JSON.stringify(layout)}`);
  assert.equal(layout.horizontalOverflow, false, `print layout has no horizontal overflow: ${JSON.stringify(layout)}`);
  assert.ok(layout.cardSvgContainment.every(Boolean), `every chart SVG remains inside its chart card: ${JSON.stringify(layout)}`);
  assert.ok(layout.svgs.length > 0, `real Recharts plots are present in the PDF fixture: ${JSON.stringify(layout)}`);
  return { path: outputPath, pages, bytes: pdf.length, layout };
}

export async function seedReportPrintFixture(client) {
  return evaluate(client, `(() => new Promise((resolve, reject) => {
    const opening = indexedDB.open("saatyar-db", 1);
    opening.onerror = () => reject(opening.error);
    opening.onsuccess = () => {
      const db = opening.result;
      const read = db.transaction("app-data", "readonly").objectStore("app-data").get("current");
      read.onerror = () => { db.close(); reject(read.error); };
      read.onsuccess = () => {
        const snapshot = read.result;
        if (!snapshot?.data?.records) { db.close(); reject(new Error("AppData work records are unavailable")); return; }
        const now = new Date();
        const day = new Date(now.getFullYear(), now.getMonth(), 1, 12);
        const year = day.getFullYear();
        const month = day.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        let added = 0;
        for (let index = 1; index <= days; index += 1) {
          if (index % 2 === 0) continue;
          const date = new Date(year, month, index, 12);
          if (date > now) continue;
          const key = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
          snapshot.data.records[key] = {
            date: key, start: "09:00", end: "17:30", lunchMinutes: 30, breaks: [],
            activitySegments: [
              { id: "print-deep-" + key, kind: "deep-work", start: "09:00", end: "12:00" },
              { id: "print-meeting-" + key, kind: "meeting", start: "13:00", end: "15:00" },
              { id: "print-admin-" + key, kind: "admin", start: "15:00", end: "17:00" },
            ],
            leaveMinutes: 0, leaveType: "none", note: "print regression fixture", holiday: false,
          };
          added += 1;
        }
        const transaction = db.transaction("app-data", "readwrite");
        transaction.objectStore("app-data").put({ ...snapshot, savedAt: new Date().toISOString() }, "current");
        transaction.oncomplete = () => { db.close(); resolve(added); };
        transaction.onerror = () => { db.close(); reject(transaction.error); };
        transaction.onabort = () => { db.close(); reject(transaction.error); };
      };
    };
  }))()`);
}
