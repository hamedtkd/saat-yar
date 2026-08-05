import { StatusBadge } from "@/components/common/status-badge";
import { duration, entryMinutes, jalali, money } from "@/lib/format";
import type { AppData, TimeEntry } from "@/lib/types";
import { FREELANCER_HEADINGS, TableHeading } from "./report-table-shared";

type Props = { data: AppData; entries: TimeEntry[]; financialsHidden: boolean };
export function FreelancerDesktopTable({ data, entries, financialsHidden }: Props) {
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
    <div className="hidden w-full overflow-x-auto px-4 pb-5 pt-3 md:block sm:px-5">
      <table className="w-full min-w-245 border-collapse text-[11px]">
        <thead>
          <tr>
            {FREELANCER_HEADINGS.map((heading) => (
              <TableHeading key={heading}>{heading}</TableHeading>
            ))}
          </tr>
        </thead>

        <tbody>
          {entries.map((entry) => {
            const project = data.projects.find(
              (item) => item.id === entry.projectId,
            );

            const client = data.clients.find(
              (item) => item.id === entry.clientId,
            );

            const minutes = entryMinutes(entry);

            const amount = entry.billable
              ? (minutes / 60) * Math.max(0, entry.effectiveRate)
              : 0;

            return (
              <tr
                key={entry.id}
                className="transition-colors hover:bg-[var(--surface-2)]"
              >
                <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3 text-[var(--text)]">
                  {jalali(entry.startedAt, {
                    day: "numeric",
                    month: "long",
                  })}
                </td>

                <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3 text-[var(--text)]">
                  {client?.name || "—"}
                </td>

                <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3">
                  <strong className="text-[var(--text)]">
                    {project?.name || "—"}
                  </strong>
                </td>

                <td className="max-w-65 border-b border-[var(--border)] px-3 py-3 text-[var(--text)]">
                  <span
                    className="block truncate"
                    title={entry.note || entry.task || undefined}
                  >
                    {entry.note || entry.task || "—"}
                  </span>
                </td>

                <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3 font-extrabold text-[var(--text)]">
                  {duration(minutes)}
                </td>

                <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3 text-[var(--text)]">
                  {financialsHidden ? "••••••" : money(entry.effectiveRate)} تومان
                </td>

                <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3 font-extrabold text-[var(--text)]">
                  {financialsHidden ? "••••••" : money(amount)} تومان
                </td>

                <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3">
                  <StatusBadge success={entry.billable}>
                    {entry.billable ? "قابل صورتحساب" : "غیرقابل صورتحساب"}
                  </StatusBadge>
                </td>
              </tr>
            );
          })}
        </tbody>

        {entries.length > 0 && (
          <tfoot>
            <tr className="bg-[var(--surface-2)]">
              <td
                colSpan={4}
                className="border-t border-[var(--border)] px-3 py-3 font-extrabold text-[var(--text)]"
              >
                جمع رکوردهای نمایش‌داده‌شده
              </td>

              <td className="border-t border-[var(--border)] px-3 py-3 font-extrabold text-[var(--text)]">
                {duration(totalMinutes)}
              </td>

              <td className="border-t border-[var(--border)] px-3 py-3" />

              <td className="border-t border-[var(--border)] px-3 py-3 font-black text-[var(--accent-strong)]">
                {financialsHidden ? "••••••" : money(totalIncome)} تومان
              </td>

              <td className="border-t border-[var(--border)] px-3 py-3" />
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

