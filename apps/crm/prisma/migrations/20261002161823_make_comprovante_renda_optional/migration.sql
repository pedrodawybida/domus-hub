-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_documentacoes" (
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
    "comprovante_renda_url" TEXT,
    "documento_identidade_conjuge_url" TEXT,
    "certidao_estado_civil_url" TEXT,
    "anexo_proposta_url" TEXT,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" DATETIME NOT NULL,
    CONSTRAINT "documentacoes_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_documentacoes" ("anexo_proposta_url", "assinatura_url", "atualizado_em", "celular", "certidao_estado_civil_url", "comprovante_endereco_url", "comprovante_renda_url", "cpf", "criado_em", "data_nascimento", "documento_identidade_conjuge_url", "documento_identidade_url", "email", "id", "lead_id", "melhor_horario_comunicacao", "nome", "selfie_url") SELECT "anexo_proposta_url", "assinatura_url", "atualizado_em", "celular", "certidao_estado_civil_url", "comprovante_endereco_url", "comprovante_renda_url", "cpf", "criado_em", "data_nascimento", "documento_identidade_conjuge_url", "documento_identidade_url", "email", "id", "lead_id", "melhor_horario_comunicacao", "nome", "selfie_url" FROM "documentacoes";
DROP TABLE "documentacoes";
ALTER TABLE "new_documentacoes" RENAME TO "documentacoes";
CREATE UNIQUE INDEX "documentacoes_lead_id_key" ON "documentacoes"("lead_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
