export const headerControlShell = [
  "h-[var(--control-height)] rounded-[var(--control-radius)] border border-[var(--dashboard-border)]",
  "bg-[var(--surface-1)] text-[var(--text)] shadow-none",
  "transition-[border-color,background-color,box-shadow] duration-150",
  "hover:border-[color-mix(in_srgb,var(--accent)_30%,var(--dashboard-border))] hover:bg-[var(--surface-2)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]",
].join(" ");

export const headerIconButton = [
  "h-[var(--control-height-sm)] w-[var(--control-height-sm)] rounded-[var(--control-radius)] border-0 bg-transparent p-0 shadow-none",
  "hover:bg-[var(--accent-soft)] hover:text-[var(--accent-strong)]",
].join(" ");

export const headerStandaloneIconButton = [
  headerControlShell,
  "h-[var(--control-height)] w-[var(--control-height)] min-w-[var(--control-height)] justify-center px-0 py-0",
  "hover:bg-[var(--accent-soft)] hover:text-[var(--accent-strong)]",
].join(" ");
