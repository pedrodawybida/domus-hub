import { getCurrentUser, getVendedoresAction } from "../actions/auth";
import { getLeadsAction } from "../actions/leads";
import { getEquipesAction } from "../actions/equipes";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const isAdminOrSec = user.role === "ADM" || user.role === "SECRETARIA";
  const isAdminOrSecOrGestor = isAdminOrSec || user.role === "GESTOR";

  const [leads, vendedores, equipesRes] = await Promise.all([
    getLeadsAction(),
    isAdminOrSecOrGestor ? getVendedoresAction() : Promise.resolve([]),
    isAdminOrSec ? getEquipesAction() : Promise.resolve({ success: false, equipes: [] }),
  ]);

  const equipes = (equipesRes as any).success ? (equipesRes as any).equipes : [];

  return (
    <DashboardClient
      initialLeads={leads as any[]}
      vendedores={vendedores as any[]}
      equipes={equipes}
      user={user}
    />
  );
}
