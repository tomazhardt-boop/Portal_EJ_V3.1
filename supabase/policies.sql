-- ============================================================================
-- Portal Integre Jr — POLÍTICAS DE RLS (segurança real por cargo/setor)
-- ----------------------------------------------------------------------------
-- Traduz a matriz COL_ACCESS / can() de script.js para Row Level Security no
-- banco. É a TRAVA DE VERDADE: a permissão do front (esconder botão/página) é
-- só UX e pode ser burlada pelo console; aqui o Postgres recusa a escrita.
--
-- Como aplicar (uma vez, e a cada mudança nas regras):
--   Supabase Dashboard > SQL Editor > cole este arquivo inteiro > Run.
-- É IDEMPOTENTE: pode rodar de novo sem erro (dropa as policies antes de criar)
-- e remove a antiga "tmp_authenticated_all" do schema.
--
-- Modelo de quem-sou-eu:
--   auth.uid()  -> profiles.user_id  (ligado por create-users.mjs)
--   As funções my_role()/my_sector()/my_profile_id() resolvem o perfil logado.
--   São SECURITY DEFINER de propósito: rodam ignorando a RLS de `profiles`, o
--   que (a) evita recursão infinita (policy de profiles consultando profiles) e
--   (b) deixa qualquer logado descobrir o próprio cargo.
--
-- Decisão de escopo (Fase atual, dados fictícios):
--   - LEITURA (select): liberada a todo usuário autenticado. O app cruza nomes
--     de membros/líderes/padrinhos em quase toda tela, então restringir leitura
--     quebraria a UI. Confidencialidade fina de leitura é Fase 4.
--   - ESCRITA (insert/update/delete): travada por cargo/setor conforme a matriz.
--     É aqui que mora o risco real (ex.: um Trainee se promover a Presidente).
-- ============================================================================

-- ============================== HELPERS =====================================
create or replace function public.my_role() returns user_role
  language sql stable security definer set search_path = public as $$
    select role from profiles where user_id = auth.uid() limit 1
  $$;

create or replace function public.my_sector() returns sector_name
  language sql stable security definer set search_path = public as $$
    select sector from profiles where user_id = auth.uid() limit 1
  $$;

create or replace function public.my_profile_id() returns uuid
  language sql stable security definer set search_path = public as $$
    select id from profiles where user_id = auth.uid() limit 1
  $$;

-- Atalhos de cargo (espelham roleAtLeast / canEditPlatform / can('membros.edit'))
create or replace function public.can_edit_platform() returns boolean
  language sql stable as $$ select public.my_role() in ('Presidente','Diretor') $$;

create or replace function public.can_edit_membros() returns boolean
  language sql stable as $$
    select public.my_role() = 'Presidente'
        or (public.my_role() = 'Diretor' and public.my_sector() = 'Coordenação')
  $$;

create or replace function public.role_at_least_membro() returns boolean
  language sql stable as $$ select public.my_role() in ('Membro','Gerente','Diretor','Presidente') $$;

create or replace function public.role_at_least_gerente() returns boolean
  language sql stable as $$ select public.my_role() in ('Gerente','Diretor','Presidente') $$;

-- Editar um projeto: Presidente, Diretor de Projetos, ou Gerente de Projetos
-- VINCULADO ao projeto (líder ou membro). Espelha canEditProject().
create or replace function public.can_edit_project(pid uuid) returns boolean
  language sql stable security definer set search_path = public as $$
    select
      public.my_role() = 'Presidente'
      or (public.my_role() = 'Diretor' and public.my_sector() = 'Projetos')
      or (public.my_role() = 'Gerente' and public.my_sector() = 'Projetos' and exists (
            select 1 from projects p
            left join project_members pm on pm.project_id = p.id
            where p.id = pid
              and (p.leader_id = public.my_profile_id() or pm.profile_id = public.my_profile_id())
         ))
  $$;

-- ============================== RESET ========================================
-- Liga a RLS, remove a política permissiva do schema e a policy de leitura
-- recriada por este arquivo (idempotência). As policies de escrita são dropadas
-- individualmente mais abaixo, cada uma antes do seu create.
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
    execute format('drop policy if exists tmp_authenticated_all on %I;', t);
    execute format('drop policy if exists p_read on %I;', t);
    execute format('create policy p_read on %I for select to authenticated using (true);', t);
  end loop;
end $$;

-- ============================== ESCRITA ======================================
-- Padrão: uma policy "p_write_*" por tabela. `for all` cobre insert/update/delete
-- (o select já é liberado pela p_read acima; as duas policies se somam por OR no
-- select, então leitura continua livre).

-- PROFILES: escrita só por quem gere membros (Presidente / Diretor Coordenação).
-- Isso fecha o buraco de auto-promoção: ninguém edita o próprio cargo/acesso.
drop policy if exists p_write_profiles on profiles;
create policy p_write_profiles on profiles for all to authenticated
  using (public.can_edit_membros()) with check (public.can_edit_membros());

-- PROJECTS: criar = Presidente/Diretor; alterar/excluir = quem pode editar AQUELE
-- projeto (canEditProject). Separado porque o insert não tem vínculo prévio.
drop policy if exists p_insert_projects on projects;
create policy p_insert_projects on projects for insert to authenticated
  with check (public.can_edit_platform());
drop policy if exists p_update_projects on projects;
create policy p_update_projects on projects for update to authenticated
  using (public.can_edit_project(id)) with check (public.can_edit_project(id));
drop policy if exists p_delete_projects on projects;
create policy p_delete_projects on projects for delete to authenticated
  using (public.can_edit_project(id));

