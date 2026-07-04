-- Habilita plantilla proMobile en overrides de planes de pago (antes solo gourmet).
UPDATE tenant_plan_limit_overrides
SET pro_only_templates = '["gourmet", "proMobile"]'::jsonb
WHERE plan_key IN ('pro', 'pro_team', 'premium');
