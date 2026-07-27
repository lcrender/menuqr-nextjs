-- Cupones de prueba gratis (Mercado Pago free_trial): días sin cobro, luego suscripción de pago.
ALTER TABLE "promo_codes" ADD COLUMN IF NOT EXISTS "free_trial_days" INTEGER;
