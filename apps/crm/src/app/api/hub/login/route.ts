import { loginAction } from "@/app/actions/auth";

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return new Response(null, { status: 415 });
  }
  const data = await request.json().catch(() => null);
  if (typeof data?.username !== "string" || typeof data?.password !== "string") {
    return new Response(null, { status: 400 });
  }
  const result = await loginAction(data.username, data.password);
  return new Response(null, { status: result.success ? 204 : result.error === "Erro interno do servidor." ? 503 : 401 });
}
