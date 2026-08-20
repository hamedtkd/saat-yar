import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createMediaDemoData } from "./media/demo-data.ts";
import { FRESH_ONBOARDING_READY_EXPRESSION } from "./media/capture-expressions.mjs";
import { cleanupBrowserProfile } from "./browser-profile-cleanup.mjs";
import { findBrowserExecutable } from "./production-browser-smoke.mjs";
import { startStaticExportServer } from "./static-export-server.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SCREENSHOT_DIR = resolve(ROOT, "docs/assets/screenshots");
const MEDIA_DIR = resolve(ROOT, "docs/assets/media");
const ANCHOR_ISO = "2026-08-07T10:30:00+03:30";

async function freePort() {
  const { createServer } = await import("node:net");
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

async function waitForJson(url, options = {}, timeout = 30_000) {
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
      this.socket.onerror = () => reject(new Error("Could not connect to browser debugging socket."));
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
  close() { this.socket.close(); }
}

async function evaluate(client, expression) {
  const response = await client.call("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (response.exceptionDetails) {
    const description = response.exceptionDetails.exception?.description;
    const text = response.exceptionDetails.text;
    throw new Error(description || text || "Browser evaluation failed.");
  }
  return response.result?.value;
}

async function waitFor(client, expression, label, timeout = 30_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await evaluate(client, expression)) return;
    await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  }
  throw new Error(`Timed out while waiting for ${label}.`);
}

