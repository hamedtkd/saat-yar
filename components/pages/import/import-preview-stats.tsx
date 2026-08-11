import { useSystemUi } from "@/components/i18n/use-system-ui";
import { StatusBadge } from "@/components/common/status-badge";
export function ImportPreviewStats({ ready, conflicts, invalid }: { ready: number; conflicts: number; invalid: number }) {
  const { s, number } = useSystemUi();
  return <div className="flex flex-wrap gap-2" data-import-preview><StatusBadge tone="success">{number(ready)} {s("Ready to import")}</StatusBadge><StatusBadge tone={conflicts ? "warning" : "neutral"}>{number(conflicts)} {s("Conflicts")}</StatusBadge><StatusBadge tone={invalid ? "danger" : "neutral"}>{number(invalid)} {s("Invalid rows")}</StatusBadge></div>;
}
