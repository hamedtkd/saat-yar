import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CSV_IMPORT_FIELDS, type CsvImportKind, type CsvMapping } from "@/lib/import-wizard";

export function CsvMappingGrid({ kind, headers, mapping, onChange }: {
  kind: CsvImportKind;
  headers: string[];
  mapping: CsvMapping;
  onChange: (field: string, header: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2" data-import-mapping>
      {CSV_IMPORT_FIELDS[kind].map((field) => (
        <label key={field.key} className="grid gap-1.5 rounded-xl border border-[var(--dashboard-border)] bg-[var(--surface-2)] p-3 text-[11px] font-semibold text-[var(--text-muted)]">
          <span>{field.label}{field.required && <span className="ms-1 text-[var(--danger)]">*</span>}</span>
          <Select value={mapping[field.key] || "__ignore__"} onValueChange={(value) => onChange(field.key, value === "__ignore__" ? "" : value)}>
            <SelectTrigger aria-label={`ستون ${field.label}`}><SelectValue placeholder="انتخاب ستون" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__ignore__">نادیده بگیر</SelectItem>
              {headers.map((header) => <SelectItem key={header} value={header}>{header}</SelectItem>)}
            </SelectContent>
          </Select>
        </label>
      ))}
    </div>
  );
}
