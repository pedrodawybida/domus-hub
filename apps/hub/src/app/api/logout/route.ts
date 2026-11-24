import { cookies } from "next/headers";

export async function POST() {
  (await cookies()).delete("crm_token");
  return new Response(null, {
    status: 303,
    headers: { Location: "/login", "Cache-Control": "no-store" },
  });
}
