import { getLeadByIdAction } from "@/app/actions/leads";
import { getCurrentUser, getVendedoresAction } from "@/app/actions/auth";
import { getCorrespondentesAction } from "@/app/actions/correspondentes";
import { getTagsAction } from "@/app/actions/tags";
import { redirect } from "next/navigation";
import LeadDetailsClient from "./LeadDetailsClient";

export default async function LeadDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const lead = await getLeadByIdAction(id);

  if (!lead) {
    redirect("/dashboard");
  }

  // Busca lista de vendedores apenas para o ADM/Secretária atribuir/redefinir
  const vendedores = (user.role === "ADM" || user.role === "SECRETARIA") ? await getVendedoresAction() : [];
  
  const correspondentes = await getCorrespondentesAction();
  const tags = await getTagsAction();

  return (
    <LeadDetailsClient
      lead={lead as any}
      vendedores={vendedores as any[]}
      user={user}
      correspondentes={correspondentes as any[]}
      tags={tags as any[]}
    />
  );
}
