"use client";

import { useRouter } from "next/navigation";
import { ClientsPage } from "@/components/pages/clients/clients-page";
import { useSaatyarContext } from "@/components/saatyar-shell";
import { getTabHref } from "@/lib/navigation";

export default function ClientsRoute() {
  const controller = useSaatyarContext();
  const router = useRouter();
  if (!controller.ready) return null;

  return (
    <ClientsPage
      data={controller.data}
      setData={controller.setData}
      showForm={controller.showClientForm}
      setShowForm={controller.setShowClientForm}
      draft={controller.clientDraft}
      setDraft={controller.setClientDraft}
      addClient={controller.addClient}
      setTab={(tab) => router.push(getTabHref(tab))}
      financialsHidden={controller.financialsHidden}
    />
  );
}
