import { redirect } from "next/navigation";
import { getHubUser } from "@/lib/hub-access";
import Profile from "./Profile";

export default async function Page() {
  if (!await getHubUser()) redirect("/login");
  return <Profile />;
}
