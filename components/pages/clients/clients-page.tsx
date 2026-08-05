import { CircleDollarSign, Clock3, Folder, Plus, Users } from "lucide-react";
import { MetricCard } from "@/components/common/metric-card";
import { PrivateMoney } from "@/components/common/private-money";
import { PageHeading } from "@/components/common/page-heading";
import { Button } from "@/components/ui/button";
import { duration, fa } from "@/lib/format";
import type { AppData, ClientDraft, Tab } from "@/lib/types";
import { ClientForm } from "./client-form";
import { ClientsTable } from "./clients-table";
import { TopClients } from "./top-clients";
import { cn } from "@/lib/cn";
import { useClientMetrics } from "./use-client-metrics";

export function ClientsPage({ data, setData, showForm, setShowForm, draft, setDraft, addClient, setTab, financialsHidden }: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  showForm: boolean;
  setShowForm: (value: boolean) => void;
  draft: ClientDraft;
  setDraft: React.Dispatch<React.SetStateAction<ClientDraft>>;
  addClient: () => void;
  setTab: (tab: Tab) => void;
  financialsHidden: boolean;
}) {
  const metrics = useClientMetrics(data);
  return (
    <>
      <PageHeading title="مشتری‌ها" description="مشتری‌ها، پروژه‌ها و درآمدت را یک‌جا مدیریت کن."><Button onClick={() => setShowForm(!showForm)}><Plus /> مشتری جدید</Button></PageHeading>
      {showForm && <ClientForm draft={draft} setDraft={setDraft} onSave={addClient} onCancel={() => setShowForm(false)} />}
      <section className={cn("mb-[18px] grid gap-3", "grid-cols-4 max-[1180px]:grid-cols-2 max-[620px]:grid-cols-1")}><MetricCard icon={<Users />} label="مشتری فعال" value={fa.format(metrics.activeClients)} suffix="مشتری" /><MetricCard icon={<Folder />} label="پروژه فعال" value={fa.format(metrics.activeProjects)} suffix="پروژه" /><MetricCard icon={<Clock3 />} label="زمان این ماه" value={duration(metrics.trackedMinutes)} suffix="ساعت" /><MetricCard icon={<CircleDollarSign />} label="مبلغ قابل صورتحساب" value={<PrivateMoney value={metrics.billableAmount} hidden={financialsHidden} />} suffix="تومان" /></section>
      <section className={cn("grid grid-cols-[minmax(0,1fr)_320px] gap-[14px] max-[900px]:grid-cols-1", "grid-cols-[minmax(0,1fr)_365px] max-[1180px]:grid-cols-[minmax(0,1fr)_280px] max-[900px]:grid-cols-1")}><ClientsTable data={data} setData={setData} financialsHidden={financialsHidden} /><TopClients data={data} setTab={setTab} /></section>
    </>
  );
}
