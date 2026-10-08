import assert from "node:assert/strict";

async function evaluate(client, expression) {
  const response = await client.call("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.text || "Leave browser smoke evaluation failed.");
  return response.result?.value;
}

async function waitFor(client, expression, label, timeout = 10_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await evaluate(client, `(async () => Boolean(await (${expression})))()`)) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for ${label}.`);
}

export async function seedLeaveSettlementPolicy(client) {
  return evaluate(client, `(() => new Promise((resolve, reject) => {
    const opening = indexedDB.open("saatyar-db", 1);
    opening.onerror = () => reject(opening.error);
    opening.onsuccess = () => {
      const db = opening.result;
      const store = db.transaction("app-data", "readonly").objectStore("app-data");
      const request = store.get("current");
      request.onerror = () => { db.close(); reject(request.error); };
      request.onsuccess = () => {
        const envelope = request.result;
        const data = envelope?.format === "saatyar-app-data" && envelope.data ? envelope.data : envelope?.data || envelope;
        if (!data?.settings?.leavePolicies) { db.close(); reject(new Error("Leave policy collection is unavailable")); return; }
        const year = Number(new Intl.DateTimeFormat("en-u-ca-persian", { year: "numeric" }).formatToParts(new Date()).find((part) => part.type === "year")?.value);
        const effectiveYear = year - 2;
        if (!data.settings.leavePolicies.some((item) => item.id === "browser-settlement-policy")) {
          data.settings.leavePolicies.push({ id: "browser-settlement-policy", effectiveYear, effectiveMonth: 1, monthlyMinutes: 960, createdAt: "2024-01-01T00:00:00.000Z" });
        }
        const transaction = db.transaction("app-data", "readwrite");
        transaction.objectStore("app-data").put(envelope?.format === "saatyar-app-data" ? { ...envelope, data } : data, "current");
        transaction.oncomplete = () => { db.close(); resolve({ year, settlementYear: effectiveYear }); };
        transaction.onerror = () => { db.close(); reject(transaction.error); };
      };
    };
  }))()`);
}

async function setField(client, name, value) {
  const updated = await evaluate(client, `(() => {
    const element = document.querySelector('[data-leave-field="${name}"]');
    if (!(element instanceof HTMLInputElement)) return false;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    setter?.call(element, ${JSON.stringify(String(value))});
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
    return element.value === ${JSON.stringify(String(value))};
  })()`);
  assert.equal(updated, true, `Leave field ${name} accepts its browser fixture value`);
}

async function clickFormSubmit(client, selector) {
  const submitted = await evaluate(client, `(() => {
    const form = document.querySelector(${JSON.stringify(selector)});
    const button = form?.querySelector('button[type="submit"]');
    if (!(button instanceof HTMLButtonElement) || button.disabled) return false;
    button.click();
    return true;
  })()`);
  assert.equal(submitted, true, `Leave form ${selector} can be submitted`);
}

async function openManageAction(client, label) {
  const state = await evaluate(client, `(() => ({
    hasBalanceTab: Boolean(document.querySelector('[role="tab"][aria-controls="leave-panel-1"]')),
    hasActionList: Boolean(document.querySelector('[data-leave-manage-actions]')),
    hasDialog: Boolean(document.querySelector('[role="dialog"]')),
  }))()`);
  if (state?.hasBalanceTab && !state.hasDialog) {
    await evaluate(client, `document.querySelector('[role="tab"][aria-controls="leave-panel-1"]').click()`);
    await waitFor(client, `[...document.querySelectorAll('button')].some((button) => button.textContent.includes("Manage balance"))`, "Leave balance view");
  }
  if (!(await evaluate(client, `Boolean(document.querySelector('[role="dialog"]'))`))) {
    await evaluate(client, `(() => [...document.querySelectorAll('button')].find((button) => button.textContent.includes("Manage balance"))?.click())()`);
    await waitFor(client, `Boolean(document.querySelector('[data-leave-manage-actions]'))`, "Manage balance actions");
  }
  if (!(await evaluate(client, `Boolean(document.querySelector('[data-leave-manage-actions]'))`))) {
    await evaluate(client, `document.querySelector('[role="dialog"] button')?.click()`);
    await waitFor(client, `Boolean(document.querySelector('[data-leave-manage-actions]'))`, "Manage balance action list");
  }
  const opened = await evaluate(client, `(() => {
    const root = document.querySelector('[data-leave-manage-actions]');
    const action = [...(root?.querySelectorAll('button') || [])].find((button) => button.textContent.includes(${JSON.stringify(label)}));
    action?.click();
    return Boolean(action);
  })()`);
  assert.equal(opened, true, `Manage balance action ${label} is available`);
  await waitFor(client, `Boolean(document.querySelector('[data-leave-${label === "Change entitlement policy" ? "policy" : label === "Carry forward from last year" ? "carry" : label === "Manual adjustment" ? "adjustment" : "settlement"}-form]'))`, `${label} form`);
}

async function returnToManageActions(client) {
  await evaluate(client, `(() => [...document.querySelectorAll('[role="dialog"] button')].find((button) => button.textContent.includes("Back to actions"))?.click())()`);
  await waitFor(client, `Boolean(document.querySelector('[data-leave-manage-actions]'))`, "Manage balance actions returned");
}

async function hasStoredEvents(client, checks) {
  await waitFor(client, `(async () => {
    const opening = indexedDB.open("saatyar-db", 1);
    const db = await new Promise((resolve, reject) => { opening.onsuccess = () => resolve(opening.result); opening.onerror = () => reject(opening.error); });
    const stored = await new Promise((resolve, reject) => {
      const tx = db.transaction("app-data", "readonly");
      const request = tx.objectStore("app-data").get("current");
      request.onsuccess = () => resolve(request.result?.data || request.result);
      request.onerror = () => reject(request.error);
      tx.oncomplete = () => db.close();
    });
    const events = stored?.settings?.leaveEvents || [];
    return ${checks};
  })()`, "leave ledger persistence");
}

export async function exerciseLeaveAccrualBrowser(client, fixture) {
  const requestUi = await evaluate(client, `(() => {
    const tab = document.querySelector('[role="tab"][aria-controls="leave-panel-0"]');
    const cta = [...document.querySelectorAll('button')].find((button) => button.textContent.includes("Record new leave"));
    const bounds = cta?.getBoundingClientRect();
    return { requestsDefault: tab?.getAttribute("aria-selected") === "true", primaryMetricCount: document.querySelectorAll('[data-leave-primary-metrics] > article').length, ctaVisibleNearTop: Boolean(bounds && bounds.top >= 0 && bounds.top < innerHeight) };
  })()`);
  assert.equal(requestUi.requestsDefault, true, "Requests & History is the default Leave tab");
  assert.equal(requestUi.primaryMetricCount, 4, "Leave page shows exactly four primary balance metrics");
  assert.equal(requestUi.ctaVisibleNearTop, true, "Register leave CTA is visible near the top without scrolling");
  const priorLeaveCount = await evaluate(client, `JSON.parse(document.querySelector('script[data-app-state]')?.textContent || "null")?.data?.leaves?.length ?? 0`);
  await evaluate(client, `(() => [...document.querySelectorAll('button')].find((button) => button.textContent.includes("Record new leave"))?.click())()`);
  await waitFor(client, `Boolean(document.querySelector('[role="dialog"] [data-leave-dialog-form]'))`, "Register Leave dialog");
  const focusInsideDialog = await evaluate(client, `Boolean(document.querySelector('[role="dialog"]')?.contains(document.activeElement))`);
  assert.equal(focusInsideDialog, true, "opening Register Leave moves keyboard focus into its dialog");
  await client.call("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape" });
  await client.call("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape" });
  await waitFor(client, `!document.querySelector('[role="dialog"] [data-leave-dialog-form]')`, "Register Leave dialog closes with Escape");
  await evaluate(client, `(() => [...document.querySelectorAll('button')].find((button) => button.textContent.includes("Record new leave"))?.click())()`);
  await waitFor(client, `Boolean(document.querySelector('[role="dialog"] [data-leave-dialog-form]'))`, "Register Leave form ready for creation");
  for (let index = 0; index < 2; index += 1) {
    await evaluate(client, `document.querySelectorAll('[role="dialog"] [data-leave-dialog-form] button[aria-haspopup="dialog"]')[${index}]?.click()`);
    await waitFor(client, `Boolean([...document.querySelectorAll('button')].find((button) => button.textContent.trim() === "Today"))`, "leave date picker Today action");
    await evaluate(client, `(() => [...document.querySelectorAll('button')].find((button) => button.textContent.trim() === "Today")?.click())()`);
  }
  await evaluate(client, `document.querySelector('[data-leave-dialog-form]')?.requestSubmit()`);
  await waitFor(client, `!document.querySelector('[role="dialog"] [data-leave-dialog-form]')`, "leave request saved from top-of-page dialog");
  await waitFor(client, `(async () => {
    const opening = indexedDB.open("saatyar-db", 1);
    const db = await new Promise((resolve, reject) => { opening.onsuccess = () => resolve(opening.result); opening.onerror = () => reject(opening.error); });
    const stored = await new Promise((resolve, reject) => { const tx = db.transaction("app-data", "readonly"); const request = tx.objectStore("app-data").get("current"); request.onsuccess = () => resolve(request.result?.data || request.result); request.onerror = () => reject(request.error); tx.oncomplete = () => db.close(); });
    return (stored?.leaves?.length || 0) > ${Number(priorLeaveCount)};
  })()`, "top-of-page Leave request persistence");

  await evaluate(client, `document.querySelector('[role="tab"][aria-controls="leave-panel-1"]')?.click()`);
  await waitFor(client, `Boolean(document.querySelector('[data-leave-manage-actions]')) || [...document.querySelectorAll('button')].some((button) => button.textContent.includes("Manage balance"))`, "Leave balance tab");
  await openManageAction(client, "Change entitlement policy");
  await setField(client, "policy-hours", 17);
  await setField(client, "policy-minutes", 0);
  await clickFormSubmit(client, "[data-leave-policy-form]");
  await waitFor(client, `(async () => {
    const opening = indexedDB.open("saatyar-db", 1);
    const db = await new Promise((resolve, reject) => { opening.onsuccess = () => resolve(opening.result); opening.onerror = () => reject(opening.error); });
    const stored = await new Promise((resolve, reject) => { const tx = db.transaction("app-data", "readonly"); const request = tx.objectStore("app-data").get("current"); request.onsuccess = () => resolve(request.result?.data || request.result); request.onerror = () => reject(request.error); tx.oncomplete = () => db.close(); });
    return stored?.settings?.monthlyLeaveMinutes === 1020 && document.body?.innerText.includes("17:00");
  })()`, "monthly policy visible and persisted");

  await returnToManageActions(client);
  await openManageAction(client, "Carry forward from last year");
  await setField(client, "carry-year", fixture.year - 1);
  await setField(client, "carry-minutes", 1200);
  await setField(client, "carry-note", "Browser carry-forward check");
  await clickFormSubmit(client, "[data-leave-carry-form]");
  await hasStoredEvents(client, `events.some((event) => event.type === "carry-forward" && event.sourceYear === ${fixture.year - 1} && event.minutes === 1200) && document.body?.innerText.includes("20:00")`);

  await returnToManageActions(client);
  await openManageAction(client, "Manual adjustment");
  await setField(client, "adjustment-minutes", 60);
  await setField(client, "adjustment-note", "Browser adjustment check");
  await clickFormSubmit(client, "[data-leave-adjustment-form]");
  await hasStoredEvents(client, `events.some((event) => event.type === "adjustment" && event.minutes === 60 && event.note === "Browser adjustment check")`);

  await returnToManageActions(client);
  await openManageAction(client, "Year-end settlement");
  await setField(client, "settlement-year", fixture.settlementYear);
  await setField(client, "settlement-carry", 10920);
  await setField(client, "settlement-cash-out", 600);
  await setField(client, "settlement-note", "Browser settlement check");
  await clickFormSubmit(client, "[data-leave-settlement-form]");
  await clickFormSubmit(client, "[data-leave-settlement-form]");
  await hasStoredEvents(client, `events.some((event) => event.type === "carry-forward" && event.sourceYear === ${fixture.settlementYear} && event.minutes === 10920 && event.settlementId) && events.some((event) => event.type === "cash-out" && event.jalaliYear === ${fixture.settlementYear} && event.minutes === 600 && event.settlementId) && [...document.querySelectorAll('[data-leave-settlement-form] button[type="submit"]')].some((button) => button.disabled)`);
}
