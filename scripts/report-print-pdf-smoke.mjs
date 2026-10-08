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
  const plots = [...(root?.querySelectorAll('.report-print-charts [data-report-chart-plot]') || [])];
  const activity = root?.querySelector('[data-activity-breakdown]');
  const table = root?.querySelector('.report-table-layout');
  const bounds = { root: rect(root), activity: rect(activity), table: rect(table) };
  bounds.cards = cards.map(rect);
  bounds.charts = charts.map(rect);
  bounds.svgs = svgs.map(rect);
  bounds.plots = plots.map(rect);
  bounds.bars = plots.map((plot) => [...new Set(plot.querySelectorAll('.recharts-bar-rectangle, .recharts-rectangle'))].map(rect).filter((box) => box && box.width > 0 && box.height > 0));
  bounds.pieSectors = [...(root?.querySelectorAll('.recharts-pie .recharts-sector') || [])].map(rect).filter((box) => box && box.width > 0 && box.height > 0);
  bounds.pieSectorContainment = [...(root?.querySelectorAll('.recharts-pie .recharts-sector') || [])].map((sector) => {
    const cardBox = rect(sector.closest('article'));
    const sectorBox = rect(sector);
    return Boolean(cardBox && sectorBox && sectorBox.width > 0 && sectorBox.height > 0 && sectorBox.left >= cardBox.left - 1 && sectorBox.right <= cardBox.right + 1 && sectorBox.top >= cardBox.top - 1 && sectorBox.bottom <= cardBox.bottom + 1);
  });
  bounds.axisTicks = plots.map((plot) => [...plot.querySelectorAll('svg text')].map(rect).filter(Boolean));
  bounds.legends = [...(root?.querySelectorAll('[data-report-chart-legend]') || [])].map(rect);
  bounds.legendCardContainment = [...(root?.querySelectorAll('[data-report-chart-legend]') || [])].map((legend) => {
    const cardBox = rect(legend.closest('article'));
    const legendBox = rect(legend);
    return Boolean(cardBox && legendBox && legendBox.left >= cardBox.left - 1 && legendBox.right <= cardBox.right + 1 && legendBox.top >= cardBox.top - 1 && legendBox.bottom <= cardBox.bottom + 1);
  });
  bounds.plotCardContainment = plots.map((plot) => {
    const cardBox = rect(plot.closest('article'));
    const plotBox = rect(plot);
    return Boolean(cardBox && plotBox && plotBox.left >= cardBox.left - 1 && plotBox.right <= cardBox.right + 1 && plotBox.top >= cardBox.top - 1 && plotBox.bottom <= cardBox.bottom + 1);
  });
  bounds.barContainment = plots.map((plot, index) => {
    const plotBox = rect(plot);
    const bars = bounds.bars[index] || [];
    return Boolean(plotBox && bars.length > 0 && bars.every((bar) => bar.left >= plotBox.left - 1 && bar.right <= plotBox.right + 1 && bar.top >= plotBox.top - 1 && bar.bottom <= plotBox.bottom + 1));
  });
  bounds.axisContainment = plots.map((plot, index) => {
    const plotBox = rect(plot);
    const ticks = bounds.axisTicks[index] || [];
    return Boolean(plotBox && ticks.length > 0 && ticks.every((tick) => tick.left >= plotBox.left - 1 && tick.right <= plotBox.right + 1 && tick.top >= plotBox.top - 1 && tick.bottom <= plotBox.bottom + 1));
  });
  bounds.plotOverflow = plots.map((plot) => getComputedStyle(plot).overflow);
  bounds.cardSequenceClear = bounds.cards.every((card, index) => index === 0 || card.top >= bounds.cards[index - 1].bottom - 1);
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

export async function captureReportPrintPdf(client, outputPath, { requireCharts = true } = {}) {
  await client.call("Emulation.setEmulatedMedia", { media: "print" });
  await evaluate(client, "document.fonts?.ready");
  await evaluate(client, "new Promise((resolve) => { let frame = 0; const settle = () => { if (++frame < 5) requestAnimationFrame(settle); else resolve(true); }; requestAnimationFrame(settle); })");
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
  await writeFile(outputPath, pdf);
  await client.call("Emulation.setEmulatedMedia", { media: "screen" });
  assert.ok(layout.visiblePrintHeader, `print header is visible in print media: ${JSON.stringify(layout)}`);
  assert.equal(layout.visibleFloatingNotices, 0, `floating app notices are hidden in print: ${JSON.stringify(layout)}`);
  assert.equal(layout.horizontalOverflow, false, `print layout has no horizontal overflow: ${JSON.stringify(layout)}`);
  assert.ok(layout.cardSvgContainment.every(Boolean), `every chart SVG remains inside its chart card: ${JSON.stringify(layout)}`);
  if (layout.plots.length) {
    assert.ok(layout.plotCardContainment.every(Boolean), `employee plot viewport remains inside its chart card: ${JSON.stringify(layout)}`);
    assert.ok(layout.barContainment.every(Boolean), `every rendered bar primitive stays inside the plot viewport: ${JSON.stringify(layout)}`);
    assert.ok(layout.axisContainment.every(Boolean), `visible axis tick labels fit inside the plot viewport: ${JSON.stringify(layout)}`);
  }
  assert.ok(layout.legendCardContainment.every(Boolean), `chart legends remain inside their card: ${JSON.stringify(layout)}`);
  assert.ok(layout.plotOverflow.every((overflow) => overflow === "hidden"), `plot viewport clips SVG painting at its deterministic print bounds: ${JSON.stringify(layout)}`);
  assert.ok(layout.cardSequenceClear, `chart cards do not overlap the following chart section: ${JSON.stringify(layout)}`);
  if (requireCharts) assert.ok(layout.svgs.length > 0, `real Recharts plots are present in the PDF fixture: ${JSON.stringify(layout)}`);
  if (requireCharts) {
    assert.ok(layout.pieSectors.length > 0, `donut chart renders actual pie sectors in the PDF: ${JSON.stringify(layout)}`);
    assert.ok(layout.pieSectorContainment.every(Boolean), `every donut sector stays inside its chart card: ${JSON.stringify(layout)}`);
  }
  assert.ok(pages <= 8, `fixed report fixture must not grow beyond eight A4 landscape pages: ${pages}`);
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