-- PROJECT_MEMBERS e TASKS: seguem a edição do projeto-pai.
drop policy if exists p_write_project_members on project_members;
create policy p_write_project_members on project_members for all to authenticated
  using (public.can_edit_project(project_id)) with check (public.can_edit_project(project_id));
drop policy if exists p_write_tasks on tasks;
create policy p_write_tasks on tasks for all to authenticated
  using (public.can_edit_project(project_id)) with check (public.can_edit_project(project_id));

-- AVISOS: criar = Membro↑ (can('aviso.create')); editar/excluir = Presidente/Diretor.
drop policy if exists p_insert_avisos on avisos;
create policy p_insert_avisos on avisos for insert to authenticated
  with check (public.role_at_least_membro());
drop policy if exists p_modify_avisos on avisos;
create policy p_modify_avisos on avisos for update to authenticated
  using (public.can_edit_platform()) with check (public.can_edit_platform());
drop policy if exists p_delete_avisos on avisos;
create policy p_delete_avisos on avisos for delete to authenticated
  using (public.can_edit_platform());

-- CALENDAR_EVENTS: criar/editar/excluir = Gerente↑ (can('calendario.create')).
drop policy if exists p_write_calendar on calendar_events;
create policy p_write_calendar on calendar_events for all to authenticated
  using (public.role_at_least_gerente()) with check (public.role_at_least_gerente());

-- LEGADO / RNN-VALORES: conteúdo institucional = Presidente/Diretor (canEditPlatform).
drop policy if exists p_write_legacy_cat on legacy_categories;
create policy p_write_legacy_cat on legacy_categories for all to authenticated
  using (public.can_edit_platform()) with check (public.can_edit_platform());
drop policy if exists p_write_legacy_entries on legacy_entries;
create policy p_write_legacy_entries on legacy_entries for all to authenticated
  using (public.can_edit_platform()) with check (public.can_edit_platform());
drop policy if exists p_write_institutional on institutional_docs;
create policy p_write_institutional on institutional_docs for all to authenticated
  using (public.can_edit_platform()) with check (public.can_edit_platform());

-- METAS (3 cards + meta anual + realizado mensal): Presidente/Diretor.
drop policy if exists p_write_metas on metas;
create policy p_write_metas on metas for all to authenticated
  using (public.can_edit_platform()) with check (public.can_edit_platform());
drop policy if exists p_write_annual_goals on annual_goals;
create policy p_write_annual_goals on annual_goals for all to authenticated
  using (public.can_edit_platform()) with check (public.can_edit_platform());
drop policy if exists p_write_monthly_revenue on monthly_revenue;
create policy p_write_monthly_revenue on monthly_revenue for all to authenticated
  using (public.can_edit_platform()) with check (public.can_edit_platform());

-- ATIVIDADES: criar/editar = Membro↑ (can('atividade.create')).
drop policy if exists p_write_activities on activities;
create policy p_write_activities on activities for all to authenticated
  using (public.role_at_least_membro()) with check (public.role_at_least_membro());

-- VALIDAÇÕES DE TRAINEE: o trainee cria o PRÓPRIO pedido; o padrinho (ou quem
-- gere membros) resolve/edita; remoção pelo padrinho/admin ou pelo próprio autor.
drop policy if exists p_insert_validations on activity_validations;
create policy p_insert_validations on activity_validations for insert to authenticated
  with check (trainee_id = public.my_profile_id());
drop policy if exists p_update_validations on activity_validations;
create policy p_update_validations on activity_validations for update to authenticated
  using (padrinho_id = public.my_profile_id() or public.can_edit_membros())
  with check (padrinho_id = public.my_profile_id() or public.can_edit_membros());
drop policy if exists p_delete_validations on activity_validations;
create policy p_delete_validations on activity_validations for delete to authenticated
  using (trainee_id = public.my_profile_id() or padrinho_id = public.my_profile_id() or public.can_edit_membros());

-- CAPACITAÇÕES (árvore: tópicos/trilhas/caps): editar = Membro↑ (can('capacitacao.edit')).
drop policy if exists p_write_cap_topics on cap_topics;
create policy p_write_cap_topics on cap_topics for all to authenticated
  using (public.role_at_least_membro()) with check (public.role_at_least_membro());
drop policy if exists p_write_cap_tracks on cap_tracks;
create policy p_write_cap_tracks on cap_tracks for all to authenticated
  using (public.role_at_least_membro()) with check (public.role_at_least_membro());
drop policy if exists p_write_caps on caps;
create policy p_write_caps on caps for all to authenticated
  using (public.role_at_least_membro()) with check (public.role_at_least_membro());

-- PROGRESSO DE CAPACITAÇÃO: cada um marca só o PRÓPRIO progresso.
drop policy if exists p_write_cap_progress on cap_progress;
create policy p_write_cap_progress on cap_progress for all to authenticated
  using (profile_id = public.my_profile_id()) with check (profile_id = public.my_profile_id());

-- DRIVE (arquivos): editar = Gerente↑ (matriz: membro=view, gerente=edit).
drop policy if exists p_write_drive on drive_topics;
create policy p_write_drive on drive_topics for all to authenticated
  using (public.role_at_least_gerente()) with check (public.role_at_least_gerente());

-- PONTO: cada um registra só o PRÓPRIO ponto (ponto.use = todos, mas só a sua linha).
drop policy if exists p_write_ponto on ponto_weekly;
create policy p_write_ponto on ponto_weekly for all to authenticated
  using (profile_id = public.my_profile_id()) with check (profile_id = public.my_profile_id());

-- CONFIG DA EMPRESA: Presidente/Diretor (coluna configuracoes = edit).
drop policy if exists p_write_company on company_settings;
create policy p_write_company on company_settings for all to authenticated
  using (public.can_edit_platform()) with check (public.can_edit_platform());

-- FIM DAS POLÍTICAS
