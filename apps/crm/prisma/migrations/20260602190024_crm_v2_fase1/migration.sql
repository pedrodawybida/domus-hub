-- CreateTable
CREATE TABLE "equipes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "correspondentes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "cor" TEXT NOT NULL,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "_LeadToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_LeadToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "leads" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_LeadToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_leads" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT,
    "tipo_consorcio" TEXT,
    "valor_desejado" REAL,
    "valor_parcela" REAL,
    "valor_entrada" REAL,
    "status" TEXT NOT NULL,
    "origem" TEXT,
    "localizacao" TEXT,
    "observacoes" TEXT NOT NULL,
    "vendedor_id" TEXT NOT NULL,
    "correspondente_id" TEXT,
    "data_agendamento" DATETIME,
    "ultima_interacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" DATETIME NOT NULL,
    CONSTRAINT "leads_vendedor_id_fkey" FOREIGN KEY ("vendedor_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "leads_correspondente_id_fkey" FOREIGN KEY ("correspondente_id") REFERENCES "correspondentes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_leads" ("atualizado_em", "criado_em", "email", "id", "localizacao", "nome", "observacoes", "origem", "status", "telefone", "tipo_consorcio", "valor_desejado", "valor_entrada", "valor_parcela", "vendedor_id") SELECT "atualizado_em", "criado_em", "email", "id", "localizacao", "nome", "observacoes", "origem", "status", "telefone", "tipo_consorcio", "valor_desejado", "valor_entrada", "valor_parcela", "vendedor_id" FROM "leads";
DROP TABLE "leads";
ALTER TABLE "new_leads" RENAME TO "leads";
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "url_campanha" TEXT,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" DATETIME NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "equipe_id" TEXT,
    CONSTRAINT "users_equipe_id_fkey" FOREIGN KEY ("equipe_id") REFERENCES "equipes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_users" ("ativo", "atualizado_em", "criado_em", "email", "id", "nome", "role", "senha_hash", "url_campanha") SELECT "ativo", "atualizado_em", "criado_em", "email", "id", "nome", "role", "senha_hash", "url_campanha" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_LeadToTag_AB_unique" ON "_LeadToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_LeadToTag_B_index" ON "_LeadToTag"("B");
