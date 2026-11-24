import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

if (!process.env.JWT_SECRET) throw new Error("Configure JWT_SECRET no CRM.");
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const redirectTo = (pathname: string) => {
    const target = request.nextUrl.clone();
    target.pathname = pathname;
    target.search = "";
    return NextResponse.redirect(target);
  };

  // Ignorar arquivos estáticos e de upload
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path === "/favicon.ico" ||
    path.startsWith("/uploads") ||
    path.endsWith(".png") ||
    path.endsWith(".svg") ||
    path.endsWith(".ico")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("crm_token")?.value;

  // Rota de login
  if (path === "/login") {
    if (token) {
      try {
        await jose.jwtVerify(token, JWT_SECRET);
        return redirectTo("/dashboard");
      } catch {
        // Token inválido, limpa e prossegue para login
        const response = NextResponse.next();
        response.cookies.delete("crm_token");
        return response;
      }
    }
    return NextResponse.next();
  }

  // Rotas restritas (precisam estar logado)
  if (!token) {
    return redirectTo("/login");
  }

  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    const userRole = payload.role as string;

    // Se tentar ir para a raiz do site, joga pro dashboard
    if (path === "/") {
      return redirectTo("/dashboard");
    }

    // Proteção de rotas admin
    if (path.startsWith("/admin") && userRole !== "ADM") {
      return redirectTo("/dashboard");
    }

    return NextResponse.next();
  } catch (error) {
    // Token inválido ou expirado, limpa cookie e joga pro login
    const response = redirectTo("/login");
    response.cookies.delete("crm_token");
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - uploads (uploaded user files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|uploads).*)",
  ],
};
