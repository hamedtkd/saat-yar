export function buildEmployeePersistenceProbeExpression({ date, note }) {
  return `(() => new Promise((resolve) => {
    const request = indexedDB.open("saatyar-db", 1);
    request.onerror = () => resolve({ ready: false, error: "open-failed" });
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("app-data")) {
        db.close();
        resolve({ ready: false, error: "store-missing" });
        return;
      }
      const tx = db.transaction("app-data", "readonly");
      const read = tx.objectStore("app-data").get("current");
      read.onerror = () => { db.close(); resolve({ ready: false, error: "read-failed" }); };
      read.onsuccess = () => {
        const stored = read.result;
        const data = stored?.format === "saatyar-app-data" && stored?.data ? stored.data : stored;
        const record = data?.records?.[${JSON.stringify(date)}];
        const checks = {
          mode: data?.settings?.mode === "employee",
          record: Boolean(record),
          start: record?.start === "08:00",
          end: record?.end === "17:00",
          lunch: record?.lunchStart === "12:00" && record?.lunchEnd === "12:30" && Number(record?.lunchMinutes) === 30,
          break: Array.isArray(record?.breaks) && record.breaks.some((item) => item?.start === "15:00" && item?.end === "15:15" && item?.paid === false),
          note: record?.note === ${JSON.stringify(note)},
        };
        db.close();
        resolve({
          ready: Object.values(checks).every(Boolean),
          storageShape: stored?.format === "saatyar-app-data" ? "snapshot-envelope" : "raw-app-data",
          schemaVersion: stored?.schemaVersion ?? data?.schemaVersion ?? null,
          checks,
          record: record ? {
            start: record.start,
            end: record.end,
            lunchStart: record.lunchStart,
            lunchEnd: record.lunchEnd,
            lunchMinutes: record.lunchMinutes,
            breakCount: Array.isArray(record.breaks) ? record.breaks.length : 0,
            breaks: Array.isArray(record.breaks) ? record.breaks.map((item) => ({ start: item.start, end: item.end, paid: item.paid })) : [],
            note: record.note,
          } : null,
        });
      };
    };
  }))()`;
}
