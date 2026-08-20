"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  GITHUB_REPOSITORY_API_URL,
  GITHUB_STAR_CACHE_KEY,
  isGitHubStarCacheFresh,
  parseGitHubStarCache,
  parseGitHubStarCount,
  serializeGitHubStarCache,
} from "@/lib/github-stars";

const STAR_CACHE_EVENT = "saatyar:github-star-count";
let memoryCount: number | null = null;

function readCache() {
  if (typeof window === "undefined") return null;
  try {
    return parseGitHubStarCache(window.localStorage.getItem(GITHUB_STAR_CACHE_KEY));
  } catch {
    return null;
  }
}

function getSnapshot() {
  return readCache()?.count ?? memoryCount;
}

function getServerSnapshot() {
  return null;
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  const onStorage = (event: StorageEvent) => {
    if (event.key === GITHUB_STAR_CACHE_KEY) onStoreChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(STAR_CACHE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(STAR_CACHE_EVENT, onStoreChange);
  };
}

function writeCache(count: number) {
  memoryCount = count;
  try {
    window.localStorage.setItem(GITHUB_STAR_CACHE_KEY, serializeGitHubStarCache(count));
  } catch {
    // The in-memory value still lets this session show the fetched count.
  }
  window.dispatchEvent(new Event(STAR_CACHE_EVENT));
}

export function useGitHubStarCount(online: boolean) {
  const count = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (!online || typeof window === "undefined") return;
    if (isGitHubStarCacheFresh(readCache())) return;

    const controller = new AbortController();
    void fetch(GITHUB_REPOSITORY_API_URL, {
      signal: controller.signal,
      cache: "no-store",
      headers: { Accept: "application/vnd.github+json" },
    })
      .then((response) => {
        if (!response.ok) throw new Error(`GitHub repository request failed: ${response.status}`);
        return response.json() as Promise<unknown>;
      })
      .then((payload) => {
        const nextCount = parseGitHubStarCount(payload);
        if (nextCount !== null) writeCache(nextCount);
      })
      .catch(() => {
        // Offline, CORS, GitHub rate-limit and local-development failures are non-blocking.
      });

    return () => controller.abort();
  }, [online]);

  return count;
}
