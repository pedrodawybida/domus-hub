import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  console.log("Iniciando semeadura do banco de dados...");

  const initialPassword = process.env.DOMUS_SEED_ADMIN_PASSWORD;
  if (!initialPassword) throw new Error("Configure DOMUS_SEED_ADMIN_PASSWORD antes de executar o seed.");
  const passwordHash = hashPassword(initialPassword);

  // 1. Garantir/Criar o usuário ADM inicial Carlos
  let carlos = await prisma.user.findUnique({
    where: { email: "carlos" },
  });

  if (!carlos) {
    carlos = await prisma.user.create({
      data: {
        nome: "Carlos ADM",
        email: "carlos",
        senha_hash: passwordHash,
        role: "ADM",
      },
    });
    console.log(`Usuário ADM '${carlos.nome}' criado com sucesso!`);
  } else {
    console.log("Usuário ADM 'carlos' já existe.");
  }

  // Fake data removed by request. Only ADM master remains.

  console.log("Semeadura concluída!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
