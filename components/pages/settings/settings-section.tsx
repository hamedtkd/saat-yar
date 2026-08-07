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
    <section className="rounded-[var(--card-radius)] bg-[var(--surface-2)] p-2.5 sm:p-3">
      <div className="px-1 pb-1 sm:px-2">
        <SectionHeading icon={icon} eyebrow={eyebrow} title={title} description={description} />
      </div>
      <div className="grid grid-cols-2 items-start gap-3.5 max-[720px]:grid-cols-1 [&>section]:min-w-0 [&>section]:shadow-none">
        {children}
      </div>
    </section>
  );
}