async function seedAppData(client, data) {
  await evaluate(client, `(async () => {
    const data = ${JSON.stringify(data)};
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open("saatyar-db", 1);
      request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains("app-data")) request.result.createObjectStore("app-data"); };
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

async function setTheme(client, mode) {
  await evaluate(client, `localStorage.setItem("saatyar-appearance", JSON.stringify({mode:${JSON.stringify(mode)},preset:"violet",accent:"#8b5cf6",radius:"rounded",surface:"tinted"}));`);
}

async function navigate(client, url, readyText) {
  await client.call("Page.navigate", { url });
  await waitFor(client, "document.readyState === 'complete'", "document load");
  if (readyText) await waitFor(client, `document.body?.innerText.includes(${JSON.stringify(readyText)})`, readyText);
  await new Promise((resolveWait) => setTimeout(resolveWait, 500));
}

async function viewport(client, width, height, mobile = false) {
  await client.call("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile, screenWidth: width, screenHeight: height });
}

async function screenshot(client, filename, outputDirectory = SCREENSHOT_DIR) {
  const response = await client.call("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false });
  await writeFile(resolve(outputDirectory, filename), Buffer.from(response.data, "base64"));
  console.log(`✓ ${filename}`);
}

async function captureOnboardingFrames(client, origin, frameDirectory) {
  await navigate(client, origin, "به ساعت‌یار خوش آمدی");
  await evaluate(client, `(() => {
    const input = document.querySelector('[data-onboarding-step-index="1"] input');
    if (!(input instanceof HTMLInputElement)) return false;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    setter?.call(input, "حامد");
    input.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: "حامد" }));
    return true;
  })()`);
  await screenshot(client, "onboarding.png");
  const frames = [];
  for (let index = 1; index <= 7; index += 1) {
    const frame = `onboarding-frame-${String(index).padStart(2, "0")}.png`;
    await screenshot(client, frame, frameDirectory);
    frames.push(resolve(frameDirectory, frame));
    const label = index < 7 ? "ادامه" : "شروع ساعت‌یار";
    const clicked = await evaluate(client, `(() => { const b=[...document.querySelectorAll('button')].find(x => !x.disabled && (x.textContent||'').includes(${JSON.stringify(label)})); if(!b)return false;b.click();return true; })()`);
    if (!clicked) break;
    await new Promise((resolveWait) => setTimeout(resolveWait, 650));
  }
  return frames;
}

function buildGif(frameDirectory) {
  const ffmpeg = spawnSync(process.platform === "win32" ? "where" : "which", ["ffmpeg"], { encoding: "utf8" });
  if (ffmpeg.status !== 0) {
    console.warn("! ffmpeg not found; onboarding PNG frames were generated, GIF skipped.");
    return false;
  }
  const input = resolve(frameDirectory, "onboarding-frame-%02d.png");
  const output = resolve(MEDIA_DIR, "onboarding.gif");
  const result = spawnSync("ffmpeg", ["-y", "-framerate", "0.8", "-start_number", "1", "-i", input, "-vf", "fps=8,scale=960:-1:flags=lanczos", output], { stdio: "ignore" });
  if (result.status === 0) {
    console.log("✓ onboarding.gif");
    return true;
  }
  console.warn("! ffmpeg could not create onboarding.gif; PNG frames remain available.");
  return false;
}

async function terminateBrowser(browser) {
  if (!browser || browser.exitCode !== null || browser.signalCode !== null) return;
  if (process.platform === "win32") {
    await new Promise((resolveKill) => {
      const killer = spawn("taskkill", ["/pid", String(browser.pid), "/T", "/F"], { stdio: "ignore" });
      killer.on("exit", resolveKill);
      killer.on("error", resolveKill);
    });
  } else {
    browser.kill("SIGTERM");
  }
  await Promise.race([
    new Promise((resolveExit) => browser.once("exit", resolveExit)),
    new Promise((resolveTimeout) => setTimeout(resolveTimeout, 5_000)),
  ]);
}

async function main() {
  const outputDirectory = resolve(ROOT, "out");
  if (!existsSync(resolve(outputDirectory, "index.html"))) throw new Error("Run npm run build:vercel before media capture.");
  const browserExecutable = findBrowserExecutable();
  if (!browserExecutable) throw new Error("Chrome, Edge or Chromium was not found. Set SAATYAR_BROWSER_PATH.");

  await mkdir(SCREENSHOT_DIR, { recursive: true });
  await mkdir(MEDIA_DIR, { recursive: true });
  const profileDir = await mkdtemp(join(tmpdir(), "saatyar-media-profile-"));
  const frameDir = await mkdtemp(join(tmpdir(), "saatyar-media-frames-"));
  const debugPort = await freePort();
  const server = await startStaticExportServer({ outputDirectory });
  const browserArgs = ["--headless=new", `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profileDir}`, "--no-first-run", "--no-default-browser-check", "--disable-dev-shm-usage", "about:blank"];
  if (typeof process.getuid === "function" && process.getuid() === 0) browserArgs.push("--no-sandbox");
  const browser = spawn(browserExecutable, browserArgs, { stdio: ["ignore", "ignore", "pipe"] });
  let browserOutput = "";
  browser.stderr.on("data", (chunk) => { browserOutput += chunk; });
  let client;
  try {
    await waitForJson(`http://127.0.0.1:${debugPort}/json/version`);
    const target = await waitForJson(`http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent("about:blank")}`, { method: "PUT" });
    client = new CdpClient(target.webSocketDebuggerUrl);
    const runtimeErrors = [];
    client.on("Runtime.exceptionThrown", ({ exceptionDetails }) => {
      const description = exceptionDetails?.exception?.description || exceptionDetails?.text || "Runtime exception";
      runtimeErrors.push(description);
    });
    await client.call("Page.enable");
    await client.call("Runtime.enable");
    await client.call("Storage.clearDataForOrigin", { origin: server.origin, storageTypes: "all" });
    await client.call("Page.addScriptToEvaluateOnNewDocument", { source: `(() => { const RealDate=Date; const fixed=${JSON.stringify(ANCHOR_ISO)}; class FixedDate extends RealDate { constructor(...args){ super(...(args.length?args:[fixed])); } static now(){ return new RealDate(fixed).getTime(); } } FixedDate.parse=RealDate.parse; FixedDate.UTC=RealDate.UTC; window.Date=FixedDate; })();` });

    await viewport(client, 1440, 960);
    await captureOnboardingFrames(client, server.origin, frameDir);

    await navigate(client, "about:blank");
    await client.call("Storage.clearDataForOrigin", { origin: server.origin, storageTypes: "all" });
    await navigate(client, server.origin);
    await waitFor(
      client,
      FRESH_ONBOARDING_READY_EXPRESSION,
      "fresh onboarding route before demo seed",
    );
    const data = createMediaDemoData(ANCHOR_ISO);
    await seedAppData(client, data);
    await setTheme(client, "light");
    await navigate(client, `${server.origin}/today`, "خلاصه امروز");
    await screenshot(client, "today-light-desktop.png");

    await setTheme(client, "dark");
    await navigate(client, `${server.origin}/today`, "خلاصه امروز");
    await screenshot(client, "today-dark-desktop.png");

    await viewport(client, 390, 844, true);
    await setTheme(client, "light");
    await navigate(client, `${server.origin}/today`, "خلاصه امروز");
    await screenshot(client, "today-mobile.png");

    await viewport(client, 1440, 960);
    await setTheme(client, "light");
    await navigate(client, `${server.origin}/month`, "تقویم کاری");
    await screenshot(client, "work-calendar-light-desktop.png");
    await setTheme(client, "dark");
    await navigate(client, `${server.origin}/month`, "تقویم کاری");
    await screenshot(client, "work-calendar-dark-desktop.png");

    await setTheme(client, "light");
    await navigate(client, `${server.origin}/reports`, "گزارش");
    await screenshot(client, "reports-light.png");
    await setTheme(client, "dark");
    await navigate(client, `${server.origin}/reports`, "گزارش");
    await screenshot(client, "reports-dark.png");
    await setTheme(client, "light");
    await navigate(client, `${server.origin}/settings`, "تنظیمات");
    await screenshot(client, "settings.png");

    const actionableRuntimeErrors = runtimeErrors.filter((message) => !/AbortError|ResizeObserver loop/i.test(message));
    if (actionableRuntimeErrors.length > 0) {
      throw new Error(`Browser runtime errors during media capture:\n${actionableRuntimeErrors.join("\n")}`);
    }

    buildGif(frameDir);
    console.log(`Media captured in ${resolve(ROOT, "docs/assets")}`);
  } catch (error) {
    if (browserOutput.trim()) console.error(`\nBrowser output:\n${browserOutput.trim()}`);
    throw error;
  } finally {
    client?.close();
    await terminateBrowser(browser);
    await server.close();
    await cleanupBrowserProfile(profileDir);
    await rm(frameDir, { recursive: true, force: true });
  }
}

main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
