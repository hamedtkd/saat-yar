import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createMediaDemoData } from "./media/demo-data.ts";
import { launchBrowserDebugTarget } from "./browser-debug-startup.mjs";
import { findBrowserExecutable } from "./production-browser-smoke.mjs";
import { buildAppNavigationExpression, buildRouteReadyExpression } from "./browser-route-expression.mjs";
import { buildEmployeePersistenceProbeExpression } from "./employee-persistence-expression.mjs";
import { startStaticExportServer } from "./static-export-server.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TIMEOUT = 30_000;
const EMPLOYEE_NOTE = "گزارش مرورگر کارمند؛ تحویل کارها و برنامه فردا";
const NET_DURATION = "۸:۱۵";

class CdpClient {
  constructor(url) {
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
    this.runtimeErrors = [];
    this.socket = new WebSocket(url);
    this.ready = new Promise((resolveReady, reject) => {
      this.socket.onopen = resolveReady;
      this.socket.onerror = () => reject(new Error("Could not connect to browser debugging socket."));
    });
    this.socket.onmessage = (message) => {
      const payload = JSON.parse(String(message.data));
      if (payload.id) {
        const pending = this.pending.get(payload.id);
        if (!pending) return;
        this.pending.delete(payload.id);
        if (payload.error) pending.reject(new Error(payload.error.message));
        else pending.resolve(payload.result);
        return;
      }
      for (const listener of this.listeners.get(payload.method) ?? []) listener(payload.params);
    };
  }
  async call(method, params = {}) {
    await this.ready;
    const id = this.nextId++;
    const result = new Promise((resolveCall, reject) => this.pending.set(id, { resolve: resolveCall, reject }));
    this.socket.send(JSON.stringify({ id, method, params }));
    return result;
  }
  on(method, listener) {
    const listeners = this.listeners.get(method) ?? [];
    listeners.push(listener);
    this.listeners.set(method, listeners);
  }
  close() { this.socket.close(); }
}

async function evaluate(client, expression) {
  const response = await client.call("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (response.exceptionDetails) {
    throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text || "Browser evaluation failed.");
  }
  return response.result?.value;
}

async function waitFor(client, expression, label, timeout = TIMEOUT) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (client.runtimeErrors.length) throw new Error(`Runtime error while waiting for ${label}: ${client.runtimeErrors.join("\n")}`);
    try {
      if (await evaluate(client, expression)) return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!/execution context|Cannot find context|navigated or closed/i.test(message)) throw error;
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  }
  const diagnostics = await evaluate(client, `(() => ({
    href: location.href,
    body: (document.body?.innerText || "").replace(/\\s+/g," ").slice(0,900),
    active: document.activeElement ? {
      tag: document.activeElement.tagName,
      type: document.activeElement.getAttribute?.("type") || "",
      value: "value" in document.activeElement ? String(document.activeElement.value).slice(0,120) : "",
      text: (document.activeElement.textContent || "").replace(/\\s+/g," ").trim().slice(0,120),
    } : null,
    alerts: [...document.querySelectorAll('[role="alert"]')].map((node) => (node.textContent || "").replace(/\\s+/g," ").trim()).filter(Boolean).slice(0,4),
    dialog: (document.querySelector('[role="dialog"]')?.textContent || "").replace(/\\s+/g," ").trim().slice(0,220),
  }))()`).catch(() => null);
  throw new Error(`Timed out while waiting for ${label}. State: ${JSON.stringify(diagnostics)}`);
}

async function navigate(client, url, text) {
  await client.call("Page.navigate", { url });
  await waitFor(client, "document.readyState === 'complete'", `document load ${url}`);
  if (text) await waitFor(client, `document.body?.innerText.includes(${JSON.stringify(text)})`, text);
  await settleUi(client);
}

async function navigateInApp(client, pathname, text) {
  const result = await evaluate(client, buildAppNavigationExpression(pathname));
  if (!result?.clicked) {
    throw new Error(`App navigation link not found: ${pathname}. Available anchors: ${JSON.stringify(result?.available ?? [])}`);
  }
  await waitFor(client, buildRouteReadyExpression(pathname), `in-app navigation ${pathname}`);
  if (text) await waitFor(client, `document.body?.innerText.includes(${JSON.stringify(text)})`, text);
  await settleUi(client);
}

async function settleUi(client) {
  await evaluate(client, `new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))`);
}

