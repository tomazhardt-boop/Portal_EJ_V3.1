-- ============================================================================
-- Portal Integre Jr — Migração: aviso de promoção de cargo
-- ----------------------------------------------------------------------------
-- Adiciona a coluna `last_seen_role` (user_role) em profiles: o ÚLTIMO cargo que
-- o próprio membro já "viu" (reconheceu) ao logar. No login, o app compara o
-- cargo ATUAL com este: se subiu na hierarquia (Trainee→Membro→Gerente→Diretor→
-- Presidente), mostra o banner de parabéns UMA vez e marca o cargo como visto.
-- É IDEMPOTENTE (pode rodar de novo sem erro).
--
-- Como aplicar:
--   Supabase Dashboard > SQL Editor > cole este arquivo > Run.
--   (rode DEPOIS de schema.sql e policies.sql)
--
-- Segurança: igual ao doc_info — a policy `p_write_profiles` só deixa
-- Presidente / Diretor de Coordenação escrever em profiles (trava de
-- auto-promoção). Quem MUDA o cargo é a diretoria; quem RECONHECE o próprio
-- cargo é o membro. Para o membro marcar "já vi meu cargo" sem reabrir o buraco,
-- criamos `ack_my_role`: função SECURITY DEFINER que copia role→last_seen_role
-- SOMENTE na linha do auth.uid() — não toca em cargo/acesso/status.
-- ============================================================================

alter table profiles
  add column if not exists last_seen_role user_role;

-- Baseline para os membros já existentes: marca o cargo atual como "já visto",
-- senão o primeiro login depois da migração dispararia um banner indevido.
update profiles set last_seen_role = role where last_seen_role is null;

-- O próprio membro marca o cargo atual como visto (copia role→last_seen_role na
-- sua linha). NÃO recebe parâmetro: não dá para forjar um cargo — só reconhece o
-- que a diretoria já gravou em `role`.
create or replace function public.ack_my_role()
returns void
language sql
security definer
set search_path = public
as $$
  update profiles
     set last_seen_role = role
   where user_id = auth.uid();
$$;

-- Só usuários autenticados podem chamar; cada um afeta apenas a própria linha.
revoke all on function public.ack_my_role() from public;
grant execute on function public.ack_my_role() to authenticated;

-- FIM
