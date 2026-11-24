@echo off
chcp 65001 >nul
echo 🚀 Iniciando deploy no Windows...

cd /d "%~dp0"
node --env-file=.env -e "require('child_process').execFileSync('python',['scripts/backup.py'],{stdio:'inherit'})" || exit /b 1

:: 3. Atualizando o código
echo ⬇️ Baixando atualizações do GitHub...
git pull || exit /b 1

:: 4. Instalando dependências
echo 📦 Instalando dependências...
call npm install || exit /b 1

:: 5. Gerando o Prisma Client e aplicando migrações no banco
:: É AQUI QUE O ERRO DA TABELA FACEBOOK SERÁ CORRIGIDO!
echo 🗄️ Aplicando migrações do banco de dados (Prisma)...
call npx prisma generate || exit /b 1
call npx prisma migrate deploy || exit /b 1

:: 6. Build da aplicação Next.js
echo 🏗️ Construindo a aplicação (Build)...
call npm run build || exit /b 1

:: 7. Reiniciando o servidor (Assumindo que usa PM2)
echo 🔄 Reiniciando o servidor (PM2)...
call pm2 restart all || echo ⚠️ PM2 não encontrado ou falhou ao reiniciar. Você pode precisar reiniciar manualmente.

echo ✨ Deploy finalizado com sucesso!
pause
