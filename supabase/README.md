# Backend (Supabase) — Etapa 0

Pasta da fundação de dados do Portal Integre Jr.

## Arquivos
- `schema.sql` — schema completo do banco (tabelas, enums, relações, RLS temporária).
- `seed.sql` — popula o banco com os dados que hoje estão em `script.js`. Rode UMA vez, depois do schema.

## Passo a passo da Etapa 0

### 0.2 — Criar o projeto no Supabase (você, ~10 min)
1. Crie uma conta em https://supabase.com (plano grátis serve para uso interno).
2. **New project** → escolha um nome (ex.: `portal-integre`), defina uma senha forte
   para o banco e a região **South America (São Paulo)**.
3. Aguarde o provisionamento (~2 min).

### 0.3 — Aplicar o schema
1. No projeto: **SQL Editor** → **New query**.
2. Cole todo o conteúdo de `schema.sql` → **Run**.
3. Confira em **Table Editor** se as tabelas apareceram.

### Guardar as chaves (para a Fase 1)
Em **Project Settings → API**, anote:
- `Project URL`
- `anon public key` (vai no frontend)
- `service_role key` (⚠️ NUNCA vai no frontend — só em scripts/servidor)

### 0.4 — Seed
Depois do schema aplicado, peça o `seed.sql` para popular membros, projetos,
legados, capacitações e metas a partir dos dados atuais.

## Avisos importantes
- A RLS está LIGADA mas com política temporária (`tmp_authenticated_all`) que
  libera tudo para usuários logados. **A segurança real por cargo é a Fase 4** —
  trocar essas políticas antes de abrir para a EJ inteira.
- Configure **backups** do banco (Supabase faz diários no plano pago; no grátis,
  agende um `pg_dump` periódico) — o **legado** é memória institucional insubstituível.
