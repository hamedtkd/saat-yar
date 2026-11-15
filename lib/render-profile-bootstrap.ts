/**
 * Set a lightweight paint profile before the first body render on resource-limited
 * Android devices. Hardware hints are coarse: unknown devices remain full quality.
 * URL overrides provide a recovery path without touching IndexedDB work records.
 *
 * Explicit overrides: ?render=lite, ?render=full and ?render=auto.
 * This snippet is included in the already-reviewed ThemeBootstrap inline script.
 */
export const renderProfileBootstrapScript = String.raw`(function () {
  var key = "saatyar.render-profile.v1";
  var requested = null;
  try { requested = new URLSearchParams(window.location.search).get("render"); } catch (_) {}
  var forced = null;
  try {
    if (requested === "lite" || requested === "full") {
      forced = requested;
      localStorage.setItem(key, requested);
    } else if (requested === "auto") {
      localStorage.removeItem(key);
    } else {
      forced = localStorage.getItem(key);
    }
  } catch (_) {
    if (requested === "lite" || requested === "full") forced = requested;
  }
  var android = /Android/i.test(navigator.userAgent || "");
  var memory = navigator.deviceMemory;
  var cores = navigator.hardwareConcurrency;
  var hasMemory = typeof memory === "number" && Number.isFinite(memory) && memory > 0;
  var hasCores = typeof cores === "number" && Number.isFinite(cores) && cores > 0;
  var constrained = android && (
    (hasMemory && memory <= 2) ||
    (hasCores && cores <= 2) ||
    (hasMemory && hasCores && memory <= 4 && cores <= 4)
  );
  var manual = forced === "lite" || forced === "full";
  document.documentElement.dataset.renderProfile = manual ? forced : constrained ? "lite" : "full";
  document.documentElement.dataset.renderProfileSource = manual ? "manual" : "auto";
})();`;
