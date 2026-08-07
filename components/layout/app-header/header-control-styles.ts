export const headerControlShell = [
  "h-11 rounded-[14px] border border-[var(--dashboard-border)]",
  "bg-[var(--surface-1)] text-[var(--text)] shadow-none",
  "transition-[border-color,background-color,box-shadow] duration-150",
  "hover:border-[color-mix(in_srgb,var(--accent)_30%,var(--dashboard-border))] hover:bg-[var(--surface-2)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]",
].join(" ");

export const headerIconButton = [
  "size-9 rounded-[10px] border-0 bg-transparent p-0 shadow-none",
  "hover:bg-[var(--accent-soft)] hover:text-[var(--accent-strong)]",
].join(" ");
