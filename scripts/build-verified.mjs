import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const executable = path.join(
  root,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "vinext.cmd" : "vinext",
);

await access(executable, constants.F_OK).catch(() => {
  throw new Error("vinext در دسترس نیست. ابتدا npm install را اجرا کنید.");
});

process.env.WRANGLER_WRITE_LOGS ??= "false";
process.env.WRANGLER_LOG_PATH ??= path.join(root, ".wrangler", "logs");
process.env.MINIFLARE_REGISTRY_PATH ??= path.join(root, ".wrangler", "registry");

const child = spawn(executable, ["build"], {
  cwd: root,
  env: process.env,
  stdio: "inherit",
  shell: process.platform === "win32",
});

const timeoutMs = Number(process.env.SITES_BUILD_TIMEOUT_MS ?? 180_000);
const timeout = setTimeout(() => {
  child.kill("SIGTERM");
}, timeoutMs);

const exitCode = await new Promise((resolve, reject) => {
  child.once("error", reject);
  child.once("exit", (code) => resolve(code ?? 1));
});
clearTimeout(timeout);

if (exitCode !== 0) process.exit(exitCode);
await import("./validate-artifact.mjs");
