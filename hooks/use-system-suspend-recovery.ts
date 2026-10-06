"use client";

import { useCallback, useEffect, useRef } from "react";
import { getBrowserLocale } from "@/lib/i18n";
import { translateSystem } from "@/lib/i18n/system";
import type { AppData } from "@/lib/types";
import type { ProjectTimerSession } from "@/lib/project-timer-session";
import { useRuntimePreferences } from "./use-runtime-preferences";
import {
  SYSTEM_SUSPEND_HIDDEN_STALE_MS,
  SYSTEM_SUSPEND_HEARTBEAT_KEY,
  SYSTEM_SUSPEND_TICK_MS,
  createSystemSuspendHeartbeat,
  detectSystemSuspend,
  parseSystemSuspendHeartbeat,
  recoverSystemSuspend,
  shouldRetainFailedRecoveryHeartbeat,
  shouldPreserveSuspendHeartbeat,
  type SuspendTick,
} from "@/lib/system-suspend";

type Props = {
  ready: boolean;
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  projectTimerSession: ProjectTimerSession | null;
  setProjectTimerSession: (session: ProjectTimerSession | null) => void;
  persistImmediately: (value: AppData) => Promise<boolean>;
  setToast: (message: string) => void;
};

function getTick(heartbeatAgeMs?: number): SuspendTick {
  return {
    wallMs: Date.now(),
    monotonicMs: typeof performance === "undefined" ? Date.now() : performance.now(),
    visible: document.visibilityState === "visible",
    heartbeatAgeMs,
  };
}

export function useSystemSuspendRecovery({
  ready,
  data,
  setData,
  projectTimerSession,
  setProjectTimerSession,
  persistImmediately,
  setToast,
}: Props) {
  const { value: runtimePreferences } = useRuntimePreferences();
  const dataRef = useRef(data);
  const sessionRef = useRef(projectTimerSession);
  const lastTickRef = useRef<SuspendTick | null>(null);
  const recoveringRef = useRef(false);
  const failedRecoverySnapshotRef = useRef<{ data: AppData; session: ProjectTimerSession | null } | null>(null);

  useEffect(() => { dataRef.current = data; }, [data]);
  useEffect(() => { sessionRef.current = projectTimerSession; }, [projectTimerSession]);

  const writeHeartbeat = useCallback((now = new Date()) => {
    if (recoveringRef.current) return parseSystemSuspendHeartbeat(window.localStorage.getItem(SYSTEM_SUSPEND_HEARTBEAT_KEY));
    if (shouldRetainFailedRecoveryHeartbeat(failedRecoverySnapshotRef.current, dataRef.current, sessionRef.current)) {
      return parseSystemSuspendHeartbeat(window.localStorage.getItem(SYSTEM_SUSPEND_HEARTBEAT_KEY));
    }
    failedRecoverySnapshotRef.current = null;
    const heartbeat = createSystemSuspendHeartbeat(dataRef.current, sessionRef.current, now);
    if (heartbeat) window.localStorage.setItem(SYSTEM_SUSPEND_HEARTBEAT_KEY, JSON.stringify(heartbeat));
    else window.localStorage.removeItem(SYSTEM_SUSPEND_HEARTBEAT_KEY);
    return heartbeat;
  }, []);

  const recover = useCallback(async (heartbeatOverride?: ReturnType<typeof parseSystemSuspendHeartbeat>) => {
    if (!runtimePreferences.pauseTimersOnSystemSuspend || recoveringRef.current) return false;
    const heartbeat = heartbeatOverride ?? parseSystemSuspendHeartbeat(window.localStorage.getItem(SYSTEM_SUSPEND_HEARTBEAT_KEY));
    if (!heartbeat) return false;
    recoveringRef.current = true;
    try {
      const outcome = await recoverSystemSuspend({
        enabled: runtimePreferences.pauseTimersOnSystemSuspend,
        data: dataRef.current,
        session: sessionRef.current,
        heartbeat,
        applyLocal: (nextData, nextSession) => {
          dataRef.current = nextData;
          sessionRef.current = nextSession;
          setData(nextData);
          setProjectTimerSession(nextSession);
        },
        persist: persistImmediately,
      });
      if (outcome === "saved") {
        failedRecoverySnapshotRef.current = null;
        window.localStorage.removeItem(SYSTEM_SUSPEND_HEARTBEAT_KEY);
        setToast(translateSystem(getBrowserLocale(), "System sleep or hibernation was detected; active timers were paused at the last saved activity."));
        return true;
      }
      if (outcome === "save-failed") {
        failedRecoverySnapshotRef.current = { data: dataRef.current, session: sessionRef.current };
        setToast(translateSystem(getBrowserLocale(), "Your local changes are still available but could not be saved."));
      }
      return false;
    } finally {
      recoveringRef.current = false;
    }
  }, [persistImmediately, runtimePreferences.pauseTimersOnSystemSuspend, setData, setProjectTimerSession, setToast]);

  useEffect(() => {
    if (!ready) return;
    if (!runtimePreferences.pauseTimersOnSystemSuspend) {
      failedRecoverySnapshotRef.current = null;
      window.localStorage.removeItem(SYSTEM_SUSPEND_HEARTBEAT_KEY);
      lastTickRef.current = null;
      return;
    }

    const previousHeartbeat = parseSystemSuspendHeartbeat(window.localStorage.getItem(SYSTEM_SUSPEND_HEARTBEAT_KEY));
    if (previousHeartbeat) {
      const age = Date.now() - new Date(previousHeartbeat.seenAt).getTime();
      if (age >= SYSTEM_SUSPEND_HIDDEN_STALE_MS) void recover(previousHeartbeat);
    }

    lastTickRef.current = getTick();
    writeHeartbeat();

    const inspectGap = () => {
      const heartbeat = parseSystemSuspendHeartbeat(window.localStorage.getItem(SYSTEM_SUSPEND_HEARTBEAT_KEY));
      const heartbeatAgeMs = heartbeat ? Date.now() - new Date(heartbeat.seenAt).getTime() : undefined;
      const next = getTick(heartbeatAgeMs);
      const previous = lastTickRef.current;
      if (previous && shouldPreserveSuspendHeartbeat(previous, next)) return;
      if (previous && detectSystemSuspend(previous, next)) {
        void recover(heartbeat ?? undefined);
      }
      lastTickRef.current = next;
      writeHeartbeat();
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        lastTickRef.current = { ...getTick(), visible: false };
        writeHeartbeat();
        return;
      }
      inspectGap();
    };
    const onFreeze = () => writeHeartbeat();
    const onPageHide = () => writeHeartbeat();

    const id = window.setInterval(inspectGap, SYSTEM_SUSPEND_TICK_MS);
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("freeze", onFreeze);
    document.addEventListener("resume", inspectGap);
    window.addEventListener("focus", inspectGap);
    window.addEventListener("pageshow", inspectGap);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("freeze", onFreeze);
      document.removeEventListener("resume", inspectGap);
      window.removeEventListener("focus", inspectGap);
      window.removeEventListener("pageshow", inspectGap);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [ready, recover, runtimePreferences.pauseTimersOnSystemSuspend, writeHeartbeat]);
}
