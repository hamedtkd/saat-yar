import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join, resolve, win32 } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { cleanupBrowserProfile } from "./browser-profile-cleanup.mjs";
import { startStaticExportServer } from "./static-export-server.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const WAIT_TIMEOUT_MS = 30_000;

/** @param {unknown} value @returns {value is string} */
function isNonEmptyString(value) {
  return typeof value === "string" && value.length > 0;
}

/**
 * @param {Record<string, string | undefined>} [env]
 * @param {NodeJS.Platform} [platform]
 * @returns {string[]}
 */
export function browserExecutableCandidates(env = process.env, platform = process.platform) {
  const overrides = [env.SAATYAR_BROWSER_PATH, env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, env.CHROME_PATH]
    .filter(isNonEmptyString);
  if (platform === "win32") {
    const programFiles = [env.PROGRAMFILES, env["PROGRAMFILES(X86)"], env.LOCALAPPDATA]
      .filter(isNonEmptyString);
    return [...overrides, ...programFiles.flatMap((base) => [
      win32.join(base, "Google", "Chrome", "Application", "chrome.exe"),
      win32.join(base, "Microsoft", "Edge", "Application", "msedge.exe"),
    ])];
  }
  if (platform === "darwin") {
    return [...overrides,
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
    ];
  }
  return [...overrides,
    "/usr/bin/google-chrome-stable",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/microsoft-edge",
  ];
}

export function findBrowserExecutable(env = process.env, platform = process.platform) {
  return browserExecutableCandidates(env, platform).find((candidate) => existsSync(candidate)) ?? null;
}

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

async function waitForHttp(url, timeout = WAIT_TIMEOUT_MS) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { redirect: "manual" });
      if (response.status < 500) return;
    } catch {}
    await new Promise((resolveWait) => setTimeout(resolveWait, 150));
  }
  throw new Error(`Production server did not become ready: ${url}`);
}

