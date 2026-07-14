export type SolNocheEditHotspot = 'logo' | 'cover' | 'name' | 'description';

export const SOL_NOCHE_HOTSPOT_LABELS: Record<SolNocheEditHotspot, string> = {
  logo: 'Logo',
  cover: 'Portada',
  name: 'Nombre del restaurante',
  description: 'Descripción',
};

/** IDs de opciones del panel asociados a cada zona editable. */
export const SOL_NOCHE_HOTSPOT_FIELD_IDS: Record<SolNocheEditHotspot, string[]> = {
  logo: ['dayLogoUrl', 'nightLogoUrl', 'showLogo'],
  cover: ['dayCoverImageUrl', 'nightCoverImageUrl', 'showCoverImage'],
  name: ['restaurantName', 'showRestaurantName'],
  description: ['restaurantDescription', 'showRestaurantDescription'],
};

export function isSolNocheEditHotspot(value: string): value is SolNocheEditHotspot {
  return value === 'logo' || value === 'cover' || value === 'name' || value === 'description';
}
