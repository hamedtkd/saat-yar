import { createServer } from "node:http";
import { stat, readFile } from "node:fs/promises";
import { extname, join, relative, resolve, sep } from "node:path";

const MIME_TYPES = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
  [".xml", "application/xml; charset=utf-8"],
]);

/** @param {string} root @param {string} candidate */
function isInside(root, candidate) {
  const pathFromRoot = relative(root, candidate);
  return pathFromRoot === "" || (!pathFromRoot.startsWith(`..${sep}`) && pathFromRoot !== "..");
}

/**
 * Return the possible files for a static-export request in priority order.
 * @param {string} requestUrl
 * @param {string} outputDirectory
 * @returns {string[]}
 */
export function staticExportFileCandidates(requestUrl, outputDirectory) {
  const root = resolve(outputDirectory);
  const url = new URL(requestUrl, "http://127.0.0.1");
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    return [];
  }

  const relativePath = pathname.replace(/^\/+/, "");
  const direct = resolve(root, relativePath || "index.html");
  if (!isInside(root, direct)) return [];

  if (!relativePath) return [direct];
  if (pathname.endsWith("/")) return [resolve(direct, "index.html")];
  if (extname(direct)) return [direct];
  return [direct, resolve(direct, "index.html"), `${direct}.html`];
}

/** @param {string} path */
async function isFile(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

/**
 * @param {string} requestUrl
 * @param {string} outputDirectory
 * @returns {Promise<{ filePath: string; statusCode: number } | null>}
 */
export async function resolveStaticExportRequest(requestUrl, outputDirectory) {
  for (const filePath of staticExportFileCandidates(requestUrl, outputDirectory)) {
    if (await isFile(filePath)) return { filePath, statusCode: 200 };
  }

  const notFound = resolve(outputDirectory, "404.html");
  if (await isFile(notFound)) return { filePath: notFound, statusCode: 404 };
  return null;
}

/** @param {string} filePath */
function contentType(filePath) {
  return MIME_TYPES.get(extname(filePath).toLowerCase()) ?? "application/octet-stream";
}

/** @param {string} requestUrl */
function cacheControl(requestUrl) {
  return requestUrl.includes("/_next/static/")
    ? "public, max-age=31536000, immutable"
    : "no-store";
}

/**
 * Start a dependency-free HTTP server for a Next.js `output: export` directory.
 * @param {{ outputDirectory: string; host?: string; port?: number }} options
 */
export async function startStaticExportServer({ outputDirectory, host = "127.0.0.1", port = 0 }) {
  const root = resolve(outputDirectory);
  const server = createServer(async (request, response) => {
    const requestUrl = request.url ?? "/";
    try {
      const resolved = await resolveStaticExportRequest(requestUrl, root);
      if (!resolved) {
        response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        response.end("Not found");
        return;
      }

      const body = request.method === "HEAD" ? null : await readFile(resolved.filePath);
      response.writeHead(resolved.statusCode, {
        "cache-control": cacheControl(requestUrl),
        "content-type": contentType(resolved.filePath),
      });
      response.end(body);
    } catch (error) {
      response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      response.end(error instanceof Error ? error.message : "Static server error");
    }
  });

  await new Promise((resolveListen, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => resolveListen());
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    server.close();
    throw new Error("Static export server did not expose a TCP port.");
  }

  return {
    origin: `http://${host}:${address.port}`,
    close: () => new Promise((resolveClose, reject) => {
      server.close((error) => error ? reject(error) : resolveClose());
    }),
  };
}
