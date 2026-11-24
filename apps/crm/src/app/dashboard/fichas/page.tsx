import { getCurrentUser } from "../../actions/auth";
import { getLeadsAction } from "../../actions/leads";
import { redirect } from "next/navigation";
import FichasClient from "./FichasClient";

export default async function FichasPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const leads = await getLeadsAction();

  return (
    <FichasClient
      leads={leads as any[]}
      user={user}
    />
  );
}
