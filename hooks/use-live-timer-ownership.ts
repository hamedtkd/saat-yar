"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createTabId } from "@/lib/multi-tab-sync";
import {
  createLiveTimerLock, isOwnedByAnotherTab, LIVE_TIMER_CHANNEL, LIVE_TIMER_HEARTBEAT_MS,
  LIVE_TIMER_LOCK_KEY, parseLiveTimerLock,
} from "@/lib/live-timer-lock";

export function useLiveTimerOwnership(active: boolean) {
  const tabIdRef = useRef(createTabId());
  const channelRef = useRef<BroadcastChannel | null>(null);
  const [blocked, setBlocked] = useState(false);

  const refresh = useCallback(() => {
    const lock = parseLiveTimerLock(window.localStorage.getItem(LIVE_TIMER_LOCK_KEY));
    setBlocked(isOwnedByAnotherTab(lock, tabIdRef.current));
  }, []);

  const publish = useCallback(() => {
    const lock = createLiveTimerLock(tabIdRef.current);
    window.localStorage.setItem(LIVE_TIMER_LOCK_KEY, JSON.stringify(lock));
    channelRef.current?.postMessage(lock);
    setBlocked(false);
  }, []);

  const ensureOwnership = useCallback(() => {
    const lock = parseLiveTimerLock(window.localStorage.getItem(LIVE_TIMER_LOCK_KEY));
    if (isOwnedByAnotherTab(lock, tabIdRef.current)) {
      setBlocked(true);
      return false;
    }
    publish();
    return true;
  }, [publish]);

  const release = useCallback(() => {
    const lock = parseLiveTimerLock(window.localStorage.getItem(LIVE_TIMER_LOCK_KEY));
    if (lock?.tabId === tabIdRef.current) {
      window.localStorage.removeItem(LIVE_TIMER_LOCK_KEY);
      channelRef.current?.postMessage({ releasedBy: tabIdRef.current });
    }
    setBlocked(false);
  }, []);

  const takeOver = useCallback(() => {
    publish();
  }, [publish]);

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel(LIVE_TIMER_CHANNEL);
    channelRef.current = channel;
    channel.addEventListener("message", refresh);
    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [refresh]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === LIVE_TIMER_LOCK_KEY) refresh();
    };
    window.addEventListener("storage", handleStorage);
    refresh();
    return () => window.removeEventListener("storage", handleStorage);
  }, [refresh]);

  useEffect(() => {
    if (!active) {
      release();
      return;
    }
    if (blocked || !ensureOwnership()) return;
    const id = window.setInterval(publish, LIVE_TIMER_HEARTBEAT_MS);
    return () => window.clearInterval(id);
  }, [active, blocked, ensureOwnership, publish, release]);

  return { blocked, ensureOwnership, takeOver };
}
