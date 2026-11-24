import { getCurrentUser } from "../../actions/auth";
import { getLeadsAction } from "../../actions/leads";
import { redirect } from "next/navigation";
import AnaliseClient from "./AnaliseClient";

export default async function AnalisePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const leads = await getLeadsAction();

  return (
    <AnaliseClient
      initialLeads={leads as any[]}
      user={user}
    />
  );
}