async function waitForJson(url, options = {}, timeout = WAIT_TIMEOUT_MS) {
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
      this.socket.onerror = () => reject(new Error("Could not connect to the browser debugging socket."));
    });
    this.socket.onmessage = (message) => {
      const payload = JSON.parse(String(message.data));
      if (payload.id) {
        const entry = this.pending.get(payload.id);
        if (!entry) return;
        this.pending.delete(payload.id);
        if (payload.error) entry.reject(new Error(payload.error.message));
        else entry.resolve(payload.result);
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

  close() {
    this.socket.close();
  }
}

async function evaluate(client, expression) {
  const response = await client.call("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.text || "Browser evaluation failed.");
  return response.result?.value;
}

async function assertMobileShellFits(client, label) {
  const contract = await evaluate(client, `(() => {
    const viewportWidth = document.documentElement.clientWidth;
    const header = document.querySelector('header.shell-main-offset');
    const nav = document.querySelector('[data-mobile-bottom-nav]');
    const main = document.querySelector('#main-content');
    const rect = (element) => {
      const value = element?.getBoundingClientRect();
      return value ? { left: value.left, right: value.right, width: value.width } : null;
    };
    const fits = (value) => !value || (value.left >= -1 && value.right <= viewportWidth + 1 && value.width <= viewportWidth + 2);
    const headerRect = rect(header);
    const navRect = rect(nav);
    const mainRect = rect(main);
    return {
      viewportWidth,
      scrollWidth: document.documentElement.scrollWidth,
      pageFits: document.documentElement.scrollWidth <= viewportWidth + 2,
      headerFits: fits(headerRect),
      navFits: fits(navRect),
      mainFits: fits(mainRect),
      headerRect,
      navRect,
      mainRect,
    };
  })()`);
  if (!contract?.pageFits || !contract.headerFits || !contract.navFits || !contract.mainFits) {
    throw new Error(`${label} responsive shell contract failed: ${JSON.stringify(contract)}`);
  }
}

async function browserStateSnapshot(client) {
  try {
    return await evaluate(client, `(async () => {
      const registration = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration().catch(() => undefined) : undefined;
      return {
        url: location.href,
        readyState: document.readyState,
        body: (document.body?.innerText || "").replace(/\\s+/g, " ").trim().slice(0, 500),
        title: document.title,
        onboardingStep: document.querySelector("[data-onboarding-step]")?.getAttribute("data-onboarding-step-index") || null,
        loading: document.body?.innerText.includes("\u062f\u0631 \u062d\u0627\u0644 \u0622\u0645\u0627\u062f\u0647") || false,
        serviceWorker: registration ? {
          scope: registration.scope,
          active: registration.active?.state || null,
          waiting: registration.waiting?.state || null,
          installing: registration.installing?.state || null,
          controlled: Boolean(navigator.serviceWorker.controller),
        } : null,
      };
    })()`);
  } catch {
    return null;
  }
}

async function waitFor(client, expression, label, timeout = WAIT_TIMEOUT_MS) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try {
      const predicate = `(async () => Boolean(await (${expression})))()`;
      if (await evaluate(client, predicate)) return;
      if (client.runtimeErrors.length > 0) {
        const snapshot = await browserStateSnapshot(client);
        throw new Error(`Browser runtime error while waiting for ${label}: ${client.runtimeErrors.join("\n")}${snapshot ? ` Browser state: ${JSON.stringify(snapshot)}` : ""}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!/execution context|Cannot find context|Inspected target navigated or closed/i.test(message)) throw error;
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  }
  const snapshot = await browserStateSnapshot(client);
  throw new Error(`Timed out while waiting for ${label}.${snapshot ? ` Browser state: ${JSON.stringify(snapshot)}` : ""}`);
}

async function waitForEvent(client, method, label, timeout = WAIT_TIMEOUT_MS) {
  return new Promise((resolveEvent, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error(`Timed out while waiting for ${label}.`));
    }, timeout);
    client.on(method, (params) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolveEvent(params);
    });
  });
}


async function clickRouteLink(client, expectedPath) {
  const clicked = await evaluate(client, `(() => {
    const expectedPath = ${JSON.stringify(expectedPath)};
    const link = Array.from(document.querySelectorAll('a[href]')).find((candidate) => {
      if (!(candidate instanceof HTMLAnchorElement)) return false;
      const pathname = new URL(candidate.href, location.href).pathname;
      const normalizedPathname = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
      return normalizedPathname === expectedPath;
    });
    if (!(link instanceof HTMLAnchorElement)) return false;
    link.click();
    return true;
  })()`);
  if (!clicked) throw new Error(`In-app route link unavailable: ${expectedPath}`);
}

async function clickButton(client, text) {
  const clicked = await evaluate(client, `(() => {
    const expected = ${JSON.stringify(text)};
    const button = [...document.querySelectorAll("button")].find((item) =>
      !item.disabled && (item.textContent || "").replace(/\\s+/g, " ").trim().includes(expected)
    );
    if (!button) return false;
    button.click();
    return true;
  })()`);
  if (!clicked) throw new Error(`Button not found: ${text}`);
}

async function switchWorkspaceMode(client, mode) {
  const opened = await evaluate(client, `(() => {
    const trigger = document.querySelector('[data-workspace-switch-trigger]');
    if (!(trigger instanceof HTMLButtonElement)) return false;
    trigger.click();
    return true;
  })()`);
  if (!opened) throw new Error(`Workspace switch trigger not found for mode: ${mode}`);
  await waitFor(client, `Boolean(document.querySelector('[data-workspace-mode-option="${mode}"]'))`, `workspace option ${mode}`);
  const selected = await evaluate(client, `(() => {
    const marker = document.querySelector('[data-workspace-mode-option="${mode}"]');
    const option = marker?.closest('[role="option"]') || marker?.parentElement;
    if (!(option instanceof HTMLElement)) return false;
    option.click();
    return true;
  })()`);
  if (!selected) throw new Error(`Workspace option could not be selected: ${mode}`);
  await waitFor(client, `document.querySelector('[data-workspace-switch-trigger]')?.getAttribute('data-workspace-mode') === "${mode}"`, `workspace mode ${mode}`);
  // A full static-export navigation boots RouteGuard from persisted AppData.
  // Wait for IndexedDB durability before navigating away from the page that
  // performed the workspace change, otherwise a fast reload can see the old mode.
  await waitFor(client, `(async () => {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open("saatyar-db", 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const stored = await new Promise((resolve, reject) => {
      const tx = db.transaction("app-data", "readonly");
      const request = tx.objectStore("app-data").get("current");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      tx.oncomplete = () => db.close();
    });
    const appData = stored?.format === "saatyar-app-data" && stored?.data ? stored.data : stored;
    return appData?.settings?.mode === "${mode}";
  })()`, `workspace mode ${mode} persistence`);
}

async function replaceInputValue(client, selector, value) {
  const updated = await evaluate(client, `(() => {
    const field = document.querySelector(${JSON.stringify(selector)});
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return false;
    const prototype = field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
    if (!setter) return false;
    field.focus();
    setter.call(field, ${JSON.stringify(value)});
    field.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: ${JSON.stringify(value)} }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  })()`);
  if (!updated) throw new Error(`Input could not receive React-compatible text: ${selector}`);

  // NumberField localizes its visible draft and may synchronously rerender after
  // React receives the input event. Treat aria-valuenow as the semantic source
  // of truth for spinbuttons instead of requiring the DOM value to remain the
  // exact ASCII string that the harness inserted.
  await waitFor(client, `(() => {
    const field = document.querySelector(${JSON.stringify(selector)});
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return false;
    if (field.getAttribute("role") === "spinbutton") {
      const semanticValue = Number(field.getAttribute("aria-valuenow"));
      const expectedValue = Number(${JSON.stringify(value)});
      return Number.isFinite(expectedValue) && semanticValue === expectedValue;
    }
    return field.value === ${JSON.stringify(value)};
  })()`, `React-compatible input value for ${selector}`);
  await evaluate(client, `new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))`);
}


async function uploadTextFile(client, selector, name, type, content) {
  const uploaded = await evaluate(client, `(() => {
    const input = document.querySelector(${JSON.stringify(selector)});
    if (!(input instanceof HTMLInputElement) || input.type !== "file") return false;
    const transfer = new DataTransfer();
    transfer.items.add(new File([${JSON.stringify(content)}], ${JSON.stringify(name)}, { type: ${JSON.stringify(type)} }));
    input.files = transfer.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  })()`);
  if (!uploaded) throw new Error(`File input not found: ${selector}`);
}

async function readStoredSettings(client) {
  return evaluate(client, `(async () => {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open("saatyar-db", 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const stored = await new Promise((resolve, reject) => {
      const tx = db.transaction("app-data", "readonly");
      const request = tx.objectStore("app-data").get("current");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      tx.oncomplete = () => db.close();
    });
    const data = stored?.format === "saatyar-app-data" && stored?.data ? stored.data : stored;
    const settings = data?.settings;
    return settings ? {
      name: settings.name,
      workDays: settings.workDays,
      weeklyMinutes: settings.weeklyMinutes,
      workTimingMode: settings.workTimingMode,
      defaultStart: settings.defaultStart,
      defaultEnd: settings.defaultEnd,
      thursdayEnabled: Boolean(settings.weeklySchedule?.thursday?.enabled),
      salary: settings.salary,
      payrollBaseAmount: settings.payrollPolicy?.baseAmount,
      appearancePreset: settings.appearance?.preset,
      appearanceAccent: settings.appearance?.accent,
      onboarded: settings.onboarded,
    } : null;
  })()`);
}

async function waitForProcessExit(child, timeoutMs = 5_000) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  await Promise.race([
    new Promise((resolveExit) => child.once("exit", resolveExit)),
    new Promise((resolveTimeout) => setTimeout(resolveTimeout, timeoutMs)),
  ]);
}

async function terminate(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  if (process.platform === "win32") {
    await new Promise((resolveKill) => {
      const killer = spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
      killer.on("exit", resolveKill);
      killer.on("error", resolveKill);
    });
  } else {
    child.kill("SIGTERM");
  }
  await waitForProcessExit(child);
}

export async function runProductionBrowserSmoke() {
  const outputDirectory = resolve(ROOT, "out");
  if (!existsSync(resolve(outputDirectory, "index.html"))) {
    throw new Error("Static production export is missing. Run npm run build:vercel first.");
  }

  const browserExecutable = findBrowserExecutable();
  if (!browserExecutable) {
    throw new Error("Chrome, Edge or Chromium was not found. Set SAATYAR_BROWSER_PATH to the browser executable.");
  }

  const debugPort = await freePort();
  const profileDir = await mkdtemp(join(tmpdir(), "saatyar-browser-smoke-"));
  let staticServer;
  let browser;
  let client;
  let browserOutput = "";

  try {
    staticServer = await startStaticExportServer({ outputDirectory });
    const { origin } = staticServer;
    await waitForHttp(origin);
    console.log("✓ Static production export is reachable");

    const browserArgs = [
      "--headless=new",
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${profileDir}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-dev-shm-usage",
      "about:blank",
    ];
    if (typeof process.getuid === "function" && process.getuid() === 0) browserArgs.push("--no-sandbox");
    browser = spawn(browserExecutable, browserArgs, { stdio: ["ignore", "ignore", "pipe"] });
    browser.stderr.on("data", (chunk) => { browserOutput += chunk; });

    await waitForJson(`http://127.0.0.1:${debugPort}/json/version`);
    const target = await waitForJson(
      `http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent("about:blank")}`,
      { method: "PUT" },
    );
    client = new CdpClient(target.webSocketDebuggerUrl);
    client.on("Runtime.exceptionThrown", ({ exceptionDetails }) => {
      const description = exceptionDetails?.exception?.description || exceptionDetails?.text || "Runtime exception";
      client.runtimeErrors.push(description);
    });
    await client.call("Page.enable");
    await client.call("Runtime.enable");
    await client.call("Log.enable");

    // Keep the first application boot deterministic. Creating the CDP target on
    // about:blank lets us clear every origin-scoped store before React, IndexedDB
    // or the service worker can observe stale state from a previous browser run.
    await client.call("Storage.clearDataForOrigin", { origin, storageTypes: "all" });
    const initialLoad = waitForEvent(client, "Page.loadEventFired", "initial production load");
    await client.call("Page.navigate", { url: origin });
    await initialLoad;
    await waitFor(client, "document.readyState === 'complete'", "initial document load");
    await waitFor(
      client,
      '["/onboarding", "/onboarding/"].includes(location.pathname) && document.querySelector(\'[data-onboarding-step-index="1"] input\')',
      "dedicated onboarding route",
    );
    console.log("\u2713 Initial production load redirected to dedicated onboarding route");

    await replaceInputValue(client, '[data-onboarding-step-index="1"] input', "کاربر تست");
    await clickButton(client, "ادامه");
    await waitFor(
      client,
      'Boolean(document.querySelector(\'[data-onboarding-step-index="2"]\')) && document.querySelectorAll(\'[data-onboarding-step-index="2"] button[aria-pressed]\').length >= 3',
      "onboarding mode step",
    );
    console.log("✓ Onboarding welcome step captured a user name");
    await waitFor(client, `Boolean(document.querySelector('[data-onboarding-fast-setup]')) && Boolean(document.querySelector('[data-onboarding-skip]'))`, "onboarding fast setup and skip actions");
    console.log("✓ Onboarding exposes Fast Setup and Skip without removing the advanced flow");
    await clickButton(client, "فریلنسر");
    await waitFor(client, `document.querySelector('[data-onboarding-progress-mode="freelancer"]') && document.querySelector('[data-onboarding-step-index="2"][data-onboarding-mode="freelancer"]')`, "freelancer personalized onboarding progress");
    await clickButton(client, "ترکیبی");
    await waitFor(client, `document.querySelector('[data-onboarding-progress-mode="hybrid"]') && document.querySelector('[data-onboarding-step-index="2"][data-onboarding-mode="hybrid"]')`, "hybrid personalized onboarding progress");
    await clickButton(client, "کارمند");
    await waitFor(client, `document.querySelector('[data-onboarding-progress-mode="employee"]') && document.querySelector('[data-onboarding-step-index="2"][data-onboarding-mode="employee"]')`, "employee personalized onboarding progress");
    console.log("✓ Onboarding progress adapts immediately to Employee/Freelancer/Hybrid selection");
    await clickButton(client, "ادامه");
    await waitFor(client, `Boolean(document.querySelector('[data-onboarding-step-index="3"] [data-work-schedule-editor]')) && Boolean(document.querySelector('[data-onboarding-work-timing]'))`, "onboarding schedule step");
    const timingOpened = await evaluate(client, `(() => {
      const trigger = document.querySelector('[data-onboarding-work-timing]');
      if (!(trigger instanceof HTMLButtonElement)) return false;
      trigger.click();
      return true;
    })()`);
    if (!timingOpened) throw new Error("Onboarding work-timing selector could not be opened.");
    await waitFor(client, `Boolean(document.querySelector('[data-work-timing-option="flexible"]'))`, "flexible work-timing option");
    const timingSelected = await evaluate(client, `(() => {
      const marker = document.querySelector('[data-work-timing-option="flexible"]');
      const option = marker?.closest('[role="option"]') || marker;
      if (!(option instanceof HTMLElement)) return false;
      option.click();
      return true;
    })()`);
    if (!timingSelected) throw new Error("Flexible work timing could not be selected in onboarding.");
    await waitFor(client, `document.querySelector('[data-onboarding-step-index="3"] [data-work-schedule-editor]')?.getAttribute('data-work-timing') === "flexible"`, "flexible onboarding schedule editor");

    const thursdayEnabled = await evaluate(client, `(() => {
      const input = document.querySelector('[data-onboarding-step-index="3"] [data-workday-toggle="thursday"]');
      if (!(input instanceof HTMLInputElement)) return false;
      if (!input.checked) input.click();
      return input.checked;
    })()`);
    if (!thursdayEnabled) throw new Error("Onboarding could not enable Thursday in the weekly schedule.");
    await replaceInputValue(client, '[data-onboarding-step-index="3"] [data-work-schedule-weekly-target]', "44");
    await evaluate(client, `new Promise((resolve) => setTimeout(resolve, 500))`);

    const onboardingReload = waitForEvent(client, "Page.loadEventFired", "onboarding recovery reload");
    await client.call("Page.reload", { ignoreCache: false });
    await onboardingReload;
    await waitFor(client, `Boolean(document.querySelector('[data-onboarding-step-index="3"] [data-work-schedule-editor]'))`, "recovered onboarding schedule step");
    const recoveredSchedule = await evaluate(client, `(() => ({
      weeklyTarget: document.querySelector('[data-onboarding-step-index="3"] [data-work-schedule-weekly-target]')?.getAttribute('aria-valuenow') || "",
      thursdayEnabled: document.querySelector('[data-onboarding-step-index="3"] [data-workday-toggle="thursday"]')?.checked === true,
      workTiming: document.querySelector('[data-onboarding-step-index="3"] [data-work-schedule-editor]')?.getAttribute('data-work-timing') || "",
    }))()`);
    if (recoveredSchedule?.weeklyTarget !== "44" || !recoveredSchedule?.thursdayEnabled || recoveredSchedule?.workTiming !== "flexible") {
      throw new Error(`Onboarding schedule did not survive reload: ${JSON.stringify(recoveredSchedule)}`);
    }
    console.log("✓ Onboarding work schedule persisted across reload");
    console.log("✓ Onboarding reload resumed from the saved step");

    await clickButton(client, "ادامه");
    await waitFor(client, `Boolean(document.querySelector('[data-onboarding-step-index="4"] [data-onboarding-salary]'))`, "onboarding payroll step");
    await replaceInputValue(client, '[data-onboarding-step-index="4"] [data-onboarding-salary]', "42000000");
    await clickButton(client, "ادامه");

    await waitFor(client, `Boolean(document.querySelector('[data-onboarding-step-index="5"] [data-onboarding-theme="ocean"]'))`, "onboarding appearance step");
    const selectedTheme = await evaluate(client, `(() => {
      const button = document.querySelector('[data-onboarding-step-index="5"] [data-onboarding-theme="ocean"]');
      if (!(button instanceof HTMLButtonElement)) return false;
      button.click();
      return true;
    })()`);
    if (!selectedTheme) throw new Error("Onboarding theme preset could not be selected.");
    await waitFor(client, `getComputedStyle(document.documentElement).getPropertyValue('--accent').trim().toLowerCase() === '#0ea5e9'`, "onboarding theme preview");
    await clickButton(client, "ادامه");

    await waitFor(client, `Boolean(document.querySelector('[data-onboarding-step-index="6"]'))`, "onboarding privacy step");
    await waitFor(client, `Boolean(document.querySelector('[data-product-analytics-consent]')) && Boolean(document.querySelector('[data-analytics-opt-out]'))`, "onboarding privacy-safe analytics consent");
    console.log("✓ Onboarding privacy step exposes explicit analytics opt-out before any provider is required");
    await clickButton(client, "ادامه");
    await waitFor(client, `Boolean(document.querySelector('[data-onboarding-step-index="7"] [data-onboarding-import]')) && Boolean(document.querySelector('[data-onboarding-step-index="7"] [data-import-source="csv"]'))`, "personalized onboarding import step");
    await evaluate(client, `document.querySelector('[data-onboarding-step-index="7"] [data-import-source="csv"]')?.click()`);
    await waitFor(client, `Boolean(document.querySelector('[data-onboarding-step-index="7"] input[type="file"][accept*=".csv"]'))`, "onboarding CSV file input");
    await uploadTextFile(client, '[data-onboarding-step-index="7"] input[type="file"][accept*=".csv"]', "onboarding-clients.csv", "text/csv", "name,email\nمشتری آنبوردینگ,onboarding@example.com\n");
    await waitFor(client, `Boolean(document.querySelector('[data-onboarding-step-index="7"] [data-import-preview]')) && !document.querySelector('[data-onboarding-step-index="7"] [data-import-apply]')?.disabled`, "onboarding Import preview");
    await evaluate(client, `document.querySelector('[data-onboarding-step-index="7"] [data-import-apply]')?.click()`);
    await waitFor(client, `(async () => {
      const db = await new Promise((resolve, reject) => { const request = indexedDB.open("saatyar-db", 1); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
      const stored = await new Promise((resolve, reject) => { const tx = db.transaction("app-data", "readonly"); const request = tx.objectStore("app-data").get("current"); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); tx.oncomplete = () => db.close(); });
      const appData = stored?.format === "saatyar-app-data" && stored?.data ? stored.data : stored;
      return appData?.settings?.onboarded === false && appData?.clients?.some((item) => item.name === "مشتری آنبوردینگ") === true;
    })()`, "onboarding Import persistence without premature completion");
    console.log("✓ Personalized onboarding keeps employee setup relevant and imports existing data before completion");
    await clickButton(client, "شروع ساعت‌یار");
    await waitFor(client, "['/today', '/today/'].includes(location.pathname) && !document.body?.innerText.includes('شروع ساعت‌یار')", "today route after onboarding");
    await new Promise((resolveWait) => setTimeout(resolveWait, 700));

    const onboardingSettings = await readStoredSettings(client);
    const onboardingContract = onboardingSettings
      && onboardingSettings.name === "کاربر تست"
      && onboardingSettings.workDays === 6
      && onboardingSettings.weeklyMinutes === 44 * 60
      && onboardingSettings.workTimingMode === "flexible"
      && onboardingSettings.thursdayEnabled
      && onboardingSettings.salary === 42_000_000
      && onboardingSettings.payrollBaseAmount === 42_000_000
      && onboardingSettings.appearancePreset === "ocean"
      && onboardingSettings.appearanceAccent?.toLowerCase() === "#0ea5e9"
      && onboardingSettings.onboarded === true;
    if (!onboardingContract) throw new Error(`Persisted onboarding settings contract failed: ${JSON.stringify(onboardingSettings)}`);
    console.log("✓ Onboarding completed with flexible schedule, payroll and appearance persisted to AppData");
    await waitFor(client, `Boolean(document.querySelector('[data-first-run-guide]')) && Boolean(document.querySelector('[data-first-run-primary]'))`, "first-run action guide after onboarding");
    console.log("✓ First-run guide exposes the next action immediately after onboarding");
    await waitFor(client, `Boolean(document.querySelector('[data-activity-segments]')) && Boolean(document.querySelector('[data-activity-kind]'))`, "Today activity-segment card");
    console.log("✓ Today exposes activity-segment tracking without requiring a separate route");
    await evaluate(client, `document.querySelector('[data-first-run-dismiss]')?.click()`);

    await waitFor(client, `Boolean(document.querySelector('[data-route-motion][data-route-motion-path="/today"]'))`, "Today route motion boundary");
    await client.call("Emulation.setEmulatedMedia", { media: "", features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
    const reducedMotionReload = waitForEvent(client, "Page.loadEventFired", "reduced-motion route reload");
    await client.call("Page.reload", { ignoreCache: false });
    await reducedMotionReload;
    await waitFor(client, `matchMedia('(prefers-reduced-motion: reduce)').matches && document.querySelector('[data-route-motion][data-route-motion-path="/today"]')?.getAttribute('data-route-motion-reduced') === 'true'`, "reduced-motion route contract");
    await client.call("Emulation.setEmulatedMedia", { media: "", features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
    const restoredMotionReload = waitForEvent(client, "Page.loadEventFired", "restored route motion reload");
    await client.call("Page.reload", { ignoreCache: false });
    await restoredMotionReload;
    await waitFor(client, `!matchMedia('(prefers-reduced-motion: reduce)').matches && document.querySelector('[data-route-motion][data-route-motion-path="/today"]')?.getAttribute('data-route-motion-reduced') === 'false'`, "restored route motion preference");
    const openedMonthThroughAppNav = await evaluate(client, `(() => { const link = Array.from(document.querySelectorAll('a[href]')).find((candidate) => { if (!(candidate instanceof HTMLAnchorElement)) return false; const pathname = new URL(candidate.href, location.href).pathname; const normalizedPathname = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname; return normalizedPathname === '/month'; }); if (!(link instanceof HTMLAnchorElement)) return false; link.click(); return true; })()`);
    if (!openedMonthThroughAppNav) throw new Error("In-app Month navigation link was unavailable for route motion smoke.");
    await waitFor(client, `['/month', '/month/'].includes(location.pathname) && document.querySelector('[data-route-motion]')?.getAttribute('data-route-motion-path') === '/month'`, "state-driven Month route motion");
    const returnedTodayThroughAppNav = await evaluate(client, `(() => { const link = Array.from(document.querySelectorAll('a[href]')).find((candidate) => { if (!(candidate instanceof HTMLAnchorElement)) return false; const pathname = new URL(candidate.href, location.href).pathname; const normalizedPathname = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname; return normalizedPathname === '/today'; }); if (!(link instanceof HTMLAnchorElement)) return false; link.click(); return true; })()`);
    if (!returnedTodayThroughAppNav) throw new Error("In-app Today navigation link was unavailable for route motion smoke.");
    await waitFor(client, `['/today', '/today/'].includes(location.pathname) && document.querySelector('[data-route-motion]')?.getAttribute('data-route-motion-path') === '/today'`, "state-driven Today route motion");
    console.log("✓ Route motion is state-driven, reduced-motion aware, and keeps navigation responsive");

    const themeRevealContract = await evaluate(client, `(async () => {
      const root = document.documentElement;
      const originalMode = root.dataset.themeMode;
      const supported = typeof document.startViewTransition === 'function';
      let visualChanged = false;
      let revealObserved = false;
      for (let attempt = 0; attempt < 2 && !visualChanged; attempt += 1) {
        const button = document.querySelector('[data-theme-toggle]');
        if (!(button instanceof HTMLButtonElement)) return { missing: true };
        const beforeTheme = root.dataset.theme;
        button.click();
        revealObserved ||= root.dataset.themeTransition === 'active';
        await new Promise((resolveWait) => setTimeout(resolveWait, 50));
        visualChanged = root.dataset.theme !== beforeTheme;
        await new Promise((resolveWait) => setTimeout(resolveWait, 300));
      }
      for (let attempt = 0; attempt < 3 && root.dataset.themeMode !== originalMode; attempt += 1) {
        const button = document.querySelector('[data-theme-toggle]');
        if (!(button instanceof HTMLButtonElement)) break;
        button.click();
        await new Promise((resolveWait) => setTimeout(resolveWait, 340));
      }
      return { missing: false, supported, visualChanged, revealObserved, restored: root.dataset.themeMode === originalMode };
    })()`);
    if (themeRevealContract?.missing || !themeRevealContract?.visualChanged || !themeRevealContract?.restored || (themeRevealContract.supported && !themeRevealContract.revealObserved)) {
      throw new Error(`Theme reveal contract failed: ${JSON.stringify(themeRevealContract)}`);
    }
    console.log("✓ Theme changes reveal from the header control and restore the original mode");

    await client.call("Emulation.setDeviceMetricsOverride", { width: 425, height: 608, deviceScaleFactor: 1, mobile: true, screenWidth: 425, screenHeight: 608 });
    for (const [route, label] of [["month", "Month"], ["leave", "Leave"], ["settings", "Settings"]]) {
      const mobileLoad = waitForEvent(client, "Page.loadEventFired", `${label} mobile responsive route`);
      await client.call("Page.navigate", { url: `${origin}/${route}/` });
      await mobileLoad;
      await waitFor(client, `["/${route}", "/${route}/"].includes(location.pathname) && Boolean(document.querySelector('#main-content'))`, `${label} mobile responsive render`);
      if (route === "month") {
        await waitFor(client, `document.documentElement.dataset.calendar === "persian" && Boolean(document.querySelector('[data-month-activity-heatmap]')) && Boolean(document.querySelector('[data-month-recent-activity]')) && Boolean(document.querySelector('[data-month-intelligence]'))`, "Persian month activity intelligence on mobile");
      }
      await assertMobileShellFits(client, `${label} 425px`);
    }
    console.log("✓ Month activity intelligence follows Persian calendar and Month, Leave, and Settings fit a 425px viewport");

    await waitFor(client, `Boolean(document.querySelector('[data-settings-mobile-trigger]'))`, "Settings compact mobile navigation trigger");
    const compactSettingsNav = await evaluate(client, `(() => {
      const nav = document.querySelector('[data-settings-mobile-nav]');
      const trigger = document.querySelector('[data-settings-mobile-trigger]');
      const navRect = nav?.getBoundingClientRect();
      const triggerRect = trigger?.getBoundingClientRect();
      if (!navRect || !triggerRect) return null;
      return { navHeight: navRect.height, triggerHeight: triggerRect.height, width: triggerRect.width, viewport: document.documentElement.clientWidth };
    })()`);
    if (!compactSettingsNav || compactSettingsNav.navHeight > 64 || compactSettingsNav.triggerHeight > 56 || compactSettingsNav.width > compactSettingsNav.viewport) {
      throw new Error(`Settings compact mobile navigation contract failed: ${JSON.stringify(compactSettingsNav)}`);
    }
    await evaluate(client, `document.querySelector('[data-settings-mobile-trigger]')?.click()`);
    await waitFor(client, `Boolean(document.querySelector('[data-settings-mobile-dialog]'))`, "Settings compact mobile navigation dialog");
    const mobileSettingsDialog = await evaluate(client, `(() => {
      const dialog = document.querySelector('[data-settings-mobile-dialog]');
      const rect = dialog?.getBoundingClientRect();
      if (!rect) return null;
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, viewportWidth: document.documentElement.clientWidth, viewportHeight: window.innerHeight };
    })()`);
    if (!mobileSettingsDialog || mobileSettingsDialog.left < 0 || mobileSettingsDialog.right > mobileSettingsDialog.viewportWidth + 1 || mobileSettingsDialog.top < 0 || mobileSettingsDialog.bottom > mobileSettingsDialog.viewportHeight + 1) {
      throw new Error(`Settings mobile navigation dialog overflowed viewport: ${JSON.stringify(mobileSettingsDialog)}`);
    }
    await client.call("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape" });
    await client.call("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape" });
    await waitFor(client, `!document.querySelector('[data-settings-mobile-dialog]')`, "Settings compact mobile navigation dialog close");
    console.log("✓ Settings compact mobile navigation replaces the oversized mobile section box");

    await client.call("Emulation.setDeviceMetricsOverride", { width: 2560, height: 1440, deviceScaleFactor: 1, mobile: false, screenWidth: 2560, screenHeight: 1440 });
    await evaluate(client, `new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))`);
    const wideShell = await evaluate(client, `(() => {
      const header = document.querySelector('header.shell-main-offset');
      const rect = header?.getBoundingClientRect();
      const offset = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--shell-content-offset')) || 264;
      if (!rect) return null;
      const viewportWidth = document.documentElement.clientWidth;
      const scrollbarWidth = Math.max(0, window.innerWidth - viewportWidth);
      const leftGap = rect.left;
      const rightGap = viewportWidth - rect.right;
      return { width: rect.width, leftGap, rightGap, offset, viewportWidth, scrollbarWidth, balancedDelta: Math.abs(leftGap - (rightGap - offset)) };
    })()`);
    if (!wideShell || wideShell.width < 1800 || wideShell.leftGap < 80 || wideShell.rightGap < wideShell.offset || wideShell.balancedDelta > 24) {
      throw new Error(`Wide desktop shell contract failed: ${JSON.stringify(wideShell)}`);
    }
    console.log("✓ Wide desktop shell expands and stays centered beside the sidebar");
    await client.call("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false, screenWidth: 1440, screenHeight: 1000 });

    const importLoad = waitForEvent(client, "Page.loadEventFired", "Import Wizard route");
    await client.call("Page.navigate", { url: `${origin}/import/` });
    await importLoad;
    await waitFor(client, `["/import", "/import/"].includes(location.pathname) && Boolean(document.querySelector('[data-import-source="csv"]'))`, "Import Wizard route render");
    await evaluate(client, `document.querySelector('[data-import-source="csv"]')?.click()`);
    await waitFor(client, `Boolean(document.querySelector('input[type="file"][accept*=".csv"]'))`, "CSV import file input");
    await uploadTextFile(client, 'input[type="file"][accept*=".csv"]', "clients.csv", "text/csv", "name,email\nمشتری Import Smoke,import-smoke@example.com\n");
    await waitFor(client, `Boolean(document.querySelector('[data-import-preview]')) && !document.querySelector('[data-import-apply]')?.disabled`, "CSV Import preview");
    await evaluate(client, `document.querySelector('[data-import-apply]')?.click()`);
    await waitFor(client, `(async () => {
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open("saatyar-db", 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      const stored = await new Promise((resolve, reject) => {
        const tx = db.transaction("app-data", "readonly");
        const request = tx.objectStore("app-data").get("current");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        tx.oncomplete = () => db.close();
      });
      const appData = stored?.format === "saatyar-app-data" && stored?.data ? stored.data : stored;
      return appData?.clients?.some((client) => client.name === "مشتری Import Smoke") === true;
    })()`, "CSV Import client persistence");
    console.log("✓ Import Wizard CSV persisted a client after preview and explicit apply");

    const returnToday = waitForEvent(client, "Page.loadEventFired", "return to Today after Import Wizard");
    await client.call("Page.navigate", { url: `${origin}/today/` });
    await returnToday;
    await waitFor(client, `["/today", "/today/"].includes(location.pathname) && document.body?.innerText.includes("ساعت‌یار")`, "Today after Import Wizard");

    const settingsLocaleLoad = waitForEvent(client, "Page.loadEventFired", "Settings locale route");
    await client.call("Page.navigate", { url: `${origin}/settings/` });
    await settingsLocaleLoad;
    await waitFor(client, `Boolean(document.querySelector('[data-settings-language]')) && Boolean(document.querySelector('[data-work-timing-mode]'))`, "language and work-timing settings cards");
    await evaluate(client, `document.querySelector('[data-locale-choice="en"]')?.click()`);
    await waitFor(client, `document.documentElement.lang === "en" && document.documentElement.dir === "ltr" && document.documentElement.dataset.calendar === "gregory" && localStorage.getItem("saatyar-locale-v1") === "en" && document.body?.innerText.includes("Settings & data") && document.body?.innerText.includes("Today")`, "English LTR locale switch with automatic Gregorian calendar");
    await waitFor(client, `Boolean(document.querySelector('[data-calendar-choice="persian"]'))`, "calendar preference controls");
    await evaluate(client, `document.querySelector('[data-calendar-choice="persian"]')?.click()`);
    await waitFor(client, `document.documentElement.dataset.calendar === "persian" && localStorage.getItem("saatyar-calendar-v1") === "persian"`, "English interface with Persian calendar override");
    await evaluate(client, `document.querySelector('[data-calendar-choice="auto"]')?.click()`);
    await waitFor(client, `document.documentElement.dataset.calendar === "gregory" && localStorage.getItem("saatyar-calendar-v1") === "auto"`, "automatic calendar restored for English");
    console.log("✓ Calendar follows language by default and permits English + Persian-calendar override");
    const ltrGeometry = await evaluate(client, `(() => {
      const sidebar = document.querySelector('aside.fixed');
      const header = document.querySelector('header.shell-main-offset');
      if (!sidebar || !header) return null;
      const side = sidebar.getBoundingClientRect();
      const head = header.getBoundingClientRect();
      return { sidebarLeft: side.left, headerLeft: head.left, dir: document.documentElement.dir };
    })()`);
    if (!ltrGeometry || ltrGeometry.dir !== "ltr" || ltrGeometry.sidebarLeft > 24 || ltrGeometry.headerLeft < 240) {
      throw new Error(`LTR shell geometry failed: ${JSON.stringify(ltrGeometry)}`);
    }
    const localeReload = waitForEvent(client, "Page.loadEventFired", "English locale persistence reload");
    await client.call("Page.reload", { ignoreCache: false });
    await localeReload;
    await waitFor(client, `document.documentElement.lang === "en" && document.documentElement.dir === "ltr" && document.documentElement.dataset.calendar === "gregory" && document.body?.innerText.includes("Settings & data")`, "English locale persistence after reload with automatic Gregorian calendar");

    const englishTodayLoad = waitForEvent(client, "Page.loadEventFired", "English Today route");
    await client.call("Page.navigate", { url: `${origin}/today/` });
    await englishTodayLoad;
    await waitFor(client, `["/today", "/today/"].includes(location.pathname) && document.documentElement.dir === "ltr" && document.body?.innerText.includes("Today summary") && document.body?.innerText.includes("Daily target") && Boolean(document.querySelector('[data-activity-segments]'))`, "English Today core surface");

    const englishMonthLoad = waitForEvent(client, "Page.loadEventFired", "English Month route");
    await client.call("Page.navigate", { url: `${origin}/month/` });
    await englishMonthLoad;
    await waitFor(client, `["/month", "/month/"].includes(location.pathname) && document.documentElement.dir === "ltr" && document.documentElement.dataset.calendar === "gregory" && document.body?.innerText.includes("My month") && document.body?.innerText.includes("Activity map and month intelligence") && Boolean(document.querySelector('[data-month-activity-heatmap]')) && Boolean(document.querySelector('[data-month-recent-activity]')) && Boolean(document.querySelector('[data-month-intelligence]'))`, "English Month activity intelligence surface");
    const monthHierarchy = await evaluate(client, `(() => {
      const overview = document.querySelector('[data-month-overview-section]')?.getBoundingClientRect();
      const intelligence = document.querySelector('[data-month-intelligence-section]')?.getBoundingClientRect();
      const heatmap = document.querySelector('[data-month-activity-heatmap]')?.getBoundingClientRect();
      const recent = document.querySelector('[data-month-recent-activity]')?.getBoundingClientRect();
      const insight = document.querySelector('[data-month-intelligence]')?.getBoundingClientRect();
      if (!overview || !intelligence || !heatmap || !recent || !insight) return null;
      return {
        overviewTop: overview.top,
        intelligenceTop: intelligence.top,
        sectionWidth: intelligence.width,
        heatmapWidth: heatmap.width,
        recentWidth: recent.width,
        insightWidth: insight.width,
        heatmapHeight: heatmap.height,
        recentHeight: recent.height,
        insightHeight: insight.height,
      };
    })()`);
    if (
      !monthHierarchy
      || monthHierarchy.overviewTop >= monthHierarchy.intelligenceTop
      || monthHierarchy.heatmapWidth > monthHierarchy.sectionWidth * 0.46
      || monthHierarchy.recentWidth < 260
      || monthHierarchy.insightWidth < 300
      || Math.max(monthHierarchy.heatmapHeight, monthHierarchy.recentHeight, monthHierarchy.insightHeight)
        - Math.min(monthHierarchy.heatmapHeight, monthHierarchy.recentHeight, monthHierarchy.insightHeight) > 2
    ) {
      throw new Error(`Month visual hierarchy contract failed: ${JSON.stringify(monthHierarchy)}`);
    }
    console.log("✓ Month keeps the calendar first and aligns heatmap, recent activity, and intelligence on one desktop baseline");
    const heatmapPointerDate = await evaluate(client, `(() => {
      const cells = [...document.querySelectorAll('[data-activity-date]')];
      const cell = cells.find((item) => item.getAttribute('data-activity-in-month') === 'true' && !item.disabled);
      if (!cell) return null;
      cell.scrollIntoView({ block: "center", inline: "center", behavior: "instant" });
      return cell.getAttribute('data-activity-date');
    })()`);
    if (!heatmapPointerDate) throw new Error("Month heatmap has no in-month hover target");
    await evaluate(client, `new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))`);
    const heatmapPointerTarget = await evaluate(client, `(() => {
      const cell = document.querySelector('[data-activity-date="${heatmapPointerDate}"]');
      const rect = cell?.getBoundingClientRect();
      if (!cell || !rect) return null;
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const hit = document.elementFromPoint(x, y);
      return {
        date: cell.getAttribute('data-activity-date'),
        x,
        y,
        inViewport: x >= 0 && x <= document.documentElement.clientWidth && y >= 0 && y <= window.innerHeight,
        hitTarget: hit === cell || Boolean(hit?.closest?.('[data-activity-date="${heatmapPointerDate}"]')),
      };
    })()`);
    if (!heatmapPointerTarget?.inViewport || !heatmapPointerTarget.hitTarget) {
      throw new Error(`Month heatmap hover target is not pointer-reachable: ${JSON.stringify(heatmapPointerTarget)}`);
    }
    await client.call("Input.dispatchMouseEvent", { type: "mouseMoved", x: heatmapPointerTarget.x, y: heatmapPointerTarget.y });
    await waitFor(client, `Boolean(document.querySelector('[data-activity-tooltip]'))`, "portal heatmap tooltip on pointer hover");
    const heatmapTooltip = await evaluate(client, `(() => {
      const tooltip = document.querySelector('[data-activity-tooltip]');
      const rect = tooltip?.getBoundingClientRect();
      if (!tooltip || !rect) return null;
      return {
        parentIsBody: tooltip.parentElement === document.body,
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
        viewportWidth: document.documentElement.clientWidth,
        viewportHeight: window.innerHeight,
        zIndex: Number(getComputedStyle(tooltip).zIndex || 0),
      };
    })()`);
    if (
      !heatmapTooltip
      || !heatmapTooltip.parentIsBody
      || heatmapTooltip.left < 0
      || heatmapTooltip.right > heatmapTooltip.viewportWidth + 1
      || heatmapTooltip.top < 0
      || heatmapTooltip.bottom > heatmapTooltip.viewportHeight + 1
      || heatmapTooltip.zIndex < 1000
    ) {
      throw new Error(`Month heatmap tooltip portal contract failed: ${JSON.stringify(heatmapTooltip)}`);
    }
    console.log("✓ Month heatmap tooltip is portaled above dashboard cards and clamped to the viewport on hover");
    await client.call("Input.dispatchMouseEvent", { type: "mouseMoved", x: 2, y: 2 });

    const heatmapFocusState = await evaluate(client, `(() => {
      const cells = [...document.querySelectorAll('[data-activity-date]')];
      const cell = cells.find((item, index) => item.getAttribute('data-activity-in-month') === 'true' && !item.disabled && index % 7 < 6 && cells[index + 1]?.getAttribute('data-activity-in-month') === 'true');
      if (!cell) return null;
      cell.focus({ preventScroll: true });
      return {
        date: cell.getAttribute('data-activity-date'),
        focused: document.activeElement === cell,
      };
    })()`);
    const heatmapStartDate = heatmapFocusState?.date ?? null;
    if (!heatmapStartDate) throw new Error("Month heatmap has no in-month keyboard target");
    if (!heatmapFocusState?.focused) throw new Error(`Month heatmap keyboard target did not receive focus: ${JSON.stringify(heatmapFocusState)}`);
    await client.call("Input.dispatchKeyEvent", { type: "keyDown", key: "ArrowDown", code: "ArrowDown" });
    await client.call("Input.dispatchKeyEvent", { type: "keyUp", key: "ArrowDown", code: "ArrowDown" });
    await waitFor(client, `document.activeElement?.getAttribute('data-activity-date') && document.activeElement?.getAttribute('data-activity-date') !== ${JSON.stringify(heatmapStartDate)}`, "keyboard-accessible month activity heatmap");
    console.log("✓ Persian/Gregorian month intelligence exposes a keyboard-accessible month activity heatmap");

    await clickRouteLink(client, "/reports");
    await waitFor(client, `["/reports", "/reports/"].includes(location.pathname) && document.documentElement.dir === "ltr"`, "English Reports route");
    await waitFor(client, `document.body?.innerText.includes("Work and payroll report") && document.body?.innerText.includes("Analytics charts") && Boolean(document.querySelector('[data-activity-breakdown]'))`, "English Reports core surface", WAIT_TIMEOUT_MS * 2);
    console.log("✓ Today, Month, and Reports render localized English LTR surfaces before Persian restore");
    console.log("✓ Activity segment and breakdown surfaces follow English LTR");

    // Employee mode intentionally cannot access freelancer-only business routes.
    // Exercise the real workspace switcher before the business-route matrix so
    // RouteGuard remains authoritative instead of bypassing the product contract.
    await switchWorkspaceMode(client, "hybrid");

    const englishClientsLoad = waitForEvent(client, "Page.loadEventFired", "English Clients route");
    await client.call("Page.navigate", { url: `${origin}/clients/` });
    await englishClientsLoad;
    await waitFor(client, `["/clients", "/clients/"].includes(location.pathname) && document.documentElement.dir === "ltr" && document.body?.innerText.includes("Clients") && document.body?.innerText.includes("Business status")`, "English Clients business surface");

    const englishProjectsLoad = waitForEvent(client, "Page.loadEventFired", "English Projects route");
    await client.call("Page.navigate", { url: `${origin}/projects/` });
    await englishProjectsLoad;
    await waitFor(client, `["/projects", "/projects/"].includes(location.pathname) && document.documentElement.dir === "ltr" && document.body?.innerText.includes("Projects") && document.body?.innerText.includes("Your projects")`, "English Projects business surface");

    const englishInvoicesLoad = waitForEvent(client, "Page.loadEventFired", "English Invoices route");
    await client.call("Page.navigate", { url: `${origin}/invoices/` });
    await englishInvoicesLoad;
    await waitFor(client, `["/invoices", "/invoices/"].includes(location.pathname) && document.documentElement.dir === "ltr" && document.body?.innerText.includes("Invoices") && document.body?.innerText.includes("Invoice list")`, "English Invoices business surface");

    const englishLeaveLoad = waitForEvent(client, "Page.loadEventFired", "English Leave route");
    await client.call("Page.navigate", { url: `${origin}/leave/` });
    await englishLeaveLoad;
    await waitFor(client, `["/leave", "/leave/"].includes(location.pathname) && document.documentElement.dir === "ltr" && document.body?.innerText.includes("My leave") && document.body?.innerText.includes("Leave overview")`, "English Leave business surface");
    console.log("✓ Clients, Projects, Invoices, and Leave render localized English LTR business surfaces");

    // Restore the onboarding-selected Employee workspace before system/PWA
    // checks so the historical production journey keeps its original mode.
    await switchWorkspaceMode(client, "employee");

    const englishSystemSettingsLoad = waitForEvent(client, "Page.loadEventFired", "English Settings system route");
    await client.call("Page.navigate", { url: `${origin}/settings/` });
    await englishSystemSettingsLoad;
    await waitFor(client, `document.documentElement.dir === "ltr" && document.querySelector('#settings-onboarding')?.textContent.includes("Initial setup") && document.querySelector('#settings-device-transfer')?.textContent.includes("Connect phone and laptop") && document.title === "Settings | Saatyar"`, "English Settings deep system surface");
    await waitFor(client, `Boolean(document.querySelector('[data-notification-intelligence]')) && Boolean(document.querySelector('[data-quiet-hours]')) && Boolean(document.querySelector('[data-custom-reminder]')) && Boolean(document.querySelector('[data-add-custom-reminder]')) && Boolean(document.querySelector('[data-reminder-snooze]')) && document.querySelector('#settings-notifications')?.textContent.includes("Quiet hours")`, "English notification intelligence settings");
    console.log("✓ Notification intelligence settings expose quiet hours, multi custom reminders, and snooze in English LTR");
    await waitFor(client, `Boolean(document.querySelector('[data-product-analytics-settings]')) && Boolean(document.querySelector('[data-analytics-opt-in]')) && Boolean(document.querySelector('[data-analytics-opt-out]')) && document.querySelector('#settings-analytics')?.textContent.includes("Privacy-safe product analytics")`, "English privacy-safe analytics settings");
    console.log("✓ Privacy-safe analytics exposes explicit opt-in/opt-out without including work content in Settings");

    const englishImportLoad = waitForEvent(client, "Page.loadEventFired", "English Import system route");
    await client.call("Page.navigate", { url: `${origin}/import/` });
    await englishImportLoad;
    await waitFor(client, `["/import", "/import/"].includes(location.pathname) && document.documentElement.dir === "ltr" && document.body?.innerText.includes("Import files") && document.body?.innerText.includes("Safe, local-first import") && document.title === "Import files | Saatyar"`, "English Import system surface");

    const englishAboutLoad = waitForEvent(client, "Page.loadEventFired", "English About system route");
    await client.call("Page.navigate", { url: `${origin}/about/` });
    await englishAboutLoad;
    await waitFor(client, `["/about", "/about/"].includes(location.pathname) && document.documentElement.dir === "ltr" && document.body?.innerText.includes("About and guide") && document.body?.innerText.includes("What is Saatyar?") && document.title === "About & help | Saatyar"`, "English About system surface");

    const englishReentrySettingsLoad = waitForEvent(client, "Page.loadEventFired", "English Settings onboarding reentry route");
    await client.call("Page.navigate", { url: `${origin}/settings/` });
    await englishReentrySettingsLoad;
    await waitFor(client, `document.documentElement.dir === "ltr" && Boolean(document.querySelector('[data-onboarding-reentry-action]'))`, "English onboarding reentry action");
    await evaluate(client, `document.querySelector('[data-onboarding-reentry-action]')?.click()`);
    await waitFor(client, `["/onboarding", "/onboarding/"].includes(location.pathname) && document.documentElement.dir === "ltr" && Boolean(document.querySelector('[data-onboarding-step-index="1"]')) && document.body?.innerText.includes("Welcome to Saatyar") && document.title === "Initial setup | Saatyar"`, "English onboarding reentry surface");
    await evaluate(client, `document.querySelector('[data-onboarding-back-settings]')?.click()`);
    await waitFor(client, `["/settings", "/settings/"].includes(location.pathname) && document.documentElement.dir === "ltr" && document.body?.innerText.includes("Settings & data")`, "return from English onboarding reentry");
    console.log("✓ Settings, Onboarding, Import, and About follow English LTR before Persian restore");

    const settingsLocaleRestoreLoad = waitForEvent(client, "Page.loadEventFired", "Settings locale restore route");
    await client.call("Page.navigate", { url: `${origin}/settings/` });
    await settingsLocaleRestoreLoad;
    await waitFor(client, `Boolean(document.querySelector('[data-locale-choice="fa-IR"]')) && document.documentElement.lang === "en"`, "language settings before Persian restore");
    await evaluate(client, `document.querySelector('[data-locale-choice="fa-IR"]')?.click()`);
    await waitFor(client, `document.documentElement.lang === "fa" && document.documentElement.dir === "rtl" && document.documentElement.dataset.calendar === "persian" && localStorage.getItem("saatyar-locale-v1") === "fa-IR" && document.body?.innerText.includes("تنظیمات و داده‌ها")`, "Persian RTL locale restore with automatic Persian calendar");
    console.log("✓ Local-first locale switch persists English LTR across reload and restores Persian RTL");

    const localeReturnToday = waitForEvent(client, "Page.loadEventFired", "return to Today after locale smoke");
    await client.call("Page.navigate", { url: `${origin}/today/` });
    await localeReturnToday;
    await waitFor(client, `["/today", "/today/"].includes(location.pathname) && document.body?.innerText.includes("ساعت‌یار")`, "Today after locale smoke");

    await waitFor(client, `navigator.serviceWorker?.ready.then(() => true).catch(() => false)`, "PWA service worker readiness");
    const firstInstallWorker = await evaluate(client, `(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      return {
        active: Boolean(registration?.active),
        waiting: Boolean(registration?.waiting),
        installing: Boolean(registration?.installing),
        controlled: Boolean(navigator.serviceWorker.controller),
        scope: registration?.scope || null,
      };
    })()`);
    if (!firstInstallWorker?.active) {
      throw new Error(`PWA service worker did not reach the active state: ${JSON.stringify(firstInstallWorker)}`);
    }
    if (!firstInstallWorker.controlled) {
      const onlineControlLoad = waitForEvent(client, "Page.loadEventFired", "first-install PWA control reload", 45_000);
      await client.call("Page.reload", { ignoreCache: false });
      await onlineControlLoad;
      await waitFor(client, "document.readyState === 'complete' && document.body?.innerText.includes('ساعت‌یار')", "first-install PWA control reload render", 45_000);
    }
    await waitFor(client, `Boolean(navigator.serviceWorker?.controller)`, "PWA service worker control after activation");
    const pwaContract = await evaluate(client, `(async () => {
      const link = document.querySelector('link[rel="manifest"]');
      if (!link) return null;
      const manifest = await fetch(link.href).then((response) => response.json());
      const registration = await navigator.serviceWorker.getRegistration();
      return {
        name: manifest.name,
        shortName: manifest.short_name,
        display: manifest.display,
        iconCount: Array.isArray(manifest.icons) ? manifest.icons.length : 0,
        active: Boolean(registration?.active),
        controlled: Boolean(navigator.serviceWorker.controller),
        precachedBuildAssets: (await Promise.all((await caches.keys()).map(async (key) => {
          const cache = await caches.open(key);
          return (await cache.keys()).filter((request) => request.url.includes("/_next/static/")).length;
        }))).reduce((sum, count) => sum + count, 0),
      };
    })()`);
    if (!pwaContract?.active || !pwaContract.controlled || pwaContract.name !== "ساعت‌یار" || pwaContract.shortName !== "ساعت‌یار" || pwaContract.display !== "standalone" || pwaContract.iconCount < 3 || pwaContract.precachedBuildAssets < 1) {
      throw new Error(`PWA installability contract failed: ${JSON.stringify(pwaContract)}`);
    }
    console.log("✓ PWA manifest and service worker are install-ready");

    const firstLabel = await evaluate(client, `document.querySelector('[aria-haspopup="dialog"] strong')?.textContent?.trim() || ""`);
    await evaluate(client, `document.querySelector('[aria-haspopup="dialog"]')?.click()`);
    await waitFor(client, "Boolean(document.querySelector('[role=dialog]'))", "date picker dialog");
    const selectedLabel = await evaluate(client, `(() => {
      const button = [...document.querySelectorAll('[role=dialog] button[aria-pressed="false"]')][0];
      if (!button) return "";
      const label = button.getAttribute('aria-label') || "";
      button.click();
      return label;
    })()`);
    if (!selectedLabel) throw new Error("No alternate calendar date was available.");
    await waitFor(client, "!document.querySelector('[role=dialog]')", "date picker close");
    await waitFor(client, `document.querySelector('[aria-haspopup="dialog"] strong')?.textContent?.trim() !== ${JSON.stringify(firstLabel)}`, "selected date change");
    const secondLabel = await evaluate(client, `document.querySelector('[aria-haspopup="dialog"] strong')?.textContent?.trim() || ""`);
    if (!secondLabel || secondLabel === firstLabel) throw new Error("Date navigation did not update the selected date.");
    console.log(`✓ Date navigation changed “${firstLabel}” to “${secondLabel}”`);

    // Simulate an unreachable origin instead of disabling Chrome networking globally.
    // This keeps CDP/runtime communication stable while proving that the service worker
    // can boot the installed shell with the production server unavailable.
    await staticServer.close();
    staticServer = null;
    const offlineLoad = waitForEvent(client, "Page.loadEventFired", "offline PWA load event", 45_000);
    await client.call("Page.reload", { ignoreCache: false });
    await offlineLoad;
    await waitFor(client, "document.readyState === 'complete' && document.body?.innerText.includes('ساعت‌یار')", "offline PWA reload", 45_000);
    console.log("✓ Installed shell reloads while offline");

    if (client.runtimeErrors.length > 0) throw new Error(`Browser runtime errors:\n${client.runtimeErrors.join("\n")}`);
    console.log("Production browser smoke passed.");
  } catch (error) {
    if (browserOutput.trim()) console.error(`\nBrowser output:\n${browserOutput.trim()}`);
    throw error;
  } finally {
    client?.close();
    await terminate(browser);
    await staticServer?.close();
    await cleanupBrowserProfile(profileDir);
  }
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isDirectRun) {
  runProductionBrowserSmoke().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
