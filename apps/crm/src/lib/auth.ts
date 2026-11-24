import crypto from "crypto";
import * as jose from "jose";

if (!process.env.JWT_SECRET) throw new Error("Configure JWT_SECRET no CRM.");
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// Hashing de Senhas nativo (PBKDF2)
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, hash] = storedHash.split(":");
    if (!salt || !hash) return false;
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return hash === verifyHash;
  } catch {
    return false;
  }
}

// Assinatura de JWT
export async function signJWT(payload: { id: string; nome: string; email: string; role: string; equipe_id?: string | null }): Promise<string> {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

// Verificação de JWT
export async function verifyJWT(token: string): Promise<{ id: string; nome: string; email: string; role: string; equipe_id?: string | null } | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload as unknown as { id: string; nome: string; email: string; role: string; equipe_id?: string | null };
  } catch {
    return null;
  }
}
