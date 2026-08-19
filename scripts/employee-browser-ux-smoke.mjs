import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createMediaDemoData } from "./media/demo-data.ts";
import { launchBrowserDebugTarget } from "./browser-debug-startup.mjs";
import { findBrowserExecutable } from "./production-browser-smoke.mjs";
import { buildAppNavigationExpression, buildRouteReadyExpression } from "./browser-route-expression.mjs";
import { buildEmployeeBreakPersistenceProbeExpression, buildEmployeePersistenceProbeExpression } from "./employee-persistence-expression.mjs";
import { startStaticExportServer } from "./static-export-server.mjs";
import { APP_DATA_SCHEMA_VERSION, APP_DATA_STORAGE_FORMAT } from "../lib/data/version.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TIMEOUT = 30_000;
const EMPLOYEE_NOTE = "گزارش مرورگر کارمند؛ تحویل کارها و برنامه فردا";
const NET_DURATION = "۸:۱۵";
const ACTIVITY_TITLE = "بازطراحی صفحه ورود";
const ACTIVITY_PROJECT = "سامانه داخلی";
const ACTIVITY_DELETE_TITLE = "فعالیت آزمایشی حذف";
const FREELANCE_PROJECT = "طراحی داشبورد";

class CdpClient {
  constructor(url) {
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
    this.runtimeErrors = [];
    this.socket = new WebSocket(url);
    this.ready = new Promise((resolveReady, reject) => {
      this.socket.onopen = resolveReady;
      this.socket.onerror = () => reject(new Error("Could not connect to browser debugging socket."));
    });
    this.socket.onmessage = (message) => {
      const payload = JSON.parse(String(message.data));
      if (payload.id) {
        const pending = this.pending.get(payload.id);
        if (!pending) return;
        this.pending.delete(payload.id);
        if (payload.error) pending.reject(new Error(payload.error.message));
        else pending.resolve(payload.result);
        return;
      }
      for (const listener of this.listeners.get(payload.method) ?? []) listener(payload.params);
    };
  }
  async call(method, params = {}) {
    await this.ready;
    const id = this.nextId++;
    const result = new Promise((resolveCall, reject) => this.pending.set(id, { resolve: resolveCall, reject }));
    this.socket.send(JSON.stringify({ id, method, params }));
    return result;
  }
  on(method, listener) {
    const listeners = this.listeners.get(method) ?? [];
    listeners.push(listener);
    this.listeners.set(method, listeners);
  }
  close() { this.socket.close(); }
}

async function evaluate(client, expression) {
  const response = await client.call("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (response.exceptionDetails) {
    throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text || "Browser evaluation failed.");
  }
  return response.result?.value;
}

async function waitFor(client, expression, label, timeout = TIMEOUT) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (client.runtimeErrors.length) throw new Error(`Runtime error while waiting for ${label}: ${client.runtimeErrors.join("\n")}`);
    try {
      if (await evaluate(client, expression)) return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!/execution context|Cannot find context|navigated or closed/i.test(message)) throw error;
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  }
  const diagnostics = await evaluate(client, `(() => ({
    href: location.href,
    body: (document.body?.innerText || "").replace(/\\s+/g," ").slice(0,900),
    active: document.activeElement ? {
      tag: document.activeElement.tagName,
      type: document.activeElement.getAttribute?.("type") || "",
      value: "value" in document.activeElement ? String(document.activeElement.value).slice(0,120) : "",
      text: (document.activeElement.textContent || "").replace(/\\s+/g," ").trim().slice(0,120),
    } : null,
    alerts: [...document.querySelectorAll('[role="alert"]')].map((node) => (node.textContent || "").replace(/\\s+/g," ").trim()).filter(Boolean).slice(0,4),
    dialog: (document.querySelector('[role="dialog"]')?.textContent || "").replace(/\\s+/g," ").trim().slice(0,220),
  }))()`).catch(() => null);
  throw new Error(`Timed out while waiting for ${label}. State: ${JSON.stringify(diagnostics)}`);
}

async function navigate(client, url, text) {
  await client.call("Page.navigate", { url });
  await waitFor(client, "document.readyState === 'complete'", `document load ${url}`);
  if (text) await waitFor(client, `document.body?.innerText.includes(${JSON.stringify(text)})`, text);
  await settleUi(client);
}

async function navigateInApp(client, pathname, text) {
  const result = await evaluate(client, buildAppNavigationExpression(pathname));
  if (!result?.clicked) {
    throw new Error(`App navigation link not found: ${pathname}. Available anchors: ${JSON.stringify(result?.available ?? [])}`);
  }
  await waitFor(client, buildRouteReadyExpression(pathname), `in-app navigation ${pathname}`);
  if (text) await waitFor(client, `document.body?.innerText.includes(${JSON.stringify(text)})`, text);
  await settleUi(client);
}

async function settleUi(client) {
  await evaluate(client, `new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))`);
}

