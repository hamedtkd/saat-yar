export function buildFreelancerPersistenceProbeExpression({
  clientName,
  projectName,
  expenseName,
  invoiceDescription,
}) {
  return `(async () => {
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
      tx.oncomplete = () => db.close();
    });
    const envelope = stored && stored.format === "saatyar-app-data" && stored.data ? stored : null;
    const data = envelope ? envelope.data : stored;
    const project = data?.projects?.find((item) => item.name === ${JSON.stringify(projectName)});
    const clientReady = Boolean(data?.clients?.some((item) => item.name === ${JSON.stringify(clientName)}));
    const projectReady = Boolean(project);
    const timeReady = Boolean(project && data?.timeEntries?.some((item) => item.projectId === project.id && item.endedAt));
    const expenseReady = Boolean(project && data?.expenses?.some((item) => item.projectId === project.id && item.title === ${JSON.stringify(expenseName)}));
    const invoiceReady = Boolean(project && data?.invoices?.some((item) => item.projectId === project.id && item.lines?.some((line) => line.description === ${JSON.stringify(invoiceDescription)})));
    return {
      ready: clientReady && projectReady && timeReady && expenseReady && invoiceReady,
      storageShape: envelope ? "snapshot-envelope" : stored ? "legacy-raw" : "missing",
      schemaVersion: envelope?.schemaVersion ?? null,
      savedAt: envelope?.savedAt ?? null,
      checks: { client: clientReady, project: projectReady, timeEntry: timeReady, expense: expenseReady, invoice: invoiceReady },
      counts: {
        clients: data?.clients?.length ?? 0,
        projects: data?.projects?.length ?? 0,
        timeEntries: data?.timeEntries?.length ?? 0,
        expenses: data?.expenses?.length ?? 0,
        invoices: data?.invoices?.length ?? 0,
      },
    };
  })()`;
}
