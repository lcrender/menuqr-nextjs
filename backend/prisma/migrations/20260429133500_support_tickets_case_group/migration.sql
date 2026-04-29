-- Agrupación de tickets por caso para seguimiento unificado
ALTER TABLE "support_tickets"
  ADD COLUMN IF NOT EXISTS "case_group_id" TEXT;

CREATE INDEX IF NOT EXISTS "support_tickets_case_group_id_idx"
  ON "support_tickets" ("case_group_id");

