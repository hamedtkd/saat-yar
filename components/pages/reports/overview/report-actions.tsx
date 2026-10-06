"use client";

import { Download, FileSpreadsheet } from "lucide-react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { Button } from "@/components/ui/button";
type ReportActionsProps = { onExport: (kind: "excel" | "csv", mode: "employee" | "freelancer") => void; mode: "employee" | "freelancer" };
export function ReportActions({ onExport, mode }: ReportActionsProps) { const { t } = useLocaleUi(); return <div className="flex items-center gap-2.5 max-[620px]:flex-wrap"><Button type="button" variant="outline" onClick={() => onExport("csv", mode)}><Download className="size-4" />{t("common.exportCsv")}</Button><Button type="button" onClick={() => onExport("excel", mode)}><FileSpreadsheet className="size-4" />{t("common.exportExcel")}</Button></div>; }
