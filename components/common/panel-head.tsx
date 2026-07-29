import type { ReactNode } from "react";
import { tw } from "@/lib/tw";

export function PanelHead({ icon, title, children }: { icon: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className={tw("panel-head")}>
      <div>{icon}<h2>{title}</h2></div>
      {children}
    </div>
  );
}
