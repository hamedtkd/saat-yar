import { Check, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EditableCardActions({
  editing,
  dirty,
  autoSave,
  onEdit,
  onSave,
  onCancel,
}: {
  editing: boolean;
  dirty: boolean;
  autoSave: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  if (autoSave) {
    return <span className="rounded-full bg-[var(--success-soft)] px-2.5 py-1 text-[9px] font-bold text-[var(--success)]">ذخیره خودکار</span>;
  }

  if (!editing) {
    return <Button type="button" size="sm" variant="outline" onClick={onEdit}><Pencil /> ویرایش</Button>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" size="sm" variant="ghost" onClick={onCancel}><X /> انصراف</Button>
      <Button type="button" size="sm" onClick={onSave} disabled={!dirty}><Check /> ذخیره</Button>
    </div>
  );
}
