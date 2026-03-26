-- Flag adicional por plan: habilita la opción "Destacar producto" para crear/editar items
ALTER TABLE "tenant_plan_limit_overrides"
ADD COLUMN "product_highlight_allowed" BOOLEAN NOT NULL DEFAULT false;

