import { CircleDollarSign, Clock3, Folder, Plus, Users } from "lucide-react";
import { MetricCard } from "@/components/common/metric-card";
import { PageHeading } from "@/components/common/page-heading";
import { Button } from "@/components/ui/button";
import { duration, entryMinutes, fa, money } from "@/lib/format";
import { tw } from "@/lib/tw";
import type { AppData, ClientDraft, Tab } from "@/lib/types";
import { ClientForm } from "./client-form";
import { ClientsTable } from "./clients-table";
import { TopClients } from "./top-clients";

export function ClientsPage({ data, setData, showForm, setShowForm, draft, setDraft, addClient, setTab }: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  showForm: boolean;
  setShowForm: (value: boolean) => void;
  draft: ClientDraft;
  setDraft: React.Dispatch<React.SetStateAction<ClientDraft>>;
  addClient: () => void;
  setTab: (tab: Tab) => void;
}) {
  const active = data.clients.filter((client) => !client.archived);
  return (
    <>
      <PageHeading title="مشتری‌ها" description="مشتری‌ها، پروژه‌ها و درآمدت را یک‌جا مدیریت کن."><Button onClick={() => setShowForm(!showForm)}><Plus /> مشتری جدید</Button></PageHeading>
      {showForm && <ClientForm draft={draft} setDraft={setDraft} onSave={addClient} onCancel={() => setShowForm(false)} />}
      <section className={tw("metric-grid", "four")}><MetricCard icon={<Users />} label="مشتری فعال" value={fa.format(active.length)} suffix="مشتری" /><MetricCard icon={<Folder />} label="پروژه فعال" value={fa.format(data.projects.filter((project) => project.status === "active").length)} suffix="پروژه" /><MetricCard icon={<Clock3 />} label="زمان این ماه" value={duration(data.timeEntries.reduce((sum, entry) => sum + entryMinutes(entry), 0))} suffix="ساعت" /><MetricCard icon={<CircleDollarSign />} label="مبلغ قابل صورتحساب" value={money(data.timeEntries.reduce((sum, entry) => sum + (entry.billable ? entryMinutes(entry) / 60 * entry.effectiveRate : 0), 0))} suffix="تومان" /></section>
      <section className={tw("dashboard-grid", "clients-layout")}><ClientsTable data={data} setData={setData} /><TopClients data={data} setTab={setTab} /></section>
    </>
  );
}
