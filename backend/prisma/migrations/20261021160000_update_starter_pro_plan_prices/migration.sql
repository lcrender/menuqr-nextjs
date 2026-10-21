-- Starter y Pro: precios de lista (mensual y anual independientes).
-- USD (GLOBAL / PayPal) y ARS (AR / Mercado Pago).

UPDATE "plan_prices" SET "price" = 7.99, "price_yearly" = 79.90, "updated_at" = NOW()
WHERE "plan_id" = 'plan_starter' AND "country" = 'GLOBAL';

UPDATE "plan_prices" SET "price" = 12.99, "price_yearly" = 129.90, "updated_at" = NOW()
WHERE "plan_id" = 'plan_pro' AND "country" = 'GLOBAL';

UPDATE "plan_prices" SET "price" = 12500, "price_yearly" = 125000, "updated_at" = NOW()
WHERE "plan_id" = 'plan_starter' AND "country" = 'AR';

UPDATE "plan_prices" SET "price" = 20000, "price_yearly" = 200000, "updated_at" = NOW()
WHERE "plan_id" = 'plan_pro' AND "country" = 'AR';
