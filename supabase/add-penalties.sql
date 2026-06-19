-- ============================================================================
-- Portal Integre Jr — Migração: penalidades (cartões disciplinares)
-- ----------------------------------------------------------------------------
-- Cartões verde/amarelo/vermelho aplicados a membros, com pontos de advertência,
-- justificativa tabelada e data. IDEMPOTENTE.
--
-- Como aplicar:
--   Supabase Dashboard > SQL Editor > cole este arquivo > Run.
--   (rode DEPOIS de schema.sql e policies.sql — usa public.my_role())
--
-- Permissão: aplicar/remover/zerar = Presidente ou QUALQUER Diretor
-- (can_penalize). Leitura liberada a todo autenticado (todos veem a contagem).
-- ============================================================================

create table if not exists penalties (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references profiles(id) on delete cascade,
  color       text not null check (color in ('verde','amarelo','vermelho')),
  points      int  not null,
  reason      text not null,
  card_date   date not null,
  applied_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists penalties_profile_idx on penalties (profile_id);

alter table penalties enable row level security;

-- Quem pode aplicar/gerenciar penalidades: Presidente ou qualquer Diretor.
create or replace function public.can_penalize() returns boolean
  language sql stable as $$ select public.my_role() in ('Presidente','Diretor') $$;

drop policy if exists p_read_penalties on penalties;
create policy p_read_penalties on penalties for select to authenticated using (true);

drop policy if exists p_write_penalties on penalties;
create policy p_write_penalties on penalties for all to authenticated
  using (public.can_penalize()) with check (public.can_penalize());

-- FIM