async function clickButton(client, text, exact = false) {
  const clicked = await evaluate(client, `(() => {
    const wanted = ${JSON.stringify(text)};
    const norm = (value) => (value || "").replace(/\\s+/g," ").trim();
    const button = [...document.querySelectorAll("button")].find((item) => !item.disabled && ${exact ? "norm(item.textContent) === wanted" : "norm(item.textContent).includes(wanted)"});
    if (!button) return false;
    button.click();
    return true;
  })()`);
  if (!clicked) throw new Error(`Button not found: ${text}`);
  await settleUi(client);
}

async function startEmployeeDay(client) {
  await waitFor(client, `(() => {
    const norm = (value) => (value || "").replace(/\\s+/g, " ").trim();
    const firstRun = document.querySelector("[data-first-run-primary]");
    const startDay = [...document.querySelectorAll("button")].find((button) => !button.disabled && norm(button.textContent) === "شروع روز");
    return Boolean((firstRun instanceof HTMLButtonElement && !firstRun.disabled) || startDay);
  })()`, "employee first action");

  const startedFromFirstRunGuide = await evaluate(client, `(() => {
    const button = document.querySelector("[data-first-run-primary]");
    if (!(button instanceof HTMLButtonElement) || button.disabled) return false;
    button.click();
    return true;
  })()`);

  if (!startedFromFirstRunGuide) await clickButton(client, "شروع روز", true);
  else await settleUi(client);
}

async function assertLiveWorkClockAdvances(client) {
  await waitFor(client, `Boolean(document.querySelector('[data-live-work-duration="true"]'))`, "live employee work clock");
  const before = await evaluate(client, `document.querySelector('[data-live-work-duration="true"]')?.textContent || ""`);
  await waitFor(
    client,
    `(() => { const node = document.querySelector('[data-live-work-duration="true"]'); return Boolean(node && node.textContent && node.textContent !== ${JSON.stringify(before)}); })()`,
    "live employee work clock advance",
    5_000,
  );
}

async function clickSummary(client, text) {
  const clicked = await evaluate(client, `(() => {
    const wanted = ${JSON.stringify(text)};
    const norm = (value) => (value || "").replace(/\\s+/g," ").trim();
    const summary = [...document.querySelectorAll("summary")].find((item) => norm(item.textContent).includes(wanted));
    if (!summary) return false;
    summary.click();
    return true;
  })()`);
  if (!clicked) throw new Error(`Summary not found: ${text}`);
  await settleUi(client);
}

async function assertCompletedEditActionBarVisible(client, label, mobile = false) {
  const contract = await evaluate(client, `(() => {
    const bar = document.querySelector('[data-completed-edit-actions]');
    const fields = document.querySelector('[data-completed-edit-fields="active"]');
    const header = document.querySelector('header');
    const mobileNav = document.querySelector('nav[aria-label="ناوبری موبایل"]');
    if (!(bar instanceof HTMLElement)) return { found: false };
    const rect = bar.getBoundingClientRect();
    const headerRect = header instanceof HTMLElement ? header.getBoundingClientRect() : null;
    const navRect = mobileNav instanceof HTMLElement ? mobileNav.getBoundingClientRect() : null;
    return {
      found: true,
      position: getComputedStyle(bar).position,
      anchored: ${mobile}
        ? getComputedStyle(bar).position === "fixed"
        : getComputedStyle(bar).position === "sticky",
      dirty: bar.getAttribute("data-dirty"),
      fieldsActive: fields instanceof HTMLFieldSetElement,
      top: Math.round(rect.top),
      bottom: Math.round(rect.bottom),
      viewportHeight: window.innerHeight,
      headerBottom: headerRect ? Math.round(headerRect.bottom) : 0,
      mobileNavTop: navRect ? Math.round(navRect.top) : null,
      visible: rect.bottom > 0 && rect.top < window.innerHeight,
      clearOfHeader: !headerRect || rect.top >= headerRect.bottom - 2,
      clearOfMobileNav: !${mobile} || !navRect || rect.bottom <= navRect.top - 4,
    };
  })()`);
  if (!contract?.found || !contract.anchored || !contract.fieldsActive || !contract.visible || !contract.clearOfHeader || !contract.clearOfMobileNav) {
    throw new Error(`${label} failed: ${JSON.stringify(contract)}`);
  }
  return contract;
}

async function scrollCompletedAdvancedEditorIntoView(client) {
  const scrolled = await evaluate(client, `(() => {
    const details = document.querySelector('[data-completed-day-editor] details');
    if (!(details instanceof HTMLDetailsElement)) return false;
    details.open = true;
    details.scrollIntoView({ block: "end", behavior: "auto" });
    return true;
  })()`);
  if (!scrolled) throw new Error("Completed-day advanced editor was not found.");
  await settleUi(client);
}

