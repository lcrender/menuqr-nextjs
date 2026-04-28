/**
 * Texto del badge de estado del menú para la UI (API: PUBLISHED, DRAFT, ARCHIVED).
 * Muestra "Publicado" y "Borrador" en la sección Menús (y el resto de pantallas que reutilicen esta función).
 */
export function getMenuStatusLabelEs(status: string | undefined | null): string {
  switch (status) {
    case 'PUBLISHED':
      return 'Publicado';
    case 'DRAFT':
      return 'Borrador';
    case 'ARCHIVED':
      return 'Archivado';
    default:
      return status?.trim() ? String(status) : 'Borrador';
  }
}
