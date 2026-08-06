export type SyncEventKind = "loaded" | "deferred";

export type SyncEvent = {
  kind: SyncEventKind;
  sourceTabId: string;
  savedAt: string;
  receivedAt: string;
};

export type MultiTabSyncStatus = {
  supported: boolean;
  currentTabId: string | null;
  sourceTabId: string | null;
  savedAt: string | null;
  receivedAt: string | null;
  pending: boolean;
  events: SyncEvent[];
};

export function createInitialSyncStatus(): MultiTabSyncStatus {
  return {
    supported: false,
    currentTabId: null,
    sourceTabId: null,
    savedAt: null,
    receivedAt: null,
    pending: false,
    events: [],
  };
}

export function addSyncEvent(status: MultiTabSyncStatus, event: SyncEvent): MultiTabSyncStatus {
  return {
    ...status,
    sourceTabId: event.sourceTabId,
    savedAt: event.savedAt,
    receivedAt: event.receivedAt,
    pending: event.kind === "deferred",
    events: [event, ...status.events].slice(0, 5),
  };
}

export function clearSyncHistory(status: MultiTabSyncStatus): MultiTabSyncStatus {
  return {
    ...status,
    sourceTabId: null,
    savedAt: null,
    receivedAt: null,
    pending: false,
    events: [],
  };
}

export function shortTabId(tabId: string | null) {
  if (!tabId) return "نامشخص";
  const compact = tabId.replace(/^tab-/, "");
  return compact.length <= 10 ? compact : `${compact.slice(0, 6)}…${compact.slice(-4)}`;
}

export function formatSyncTime(value: string | null) {
  if (!value) return "هنوز تغییری دریافت نشده";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "زمان نامعتبر";
  return new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}
