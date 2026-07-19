import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '../../../components/AdminLayout';
import ConfirmModal from '../../../components/ConfirmModal';
import api from '../../../lib/axios';
import { TEMPLATES_CATALOG } from '../../../lib/templates-catalog';

type Step = 1 | 2 | 3 | 4;

type TenantRow = { id: string; name?: string; plan?: string };
type RestaurantRow = {
  id: string;
  name: string;
  tenantId?: string;
  tenant_id?: string;
  tenantName?: string | null;
  slug?: string;
};

type PreviewPrice = {
  currency: string;
  label?: string | null;
  amount: number;
};

type PreviewItem = {
  name: string;
  description?: string | null;
  prices: PreviewPrice[];
  confidence?: string | null;
};

type PreviewSection = {
  name: string;
  items: PreviewItem[];
};

type PreviewData = {
  sections: PreviewSection[];
  warnings: string[];
};

type GptModelChoice = 'gpt-4o' | 'gpt-4o-mini';

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD - Dólar estadounidense' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'ARS', label: 'ARS - Peso argentino' },
  { value: 'MXN', label: 'MXN - Peso mexicano' },
  { value: 'CLP', label: 'CLP - Peso chileno' },
  { value: 'COP', label: 'COP - Peso colombiano' },
  { value: 'PEN', label: 'PEN - Sol peruano' },
  { value: 'BRL', label: 'BRL - Real brasileño' },
  { value: 'UYU', label: 'UYU - Peso uruguayo' },
  { value: 'PYG', label: 'PYG - Guaraní paraguayo' },
  { value: 'BOB', label: 'BOB - Boliviano' },
  { value: 'VES', label: 'VES - Bolívar venezolano' },
] as const;

const MAX_PHOTOS = 8;
const MAX_BYTES = 3 * 1024 * 1024;

function tenantIdOfRestaurant(r: RestaurantRow): string {
  return String(r.tenantId || r.tenant_id || '');
}

