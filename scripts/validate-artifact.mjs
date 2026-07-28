import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { pathToFileURL, fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workerPath = path.join(root, "dist", "server", "index.js");
const hostingPath = path.join(root, "dist", ".openai", "hosting.json");

await access(workerPath, constants.R_OK).catch(() => {
  throw new Error("فایل dist/server/index.js ساخته نشده است.");
});
await access(hostingPath, constants.R_OK).catch(() => {
  throw new Error("فایل dist/.openai/hosting.json ساخته نشده است.");
});

JSON.parse(await readFile(hostingPath, "utf8"));
const workerUrl = pathToFileURL(workerPath);
workerUrl.searchParams.set("sites-validation", `${process.pid}-${Date.now()}`);
const worker = await import(workerUrl.href);

if (!worker.default || typeof worker.default.fetch !== "function") {
  throw new Error("خروجی Sites باید default.fetch قابل اجرا داشته باشد.");
}

console.log("Sites artifact validated successfully.");
