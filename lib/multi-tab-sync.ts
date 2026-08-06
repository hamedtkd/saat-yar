export const APP_SYNC_CHANNEL = "saatyar:app-sync";

export type AppSyncMessage = {
  type: "data-saved";
  tabId: string;
  savedAt: string;
};

export function createTabId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createDataSavedMessage(tabId: string, now = new Date()): AppSyncMessage {
  return { type: "data-saved", tabId, savedAt: now.toISOString() };
}

export function isAppSyncMessage(value: unknown): value is AppSyncMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Partial<AppSyncMessage>;
  return message.type === "data-saved"
    && typeof message.tabId === "string"
    && Number.isFinite(new Date(message.savedAt ?? "").getTime());
}
