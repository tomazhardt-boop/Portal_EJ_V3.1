-- ============================================================================
-- Portal Integre Jr — Schema do banco (Etapa 0 do plano de uso interno)
-- ----------------------------------------------------------------------------
-- Modelado a partir das estruturas de dados de script.js (members, projects,
-- avisos, metas, legados, capacitacoes, ponto, etc.).
--
-- Como aplicar:
--   Supabase Dashboard > SQL Editor > cole este arquivo inteiro > Run.
--   (Ou: supabase db push, se usar a CLI.)
--
-- Princípios:
--   - Toda entidade tem PK estável (UUID ou slug), em vez de nome.
--   - Referências entre pessoas (padrinho, líder, responsável) viram FKs.
--   - Datas reais (date/timestamptz), nunca strings dd/mm/aaaa.
--   - Dados que eram globais no protótipo (ponto, progresso de capacitação)
--     passam a ser POR MEMBRO.
--   - RLS é LIGADA já, mas com política temporária permissiva (ver fim do
--     arquivo). O travamento real por cargo/setor é a Fase 4 do plano.
-- ============================================================================

create extension if not exists "pgcrypto";   -- gen_random_uuid()

-- updated_at automático
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ============================== ENUMS =======================================
do $$ begin
  create type user_role        as enum ('Presidente','Diretor','Gerente','Membro','Trainee');
  create type sector_name      as enum ('Coordenação','ADM/FIN','Projetos','Comercial','—');
  create type access_level     as enum ('Total','Diretoria','Gerência','Membro','Trainee');
  create type member_status    as enum ('Ativo','Inativo');
  create type aviso_type       as enum ('geral','setorial','direcionado');
  create type event_visibility as enum ('geral','diretoria','setorial','trainee');
  create type event_category   as enum ('reuniao-interna','evento');
  create type activity_area    as enum ('Projetos','Comercial','ADM/FIN','Diretoria');
  create type validation_status as enum ('pendente','aprovada','rejeitada');
  create type institutional_kind as enum ('rnn','valor');
exception when duplicate_object then null; end $$;

-- ============================== PERFIS ======================================
-- 1:1 com auth.users (Supabase Auth). O login real entra na Fase 1; por ora a
-- coluna user_id pode ficar nula para membros ainda sem conta.
create table profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid unique references auth.users(id) on delete set null,
  name        text not null,
  email       text unique,
  role        user_role     not null default 'Membro',
  sector      sector_name   not null default 'Projetos',
  access      access_level  not null default 'Membro',
  status      member_status not null default 'Ativo',
  course      text,
  entry_date  text,                       -- "mar/2024"; livre por enquanto
  avatar      text,                        -- iniciais ou URL
  caps_count  int  not null default 0,
  -- específico de Trainee:
  padrinho_id uuid references profiles(id) on delete set null,
  points      int  not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index on profiles (role);
create index on profiles (sector);
create index on profiles (padrinho_id);
create trigger trg_profiles_updated before update on profiles
  for each row execute function set_updated_at();

