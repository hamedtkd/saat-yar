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
    return await evaluate(client, `(() => ({
      url: location.href,
      readyState: document.readyState,
      body: (document.body?.innerText || "").replace(/\s+/g, " ").trim().slice(0, 500),
      onboardingStep: document.querySelector("[data-onboarding-step]")?.getAttribute("data-onboarding-step-index") || null,
      loading: document.body?.innerText.includes("\u062f\u0631 \u062d\u0627\u0644 \u0622\u0645\u0627\u062f\u0647") || false,
    }))()`);
  } catch {
    return null;
  }
}

async function waitFor(client, expression, label, timeout = WAIT_TIMEOUT_MS) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try {
      if (await evaluate(client, expression)) return;
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
      'document.querySelector(\'[data-onboarding-step-index="2"]\') && document.querySelectorAll(\'[data-onboarding-step-index="2"] button[aria-pressed]\').length >= 3',
      "onboarding mode step",
    );
    console.log("\u2713 Initial production load opened onboarding");

    await clickButton(client, "ادامه");
    await waitFor(client, `Boolean(document.querySelector('[data-onboarding-step-index="3"]'))`, "onboarding schedule step");
    await clickButton(client, "ادامه");
    await waitFor(client, `Boolean(document.querySelector('[data-onboarding-step-index="4"]'))`, "onboarding privacy step");
    await clickButton(client, "شروع ساعت‌یار");
    await waitFor(client, "['/today', '/today/'].includes(location.pathname) && !document.body?.innerText.includes('شروع ساعت‌یار')", "today route after onboarding");
    await new Promise((resolveWait) => setTimeout(resolveWait, 400));
    console.log("✓ Onboarding completed and today route rendered");

    await waitFor(client, `navigator.serviceWorker?.ready.then(() => true).catch(() => false)`, "PWA service worker readiness");
    await waitFor(client, `Boolean(navigator.serviceWorker?.controller)`, "PWA service worker control");
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
