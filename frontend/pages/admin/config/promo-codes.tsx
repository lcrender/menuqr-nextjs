import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/AdminLayout';
import api from '../../../lib/axios';
import { getApiErrorMessage } from '../../../lib/api-error-message';

type PlanSlug = 'starter' | 'pro' | 'premium';

type PromoCode = {
  id: string;
  code: string;
  description: string | null;
  grantPlanSlug: PlanSlug;
  applicablePlanSlugs: PlanSlug[];
  validFrom: string;
  validUntil: string;
  grantDurationMonths: number;
  maxRedemptions: number | null;
  maxRedemptionsPerUser: number;
  redemptionCount: number;
  isActive: boolean;
};

type ReminderRule = {
  daysBefore: number;
  subject: string;
  bodyHtml: string;
};

type ReminderSettings = {
  enabled: boolean;
  reminders: ReminderRule[];
};

const PLAN_OPTIONS: { slug: PlanSlug; label: string }[] = [
  { slug: 'starter', label: 'Starter' },
  { slug: 'pro', label: 'Pro' },
  { slug: 'premium', label: 'Premium' },
];

const EMPTY_FORM = {
  code: '',
  description: '',
  grantPlanSlug: 'starter' as PlanSlug,
  applicablePlanSlugs: ['starter'] as PlanSlug[],
  validFrom: '',
  validUntil: '',
  grantDurationMonths: 3,
  maxRedemptions: '' as string | number,
  maxRedemptionsPerUser: 1,
  isActive: true,
};

function formatDateInput(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 16);
}

function formatDisplayDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR');
}

