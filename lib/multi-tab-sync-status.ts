export type MultiTabSyncStatus = {
  supported: boolean;
  currentTabId: string | null;
  sourceTabId: string | null;
  savedAt: string | null;
  receivedAt: string | null;
  pending: boolean;
};

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
