import path from "node:path";
import { open, realpath } from "node:fs/promises";
import { Readable } from "node:stream";
import { getCurrentUser } from "@/app/actions/auth";
import { db } from "@/lib/db";
import { uploadsRoot } from "@/lib/uploads";

const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };
const inlineTypes: Record<string, string> = {
  ".pdf": "application/pdf", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif",
};
const documentFields = [
  "selfie_url", "assinatura_url", "documento_identidade_url", "comprovante_endereco_url",
  "comprovante_renda_url", "documento_identidade_conjuge_url", "certidao_estado_civil_url", "anexo_proposta_url",
];

export async function GET(_: Request, context: { params: Promise<{ parts: string[] }> }) {
  const session = await getCurrentUser();
  const user = session && await db.user.findUnique({
    where: { id: session.id }, select: { id: true, ativo: true, role: true, equipe_id: true },
  });
  if (!user?.ativo) return new Response(null, { status: 401, headers });
  const { parts } = await context.params;
  const academy = parts.length === 2 && parts[0] === "academy";
  const missing = () => new Response(null, { status: 404, headers });
  if ((!academy && parts.length !== 1) || parts.some(p => !p || /^[.]/.test(p) || /[\\/:\x00-\x1f]/.test(p))) return missing();
  const url = "/uploads/" + parts.join("/");
  if (academy) {
    if (user.role !== "ADM" && !await db.academyAula.findFirst({
      where: { conteudo: url, modulo: { publicado: true } }, select: { id: true },
    })) return missing();
  } else {
    const globalAccess = user.role === "ADM" || user.role === "SECRETARIA";
    const team = user.role === "GESTOR" && user.equipe_id;
    const document = await db.documentacaoCliente.findFirst({
      where: {
        OR: documentFields.map(field => ({ [field]: url })),
        lead: globalAccess ? undefined : { OR: [
          { vendedor_id: user.id }, ...(team ? [{ vendedor: { equipe_id: team } }] : []),
        ] },
      }, select: { id: true },
    });
    if (!document) return missing();
  }

  try {
    const root = await realpath(uploadsRoot);
    const file = await realpath(path.join(root, ...parts));
    if (!file.startsWith(root + path.sep)) return missing();
    const handle = await open(file, "r");
    const type = inlineTypes[path.extname(file).toLowerCase()];
    return new Response(Readable.toWeb(handle.createReadStream()) as ReadableStream<Uint8Array>, {
      headers: { ...headers, "Content-Type": type || "application/octet-stream",
        "Content-Disposition": type ? "inline" : "attachment", "Content-Security-Policy": "sandbox" },
    });
  } catch (error) {
    if (["ENOENT", "ENOTDIR"].includes((error as NodeJS.ErrnoException).code || "")) return missing();
    throw error;
  }
}
