import { getCurrentUser } from "../../actions/auth";
import { getLeadsAction } from "../../actions/leads";
import { redirect } from "next/navigation";
import ContratosClient from "./ContratosClient";

export default async function ContratosPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const leads = await getLeadsAction();

  return (
    <ContratosClient
      leads={leads as any[]}
      user={user}
    />
  );
}
