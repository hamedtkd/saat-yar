import { Download, FileSpreadsheet } from "lucide-react";

import { Button } from "@/components/ui/button";

type ReportActionsProps = {
  onExport: (kind: "excel" | "csv") => void;
};

export function ReportActions({ onExport }: ReportActionsProps) {
  return (
    <div className="flex items-center gap-2.5 max-[620px]:flex-wrap">
      <Button type="button" variant="outline" onClick={() => onExport("csv")}>
        <Download className="size-4" />
        خروجی CSV
      </Button>
      <Button type="button" onClick={() => onExport("excel")}>
        <FileSpreadsheet className="size-4" />
        خروجی Excel
      </Button>
    </div>
  );
}
