-- Guardar plan pendiente para completar flujo registro -> verificación -> checkout
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "pending_plan" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "pending_billing_cycle" "PlanType";

