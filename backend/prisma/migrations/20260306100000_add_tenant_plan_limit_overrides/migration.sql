-- Overrides editables por super admin; si no hay fila para un plan, se usan los defaults en código (plan-limits.constants).

CREATE TABLE "tenant_plan_limit_overrides" (
    "plan_key" TEXT NOT NULL,
    "restaurant_limit" INTEGER NOT NULL,
    "menu_limit" INTEGER NOT NULL,
    "product_limit" INTEGER NOT NULL,
    "gourmet_template" BOOLEAN NOT NULL,
    "product_photos_allowed" BOOLEAN NOT NULL,
    "pro_only_templates" JSONB NOT NULL DEFAULT '[]',
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_plan_limit_overrides_pkey" PRIMARY KEY ("plan_key")
);
