const pathNormalizerSource = `
    const normalize = (value) => {
      let candidate;
      try {
        candidate = new URL(value || "/", location.href).pathname || "/";
      } catch {
        candidate = String(value || "/");
      }
      while (candidate.length > 1 && candidate.endsWith("/")) {
        candidate = candidate.slice(0, -1);
      }
      return candidate || "/";
    };
`;

export function buildAppNavigationExpression(pathname) {
  return `(() => {
    const wanted = ${JSON.stringify(pathname)};
${pathNormalizerSource}
    const wantedPath = normalize(wanted);
    const anchors = [...document.querySelectorAll('a[href]')];
    const labels = { "/projects": "پروژه‌ها", "/invoices": "فاکتورها", "/clients": "مشتری‌ها" };
    const normalizeText = (value) => (value || "").replace(/\\s+/g, " ").trim();
    let anchor = anchors.find((item) => {
      const candidate = normalize(item.href);
      return candidate === wantedPath || (wantedPath !== "/" && candidate.endsWith(wantedPath));
    });
    if (!anchor && labels[wantedPath]) {
      anchor = anchors.find((item) => normalizeText(item.textContent).includes(labels[wantedPath]));
    }
    if (!anchor) {
      return {
        clicked: false,
        available: anchors.slice(0, 24).map((item) => ({
          href: item.getAttribute("href") || "",
          pathname: normalize(item.href),
          text: normalizeText(item.textContent).slice(0, 80),
        })),
      };
    }
    const href = anchor.getAttribute("href") || anchor.href;
    const label = normalizeText(anchor.textContent).slice(0, 80);
    anchor.click();
    return { clicked: true, href, label };
  })()`;
}

export function buildRouteReadyExpression(pathname) {
  return `(() => {
${pathNormalizerSource}
    const current = normalize(location.pathname);
    const wanted = normalize(${JSON.stringify(pathname)});
    return current === wanted || (wanted !== "/" && current.endsWith(wanted));
  })()`;
}
