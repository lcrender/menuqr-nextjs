/**
 * Programación semanal de visibilidad de menús (timezone del restaurante).
 * days: 1 = lunes … 7 = domingo (ISO).
 * startTime/endTime: "HH:mm" local; ambos null/vacío = todo el día.
 * dateRangeEnabled + startDate/endDate (YYYY-MM-DD): opcional; si está activo limita el rango calendário.
 */

export type MenuScheduleConfig = {
  days: number[];
  startTime?: string | null;
  endTime?: string | null;
  dateRangeEnabled?: boolean;
  startDate?: string | null;
  endDate?: string | null;
};

const DAY_FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>();
const TIME_FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>();
const DATE_FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>();

function dayFormatter(timezone: string): Intl.DateTimeFormat {
  let fmt = DAY_FORMATTER_CACHE.get(timezone);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'short' });
    DAY_FORMATTER_CACHE.set(timezone, fmt);
  }
  return fmt;
}

function timeFormatter(timezone: string): Intl.DateTimeFormat {
  let fmt = TIME_FORMATTER_CACHE.get(timezone);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    TIME_FORMATTER_CACHE.set(timezone, fmt);
  }
  return fmt;
}

function dateFormatter(timezone: string): Intl.DateTimeFormat {
  let fmt = DATE_FORMATTER_CACHE.get(timezone);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    DATE_FORMATTER_CACHE.set(timezone, fmt);
  }
  return fmt;
}

/** weekday short en en-US → ISO 1–7 */
const WEEKDAY_TO_ISO: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
};

export function getIsoWeekdayInTimezone(timezone: string, now = new Date()): number {
  try {
    const short = dayFormatter(timezone).format(now);
    return WEEKDAY_TO_ISO[short] ?? ((now.getUTCDay() + 6) % 7) + 1;
  } catch {
    return ((now.getUTCDay() + 6) % 7) + 1;
  }
}

/** Minutos desde 00:00 en la timezone indicada. */
export function getMinutesInTimezone(timezone: string, now = new Date()): number {
  try {
    const parts = timeFormatter(timezone).formatToParts(now);
    const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
    const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
    const h = hour === 24 ? 0 : hour;
    return h * 60 + minute;
  } catch {
    return now.getUTCHours() * 60 + now.getUTCMinutes();
  }
}

/** Fecha local YYYY-MM-DD en la timezone indicada. */
export function getCalendarDateInTimezone(timezone: string, now = new Date()): string {
  try {
    // en-CA → YYYY-MM-DD
    return dateFormatter(timezone).format(now);
  } catch {
    return now.toISOString().slice(0, 10);
  }
}

function parseHhMm(value: string | null | undefined): number | null {
  if (!value || typeof value !== 'string') return null;
  const m = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isFinite(h) || !Number.isFinite(min) || h < 0 || h > 23 || min < 0 || min > 59) {
    return null;
  }
  return h * 60 + min;
}

function parseIsoDate(value: string | null | undefined): string | null {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  return trimmed;
}

export function normalizeMenuSchedule(raw: unknown): MenuScheduleConfig | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const daysRaw = Array.isArray(obj.days) ? obj.days : [];
  const days = Array.from(
    new Set(
      daysRaw
        .map((d) => Number(d))
        .filter((d) => Number.isInteger(d) && d >= 1 && d <= 7),
    ),
  ).sort((a, b) => a - b);
  const startTime =
    typeof obj.startTime === 'string' && obj.startTime.trim() ? obj.startTime.trim() : null;
  const endTime =
    typeof obj.endTime === 'string' && obj.endTime.trim() ? obj.endTime.trim() : null;
  const dateRangeEnabled = Boolean(obj.dateRangeEnabled);
  const startDate = parseIsoDate(
    typeof obj.startDate === 'string' ? obj.startDate : null,
  );
  const endDate = parseIsoDate(typeof obj.endDate === 'string' ? obj.endDate : null);
  return {
    days,
    startTime,
    endTime,
    dateRangeEnabled,
    startDate: dateRangeEnabled ? startDate : null,
    endDate: dateRangeEnabled ? endDate : null,
  };
}

function isWithinDateRange(
  schedule: MenuScheduleConfig,
  timezone: string,
  now = new Date(),
): boolean {
  if (!schedule.dateRangeEnabled) return true;
  if (!schedule.startDate) return false;
  const today = getCalendarDateInTimezone(timezone, now);
  if (today < schedule.startDate) return false;
  if (schedule.endDate && today > schedule.endDate) return false;
  return true;
}

export function isWithinScheduleWindow(
  schedule: MenuScheduleConfig,
  timezone: string,
  now = new Date(),
): boolean {
  if (!isWithinDateRange(schedule, timezone, now)) return false;
  if (!schedule.days.length) return false;
  const day = getIsoWeekdayInTimezone(timezone, now);
  if (!schedule.days.includes(day)) return false;

  const start = parseHhMm(schedule.startTime);
  const end = parseHhMm(schedule.endTime);
  if (start === null && end === null) return true;
  if (start === null || end === null) return true;

  const minutes = getMinutesInTimezone(timezone, now);
  if (start === end) return true;
  if (start < end) {
    return minutes >= start && minutes < end;
  }
  return minutes >= start || minutes < end;
}

/**
 * Si scheduleEnabled es false → visible.
 * Si true → debe coincidir rango de fechas (si aplica), días y horario en timezone del restaurante.
 */
export function isMenuScheduledVisibleNow(args: {
  scheduleEnabled?: boolean | null;
  schedule?: unknown;
  timezone?: string | null;
  now?: Date;
}): boolean {
  if (!args.scheduleEnabled) return true;
  const schedule = normalizeMenuSchedule(args.schedule);
  if (!schedule) return false;
  const tz = (args.timezone || 'UTC').trim() || 'UTC';
  return isWithinScheduleWindow(schedule, tz, args.now ?? new Date());
}

export function planAllowsMenuSchedule(plan: string | null | undefined): boolean {
  const key = String(plan || 'free')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  const normalized = key === 'proteam' ? 'pro_team' : key;
  return normalized === 'pro' || normalized === 'pro_team' || normalized === 'premium';
}
