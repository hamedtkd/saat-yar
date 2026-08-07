import { spawn } from "node:child_process";
import { mkdtemp } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { cleanupBrowserProfile } from "./browser-profile-cleanup.mjs";
import { findBrowserExecutable } from "./production-browser-smoke.mjs";

const WAIT_TIMEOUT_MS = 20_000;

async function freePort() {
  return new Promise((resolvePort, reject) => {
    const server = createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close(() => resolvePort(port));
    });
  });
}

async function waitForJson(url, options = {}, timeout = WAIT_TIMEOUT_MS) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response.json();
    } catch {}
    await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  }
  throw new Error(`Browser debugging endpoint did not become ready: ${url}`);
}

class CdpClient {
  constructor(url) {
    this.nextId = 1;
    this.pending = new Map();
    this.socket = new WebSocket(url);
    this.ready = new Promise((resolveReady, reject) => {
      this.socket.onopen = resolveReady;
      this.socket.onerror = () => reject(new Error("Could not connect to the browser debugging socket."));
    });
    this.socket.onmessage = (message) => {
      const payload = JSON.parse(String(message.data));
      if (!payload.id) return;
      const entry = this.pending.get(payload.id);
      if (!entry) return;
      this.pending.delete(payload.id);
      if (payload.error) entry.reject(new Error(payload.error.message));
      else entry.resolve(payload.result);
    };
  }

  async call(method, params = {}) {
    await this.ready;
    const id = this.nextId++;
    const result = new Promise((resolveCall, reject) => this.pending.set(id, { resolve: resolveCall, reject }));
    this.socket.send(JSON.stringify({ id, method, params }));
    return result;
  }

  close() { this.socket.close(); }
}

async function terminate(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  if (process.platform === "win32") {
    await new Promise((resolveKill) => {
      const killer = spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
      killer.on("exit", resolveKill);
      killer.on("error", resolveKill);
    });
  } else {
    child.kill("SIGTERM");
  }
  await Promise.race([
    new Promise((resolveExit) => child.once("exit", resolveExit)),
    new Promise((resolveWait) => setTimeout(resolveWait, 3_000)),
  ]);
}

const PROBE_NOTE_LENGTH = 30_000;
const PROBE_CHUNK_SIZE = 12_000;

function bytesToBase64(bytes) {
  return Buffer.from(bytes).toString("base64");
}

async function createEncryptedProbe() {
  const transferId = `browser-e2e-${globalThis.crypto.randomUUID()}`;
  const payload = {
    protocol: "saatyar-device-transfer",
    version: 1,
    transferId,
    source: { deviceId: "browser-sender", deviceName: "Browser Sender" },
    data: { note: "x".repeat(PROBE_NOTE_LENGTH), records: 2 },
  };
  const rawKey = globalThis.crypto.getRandomValues(new Uint8Array(32));
  const key = await globalThis.crypto.subtle.importKey("raw", rawKey, { name: "AES-GCM" }, false, ["encrypt"]);
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const cipher = new Uint8Array(await globalThis.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(JSON.stringify(payload)),
  ));
  return {
    transferId,
    envelope: JSON.stringify({
      protocol: "saatyar-device-transfer-encrypted",
      version: 1,
      transferId,
      iv: bytesToBase64(iv),
      ciphertext: bytesToBase64(cipher),
    }),
  };
}

