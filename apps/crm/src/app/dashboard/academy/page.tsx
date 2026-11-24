import { getCurrentUser } from "@/app/actions/auth";
import { getAcademyDataAction, getVendedoresParaAcademyAction } from "@/app/actions/academy";
import { redirect } from "next/navigation";
import AcademyClient from "./AcademyClient";

export const metadata = {
  title: "Domus Academy — Aprenda e Evolua",
  description: "Plataforma de aprendizado da Domus Consórcios. Módulos, vídeos, gamificação e treinamento de objeções com IA.",
};

export default async function AcademyPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [data, vendedores] = await Promise.all([
    getAcademyDataAction(),
    getVendedoresParaAcademyAction(),
  ]);

  return (
    <AcademyClient
      user={user}
      initialData={data as any}
      vendedores={vendedores}
    />
  );
}
