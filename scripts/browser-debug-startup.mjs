import { spawn } from "node:child_process";
import { mkdtemp } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { cleanupBrowserProfile } from "./browser-profile-cleanup.mjs";

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_ATTEMPTS = 2;

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

async function terminateBrowser(child) {
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
  await Promise.race([
    new Promise((resolveExit) => child.once("exit", resolveExit)),
    new Promise((resolveWait) => setTimeout(resolveWait, 5_000)),
  ]);
}

async function waitForJson(url, options, timeout, browser) {
  const deadline = Date.now() + timeout;
  let lastError = null;
  while (Date.now() < deadline) {
    if (browser?.exitCode !== null || browser?.signalCode !== null) {
      throw new Error(`Browser exited before debugging endpoint became ready (exit=${browser.exitCode ?? "null"}, signal=${browser.signalCode ?? "null"}).`);
    }
    try {
      const response = await fetch(url, options);
      if (response.ok) return response.json();
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  }
  const detail = lastError instanceof Error ? ` Last error: ${lastError.message}` : "";
  throw new Error(`Browser debugging endpoint did not become ready: ${url}.${detail}`);
}

function defaultRuntime() {
  return {
    allocatePort: freePort,
    createProfile: (prefix) => mkdtemp(join(tmpdir(), prefix)),
    spawnBrowser(executable, args, onStderr) {
      const child = spawn(executable, args, { stdio: ["ignore", "ignore", "pipe"] });
      child.stderr.on("data", onStderr);
      return child;
    },
    requestJson: waitForJson,
    terminateBrowser,
    cleanupProfile: cleanupBrowserProfile,
  };
}

function browserArgs(debugPort, profileDir, extraArgs) {
  const args = [
    "--headless=new",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profileDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-dev-shm-usage",
    ...extraArgs,
    "about:blank",
  ];
  if (typeof process.getuid === "function" && process.getuid() === 0) args.push("--no-sandbox");
  return args;
}

export function summarizeBrowserStartupFailure(error, output = "") {
  const message = error instanceof Error ? error.message : String(error);
  const devtoolsLine = output
    .split(/\r?\n/)
    .find((line) => /DevTools listening on ws:\/\//i.test(line));
  return devtoolsLine ? `${message} (${devtoolsLine.trim()})` : message;
}

/**
 * @typedef {Object} BrowserDebugLaunchOptions
 * @property {string} executable
 * @property {string} profilePrefix
 * @property {string[]} [extraArgs]
 * @property {number} [timeout]
 * @property {number} [attempts]
 * @property {(details: { attempt: number, nextAttempt: number, attempts: number, failure: string }) => void} [onRetry]
 */

/**
 * Launch a browser debugging target with a bounded startup retry.
 * The explicit JSDoc contract is intentional: TypeScript consumes this `.mjs`
 * helper from strict `.ts` release-contract tests, and an untyped `[]` default
 * can otherwise narrow `extraArgs` to `never[]`.
 *
 * @param {BrowserDebugLaunchOptions} options
 * @param {ReturnType<typeof defaultRuntime>} [runtime]
 */
export async function launchBrowserDebugTarget({
  executable,
  profilePrefix,
  extraArgs = [],
  timeout = DEFAULT_TIMEOUT_MS,
  attempts = DEFAULT_ATTEMPTS,
  onRetry = ({ nextAttempt, attempts: maxAttempts, failure }) => {
    console.warn(`↻ Browser debugging startup retry ${nextAttempt}/${maxAttempts}: ${failure}`);
  },
}, runtime = defaultRuntime()) {
  if (!executable) throw new Error("Browser executable is required.");
  if (!Number.isInteger(attempts) || attempts < 1) throw new Error("Browser startup attempts must be at least 1.");

  const failures = [];
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const debugPort = await runtime.allocatePort();
    const profileDir = await runtime.createProfile(profilePrefix);
    let output = "";
    let child;

    try {
      child = runtime.spawnBrowser(
        executable,
        browserArgs(debugPort, profileDir, extraArgs),
        (chunk) => { output += String(chunk); },
      );
      await runtime.requestJson(`http://127.0.0.1:${debugPort}/json/version`, {}, timeout, child);
      const target = await runtime.requestJson(
        `http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent("about:blank")}`,
        { method: "PUT" },
        timeout,
        child,
      );
      if (!target?.webSocketDebuggerUrl) {
        throw new Error("Browser debugging target did not expose webSocketDebuggerUrl.");
      }

      let closed = false;
      return {
        browser: child,
        profileDir,
        debugPort,
        target,
        attempt,
        getBrowserOutput: () => output,
        async close() {
          if (closed) return;
          closed = true;
          await runtime.terminateBrowser(child);
          await runtime.cleanupProfile(profileDir);
        },
      };
    } catch (error) {
      const failure = summarizeBrowserStartupFailure(error, output);
      failures.push(`attempt ${attempt}: ${failure}`);
      if (child) await runtime.terminateBrowser(child);
      await runtime.cleanupProfile(profileDir);
      if (attempt < attempts) {
        onRetry?.({ attempt, nextAttempt: attempt + 1, attempts, failure });
      }
    }
  }

  throw new Error(`Browser debugging startup failed after ${attempts} attempt(s). ${failures.join(" | ")}`);
}
