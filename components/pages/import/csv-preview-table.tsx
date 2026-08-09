import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import type { CsvImportPreview } from "@/lib/import-wizard";

export function CsvPreviewTable({ preview }: { preview: CsvImportPreview }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--dashboard-border)]">
      <div className="max-h-[310px] overflow-auto">
        <table className="w-full min-w-[620px] border-collapse text-start text-[11px]">
          <thead className="sticky top-0 bg-[var(--surface-2)] text-[var(--text-muted)]"><tr><th className="p-3 text-start">ردیف</th><th className="p-3 text-start">مورد</th><th className="p-3 text-start">وضعیت</th><th className="p-3 text-start">جزئیات</th></tr></thead>
          <tbody>
            {preview.rows.slice(0, 80).map((row) => (
              <tr key={row.rowNumber} className="border-t border-[var(--dashboard-border)] bg-[var(--surface-1)]">
                <td className="p-3 text-[var(--text-muted)]">{row.rowNumber}</td>
                <td className="p-3 font-semibold text-[var(--text)]">{row.label}</td>
                <td className="p-3">
                  {row.status === "ready" && <StatusBadge tone="success"><CheckCircle2 className="me-1 size-3" /> آماده</StatusBadge>}
                  {row.status === "conflict" && <StatusBadge tone="warning"><AlertTriangle className="me-1 size-3" /> تعارض</StatusBadge>}
                  {row.status === "invalid" && <StatusBadge tone="danger"><ShieldAlert className="me-1 size-3" /> نامعتبر</StatusBadge>}
                </td>
                <td className="p-3 text-[var(--text-muted)]">{row.issues.length ? row.issues.join("، ") : row.status === "conflict" ? "مورد مشابه از قبل وجود دارد" : "آماده اعمال"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {preview.rows.length > 80 && <p className="border-t border-[var(--dashboard-border)] bg-[var(--surface-2)] p-2 text-center text-[10px] text-[var(--text-muted)]">برای سبک ماندن Preview فقط ۸۰ ردیف اول نمایش داده شده است.</p>}
    </div>
  );
}
