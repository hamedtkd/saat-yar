export type AutoStartBrowser = "edge" | "chrome" | "other";

export function detectAutoStartBrowser(userAgent: string): AutoStartBrowser {
  if (/Edg\//i.test(userAgent)) return "edge";
  if (/(Chrome|Chromium)\//i.test(userAgent) && !/(OPR|Edg)\//i.test(userAgent)) return "chrome";
  return "other";
}

export function getAutoStartSetup(userAgent: string) {
  const browser = detectAutoStartBrowser(userAgent);
  if (browser === "edge") {
    return { browser, internalUrl: "edge://apps", actionLabel: "Auto-start on device login" } as const;
  }
  if (browser === "chrome") {
    return { browser, internalUrl: "chrome://apps", actionLabel: "Launch at startup" } as const;
  }
  return { browser, internalUrl: "about://apps", actionLabel: "Start app when you sign in" } as const;
}
