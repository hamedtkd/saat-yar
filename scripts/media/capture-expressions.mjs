export const FRESH_ONBOARDING_READY_EXPRESSION = `(() => {
  const path = location.pathname.endsWith("/") && location.pathname !== "/"
    ? location.pathname.slice(0, -1)
    : location.pathname;
  return path === "/onboarding" && document.querySelector("[data-onboarding-step-index]") !== null;
})()`;
