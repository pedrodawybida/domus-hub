import { getTagsAction } from "@/app/actions/tags";
import { getCurrentUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import EtiquetasClient from "./EtiquetasClient";

export default async function EtiquetasPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADM" && user.role !== "SECRETARIA")) {
    redirect("/dashboard");
  }

  const tags = await getTagsAction();

  return <EtiquetasClient initialTags={tags} />;
}
