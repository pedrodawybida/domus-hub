import { crmUrl } from "@/lib/hub-access";

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return new Response(null, { status: 415 });
  }
  const data = await request.json().catch(() => null);
  if (typeof data?.username !== "string" || typeof data?.password !== "string") {
    return new Response(null, { status: 400 });
  }
  try {
    const base = process.env.CRM_INTERNAL_URL || crmUrl;
    const response = await fetch(new URL("api/hub/login", base.replace(/\/?$/, "/")), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": request.headers.get("user-agent") || "Hub Domus",
      },
      body: JSON.stringify({ username: data.username, password: data.password }),
      cache: "no-store",
      redirect: "error",
    });
    if (response.status === 401) return new Response(null, { status: 401 });
    const session = response.headers.getSetCookie().find(cookie => cookie.startsWith("crm_token="));
    if (response.status !== 204 || !session) return new Response(null, { status: 503 });
    return new Response(null, { status: 204, headers: { "Set-Cookie": session, "Cache-Control": "no-store" } });
  } catch {
    return new Response(null, { status: 503 });
  }
}
