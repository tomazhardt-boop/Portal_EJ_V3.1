-- ============================================================================
-- Portal Integre Jr — Migração: dados pessoais do membro para documentos
-- ----------------------------------------------------------------------------
-- Adiciona a coluna `doc_info` (jsonb) em profiles, usada para gerar o TERMO DE
-- DESLIGAMENTO e os CONTRATOS: CPF, RG, órgão emissor, estado civil,
-- nacionalidade, gênero, data de entrada e endereço (rua/número/apto/bairro/
-- cidade/estado/CEP). É IDEMPOTENTE (pode rodar de novo sem erro).
--
-- Como aplicar:
--   Supabase Dashboard > SQL Editor > cole este arquivo > Run.
--   (rode DEPOIS de schema.sql e policies.sql)
--
-- Segurança (importante): a policy `p_write_profiles` só deixa Presidente /
-- Diretor de Coordenação escrever em profiles — é a trava contra auto-promoção
-- (ninguém edita o próprio cargo/acesso). Mas a decisão de produto é que o
-- PRÓPRIO membro preenche seus dados pessoais. Para isso, sem reabrir o buraco,
-- criamos `update_my_doc_info`: função SECURITY DEFINER que atualiza SOMENTE a
-- coluna doc_info da linha do auth.uid() — não toca em cargo/acesso/status.
-- ============================================================================

alter table profiles
  add column if not exists doc_info jsonb not null default '{}'::jsonb;

-- O próprio membro grava APENAS o seu doc_info (o resto da linha continua
-- bloqueado pela RLS). Demais campos seguem só por quem gere membros.
create or replace function public.update_my_doc_info(p_doc jsonb)
returns void
language sql
security definer
set search_path = public
as $$
  update profiles
     set doc_info = coalesce(p_doc, '{}'::jsonb)
   where user_id = auth.uid();
$$;

-- Só usuários autenticados podem chamar; cada um afeta apenas a própria linha.
revoke all on function public.update_my_doc_info(jsonb) from public;
grant execute on function public.update_my_doc_info(jsonb) to authenticated;

-- FIM
