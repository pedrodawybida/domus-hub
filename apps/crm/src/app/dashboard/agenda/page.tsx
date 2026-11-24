import { getLeadsAction } from "@/app/actions/leads";
import { getCurrentUser, getVendedoresAction } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import AgendaClient from "./AgendaClient";

export default async function AgendaPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const isAdminOrSecOrGestor = user.role === "ADM" || user.role === "SECRETARIA" || user.role === "GESTOR";

  const [leads, vendedores] = await Promise.all([
    getLeadsAction(),
    isAdminOrSecOrGestor ? getVendedoresAction() : Promise.resolve([]),
  ]);

  return <AgendaClient leads={leads as any} vendedores={vendedores as any} user={user} />;
}
