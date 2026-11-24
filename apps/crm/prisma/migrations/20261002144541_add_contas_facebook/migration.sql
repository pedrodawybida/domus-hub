-- CreateTable
CREATE TABLE "contas_facebook" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "apelido" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "observacoes" TEXT,
    "visivel_para_todos" BOOLEAN NOT NULL DEFAULT false,
    "dono_id" TEXT NOT NULL,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" DATETIME NOT NULL,
    CONSTRAINT "contas_facebook_dono_id_fkey" FOREIGN KEY ("dono_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
