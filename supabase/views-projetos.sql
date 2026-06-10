-- ============================================================================
-- Divisão de projetos: ATIVOS x CONCLUÍDOS (views)
-- ----------------------------------------------------------------------------
-- A tabela `projects` continua sendo a fonte única (a coluna `concluded` é o
-- gatilho). Estas duas views dão a separação no banco SEM mover linhas nem
-- quebrar as FKs de project_members/tasks (que apontam para projects.id).
--
-- Como aplicar (uma vez):
--   Supabase Dashboard > SQL Editor > cole este arquivo > Run.
--
-- security_invoker = true: a view respeita a RLS do usuário que consulta
-- (mesma política da tabela projects), em vez de rodar como dono.
-- ============================================================================

create or replace view projetos_ativos
  with (security_invoker = true) as
  select * from projects where concluded = false;

create or replace view projetos_concluidos
  with (security_invoker = true) as
  select * from projects where concluded = true;

-- Mesmos acessos de leitura da tabela base.
grant select on projetos_ativos     to anon, authenticated;
grant select on projetos_concluidos to anon, authenticated;

-- FIM