export default function AdminConfigPromoCodes() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
    enabled: true,
    reminders: [],
  });
  const [loading, setLoading] = useState(true);
  const [savingReminders, setSavingReminders] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [savingCode, setSavingCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const raw = localStorage.getItem('user');
    if (!token || !raw) {
      router.push('/login');
      return;
    }
    try {
      const u = JSON.parse(raw);
      setUser(u);
      if (u.role !== 'SUPER_ADMIN') router.replace('/admin');
    } catch {
      router.push('/login');
    }
  }, [router]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [codesRes, reminderRes] = await Promise.all([
        api.get<PromoCode[]>('/admin/promo-codes'),
        api.get<ReminderSettings>('/admin/promo-codes/reminder-settings'),
      ]);
      setCodes(Array.isArray(codesRes.data) ? codesRes.data : []);
      setReminderSettings(reminderRes.data);
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'No se pudieron cargar los códigos promocionales'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'SUPER_ADMIN') return;
    load();
  }, [user]);

  const openCreate = () => {
    const now = new Date();
    const in30 = new Date(now);
    in30.setDate(in30.getDate() + 30);
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      validFrom: formatDateInput(now.toISOString()),
      validUntil: formatDateInput(in30.toISOString()),
    });
    setModalOpen(true);
  };

  const openEdit = (c: PromoCode) => {
    setEditingId(c.id);
    setForm({
      code: c.code,
      description: c.description ?? '',
      grantPlanSlug: c.grantPlanSlug,
      applicablePlanSlugs: [...c.applicablePlanSlugs],
      validFrom: formatDateInput(c.validFrom),
      validUntil: formatDateInput(c.validUntil),
      grantDurationMonths: c.grantDurationMonths,
      maxRedemptions: c.maxRedemptions ?? '',
      maxRedemptionsPerUser: c.maxRedemptionsPerUser,
      isActive: c.isActive,
    });
    setModalOpen(true);
  };

  const toggleApplicable = (slug: PlanSlug, checked: boolean) => {
    setForm((prev) => {
      let next: PlanSlug[] = checked
        ? Array.from(new Set([...prev.applicablePlanSlugs, slug]))
        : prev.applicablePlanSlugs.filter((s) => s !== slug);
      if (next.length === 0) next = [prev.grantPlanSlug];
      return { ...prev, applicablePlanSlugs: next };
    });
  };

  const saveCode = async () => {
    if (!form.grantPlanSlug || !form.applicablePlanSlugs.includes(form.grantPlanSlug)) {
      setError('El plan otorgado debe estar marcado en "Aplica en checkout de".');
      return;
    }
    setSavingCode(true);
    setError(null);
    setSuccess(null);
    try {
      const body = {
        code: form.code,
        description: form.description || undefined,
        grantPlanSlug: form.grantPlanSlug,
        applicablePlanSlugs: form.applicablePlanSlugs,
        validFrom: new Date(form.validFrom).toISOString(),
        validUntil: new Date(form.validUntil).toISOString(),
        grantDurationMonths: form.grantDurationMonths,
        maxRedemptions: form.maxRedemptions === '' ? undefined : Number(form.maxRedemptions),
        maxRedemptionsPerUser: form.maxRedemptionsPerUser,
        isActive: form.isActive,
      };
      if (editingId) {
        const { code: _c, ...patch } = body;
        await api.patch(`/admin/promo-codes/${editingId}`, patch);
        setSuccess('Código actualizado.');
      } else {
        await api.post('/admin/promo-codes', body);
        setSuccess('Código creado.');
      }
      setModalOpen(false);
      await load();
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'No se pudo guardar el código'));
    } finally {
      setSavingCode(false);
    }
  };

  const deactivate = async (id: string) => {
    if (!confirm('¿Desactivar este código? No afecta canjes ya realizados.')) return;
    try {
      await api.patch(`/admin/promo-codes/${id}/deactivate`);
      setSuccess('Código desactivado.');
      await load();
    } catch (e: any) {
      setError(getApiErrorMessage(e));
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setSuccess(`Código ${code} copiado.`);
    } catch {
      setError('No se pudo copiar al portapapeles.');
    }
  };

  const saveReminders = async () => {
    setSavingReminders(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.patch<ReminderSettings>(
        '/admin/promo-codes/reminder-settings',
        reminderSettings,
      );
      setReminderSettings(res.data);
      setSuccess('Recordatorios guardados.');
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'No se pudieron guardar los recordatorios'));
    } finally {
      setSavingReminders(false);
    }
  };

  const sendReminderTest = async () => {
    setSendingTest(true);
    setError(null);
    try {
      const res = await api.post('/admin/promo-codes/reminder-settings/test');
      setSuccess(`Email de prueba enviado a ${res.data?.to || 'tu email'}.`);
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'No se pudo enviar el email de prueba'));
    } finally {
      setSendingTest(false);
    }
  };

  const updateReminder = (index: number, patch: Partial<ReminderRule>) => {
    setReminderSettings((prev) => ({
      ...prev,
      reminders: prev.reminders.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    }));
  };

  const addReminder = () => {
    setReminderSettings((prev) => ({
      ...prev,
      reminders: [
        ...prev.reminders,
        {
          daysBefore: 3,
          subject: 'Tu beneficio promocional en AppMenuQR vence pronto',
          bodyHtml:
            '<p>Hola {{firstName}},</p><p>Tu plan {{planName}} gratuito (código {{promoCode}}) vence el {{expiresAt}}.</p><p><a href="{{subscriptionUrl}}">Ver mi suscripción</a></p>',
        },
      ],
    }));
  };

  const removeReminder = (index: number) => {
    setReminderSettings((prev) => ({
      ...prev,
      reminders: prev.reminders.filter((_, i) => i !== index),
    }));
  };

  if (!user || user.role !== 'SUPER_ADMIN') {
    return (
      <AdminLayout>
        <div className="text-center p-5">
          <div className="spinner-border" role="status" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ maxWidth: 1100 }}>
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-4">
          <div>
            <h1 className="admin-title mb-2">Códigos promocionales</h1>
            <p className="text-muted mb-0">
              Cupones 100% gratis con ventana de canje, plan configurable y recordatorios por email.
            </p>
          </div>
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            + Nuevo código
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status" />
          </div>
        ) : (
          <>
            <div className="card shadow-sm mb-4">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0 align-middle">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Otorga</th>
                        <th>Aplica a</th>
                        <th>Meses</th>
                        <th>Válido hasta</th>
                        <th>Usos</th>
                        <th>Estado</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {codes.length === 0 && (
                        <tr>
                          <td colSpan={8} className="text-muted text-center py-4">
                            No hay códigos promocionales.
                          </td>
                        </tr>
                      )}
                      {codes.map((c) => {
                        const expired = new Date(c.validUntil) < new Date();
                        const status = !c.isActive
                          ? 'Desactivado'
                          : expired
                            ? 'Expirado'
                            : 'Activo';
                        return (
                          <tr key={c.id}>
                            <td>
                              <code>{c.code}</code>
                              <button
                                type="button"
                                className="btn btn-link btn-sm p-0 ms-2"
                                onClick={() => copyCode(c.code)}
                              >
                                Copiar
                              </button>
                            </td>
                            <td>
                              <span className="badge bg-primary">
                                {PLAN_OPTIONS.find((p) => p.slug === c.grantPlanSlug)?.label ?? c.grantPlanSlug}
                              </span>
                            </td>
                            <td>
                              {c.applicablePlanSlugs.map((s) => (
                                <span key={s} className="badge bg-secondary me-1">
                                  {PLAN_OPTIONS.find((p) => p.slug === s)?.label ?? s}
                                </span>
                              ))}
                            </td>
                            <td>{c.grantDurationMonths}</td>
                            <td>{formatDisplayDate(c.validUntil)}</td>
                            <td>
                              {c.redemptionCount}
                              {c.maxRedemptions != null ? ` / ${c.maxRedemptions}` : ' / ∞'}
                            </td>
                            <td>{status}</td>
                            <td className="text-end">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary me-1"
                                onClick={() => openEdit(c)}
                              >
                                Editar
                              </button>
                              {c.isActive && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => deactivate(c.id)}
                                >
                                  Desactivar
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="card shadow-sm">
              <div className="card-body">
                <h2 className="h5 mb-3">Recordatorio por email</h2>
                <p className="text-muted small">
                  Placeholders:{' '}
                  <code>{'{{firstName}} {{lastName}} {{email}} {{planName}} {{expiresAt}} {{daysRemaining}} {{promoCode}} {{subscriptionUrl}}'}</code>
                </p>
                <div className="form-check mb-3">
                  <input
                    id="reminder-enabled"
                    className="form-check-input"
                    type="checkbox"
                    checked={reminderSettings.enabled}
                    onChange={(e) =>
                      setReminderSettings((p) => ({ ...p, enabled: e.target.checked }))
                    }
                  />
                  <label className="form-check-label" htmlFor="reminder-enabled">
                    Enviar recordatorios antes del vencimiento del beneficio
                  </label>
                </div>
                {reminderSettings.reminders.map((r, i) => (
                  <div key={i} className="border rounded p-3 mb-3">
                    <div className="row g-2">
                      <div className="col-md-2">
                        <label className="form-label small">Días antes</label>
                        <input
                          type="number"
                          min={1}
                          className="form-control form-control-sm"
                          value={r.daysBefore}
                          onChange={(e) =>
                            updateReminder(i, { daysBefore: parseInt(e.target.value, 10) || 1 })
                          }
                        />
                      </div>
                      <div className="col-md-10">
                        <label className="form-label small">Asunto</label>
                        <input
                          className="form-control form-control-sm"
                          value={r.subject}
                          onChange={(e) => updateReminder(i, { subject: e.target.value })}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label small">Cuerpo (HTML)</label>
                        <textarea
                          className="form-control form-control-sm"
                          rows={4}
                          value={r.bodyHtml}
                          onChange={(e) => updateReminder(i, { bodyHtml: e.target.value })}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger mt-2"
                      onClick={() => removeReminder(i)}
                      disabled={reminderSettings.reminders.length <= 1}
                    >
                      Eliminar recordatorio
                    </button>
                  </div>
                ))}
                <div className="d-flex flex-wrap gap-2">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={addReminder}>
                    + Agregar recordatorio
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={sendReminderTest}
                    disabled={sendingTest || savingReminders}
                  >
                    {sendingTest ? 'Enviando…' : 'Enviar prueba'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={saveReminders}
                    disabled={savingReminders || sendingTest}
                  >
                    {savingReminders ? 'Guardando…' : 'Guardar recordatorios'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {modalOpen && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingId ? 'Editar código' : 'Nuevo código'}</h5>
                <button type="button" className="btn-close" onClick={() => setModalOpen(false)} />
              </div>
              <div className="modal-body">
                {!editingId && (
                  <div className="mb-3">
                    <label className="form-label">Código</label>
                    <input
                      className="form-control"
                      value={form.code}
                      onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                      placeholder="LANZAMIENTO2026"
                    />
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label">Nota interna (opcional)</label>
                  <input
                    className="form-control"
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  />
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Plan que otorga</label>
                    <select
                      className="form-select"
                      value={form.grantPlanSlug}
                      onChange={(e) => {
                        const slug = e.target.value as PlanSlug;
                        setForm((p) => ({
                          ...p,
                          grantPlanSlug: slug,
                          applicablePlanSlugs: p.applicablePlanSlugs.includes(slug)
                            ? p.applicablePlanSlugs
                            : [...p.applicablePlanSlugs, slug],
                        }));
                      }}
                    >
                      {PLAN_OPTIONS.map((p) => (
                        <option key={p.slug} value={p.slug}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Meses de plan gratis</label>
                    <input
                      type="number"
                      min={1}
                      className="form-control"
                      value={form.grantDurationMonths}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          grantDurationMonths: parseInt(e.target.value, 10) || 1,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label d-block">Aplica en checkout de</label>
                  {PLAN_OPTIONS.map((p) => (
                    <div key={p.slug} className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`ap-${p.slug}`}
                        checked={form.applicablePlanSlugs.includes(p.slug)}
                        onChange={(e) => toggleApplicable(p.slug, e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor={`ap-${p.slug}`}>
                        {p.label}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Válido desde</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={form.validFrom}
                      onChange={(e) => setForm((p) => ({ ...p, validFrom: e.target.value }))}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Válido hasta (expiración del código)</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={form.validUntil}
                      onChange={(e) => setForm((p) => ({ ...p, validUntil: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Máx. usos total (vacío = ilimitado)</label>
                    <input
                      type="number"
                      min={1}
                      className="form-control"
                      value={form.maxRedemptions}
                      onChange={(e) => setForm((p) => ({ ...p, maxRedemptions: e.target.value }))}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Máx. por usuario</label>
                    <input
                      type="number"
                      min={1}
                      className="form-control"
                      value={form.maxRedemptionsPerUser}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          maxRedemptionsPerUser: parseInt(e.target.value, 10) || 1,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-primary" onClick={saveCode} disabled={savingCode}>
                  {savingCode ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
