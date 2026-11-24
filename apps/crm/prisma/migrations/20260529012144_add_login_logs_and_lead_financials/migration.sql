-- AlterTable
ALTER TABLE "leads" ADD COLUMN "valor_entrada" REAL;
ALTER TABLE "leads" ADD COLUMN "valor_parcela" REAL;

-- CreateTable
CREATE TABLE "login_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "login_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
