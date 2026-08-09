"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  beginOnboardingReentry,
  clearOnboardingSession,
  DEFAULT_ONBOARDING_STEP,
  isOnboardingReentry,
  readOnboardingStep,
  type OnboardingStep,
  writeOnboardingStep,
} from "@/lib/onboarding-session";

const ONBOARDING_SESSION_EVENT = "saatyar:onboarding-session-change";
const SERVER_SNAPSHOT = `${DEFAULT_ONBOARDING_STEP}:0`;

function getSnapshot() {
  return `${readOnboardingStep(window.localStorage)}:${isOnboardingReentry(window.localStorage) ? 1 : 0}`;
}

function subscribe(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.storageArea === window.localStorage) listener();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(ONBOARDING_SESSION_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(ONBOARDING_SESSION_EVENT, listener);
  };
}

function publishSessionChange() {
  window.dispatchEvent(new Event(ONBOARDING_SESSION_EVENT));
}

export function useOnboardingSession(appReady: boolean) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => SERVER_SNAPSHOT);
  const [stepToken, reentryToken] = snapshot.split(":");
  const step = Number(stepToken) as OnboardingStep;
  const reentry = reentryToken === "1";

  const setStep = useCallback((value: number) => {
    writeOnboardingStep(window.localStorage, value);
    publishSessionChange();
  }, []);

  const startReentry = useCallback(() => {
    beginOnboardingReentry(window.localStorage);
    publishSessionChange();
  }, []);

  const finish = useCallback(() => {
    clearOnboardingSession(window.localStorage);
    publishSessionChange();
  }, []);

  return {
    onboardingStep: step,
    setOnboardingStep: setStep,
    onboardingSessionReady: appReady,
    onboardingReentry: reentry,
    startOnboardingReentry: startReentry,
    finishOnboardingSession: finish,
  };
}
