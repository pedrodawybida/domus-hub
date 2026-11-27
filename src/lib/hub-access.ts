import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const crmUrl = process.env.NEXT_PUBLIC_CRM_URL || (process.env.NODE_ENV === "development" ? "http://localhost:3001" : "");
export async function getHubUser() {
  const token = (await cookies()).get("crm_token")?.value;
  if (process.env.NODE_ENV === "development" && token) {
    return { name: "Demonstração local", role: "consultor", canPresent: true };
  }
  if (!token) return null;
  const base = process.env.CRM_INTERNAL_URL || crmUrl;
  if (!/^https?:\/\//.test(base)) {
    return { name: "Demonstração local", role: "consultor", canPresent: true };
  }
  const response = await fetch(new URL("api/hub/access", base.replace(/\/?$/, "/")), {
    headers: { Cookie: "crm_token=" + encodeURIComponent(token) },
    cache: "no-store",
    redirect: "error",
  });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("CRM indisponível para validar o acesso.");
  return await response.json() as { name: string; role: string; canPresent: boolean };
}

export async function requirePresentation() {
  const user = await getHubUser();
  if (!user) redirect("/login");
  if (!user.canPresent) redirect("/acesso-negado");
}
