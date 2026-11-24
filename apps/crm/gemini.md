# Project Constitution (gemini.md)

## Data Schemas

### User (SQLite Table: `users`)
- `id`: UUID ou Inteiro Autoincrement
- `nome`: Texto
- `email`: Texto (Único)
- `senha_hash`: Texto (Criptografada)
- `role`: Texto ("ADM" ou "VENDEDOR")
- `criado_em`: Data/Hora
- `atualizado_em`: Data/Hora

### Lead (SQLite Table: `leads`)
- `id`: UUID ou Inteiro Autoincrement
- `nome`: Texto
- `telefone`: Texto
- `email`: Texto (Opcional)
- `tipo_consorcio`: Texto ("Imóvel", "Veículo", "Serviços")
- `valor_desejado`: Real (Monetário)
- `status`: Texto ("Novo", "Em Atendimento", "Agendado", "Proposta Enviada", "Fechado", "Cancelado")
- `origem`: Texto (Opcional)
- `observacoes`: Texto Longo
- `vendedor_id`: Chave Estrangeira (Relacionamento com User.id)
- `criado_em`: Data/Hora
- `atualizado_em`: Data/Hora

### DocumentacaoCliente (SQLite Table: `documentacoes`)
- `id`: UUID ou Inteiro Autoincrement
- `lead_id`: Chave Estrangeira (Relacionamento com Lead.id)
- `nome`: Texto
- `cpf`: Texto
- `data_nascimento`: Data
- `email`: Texto
- `celular`: Texto
- `melhor_horario_comunicacao`: Texto
- `selfie_url`: Texto (Caminho/URL do arquivo)
- `assinatura_url`: Texto (Caminho/URL da imagem da assinatura)
- `documento_identidade_url`: Texto (Caminho/URL do arquivo)
- `comprovante_endereco_url`: Texto (Caminho/URL do arquivo)
- `comprovante_renda_url`: Texto (Caminho/URL do arquivo)
- `documento_identidade_conjuge_url`: Texto (Caminho/URL do arquivo - Opcional)
- `certidao_estado_civil_url`: Texto (Caminho/URL do arquivo - Opcional)
- `anexo_proposta_url`: Texto (Caminho/URL do arquivo - Opcional)
- `criado_em`: Data/Hora
- `atualizado_em`: Data/Hora

## Behavioral Rules
- Priorizar a confiabilidade sobre a velocidade.
- Nunca adivinhar a lógica de negócios.
- O app deve ser leve para rodar adequadamente em um Raspberry Pi no futuro.

## Architectural Invariants
- **VLAEG Protocol:** Todo o desenvolvimento segue o protocolo V.L.A.E.G.
- **Camada A.N.T.:** 
  - Camada 1: `architecture/` - POPs (Procedimentos Operacionais Padrão) em Markdown.
  - Camada 2: Navegação - Lógica de decisão.
  - Camada 3: `tools/` - Scripts atômicos, quando necessário.
- **Tech Stack Web:** Next.js (App Router), Prisma ORM, banco de dados SQLite local, e TailwindCSS para o design.

