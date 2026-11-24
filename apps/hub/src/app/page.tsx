import { redirect } from "next/navigation";
import { crmUrl, getHubUser } from "@/lib/hub-access";
import Hub from "./Hub";

export default async function Page() {
  const user = await getHubUser();
  if (!user) redirect("/login");
  return <Hub {...user} crmUrl={crmUrl} />;
}
