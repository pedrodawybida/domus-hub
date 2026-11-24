import Presentation from "./Presentation";
import { requirePresentation } from "@/lib/hub-access";

export default async function Page() {
  await requirePresentation();
  return <Presentation />;
}
