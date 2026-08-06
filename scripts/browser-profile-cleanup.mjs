import { rm } from "node:fs/promises";

const RETRYABLE_CODES = new Set(["EBUSY", "ENOTEMPTY", "EPERM"]);

/**
 * @typedef {(directory: string, options: {
 *   recursive: true;
 *   force: true;
 *   maxRetries: number;
 *   retryDelay: number;
 * }) => Promise<void>} RemoveDirectory
 */

const wait = (delayMs) => new Promise((resolve) => setTimeout(resolve, delayMs));

function errorCode(error) {
  return error && typeof error === "object" && "code" in error
    ? String(error.code)
    : "";
}

/**
 * Windows may keep Chromium profile files locked briefly after the browser exits.
 * Retry only the known transient filesystem errors and preserve every other failure.
 *
 * @param {string} directory
 * @param {{
 *   attempts?: number;
 *   retryDelayMs?: number;
 *   remove?: RemoveDirectory;
 *   sleep?: (delayMs: number) => Promise<void>;
 * }} [options]
 */
export async function removeBrowserProfileDirectory(directory, options = {}) {
  const attempts = Math.max(1, options.attempts ?? 8);
  const retryDelayMs = Math.max(0, options.retryDelayMs ?? 250);
  const remove = options.remove ?? rm;
  const sleep = options.sleep ?? wait;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await remove(directory, {
        recursive: true,
        force: true,
        maxRetries: 2,
        retryDelay: retryDelayMs,
      });
      return { removed: true, attempts: attempt };
    } catch (error) {
      const code = errorCode(error);
      const retryable = RETRYABLE_CODES.has(code);
      if (!retryable || attempt === attempts) throw error;
      await sleep(retryDelayMs * attempt);
    }
  }

  return { removed: false, attempts };
}

/**
 * Profile cleanup is best effort after a successful browser smoke run. A lingering
 * Windows lock should be reported, but it must not turn a passed product test red.
 *
 * @param {string} directory
 * @param {{ warn?: (message: string) => void } & Parameters<typeof removeBrowserProfileDirectory>[1]} [options]
 */
export async function cleanupBrowserProfile(directory, options = {}) {
  const warn = options.warn ?? console.warn;
  try {
    return await removeBrowserProfileDirectory(directory, options);
  } catch (error) {
    const code = errorCode(error) || "UNKNOWN";
    warn(`Browser smoke profile cleanup was deferred (${code}): ${directory}`);
    return { removed: false, attempts: Math.max(1, options.attempts ?? 8) };
  }
}
