import { getCurrentUser } from "../../actions/auth";
import { getRankingAction } from "../../actions/leads";
import { redirect } from "next/navigation";
import RankingClient from "./RankingClient";

export default async function RankingPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const ranking = await getRankingAction();

  return (
    <RankingClient
      ranking={ranking}
      user={user}
    />
  );
}