async function clickButton(client, text, exact = false) {
  const clicked = await evaluate(client, `(() => {
    const wanted = ${JSON.stringify(text)};
    const norm = (value) => (value || "").replace(/\\s+/g," ").trim();
    const button = [...document.querySelectorAll("button")].find((item) => !item.disabled && ${exact ? "norm(item.textContent) === wanted" : "norm(item.textContent).includes(wanted)"});
    if (!button) return false;
    button.click();
    return true;
  })()`);
  if (!clicked) throw new Error(`Button not found: ${text}`);
  await settleUi(client);
}

async function clickSummary(client, text) {
  const clicked = await evaluate(client, `(() => {
    const wanted = ${JSON.stringify(text)};
    const norm = (value) => (value || "").replace(/\\s+/g," ").trim();
    const summary = [...document.querySelectorAll("summary")].find((item) => norm(item.textContent).includes(wanted));
    if (!summary) return false;
    summary.click();
    return true;
  })()`);
  if (!clicked) throw new Error(`Summary not found: ${text}`);
  await settleUi(client);
}

async function focusBySelector(client, expression, label) {
  const focused = await evaluate(client, `(() => {
    const input = ${expression};
    if (!input) return false;
    input.focus();
    return document.activeElement === input;
  })()`);
  if (!focused) throw new Error(`Field not found: ${label}`);
}

async function replaceFocusedText(client, value) {
  const updated = await evaluate(client, `(() => {
    const field = document.activeElement;
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return false;
    const prototype = field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
    if (!setter) return false;
    setter.call(field, ${JSON.stringify(value)});
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  })()`);
  if (!updated) throw new Error("Focused field could not receive React-compatible text input.");
  await settleUi(client);
  const reflected = await evaluate(client, `document.activeElement?.value === ${JSON.stringify(value)}`);
  if (!reflected) throw new Error(`Controlled field did not retain the expected value: ${value}`);
}

