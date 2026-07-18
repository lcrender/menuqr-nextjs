import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/AdminLayout';
import api from '../../../lib/axios';

type Step = 1 | 2 | 3 | 4 | 5;

type TenantRow = { id: string; name?: string; plan?: string };
type RestaurantRow = {
  id: string;
  name: string;
  tenantId?: string;
  tenant_id?: string;
  tenantName?: string | null;
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

  const [currency, setCurrency] = useState('ARS');
  const [restaurantMode, setRestaurantMode] = useState<'existing' | 'new'>('existing');
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [restaurants, setRestaurants] = useState<RestaurantRow[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [newRestaurantName, setNewRestaurantName] = useState('');
  const [newRestaurantLogo, setNewRestaurantLogo] = useState<File | null>(null);
  const [resolvedRestaurantId, setResolvedRestaurantId] = useState('');
  const [resolvedTenantId, setResolvedTenantId] = useState('');

  const [menuName, setMenuName] = useState('');
  const [menuDescription, setMenuDescription] = useState('');

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [creatingRestaurant, setCreatingRestaurant] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listsLoading, setListsLoading] = useState(false);

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

  const ensureRestaurant = async (): Promise<{ restaurantId: string; tenantId: string }> => {
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
      return { restaurantId: selectedRestaurantId, tenantId };
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
        tenantId,
        defaultCurrency: currency,
        timezone: 'UTC',
      });
      const restaurantId = createRes.data?.id || createRes.data?.data?.id;
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
      setSelectedTenantId(tenantId);
      await loadLists();
      return { restaurantId, tenantId };
    } finally {
      setCreatingRestaurant(false);
    }
  };

  const canGoNextFromStep = (s: Step): boolean => {
    if (s === 1) return Boolean(currency);
    if (s === 2) {
      if (restaurantMode === 'existing') return Boolean(selectedRestaurantId);
      return Boolean(newRestaurantName.trim());
    }
    if (s === 3) return Boolean(menuName.trim());
    if (s === 4) return photos.length > 0;
    return true;
  };

  const handleNext = async () => {
    setError(null);
    if (!canGoNextFromStep(step)) {
      setError('Completá los campos obligatorios de este paso');
      return;
    }
    if (step === 2) {
      try {
        await ensureRestaurant();
      } catch (e: any) {
        setError(e?.userMessage || e?.response?.data?.message || e?.message || 'Error con el restaurante');
        return;
      }
    }
    if (step === 4) {
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
      setStep(5);
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
    if (!preview) return;
    const sections = preview.sections.map((s, i) => (i === si ? { ...s, name } : s));
    setPreview({ ...preview, sections });
  };

  const updateItem = (si: number, ii: number, patch: Partial<PreviewItem>) => {
    if (!preview) return;
    const sections = preview.sections.map((s, i) => {
      if (i !== si) return s;
      const items = s.items.map((it, j) => (j === ii ? { ...it, ...patch } : it));
      return { ...s, items };
    });
    setPreview({ ...preview, sections });
  };

  const updateItemPrice = (si: number, ii: number, amount: number) => {
    if (!preview) return;
    const sections = preview.sections.map((s, i) => {
      if (i !== si) return s;
      const items = s.items.map((it, j) => {
        if (j !== ii) return it;
        const prices = [...(it.prices || [])];
        if (!prices.length) {
          prices.push({ currency, amount });
        } else {
          prices[0] = { ...prices[0]!, currency: prices[0]!.currency || currency, amount };
        }
        return { ...it, prices };
      });
      return { ...s, items };
    });
    setPreview({ ...preview, sections });
  };

  const removeItem = (si: number, ii: number) => {
    if (!preview) return;
    const sections = preview.sections
      .map((s, i) => {
        if (i !== si) return s;
        return { ...s, items: s.items.filter((_, j) => j !== ii) };
      })
      .filter((s) => s.items.length > 0);
    setPreview({ ...preview, sections });
  };

  const addItem = (si: number) => {
    if (!preview) return;
    const sections = preview.sections.map((s, i) => {
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
    });
    setPreview({ ...preview, sections });
  };

  const addSection = () => {
    if (!preview) {
      setPreview({
        sections: [
          {
            name: 'Nueva sección',
            items: [{ name: 'Nuevo producto', description: '', prices: [{ currency, amount: 1 }] }],
          },
        ],
        warnings: [],
      });
      return;
    }
    setPreview({
      ...preview,
      sections: [
        ...preview.sections,
        {
          name: 'Nueva sección',
          items: [{ name: 'Nuevo producto', description: '', prices: [{ currency, amount: 1 }] }],
        },
      ],
    });
  };

  const handleImport = async () => {
    setError(null);
    if (!preview?.sections?.length) {
      setError('No hay productos para importar');
      return;
    }
    const restaurantId = resolvedRestaurantId || selectedRestaurantId;
    const tenantId = resolvedTenantId || selectedTenantId || tenantIdOfRestaurant(
      restaurants.find((r) => r.id === restaurantId) || { id: '', name: '' },
    );
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
      const res = await api.post('/admin/tools/menu-photo/import', {
        tenantId,
        restaurantId,
        menuName: menuName.trim(),
        menuDescription: menuDescription.trim() || undefined,
        currency,
        preview,
      });
      const warnings = Array.isArray(res.data?.warnings) ? res.data.warnings : [];
      try {
        sessionStorage.setItem(
          'menuPhotoImportFlash',
          JSON.stringify({ ok: true, warnings }),
        );
      } catch {
        /* ignore */
      }
      await router.push('/admin/menus');
    } catch (e: any) {
      setError(e?.userMessage || e?.response?.data?.message || 'No se pudo importar el menú');
    } finally {
      setImporting(false);
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
              Herramienta Super Admin: analizá fotos del menú en papel con OpenAI Vision (sin fotos de
              productos).
            </p>
          </div>
          <span className="badge text-bg-secondary">Paso {step} / 5</span>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {Array.isArray(error) ? error.join(', ') : error}
          </div>
        )}

        <div className="admin-card p-4">
          {step === 1 && (
            <>
              <h2 className="h5 mb-3">1. Moneda de los precios</h2>
              <p className="text-muted small">
                Se usa cuando el papel no aclara la moneda. También queda como moneda por defecto si
                creás un restaurante nuevo.
              </p>
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
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="h5 mb-3">2. Restaurante destino</h2>
              {listsLoading && <p className="text-muted">Cargando cuentas…</p>}
              <div className="btn-group mb-3" role="group">
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
                  <div className="col-12">
                    <p className="text-muted small mb-0">
                      Se crea una cuenta nueva automáticamente con el nombre del restaurante (plan Pro).
                      Después podés asignar el restaurante a un usuario desde el panel.
                    </p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Nombre del restaurante *</label>
                    <input
                      className="form-control"
                      value={newRestaurantName}
                      onChange={(e) => setNewRestaurantName(e.target.value)}
                      placeholder="Ej. La Parrilla"
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
                </div>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="h5 mb-3">3. Nombre del menú</h2>
              <div className="mb-3">
                <label className="form-label">Nombre *</label>
                <input
                  className="form-control"
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  placeholder="Carta principal"
                />
              </div>
              <div className="mb-0">
                <label className="form-label">Descripción (opcional)</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={menuDescription}
                  onChange={(e) => setMenuDescription(e.target.value)}
                />
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="h5 mb-3">4. Fotos del menú en papel</h2>
              <p className="text-muted small">
                Hasta {MAX_PHOTOS} fotos (máx. 3 MB c/u). En el celular podés usar la cámara; una foto
                por página si el menú tiene varias.
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

          {step === 5 && preview && (
            <>
              <h2 className="h5 mb-3">5. Revisar e importar</h2>
              <p className="text-muted small">
                Editá lo que haga falta. No se importan fotos de productos. Moneda de referencia:{' '}
                <strong>{currency}</strong>.
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
                <div key={si} className="border rounded p-3 mb-3">
                  <div className="d-flex gap-2 align-items-center mb-2">
                    <input
                      className="form-control fw-semibold"
                      value={section.name}
                      onChange={(e) => updateSectionName(si, e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary text-nowrap"
                      onClick={() => addItem(si)}
                    >
                      + Producto
                    </button>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-sm align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Descripción</th>
                          <th style={{ width: 110 }}>Precio</th>
                          <th style={{ width: 70 }} />
                        </tr>
                      </thead>
                      <tbody>
                        {section.items.map((item, ii) => (
                          <tr key={ii}>
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
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => removeItem(si, ii)}
                              >
                                ×
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              <button type="button" className="btn btn-outline-secondary mb-3" onClick={addSection}>
                + Sección
              </button>
            </>
          )}

          <div className="d-flex flex-wrap gap-2 mt-4">
            {step > 1 && step < 5 && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                disabled={analyzing || creatingRestaurant}
                onClick={() => setStep((step - 1) as Step)}
              >
                Atrás
              </button>
            )}
            {step === 5 && (
              <>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  disabled={analyzing || importing}
                  onClick={() => setStep(4)}
                >
                  Volver a fotos
                </button>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  disabled={analyzing || importing || photos.length === 0}
                  onClick={() => void runAnalyze()}
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
            {step < 4 && (
              <button
                type="button"
                className="btn btn-primary"
                disabled={creatingRestaurant || !canGoNextFromStep(step)}
                onClick={() => void handleNext()}
              >
                {creatingRestaurant ? 'Creando restaurante…' : 'Siguiente'}
              </button>
            )}
            {step === 4 && (
              <button
                type="button"
                className="btn btn-primary"
                disabled={analyzing || !canGoNextFromStep(4)}
                onClick={() => void handleNext()}
              >
                {analyzing ? 'Analizando fotos…' : 'Analizar con OpenAI'}
              </button>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
