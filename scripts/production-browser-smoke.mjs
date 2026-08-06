import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join, resolve, win32 } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const WAIT_TIMEOUT_MS = 30_000;

export function browserExecutableCandidates(env = process.env, platform = process.platform) {
  const overrides = [env.SAATYAR_BROWSER_PATH, env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, env.CHROME_PATH].filter(Boolean);
  if (platform === "win32") {
    const programFiles = [env.PROGRAMFILES, env["PROGRAMFILES(X86)"], env.LOCALAPPDATA].filter(Boolean);
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

async function waitFor(client, expression, label, timeout = WAIT_TIMEOUT_MS) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await evaluate(client, expression)) return;
    await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  }
  throw new Error(`Timed out while waiting for ${label}.`);
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

async function terminate(child) {
  if (!child || child.exitCode !== null) return;
  if (process.platform === "win32") {
    await new Promise((resolveKill) => {
      const killer = spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
      killer.on("exit", resolveKill);
      killer.on("error", resolveKill);
    });
  } else {
    child.kill("SIGTERM");
  }
}

export async function runProductionBrowserSmoke() {
  const nextBin = resolve(ROOT, "node_modules", "next", "dist", "bin", "next");
  if (!existsSync(nextBin)) throw new Error("Next.js is not installed. Run npm install first.");
  if (!existsSync(resolve(ROOT, ".next", "BUILD_ID"))) throw new Error("Production build is missing. Run npm run build:vercel first.");

  const browserExecutable = findBrowserExecutable();
  if (!browserExecutable) {
    throw new Error("Chrome, Edge or Chromium was not found. Set SAATYAR_BROWSER_PATH to the browser executable.");
  }

  const appPort = await freePort();
  const debugPort = await freePort();
  const origin = `http://127.0.0.1:${appPort}`;
  const profileDir = await mkdtemp(join(tmpdir(), "saatyar-browser-smoke-"));
  let server;
  let browser;
  let client;
  let serverOutput = "";
  let browserOutput = "";

  try {
    server = spawn(process.execPath, [nextBin, "start", "-H", "127.0.0.1", "-p", String(appPort)], {
      cwd: ROOT,
      env: { ...process.env, NODE_ENV: "production" },
      stdio: ["ignore", "pipe", "pipe"],
    });
    server.stdout.on("data", (chunk) => { serverOutput += chunk; });
    server.stderr.on("data", (chunk) => { serverOutput += chunk; });
    await waitForHttp(origin);
    console.log("✓ Production server is reachable");

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
      `http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent(origin)}`,
      { method: "PUT" },
    );
    client = new CdpClient(target.webSocketDebuggerUrl);
    const runtimeErrors = [];
    client.on("Runtime.exceptionThrown", ({ exceptionDetails }) => runtimeErrors.push(exceptionDetails?.text ?? "Runtime exception"));
    await client.call("Page.enable");
    await client.call("Runtime.enable");
    await client.call("Log.enable");

    await waitFor(client, "document.readyState === 'complete'", "initial document load");
    await waitFor(client, "document.body?.innerText.includes('ساعت‌یار را برای خودت تنظیم کن')", "onboarding mode step");
    console.log("✓ Initial production load opened onboarding");

    await clickButton(client, "ادامه");
    await waitFor(client, "document.body?.innerText.includes('برنامه کاری تو')", "onboarding schedule step");
    await clickButton(client, "ادامه");
    await waitFor(client, "document.body?.innerText.includes('اطلاعات فقط روی دستگاه تو می‌ماند')", "onboarding privacy step");
    await clickButton(client, "شروع ساعت‌یار");
    await waitFor(client, "location.pathname === '/today' && !document.body?.innerText.includes('شروع ساعت‌یار')", "today route after onboarding");
    await new Promise((resolveWait) => setTimeout(resolveWait, 400));
    console.log("✓ Onboarding completed and today route rendered");

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

    if (runtimeErrors.length > 0) throw new Error(`Browser runtime errors:\n${runtimeErrors.join("\n")}`);
    console.log("Production browser smoke passed.");
  } catch (error) {
    if (serverOutput.trim()) console.error(`\nNext output:\n${serverOutput.trim()}`);
    if (browserOutput.trim()) console.error(`\nBrowser output:\n${browserOutput.trim()}`);
    throw error;
  } finally {
    client?.close();
    await terminate(browser);
    await terminate(server);
    await rm(profileDir, { recursive: true, force: true });
  }
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isDirectRun) {
  runProductionBrowserSmoke().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
