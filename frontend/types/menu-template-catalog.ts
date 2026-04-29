export type MenuTemplatePlanTier = 'free' | 'pro';

export interface MenuTemplateCatalogItem {
  slug: string;
  nombre: string;
  categoria: string;
  estilos: string[];
  tags: string[];
  plan: MenuTemplatePlanTier;
  imagen: string;
}

export type TemplateFilterPlan = 'all' | MenuTemplatePlanTier;

export interface TemplateListFilters {
  categoria: 'all' | string;
  estilo: 'all' | string;
  plan: TemplateFilterPlan;
}
