import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { normalizePathname } from "@/lib/navigation";

const skeleton = "rounded-xl bg-[color-mix(in_srgb,var(--text-muted)_10%,transparent)]";

function Block({ className }: { className: string }) {
  return <span className={cn(skeleton, className)} />;
}

function Card({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <div className={cn("rounded-[var(--card-radius)] border border-[var(--dashboard-border)] bg-[var(--surface-1)]", className)}>
      {children}
    </div>
  );
}

function SectionLead() {
  return (
    <div className="grid gap-2">
      <Block className="h-2 w-20" />
      <Block className="h-3.5 w-40 max-w-[48vw]" />
    </div>
  );
}

function EmployeeTodayLoadingSkeleton() {
  return (
    <div data-loading-route="employee-today" className="grid gap-4">
      <Card className="grid min-h-[124px] grid-cols-[minmax(250px,.85fr)_minmax(0,1.55fr)_minmax(180px,.65fr)] items-center gap-5 px-5 py-4 max-[980px]:grid-cols-[minmax(0,1fr)_auto] max-[720px]:grid-cols-1 max-[359px]:min-h-0 max-[359px]:gap-3 max-[359px]:px-3 max-[359px]:py-3">
        <div className="grid grid-cols-[42px_minmax(0,1fr)_42px] gap-2 max-[980px]:order-2 max-[359px]:grid-cols-[36px_minmax(0,1fr)_36px] max-[359px]:gap-1.5">
          <Block className="h-[52px] w-[42px] max-[359px]:h-11 max-[359px]:w-9" />
          <Block className="h-[52px] w-full max-[359px]:h-11" />
          <Block className="h-[52px] w-[42px] max-[359px]:h-11 max-[359px]:w-9" />
        </div>
        <div className="grid justify-items-center gap-2 max-[980px]:order-1 max-[980px]:col-span-2 max-[720px]:col-span-1">
          <Block className="h-6 w-24 rounded-full" />
          <Block className="h-6 w-[min(380px,70vw)]" />
          <Block className="h-2.5 w-44" />
        </div>
        <div className="flex justify-end max-[980px]:order-3 max-[720px]:justify-center">
          <Block className="h-[52px] w-[150px]" />
        </div>
      </Card>

      <Card className="p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="grid gap-2"><Block className="h-3 w-28" /><Block className="h-2.5 w-44" /></div>
          <Block className="h-6 w-20 rounded-full" />
        </div>
        <div className="grid grid-cols-[minmax(190px,.72fr)_repeat(4,minmax(0,1fr))] gap-2.5 max-[1080px]:grid-cols-2 max-[620px]:grid-cols-1">
          {[0, 1, 2, 3, 4].map((item) => (
            <div key={item} className="grid min-h-[78px] content-center gap-2 rounded-[16px] border border-[var(--dashboard-border)] bg-[var(--surface-2)] p-3 max-[1080px]:first:col-span-2 max-[620px]:first:col-span-1">
              <Block className="h-2.5 w-16" /><Block className="h-4 w-24 max-w-full" />
            </div>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="grid min-h-[290px] grid-cols-[minmax(0,1.02fr)_minmax(320px,.98fr)] max-[1050px]:grid-cols-1">
          <div className="grid content-start gap-4 p-5 max-[359px]:gap-3 max-[359px]:p-3 sm:p-6">
            <Block className="h-3 w-28" />
            <Block className="h-2.5 w-56 max-w-[70%]" />
            <div className="grid gap-3 rounded-[20px] border border-[var(--dashboard-border)] bg-[var(--surface-2)] p-4">
              <Block className="h-3 w-36" />
              <Block className="h-24 w-full" />
              <Block className="h-10 w-full" />
            </div>
          </div>
          <div className="grid min-h-[290px] content-center justify-items-center gap-4 border-s border-[var(--dashboard-border)] bg-[var(--surface-2)] p-6 max-[1050px]:border-s-0 max-[1050px]:border-t max-[359px]:min-h-0 max-[359px]:gap-3 max-[359px]:p-3">
            <Block className="h-7 w-28 rounded-full" />
            <Block className="size-36 rounded-full max-[359px]:size-28" />
            <Block className="h-3 w-36" />
            <div className="grid w-full max-w-[352px] grid-cols-2 gap-3 max-[359px]:grid-cols-1 max-[359px]:gap-2"><Block className="h-14 w-full" /><Block className="h-14 w-full" /></div>
          </div>
        </div>
      </Card>

      <Card className="grid grid-cols-4 gap-2.5 p-3 max-[980px]:grid-cols-2 max-[620px]:grid-cols-1">
        {[0, 1, 2, 3].map((item) => <Block key={item} className="h-20 w-full" />)}
      </Card>
    </div>
  );
}

function FreelancerTodayLoadingSkeleton() {
  return (
    <div data-loading-route="freelancer-today" className="grid gap-4">
      <Card className="grid min-h-[112px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-4 max-[620px]:grid-cols-1 max-[359px]:min-h-0 max-[359px]:gap-3 max-[359px]:p-3">
        <div className="grid gap-2"><Block className="h-3 w-28" /><Block className="h-2.5 w-48 max-w-[70vw]" /></div>
        <Block className="h-10 w-32 rounded-full max-[620px]:w-full" />
      </Card>
      <Card className="overflow-hidden">
        <div className="grid grid-cols-[minmax(0,1.08fr)_minmax(360px,.92fr)] max-[1050px]:grid-cols-1">
          <div className="grid gap-4 border-e border-[var(--dashboard-border)] p-4 max-[1050px]:border-e-0 max-[1050px]:border-b max-[359px]:gap-3 max-[359px]:p-3 sm:p-5">
            <div className="flex items-center justify-between gap-3"><Block className="h-4 w-24" /><Block className="h-7 w-28 rounded-full" /></div>
            <div className="grid justify-items-center gap-3">
              <Block className="h-4 w-36" />
              <div className="flex items-center gap-2 max-[359px]:gap-1">
                {[0,1,2,3,4,5].map((item) => <Block key={item} className="h-14 w-10 rounded-[10px] max-[359px]:h-12 max-[359px]:w-[30px] max-[359px]:rounded-[8px]" />)}
              </div>
              <Block className="h-14 w-full rounded-2xl" />
              <div className="grid w-full grid-cols-2 gap-2 max-[359px]:grid-cols-1"><Block className="h-12 w-full max-[359px]:h-10" /><Block className="h-12 w-full max-[359px]:h-10" /></div>
            </div>
            <div className="border-t border-[var(--dashboard-border)] pt-4"><Block className="h-16 w-full rounded-xl" /><Block className="mt-3 h-16 w-full rounded-xl" /></div>
          </div>
          <div className="grid content-start gap-3 p-4 max-[359px]:p-3 sm:p-5">
            <Block className="h-4 w-36" />
            {[0,1,2].map((item) => <Block key={item} className="h-12 w-full rounded-xl" />)}
            <Block className="h-24 w-full rounded-xl" />
            <Block className="h-14 w-full rounded-xl" />
          </div>
        </div>
      </Card>
      <Card className="h-[220px] p-4 max-[359px]:h-[190px] max-[359px]:p-3"><Block className="h-4 w-32" /><Block className="mt-4 h-[150px] w-full" /></Card>
    </div>
  );
}

function MonthLoadingSkeleton() {
  return (
    <div data-loading-route="month" className="grid gap-5">
      <div className="flex min-h-[72px] flex-wrap items-center justify-between gap-4">
        <SectionLead />
        <div className="flex gap-2"><Block className="h-10 w-28" /><Block className="h-10 w-44" /></div>
      </div>

      <div className="grid grid-cols-4 gap-3.5 max-[1180px]:grid-cols-2 max-[620px]:grid-cols-1">
        {[0, 1, 2, 3].map((item) => (
          <Card key={item} className="grid min-h-24 content-center gap-3 p-4"><Block className="h-2.5 w-20" /><Block className="h-5 w-28 max-w-full" /></Card>
        ))}
      </div>

      <div className="grid gap-3">
        <SectionLead />
        <div className="grid grid-cols-[minmax(0,1.7fr)_minmax(280px,.3fr)] gap-4 max-[980px]:grid-cols-1">
          <Card className="grid min-h-[330px] content-start gap-4 p-4 sm:p-5">
            <div className="flex justify-between gap-4"><Block className="h-3 w-32" /><Block className="h-8 w-24" /></div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }, (_, item) => <Block key={item} className="aspect-square w-full rounded-lg" />)}
            </div>
          </Card>
          <Card className="grid min-h-[330px] content-start gap-4 p-4 sm:p-5">
            <Block className="h-3 w-28" />
            <div className="mt-auto flex h-52 items-end gap-2 border-b border-[var(--dashboard-border)] pb-2">
              {[44, 62, 38, 75, 54, 82, 48].map((height, item) => (
                <span key={item} style={{ height: `${height}%` }} className="flex w-full items-end">
                  <Block className="h-full w-full rounded-t-lg" />
                </span>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-3">
        <SectionLead />
        <div className="grid items-stretch grid-cols-[minmax(340px,.95fr)_minmax(300px,.78fr)_minmax(340px,1fr)] gap-4 max-[1180px]:grid-cols-1">
          {["heatmap", "recent", "intelligence"].map((kind) => (
            <Card key={kind} className="grid min-h-[382px] content-start gap-4 p-4" >
              <div className="flex items-center gap-2.5"><Block className="size-9" /><Block className="h-3.5 w-28" /></div>
              {kind === "heatmap" ? (
                <div className="mx-auto mt-2 grid grid-cols-6 gap-2">{Array.from({ length: 42 }, (_, item) => <Block key={item} className="size-8 rounded-[7px]" />)}</div>
              ) : kind === "recent" ? (
                <div className="grid gap-2">{Array.from({ length: 7 }, (_, item) => <Block key={item} className="h-9 w-full" />)}</div>
              ) : (
                <><div className="grid grid-cols-2 gap-2">{Array.from({ length: 4 }, (_, item) => <Block key={item} className="h-16 w-full" />)}</div><Block className="h-16 w-full" /></>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function GenericLoadingSkeleton() {
  return (
    <div data-loading-route="generic" className="grid gap-5">
      <div className="flex min-h-[72px] items-center justify-between gap-4"><SectionLead /><Block className="h-10 w-28" /></div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[0, 1, 2, 3].map((item) => <Card key={item} className="h-24" />)}</div>
      <div className="grid gap-4 lg:grid-cols-[1.3fr_.7fr]"><Card className="h-[300px]" /><Card className="h-[300px]" /></div>
    </div>
  );
}

export function RouteLoadingSkeleton({ pathname }: { pathname: string }) {
  const route = normalizePathname(pathname);
  if (route === "/freelancer/today") return <FreelancerTodayLoadingSkeleton />;
  if (route === "/employee/today") return <EmployeeTodayLoadingSkeleton />;
  if (route === "/hybrid/today" || route === "/today") return <EmployeeTodayLoadingSkeleton />;
  if (route === "/month") return <MonthLoadingSkeleton />;
  return <GenericLoadingSkeleton />;
}
