export type PrintMenuTemplateId = 'classic' | 'elegant' | 'modern' | 'bistro';

export type PrintMenuTemplateOption = {
  id: PrintMenuTemplateId;
  label: string;
  description: string;
};

/** Plantillas disponibles al imprimir carta desde el admin. */
export const PRINT_MENU_TEMPLATES: PrintMenuTemplateOption[] = [
  {
    id: 'classic',
    label: 'Clásica',
    description: 'Diseño actual: limpio, con precios a la derecha y secciones en mayúsculas.',
  },
  {
    id: 'elegant',
    label: 'Elegante',
    description: 'Tipografía serif, encabezado centrado y puntos guía entre nombre y precio.',
  },
  {
    id: 'modern',
    label: 'Moderna',
    description: 'Estilo minimalista con franja de color y secciones con barra lateral.',
  },
  {
    id: 'bistro',
    label: 'Bistro',
    description: 'Fondo cálido, estilo casual con precio debajo del nombre del plato.',
  },
];
