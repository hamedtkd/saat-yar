export const PICKER_MOBILE_BREAKPOINT = 800;
export const PICKER_MOBILE_QUERY = `(max-width: ${PICKER_MOBILE_BREAKPOINT - 1}px)`;

export type PickerPresentation = "popover" | "drawer";
export type PickerPresentationPreference = PickerPresentation | "auto";

export function resolvePickerPresentation(viewportWidth: number): PickerPresentation {
  return viewportWidth < PICKER_MOBILE_BREAKPOINT ? "drawer" : "popover";
}

export function resolvePickerPresentationPreference(
  preference: PickerPresentationPreference,
  viewportWidth: number,
): PickerPresentation {
  return preference === "auto" ? resolvePickerPresentation(viewportWidth) : preference;
}
