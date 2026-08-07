import { CircleDollarSign, Clock3, Folder, Plus, Sparkles, Users } from "lucide-react";
import { MetricCard } from "@/components/common/metric-card";
import { PageHeading } from "@/components/common/page-heading";
import { PrivateMoney } from "@/components/common/private-money";
import { SectionHeading } from "@/components/common/section-heading";
import { Button } from "@/components/ui/button";
import { duration, fa } from "@/lib/format";
import type { AppData, ClientDraft, ProjectDraft, Tab } from "@/lib/types";
import { ClientForm } from "./client-form";
import { ClientsTable } from "./clients-table";
import { TopClients } from "./top-clients";
import { useClientMetrics } from "./use-client-metrics";

export function ClientsPage({ data, setData, showForm, setShowForm, draft, setDraft, addClient, createProject, setTab, financialsHidden }: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  showForm: boolean;
  setShowForm: (value: boolean) => void;
  draft: ClientDraft;
  setDraft: React.Dispatch<React.SetStateAction<ClientDraft>>;
  addClient: () => void;
  createProject: (draft: ProjectDraft) => string | undefined;
  setTab: (tab: Tab) => void;
  financialsHidden: boolean;
}) {
  const metrics = useClientMetrics(data);

  return (
    <>
      <PageHeading title="مشتری‌ها" description="مشتری‌ها، پروژه‌ها، زمان و درآمد را با یک نمای منسجم مدیریت کن.">
        <Button onClick={() => setShowForm(!showForm)}><Plus /> مشتری جدید</Button>
      </PageHeading>

      {showForm && <ClientForm draft={draft} setDraft={setDraft} onSave={addClient} onCancel={() => setShowForm(false)} />}

      <section className="mb-5">
        <SectionHeading icon={<Sparkles />} eyebrow="نمای کلی" title="وضعیت کسب‌وکار" description="شاخص‌های مهم مشتری‌ها و پروژه‌های فعال را یک‌جا ببین." />
        <div className="grid grid-cols-4 gap-3 max-[1180px]:grid-cols-2 max-[620px]:grid-cols-1">
          <MetricCard icon={<Users />} label="مشتری فعال" value={fa.format(metrics.activeClients)} suffix="مشتری" />
          <MetricCard icon={<Folder />} label="پروژه فعال" value={fa.format(metrics.activeProjects)} suffix="پروژه" />
          <MetricCard icon={<Clock3 />} label="زمان این ماه" value={duration(metrics.trackedMinutes)} suffix="ساعت" tone="blue" />
          <MetricCard icon={<CircleDollarSign />} label="مبلغ قابل صورتحساب" value={<PrivateMoney value={metrics.billableAmount} hidden={financialsHidden} />} suffix="تومان" />
        </div>
      </section>

      <section>
        <SectionHeading icon={<Users />} eyebrow="مدیریت ارتباط" title="فهرست و مشتری‌های برتر" description="وضعیت هر مشتری را مرور کن و سریع به پروژه‌های مرتبط برس." />
        <div className="grid grid-cols-[minmax(0,1fr)_365px] gap-[14px] max-[1180px]:grid-cols-[minmax(0,1fr)_280px] max-[900px]:grid-cols-1">
          <ClientsTable data={data} setData={setData} createProject={createProject} onCreate={() => setShowForm(true)} financialsHidden={financialsHidden} />
          <TopClients data={data} setTab={setTab} />
        </div>
      </section>
    </>
  );
}