export default function ImportarMenuFotoPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [step, setStep] = useState<Step>(1);

  const [gptModel, setGptModel] = useState<GptModelChoice>('gpt-4o');
  const [currency, setCurrency] = useState('EUR');
  const [restaurantMode, setRestaurantMode] = useState<'existing' | 'new'>('new');
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [restaurants, setRestaurants] = useState<RestaurantRow[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [newRestaurantName, setNewRestaurantName] = useState('');
  const [newRestaurantDescription, setNewRestaurantDescription] = useState('');
  const [newRestaurantLogo, setNewRestaurantLogo] = useState<File | null>(null);
  const [resolvedRestaurantId, setResolvedRestaurantId] = useState('');
  const [resolvedTenantId, setResolvedTenantId] = useState('');
  const [resolvedRestaurantSlug, setResolvedRestaurantSlug] = useState('');

  const [menuName, setMenuName] = useState('');

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [creatingRestaurant, setCreatingRestaurant] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('foodie');
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [importDone, setImportDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listsLoading, setListsLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'back-to-photos' | 'reanalyze' | null>(null);

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
      if (u.role !== 'SUPER_ADMIN') {
        router.replace('/admin');
      }
    } catch {
      router.push('/login');
    }
  }, [router]);

  const loadLists = useCallback(async () => {
    setListsLoading(true);
    try {
      const [tenantsRes, restaurantsRes] = await Promise.all([
        api.get('/tenants', { params: { limit: 500 } }),
        api.get('/restaurants', { params: { limit: 1000 } }),
      ]);
      const tPayload = tenantsRes.data?.data ?? tenantsRes.data;
      const rPayload = restaurantsRes.data?.data ?? restaurantsRes.data;
      setTenants(Array.isArray(tPayload) ? tPayload : []);
      setRestaurants(Array.isArray(rPayload) ? rPayload : []);
    } catch (e: any) {
      setError(e?.userMessage || e?.response?.data?.message || 'No se pudieron cargar cuentas/restaurantes');
    } finally {
      setListsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'SUPER_ADMIN') return;
    void loadLists();
  }, [user, loadLists]);

  useEffect(() => {
    return () => {
      photoPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photoPreviews]);

  const restaurantsForTenant = useMemo(() => {
    if (!selectedTenantId) return restaurants;
    return restaurants.filter((r) => tenantIdOfRestaurant(r) === selectedTenantId);
  }, [restaurants, selectedTenantId]);

  const onPhotosSelected = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setError(null);
    const next: File[] = [...photos];
    for (const file of Array.from(fileList)) {
      if (!file.type.startsWith('image/')) {
        setError(`"${file.name}" no es una imagen`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError(`"${file.name}" supera 3 MB`);
        continue;
      }
      if (next.length >= MAX_PHOTOS) {
        setError(`Máximo ${MAX_PHOTOS} fotos`);
        break;
      }
      next.push(file);
    }
    photoPreviews.forEach((url) => URL.revokeObjectURL(url));
    setPhotos(next);
    setPhotoPreviews(next.map((f) => URL.createObjectURL(f)));
  };

  const removePhoto = (index: number) => {
    const next = photos.filter((_, i) => i !== index);
    photoPreviews.forEach((url) => URL.revokeObjectURL(url));
    setPhotos(next);
    setPhotoPreviews(next.map((f) => URL.createObjectURL(f)));
  };

  const ensureRestaurant = async (): Promise<{
    restaurantId: string;
    tenantId: string;
    slug?: string;
  }> => {
    if (restaurantMode === 'existing') {
      if (!selectedRestaurantId) {
        throw new Error('Seleccioná un restaurante existente');
      }
      const r = restaurants.find((x) => x.id === selectedRestaurantId);
      const tenantId = tenantIdOfRestaurant(r || { id: '', name: '' }) || selectedTenantId;
      if (!tenantId) {
        throw new Error('No se pudo determinar la cuenta del restaurante');
      }
      setResolvedRestaurantId(selectedRestaurantId);
      setResolvedTenantId(tenantId);
      setResolvedRestaurantSlug(r?.slug || '');
      return r?.slug
        ? { restaurantId: selectedRestaurantId, tenantId, slug: r.slug }
        : { restaurantId: selectedRestaurantId, tenantId };
    }

    if (!newRestaurantName.trim()) {
      throw new Error('Ingresá el nombre del restaurante');
    }

    setCreatingRestaurant(true);
    try {
      const name = newRestaurantName.trim();
      const tenantRes = await api.post('/tenants', {
        name,
        plan: 'pro',
      });
      const tenantId = tenantRes.data?.id || tenantRes.data?.data?.id;
      if (!tenantId) {
        throw new Error('No se pudo crear la cuenta para el restaurante');
      }

      const createRes = await api.post('/restaurants', {
        name,
        description: newRestaurantDescription.trim() || undefined,
        tenantId,
        defaultCurrency: currency,
        timezone: 'UTC',
      });
      const restaurantId = createRes.data?.id || createRes.data?.data?.id;
      const slug = createRes.data?.slug || createRes.data?.data?.slug || '';
      if (!restaurantId) {
        throw new Error('No se obtuvo el ID del restaurante creado');
      }
      if (newRestaurantLogo) {
        const fd = new FormData();
        fd.append('file', newRestaurantLogo);
        await api.post(`/media/restaurants/${restaurantId}/photo`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setResolvedRestaurantId(restaurantId);
      setResolvedTenantId(tenantId);
      setResolvedRestaurantSlug(slug);
      setSelectedTenantId(tenantId);
      await loadLists();
      return { restaurantId, tenantId, slug };
    } finally {
      setCreatingRestaurant(false);
    }
  };

  const canGoNextFromStep = (s: Step): boolean => {
    if (s === 1) {
      if (!currency || !menuName.trim()) return false;
      if (restaurantMode === 'existing') return Boolean(selectedRestaurantId);
      return Boolean(newRestaurantName.trim());
    }
    if (s === 2) return photos.length > 0;
    return true;
  };

  const handleNext = async () => {
    setError(null);
    if (!canGoNextFromStep(step)) {
      setError('Completá los campos obligatorios de este paso');
      return;
    }
    if (step === 1) {
      try {
        await ensureRestaurant();
      } catch (e: any) {
        setError(e?.userMessage || e?.response?.data?.message || e?.message || 'Error con el restaurante');
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      await runAnalyze();
      return;
    }
    setStep((step + 1) as Step);
  };

  const runAnalyze = async () => {
    setError(null);
    setAnalyzing(true);
    try {
      const fd = new FormData();
      fd.append('currency', currency);
      fd.append('model', gptModel);
      for (const file of photos) {
        fd.append('files', file);
      }
      const res = await api.post('/admin/tools/menu-photo/preview', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 180000,
      });
      const data = res.data as PreviewData;
      setPreview({
        sections: Array.isArray(data.sections) ? data.sections : [],
        warnings: Array.isArray(data.warnings) ? data.warnings : [],
      });
      setStep(3);
    } catch (e: any) {
      setError(
        e?.userMessage ||
          e?.response?.data?.message ||
          'No se pudieron analizar las fotos. Revisá OPENAI_API_KEY y las imágenes.',
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const updateSectionName = (si: number, name: string) => {
    setPreview((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: prev.sections.map((s, i) => (i === si ? { ...s, name } : s)),
      };
    });
  };

  const updateItem = (si: number, ii: number, patch: Partial<PreviewItem>) => {
    setPreview((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: prev.sections.map((s, i) => {
          if (i !== si) return s;
          return {
            ...s,
            items: s.items.map((it, j) => (j === ii ? { ...it, ...patch } : it)),
          };
        }),
      };
    });
  };

  const updateItemPrice = (si: number, ii: number, amount: number) => {
    setPreview((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: prev.sections.map((s, i) => {
          if (i !== si) return s;
          return {
            ...s,
            items: s.items.map((it, j) => {
              if (j !== ii) return it;
              const prices = [...(it.prices || [])];
              if (!prices.length) {
                prices.push({ currency, amount });
              } else {
                prices[0] = {
                  ...prices[0]!,
                  currency: prices[0]!.currency || currency,
                  amount,
                };
              }
              return { ...it, prices };
            }),
          };
        }),
      };
    });
  };

  /** Mueve el producto completo (nombre, descripción y precio) arriba/abajo dentro de la sección. */
  const moveItem = (si: number, ii: number, direction: 'up' | 'down') => {
    setPreview((prev) => {
      if (!prev) return prev;
      const target = direction === 'up' ? ii - 1 : ii + 1;
      return {
        ...prev,
        sections: prev.sections.map((s, i) => {
          if (i !== si) return s;
          if (target < 0 || target >= s.items.length) return s;
          const items = [...s.items];
          const [moved] = items.splice(ii, 1);
          if (!moved) return s;
          items.splice(target, 0, moved);
          return { ...s, items };
        }),
      };
    });
  };

  const removeItem = (si: number, ii: number) => {
    setPreview((prev) => {
      if (!prev) return prev;
      const sections = prev.sections
        .map((s, i) => {
          if (i !== si) return s;
          return { ...s, items: s.items.filter((_, j) => j !== ii) };
        })
        .filter((s) => s.items.length > 0);
      return { ...prev, sections };
    });
  };

  const addItem = (si: number) => {
    setPreview((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: prev.sections.map((s, i) => {
          if (i !== si) return s;
          return {
            ...s,
            items: [
              ...s.items,
              {
                name: 'Nuevo producto',
                description: '',
                prices: [{ currency, amount: 1 }],
                confidence: 'manual',
              },
            ],
          };
        }),
      };
    });
  };

  const addSection = () => {
    setPreview((prev) => {
      const emptySection: PreviewSection = {
        name: 'Nueva sección',
        items: [
          {
            name: 'Nuevo producto',
            description: '',
            prices: [{ currency, amount: 1 }],
            confidence: 'manual',
          },
        ],
      };
      if (!prev) {
        return { sections: [emptySection], warnings: [] };
      }
      return {
        ...prev,
        sections: [...prev.sections, emptySection],
      };
    });
  };

  const handleImport = async () => {
    setError(null);
    if (!preview?.sections?.length) {
      setError('No hay productos para importar');
      return;
    }
    const restaurantId = resolvedRestaurantId || selectedRestaurantId;
    const tenantId =
      resolvedTenantId ||
      selectedTenantId ||
      tenantIdOfRestaurant(restaurants.find((r) => r.id === restaurantId) || { id: '', name: '' });
    if (!restaurantId || !tenantId) {
      setError('Falta restaurante o cuenta destino');
      return;
    }
    if (!menuName.trim()) {
      setError('El nombre del menú es obligatorio');
      return;
    }

    setImporting(true);
    try {
      await api.post('/admin/tools/menu-photo/import', {
        tenantId,
        restaurantId,
        menuName: menuName.trim(),
        currency,
        preview,
      });
      if (!resolvedRestaurantSlug) {
        const r = restaurants.find((x) => x.id === restaurantId);
        if (r?.slug) setResolvedRestaurantSlug(r.slug);
      }
      setImportDone(true);
      setStep(4);
    } catch (e: any) {
      setError(e?.userMessage || e?.response?.data?.message || 'No se pudo importar el menú');
    } finally {
      setImporting(false);
    }
  };

  const handleApplyTemplate = async () => {
    setError(null);
    const restaurantId = resolvedRestaurantId || selectedRestaurantId;
    const tenantId =
      resolvedTenantId ||
      selectedTenantId ||
      tenantIdOfRestaurant(restaurants.find((r) => r.id === restaurantId) || { id: '', name: '' });
    if (!restaurantId || !tenantId) {
      setError('Falta restaurante destino');
      return;
    }
    setSavingTemplate(true);
    try {
      await api.put(
        `/restaurants/${restaurantId}`,
        { template: selectedTemplate },
        { params: { tenantId } },
      );
      const slug =
        resolvedRestaurantSlug ||
        restaurants.find((r) => r.id === restaurantId)?.slug ||
        '';
      if (slug) {
        window.open(`/restaurant/${slug}`, '_blank');
      }
      await router.push('/admin/restaurants');
    } catch (e: any) {
      setError(e?.userMessage || e?.response?.data?.message || 'No se pudo aplicar la plantilla');
    } finally {
      setSavingTemplate(false);
    }
  };

  if (!user || user.role !== 'SUPER_ADMIN') {
    return (
      <AdminLayout>
        <div className="container mt-5 text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-content">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
          <div>
            <h1 className="admin-title mb-1">Importar menú desde foto</h1>
            <p className="text-muted mb-0">
              Herramienta Super Admin: analizá fotos del menú (cualquier diseño) con OpenAI Vision e
              importá el resultado.
            </p>
          </div>
          <span className="badge text-bg-secondary">Paso {step} / 4</span>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {Array.isArray(error) ? error.join(', ') : error}
          </div>
        )}

        <div className="admin-card p-4">
          {step === 1 && (
            <>
              <h2 className="h5 mb-3">1. Datos iniciales</h2>

              <div className="mb-4">
                <label className="form-label fw-semibold">Modelo GPT *</label>
                <div className="btn-group w-100" role="group">
                  <button
                    type="button"
                    className={`btn ${gptModel === 'gpt-4o' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setGptModel('gpt-4o')}
                  >
                    GPT-4o
                  </button>
                  <button
                    type="button"
                    className={`btn ${gptModel === 'gpt-4o-mini' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setGptModel('gpt-4o-mini')}
                  >
                    GPT-4o mini
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Moneda *</label>
                <select
                  className="form-select"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  {CURRENCY_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold d-block mb-2">Restaurante destino *</label>
                {listsLoading && <p className="text-muted small">Cargando…</p>}
                <div className="mb-3">
                  <div className="btn-group" role="group" aria-label="Tipo de restaurante">
                    <button
                      type="button"
                      className={`btn ${restaurantMode === 'existing' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setRestaurantMode('existing')}
                    >
                      Existente
                    </button>
                    <button
                      type="button"
                      className={`btn ${restaurantMode === 'new' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setRestaurantMode('new')}
                    >
                      Nuevo
                    </button>
                  </div>
                </div>

                {restaurantMode === 'existing' ? (
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Filtrar por cuenta (opcional)</label>
                      <select
                        className="form-select"
                        value={selectedTenantId}
                        onChange={(e) => {
                          setSelectedTenantId(e.target.value);
                          setSelectedRestaurantId('');
                        }}
                      >
                        <option value="">Todas</option>
                        {tenants.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name || t.id} {t.plan ? `(${t.plan})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Restaurante *</label>
                      <select
                        className="form-select"
                        value={selectedRestaurantId}
                        onChange={(e) => {
                          const id = e.target.value;
                          setSelectedRestaurantId(id);
                          const r = restaurants.find((x) => x.id === id);
                          if (r) setSelectedTenantId(tenantIdOfRestaurant(r) || selectedTenantId);
                        }}
                      >
                        <option value="">Seleccionar…</option>
                        {restaurantsForTenant.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                            {r.tenantName ? ` — ${r.tenantName}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Nombre del restaurante *</label>
                      <input
                        className="form-control"
                        value={newRestaurantName}
                        onChange={(e) => setNewRestaurantName(e.target.value)}
                        placeholder="Ej. Lizarran Les Corts"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Logo (opcional)</label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={(e) => setNewRestaurantLogo(e.target.files?.[0] || null)}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Descripción del restaurante (opcional)</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={newRestaurantDescription}
                        onChange={(e) => setNewRestaurantDescription(e.target.value)}
                        placeholder="Breve texto del local"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-0">
                <label className="form-label fw-semibold">Nombre del menú *</label>
                <input
                  className="form-control"
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  placeholder="Carta principal"
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="h5 mb-3">2. Fotos del menú</h2>
              <p className="text-muted small">
                Sacá una foto o elegí archivo. Hasta {MAX_PHOTOS} fotos (máx. 3 MB c/u); una por página
                si el menú tiene varias.
              </p>
              <input
                type="file"
                className="form-control mb-3"
                accept="image/*"
                capture="environment"
                multiple
                onChange={(e) => {
                  onPhotosSelected(e.target.files);
                  e.target.value = '';
                }}
              />
              {photos.length > 0 && (
                <div className="d-flex flex-wrap gap-2">
                  {photos.map((f, i) => (
                    <div key={`${f.name}-${i}`} className="border rounded p-2" style={{ width: 140 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoPreviews[i]}
                        alt={`Página ${i + 1}`}
                        style={{ width: '100%', height: 90, objectFit: 'cover' }}
                      />
                      <div className="small text-truncate mt-1">{f.name}</div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger w-100 mt-1"
                        onClick={() => removePhoto(i)}
                      >
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 3 && preview && (
            <>
              <h2 className="h5 mb-3">3. Vista previa</h2>
              <p className="text-muted small">
                Corregí lo que haga falta antes de importar. Moneda: <strong>{currency}</strong> ·
                Modelo: <strong>{gptModel}</strong>. Usá ↑↓ para cambiar el orden de un producto dentro
                de la sección.
              </p>
              {preview.warnings?.length > 0 && (
                <div className="alert alert-warning">
                  <strong>Avisos del análisis</strong>
                  <ul className="mb-0 mt-2">
                    {preview.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {preview.sections.map((section, si) => (
                <div key={`section-${si}-${section.name}`} className="border rounded p-3 mb-3">
                  <div className="mb-2">
                    <label className="form-label small mb-1">Sección</label>
                    <input
                      className="form-control fw-semibold"
                      value={section.name}
                      onChange={(e) => updateSectionName(si, e.target.value)}
                    />
                  </div>
                  <div className="table-responsive">
                    <table className="table table-sm align-middle mb-2">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Descripción</th>
                          <th style={{ width: 110 }}>Precio</th>
                          <th style={{ width: 90 }} />
                        </tr>
                      </thead>
                      <tbody>
                        {section.items.map((item, ii) => (
                          <tr key={`item-${si}-${ii}-${item.name}`}>
                            <td>
                              <input
                                className="form-control form-control-sm"
                                value={item.name}
                                onChange={(e) => updateItem(si, ii, { name: e.target.value })}
                              />
                            </td>
                            <td>
                              <input
                                className="form-control form-control-sm"
                                value={item.description || ''}
                                onChange={(e) =>
                                  updateItem(si, ii, { description: e.target.value })
                                }
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                min={0.01}
                                step="0.01"
                                className="form-control form-control-sm"
                                value={item.prices?.[0]?.amount ?? ''}
                                onChange={(e) =>
                                  updateItemPrice(si, ii, Number(e.target.value) || 0)
                                }
                              />
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-1">
                                <div className="btn-group-vertical" role="group">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary py-0 px-1"
                                    title="Subir producto"
                                    disabled={ii === 0}
                                    onClick={() => moveItem(si, ii, 'up')}
                                  >
                                    ↑
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary py-0 px-1"
                                    title="Bajar producto"
                                    disabled={ii === section.items.length - 1}
                                    onClick={() => moveItem(si, ii, 'down')}
                                  >
                                    ↓
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => removeItem(si, ii)}
                                >
                                  ×
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => addItem(si)}
                  >
                    + Producto
                  </button>
                </div>
              ))}

              <button type="button" className="btn btn-outline-secondary mb-3" onClick={addSection}>
                + Sección
              </button>
            </>
          )}

          {step === 4 && importDone && (
            <>
              <h2 className="h5 mb-3">4. Plantilla del restaurante</h2>
              <p className="text-muted small">
                El menú ya se creó y publicó. Elegí la plantilla visual del restaurante.
              </p>
              <div className="row g-3">
                {TEMPLATES_CATALOG.map((t) => (
                  <div key={t.id} className="col-md-6 col-lg-4">
                    <button
                      type="button"
                      className={`btn w-100 text-start h-100 ${
                        selectedTemplate === t.id ? 'btn-primary' : 'btn-outline-secondary'
                      }`}
                      onClick={() => setSelectedTemplate(t.id)}
                    >
                      <div className="fw-semibold">
                        {t.preview} {t.name}
                      </div>
                      <div className="small opacity-75 mt-1">{t.description}</div>
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="d-flex flex-wrap gap-2 mt-4">
            {step === 2 && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                disabled={analyzing || creatingRestaurant}
                onClick={() => setStep(1)}
              >
                Atrás
              </button>
            )}
            {step === 3 && (
              <>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  disabled={analyzing || importing}
                  onClick={() => setConfirmAction('back-to-photos')}
                >
                  Volver a fotos
                </button>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  disabled={analyzing || importing || photos.length === 0}
                  onClick={() => setConfirmAction('reanalyze')}
                >
                  {analyzing ? 'Analizando…' : 'Volver a analizar'}
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={importing || analyzing}
                  onClick={() => void handleImport()}
                >
                  {importing ? 'Importando…' : 'Importar menú'}
                </button>
              </>
            )}
            {step === 1 && (
              <button
                type="button"
                className="btn btn-primary"
                disabled={creatingRestaurant || !canGoNextFromStep(1)}
                onClick={() => void handleNext()}
              >
                {creatingRestaurant ? 'Creando restaurante…' : 'Siguiente'}
              </button>
            )}
            {step === 2 && (
              <button
                type="button"
                className="btn btn-primary"
                disabled={analyzing || !canGoNextFromStep(2)}
                onClick={() => void handleNext()}
              >
                {analyzing ? 'Analizando fotos…' : 'Analizar con OpenAI'}
              </button>
            )}
            {step === 4 && (
              <>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={savingTemplate || !selectedTemplate}
                  onClick={() => void handleApplyTemplate()}
                >
                  {savingTemplate ? 'Guardando…' : 'Aplicar plantilla y ver carta'}
                </button>
                <Link href="/admin/restaurants" className="btn btn-outline-secondary">
                  Ir a restaurantes
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        show={confirmAction === 'back-to-photos'}
        title="Volver a fotos"
        message="Si volvés a las fotos, habrá que analizar el menú de nuevo y se perderán los cambios de la vista previa. ¿Querés continuar?"
        confirmText="Confirmar"
        cancelText="Cancelar"
        variant="warning"
        onConfirm={() => {
          setConfirmAction(null);
          setStep(2);
        }}
        onCancel={() => setConfirmAction(null)}
      />
      <ConfirmModal
        show={confirmAction === 'reanalyze'}
        title="Volver a analizar"
        message="Se volverá a analizar el menú con OpenAI y se reemplazará la vista previa actual. Se perderán los cambios que hayas hecho. ¿Querés continuar?"
        confirmText="Confirmar"
        cancelText="Cancelar"
        variant="warning"
        onConfirm={() => {
          setConfirmAction(null);
          void runAnalyze();
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </AdminLayout>
  );
}
