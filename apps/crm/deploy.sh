#!/bin/bash

# Script de Deploy Automático para o CRM Domus
# Este script faz backup do banco, atualiza o código, roda as migrações (que resolvem o erro da tabela) e reinicia o servidor.

echo "🚀 Iniciando deploy..."

set -eu
cd "$(dirname "$0")"
node --env-file=.env -e 'require("child_process").execFileSync("python3",["scripts/backup.py"],{stdio:"inherit"})'

# 3. Atualizando o código
echo "⬇️ Baixando atualizações do GitHub..."
git pull

# 4. Instalando dependências
echo "📦 Instalando dependências..."
npm install

# 5. Gerando o Prisma Client e aplicando migrações no banco
# É AQUI QUE O ERRO DA TABELA FACEBOOK SERÁ CORRIGIDO!
echo "🗄️ Aplicando migrações do banco de dados (Prisma)..."
npx prisma generate
npx prisma migrate deploy

# 6. Build da aplicação Next.js
echo "🏗️ Construindo a aplicação (Build)..."
npm run build

# 7. Reiniciando o servidor (Assumindo que usa PM2)
# Se você usar outro nome no PM2, altere "crm-domus" para o nome correto ou use "pm2 restart all"
echo "🔄 Reiniciando o servidor (PM2)..."
pm2 restart all || echo "⚠️ PM2 não encontrado ou falhou ao reiniciar. Você pode precisar reiniciar manualmente."

echo "✨ Deploy finalizado com sucesso!"
