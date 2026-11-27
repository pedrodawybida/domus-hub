import { getCurrentUser } from "@/app/actions/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getCurrentUser();
  const user = session && await db.user.findUnique({
    where: { id: session.id },
    select: { id: true, ativo: true, role: true, nome: true, pode_apresentar: true },
  });
  const headers = { "Cache-Control": "private, no-store" };
  if (!user?.ativo) return new Response(null, { status: 401, headers });
  return Response.json({
    id: user.id,
    name: user.nome,
    role: user.role,
    canPresent: user.role === "ADM" || user.role === "GESTOR" || user.pode_apresentar,
  }, { headers });
}
