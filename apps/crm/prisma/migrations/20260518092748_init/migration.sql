-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT,
    "tipo_consorcio" TEXT NOT NULL,
    "valor_desejado" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "origem" TEXT,
    "observacoes" TEXT NOT NULL,
    "vendedor_id" TEXT NOT NULL,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" DATETIME NOT NULL,
    CONSTRAINT "leads_vendedor_id_fkey" FOREIGN KEY ("vendedor_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "documentacoes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lead_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "data_nascimento" DATETIME NOT NULL,
    "email" TEXT NOT NULL,
    "celular" TEXT NOT NULL,
    "melhor_horario_comunicacao" TEXT NOT NULL,
    "selfie_url" TEXT NOT NULL,
    "assinatura_url" TEXT NOT NULL,
    "documento_identidade_url" TEXT NOT NULL,
    "comprovante_endereco_url" TEXT NOT NULL,
    "comprovante_renda_url" TEXT NOT NULL,
    "documento_identidade_conjuge_url" TEXT,
    "certidao_estado_civil_url" TEXT,
    "anexo_proposta_url" TEXT,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" DATETIME NOT NULL,
    CONSTRAINT "documentacoes_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "documentacoes_lead_id_key" ON "documentacoes"("lead_id");
