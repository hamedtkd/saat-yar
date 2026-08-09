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

async function browserStateSnapshot(client) {
  try {
    return await evaluate(client, `(async () => {
      const registration = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration().catch(() => undefined) : undefined;
      return {
        url: location.href,
        readyState: document.readyState,
        body: (document.body?.innerText || "").replace(/\s+/g, " ").trim().slice(0, 500),
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
    await clickButton(client, "فریلنسر");
    await waitFor(client, `document.querySelector('[data-onboarding-progress-mode="freelancer"]') && document.querySelector('[data-onboarding-step-index="2"][data-onboarding-mode="freelancer"]')`, "freelancer personalized onboarding progress");
    await clickButton(client, "ترکیبی");
    await waitFor(client, `document.querySelector('[data-onboarding-progress-mode="hybrid"]') && document.querySelector('[data-onboarding-step-index="2"][data-onboarding-mode="hybrid"]')`, "hybrid personalized onboarding progress");
    await clickButton(client, "کارمند");
    await waitFor(client, `document.querySelector('[data-onboarding-progress-mode="employee"]') && document.querySelector('[data-onboarding-step-index="2"][data-onboarding-mode="employee"]')`, "employee personalized onboarding progress");
    console.log("✓ Onboarding progress adapts immediately to Employee/Freelancer/Hybrid selection");
    await clickButton(client, "ادامه");
    await waitFor(client, `Boolean(document.querySelector('[data-onboarding-step-index="3"] [data-work-schedule-editor]'))`, "onboarding schedule step");

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
    }))()`);
    if (recoveredSchedule?.weeklyTarget !== "44" || !recoveredSchedule?.thursdayEnabled) {
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
      && onboardingSettings.thursdayEnabled
      && onboardingSettings.salary === 42_000_000
      && onboardingSettings.payrollBaseAmount === 42_000_000
      && onboardingSettings.appearancePreset === "ocean"
      && onboardingSettings.appearanceAccent?.toLowerCase() === "#0ea5e9"
      && onboardingSettings.onboarded === true;
    if (!onboardingContract) throw new Error(`Persisted onboarding settings contract failed: ${JSON.stringify(onboardingSettings)}`);
    console.log("✓ Onboarding completed with schedule, payroll and appearance persisted to AppData");

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
