"use client";

import { useCallback, useEffect, useRef } from "react";
import { getBrowserLocale } from "@/lib/i18n";
import { translateSystem } from "@/lib/i18n/system";
import type { AppData } from "@/lib/types";
import type { ProjectTimerSession } from "@/lib/project-timer-session";
import { useRuntimePreferences } from "./use-runtime-preferences";
import {
  SYSTEM_SUSPEND_FREEZE_ARM_MS,
  SYSTEM_SUSPEND_GAP_MS,
  SYSTEM_SUSPEND_HEARTBEAT_KEY,
  SYSTEM_SUSPEND_TICK_MS,
  applySystemSuspendRecovery,
  createSystemSuspendHeartbeat,
  detectSystemSuspend,
  parseSystemSuspendHeartbeat,
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

function getTick(): SuspendTick {
  return {
    wallMs: Date.now(),
    monotonicMs: typeof performance === "undefined" ? Date.now() : performance.now(),
    visible: document.visibilityState === "visible",
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
  const hiddenAtRef = useRef<number | null>(null);
  const freezeCandidateRef = useRef(false);
  const recoveringRef = useRef(false);

  useEffect(() => { dataRef.current = data; }, [data]);
  useEffect(() => { sessionRef.current = projectTimerSession; }, [projectTimerSession]);

  const writeHeartbeat = useCallback((now = new Date()) => {
    const heartbeat = createSystemSuspendHeartbeat(dataRef.current, sessionRef.current, now);
    if (heartbeat) window.localStorage.setItem(SYSTEM_SUSPEND_HEARTBEAT_KEY, JSON.stringify(heartbeat));
    else window.localStorage.removeItem(SYSTEM_SUSPEND_HEARTBEAT_KEY);
    return heartbeat;
  }, []);

  const recover = useCallback(async (heartbeatOverride?: ReturnType<typeof parseSystemSuspendHeartbeat>) => {
    if (!runtimePreferences.pauseTimersOnSystemSuspend || recoveringRef.current) return false;
    const heartbeat = heartbeatOverride ?? parseSystemSuspendHeartbeat(window.localStorage.getItem(SYSTEM_SUSPEND_HEARTBEAT_KEY));
    if (!heartbeat) return false;
    const result = applySystemSuspendRecovery(dataRef.current, sessionRef.current, heartbeat);
    if (!result.changed) return false;

    recoveringRef.current = true;
    try {
      dataRef.current = result.data;
      sessionRef.current = result.session;
      setData(result.data);
      setProjectTimerSession(result.session);
      window.localStorage.removeItem(SYSTEM_SUSPEND_HEARTBEAT_KEY);
      await persistImmediately(result.data);
      setToast(translateSystem(getBrowserLocale(), "System sleep or hibernation was detected; active timers were paused at the last saved activity."));
      return true;
    } finally {
      recoveringRef.current = false;
    }
  }, [persistImmediately, runtimePreferences.pauseTimersOnSystemSuspend, setData, setProjectTimerSession, setToast]);

  useEffect(() => {
    if (!ready) return;
    if (!runtimePreferences.pauseTimersOnSystemSuspend) {
      window.localStorage.removeItem(SYSTEM_SUSPEND_HEARTBEAT_KEY);
      lastTickRef.current = null;
      hiddenAtRef.current = null;
      freezeCandidateRef.current = false;
      return;
    }

    const previousHeartbeat = parseSystemSuspendHeartbeat(window.localStorage.getItem(SYSTEM_SUSPEND_HEARTBEAT_KEY));
    if (previousHeartbeat) {
      const age = Date.now() - new Date(previousHeartbeat.seenAt).getTime();
      if (age >= SYSTEM_SUSPEND_GAP_MS) void recover(previousHeartbeat);
    }

    lastTickRef.current = getTick();
    writeHeartbeat();

    const inspectGap = () => {
      const next = getTick();
      const previous = lastTickRef.current;
      if (previous && detectSystemSuspend(previous, next, freezeCandidateRef.current)) {
        void recover();
      }
      freezeCandidateRef.current = false;
      lastTickRef.current = next;
      writeHeartbeat();
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenAtRef.current = Date.now();
        lastTickRef.current = { ...getTick(), visible: false };
        writeHeartbeat();
        return;
      }
      inspectGap();
      hiddenAtRef.current = null;
    };

    const onFreeze = () => {
      const hiddenAt = hiddenAtRef.current;
      if (hiddenAt !== null && Date.now() - hiddenAt <= SYSTEM_SUSPEND_FREEZE_ARM_MS) freezeCandidateRef.current = true;
      writeHeartbeat();
    };
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