function createProbeExpression({ transferId, envelope }) {
  return String.raw`(async () => {
    const deadline = (promise, label, ms = 12000) => Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error(label + " timeout")), ms)),
    ]);
    const waitIce = (peer) => peer.iceGatheringState === "complete" ? Promise.resolve() : deadline(new Promise((resolve) => {
      const onChange = () => {
        if (peer.iceGatheringState !== "complete") return;
        peer.removeEventListener("icegatheringstatechange", onChange);
        resolve();
      };
      peer.addEventListener("icegatheringstatechange", onChange);
    }), "ICE gathering");

    const sender = new RTCPeerConnection({ iceServers: [] });
    const receiver = new RTCPeerConnection({ iceServers: [] });
    const transferId = ${JSON.stringify(transferId)};
    const envelope = ${JSON.stringify(envelope)};
    const chunkSize = ${PROBE_CHUNK_SIZE};
    const chunks = Array.from({ length: Math.ceil(envelope.length / chunkSize) }, (_, index) =>
      envelope.slice(index * chunkSize, (index + 1) * chunkSize));

    try {
      const outgoing = sender.createDataChannel("saatyar-transfer", { ordered: true });
      const received = deadline(new Promise((resolve, reject) => {
        receiver.addEventListener("datachannel", (event) => {
          const incoming = event.channel;
          let remoteTransferId = "";
          let expectedChunks = 0;
          let remoteChunks = [];
          incoming.addEventListener("message", (message) => {
            try {
              const wire = JSON.parse(message.data);
              if (wire.kind === "start") {
                remoteTransferId = wire.transferId;
                expectedChunks = wire.chunks;
                remoteChunks = new Array(wire.chunks);
                return;
              }
              if (wire.transferId !== remoteTransferId) return;
              if (wire.kind === "chunk") {
                remoteChunks[wire.index] = wire.value;
                return;
              }
              if (wire.kind !== "end" || remoteChunks.filter(Boolean).length !== expectedChunks) return;
              const remoteEnvelope = JSON.parse(remoteChunks.join(""));
              incoming.send(JSON.stringify({ kind: "ack", transferId: remoteTransferId }));
              resolve({
                label: incoming.label,
                ordered: incoming.ordered,
                encryptedProtocol: remoteEnvelope.protocol,
                transferId: remoteEnvelope.transferId,
                ciphertextLength: remoteEnvelope.ciphertext.length,
                chunks: expectedChunks,
              });
            } catch (error) { reject(error); }
          });
          incoming.addEventListener("error", () => reject(new Error("receiver data channel error")), { once: true });
        }, { once: true });
      }), "receiver encrypted transfer");

      await sender.setLocalDescription(await sender.createOffer());
      await waitIce(sender);
      await receiver.setRemoteDescription(sender.localDescription);
      await receiver.setLocalDescription(await receiver.createAnswer());
      await waitIce(receiver);
      await sender.setRemoteDescription(receiver.localDescription);

      await deadline(new Promise((resolve, reject) => {
        if (outgoing.readyState === "open") return resolve();
        outgoing.addEventListener("open", resolve, { once: true });
        outgoing.addEventListener("error", () => reject(new Error("sender data channel error")), { once: true });
      }), "sender data channel open");

      const ack = deadline(new Promise((resolve, reject) => {
        outgoing.addEventListener("message", (event) => {
          const wire = JSON.parse(event.data);
          if (wire.kind === "ack") resolve(wire.transferId);
        });
        outgoing.addEventListener("error", () => reject(new Error("sender ACK error")), { once: true });
      }), "sender ACK");

      outgoing.send(JSON.stringify({ kind: "start", transferId, chunks: chunks.length }));
      chunks.forEach((value, index) => outgoing.send(JSON.stringify({ kind: "chunk", transferId, index, value })));
      outgoing.send(JSON.stringify({ kind: "end", transferId }));

      const [remote, ackTransferId] = await Promise.all([received, ack]);
      return {
        supported: true,
        label: remote.label,
        ordered: remote.ordered,
        encryptedProtocol: remote.encryptedProtocol,
        transferId: remote.transferId,
        ackTransferId,
        ciphertextLength: remote.ciphertextLength,
        chunks: remote.chunks,
      };
    } finally {
      sender.close();
      receiver.close();
    }
  })()`;
}

export async function runDevicePairingBrowserSmoke() {
  const browserExecutable = findBrowserExecutable();
  if (!browserExecutable) throw new Error("Chrome, Edge or Chromium was not found for the WebRTC pairing smoke test.");

  const debugPort = await freePort();
  const profileDir = await mkdtemp(join(tmpdir(), "saatyar-pairing-smoke-"));
  const encryptedProbe = await createEncryptedProbe();
  let browser;
  let client;
  let browserOutput = "";
  try {
    const args = [
      "--headless=new",
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${profileDir}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-dev-shm-usage",
      "--disable-features=WebRtcHideLocalIpsWithMdns",
      "about:blank",
    ];
    if (typeof process.getuid === "function" && process.getuid() === 0) args.push("--no-sandbox");
    browser = spawn(browserExecutable, args, { stdio: ["ignore", "ignore", "pipe"] });
    browser.stderr.on("data", (chunk) => { browserOutput += chunk; });

    await waitForJson(`http://127.0.0.1:${debugPort}/json/version`);
    const target = await waitForJson(`http://127.0.0.1:${debugPort}/json/new?about%3Ablank`, { method: "PUT" });
    client = new CdpClient(target.webSocketDebuggerUrl);
    await client.call("Runtime.enable");
    const result = await client.call("Runtime.evaluate", {
      expression: createProbeExpression(encryptedProbe),
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text || "WebRTC browser probe failed.");
    const value = result.result?.value;
    if (!value?.supported
      || value.label !== "saatyar-transfer"
      || value.ordered !== true
      || value.encryptedProtocol !== "saatyar-device-transfer-encrypted"
      || value.transferId !== value.ackTransferId
      || value.ciphertextLength < PROBE_NOTE_LENGTH
      || value.chunks < 2) {
      throw new Error(`WebRTC pairing contract failed: ${JSON.stringify(value)}`);
    }
    console.log(`✓ Direct WebRTC transferred and acknowledged ${value.chunks} encrypted Saatyar chunks`);
    console.log("Device pairing browser smoke passed.");
  } catch (error) {
    if (browserOutput.trim()) console.error(`\nBrowser output:\n${browserOutput.trim()}`);
    throw error;
  } finally {
    client?.close();
    await terminate(browser);
    await cleanupBrowserProfile(profileDir);
  }
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isDirectRun) {
  runDevicePairingBrowserSmoke().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
