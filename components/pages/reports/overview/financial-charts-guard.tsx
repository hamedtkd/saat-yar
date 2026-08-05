import type { ReactNode } from "react";

import { SurfaceCard } from "@/components/common/surface-card";

type FinancialChartsGuardProps = {
  hidden: boolean;
  children: ReactNode;
};

export function FinancialChartsGuard({ hidden, children }: FinancialChartsGuardProps) {
  if (!hidden) return <>{children}</>;

  return (
    <SurfaceCard as="section" className="mb-4 grid min-h-40 place-items-center border-dashed p-6 text-center">
      <div>
        <strong className="block text-sm text-[var(--text)]">نمودارهای مالی مخفی هستند</strong>
        <span className="mt-1 block text-[10px] text-[var(--text-muted)]">برای نمایش درآمد و مبالغ، دکمه چشم در نوار بالا را بزن.</span>
      </div>
    </SurfaceCard>
  );
}
