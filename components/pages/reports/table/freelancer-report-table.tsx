import { PanelHead } from "@/components/common/panel-head";
import type { AppData, TimeEntry } from "@/lib/types";
import { FreelancerDesktopTable } from "./freelancer-desktop-table";
import { FreelancerMobileCards } from "./freelancer-mobile-cards";

type Props = { data: AppData; entries: TimeEntry[]; financialsHidden: boolean };
export function FreelancerReportTable({ data, entries, financialsHidden }: Props) {
  return (
    <article
      className={cn(
        "min-w-0 overflow-hidden rounded-2xl",
        "border border-[#dfe7e9]",
        "bg-white/95",
        "shadow-[0_10px_35px_rgba(17,45,55,0.055)]",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
        <PanelHead icon={<FileSpreadsheet />} title="جزئیات رکوردهای پروژه" />

        {entries.length > 0 && (
          <span className="rounded-full bg-[#f1f7f5] px-3 py-1.5 text-[10px] font-bold text-[#526b75]">
            {faDigits(String(entries.length))} رکورد
          </span>
        )}
      </div>

      {entries.length > 0 ? (
        <>
          <FreelancerDesktopTable data={data} entries={entries} financialsHidden={financialsHidden} />

          <FreelancerMobileCards data={data} entries={entries} financialsHidden={financialsHidden} />
        </>
      ) : (
        <div className="p-4 sm:p-5">
          <EmptyState
            icon={<Filter />}
            title="رکوردی با این فیلتر پیدا نشد"
            description="فیلترها را تغییر بده یا تایمر پروژه را شروع کن."
          />
        </div>
      )}
    </article>
  );
}

