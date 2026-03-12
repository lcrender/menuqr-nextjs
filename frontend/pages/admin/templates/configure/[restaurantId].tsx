import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../../../../lib/axios';
import AdminLayout from '../../../../components/AdminLayout';
import { TEMPLATE_CONFIG_SCHEMAS, TEMPLATE_NAMES, TemplateConfigOption } from '../../../../lib/template-config-schema';

export default function ConfigureTemplate() {
  const router = useRouter();
  const { restaurantId } = router.query;
  const [restaurant, setRestaurant] = useState<{
    id: string;
    name: string;
    template: string;
    primaryColor?: string | null;
    secondaryColor?: string | null;
    templateConfig?: Record<string, unknown>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId || typeof restaurantId !== 'string') return;
    loadRestaurant();
  }, [restaurantId]);

  const loadRestaurant = async () => {
    if (!restaurantId || typeof restaurantId !== 'string') return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/restaurants/${restaurantId}`);
      const data = res.data;
      setRestaurant(data);
      const schema = TEMPLATE_CONFIG_SCHEMAS[data.template || 'classic'] || [];
      const defaults: Record<string, unknown> = {};
      schema.forEach((opt) => {
        defaults[opt.id] = (data.templateConfig && data.templateConfig[opt.id] !== undefined)
          ? data.templateConfig[opt.id]
          : opt.default;
      });
      // Los colores del restaurante tienen prioridad (las plantillas ya los usan así)
      if (data.primaryColor != null && data.primaryColor !== '') defaults.primaryColor = data.primaryColor;
      if (data.secondaryColor != null && data.secondaryColor !== '') defaults.secondaryColor = data.secondaryColor;
      setFormValues(defaults);
    } catch (e: any) {
      setError(e.response?.status === 404 ? 'Restaurante no encontrado' : 'Error al cargar el restaurante');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (optionId: string, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [optionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId || typeof restaurantId !== 'string' || !restaurant) return;
    try {
      setSaving(true);
      const hex = (v: unknown) => (typeof v === 'string' && /^#[0-9A-Fa-f]{6}$/.test(v) ? v : null);
      const payload: Record<string, unknown> = { templateConfig: formValues };
      const p = hex(formValues.primaryColor) ?? restaurant.primaryColor ?? '#007bff';
      const s = hex(formValues.secondaryColor) ?? restaurant.secondaryColor ?? '#0056b3';
      payload.primaryColor = p;
      payload.secondaryColor = s;
      await api.put(`/restaurants/${restaurantId}`, payload);
      setRestaurant((prev) => prev ? {
        ...prev,
        templateConfig: formValues as Record<string, unknown>,
        primaryColor: String(formValues.primaryColor ?? ''),
        secondaryColor: String(formValues.secondaryColor ?? ''),
      } : null);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (!restaurantId) return null;

  const templateId = restaurant?.template || 'classic';
  const schema = TEMPLATE_CONFIG_SCHEMAS[templateId] || [];
  const templateLabel = TEMPLATE_NAMES[templateId] || templateId;

  return (
    <AdminLayout>
      <div className="admin-main" style={{ padding: '20px', paddingTop: '40px', maxWidth: '720px' }}>
        <nav aria-label="Breadcrumb" style={{ marginBottom: '24px' }}>
          <Link href="/admin/templates" style={{ color: 'var(--admin-primary)', textDecoration: 'none', fontSize: '0.9375rem' }}>
            ← Volver a Plantillas
          </Link>
        </nav>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : error || !restaurant ? (
          <div className="admin-card" style={{ padding: '24px' }}>
            <p style={{ color: 'var(--admin-error)', marginBottom: '16px' }}>{error || 'Restaurante no encontrado'}</p>
            <Link href="/admin/templates" className="admin-btn" style={{ display: 'inline-block' }}>
              Volver a Plantillas
            </Link>
          </div>
        ) : (
          <>
            <div className="admin-card" style={{ marginBottom: '24px', padding: '24px' }}>
              <h1 className="admin-title" style={{ marginBottom: '8px' }}>
                Configuración de plantilla
              </h1>
              <p style={{ color: 'var(--admin-text-muted)', marginBottom: '0', fontSize: '0.9375rem' }}>
                <strong>{restaurant.name}</strong> · Plantilla actual: <strong>{templateLabel}</strong>
              </p>
            </div>

            {schema.length === 0 ? (
              <div className="admin-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                <p style={{ marginBottom: '0' }}>
                  Esta plantilla no tiene opciones de configuración definidas aún. Se irán añadiendo por plantilla.
                </p>
                <Link href="/admin/templates" className="admin-btn" style={{ display: 'inline-block', marginTop: '20px' }}>
                  Volver a Plantillas
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="admin-card" style={{ padding: '24px' }}>
                {schema.map((opt) => (
                  <Field key={opt.id} option={opt} value={formValues[opt.id]} onChange={(v) => handleChange(opt.id, v)} />
                ))}
                <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button type="submit" className="admin-btn" disabled={saving}>
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar configuración'
                    )}
                  </button>
                  <Link href="/admin/templates" style={{ lineHeight: '40px', color: 'var(--admin-text-muted)' }}>
                    Cancelar
                  </Link>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function Field({
  option,
  value,
  onChange,
}: {
  option: TemplateConfigOption;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const id = `opt-${option.id}`;
  if (option.type === 'boolean') {
    return (
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor={id} className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <input
            id={id}
            type="checkbox"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
            style={{ width: '18px', height: '18px' }}
          />
          <span>{option.label}</span>
        </label>
        {option.description && (
          <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-muted)', marginTop: '4px', marginLeft: '28px' }}>{option.description}</p>
        )}
      </div>
    );
  }
  if (option.type === 'number') {
    return (
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor={id} className="form-label">{option.label}</label>
        {option.description && <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-muted)', marginBottom: '6px' }}>{option.description}</p>}
        <input
          id={id}
          type="number"
          className="wizard-input-large"
          value={typeof value === 'number' ? value : ''}
          onChange={(e) => onChange(e.target.value === '' ? option.default : Number(e.target.value))}
          style={{ width: '100%', maxWidth: '200px' }}
        />
      </div>
    );
  }
  if (option.type === 'select' && option.options) {
    return (
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor={id} className="form-label">{option.label}</label>
        {option.description && <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-muted)', marginBottom: '6px' }}>{option.description}</p>}
        <select
          id={id}
          className="wizard-input-large"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: '100%', maxWidth: '280px' }}
        >
          {option.options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    );
  }
  if (option.type === 'color') {
    const hex = typeof value === 'string' ? value : String(option.default ?? '#007bff');
    const validHex = /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : '#007bff';
    return (
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor={id} className="form-label">{option.label}</label>
        {option.description && <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-muted)', marginBottom: '8px' }}>{option.description}</p>}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            id={id}
            type="color"
            value={validHex}
            onChange={(e) => onChange(e.target.value)}
            style={{ width: '48px', height: '40px', border: '1px solid var(--admin-border)', borderRadius: '8px', cursor: 'pointer', padding: 0 }}
          />
          <input
            type="text"
            className="wizard-input-large"
            value={hex}
            onChange={(e) => {
              const v = e.target.value.trim();
              if (v === '' || /^#[0-9A-Fa-f]{0,6}$/.test(v) || /^[0-9A-Fa-f]{0,6}$/.test(v)) {
                const normalized = v.startsWith('#') ? v : (v ? `#${v}` : '');
                onChange(normalized || option.default);
              }
            }}
            placeholder="#000000"
            style={{ width: '120px' }}
          />
        </div>
      </div>
    );
  }
  return (
    <div style={{ marginBottom: '20px' }}>
      <label htmlFor={id} className="form-label">{option.label}</label>
      {option.description && <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-muted)', marginBottom: '6px' }}>{option.description}</p>}
      <input
        id={id}
        type="text"
        className="wizard-input-large"
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%' }}
      />
    </div>
  );
}
