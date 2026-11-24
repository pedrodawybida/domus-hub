# Domus Hub no Windows do escritório

Use PowerShell. Os exemplos usam C:\Domus\hub para o código novo e C:\Domus\dados para o novo banco e os anexos. Substitua o caminho do CRM antigo e o IP pelo que o escritório já utiliza. Mantenha a pasta antiga, seu banco, seus anexos e sua automação disponíveis para retorno.

## Preparação

1. Extraia o ZIP em C:\Domus. Confira que existe C:\Domus\hub\apps\crm\package.json. Verifique os pré-requisitos no terminal com `node -v`, `npm.cmd -v`, `py -3 --version` e `caddy version`. Use Node compatível com o Next 16 (mínimo 20.9), Python 3 e o executável Caddy 2 no PATH. O primeiro build requer internet para dependências e fontes.
2. Identifique o IP que os funcionários usam. Crie C:\Domus\hub\apps\crm\.env.local a partir da configuração de produção do CRM, preservando os segredos e integrações do escritório, inclusive JWT_SECRET. Defina cada chave apenas uma vez. Exemplo das chaves que mudam, substituindo o IP de exemplo:

```dotenv
DATABASE_URL="file:C:/Domus/dados/crm-hub.db"
CRM_UPLOAD_DIR="C:/Domus/dados/uploads"
NEXT_PUBLIC_CRM_BASE_PATH="/crm"
NEXT_PUBLIC_HUB_URL="http://192.168.1.20:3000"
```

3. Crie C:\Domus\hub\apps\hub\.env.local com estes valores:

```dotenv
NEXT_PUBLIC_CRM_URL="/crm"
CRM_INTERNAL_URL="http://127.0.0.1:3302/crm"
```

4. Compile antes da janela de troca. Interrompa a preparação se qualquer comando falhar.

```powershell
cd C:\Domus\hub\apps\crm
npm.cmd ci
npx.cmd prisma generate
npm.cmd run build
cd C:\Domus\hub\apps\hub
npm.cmd ci
npm.cmd run build
```

## Troca e teste

Combine uma janela sem lançamentos. Pare o CRM antigo com Ctrl+C no terminal usado pela automação. Confirme a localização do SQLite em uso e da pasta de anexos. Faça um backup separado da pasta da instalação antiga, incluindo arquivos ocultos, configurações, banco e anexos externos, se houver. Confira que o backup abre e os anexos estão presentes.

Prepare a cópia do banco com os dados mais recentes do servidor. O script abre a origem somente para leitura, exige um destino novo, adiciona os campos necessários e verifica integridade e chaves estrangeiras. Ajuste a primeira linha para o caminho real:

```powershell
$crmAntigo = 'C:\CAMINHO-REAL\crm-domus'
New-Item -ItemType Directory -Force C:\Domus\dados
py -3 C:\Domus\hub\infra\windows\prepare-db.py "$crmAntigo\prisma\.dev.db" C:\Domus\dados\crm-hub.db
```

Copie o conteúdo da pasta de anexos em uso (em instalações antigas, public\uploads) para C:\Domus\dados\uploads, preservando subpastas. Por exemplo, se confirmou essa origem:

```powershell
robocopy "$crmAntigo\public\uploads" C:\Domus\dados\uploads /E
```

No robocopy, códigos de saída a partir de 8 indicam falha. Confira contagem de arquivos e abra um anexo conhecido após iniciar. Verifique se a porta 3000 ficou livre e ligue a nova versão:

```powershell
& 'C:\Domus\hub\infra\windows\iniciar-hub.cmd'
```

O script mantém a entrada da rede na porta 3000 e inicia dois processos internos na interface local. De outro computador, abra o endereço habitual. Teste login, consulta de um lead conhecido, abertura de anexo, Academy, apresentações de um gestor, bloqueio para funcionário sem permissão e saída para o login. Só então libere os lançamentos e aponte a automação para iniciar-hub.cmd. Se houver erro, consulte as três janelas abertas pelo script.

## Voltar à versão anterior

Durante o teste sem lançamentos, encerre o Caddy e os dois terminais Domus novos com Ctrl+C. Abra a automação antiga ou execute:

```powershell
cd 'C:\CAMINHO-REAL\crm-domus'
npm.cmd run start
```

A versão antiga usa os dados da hora da troca. Se já houve trabalho na nova versão, bloqueie novos lançamentos, encerre os serviços e preserve cópias do banco e anexos novos antes de voltar. Reconcilie as alterações com o banco antigo antes de reabrir para a equipe. Apenas reiniciar o serviço antigo não transfere leads, alterações nem anexos recentes.
