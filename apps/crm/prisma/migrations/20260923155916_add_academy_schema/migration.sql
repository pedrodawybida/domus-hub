-- CreateTable
CREATE TABLE "campanhas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "campanhas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "academy_modulos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "icone" TEXT,
    "publicado" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "academy_aulas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "modulo_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "duracao_min" INTEGER,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "academy_aulas_modulo_id_fkey" FOREIGN KEY ("modulo_id") REFERENCES "academy_modulos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "academy_progressos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "aula_id" TEXT NOT NULL,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "concluido_em" DATETIME,
    "xp_ganho" INTEGER NOT NULL DEFAULT 0,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "academy_progressos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "academy_progressos_aula_id_fkey" FOREIGN KEY ("aula_id") REFERENCES "academy_aulas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "academy_tarefas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "atribuida_por" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "aula_id" TEXT,
    "prazo" DATETIME,
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "concluida_em" DATETIME,
    "xp_ganho" INTEGER NOT NULL DEFAULT 0,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "academy_tarefas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "academy_tarefas_atribuida_por_fkey" FOREIGN KEY ("atribuida_por") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "academy_agendamentos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "data_hora" DATETIME NOT NULL,
    "criado_por" TEXT NOT NULL,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "academy_agendamentos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "academy_lives" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "url" TEXT NOT NULL,
    "data_live" DATETIME,
    "thumbnail" TEXT,
    "publicado" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
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
    "vendedor_anterior_id" TEXT,
    "correspondente_id" TEXT,
    "data_agendamento" DATETIME,
    "tipo_agendamento" TEXT,
    "retornar_contato" BOOLEAN NOT NULL DEFAULT false,
    "data_retorno" DATETIME,
    "ultima_interacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" DATETIME NOT NULL,
    CONSTRAINT "leads_vendedor_id_fkey" FOREIGN KEY ("vendedor_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "leads_vendedor_anterior_id_fkey" FOREIGN KEY ("vendedor_anterior_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "leads_correspondente_id_fkey" FOREIGN KEY ("correspondente_id") REFERENCES "correspondentes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_leads" ("atualizado_em", "correspondente_id", "criado_em", "data_agendamento", "email", "id", "localizacao", "nome", "observacoes", "origem", "status", "telefone", "tipo_consorcio", "ultima_interacao", "valor_desejado", "valor_entrada", "valor_parcela", "vendedor_id") SELECT "atualizado_em", "correspondente_id", "criado_em", "data_agendamento", "email", "id", "localizacao", "nome", "observacoes", "origem", "status", "telefone", "tipo_consorcio", "ultima_interacao", "valor_desejado", "valor_entrada", "valor_parcela", "vendedor_id" FROM "leads";
DROP TABLE "leads";
ALTER TABLE "new_leads" RENAME TO "leads";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "academy_progressos_user_id_aula_id_key" ON "academy_progressos"("user_id", "aula_id");
