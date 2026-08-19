export const WHEEL_ITEM_HEIGHT = 44;

export function clampWheelIndex(index: number, optionCount: number) {
  if (optionCount <= 0) return 0;
  return Math.min(optionCount - 1, Math.max(0, index));
}

export function wheelIndexFromScroll(scrollTop: number, optionCount: number) {
  return clampWheelIndex(Math.round(scrollTop / WHEEL_ITEM_HEIGHT), optionCount);
}

export function createPaddedNumberOptions(count: number) {
  return Array.from({ length: count }, (_, value) => String(value).padStart(2, "0"));
}

export function wheelScrollTopFromPointerDrag(startScrollTop: number, startY: number, currentY: number) {
  return Math.max(0, startScrollTop - (currentY - startY));
}
