import { getCurrentUser, getColaboradoresAction, getLoginLogsAction } from "@/app/actions/auth";
import { getEquipesAction } from "@/app/actions/equipes";
import { redirect } from "next/navigation";
import VendedoresClient from "./VendedoresClient";

export default async function VendedoresPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADM") {
    redirect("/dashboard");
  }

  const [colaboradores, loginLogs, equipesResult] = await Promise.all([
    getColaboradoresAction(),
    getLoginLogsAction(),
    getEquipesAction()
  ]);

  const equipes = equipesResult.success ? equipesResult.equipes : [];

  return (
    <VendedoresClient 
      initialColaboradores={colaboradores as any[]} 
      loginLogs={loginLogs as any[]} 
      equipes={equipes as any[]}
    />
  );
}
