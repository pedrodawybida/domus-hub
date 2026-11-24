import { getCurrentUser } from "@/app/actions/auth";
import { getCampanhasAction } from "@/app/actions/campanhas";
import { redirect } from "next/navigation";
import CampanhasClient from "./CampanhasClient";

export default async function CampanhasPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const campanhas = await getCampanhasAction();

  return (
    <CampanhasClient
      user={user}
      initialCampanhas={campanhas as any[]}
    />
  );
}
