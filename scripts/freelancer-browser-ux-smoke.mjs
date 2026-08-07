import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createMediaDemoData } from "./media/demo-data.ts";
import { cleanupBrowserProfile } from "./browser-profile-cleanup.mjs";
import { findBrowserExecutable } from "./production-browser-smoke.mjs";
import { startStaticExportServer } from "./static-export-server.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TIMEOUT = 30_000;
const CLIENT_NAME = "مشتری مرورگر";
const PROJECT_NAME = "پروژه مرورگر";
const EXPENSE_NAME = "هزینه مرورگر";
const INVOICE_DESCRIPTION = "خدمات مرورگر";

async function freePort() {
  return new Promise((resolvePort, reject) => {
    const server = createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close(() => resolvePort(port));
    });
  });
}

async function waitForJson(url, options = {}, timeout = TIMEOUT) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response.json();
    } catch {}
    await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  }
  throw new Error(`Browser debugging endpoint did not become ready: ${url}`);
}

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
  const body = await evaluate(client, `(document.body?.innerText || "").replace(/\\s+/g," ").slice(0,700)`).catch(() => "");
  throw new Error(`Timed out while waiting for ${label}. Body: ${body}`);
}

async function navigate(client, url, text) {
  await client.call("Page.navigate", { url });
  await waitFor(client, "document.readyState === 'complete'", `document load ${url}`);
  if (text) await waitFor(client, `document.body?.innerText.includes(${JSON.stringify(text)})`, text);
  await new Promise((resolveWait) => setTimeout(resolveWait, 250));
}

