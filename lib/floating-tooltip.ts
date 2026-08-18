export type FloatingRect = { left: number; top: number; width: number; height: number };
export type FloatingViewport = { width: number; height: number };

export function getFloatingTooltipPosition(
  anchor: FloatingRect,
  tooltip: Pick<FloatingRect, "width" | "height">,
  viewport: FloatingViewport,
  options: { gutter?: number; edge?: number } = {},
) {
  const gutter = options.gutter ?? 8;
  const edge = options.edge ?? 12;
  const maxLeft = Math.max(edge, viewport.width - tooltip.width - edge);
  const centeredLeft = anchor.left + anchor.width / 2 - tooltip.width / 2;
  const left = Math.min(Math.max(centeredLeft, edge), maxLeft);
  const fitsAbove = anchor.top >= tooltip.height + gutter + edge;
  const preferredTop = fitsAbove ? anchor.top - tooltip.height - gutter : anchor.top + anchor.height + gutter;
  const maxTop = Math.max(edge, viewport.height - tooltip.height - edge);
  const top = Math.min(Math.max(preferredTop, edge), maxTop);
  return { left, top, side: fitsAbove ? "top" as const : "bottom" as const };
}
