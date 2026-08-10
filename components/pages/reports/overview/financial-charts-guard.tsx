"use client";

import type { ReactNode } from "react";
import { SurfaceCard } from "@/components/common/surface-card";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
type FinancialChartsGuardProps = { hidden: boolean; children: ReactNode };
export function FinancialChartsGuard({ hidden, children }: FinancialChartsGuardProps) { const { t } = useLocaleUi(); if (!hidden) return <>{children}</>; return <SurfaceCard as="section" className="mb-4 grid min-h-40 place-items-center border-dashed p-6 text-center"><div><strong className="block text-sm text-[var(--text)]">{t("reports.charts.hidden")}</strong><span className="mt-1 block text-[10px] text-[var(--text-muted)]">{t("reports.charts.hiddenHint")}</span></div></SurfaceCard>; }
