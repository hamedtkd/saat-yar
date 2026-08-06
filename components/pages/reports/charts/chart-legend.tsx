import { cn } from "@/lib/cn";

export type ChartLegendItem = {
  label: string;
  color: string;
  dashed?: boolean;
};

export function ChartLegend({ items, className }: {
  items: ChartLegendItem[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", className)}>
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-2 text-[10px] font-semibold text-[var(--text-muted)]">
          <i
            aria-hidden="true"
            className={cn("h-2.5 w-2.5 rounded-full", item.dashed && "h-0 w-4 rounded-none border-t-2 border-dashed")}
            style={item.dashed ? { borderColor: item.color } : { backgroundColor: item.color }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}