async function seedFreelancerData(client) {
  const data = createMediaDemoData();
  data.settings.mode = "freelancer";
  data.clients = [];
  data.projects = [];
  data.timeEntries = [];
  data.expenses = [];
  data.invoices = [];
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
    localStorage.setItem("saatyar:last-route", "/clients");
    return true;
  })()`);
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
}

async function focusField(client, label) {
  const focused = await evaluate(client, `(() => {
    const wanted = ${JSON.stringify(label)};
    const norm = (value) => (value || "").replace(/\\s+/g," ").trim();
    const labels = [...document.querySelectorAll("label")];
    const target = labels.find((item) => norm(item.childNodes[0]?.textContent || item.textContent).startsWith(wanted));
    const input = target?.querySelector("input,textarea,[role=spinbutton]");
    if (!input) return false;
    input.focus();
    return document.activeElement === input;
  })()`);
  if (!focused) throw new Error(`Field not found: ${label}`);
}

async function replaceFocusedText(client, value) {
  await client.call("Input.dispatchKeyEvent", { type: "keyDown", key: "a", code: "KeyA", modifiers: 2 });
  await client.call("Input.dispatchKeyEvent", { type: "keyUp", key: "a", code: "KeyA", modifiers: 2 });
  await client.call("Input.insertText", { text: value });
}

async function pressKey(client, key, code = key) {
  const windowsVirtualKeyCode = key === "Enter" ? 13 : key === "Tab" ? 9 : 0;
  await client.call("Input.dispatchKeyEvent", { type: "keyDown", key, code, windowsVirtualKeyCode });
  await client.call("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode });
}

async function chooseSelect(client, label, option) {
  const opened = await evaluate(client, `(() => {
    const wanted = ${JSON.stringify(label)};
    const norm = (value) => (value || "").replace(/\\s+/g," ").trim();
    const labelNode = [...document.querySelectorAll("span")].find((item) => norm(item.textContent) === wanted);
    const field = labelNode?.parentElement?.parentElement;
    const trigger = field?.querySelector('button[role="combobox"]');
    if (!trigger) return false;
    trigger.click();
    return true;
  })()`);
  if (!opened) throw new Error(`Select trigger not found: ${label}`);
  await waitFor(client, `Boolean(document.querySelector('[role="option"]'))`, `${label} options`);
  const selected = await evaluate(client, `(() => {
    const wanted = ${JSON.stringify(option)};
    const norm = (value) => (value || "").replace(/\\s+/g," ").trim();
    const item = [...document.querySelectorAll('[role="option"]')].find((node) => norm(node.textContent) === wanted);
    if (!item) return false;
    item.click();
    return true;
  })()`);
  if (!selected) throw new Error(`Select option not found: ${option}`);
  await new Promise((resolveWait) => setTimeout(resolveWait, 120));
}

async function terminate(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  if (process.platform === "win32") {
    await new Promise((resolveKill) => {
      const killer = spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
      killer.on("exit", resolveKill);
      killer.on("error", resolveKill);
    });
  } else child.kill("SIGTERM");
  await Promise.race([new Promise((resolveExit) => child.once("exit", resolveExit)), new Promise((resolveWait) => setTimeout(resolveWait, 5_000))]);
}

async function main() {
  const outputDirectory = resolve(ROOT, "out");
  if (!existsSync(resolve(outputDirectory, "index.html"))) throw new Error("Static production export is missing. Run npm run build:vercel first.");
  const browserExecutable = findBrowserExecutable();
  if (!browserExecutable) throw new Error("Chrome, Edge or Chromium was not found. Set SAATYAR_BROWSER_PATH.");

  const server = await startStaticExportServer({ outputDirectory });
  const profileDir = await mkdtemp(join(tmpdir(), "saatyar-freelancer-ux-"));
  const debugPort = await freePort();
  const args = ["--headless=new", `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profileDir}`, "--no-first-run", "--no-default-browser-check", "--disable-dev-shm-usage", "about:blank"];
  if (typeof process.getuid === "function" && process.getuid() === 0) args.push("--no-sandbox");
  const browser = spawn(browserExecutable, args, { stdio: ["ignore", "ignore", "pipe"] });
  let browserOutput = "";
  browser.stderr.on("data", (chunk) => { browserOutput += chunk; });
  let client;

  try {
    await waitForJson(`http://127.0.0.1:${debugPort}/json/version`);
    const target = await waitForJson(`http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent("about:blank")}`, { method: "PUT" });
    client = new CdpClient(target.webSocketDebuggerUrl);
    client.on("Runtime.exceptionThrown", ({ exceptionDetails }) => {
      const description = exceptionDetails?.exception?.description || exceptionDetails?.text || "Runtime exception";
      if (!/ResizeObserver loop|AbortError/i.test(description)) client.runtimeErrors.push(description);
    });
    await client.call("Page.enable");
    await client.call("Runtime.enable");
    await client.call("Storage.clearDataForOrigin", { origin: server.origin, storageTypes: "all" });
    await navigate(client, server.origin, "ساعت‌یار را برای خودت تنظیم کن");
    await seedFreelancerData(client);

    await client.call("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    await navigate(client, `${server.origin}/clients`, "هنوز مشتری‌ای ثبت نشده");
    await clickButton(client, "مشتری جدید");
    await waitFor(client, `document.body?.innerText.includes("اطلاعات پایه")`, "client form");
    const clientAutofocus = await evaluate(client, `document.activeElement?.tagName === "INPUT"`);
    if (!clientAutofocus) throw new Error("Client form did not move focus to the first field.");
    await clickButton(client, "ذخیره مشتری", true);
    await waitFor(client, `Boolean(document.querySelector('[role="alert"]')) && document.body?.innerText.includes("نام مشتری")`, "client inline validation");
    await focusField(client, "نام مشتری");
    await replaceFocusedText(client, CLIENT_NAME);
    await pressKey(client, "Enter", "Enter");
    await waitFor(client, `document.body?.innerText.includes(${JSON.stringify(CLIENT_NAME)}) && !document.body?.innerText.includes("اطلاعات پایه")`, "keyboard client save");
    console.log("✓ Client creation validates inline and submits with Enter");

    const projectDialogOpened = await evaluate(client, `(() => {
      const wanted = ${JSON.stringify(CLIENT_NAME)};
      const row = [...document.querySelectorAll("tr")].find((item) => (item.textContent || "").includes(wanted));
      const button = row && [...row.querySelectorAll("button")].find((item) => (item.textContent || "").includes("پروژه"));
      if (!button) return false;
      button.click();
      return true;
    })()`);
    if (!projectDialogOpened) throw new Error("Could not open project dialog from the new client row.");
    await waitFor(client, `Boolean(document.querySelector('[role="dialog"]'))`, "quick project dialog");
    const dialogOwnsFocus = await evaluate(client, `document.querySelector('[role="dialog"]')?.contains(document.activeElement) === true`);
    if (!dialogOwnsFocus) throw new Error("Quick project dialog did not own keyboard focus.");
    await focusField(client, "نام پروژه");
    await replaceFocusedText(client, PROJECT_NAME);
    await clickButton(client, "ذخیره و انتخاب", true);
    await waitFor(client, `!document.querySelector('[role="dialog"]')`, "quick project dialog close");
    console.log("✓ Project dialog traps focus and creates a linked project");

    await navigate(client, `${server.origin}/projects`, PROJECT_NAME);
    const selectedProject = await evaluate(client, `(() => {
      const wanted = ${JSON.stringify(PROJECT_NAME)};
      const article = [...document.querySelectorAll("article")].find((item) => (item.textContent || "").includes(wanted));
      if (!article) return false;
      article.click();
      return true;
    })()`);
    if (!selectedProject) throw new Error("Created project card was not selectable.");
    await waitFor(client, `document.body?.innerText.includes("هزینه‌های پروژه") && document.body?.innerText.includes(${JSON.stringify(PROJECT_NAME)})`, "project detail");
    await clickButton(client, "شروع تایمر", true);
    await waitFor(client, `document.body?.innerText.includes("پایان تایمر")`, "running project timer");
    await clickButton(client, "پایان تایمر", true);
    await waitFor(client, `document.body?.innerText.includes("شروع تایمر") && !document.body?.innerText.includes("پایان تایمر")`, "saved project time entry");
    console.log("✓ Project time entry starts and stops through the real timer flow");

    await clickButton(client, "ثبت هزینه", true);
    await waitFor(client, `Boolean(document.querySelector('form')) && document.body?.innerText.includes("مبلغ (تومان)")`, "expense form");
    await focusField(client, "عنوان");
    await replaceFocusedText(client, EXPENSE_NAME);
    await focusField(client, "مبلغ (تومان)");
    await replaceFocusedText(client, "125000");
    await pressKey(client, "Enter", "Enter");
    await waitFor(client, `document.body?.innerText.includes(${JSON.stringify(EXPENSE_NAME)}) && !document.body?.innerText.includes("ذخیره هزینه")`, "expense keyboard save");
    console.log("✓ Expense form saves from the keyboard inside project context");

    await navigate(client, `${server.origin}/invoices`, "فاکتورها");
    await clickButton(client, "فاکتور جدید");
    await waitFor(client, `document.body?.innerText.includes("مشخصات صورتحساب")`, "invoice form");
    await chooseSelect(client, "مشتری", CLIENT_NAME);
    await chooseSelect(client, "پروژه", PROJECT_NAME);
    await focusField(client, "شرح");
    await replaceFocusedText(client, INVOICE_DESCRIPTION);
    await focusField(client, "مبلغ واحد");
    await replaceFocusedText(client, "2500000");
    await clickButton(client, "ذخیره فاکتور", true);
    await waitFor(client, `document.body?.innerText.includes(${JSON.stringify(CLIENT_NAME)}) && !document.body?.innerText.includes("مشخصات صورتحساب")`, "invoice save");
    console.log("✓ Invoice creation keeps the client/project relation and validates the real form");

    await client.call("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true, screenWidth: 390, screenHeight: 844 });
    await navigate(client, `${server.origin}/invoices`, "فاکتورها");
    await clickButton(client, "فاکتور جدید");
    await waitFor(client, `document.body?.innerText.includes("مشخصات صورتحساب")`, "mobile invoice form");
    await clickButton(client, "مشتری جدید");
    await waitFor(client, `Boolean(document.querySelector('[role="dialog"]'))`, "mobile quick client dialog");
    for (let index = 0; index < 6; index += 1) await pressKey(client, "Tab", "Tab");
    const mobileContract = await evaluate(client, `(() => {
      const dialog = document.querySelector('[role="dialog"]');
      const rect = dialog?.getBoundingClientRect();
      return {
        pageFits: document.documentElement.scrollWidth <= window.innerWidth + 2,
        dialogFits: Boolean(rect && rect.left >= -1 && rect.right <= window.innerWidth + 1 && rect.top >= -1),
        focusTrapped: Boolean(dialog?.contains(document.activeElement)),
      };
    })()`);
    if (!mobileContract?.pageFits || !mobileContract.dialogFits || !mobileContract.focusTrapped) {
      throw new Error(`Mobile freelancer UX contract failed: ${JSON.stringify(mobileContract)}`);
    }
    console.log("✓ Mobile invoice dialog stays in viewport and keeps keyboard focus trapped");

    if (client.runtimeErrors.length) throw new Error(`Browser runtime errors:\n${client.runtimeErrors.join("\n")}`);
    console.log("Freelancer browser UX smoke passed.");
  } catch (error) {
    if (browserOutput.trim()) console.error(`\nBrowser output:\n${browserOutput.trim()}`);
    throw error;
  } finally {
    client?.close();
    await terminate(browser);
    await server.close();
    await cleanupBrowserProfile(profileDir);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
