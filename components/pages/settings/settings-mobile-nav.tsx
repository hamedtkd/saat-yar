"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import { useUnsavedNavigation } from "@/components/layout/navigation/unsaved-navigation-provider";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/cn";
import { getSettingsGroupItems, settingsNavGroups, settingsNavItems, type SettingsNavGroupId } from "./settings-navigation-model";

type SettingsItemId = (typeof settingsNavItems)[number]["id"];

type Props = {
  active: SettingsItemId;
  activeGroup: SettingsNavGroupId;
  onNavigate: (id: SettingsItemId) => void;
};

export function SettingsMobileNav({ active, activeGroup, onNavigate }: Props) {
  const { t } = useLocale();
  const { requestNavigation } = useUnsavedNavigation();
  const [open, setOpen] = useState(false);
  const activeItem = settingsNavItems.find((item) => item.id === active) ?? settingsNavItems[0];
  const activeGroupItem = settingsNavGroups.find((group) => group.id === activeGroup) ?? settingsNavGroups[0];
  const ActiveIcon = activeItem.icon;

  const selectItem = (id: SettingsItemId) => {
    requestNavigation(() => {
      onNavigate(id);
      setOpen(false);
    });
  };

  return (
    <div data-settings-mobile-nav className="hidden max-[900px]:block">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            data-settings-mobile-trigger
            className="flex min-h-12 w-full min-w-0 items-center gap-3 rounded-[16px] border border-[var(--dashboard-border)] bg-[var(--surface-glass)] px-3 text-start shadow-[0_6px_20px_rgba(0,0,0,.035)] backdrop-blur-xl transition-colors hover:bg-[var(--surface-1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)]"><ActiveIcon aria-hidden="true" className="size-4" /></span>
            <span className="min-w-0 flex-1">
              <small className="block truncate text-[8px] font-black text-[var(--text-muted)]">{t(activeGroupItem.labelKey)}</small>
              <strong className="mt-0.5 block truncate text-[10px] font-black text-[var(--text)]">{t(activeItem.labelKey)}</strong>
            </span>
            <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-[var(--text-muted)]" />
          </button>
        </DialogTrigger>
        <DialogContent className="max-h-[calc(100dvh-24px)] gap-3 p-3 sm:p-4" data-settings-mobile-dialog>
          <DialogHeader>
            <DialogTitle>{t("settings.navAria")}</DialogTitle>
            <DialogDescription>{t("settings.description")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            {settingsNavGroups.map((group) => (
              <section key={group.id} className="grid gap-1.5 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-2">
                <h3 className="px-2 pt-1 text-[9px] font-black text-[var(--text-muted)]">{t(group.labelKey)}</h3>
                <div className="grid gap-1 min-[480px]:grid-cols-2">
                  {getSettingsGroupItems(group.id).map(({ id, labelKey, icon: Icon }) => {
                    const isActive = active === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        data-settings-nav-id={id}
                        aria-current={isActive ? "location" : undefined}
                        onClick={() => selectItem(id as SettingsItemId)}
                        className={cn(
                          "flex min-h-11 min-w-0 items-center gap-2.5 rounded-xl px-2.5 text-start text-[10px] font-bold text-[var(--text-muted)] transition-colors",
                          "hover:bg-[var(--accent-soft)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]",
                          isActive && "bg-[var(--accent-soft)] text-[var(--accent-strong)] ring-1 ring-[color-mix(in_srgb,var(--accent)_22%,transparent)]",
                        )}
                      >
                        <Icon aria-hidden="true" className="size-4 shrink-0" />
                        <span className="min-w-0 flex-1 truncate">{t(labelKey)}</span>
                        {isActive && <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-[var(--accent)]" />}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
