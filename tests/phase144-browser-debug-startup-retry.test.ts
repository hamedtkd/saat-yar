import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  launchBrowserDebugTarget,
  summarizeBrowserStartupFailure,
} from "../scripts/browser-debug-startup.mjs";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("browser debug startup retries once with a fresh port and profile", async () => {
  const ports = [4111, 4222];
  const profiles = ["profile-a", "profile-b"];
  const spawned: Array<{ args: string[]; output: (chunk: string) => void }> = [];
  const terminated: string[] = [];
  const cleaned: string[] = [];
  const retries: string[] = [];
  let requestCount = 0;

  const runtime = {
    allocatePort: async () => ports.shift()!,
    createProfile: async () => profiles.shift()!,
    spawnBrowser: (_executable: string, args: string[], onStderr: (chunk: string) => void) => {
      spawned.push({ args, output: onStderr });
      return { pid: spawned.length, exitCode: null, signalCode: null };
    },
    requestJson: async (url: string) => {
      requestCount += 1;
      if (url.includes(":4111/")) {
        spawned[0]?.output("DevTools listening on ws://127.0.0.1:4111/devtools/browser/first\n");
        throw new Error("temporary endpoint race");
      }
      if (url.includes("/json/version")) return { Browser: "Fake" };
      return { webSocketDebuggerUrl: "ws://127.0.0.1:4222/devtools/page/second" };
    },
    terminateBrowser: async (child: { pid: number }) => { terminated.push(`pid-${child.pid}`); },
    cleanupProfile: async (profile: string) => { cleaned.push(profile); },
  };

  const session = await launchBrowserDebugTarget({
    executable: "fake-browser",
    profilePrefix: "phase144-",
    extraArgs: ["--disable-sync"],
    onRetry: ({ failure }: { failure: string }) => retries.push(failure),
  }, runtime as never);

  assert.equal(session.attempt, 2);
  assert.equal(session.debugPort, 4222);
  assert.equal(session.profileDir, "profile-b");
  assert.deepEqual(terminated, ["pid-1"]);
  assert.deepEqual(cleaned, ["profile-a"]);
  assert.equal(retries.length, 1);
  assert.match(retries[0]!, /DevTools listening on ws:\/\/127\.0\.0\.1:4111/);
  assert.ok(spawned[0]!.args.includes("--remote-debugging-port=4111"));
  assert.ok(spawned[1]!.args.includes("--remote-debugging-port=4222"));
  assert.ok(spawned[1]!.args.includes("--user-data-dir=profile-b"));
  assert.ok(spawned[1]!.args.includes("--disable-sync"));
  assert.ok(requestCount >= 3);

  await session.close();
  await session.close();
  assert.deepEqual(terminated, ["pid-1", "pid-2"]);
  assert.deepEqual(cleaned, ["profile-a", "profile-b"]);
});

test("startup diagnostics retain the DevTools websocket evidence", () => {
  const summary = summarizeBrowserStartupFailure(
    new Error("Browser debugging endpoint did not become ready"),
    "noise\nDevTools listening on ws://127.0.0.1:4045/devtools/browser/example\nmore noise",
  );
  assert.match(summary, /Browser debugging endpoint did not become ready/);
  assert.match(summary, /DevTools listening on ws:\/\/127\.0\.0\.1:4045/);
});

test("freelancer and employee release journeys share the retrying startup helper", async () => {
  const freelancer = await read("scripts/freelancer-browser-ux-smoke.mjs");
  const employee = await read("scripts/employee-browser-ux-smoke.mjs");
  for (const source of [freelancer, employee]) {
    assert.match(source, /launchBrowserDebugTarget/);
    assert.match(source, /browserSession\.target\.webSocketDebuggerUrl/);
    assert.match(source, /await browserSession\?\.close\(\)/);
    assert.doesNotMatch(source, /async function waitForJson/);
    assert.doesNotMatch(source, /async function freePort/);
  }
});

test("phase 144 hardens the gate before the 2.3.0 release candidate", async () => {
  const pkg = JSON.parse(await read("package.json"));
  const roadmap = await read("docs/roadmap/BACKLOG_FA.md");
  const notes = await read("docs/phases/PHASE_144_NOTES_FA.md");
  assert.match(pkg.scripts.test, /phase144-browser-debug-startup-retry\.test\.ts/);
  assert.match(roadmap, /\[x\] فاز ۱۴۴: مقاوم‌سازی startup مرورگر/);
  assert.match(roadmap, /آماده‌سازی Release Candidate نسخه 2\.3\.0/);
  assert.match(roadmap, /نهایی‌سازی Release 2\.3\.0/);
  assert.match(notes, /Schema.*v17/);
  assert.match(notes, /Dependency جدید: ندارد/);
});
