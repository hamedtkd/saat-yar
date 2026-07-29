import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { tw } from "@/lib/tw";

export function PageHeading({ title, description, children, autosave = true }: {
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  autosave?: boolean;
}) {
  return (
    <section className={tw("page-heading")}>
      <div>
        {autosave && <span className={tw("save-inline")}><CheckCircle2 /> ذخیره خودکار</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children}
    </section>
  );
}
