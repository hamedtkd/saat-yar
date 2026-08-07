import type { ReactNode } from "react";
import { SectionHeading } from "@/components/common/section-heading";

export function SettingsSection({ icon, eyebrow, title, description, children }: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] p-3 shadow-[0_5px_16px_rgba(0,0,0,.025)] sm:p-4">
        <SectionHeading icon={icon} eyebrow={eyebrow} title={title} description={description} />
        <div className="grid grid-cols-2 items-start gap-3.5 max-[720px]:grid-cols-1 [&>section]:min-w-0 [&>section]:shadow-none">
          {children}
        </div>
      </div>
    </section>
  );
}
