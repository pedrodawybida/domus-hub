import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";
import { getEquipesAction } from "@/app/actions/equipes";
import EquipesClient from "./EquipesClient";

export const metadata = {
  title: "Gestão de Equipes | CRM",
};

export default async function EquipesPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADM") {
    redirect("/login");
  }

  const equipesResult = await getEquipesAction();
  const equipes = equipesResult.success ? equipesResult.equipes : [];

  return <EquipesClient initialEquipes={equipes as any} />;
}
