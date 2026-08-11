"use client";

import { Download, FileSpreadsheet } from "lucide-react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { Button } from "@/components/ui/button";
type ReportActionsProps = { onExport: (kind: "excel" | "csv") => void };
export function ReportActions({ onExport }: ReportActionsProps) { const { t } = useLocaleUi(); return <div className="flex items-center gap-2.5 max-[620px]:flex-wrap"><Button type="button" variant="outline" onClick={() => onExport("csv")}><Download className="size-4" />{t("common.exportCsv")}</Button><Button type="button" onClick={() => onExport("excel")}><FileSpreadsheet className="size-4" />{t("common.exportExcel")}</Button></div>; }
