import { readFile } from "node:fs/promises";
import path from "node:path";
import { getHubUser } from "@/lib/hub-access";

const decks = new Set(["Ficha.html", "Simulador.html", "Curitiba_RMC_Domus.html", "Domus_Investimentos.html", "Sobre_nos_Domus.html"]);

export async function GET(_: Request, context: { params: Promise<{ deck: string }> }) {
  const { deck } = await context.params;
  const headers = { "Cache-Control": "private, no-store" };
  const user = await getHubUser();
  if (!user?.canPresent) return new Response(null, { status: user ? 403 : 401, headers });
  if (!decks.has(deck)) return new Response(null, { status: 404, headers });
  const html = await readFile(path.join(process.cwd(), "private/slides", deck), "utf8");
  return new Response(html, { headers: { ...headers, "Content-Type": "text/html; charset=utf-8" } });
}
