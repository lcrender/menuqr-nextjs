-- Renombrar plan de suscripción/tenant "basic" -> "starter" y plan de catálogo plan_basic -> plan_starter.

UPDATE tenants SET plan = 'starter' WHERE plan = 'basic';
UPDATE subscriptions SET subscription_plan = 'starter' WHERE subscription_plan = 'basic';
UPDATE tenant_plan_limit_overrides SET plan_key = 'starter' WHERE plan_key = 'basic';

-- FK plan_prices.plan_id -> plans.id tiene ON UPDATE CASCADE
UPDATE plans SET id = 'plan_starter', name = 'Starter' WHERE id = 'plan_basic';

UPDATE plan_prices SET id = 'pp_ar_starter' WHERE id = 'pp_ar_basic';
UPDATE plan_prices SET id = 'pp_global_starter' WHERE id = 'pp_global_basic';
