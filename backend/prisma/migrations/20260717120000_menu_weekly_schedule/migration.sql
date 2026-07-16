-- Programación semanal de menús (días / horarios de visibilidad)
ALTER TABLE menus
  ADD COLUMN IF NOT EXISTS schedule_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS schedule JSONB NULL;
