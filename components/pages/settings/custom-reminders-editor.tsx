"use client";

import { BellDot, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { NumberField } from "@/components/common/number-field";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CustomReminderSettings } from "@/lib/types";

const MAX_CUSTOM_REMINDERS = 5;

function createReminder(): CustomReminderSettings {
  return {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    enabled: true,
    intervalMinutes: 60,
    title: "",
    message: "",
  };
}

type Props = {
  reminders: CustomReminderSettings[];
  disabled: boolean;
  onChange: (reminders: CustomReminderSettings[]) => void;
};

export function CustomRemindersEditor({ reminders, disabled, onChange }: Props) {
  const { s } = useSystemUi();
  const [editingId, setEditingId] = useState<string | null>(null);

  const updateReminder = (id: string, patch: Partial<CustomReminderSettings>) => {
    onChange(reminders.map((item) => item.id === id ? { ...item, ...patch } : item));
  };

  const addReminder = () => {
    if (reminders.length >= MAX_CUSTOM_REMINDERS) return;
    const reminder = createReminder();
    onChange([...reminders, reminder]);
    setEditingId(reminder.id);
  };

  const deleteReminder = (id: string) => {
    onChange(reminders.filter((item) => item.id !== id));
    setEditingId((current) => current === id ? null : current);
  };

  return (
    <section data-custom-reminder className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3.5 sm:p-4 lg:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <span className="flex min-w-0 flex-1 items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent-strong)]"><BellDot /></span>
          <span className="grid min-w-0 gap-1">
            <strong className="text-[11px] text-[var(--text)]">{s("Custom active-work reminders")}</strong>
            <small className="text-[9px] leading-4 text-[var(--text-muted)]">{s("Create up to five independent reminders based only on real active work; lunch and breaks never count.")}</small>
          </span>
        </span>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={disabled || reminders.length >= MAX_CUSTOM_REMINDERS}
          onClick={addReminder}
          data-add-custom-reminder
        >
          <Plus /> {s("Add reminder")}
        </Button>
      </div>

      {reminders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] px-3 py-4 text-center text-[10px] font-semibold leading-5 text-[var(--text-muted)]">
          {s("No custom reminders yet. Add one when you want a personal nudge after a specific amount of active work.")}
        </div>
      ) : (
        <div className="grid gap-2">
          {reminders.map((reminder, index) => {
            const editing = editingId === reminder.id;
            const title = reminder.title.trim() || s("Reminder {number}", { number: index + 1 });
            return (
              <article key={reminder.id} data-custom-reminder-item className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-3">
                <div className="flex min-w-0 flex-wrap items-center gap-2.5">
                  <Checkbox
                    disabled={disabled}
                    checked={reminder.enabled}
                    onCheckedChange={(enabled) => updateReminder(reminder.id, { enabled })}
                    aria-label={s("Enable reminder {number}", { number: index + 1 })}
                  />
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setEditingId(editing ? null : reminder.id)}
                    className="min-w-0 flex-1 text-start disabled:cursor-default"
                  >
                    <strong className="block truncate text-[10px] font-black text-[var(--text)]">{title}</strong>
                    <small className="mt-0.5 block text-[9px] font-semibold text-[var(--text-muted)]">{s("Every {minutes} active minutes", { minutes: reminder.intervalMinutes })}</small>
                  </button>
                  <div className="ms-auto flex shrink-0 items-center gap-1">
                    <Button type="button" size="icon" variant="ghost" className="size-8" disabled={disabled} onClick={() => setEditingId(editing ? null : reminder.id)} aria-label={s("Edit reminder {number}", { number: index + 1 })}><Pencil /></Button>
                    <Button type="button" size="icon" variant="ghost" className="size-8 text-[var(--danger)]" disabled={disabled} onClick={() => deleteReminder(reminder.id)} aria-label={s("Delete reminder {number}", { number: index + 1 })}><Trash2 /></Button>
                  </div>
                </div>

                {editing && (
                  <div className="mt-3 grid gap-3 border-t border-[var(--border)] pt-3">
                    <label className="grid gap-1.5 text-[10px] font-bold text-[var(--text-muted)]">
                      <span>{s("Custom reminder interval")}</span>
                      <div className="flex items-center gap-2">
                        <NumberField disabled={disabled} className="h-10 min-w-0 flex-1" min={15} max={240} value={reminder.intervalMinutes} onValueChange={(intervalMinutes) => updateReminder(reminder.id, { intervalMinutes: Math.min(240, Math.max(15, intervalMinutes)) })} />
                        <span className="shrink-0">{s("Minutes")}</span>
                      </div>
                    </label>
                    <label className="grid gap-1.5 text-[10px] font-bold text-[var(--text-muted)]"><span>{s("Reminder title")}</span><Input disabled={disabled} maxLength={80} value={reminder.title} placeholder={s("Custom work reminder")} onChange={(event) => updateReminder(reminder.id, { title: event.target.value })} /></label>
                    <label className="grid gap-1.5 text-[10px] font-bold text-[var(--text-muted)]"><span>{s("Reminder message")}</span><Textarea disabled={disabled} maxLength={180} value={reminder.message} placeholder={s("You have reached another active-work reminder interval.")} onChange={(event) => updateReminder(reminder.id, { message: event.target.value })} /></label>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <p className="text-[9px] font-semibold leading-4 text-[var(--text-muted)]">
        {reminders.length >= MAX_CUSTOM_REMINDERS ? s("You can keep up to five custom reminders.") : s("{count} of 5 custom reminder slots used", { count: reminders.length })}
      </p>
    </section>
  );
}
