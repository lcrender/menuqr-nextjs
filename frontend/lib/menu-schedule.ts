/**
 * Programación semanal de visibilidad de menús (alineado con backend).
 * days: 1 = lunes … 7 = domingo.
 */

export type MenuScheduleConfig = {
  days: number[];
  startTime?: string | null;
  endTime?: string | null;
};

export const MENU_SCHEDULE_DAYS = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
  { value: 7, label: 'Dom' },
] as const;

export function planAllowsMenuSchedule(plan: string | null | undefined): boolean {
  const key = String(plan || 'free')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  const normalized = key === 'proteam' ? 'pro_team' : key;
  return normalized === 'pro' || normalized === 'pro_team' || normalized === 'premium';
}

export function emptyMenuSchedule(): MenuScheduleConfig {
  return { days: [1, 2, 3, 4, 5, 6, 7], startTime: null, endTime: null };
}

export function normalizeMenuSchedule(raw: unknown): MenuScheduleConfig {
  if (!raw || typeof raw !== 'object') return emptyMenuSchedule();
  const obj = raw as Record<string, unknown>;
  const daysRaw = Array.isArray(obj.days) ? obj.days : [];
  const days = [
    ...new Set(
      daysRaw
        .map((d) => Number(d))
        .filter((d) => Number.isInteger(d) && d >= 1 && d <= 7),
    ),
  ].sort((a, b) => a - b);
  return {
    days: days.length ? days : [],
    startTime:
      typeof obj.startTime === 'string' && obj.startTime.trim() ? obj.startTime.trim() : null,
    endTime: typeof obj.endTime === 'string' && obj.endTime.trim() ? obj.endTime.trim() : null,
  };
}
