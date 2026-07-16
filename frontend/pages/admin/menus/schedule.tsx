import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/AdminLayout';
import AlertModal from '../../../components/AlertModal';
import api from '../../../lib/axios';
import {
  MENU_SCHEDULE_DAYS,
  emptyMenuSchedule,
  normalizeMenuSchedule,
  planAllowsMenuSchedule,
  type MenuScheduleConfig,
} from '../../../lib/menu-schedule';
import { SOL_NOCHE_TIMEZONE_OPTIONS } from '../../../lib/sol-noche-template';

type RestaurantOption = {
  id: string;
  name: string;
  timezone?: string | null;
};

type MenuRow = {
  id: string;
  name: string;
  status?: string;
  scheduleEnabled?: boolean;
  schedule?: MenuScheduleConfig | null;
  schedule_enabled?: boolean;
};

type MenuScheduleDraft = {
  scheduleEnabled: boolean;
  schedule: MenuScheduleConfig;
};

function normalizeMenusPayload(raw: unknown): MenuRow[] {
  if (Array.isArray(raw)) return raw as MenuRow[];
  if (raw && typeof raw === 'object' && Array.isArray((raw as { data?: unknown }).data)) {
    return (raw as { data: MenuRow[] }).data;
  }
  return [];
}

export default function ProgramarMenusPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<{ role?: string; tenant?: { plan?: string } } | null>(null);
  const [tenantPlan, setTenantPlan] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<RestaurantOption[]>([]);
  const [restaurantId, setRestaurantId] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [menus, setMenus] = useState<MenuRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, MenuScheduleDraft>>({});
  const [alert, setAlert] = useState<{
    title: string;
    message: string;
    variant: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);

  const canAccess = useMemo(() => {
    if (user?.role === 'SUPER_ADMIN') return true;
    return planAllowsMenuSchedule(tenantPlan || user?.tenant?.plan);
  }, [user, tenantPlan]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) {
        router.push('/login');
        return;
      }
      const parsed = JSON.parse(raw);
      setUser(parsed);
      if (parsed?.tenant?.plan) setTenantPlan(parsed.tenant.plan);
    } catch {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    if (!user) return;
    if (!canAccess && user.role !== 'SUPER_ADMIN') {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        if (user.role === 'ADMIN') {
          try {
            const stats = await api.get('/restaurants/dashboard-stats');
            if (stats.data?.plan) setTenantPlan(stats.data.plan);
          } catch {
            /* keep tenant plan from user */
          }
        }
        const res = await api.get('/restaurants');
        let list = res.data;
        if (res.data?.data && res.data.total !== undefined) list = res.data.data;
        const restaurantsList = Array.isArray(list) ? list : [];
        setRestaurants(restaurantsList);
        const qId = typeof router.query.restaurantId === 'string' ? router.query.restaurantId : '';
        const initial =
          (qId && restaurantsList.find((r: RestaurantOption) => r.id === qId)?.id) ||
          restaurantsList[0]?.id ||
          '';
        setRestaurantId(initial);
      } catch {
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, canAccess, router.query.restaurantId]);

  const loadMenusForRestaurant = useCallback(async (id: string) => {
    if (!id) {
      setMenus([]);
      setDrafts({});
      return;
    }
    const restaurant = restaurants.find((r) => r.id === id);
    setTimezone(restaurant?.timezone || 'UTC');

    const res = await api.get('/menus', { params: { restaurantId: id } });
    const list = normalizeMenusPayload(res.data);
    setMenus(list);
    const next: Record<string, MenuScheduleDraft> = {};
    for (const menu of list) {
      const enabled = Boolean(menu.scheduleEnabled ?? menu.schedule_enabled);
      next[menu.id] = {
        scheduleEnabled: enabled,
        schedule: normalizeMenuSchedule(menu.schedule),
      };
    }
    setDrafts(next);
  }, [restaurants]);

  useEffect(() => {
    if (!restaurantId || !canAccess) return;
    loadMenusForRestaurant(restaurantId).catch(() => {
      setMenus([]);
      setDrafts({});
    });
  }, [restaurantId, canAccess, loadMenusForRestaurant]);

  const updateDraft = (menuId: string, patch: Partial<MenuScheduleDraft>) => {
    setDrafts((prev) => {
      const current = prev[menuId] || {
        scheduleEnabled: false,
        schedule: emptyMenuSchedule(),
      };
      return {
        ...prev,
        [menuId]: {
          ...current,
          ...patch,
          schedule: patch.schedule
            ? { ...current.schedule, ...patch.schedule }
            : current.schedule,
        },
      };
    });
  };

  const toggleDay = (menuId: string, day: number) => {
    const current = drafts[menuId]?.schedule || emptyMenuSchedule();
    const has = current.days.includes(day);
    const days = has ? current.days.filter((d) => d !== day) : [...current.days, day].sort((a, b) => a - b);
    updateDraft(menuId, { schedule: { ...current, days } });
  };

  const handleSave = async () => {
    if (!restaurantId) return;
    setSaving(true);
    try {
      await api.put(`/restaurants/${restaurantId}`, { timezone });

      for (const menu of menus) {
        const draft = drafts[menu.id];
        if (!draft) continue;
        if (draft.scheduleEnabled && draft.schedule.days.length === 0) {
          setAlert({
            title: 'Faltan días',
            message: `Seleccioná al menos un día para el menú «${menu.name}».`,
            variant: 'warning',
          });
          setSaving(false);
          return;
        }
        if (draft.scheduleEnabled && draft.schedule.dateRangeEnabled) {
          if (!draft.schedule.startDate) {
            setAlert({
              title: 'Falta fecha de inicio',
              message: `Indicá el día de inicio para el menú «${menu.name}».`,
              variant: 'warning',
            });
            setSaving(false);
            return;
          }
          if (
            draft.schedule.endDate &&
            draft.schedule.startDate &&
            draft.schedule.endDate < draft.schedule.startDate
          ) {
            setAlert({
              title: 'Rango inválido',
              message: `En «${menu.name}», la fecha de finalización no puede ser anterior a la de inicio.`,
              variant: 'warning',
            });
            setSaving(false);
            return;
          }
        }
        await api.put(`/menus/${menu.id}`, {
          scheduleEnabled: draft.scheduleEnabled,
          schedule: draft.scheduleEnabled
            ? {
                days: draft.schedule.days,
                startTime: draft.schedule.startTime || null,
                endTime: draft.schedule.endTime || null,
                dateRangeEnabled: Boolean(draft.schedule.dateRangeEnabled),
                startDate: draft.schedule.dateRangeEnabled
                  ? draft.schedule.startDate || null
                  : null,
                endDate: draft.schedule.dateRangeEnabled
                  ? draft.schedule.endDate || null
                  : null,
              }
            : {
                days: [],
                startTime: null,
                endTime: null,
                dateRangeEnabled: false,
                startDate: null,
                endDate: null,
              },
        });
      }

      setAlert({
        title: 'Guardado',
        message: 'La programación de menús se guardó correctamente.',
        variant: 'success',
      });
      await loadMenusForRestaurant(restaurantId);
    } catch (err: any) {
      setAlert({
        title: 'Error',
        message: err?.userMessage || err?.response?.data?.message || 'No se pudo guardar la programación.',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <AdminLayout>
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!canAccess) {
    return (
      <AdminLayout>
        <div className="admin-main py-4">
          <Link href="/admin/menus" className="btn btn-sm btn-outline-secondary mb-3">
            ← Volver a Menús
          </Link>
          <h1 className="admin-title">Programar menú</h1>
          <p className="lead text-muted">
            Definí qué días y horarios se muestra cada menú en la carta pública, según el huso horario del
            restaurante.
          </p>
          <div className="admin-card p-4">
            <p className="mb-3">
              Esta función está disponible en planes <strong>Pro</strong> o <strong>Premium</strong>.
            </p>
            <Link href="/admin/profile/subscription" className="admin-btn">
              Ver planes / suscripción
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-main menu-schedule-page">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
          <div>
            <Link href="/admin/menus" className="btn btn-sm btn-outline-secondary mb-2">
              ← Volver a Menús
            </Link>
            <h1 className="admin-title mb-0">Programar menú</h1>
            <p className="text-muted mb-0 mt-1">
              Elegí el restaurante, su huso horario y los días/horarios de cada menú.
            </p>
          </div>
          <button
            type="button"
            className="admin-btn"
            disabled={saving || !restaurantId || menus.length === 0}
            onClick={handleSave}
          >
            {saving ? 'Guardando…' : 'Guardar programación'}
          </button>
        </div>

        {restaurants.length === 0 ? (
          <div className="admin-card p-4 text-center">
            <p className="mb-3">Necesitás al menos un restaurante para programar menús.</p>
            <Link href="/admin/restaurants?wizard=true" className="admin-btn">
              Crear restaurante
            </Link>
          </div>
        ) : (
          <>
            <div className="admin-card menu-schedule-controls mb-4">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold" htmlFor="schedule-restaurant">
                    Restaurante
                  </label>
                  <select
                    id="schedule-restaurant"
                    className="form-select"
                    value={restaurantId}
                    onChange={(e) => setRestaurantId(e.target.value)}
                  >
                    {restaurants.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold" htmlFor="schedule-timezone">
                    Huso horario del restaurante
                  </label>
                  <select
                    id="schedule-timezone"
                    className="form-select"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    disabled={!restaurantId}
                  >
                    {SOL_NOCHE_TIMEZONE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                    {!SOL_NOCHE_TIMEZONE_OPTIONS.some((o) => o.value === timezone) && timezone ? (
                      <option value={timezone}>{timezone}</option>
                    ) : null}
                  </select>
                </div>
              </div>
            </div>

            {menus.length === 0 ? (
              <div className="admin-card p-4">
                <p className="mb-0 text-muted">Este restaurante no tiene menús todavía.</p>
              </div>
            ) : (
              <div className="menu-schedule-list">
                {menus.map((menu) => {
                  const draft = drafts[menu.id] || {
                    scheduleEnabled: false,
                    schedule: emptyMenuSchedule(),
                  };
                  return (
                    <article key={menu.id} className="admin-card menu-schedule-card">
                      <div className="menu-schedule-card-head">
                        <div>
                          <h2 className="menu-schedule-card-title">{menu.name}</h2>
                          {menu.status ? (
                            <span className="badge bg-secondary">{menu.status}</span>
                          ) : null}
                        </div>
                        <label className="menu-schedule-switch">
                          <input
                            type="checkbox"
                            checked={draft.scheduleEnabled}
                            onChange={(e) =>
                              updateDraft(menu.id, {
                                scheduleEnabled: e.target.checked,
                                schedule: draft.schedule.days.length
                                  ? draft.schedule
                                  : emptyMenuSchedule(),
                              })
                            }
                          />
                          <span>Programar visibilidad</span>
                        </label>
                      </div>

                      {draft.scheduleEnabled ? (
                        <div className="menu-schedule-card-body">
                          <p className="menu-schedule-label">Días visibles</p>
                          <div className="menu-schedule-days">
                            {MENU_SCHEDULE_DAYS.map((day) => (
                              <label
                                key={day.value}
                                className={`menu-schedule-day${
                                  draft.schedule.days.includes(day.value) ? ' is-active' : ''
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={draft.schedule.days.includes(day.value)}
                                  onChange={() => toggleDay(menu.id, day.value)}
                                />
                                {day.label}
                              </label>
                            ))}
                          </div>

                          <p className="menu-schedule-label mt-3">Horario (opcional)</p>
                          <p className="text-muted small mb-2">
                            Si dejás vacío, el menú se ve todo el día en los días elegidos.
                          </p>
                          <div className="row g-2">
                            <div className="col-6 col-md-3">
                              <label className="form-label small mb-1" htmlFor={`start-${menu.id}`}>
                                Desde
                              </label>
                              <input
                                id={`start-${menu.id}`}
                                type="time"
                                className="form-control"
                                value={draft.schedule.startTime || ''}
                                onChange={(e) =>
                                  updateDraft(menu.id, {
                                    schedule: {
                                      ...draft.schedule,
                                      startTime: e.target.value || null,
                                    },
                                  })
                                }
                              />
                            </div>
                            <div className="col-6 col-md-3">
                              <label className="form-label small mb-1" htmlFor={`end-${menu.id}`}>
                                Hasta
                              </label>
                              <input
                                id={`end-${menu.id}`}
                                type="time"
                                className="form-control"
                                value={draft.schedule.endTime || ''}
                                onChange={(e) =>
                                  updateDraft(menu.id, {
                                    schedule: {
                                      ...draft.schedule,
                                      endTime: e.target.value || null,
                                    },
                                  })
                                }
                              />
                            </div>
                          </div>

                          <label className="menu-schedule-switch mt-3">
                            <input
                              type="checkbox"
                              checked={Boolean(draft.schedule.dateRangeEnabled)}
                              onChange={(e) =>
                                updateDraft(menu.id, {
                                  schedule: {
                                    ...draft.schedule,
                                    dateRangeEnabled: e.target.checked,
                                    startDate: e.target.checked
                                      ? draft.schedule.startDate ?? null
                                      : null,
                                    endDate: e.target.checked
                                      ? draft.schedule.endDate ?? null
                                      : null,
                                  },
                                })
                              }
                            />
                            <span>Limitar por fechas</span>
                          </label>
                          <p className="text-muted small mb-2 mt-1">
                            Si no está activo, la programación aplica solo por días y horarios, sin
                            importar la fecha del calendario.
                          </p>
                          {draft.schedule.dateRangeEnabled ? (
                            <div className="row g-2">
                              <div className="col-6 col-md-4">
                                <label
                                  className="form-label small mb-1"
                                  htmlFor={`date-start-${menu.id}`}
                                >
                                  Día de inicio
                                </label>
                                <input
                                  id={`date-start-${menu.id}`}
                                  type="date"
                                  className="form-control"
                                  value={draft.schedule.startDate || ''}
                                  onChange={(e) =>
                                    updateDraft(menu.id, {
                                      schedule: {
                                        ...draft.schedule,
                                        startDate: e.target.value || null,
                                      },
                                    })
                                  }
                                />
                              </div>
                              <div className="col-6 col-md-4">
                                <label
                                  className="form-label small mb-1"
                                  htmlFor={`date-end-${menu.id}`}
                                >
                                  Día de finalización (opcional)
                                </label>
                                <input
                                  id={`date-end-${menu.id}`}
                                  type="date"
                                  className="form-control"
                                  value={draft.schedule.endDate || ''}
                                  min={draft.schedule.startDate || undefined}
                                  onChange={(e) =>
                                    updateDraft(menu.id, {
                                      schedule: {
                                        ...draft.schedule,
                                        endDate: e.target.value || null,
                                      },
                                    })
                                  }
                                />
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <p className="text-muted small mb-0 mt-2">
                          Sin programación: si está publicado, se muestra siempre (dentro de vigencia).
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {alert && (
        <AlertModal
          show={!!alert}
          title={alert.title}
          message={alert.message}
          variant={alert.variant}
          onClose={() => setAlert(null)}
        />
      )}
    </AdminLayout>
  );
}
