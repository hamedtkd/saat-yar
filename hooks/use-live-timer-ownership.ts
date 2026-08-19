"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import { createTabId } from "@/lib/multi-tab-sync";
import {
  createLiveTimerLock, describeTimerDevice, isOwnedByAnotherTab, LIVE_TIMER_CHANNEL,
  LIVE_TIMER_HEARTBEAT_MS, LIVE_TIMER_LOCK_KEY, parseLiveTimerLock, releaseOwnedLiveTimerLock, type LiveTimerLock,
} from "@/lib/live-timer-lock";

export function useLiveTimerOwnership(active: boolean) {
  const { locale } = useLocale();
  const tabIdRef = useRef(createTabId());
  const channelRef = useRef<BroadcastChannel | null>(null);
  const [owner, setOwner] = useState<LiveTimerLock | null>(null);
  const blocked = active && Boolean(owner);

  const refresh = useCallback(() => {
    const lock = parseLiveTimerLock(window.localStorage.getItem(LIVE_TIMER_LOCK_KEY));
    setOwner(isOwnedByAnotherTab(lock, tabIdRef.current) ? lock : null);
  }, []);

  const publish = useCallback(() => {
    const deviceName = describeTimerDevice(window.navigator.userAgent, window.navigator.platform, locale);
    const lock = createLiveTimerLock(tabIdRef.current, new Date(), deviceName);
    window.localStorage.setItem(LIVE_TIMER_LOCK_KEY, JSON.stringify(lock));
    channelRef.current?.postMessage(lock);
    setOwner(null);
  }, [locale]);

  const ensureOwnership = useCallback(() => {
    const lock = parseLiveTimerLock(window.localStorage.getItem(LIVE_TIMER_LOCK_KEY));
    if (isOwnedByAnotherTab(lock, tabIdRef.current)) {
      setOwner(lock);
      return false;
    }
    publish();
    return true;
  }, [publish]);

  const releaseLock = useCallback(() => {
    if (!releaseOwnedLiveTimerLock(window.localStorage, tabIdRef.current)) return;
    channelRef.current?.postMessage({ releasedBy: tabIdRef.current });
  }, []);

  const takeOver = useCallback(() => publish(), [publish]);

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel(LIVE_TIMER_CHANNEL);
    channelRef.current = channel;
    channel.addEventListener("message", refresh);
    return () => { channel.close(); channelRef.current = null; };
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
    const handlePageHide = () => releaseLock();
    const handlePageShow = () => {
      if (active) ensureOwnership();
      else refresh();
    };
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [active, ensureOwnership, refresh, releaseLock]);

  useEffect(() => {
    if (!active) {
      releaseLock();
      return;
    }
    if (blocked || !ensureOwnership()) return;
    const id = window.setInterval(publish, LIVE_TIMER_HEARTBEAT_MS);
    return () => window.clearInterval(id);
  }, [active, blocked, ensureOwnership, publish, releaseLock]);

  return { blocked, owner, ensureOwnership, takeOver };
}
