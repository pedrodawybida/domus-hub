# Findings

## Discoveries
- **Estrela Guia:** CRM de consórcio para gestão de leads.
- **Tech Stack:** Next.js (App Router), Prisma, SQLite, TailwindCSS.
- **Autenticação:** Baseada em perfis (ADM e Vendedor).
  - ADM Inicial: `carlos` / senha: `[senha omitida]`.
- **Regras de Negócio:**
  - O ADM pode cadastrar novos usuários (vendedores) e gerenciar todos os leads do sistema.
  - Vendedores só enxergam e gerenciam seus próprios leads.
  - Ambos podem criar leads. O ADM pode atribuir leads a vendedores.
- **Módulo de Documentação:** Permite anexar arquivos do cliente (Selfie, Assinatura na tela, Identidade, Comprovante de endereço/renda, documentos do cônjuge e proposta).
  - Armazenamento de arquivos: Localmente na pasta do servidor (ex: `/public/uploads`) para facilitar migração futura para o Raspberry Pi.

## Constraints
- O sistema deve ser muito leve para rodar no Raspberry Pi daqui a 4 meses. Inicialmente rodará em um PC local.
- SQLite deve ser a única fonte de verdade.

