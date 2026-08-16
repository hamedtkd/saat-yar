export const APP_SYNC_CHANNEL = "saatyar:app-sync";

export type SyncChangeKind = "attendance" | "settings" | "business" | "reporting" | "general";

export type AppSyncMessage = {
  type: "data-saved";
  tabId: string;
  savedAt: string;
  sourcePath: string;
  changeKind: SyncChangeKind;
};

export function createTabId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getSyncChangeKind(path: string): SyncChangeKind {
  if (path === "/today" || path === "/month" || path === "/leave") return "attendance";
  if (path === "/settings" || path.startsWith("/settings/")) return "settings";
  if (path === "/clients" || path === "/projects" || path === "/invoices") return "business";
  if (path === "/reports") return "reporting";
  return "general";
}

export function createDataSavedMessage(tabId: string, now = new Date(), sourcePath = "/"): AppSyncMessage {
  return { type: "data-saved", tabId, savedAt: now.toISOString(), sourcePath, changeKind: getSyncChangeKind(sourcePath) };
}

export function isAppSyncMessage(value: unknown): value is AppSyncMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Partial<AppSyncMessage>;
  return message.type === "data-saved"
    && typeof message.tabId === "string"
    && typeof message.sourcePath === "string"
    && message.sourcePath.startsWith("/")
    && ["attendance", "settings", "business", "reporting", "general"].includes(message.changeKind ?? "")
    && Number.isFinite(new Date(message.savedAt ?? "").getTime());
}