-- ============================== PROJETOS ====================================
create table projects (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,        -- 'site-vivere'
  name        text not null,
  sector      sector_name not null,
  status      text not null default 'Não iniciado',  -- 'Em dia'/'Atenção'/...
  status_class text default '',                       -- 'green'/'amber'/''
  leader_id   uuid references profiles(id) on delete set null,
  start_date  date,
  end_date    date,
  description  text,
  concluded   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger trg_projects_updated before update on projects
  for each row execute function set_updated_at();

-- membros de um projeto (N:N) — substitui o array memberNames
create table project_members (
  project_id uuid references projects(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  primary key (project_id, profile_id)
);

-- tarefas do cronograma (Gantt) — antes eram um array dentro do projeto
create table tasks (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  name        text not null,
  description  text,
  resp_id     uuid references profiles(id) on delete set null,
  start_date  date,
  due_date    date,
  done        boolean not null default false,
  position    int not null default 0,      -- ordem no cronograma
  google_event_id text,                    -- evento espelhado na agenda do responsável (Fase 5)
  created_at  timestamptz not null default now()
);
create index on tasks (project_id);

-- ============================== AVISOS ======================================
create table avisos (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  body         text not null,
  type         aviso_type not null default 'geral',
  color        text default '',             -- ''/'green'/'amber'
  author_id    uuid references profiles(id) on delete set null,
  author_label text,                         -- "Carlos Mendes (Presidente)" p/ histórico
  expiry       date,                         -- nulo = nunca expira
  target_sector  sector_name,                -- usado quando type='setorial'
  target_profile_id uuid references profiles(id) on delete set null, -- 'direcionado'
  created_at   timestamptz not null default now()
);
create index on avisos (created_at desc);

-- ============================== CALENDÁRIO ==================================
-- event_date com ANO real (corrige o bug de eventos sem ano).
create table calendar_events (
  id          uuid primary key default gen_random_uuid(),
  event_date  date not null,
  title       text not null,
  event_time  text,                         -- '19h'
  location    text,                         -- 'Sede' / 'Online'
  audience     text,                         -- texto livre exibido em "meta"
  visibility  event_visibility not null default 'geral',
  category    event_category   not null default 'evento',
  color       text default '',
  google_event_id text,                       -- id do evento no Google Calendar (Fase 5)
  created_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index on calendar_events (event_date);

-- ============================== LEGADO ======================================
-- Memória institucional dos cargos antigos — guardar com cuidado (Fase 0/backup).
create table legacy_categories (
  key      text primary key,                -- 'presidencia'
  label    text not null,
  position int not null default 0
);
create table legacy_entries (
  id          uuid primary key default gen_random_uuid(),
  category_key text not null references legacy_categories(key) on delete cascade,
  autor       text not null,                -- "Joana Vieira (2024-2025)"
  texto       text not null,
  created_at  timestamptz not null default now()
);
create index on legacy_entries (category_key);

-- ============================== RNN / VALORES ===============================
create table institutional_docs (
  id       uuid primary key default gen_random_uuid(),
  kind     institutional_kind not null,     -- 'rnn' ou 'valor'
  titulo   text not null,
  body     text not null,
  position int not null default 0
);

-- ============================== METAS =======================================
-- Os 3 cards de meta (faturamento/colabs/engajamento).
create table metas (
  key      text primary key,                -- 'faturamento','colabs','engajamento'
  label    text not null,
  prefixo  text default '',
  sufixo   text default '',
  meta     numeric not null default 0,
  atual    numeric not null default 0
);
-- Meta anual + realizado mês a mês (o card mensal é espelho disto).
create table annual_goals (
  year        int primary key,
  goal_amount numeric not null default 0
);
create table monthly_revenue (
  year      int not null,
  month     int not null check (month between 1 and 12),
  realizado numeric not null default 0,
  primary key (year, month)
);

-- ============================== ATIVIDADES ==================================
create table activities (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description  text,
  points      int not null default 0,
  area        activity_area not null,
  mandatory   boolean not null default false,  -- atividade fixa por setor (PDF)
  link        text default '',
  created_at  timestamptz not null default now()
);

-- Pedidos de validação que o trainee envia ao padrinho.
create table activity_validations (
  id            uuid primary key default gen_random_uuid(),
  trainee_id    uuid not null references profiles(id) on delete cascade,
  padrinho_id   uuid references profiles(id) on delete set null,
  activity_id   uuid references activities(id) on delete set null,
  activity_name text not null,              -- snapshot do nome no momento do envio
  points        int not null default 0,
  status        validation_status not null default 'pendente',
  sent_at       timestamptz not null default now(),
  resolved_at   timestamptz
);
create index on activity_validations (padrinho_id, status);

-- ============================== CAPACITAÇÕES ================================
-- capTree: tópicos (colunas) > trilhas > capacitações. O "concluído" é POR MEMBRO.
create table cap_topics (
  key      text primary key,                -- 'programacao'
  label    text not null,
  emoji    text default '📌',
  position int not null default 0
);
create table cap_tracks (
  id        uuid primary key default gen_random_uuid(),
  topic_key text not null references cap_topics(key) on delete cascade,
  position  int not null default 0
);
create table caps (
  id        uuid primary key default gen_random_uuid(),
  track_id  uuid not null references cap_tracks(id) on delete cascade,
  name      text not null,
  link      text default '',
  position  int not null default 0
);
create index on caps (track_id);
-- progresso individual (antes o done era global no protótipo)
create table cap_progress (
  profile_id   uuid references profiles(id) on delete cascade,
  cap_id       uuid references caps(id) on delete cascade,
  done         boolean not null default false,
  completed_at timestamptz,
  primary key (profile_id, cap_id)
);

-- ============================== DRIVE =======================================
create table drive_topics (
  id        uuid primary key default gen_random_uuid(),
  name      text not null,
  icon      text default '📁',
  link      text default '',
  position  int not null default 0,
  created_at timestamptz not null default now()
);

-- ============================== PONTO =======================================
-- Antes era um objeto global; agora é POR MEMBRO e POR SEMANA (segunda-feira).
create table ponto_weekly (
  profile_id  uuid references profiles(id) on delete cascade,
  week_start  date not null,               -- segunda-feira da semana
  worked      numeric not null default 0,  -- horas trabalhadas
  meetings    numeric not null default 0,  -- horas em reunião
  engajamento int check (engajamento between 1 and 10),
  crono_ms    bigint not null default 0,   -- acumulado do cronômetro na semana
  updated_at  timestamptz not null default now(),
  primary key (profile_id, week_start)
);
create trigger trg_ponto_updated before update on ponto_weekly
  for each row execute function set_updated_at();

-- ============================== CONFIG DA EMPRESA ===========================
-- Linha única (singleton) para nome/logo/tema globais.
create table company_settings (
  id                 boolean primary key default true check (id),
  company_name       text not null default 'Integre Jr',
  logo_url           text,
  theme              text default 'light',
  hide_trainee_points boolean not null default false,
  updated_at         timestamptz not null default now()
);
insert into company_settings (id) values (true) on conflict do nothing;

-- ============================================================================
-- RLS — ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
-- LIGAMOS a RLS em tudo agora (deny-all por padrão: sem política = nada passa).
-- As POLÍTICAS REAIS por cargo/setor (espelhando a matriz COL_ACCESS do app)
-- ficam em `policies.sql` — rode-o LOGO APÓS este arquivo:
--   Supabase Dashboard > SQL Editor > cole schema.sql > Run
--                                   > cole policies.sql > Run
-- Sem policies.sql, as tabelas ficam acessíveis só pela chave service_role.
-- ============================================================================
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','projects','project_members','tasks','avisos','calendar_events',
    'legacy_categories','legacy_entries','institutional_docs','metas',
    'annual_goals','monthly_revenue','activities','activity_validations',
    'cap_topics','cap_tracks','caps','cap_progress','drive_topics',
    'ponto_weekly','company_settings'
  ] loop
    execute format('alter table %I enable row level security;', t);
  end loop;
end $$;

-- FIM DO SCHEMA
