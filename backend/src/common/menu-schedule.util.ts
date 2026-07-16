/**
 * Programación semanal de visibilidad de menús (timezone del restaurante).
 * days: 1 = lunes … 7 = domingo (ISO).
 * startTime/endTime: "HH:mm" local; ambos null/vacío = todo el día.
 */

export type MenuScheduleConfig = {
  days: number[];
  startTime?: string | null;
  endTime?: string | null;
};

const DAY_FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>();
const TIME_FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>();

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
    // en-GB puede devolver 24:00 a medianoche
    const h = hour === 24 ? 0 : hour;
    return h * 60 + minute;
  } catch {
    return now.getUTCHours() * 60 + now.getUTCMinutes();
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

export function normalizeMenuSchedule(raw: unknown): MenuScheduleConfig | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const daysRaw = Array.isArray(obj.days) ? obj.days : [];
  const days = [
    ...new Set(
      daysRaw
        .map((d) => Number(d))
        .filter((d) => Number.isInteger(d) && d >= 1 && d <= 7),
    ),
  ].sort((a, b) => a - b);
  const startTime =
    typeof obj.startTime === 'string' && obj.startTime.trim() ? obj.startTime.trim() : null;
  const endTime =
    typeof obj.endTime === 'string' && obj.endTime.trim() ? obj.endTime.trim() : null;
  return { days, startTime, endTime };
}

export function isWithinScheduleWindow(
  schedule: MenuScheduleConfig,
  timezone: string,
  now = new Date(),
): boolean {
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
  // Cruza medianoche
  return minutes >= start || minutes < end;
}

/**
 * Si scheduleEnabled es false → visible.
 * Si true → debe coincidir días/horario en timezone del restaurante.
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
