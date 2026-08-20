"use client";

import { FolderPlus, Plus, Save } from "lucide-react";
import { useState } from "react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { WORK_PROJECT_NAME_MAX_LENGTH } from "@/lib/work-projects";

export function QuickWorkProjectDialog({ onCreate, onCreated }: {
  onCreate: (name: string) => string | undefined;
  onCreated?: (id: string) => void;
}) {
  const { t } = useLocaleUi();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [duplicate, setDuplicate] = useState(false);

  function start() {
    setName("");
    setDuplicate(false);
    setOpen(true);
  }

  function save() {
    const id = onCreate(name);
    if (!id) {
      setDuplicate(Boolean(name.trim()));
      return;
    }
    onCreated?.(id);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-create-work-project
          onClick={start}
          aria-label={t("activity.today.newProject")}
          title={t("activity.today.newProject")}
          className="h-11 shrink-0 px-3 max-[420px]:w-11 max-[420px]:px-0"
        >
          <Plus aria-hidden="true" className="size-4" />
          <span className="max-[420px]:sr-only">{t("activity.today.newProject")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2 text-[var(--accent-strong)]">
            <FolderPlus aria-hidden="true" className="size-5" />
            <span className="text-xs font-bold">{t("activity.today.workProjects")}</span>
          </div>
          <DialogTitle>{t("activity.today.newProject")}</DialogTitle>
          <DialogDescription>{t("activity.today.projectDescription")}</DialogDescription>
        </DialogHeader>
        <label className="grid gap-2 text-xs font-semibold text-[var(--text-muted)]">
          {t("activity.today.projectName")}
          <Input
            autoFocus
            value={name}
            maxLength={WORK_PROJECT_NAME_MAX_LENGTH}
            placeholder={t("activity.today.projectNamePlaceholder")}
            aria-invalid={duplicate || undefined}
            onChange={(event) => {
              setDuplicate(false);
              setName(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                save();
              }
            }}
          />
          {duplicate && <span role="alert" className="text-[10px] text-[var(--danger)]">{t("activity.today.projectDuplicate")}</span>}
        </label>
        <DialogFooter>
          <Button type="button" onClick={save} disabled={!name.trim()}>
            <Save aria-hidden="true" /> {t("activity.today.createProject")}
          </Button>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t("common.cancel")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
