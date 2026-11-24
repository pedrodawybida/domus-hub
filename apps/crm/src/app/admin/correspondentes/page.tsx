import { getCurrentUser } from "@/app/actions/auth";
import { getCorrespondentesAction } from "@/app/actions/correspondentes";
import { redirect } from "next/navigation";
import CorrespondentesClient from "./CorrespondentesClient";

export default async function CorrespondentesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADM") {
    redirect("/dashboard");
  }

  const correspondentes = await getCorrespondentesAction();

  return (
    <CorrespondentesClient
      user={user}
      initialCorrespondentes={correspondentes}
    />
  );
}
