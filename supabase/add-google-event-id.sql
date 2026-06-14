-- ============================================================================
-- Migração (Fase 5): guarda o id do evento no Google Calendar.
-- ----------------------------------------------------------------------------
-- Necessária só no banco que JÁ existe (o schema.sql novo já traz a coluna).
-- Serve para, no futuro, sincronizar edição/exclusão de eventos com o Google.
-- Como aplicar: Supabase Dashboard > SQL Editor > cole isto > Run.
-- É idempotente (IF NOT EXISTS): pode rodar de novo sem erro.
-- ============================================================================
alter table calendar_events add column if not exists google_event_id text;