async function focusBySelector(client, expression, label) {
  const focused = await evaluate(client, `(() => {
    const input = ${expression};
    if (!input) return false;
    input.focus();
    return document.activeElement === input;
  })()`);
  if (!focused) throw new Error(`Field not found: ${label}`);
}

async function replaceFocusedText(client, value) {
  const updated = await evaluate(client, `(() => {
    const field = document.activeElement;
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return false;
    const prototype = field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
    if (!setter) return false;
    setter.call(field, ${JSON.stringify(value)});
    field.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: ${JSON.stringify(value)} }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  })()`);
  if (!updated) throw new Error("Focused field could not receive React-compatible text input.");
  await settleUi(client);
  const reflected = await evaluate(client, `document.activeElement?.value === ${JSON.stringify(value)}`);
  if (!reflected) throw new Error(`Controlled field did not retain the expected value: ${value}`);
}



async function assertEmployeeProjectIsolation(client) {
  const opened = await evaluate(client, `(() => {
    const trigger = document.querySelector('[data-activity-project]');
    if (!(trigger instanceof HTMLButtonElement)) return false;
    trigger.click();
    return true;
  })()`);
  if (!opened) throw new Error("Activity project selector was not found for isolation check.");
  await settleUi(client);
  const leaked = await evaluate(client, `(() => {
    const norm = (value) => (value || "").replace(/\s+/g, " ").trim();
    return [...document.querySelectorAll('[role="option"]')].some((option) => norm(option.textContent) === ${JSON.stringify(FREELANCE_PROJECT)});
  })()`);
  await client.call("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 });
  await client.call("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 });
  await settleUi(client);
  if (leaked) throw new Error(`Freelance project leaked into employee activity selector: ${FREELANCE_PROJECT}`);
}

async function createEmployeeWorkProject(client, projectName) {
  const opened = await evaluate(client, `(() => {
    const button = document.querySelector('[data-create-work-project]');
    if (!(button instanceof HTMLButtonElement)) return false;
    button.click();
    return true;
  })()`);
  if (!opened) throw new Error("Create work project action was not found.");
  await waitFor(client, `Boolean(document.querySelector('[role="dialog"] input'))`, "work project dialog");
  await focusBySelector(client, `document.querySelector('[role="dialog"] input')`, "work project name");
  await replaceFocusedText(client, projectName);
  await clickButton(client, "ساخت پروژه", true);
  await waitFor(client, `!document.querySelector('[role="dialog"]')`, "work project dialog close");
}

async function selectActivityProject(client, projectName) {
  const opened = await evaluate(client, `(() => {
    const trigger = document.querySelector('[data-activity-project]');
    if (!(trigger instanceof HTMLButtonElement)) return false;
    trigger.click();
    return true;
  })()`);
  if (!opened) throw new Error("Activity project selector was not found.");
  await waitFor(client, `(() => {
    const norm = (value) => (value || "").replace(/\\s+/g, " ").trim();
    return [...document.querySelectorAll('[role="option"]')].some((option) => norm(option.textContent) === ${JSON.stringify(projectName)});
  })()`, `activity project option ${projectName}`);
  const selected = await evaluate(client, `(() => {
    const norm = (value) => (value || "").replace(/\\s+/g, " ").trim();
    const option = [...document.querySelectorAll('[role="option"]')].find((item) => norm(item.textContent) === ${JSON.stringify(projectName)});
    if (!(option instanceof HTMLElement)) return false;
    option.click();
    return true;
  })()`);
  if (!selected) throw new Error(`Activity project option could not be selected: ${projectName}`);
  await settleUi(client);
}

async function editEmployeeActivityDuration(client, title, minutes) {
  const opened = await evaluate(client, `(() => {
    const row = [...document.querySelectorAll('[data-recent-activity-segment]')].find((item) => (item.textContent || "").includes(${JSON.stringify(ACTIVITY_TITLE)}));
    const button = row?.querySelector('button[aria-label="ویرایش زمان صرف‌شده"]');
    if (!(button instanceof HTMLButtonElement)) return false;
    button.click();
    return true;
  })()`);
  if (!opened) throw new Error(`Activity duration editor was not found for ${title}.`);
  await waitFor(client, `Boolean(document.querySelector('[data-activity-duration-minutes]'))`, "activity duration editor");
  await focusBySelector(client, `document.querySelector('[data-activity-duration-hours]')`, "activity duration hours");
  await replaceFocusedText(client, "0");
  await focusBySelector(client, `document.querySelector('[data-activity-duration-minutes]')`, "activity duration minutes");
  await replaceFocusedText(client, String(minutes));
  await clickButton(client, "ذخیره زمان", true);
  await waitFor(client, `!document.querySelector('[data-activity-duration-minutes]')`, "activity duration editor close");
}

async function deleteEmployeeActivity(client, title) {
  const opened = await evaluate(client, `(() => {
    const row = [...document.querySelectorAll('[data-recent-activity-segment]')].find((item) => (item.textContent || "").includes(${JSON.stringify(ACTIVITY_DELETE_TITLE)}));
    const button = row?.querySelector('button[aria-label="حذف فعالیت"]');
    if (!(button instanceof HTMLButtonElement)) return false;
    button.click();
    return true;
  })()`);
  if (!opened) throw new Error(`Activity delete action was not found for ${title}.`);
  await waitFor(client, `Boolean(document.querySelector('[role="alertdialog"]'))`, "activity delete confirmation");
  const confirmed = await evaluate(client, `(() => {
    const dialog = document.querySelector('[role="alertdialog"]');
    const button = [...(dialog?.querySelectorAll('button') || [])].find((item) => (item.textContent || "").replace(/\s+/g, " ").trim() === "حذف فعالیت");
    if (!(button instanceof HTMLButtonElement)) return false;
    button.click();
    return true;
  })()`);
  if (!confirmed) throw new Error("Activity delete confirmation action was not found.");
  await waitFor(client, `![...document.querySelectorAll('[data-recent-activity-segment]')].some((item) => (item.textContent || "").includes(${JSON.stringify(ACTIVITY_DELETE_TITLE)}))`, "deleted activity removal");
}

async function trackEmployeeActivityContext(client) {
  await assertEmployeeProjectIsolation(client);
  await createEmployeeWorkProject(client, ACTIVITY_PROJECT);
  await focusBySelector(client, `document.querySelector('[data-activity-title]')`, "employee activity title");
  await replaceFocusedText(client, ACTIVITY_TITLE);
  await selectActivityProject(client, ACTIVITY_PROJECT);
  await clickButton(client, "شروع فعالیت", true);
  await waitFor(client, `document.querySelector('[data-active-activity-title]')?.textContent?.includes(${JSON.stringify(ACTIVITY_TITLE)}) && Boolean(document.querySelector('[data-activity-live-timer]'))`, "employee titled activity start");
  await clickButton(client, "پایان فعالیت", true);
  await waitFor(client, `(() => {
    const rows = [...document.querySelectorAll('[data-recent-activity-segment]')];
    return rows.some((row) => (row.textContent || "").includes(${JSON.stringify(ACTIVITY_TITLE)}) && (row.textContent || "").includes(${JSON.stringify(ACTIVITY_PROJECT)}));
  })()`, "employee titled activity recent row");
  await editEmployeeActivityDuration(client, ACTIVITY_TITLE, 7);

  await focusBySelector(client, `document.querySelector('[data-activity-title]')`, "employee disposable activity title");
  await replaceFocusedText(client, ACTIVITY_DELETE_TITLE);
  await clickButton(client, "شروع فعالیت", true);
  await waitFor(client, `document.querySelector('[data-active-activity-title]')?.textContent?.includes(${JSON.stringify(ACTIVITY_DELETE_TITLE)})`, "disposable activity start");
  await clickButton(client, "پایان فعالیت", true);
  await waitFor(client, `[...document.querySelectorAll('[data-recent-activity-segment]')].some((item) => (item.textContent || "").includes(${JSON.stringify(ACTIVITY_DELETE_TITLE)}))`, "disposable activity recent row");
  await deleteEmployeeActivity(client, ACTIVITY_DELETE_TITLE);
}

async function waitForEmployeeActivityPersistence(client, date, timeout = TIMEOUT) {
  const deadline = Date.now() + timeout;
  let last = null;
  while (Date.now() < deadline) {
    last = await evaluate(client, `(async () => {
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open("saatyar-db", 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      const stored = await new Promise((resolve, reject) => {
        const tx = db.transaction("app-data", "readonly");
        const request = tx.objectStore("app-data").get("current");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      db.close();
      const data = stored?.format === "saatyar-app-data" ? stored.data : stored;
      const segment = data?.records?.[${JSON.stringify(date)}]?.activitySegments?.find((item) => item.title === ${JSON.stringify(ACTIVITY_TITLE)});
      const elapsedMinutes = segment?.startedAt && segment?.endedAt ? Math.round((new Date(segment.endedAt).getTime() - new Date(segment.startedAt).getTime()) / 60000) : null;
      return segment ? { ready: true, title: segment.title, kind: segment.kind, projectId: segment.projectId, workProjectId: segment.workProjectId, end: segment.end, elapsedMinutes, workProject: data?.workProjects?.find((item) => item.id === segment.workProjectId)?.name } : { ready: false };
    })()`);
    if (last?.ready) return last;
    await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  }
  throw new Error(`Employee activity context did not reach IndexedDB: ${JSON.stringify(last)}`);
}

async function pressKey(client, key, code = key) {
  const windowsVirtualKeyCode = key === "Enter" ? 13 : key === "Tab" ? 9 : 0;
  const text = key === "Enter" ? "\r" : undefined;
  await client.call("Input.dispatchKeyEvent", {
    type: "keyDown", key, code, windowsVirtualKeyCode, nativeVirtualKeyCode: windowsVirtualKeyCode,
    ...(text ? { text, unmodifiedText: text } : {}),
  });
  await client.call("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode, nativeVirtualKeyCode: windowsVirtualKeyCode });
  await settleUi(client);
}

async function setTimeCardValue(client, title, value) {
  await focusBySelector(client, `(() => {
    const norm = (value) => (value || "").replace(/\\s+/g," ").trim();
    const title = [...document.querySelectorAll("strong")].find((node) => norm(node.textContent) === ${JSON.stringify(title)});
    let node = title?.parentElement;
    while (node && !node.querySelector('input[aria-label="زمان"]')) node = node.parentElement;
    return node?.querySelector('input[aria-label="زمان"]') || null;
  })()`, `${title} time`);
  await replaceFocusedText(client, value);
  await pressKey(client, "Enter", "Enter");
}

async function setSectionTimeValue(client, sectionTitle, fieldTitle, value, occurrence = 0) {
  await focusBySelector(client, `(() => {
    const norm = (value) => (value || "").replace(/\\s+/g," ").trim();
    const heading = [...document.querySelectorAll("strong")].find((item) => norm(item.textContent) === ${JSON.stringify(sectionTitle)});
    const section = heading?.closest("section") || null;
    if (!section) return null;
    const labels = [...section.querySelectorAll("label")].filter((label) => [...label.querySelectorAll("span")].some((span) => norm(span.textContent) === ${JSON.stringify(fieldTitle)}));
    return labels[${occurrence}]?.querySelector('input[aria-label="زمان"]') || null;
  })()`, `${sectionTitle}/${fieldTitle}`);
  await replaceFocusedText(client, value);
  await pressKey(client, "Enter", "Enter");
}

async function assertFirstBreakEditorContract(client) {
  const contract = await evaluate(client, `(() => {
    const section = document.querySelector("[data-breaks-editor]");
    const row = section?.querySelector("[data-break-row]") || null;
    if (!row) return { found: false };
    const readTime = (field) => row.querySelector('[data-break-field="' + field + '"] input')?.value || "";
    const checkbox = row.querySelector('input[type="checkbox"][data-break-paid-toggle]');
    return {
      found: true,
      start: readTime("start"),
      end: readTime("end"),
      paid: checkbox instanceof HTMLInputElement ? checkbox.checked : null,
    };
  })()`);
  const latin = (value) => String(value || "")
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
  const normalized = { ...contract, start: latin(contract?.start), end: latin(contract?.end) };
  if (!normalized.found || normalized.start !== "15:00" || normalized.end !== "15:15" || normalized.paid !== false) {
    throw new Error(`Break editor contract drifted before clock-out: ${JSON.stringify(normalized)}`);
  }
}

async function ensureFirstBreakUnpaid(client) {
  const selector = '[data-breaks-editor] [data-break-row] input[type="checkbox"][data-break-paid-toggle]';
  const state = await evaluate(client, `(() => {
    const checkbox = document.querySelector(${JSON.stringify(selector)});
    if (!(checkbox instanceof HTMLInputElement)) return { found: false, checked: null };
    return { found: true, checked: checkbox.checked };
  })()`);
  if (!state?.found) throw new Error("Break paid/unpaid native checkbox not found.");
  if (state.checked) {
    await evaluate(client, `document.querySelector(${JSON.stringify(selector)})?.click()`);
    await settleUi(client);
  }
  await waitFor(client, `(() => {
    const checkbox = document.querySelector(${JSON.stringify(selector)});
    return checkbox instanceof HTMLInputElement && checkbox.checked === false;
  })()`, "unpaid break contract");
}

async function waitForEmployeeBreakPersistence(client, date, timeout = TIMEOUT) {
  const deadline = Date.now() + timeout;
  let last;
  while (Date.now() < deadline) {
    last = await evaluate(client, buildEmployeeBreakPersistenceProbeExpression({ date }));
    if (last?.ready) return last;
    await new Promise((resolveWait) => setTimeout(resolveWait, 120));
  }
  throw new Error(`Employee break edits did not reach IndexedDB before clock-out: ${JSON.stringify(last)}`);
}

async function setEmployeeNote(client, value) {
  await focusBySelector(client, `document.querySelector('textarea[placeholder*="کارهای انجام‌شده"]')`, "employee note");
  await replaceFocusedText(client, value);
}

async function seedEmployeeData(client) {
  const data = createMediaDemoData();
  data.settings.mode = "employee";
  data.settings.autoOfficialHolidays = false;
  data.settings.autoWeeklyHoliday = false;
  data.settings.defaultStart = "08:00";
  data.settings.defaultEnd = "17:00";
  data.settings.lunchMinutes = 30;
  for (const schedule of Object.values(data.settings.weeklySchedule)) {
    schedule.enabled = true;
    schedule.start = "08:00";
    schedule.end = "17:00";
    schedule.lunchMinutes = 30;
  }
  data.records = {};
  data.leaves = [];
  data.workProjects = [];
  data.deletedRecords = [];
  const snapshot = {
    format: APP_DATA_STORAGE_FORMAT,
    schemaVersion: APP_DATA_SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    data,
  };
  const seeded = await evaluate(client, `(async () => {
    const snapshot = ${JSON.stringify(snapshot)};
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open("saatyar-db", 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains("app-data")) request.result.createObjectStore("app-data");
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise((resolve, reject) => {
      const tx = db.transaction("app-data", "readwrite");
      tx.objectStore("app-data").put(snapshot, "current");
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    const current = await new Promise((resolve, reject) => {
      const tx = db.transaction("app-data", "readonly");
      const request = tx.objectStore("app-data").get("current");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    db.close();
    localStorage.setItem("saatyar:last-route", "/employee/today");
    const payload = current?.format === "saatyar-app-data" ? current.data : current;
    const weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const weekday = weekdays[new Date().getDay()];
    const schedule = payload?.settings?.weeklySchedule?.[weekday];
    return {
      format: current?.format || "legacy",
      schemaVersion: current?.schemaVersion ?? null,
      weekday,
      enabled: schedule?.enabled === true,
      start: schedule?.start || "",
      end: schedule?.end || "",
    };
  })()`);
  if (!seeded?.enabled || seeded.schemaVersion !== APP_DATA_SCHEMA_VERSION || seeded.format !== APP_DATA_STORAGE_FORMAT) {
    throw new Error(`Employee fixture seed was not preserved as the current snapshot contract: ${JSON.stringify(seeded)}`);
  }
}

async function currentDateKey(client) {
  return evaluate(client, `(() => {
    const date = new Date();
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2,"0"), String(date.getDate()).padStart(2,"0")].join("-");
  })()`);
}

async function waitForEmployeePersistence(client, date) {
  const expression = buildEmployeePersistenceProbeExpression({ date, note: EMPLOYEE_NOTE });
  const deadline = Date.now() + TIMEOUT;
  let lastProbe = null;
  while (Date.now() < deadline) {
    if (client.runtimeErrors.length) throw new Error(`Runtime error while waiting for employee workflow persistence: ${client.runtimeErrors.join("\n")}`);
    try {
      lastProbe = await evaluate(client, expression);
      if (lastProbe?.ready) return lastProbe;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!/execution context|Cannot find context|navigated or closed/i.test(message)) throw error;
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  }
  throw new Error(`Timed out while waiting for employee workflow persistence. Probe: ${JSON.stringify(lastProbe)}`);
}

async function main() {
  const outputDirectory = resolve(ROOT, "out");
  if (!existsSync(resolve(outputDirectory, "index.html"))) throw new Error("Static production export is missing. Run npm run build:vercel first.");
  const browserExecutable = findBrowserExecutable();
  if (!browserExecutable) throw new Error("Chrome, Edge or Chromium was not found. Set SAATYAR_BROWSER_PATH.");

  const server = await startStaticExportServer({ outputDirectory });
  let browserSession;
  let client;

  try {
    browserSession = await launchBrowserDebugTarget({
      executable: browserExecutable,
      profilePrefix: "saatyar-employee-ux-",
      extraArgs: ["--disable-background-networking", "--disable-component-update", "--disable-sync"],
    });
    client = new CdpClient(browserSession.target.webSocketDebuggerUrl);
    client.on("Runtime.exceptionThrown", ({ exceptionDetails }) => {
      const description = exceptionDetails?.exception?.description || exceptionDetails?.text || "Runtime exception";
      if (!/ResizeObserver loop|AbortError/i.test(description)) client.runtimeErrors.push(description);
    });
    await client.call("Page.enable");
    await client.call("Runtime.enable");
    await client.call("Storage.clearDataForOrigin", { origin: server.origin, storageTypes: "all" });
    await navigate(client, server.origin);
    await waitFor(
      client,
      `["/onboarding", "/onboarding/"].includes(location.pathname) && Boolean(document.querySelector('[data-onboarding-step-index="1"]'))`,
      "dedicated onboarding welcome step",
    );
    // Stop the mounted app before writing the fixture so a pending persistence
    // effect from the onboarding shell cannot overwrite the seeded schedule.
    await navigate(client, `${server.origin}/robots.txt`);
    await seedEmployeeData(client);
    const date = await currentDateKey(client);

    await client.call("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    await navigate(client, `${server.origin}/employee/today`, "یادداشت روز کاری");

    await startEmployeeDay(client);
    await waitFor(client, `document.body?.innerText.includes("پایان روز")`, "employee day start");
    await assertLiveWorkClockAdvances(client);
    console.log("✓ Active employee work clock advances live without a reload");
    await setTimeCardValue(client, "ورود", "08:00");
    console.log("✓ Employee day starts through the real attendance action and keeps an editable arrival time");

    await trackEmployeeActivityContext(client);
    const activityPersistence = await waitForEmployeeActivityPersistence(client, date);
    if (activityPersistence.kind !== "deep-work" || activityPersistence.projectId || !activityPersistence.workProjectId || activityPersistence.workProject !== ACTIVITY_PROJECT || !activityPersistence.end || activityPersistence.elapsedMinutes !== 7) {
      throw new Error(`Employee activity context persistence drifted: ${JSON.stringify(activityPersistence)}`);
    }
    console.log("✓ Employee activity creates isolated project context, shows a live timer, edits time spent, deletes history, and persists it");

    await clickButton(client, "شروع ناهار", true);
    await waitFor(client, `document.body?.innerText.includes("پایان ناهار")`, "lunch running");
    await clickButton(client, "پایان ناهار", true);
    await waitFor(client, `document.body?.innerText.includes("شروع ناهار")`, "lunch saved");
    await clickSummary(client, "ویرایش دقیق ناهار و وقفه‌ها");
    await setSectionTimeValue(client, "ناهار", "شروع", "12:00");
    await setSectionTimeValue(client, "ناهار", "پایان", "12:30");
    console.log("✓ Lunch start/stop flow is recorded and normalized to a deterministic 30-minute interval");

    await clickButton(client, "ثبت وقفه", true);
    await waitFor(client, `document.body?.innerText.includes("۱۵") && document.body?.innerText.includes("۳۰")`, "break duration actions");
    await clickButton(client, "۱۵", true);
    await waitFor(client, `document.body?.innerText.includes("ثبت وقفه")`, "break saved");
    await setSectionTimeValue(client, "وقفه‌ها", "شروع", "15:00");
    await setSectionTimeValue(client, "وقفه‌ها", "پایان", "15:15");
    await ensureFirstBreakUnpaid(client);
    await assertFirstBreakEditorContract(client);
    const breakPersistence = await waitForEmployeeBreakPersistence(client, date);
    console.log(`✓ Break flow records a separate 15-minute unpaid interruption and reaches IndexedDB (${breakPersistence.storageShape})`);

    await setEmployeeNote(client, EMPLOYEE_NOTE);
    await clickButton(client, "پایان روز", true);
    await waitFor(client, `(() => {
      const norm = (value) => (value || "").replace(/\\s+/g, " ").trim();
      return document.body?.innerText.includes("ثبت این روز کامل شده است")
        && [...document.querySelectorAll("button")].some((button) => !button.disabled && norm(button.textContent) === "ویرایش این روز");
    })()`, "completed employee day edit affordance");
    await clickButton(client, "ویرایش این روز", true);
    await setTimeCardValue(client, "خروج", "17:00");
    await scrollCompletedAdvancedEditorIntoView(client);
    const desktopEditBar = await assertCompletedEditActionBarVisible(client, "desktop completed-day edit action bar");
    if (desktopEditBar.dirty !== "true") throw new Error(`Completed-day edit bar did not expose dirty state: ${JSON.stringify(desktopEditBar)}`);
    console.log("✓ Completed-day edit actions stay visible beside the editor after scrolling");
    await clickButton(client, "ذخیره تغییرات", true);
    await waitFor(client, `Boolean(document.querySelector('[data-completed-edit-feedback]'))`, "completed-day save feedback");
    console.log("✓ Completed-day save confirms success inside the current viewport");
    const completedPersistence = await waitForEmployeePersistence(client, date);
    await waitFor(client, `document.body?.innerText.includes("ثبت این روز کامل شده است") && document.body?.innerText.includes(${JSON.stringify(NET_DURATION)})`, "employee net duration");
    console.log(`✓ Completed-day draft persists the full 08:00–17:00 / lunch / unpaid-break contract before verifying 8:15 (${completedPersistence.storageShape})`);

    await navigateInApp(client, "/month", "تقویم کاری");
    await waitFor(client, `document.body?.innerText.includes("جزئیات روز انتخاب‌شده") && document.body?.innerText.includes(${JSON.stringify(NET_DURATION)})`, "employee month details");
    console.log("✓ Work Calendar reflects the completed employee attendance calculation");

    await navigateInApp(client, "/reports", "گزارش کارکرد و حقوق");
    await waitFor(client, `document.body?.innerText.includes("فیش حقوقی تخمینی ماه") && document.body?.innerText.includes("کارکرد این ماه")`, "employee payroll report");
    console.log("✓ Reports expose employee work totals and the saved payroll policy summary");

    console.log(`✓ Employee workflow is durable in IndexedDB (${completedPersistence.storageShape}, schema v${completedPersistence.schemaVersion ?? "legacy"})`);

    await client.call("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true, screenWidth: 390, screenHeight: 844 });
    await navigate(client, `${server.origin}/employee/today`, "یادداشت روز کاری");
    await waitFor(client, `(() => {
      const note = document.querySelector('textarea[placeholder*="کارهای انجام‌شده"]');
      return note instanceof HTMLTextAreaElement
        && note.value === ${JSON.stringify(EMPLOYEE_NOTE)}
        && document.body?.innerText.includes("ثبت این روز کامل شده است")
        && document.body?.innerText.includes(${JSON.stringify(NET_DURATION)})
        && document.body?.innerText.includes(${JSON.stringify(ACTIVITY_TITLE)})
        && document.body?.innerText.includes(${JSON.stringify(ACTIVITY_PROJECT)});
    })()`, "employee hard reload state");
    const mobileContract = await evaluate(client, `(() => {
      const note = document.querySelector('textarea[placeholder*="کارهای انجام‌شده"]');
      return {
        pageFits: document.documentElement.scrollWidth <= window.innerWidth + 2,
        noteVisible: note instanceof HTMLTextAreaElement && note.value === ${JSON.stringify(EMPLOYEE_NOTE)},
        completed: document.body?.innerText.includes("ثبت این روز کامل شده است"),
        activityTitleVisible: document.body?.innerText.includes(${JSON.stringify(ACTIVITY_TITLE)}),
        activityProjectVisible: document.body?.innerText.includes(${JSON.stringify(ACTIVITY_PROJECT)}),
      };
    })()`);
    if (!mobileContract?.pageFits || !mobileContract.noteVisible || !mobileContract.completed || !mobileContract.activityTitleVisible || !mobileContract.activityProjectVisible) {
      throw new Error(`Mobile employee UX contract failed: ${JSON.stringify(mobileContract)}`);
    }
    console.log("✓ Hard reload restores the employee day and mobile Today stays within the viewport");

    await clickButton(client, "ویرایش این روز", true);
    await setTimeCardValue(client, "خروج", "17:05");
    await scrollCompletedAdvancedEditorIntoView(client);
    const mobileEditBar = await assertCompletedEditActionBarVisible(client, "mobile completed-day edit action bar", true);
    if (mobileEditBar.dirty !== "true") throw new Error(`Mobile completed-day edit bar did not expose dirty state: ${JSON.stringify(mobileEditBar)}`);
    console.log("✓ Mobile completed-day edit actions remain visible without colliding with bottom navigation");
    await clickButton(client, "انصراف", true);
    await waitFor(client, `document.body?.innerText.includes("ثبت این روز کامل شده است")`, "completed-day mobile cancel");

    await client.call("Emulation.setDeviceMetricsOverride", { width: 320, height: 800, deviceScaleFactor: 1, mobile: true, screenWidth: 320, screenHeight: 800 });
    await navigate(client, `${server.origin}/employee/today`, "یادداشت روز کاری");
    await waitFor(client, `window.innerWidth === 320 && Boolean(document.querySelector('[data-mobile-bottom-nav]'))`, "320px employee Today render");
    const compactEmployeeContract = await evaluate(client, `(() => {
      const viewportWidth = window.innerWidth;
      const nav = document.querySelector('[data-mobile-bottom-nav]');
      const navRect = nav instanceof HTMLElement ? nav.getBoundingClientRect() : null;
      const focusCard = document.querySelector('[data-completed-day-editor]');
      const focusRect = focusCard instanceof HTMLElement ? focusCard.getBoundingClientRect() : null;
      return {
        pageFits: document.documentElement.scrollWidth <= viewportWidth + 2,
        navFits: Boolean(navRect && navRect.left >= -1 && navRect.right <= viewportWidth + 1),
        focusFits: Boolean(focusRect && focusRect.left >= -1 && focusRect.right <= viewportWidth + 1),
        viewportWidth,
        nav: navRect ? { left: navRect.left, right: navRect.right, width: navRect.width } : null,
        focus: focusRect ? { left: focusRect.left, right: focusRect.right, width: focusRect.width } : null,
      };
    })()`);
    if (!compactEmployeeContract?.pageFits || !compactEmployeeContract.navFits || !compactEmployeeContract.focusFits) {
      throw new Error(`320px employee Today overflowed viewport: ${JSON.stringify(compactEmployeeContract)}`);
    }
    console.log("✓ Employee Today remains usable without horizontal overflow at 320px");

    if (client.runtimeErrors.length) throw new Error(`Browser runtime errors:\n${client.runtimeErrors.join("\n")}`);
    console.log("Employee browser UX smoke passed.");
  } catch (error) {
    const usefulOutput = (browserSession?.getBrowserOutput() ?? "")
      .split(/\r?\n/)
      .filter((line) => !/google_apis[\\/]gcm|DEPRECATED_ENDPOINT|Authentication Failed: wrong_secret|Failed to log in to GCM|TensorFlow Lite XNNPACK/i.test(line))
      .join("\n")
      .trim();
    if (usefulOutput) console.error(`\nBrowser output:\n${usefulOutput}`);
    throw error;
  } finally {
    client?.close();
    await browserSession?.close();
    await server.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
