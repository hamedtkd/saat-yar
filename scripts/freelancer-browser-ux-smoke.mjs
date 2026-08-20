import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createMediaDemoData } from "./media/demo-data.ts";
import { launchBrowserDebugTarget } from "./browser-debug-startup.mjs";
import { findBrowserExecutable } from "./production-browser-smoke.mjs";
import { buildAppNavigationExpression, buildRouteReadyExpression } from "./browser-route-expression.mjs";
import { buildFreelancerPersistenceProbeExpression } from "./freelancer-persistence-expression.mjs";
import { startStaticExportServer } from "./static-export-server.mjs";
import { browserInputValuesEquivalent } from "./browser-input-fidelity.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TIMEOUT = 30_000;
const CLIENT_NAME = "مشتری مرورگر";
const PROJECT_NAME = "پروژه مرورگر";
const EXPENSE_NAME = "هزینه مرورگر";
const INVOICE_DESCRIPTION = "خدمات مرورگر";

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
    body: (document.body?.innerText || "").replace(/\\s+/g," ").slice(0,700),
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
  await new Promise((resolveWait) => setTimeout(resolveWait, 250));
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

async function waitForFreelancerFlowPersistence(client) {
  const expression = buildFreelancerPersistenceProbeExpression({
    clientName: CLIENT_NAME,
    projectName: PROJECT_NAME,
    expenseName: EXPENSE_NAME,
    invoiceDescription: INVOICE_DESCRIPTION,
  });
  const deadline = Date.now() + TIMEOUT;
  let lastProbe = null;
  while (Date.now() < deadline) {
    if (client.runtimeErrors.length) throw new Error(`Runtime error while waiting for freelancer workflow persistence: ${client.runtimeErrors.join("\n")}`);
    try {
      lastProbe = await evaluate(client, expression);
      if (lastProbe?.ready) return lastProbe;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!/execution context|Cannot find context|navigated or closed/i.test(message)) throw error;
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  }
  throw new Error(`Timed out while waiting for freelancer workflow persistence. Probe: ${JSON.stringify(lastProbe)}`);
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

async function settleUi(client) {
  await evaluate(client, `new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))`);
}

async function replaceLabeledText(client, label, value) {
  const result = await evaluate(client, `(() => {
    const wanted = ${JSON.stringify(label)};
    const nextValue = ${JSON.stringify(value)};
    const norm = (input) => (input || "").replace(/\\s+/g," ").trim();
    const labels = [...document.querySelectorAll("label")];
    const target = labels.find((item) => norm(item.childNodes[0]?.textContent || item.textContent).startsWith(wanted));
    const field = target?.querySelector("input,textarea,[role=spinbutton]");
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) {
      return { ok: false, reason: "field-not-found" };
    }
    field.focus();
    const prototype = field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
    if (!setter) return { ok: false, reason: "native-setter-missing" };
    setter.call(field, nextValue);
    field.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: nextValue }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
    return {
      ok: true,
      value: field.value,
      active: document.activeElement === field,
      tag: field.tagName,
      type: field.getAttribute("type") || "",
    };
  })()`);
  if (!result?.ok || !browserInputValuesEquivalent(String(result.value ?? ""), value)) {
    throw new Error(`Labeled field could not receive React-compatible text input: ${label}. State: ${JSON.stringify(result)}`);
  }
  await settleUi(client);
  const reflected = await evaluate(client, `(() => {
    const wanted = ${JSON.stringify(label)};
    const norm = (input) => (input || "").replace(/\\s+/g," ").trim();
    const labels = [...document.querySelectorAll("label")];
    const target = labels.find((item) => norm(item.childNodes[0]?.textContent || item.textContent).startsWith(wanted));
    const field = target?.querySelector("input,textarea,[role=spinbutton]");
    return field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement
      ? { value: field.value, active: document.activeElement === field }
      : null;
  })()`);
  if (!reflected || !browserInputValuesEquivalent(String(reflected.value ?? ""), value)) {
    throw new Error(`Controlled field did not retain the expected value for ${label}: ${value}. State: ${JSON.stringify(reflected)}`);
  }
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
      profilePrefix: "saatyar-freelancer-ux-",
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
    await navigate(client, server.origin);
    await waitFor(
      client,
      `["/onboarding", "/onboarding/"].includes(location.pathname) && Boolean(document.querySelector('[data-onboarding-step-index="1"]'))`,
      "dedicated onboarding welcome step",
    );
    await seedFreelancerData(client);

    await client.call("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    await evaluate(client, `localStorage.setItem("saatyar-locale-v1", "en")`);
    await navigate(client, `${server.origin}/clients`, "No clients yet");
    await waitFor(client, `document.documentElement.lang === "en" && document.documentElement.dir === "ltr" && document.body?.innerText.includes("Business status")`, "English freelancer client surface");
    await clickButton(client, "New client", true);
    await waitFor(client, `document.body?.innerText.includes("Basic information")`, "English client form");
    await clickButton(client, "Save client", true);
    await waitFor(client, `Boolean(document.querySelector('[role="alert"]')) && document.body?.innerText.includes("Enter a client name")`, "English client validation");
    console.log("✓ Freelancer business surface and validation follow English LTR locale");
    await evaluate(client, `localStorage.setItem("saatyar-locale-v1", "fa-IR")`);
    await navigate(client, `${server.origin}/clients`, "هنوز مشتری‌ای ثبت نشده");
    await waitFor(client, `document.documentElement.lang === "fa" && document.documentElement.dir === "rtl"`, "Persian freelancer locale restore");
    await clickButton(client, "مشتری جدید");
    await waitFor(client, `document.body?.innerText.includes("اطلاعات پایه")`, "client form");
    const clientAutofocus = await evaluate(client, `document.activeElement?.tagName === "INPUT"`);
    if (!clientAutofocus) throw new Error("Client form did not move focus to the first field.");
    await clickButton(client, "ذخیره مشتری", true);
    await waitFor(client, `Boolean(document.querySelector('[role="alert"]')) && document.body?.innerText.includes("نام مشتری")`, "client inline validation");
    await replaceLabeledText(client, "نام مشتری", CLIENT_NAME);
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
    await replaceLabeledText(client, "نام پروژه", PROJECT_NAME);
    await clickButton(client, "ذخیره و انتخاب", true);
    await waitFor(client, `!document.querySelector('[role="dialog"]')`, "quick project dialog close");
    console.log("✓ Project dialog traps focus and creates a linked project");

    await navigateInApp(client, "/freelancer/today", "تایمر ثبت ساعت کاری");
    await chooseSelect(client, "مشتری", CLIENT_NAME);
    await chooseSelect(client, "پروژه", PROJECT_NAME);
    await clickButton(client, "شروع تایمر", true);
    await waitFor(client, `document.querySelector('[data-project-timer-hero]')?.getAttribute('data-project-timer-state') === "running" && document.body?.innerText.includes("توقف موقت")`, "running Today work session");
    await new Promise((resolveWait) => setTimeout(resolveWait, 1_200));
    const beforePause = await evaluate(client, `document.querySelector('[data-project-timer-hero] [data-flip-clock]')?.getAttribute('aria-label') || ""`);
    await clickButton(client, "توقف موقت", true);
    await waitFor(client, `document.querySelector('[data-project-timer-hero]')?.getAttribute('data-project-timer-state') === "paused" && document.body?.innerText.includes("ادامه")`, "paused Today work session");
    const pausedElapsed = await evaluate(client, `document.querySelector('[data-project-timer-hero] [data-flip-clock]')?.getAttribute('aria-label') || ""`);
    await new Promise((resolveWait) => setTimeout(resolveWait, 1_200));
    const pausedAfterWait = await evaluate(client, `document.querySelector('[data-project-timer-hero] [data-flip-clock]')?.getAttribute('aria-label') || ""`);
    if (!beforePause || !pausedElapsed || pausedElapsed !== pausedAfterWait) throw new Error(`Paused timer drifted or failed to render: ${JSON.stringify({ beforePause, pausedElapsed, pausedAfterWait })}`);
    await navigate(client, `${server.origin}/freelancer/today`, "تایمر ثبت ساعت کاری");
    await waitFor(client, `document.querySelector('[data-project-timer-hero]')?.getAttribute('data-project-timer-state') === "paused"`, "paused work session after hard reload");
    const pausedAfterReload = await evaluate(client, `document.querySelector('[data-project-timer-hero] [data-flip-clock]')?.getAttribute('aria-label') || ""`);
    if (pausedAfterReload !== pausedElapsed) throw new Error(`Paused elapsed time changed after reload: ${JSON.stringify({ pausedElapsed, pausedAfterReload })}`);
    await clickButton(client, "ادامه", true);
    await waitFor(client, `document.querySelector('[data-project-timer-hero]')?.getAttribute('data-project-timer-state') === "running"`, "resumed Today work session");
    await waitFor(client, `(() => {
      const elapsed = document.querySelector('[data-project-timer-hero] [data-flip-clock]')?.getAttribute('aria-label') || "";
      return Boolean(elapsed) && elapsed !== ${JSON.stringify(pausedAfterReload)};
    })()`, "resumed Today timer advance", 5_000);
    await clickButton(client, "پایان فعالیت", true);
    await waitFor(client, `document.querySelector('[data-project-timer-hero]')?.getAttribute('data-project-timer-state') === "idle" && !localStorage.getItem("saatyar-project-timer-session-v1")`, "finished Today work session");
    console.log("✓ Today work session pauses, survives reload, resumes without drift, and finishes cleanly");

    await navigateInApp(client, "/projects", PROJECT_NAME);
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
    await replaceLabeledText(client, "عنوان", EXPENSE_NAME);
    await replaceLabeledText(client, "مبلغ (تومان)", "125000");
    await pressKey(client, "Enter", "Enter");
    await waitFor(client, `document.body?.innerText.includes(${JSON.stringify(EXPENSE_NAME)}) && !document.body?.innerText.includes("ذخیره هزینه")`, "expense keyboard save");
    console.log("✓ Expense form saves from the keyboard inside project context");

    await navigateInApp(client, "/invoices", "فاکتورها");
    await clickButton(client, "فاکتور جدید");
    await waitFor(client, `document.body?.innerText.includes("مشخصات صورتحساب")`, "invoice form");
    await chooseSelect(client, "مشتری", CLIENT_NAME);
    await chooseSelect(client, "پروژه", PROJECT_NAME);
    await replaceLabeledText(client, "شرح", INVOICE_DESCRIPTION);
    await replaceLabeledText(client, "مبلغ واحد", "2500000");
    await clickButton(client, "ذخیره فاکتور", true);
    await waitFor(client, `document.body?.innerText.includes(${JSON.stringify(CLIENT_NAME)}) && !document.body?.innerText.includes("مشخصات صورتحساب")`, "invoice save");
    console.log("✓ Invoice creation keeps the client/project relation and validates the real form");

    const persistenceProbe = await waitForFreelancerFlowPersistence(client);
    console.log(`✓ Freelancer workflow is durable in IndexedDB (${persistenceProbe.storageShape}, schema v${persistenceProbe.schemaVersion ?? "legacy"})`);

    await client.call("Emulation.setDeviceMetricsOverride", { width: 320, height: 800, deviceScaleFactor: 1, mobile: true, screenWidth: 320, screenHeight: 800 });
    await navigate(client, `${server.origin}/freelancer/today`, "تایمر ثبت ساعت کاری");
    await waitFor(client, `window.innerWidth === 320 && Boolean(document.querySelector('[data-project-session-controller]'))`, "320px freelancer Today render");
    const compactTodayContract = await evaluate(client, `(() => {
      const viewportWidth = window.innerWidth;
      const rectOf = (selector) => {
        const node = document.querySelector(selector);
        if (!(node instanceof HTMLElement)) return null;
        const rect = node.getBoundingClientRect();
        return { left: rect.left, right: rect.right, width: rect.width };
      };
      const fits = (rect) => Boolean(rect && rect.left >= -1 && rect.right <= viewportWidth + 1 && rect.width <= viewportWidth + 2);
      const controller = rectOf('[data-project-session-controller]');
      const timer = rectOf('[data-project-timer-display]');
      const details = rectOf('[data-project-activity-details]');
      const nav = rectOf('[data-mobile-bottom-nav]');
      return {
        pageFits: document.documentElement.scrollWidth <= viewportWidth + 2,
        controllerFits: fits(controller),
        timerFits: fits(timer),
        detailsFits: fits(details),
        navFits: fits(nav),
        controller, timer, details, nav, viewportWidth,
      };
    })()`);
    if (!compactTodayContract?.pageFits || !compactTodayContract.controllerFits || !compactTodayContract.timerFits || !compactTodayContract.detailsFits || !compactTodayContract.navFits) {
      throw new Error(`320px freelancer Today overflowed viewport: ${JSON.stringify(compactTodayContract)}`);
    }
    console.log("✓ Freelancer Today remains usable without horizontal overflow at 320px");

    await client.call("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true, screenWidth: 390, screenHeight: 844 });
    await navigate(client, `${server.origin}/invoices`, CLIENT_NAME);
    await waitFor(client, `Boolean(window.visualViewport) && window.visualViewport.width <= 400 && window.visualViewport.height <= 900`, "stable mobile visual viewport");
    await waitFor(client, `document.body?.innerText.includes("INV-")`, "persisted invoice after hard reload");
    console.log("✓ Hard reload restores the persisted freelancer invoice");
    await clickButton(client, "فاکتور جدید");
    await waitFor(client, `document.body?.innerText.includes("مشخصات صورتحساب")`, "mobile invoice form");
    await clickButton(client, "مشتری جدید");
    await waitFor(client, `Boolean(document.querySelector('[role="dialog"]'))`, "mobile quick client dialog");
    for (let index = 0; index < 6; index += 1) await pressKey(client, "Tab", "Tab");
    const mobileContract = await evaluate(client, `(() => {
      const dialog = document.querySelector('[role="dialog"]');
      const rect = dialog?.getBoundingClientRect();
      const visualViewport = window.visualViewport;
      const visibleLeft = visualViewport?.offsetLeft ?? 0;
      const visibleTop = visualViewport?.offsetTop ?? 0;
      const visibleWidth = visualViewport?.width ?? window.innerWidth;
      const visibleHeight = visualViewport?.height ?? window.innerHeight;
      const visibleRight = visibleLeft + visibleWidth;
      const visibleBottom = visibleTop + visibleHeight;
      return {
        pageFits: document.documentElement.scrollWidth <= window.innerWidth + 2,
        dialogFits: Boolean(
          rect &&
          rect.left >= visibleLeft - 1 &&
          rect.right <= visibleRight + 1 &&
          rect.top >= visibleTop - 1 &&
          rect.bottom <= visibleBottom + 1
        ),
        dialogRect: rect ? { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height } : null,
        viewport: { width: window.innerWidth, height: window.innerHeight },
        visualViewport: visualViewport ? { offsetLeft: visualViewport.offsetLeft, offsetTop: visualViewport.offsetTop, pageLeft: visualViewport.pageLeft, pageTop: visualViewport.pageTop, width: visualViewport.width, height: visualViewport.height, scale: visualViewport.scale } : null,
        scroll: { x: window.scrollX, y: window.scrollY, rootLeft: document.documentElement.getBoundingClientRect().left, rootWidth: document.documentElement.getBoundingClientRect().width },
        dialogStyle: dialog instanceof HTMLElement ? { left: dialog.style.left, top: dialog.style.top, width: dialog.style.width, transform: dialog.style.transform, direction: getComputedStyle(dialog).direction } : null,
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
