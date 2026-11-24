import { getCurrentUser } from "@/app/actions/auth";
import { listarContasFacebookAction } from "@/app/actions/facebook";
import { redirect } from "next/navigation";
import ContasFacebookClient from "./ContasFacebookClient";

export const metadata = {
  title: "Contas Facebook — Domus CRM",
  description: "Gerencie as contas de Facebook da equipe de vendas com segurança.",
};

export default async function ContasFacebookPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const result = await listarContasFacebookAction();

  return (
    <ContasFacebookClient
      user={user}
      initialContas={(result.contas ?? []) as any[]}
    />
  );
}
