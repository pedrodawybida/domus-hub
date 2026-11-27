import { mkdir, readFile, readdir, rename, writeFile, unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { getHubUser } from "@/lib/hub-access";

const folder = process.env.DOMUS_FICHAS_DIR || path.resolve(process.cwd(), "../../../dados/fichas");
const uuid = /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i;
const fieldNames = new Set("nome nascimento cpf renda celular email finalidade tipo cidade bairro marketPrice marketVariation precoMin precoMax areaMin areaMax condominioMax iptuMax quartos banheiros suites vagas mobiliado pets andarMin publicadoPor ordenarPor comodidades marketReference".split(" "));
const headers = { "Cache-Control": "private, no-store" };
const reply = (data: unknown, status = 200) => Response.json(data, { status, headers });

export async function GET(request: Request) {
  const user = await getHubUser();
  if (!user?.canPresent || !user.id) return reply(null, user ? 403 : 401);
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const manager = ["ADM", "GESTOR"].includes(user.role);
  if (id && !uuid.test(id)) return reply(null, 400);
  const query = searchParams.get("q")?.trim().toLocaleLowerCase("pt-BR") || "";
  const results = [];
  try {
    const files = id ? [id + ".json"] : await readdir(folder);
    for (const file of files) {
      if (!file.endsWith(".json") || !uuid.test(file.slice(0,-5))) continue;
      const record = JSON.parse(await readFile(path.join(/* turbopackIgnore: true */ folder, file), "utf8"));
      if (!manager && record.owner !== user.id) continue;
      if (id) return reply(record.fields);
      if (record.fields.nome.toLocaleLowerCase("pt-BR").includes(query)) {
        results.push({ id: file.slice(0,-5), name: record.fields.nome, date: record.date, consultant: record.consultant });
      }
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  return id ? reply(null, 404) : reply(results.sort((a,b) => b.date.localeCompare(a.date)));
}

export async function POST(request: Request) {
  const user = await getHubUser();
  if (!user?.canPresent || !user.id) return reply(null, user ? 403 : 401);
  if (request.headers.get("content-type")?.split(";")[0] !== "application/json") return reply(null, 415);
  const fields = await request.json().catch(() => null);
  if (!fields || typeof fields.nome !== "string" || !fields.nome.trim() ||
      Object.entries(fields).some(([key,value]) => !fieldNames.has(key) ||
        (key === "comodidades" ? !Array.isArray(value) || value.length > 30 || value.some(v => typeof v !== "string" || v.length > 200)
        : typeof value !== "string" || value.length > 2000))) return reply(null, 400);
  const id = randomUUID();
  await mkdir(folder, { recursive: true, mode: 0o700 });
  const temp = path.join(/* turbopackIgnore: true */ folder, id + ".tmp");
  try {
    await writeFile(temp, JSON.stringify({ owner: user.id, consultant: user.name, date: new Date().toISOString(), fields }), { flag: "wx", mode: 0o600 });
    await rename(temp, path.join(/* turbopackIgnore: true */ folder, id + ".json"));
  } finally {
    await unlink(temp).catch(() => {});
  }
  return reply({ id }, 201);
}
