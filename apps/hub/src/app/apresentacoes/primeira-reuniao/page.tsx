import { redirect } from "next/navigation";
import { requirePresentation } from "@/lib/hub-access";

export default async function Page() {
  await requirePresentation();
  redirect("/slides/Sobre_nos_Domus.html");
}