async function pressKey(client, key, code = key) {
  const windowsVirtualKeyCode = key === "Enter" ? 13 : key === "Tab" ? 9 : 0;
  const text = key === "Enter" ? "\r" : undefined;
  await client.call("Input.dispatchKeyEvent", {
    type: "keyDown", key, code, windowsVirtualKeyCode, nativeVirtualKeyCode: windowsVirtualKeyCode,
    ...(text ? { text, unmodifiedText: text } : {}),
  });
  await client.call("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode, nativeVirtualKeyCode: windowsVirtualKeyCode });
  await settleUi(client);
}

async function setTimeCardValue(client, title, value) {
  await focusBySelector(client, `(() => {
    const norm = (value) => (value || "").replace(/\\s+/g," ").trim();
    const title = [...document.querySelectorAll("strong")].find((node) => norm(node.textContent) === ${JSON.stringify(title)});
    let node = title?.parentElement;
    while (node && !node.querySelector('input[aria-label="زمان"]')) node = node.parentElement;
    return node?.querySelector('input[aria-label="زمان"]') || null;
  })()`, `${title} time`);
  await replaceFocusedText(client, value);
  await pressKey(client, "Enter", "Enter");
}

async function setSectionTimeValue(client, sectionTitle, fieldTitle, value, occurrence = 0) {
  await focusBySelector(client, `(() => {
    const norm = (value) => (value || "").replace(/\\s+/g," ").trim();
    const section = [...document.querySelectorAll("section")].find((node) => [...node.querySelectorAll("strong")].some((item) => norm(item.textContent) === ${JSON.stringify(sectionTitle)}));
    if (!section) return null;
    const labels = [...section.querySelectorAll("label")].filter((label) => [...label.querySelectorAll("span")].some((span) => norm(span.textContent) === ${JSON.stringify(fieldTitle)}));
    return labels[${occurrence}]?.querySelector('input[aria-label="زمان"]') || null;
  })()`, `${sectionTitle}/${fieldTitle}`);
  await replaceFocusedText(client, value);
  await pressKey(client, "Enter", "Enter");
}

async function ensureFirstBreakUnpaid(client) {
  const state = await evaluate(client, `(() => {
    const checkbox = document.querySelector('[role="checkbox"][aria-label="وقفه 1 با حقوق"]');
    if (!checkbox) return { found: false, checked: null };
    return {
      found: true,
      checked: checkbox.getAttribute("data-state") === "checked" || checkbox.getAttribute("aria-checked") === "true",
    };
  })()`);
  if (!state?.found) throw new Error("Break paid/unpaid control not found.");
  if (state.checked) {
    await evaluate(client, `document.querySelector('[role="checkbox"][aria-label="وقفه 1 با حقوق"]')?.click()`);
    await settleUi(client);
  }
  await waitFor(client, `(() => {
    const checkbox = document.querySelector('[role="checkbox"][aria-label="وقفه 1 با حقوق"]');
    return checkbox && checkbox.getAttribute("data-state") !== "checked" && checkbox.getAttribute("aria-checked") !== "true";
  })()`, "unpaid break contract");
}

async function setEmployeeNote(client, value) {
  await focusBySelector(client, `document.querySelector('textarea[placeholder*="کارهای انجام‌شده"]')`, "employee note");
  await replaceFocusedText(client, value);
}

async function seedEmployeeData(client) {
  const data = createMediaDemoData();
  data.settings.mode = "employee";
  data.settings.autoOfficialHolidays = false;
  data.settings.autoWeeklyHoliday = false;
  data.settings.defaultStart = "08:00";
  data.settings.defaultEnd = "17:00";
  data.settings.lunchMinutes = 30;
  for (const schedule of Object.values(data.settings.weeklySchedule)) {
    schedule.enabled = true;
    schedule.start = "08:00";
    schedule.end = "17:00";
    schedule.lunchMinutes = 30;
  }
  data.records = {};
  data.leaves = [];
  data.deletedRecords = [];
  await evaluate(client, `(async () => {
    const data = ${JSON.stringify(data)};
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open("saatyar-db", 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains("app-data")) request.result.createObjectStore("app-data");
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise((resolve, reject) => {
      const tx = db.transaction("app-data", "readwrite");
      tx.objectStore("app-data").put(data, "current");
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
    localStorage.setItem("saatyar:last-route", "/today");
    return true;
  })()`);
}

async function currentDateKey(client) {
  return evaluate(client, `(() => {
    const date = new Date();
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2,"0"), String(date.getDate()).padStart(2,"0")].join("-");
  })()`);
}

async function waitForEmployeePersistence(client, date) {
  const expression = buildEmployeePersistenceProbeExpression({ date, note: EMPLOYEE_NOTE });
  const deadline = Date.now() + TIMEOUT;
  let lastProbe = null;
  while (Date.now() < deadline) {
    if (client.runtimeErrors.length) throw new Error(`Runtime error while waiting for employee workflow persistence: ${client.runtimeErrors.join("\n")}`);
    try {
      lastProbe = await evaluate(client, expression);
      if (lastProbe?.ready) return lastProbe;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!/execution context|Cannot find context|navigated or closed/i.test(message)) throw error;
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  }
  throw new Error(`Timed out while waiting for employee workflow persistence. Probe: ${JSON.stringify(lastProbe)}`);
}

async function main() {
  const outputDirectory = resolve(ROOT, "out");
  if (!existsSync(resolve(outputDirectory, "index.html"))) throw new Error("Static production export is missing. Run npm run build:vercel first.");
  const browserExecutable = findBrowserExecutable();
  if (!browserExecutable) throw new Error("Chrome, Edge or Chromium was not found. Set SAATYAR_BROWSER_PATH.");

  const server = await startStaticExportServer({ outputDirectory });
  let browserSession;
  let client;

  try {
    browserSession = await launchBrowserDebugTarget({
      executable: browserExecutable,
      profilePrefix: "saatyar-employee-ux-",
      extraArgs: ["--disable-background-networking", "--disable-component-update", "--disable-sync"],
    });
    client = new CdpClient(browserSession.target.webSocketDebuggerUrl);
    client.on("Runtime.exceptionThrown", ({ exceptionDetails }) => {
      const description = exceptionDetails?.exception?.description || exceptionDetails?.text || "Runtime exception";
      if (!/ResizeObserver loop|AbortError/i.test(description)) client.runtimeErrors.push(description);
    });
    await client.call("Page.enable");
    await client.call("Runtime.enable");
    await client.call("Storage.clearDataForOrigin", { origin: server.origin, storageTypes: "all" });
    await navigate(client, server.origin, "ساعت‌یار را برای خودت تنظیم کن");
    await seedEmployeeData(client);
    const date = await currentDateKey(client);

    await client.call("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    await navigate(client, `${server.origin}/today`, "یادداشت روز کاری");

    await clickButton(client, "شروع روز", true);
    await waitFor(client, `document.body?.innerText.includes("پایان روز")`, "employee day start");
    await setTimeCardValue(client, "ورود", "08:00");
    console.log("✓ Employee day starts through the real attendance action and keeps an editable arrival time");

    await clickButton(client, "شروع ناهار", true);
    await waitFor(client, `document.body?.innerText.includes("پایان ناهار")`, "lunch running");
    await clickButton(client, "پایان ناهار", true);
    await waitFor(client, `document.body?.innerText.includes("شروع ناهار")`, "lunch saved");
    await clickSummary(client, "ویرایش دقیق ناهار و وقفه‌ها");
    await setSectionTimeValue(client, "ناهار", "شروع", "12:00");
    await setSectionTimeValue(client, "ناهار", "پایان", "12:30");
    console.log("✓ Lunch start/stop flow is recorded and normalized to a deterministic 30-minute interval");

    await clickButton(client, "ثبت وقفه", true);
    await waitFor(client, `document.body?.innerText.includes("۱۵") && document.body?.innerText.includes("۳۰")`, "break duration actions");
    await clickButton(client, "۱۵", true);
    await waitFor(client, `document.body?.innerText.includes("ثبت وقفه")`, "break saved");
    await setSectionTimeValue(client, "وقفه‌ها", "شروع", "15:00");
    await setSectionTimeValue(client, "وقفه‌ها", "پایان", "15:15");
    await ensureFirstBreakUnpaid(client);
    console.log("✓ Break flow records a separate 15-minute unpaid interruption and exposes its pay status");

    await setEmployeeNote(client, EMPLOYEE_NOTE);
    await clickButton(client, "پایان روز", true);
    await waitFor(client, `(() => {
      const norm = (value) => (value || "").replace(/\\s+/g, " ").trim();
      return document.body?.innerText.includes("ثبت این روز کامل شده است")
        && [...document.querySelectorAll("button")].some((button) => !button.disabled && norm(button.textContent) === "ویرایش این روز");
    })()`, "completed employee day edit affordance");
    await clickButton(client, "ویرایش این روز", true);
    await setTimeCardValue(client, "خروج", "17:00");
    await clickButton(client, "ذخیره تغییرات", true);
    await waitFor(client, `document.body?.innerText.includes("ثبت این روز کامل شده است") && document.body?.innerText.includes(${JSON.stringify(NET_DURATION)})`, "employee net duration");
    console.log("✓ Completed-day draft saves 08:00–17:00 with 30m lunch + 15m break as 8:15 net work");

    await navigateInApp(client, "/month", "ماه من");
    await waitFor(client, `document.body?.innerText.includes("جزئیات روز انتخاب‌شده") && document.body?.innerText.includes(${JSON.stringify(NET_DURATION)})`, "employee month details");
    console.log("✓ Month view reflects the completed employee attendance calculation");

    await navigateInApp(client, "/reports", "گزارش کارکرد و حقوق");
    await waitFor(client, `document.body?.innerText.includes("فیش حقوقی تخمینی ماه") && document.body?.innerText.includes("کارکرد این ماه")`, "employee payroll report");
    console.log("✓ Reports expose employee work totals and the saved payroll policy summary");

    const persistenceProbe = await waitForEmployeePersistence(client, date);
    console.log(`✓ Employee workflow is durable in IndexedDB (${persistenceProbe.storageShape}, schema v${persistenceProbe.schemaVersion ?? "legacy"})`);

    await client.call("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true, screenWidth: 390, screenHeight: 844 });
    await navigate(client, `${server.origin}/today`, EMPLOYEE_NOTE);
    await waitFor(client, `document.body?.innerText.includes("ثبت این روز کامل شده است") && document.body?.innerText.includes(${JSON.stringify(NET_DURATION)})`, "employee hard reload");
    const mobileContract = await evaluate(client, `(() => ({
      pageFits: document.documentElement.scrollWidth <= window.innerWidth + 2,
      noteVisible: document.body?.innerText.includes(${JSON.stringify(EMPLOYEE_NOTE)}),
      completed: document.body?.innerText.includes("ثبت این روز کامل شده است"),
    }))()`);
    if (!mobileContract?.pageFits || !mobileContract.noteVisible || !mobileContract.completed) {
      throw new Error(`Mobile employee UX contract failed: ${JSON.stringify(mobileContract)}`);
    }
    console.log("✓ Hard reload restores the employee day and mobile Today stays within the viewport");

    if (client.runtimeErrors.length) throw new Error(`Browser runtime errors:\n${client.runtimeErrors.join("\n")}`);
    console.log("Employee browser UX smoke passed.");
  } catch (error) {
    const usefulOutput = (browserSession?.getBrowserOutput() ?? "")
      .split(/\r?\n/)
      .filter((line) => !/google_apis[\\/]gcm|DEPRECATED_ENDPOINT|Authentication Failed: wrong_secret|Failed to log in to GCM|TensorFlow Lite XNNPACK/i.test(line))
      .join("\n")
      .trim();
    if (usefulOutput) console.error(`\nBrowser output:\n${usefulOutput}`);
    throw error;
  } finally {
    client?.close();
    await browserSession?.close();
    await server.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
