# Backend (Supabase) — Etapa 0

Pasta da fundação de dados do Portal Integre Jr.

## Arquivos
- `schema.sql` — schema completo do banco (tabelas, enums, relações). Liga a RLS (deny-all).
- `policies.sql` — políticas reais de RLS por cargo/setor (espelham COL_ACCESS do app). Rode logo após o schema.
- `seed.sql` — popula o banco com os dados que hoje estão em `script.js`. Rode UMA vez, depois do schema.

## Passo a passo da Etapa 0

### 0.2 — Criar o projeto no Supabase (você, ~10 min)
1. Crie uma conta em https://supabase.com (plano grátis serve para uso interno).
2. **New project** → escolha um nome (ex.: `portal-integre`), defina uma senha forte
   para o banco e a região **South America (São Paulo)**.
3. Aguarde o provisionamento (~2 min).

### 0.3 — Aplicar o schema + políticas
1. No projeto: **SQL Editor** → **New query**.
2. Cole todo o conteúdo de `schema.sql` → **Run**.
3. Cole todo o conteúdo de `policies.sql` → **Run** (sem isso, as tabelas só
   respondem à chave service_role; o app logado não lê/escreve nada).
4. Confira em **Table Editor** se as tabelas apareceram.

> A ordem importa para os logins: rode `create-users.mjs` (liga `profiles.user_id`
> ao Supabase Auth) **antes** de testar o app — as políticas usam `auth.uid()`
> para descobrir o cargo do usuário. Sem o vínculo, o perfil não é resolvido.

### Guardar as chaves (para a Fase 1)
Em **Project Settings → API**, anote:
- `Project URL`
- `anon public key` (vai no frontend)
- `service_role key` (⚠️ NUNCA vai no frontend — só em scripts/servidor)

### 0.4 — Seed
Depois do schema aplicado, peça o `seed.sql` para popular membros, projetos,
legados, capacitações e metas a partir dos dados atuais.

## Avisos importantes
- A RLS está LIGADA com políticas reais por cargo/setor (`policies.sql`). A
  ESCRITA é travada pela matriz (ex.: ninguém edita o próprio cargo); a LEITURA
  segue liberada a qualquer logado (o app cruza nomes em toda tela). Restringir
  leitura de forma fina e a auto-edição de campos seguros do perfil ficam para a Fase 4.
- Configure **backups** do banco (Supabase faz diários no plano pago; no grátis,
  agende um `pg_dump` periódico) — o **legado** é memória institucional insubstituível.
