"use client";

import { Check, Pencil, X } from "lucide-react";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { Button } from "@/components/ui/button";

export function EditableCardActions({ editing, dirty, autoSave, onEdit, onSave, onCancel }: {
  editing: boolean;
  dirty: boolean;
  autoSave: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const { s } = useSystemUi();
  if (!editing) return <Button type="button" variant="outline" size="sm" onClick={onEdit}><Pencil /> {s("Edit")}</Button>;
  if (autoSave) return <Button type="button" variant="ghost" size="sm" onClick={onCancel}><X /> {s("Cancel")}</Button>;
  return <div className="flex flex-wrap items-center gap-2"><Button type="button" size="sm" disabled={!dirty} onClick={onSave}><Check /> {s("Save")}</Button><Button type="button" variant="ghost" size="sm" onClick={onCancel}><X /> {s("Cancel")}</Button></div>;
}
