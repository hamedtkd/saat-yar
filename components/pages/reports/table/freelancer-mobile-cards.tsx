import { StatusBadge } from "@/components/common/status-badge";
import { duration, entryMinutes, jalali, money } from "@/lib/format";
import type { AppData, TimeEntry } from "@/lib/types";
import { InfoRow } from "./report-table-shared";

type Props = { data: AppData; entries: TimeEntry[]; financialsHidden: boolean };
export function FreelancerMobileCards({ data, entries, financialsHidden }: Props) {
  const totalMinutes = entries.reduce(
    (sum, entry) => sum + entryMinutes(entry),
    0,
  );

  const totalIncome = entries.reduce((sum, entry) => {
    if (!entry.billable) {
      return sum;
    }

    return sum + (entryMinutes(entry) / 60) * Math.max(0, entry.effectiveRate);
  }, 0);

  return (
    <div className="grid gap-3 p-4 md:hidden">
      {entries.map((entry) => {
        const project = data.projects.find(
          (item) => item.id === entry.projectId,
        );

        const client = data.clients.find((item) => item.id === entry.clientId);

        const minutes = entryMinutes(entry);

        const amount = entry.billable
          ? (minutes / 60) * Math.max(0, entry.effectiveRate)
          : 0;

        return (
          <article
            key={entry.id}
            className={cn(
              "rounded-2xl border border-[#e2ebe8]",
              "bg-[#fbfdfc] p-4",
              "shadow-[0_6px_20px_rgba(17,45,55,0.035)]",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <strong className="block truncate text-sm font-extrabold text-[#102a3a]">
                  {project?.name || "بدون پروژه"}
                </strong>

                <span className="mt-1 block text-[10px] text-[#6c7d89]">
                  {client?.name || "بدون مشتری"}
                </span>
              </div>

              <StatusBadge success={entry.billable}>
                {entry.billable ? "قابل صورتحساب" : "غیرقابل"}
              </StatusBadge>
            </div>

            <p className="mt-3 text-[10px] text-[#6c7d89]">
              {jalali(entry.startedAt, {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>

            <div className="mt-3 grid gap-2">
              <InfoRow label="مدت" value={duration(minutes)} />

              <InfoRow
                label="نرخ مؤثر"
                value={`${financialsHidden ? "••••••" : money(entry.effectiveRate)} تومان`}
              />

              <InfoRow
                label="مبلغ"
                value={`${financialsHidden ? "••••••" : money(amount)} تومان`}
                valueClassName={
                  entry.billable ? "text-[#079b60]" : "text-[#6c7d89]"
                }
              />
            </div>

            {(entry.note || entry.task) && (
              <div className="mt-3 rounded-xl border border-[#e7efed] bg-white px-3 py-3">
                <span className="block text-[9px] text-[#6c7d89]">
                  شرح فعالیت
                </span>

                <p className="mt-1 text-[11px] leading-6 text-[#2e4856]">
                  {entry.note || entry.task}
                </p>
              </div>
            )}
          </article>
        );
      })}

      {entries.length > 0 && (
        <article className="rounded-2xl border border-[#cfe6de] bg-[#edf9f4] p-4">
          <strong className="block text-sm font-extrabold text-[#102a3a]">
            جمع رکوردهای نمایش‌داده‌شده
          </strong>

          <div className="mt-3 grid gap-2">
            <InfoRow label="زمان کل" value={duration(totalMinutes)} />

            <InfoRow
              label="درآمد"
              value={`${financialsHidden ? "••••••" : money(totalIncome)} تومان`}
              valueClassName="text-[#079b60]"
            />
          </div>
        </article>
      )}
    </div>
  );
}

