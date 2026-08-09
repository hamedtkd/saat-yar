export type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type OnboardingSessionStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export const ONBOARDING_PROGRESS_STORAGE_KEY = "saatyar-onboarding-step-v1";
export const ONBOARDING_REENTRY_STORAGE_KEY = "saatyar-onboarding-reentry-v1";
export const DEFAULT_ONBOARDING_STEP: OnboardingStep = 1;
export const REENTRY_ONBOARDING_STEP: OnboardingStep = 1;

export function normalizeOnboardingStep(value: unknown, fallback: OnboardingStep = DEFAULT_ONBOARDING_STEP): OnboardingStep {
  const numeric = typeof value === "number" ? value : Number(value);
  return numeric >= 1 && numeric <= 7 && Number.isInteger(numeric) ? numeric as OnboardingStep : fallback;
}

export function readOnboardingStep(storage: OnboardingSessionStorage): OnboardingStep {
  return normalizeOnboardingStep(storage.getItem(ONBOARDING_PROGRESS_STORAGE_KEY));
}

export function writeOnboardingStep(storage: OnboardingSessionStorage, step: number): OnboardingStep {
  const normalized = normalizeOnboardingStep(step);
  storage.setItem(ONBOARDING_PROGRESS_STORAGE_KEY, String(normalized));
  return normalized;
}

export function isOnboardingReentry(storage: OnboardingSessionStorage): boolean {
  return storage.getItem(ONBOARDING_REENTRY_STORAGE_KEY) === "1";
}

export function beginOnboardingReentry(storage: OnboardingSessionStorage): OnboardingStep {
  storage.setItem(ONBOARDING_REENTRY_STORAGE_KEY, "1");
  storage.setItem(ONBOARDING_PROGRESS_STORAGE_KEY, String(REENTRY_ONBOARDING_STEP));
  return REENTRY_ONBOARDING_STEP;
}

export function clearOnboardingSession(storage: OnboardingSessionStorage) {
  storage.removeItem(ONBOARDING_PROGRESS_STORAGE_KEY);
  storage.removeItem(ONBOARDING_REENTRY_STORAGE_KEY);
}
