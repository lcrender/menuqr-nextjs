import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AdminLayout from '../../../../components/AdminLayout';
import api from '../../../../lib/axios';
import {
  PRINT_MENU_TEMPLATES,
  type PrintMenuTemplateId,
} from '../../../../lib/print-menu-templates';
import { PRINT_MENU_TEMPLATE_STYLES } from '../../../../lib/print-menu-template-styles';

type RestaurantData = {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  whatsapp?: string | null;
};

type MenuSummary = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  status?: string;
  sort?: number;
};

type PrintItem = {
  id: string;
  name: string;
  description?: string | null;
  prices: Array<{ currency: string; label?: string; amount: number }>;
};

type PrintSection = {
  id: string;
  name: string;
  sort?: number;
  items: PrintItem[];
};

type PrintMenuTree = {
  id: string;
  name: string;
  description?: string | null;
  sections: PrintSection[];
};

const LOCALE_LABELS: Record<string, string> = {
  'es-ES': 'Español',
  'en-US': 'English',
  'en-GB': 'English (UK)',
  'it-IT': 'Italiano',
  'pt-BR': 'Português (BR)',
  'pt-PT': 'Português',
  'fr-FR': 'Français',
  'de-DE': 'Deutsch',
  'ca-ES': 'Català',
};

function localeLabel(locale: string): string {
  return LOCALE_LABELS[locale] || locale;
}

function formatPrice(price: { currency: string; label?: string; amount: number }): string {
  if (price.currency === 'ARS') {
    return `$ ${Math.round(price.amount).toLocaleString('es-AR')}`;
  }
  if (price.currency === 'EUR') {
    return `€ ${price.amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${price.currency} ${price.amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function normalizeMenus(raw: unknown): MenuSummary[] {
  if (Array.isArray(raw)) return raw as MenuSummary[];
  if (raw && typeof raw === 'object' && Array.isArray((raw as { data?: unknown }).data)) {
    return (raw as { data: MenuSummary[] }).data;
  }
  return [];
}

export default function PrintMenuPage() {
  const router = useRouter();
  const restaurantId = typeof router.query.id === 'string' ? router.query.id : '';

  const [loading, setLoading] = useState(true);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [menus, setMenus] = useState<MenuSummary[]>([]);
  const [locales, setLocales] = useState<string[]>(['es-ES']);
  const [selectedLocale, setSelectedLocale] = useState('es-ES');
  const [selectedMenuIds, setSelectedMenuIds] = useState<string[]>([]);
  const [printMenus, setPrintMenus] = useState<PrintMenuTree[]>([]);
  const [displayRestaurant, setDisplayRestaurant] = useState<RestaurantData | null>(null);

  const [showLogo, setShowLogo] = useState(true);
  const [showCover, setShowCover] = useState(true);
  const [showName, setShowName] = useState(true);
  const [showDescription, setShowDescription] = useState(true);
  /** stacked = una debajo de otra; per-page = una sección por página */
  const [sectionLayout, setSectionLayout] = useState<'stacked' | 'per-page'>('stacked');
  const [printTemplate, setPrintTemplate] = useState<PrintMenuTemplateId>('classic');

  const loadBase = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    setError(null);
    try {
      const restaurantRes = await api.get(`/restaurants/${restaurantId}`);
      const restaurantData = restaurantRes.data as RestaurantData;
      setRestaurant(restaurantData);
      setDisplayRestaurant(restaurantData);

      const menusRes = await api.get('/menus', { params: { restaurantId } });
      const menuList = normalizeMenus(menusRes.data).sort(
        (a, b) => (a.sort ?? 999) - (b.sort ?? 999) || a.name.localeCompare(b.name, 'es'),
      );
      setMenus(menuList);
      setSelectedMenuIds(menuList.map((m) => m.id));

      let localeList = ['es-ES'];
      try {
        const translationsRes = await api.get('/menu-translations/menus', {
          params: { restaurantId },
        });
        const rows = Array.isArray(translationsRes.data) ? translationsRes.data : [];
        const set = new Set<string>(['es-ES']);
        for (const row of rows) {
          const locs = Array.isArray(row?.locales) ? row.locales : [];
          for (const loc of locs) {
            if (typeof loc === 'string' && loc.trim()) set.add(loc);
          }
        }
        localeList = Array.from(set);
      } catch {
        if (restaurantData.slug) {
          try {
            const firstPublished = menuList.find((m) => m.status === 'PUBLISHED') || menuList[0];
            if (firstPublished?.slug) {
              const pub = await api.get(
                `/public/restaurants/${restaurantData.slug}/menus/${firstPublished.slug}`,
                { params: { locale: 'es-ES' } },
              );
              const available = Array.isArray(pub.data?.availableLocales)
                ? pub.data.availableLocales.filter((l: unknown) => typeof l === 'string')
                : [];
              if (available.length) localeList = available;
            }
          } catch {
            /* keep es-ES */
          }
        }
      }

      setLocales(localeList);
      setSelectedLocale(localeList.includes('es-ES') ? 'es-ES' : localeList[0] ?? 'es-ES');
    } catch (err: any) {
      setError(err?.userMessage || err?.response?.data?.message || 'No se pudo cargar el restaurante.');
      setRestaurant(null);
      setMenus([]);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    if (!restaurantId) return;
    loadBase();
  }, [restaurantId, loadBase]);

  const loadPreviewContent = useCallback(async () => {
    if (!restaurant?.slug || selectedMenuIds.length === 0) {
      setPrintMenus([]);
      setDisplayRestaurant(restaurant);
      return;
    }

    setLoadingPreview(true);
    try {
      try {
        const pubRestaurant = await api.get(`/public/restaurants/${restaurant.slug}`, {
          params: { locale: selectedLocale },
        });
        setDisplayRestaurant({
          ...restaurant,
          name: pubRestaurant.data?.name || restaurant.name,
          description: pubRestaurant.data?.description ?? restaurant.description,
        });
      } catch {
        setDisplayRestaurant(restaurant);
      }

      const selected = menus.filter((m) => selectedMenuIds.includes(m.id));
      const trees: PrintMenuTree[] = [];

      for (const menu of selected) {
        try {
          const res = await api.get(`/public/restaurants/${restaurant.slug}/menus/${menu.slug}`, {
            params: { locale: selectedLocale },
          });
          const sections = Array.isArray(res.data?.sections) ? res.data.sections : [];
          trees.push({
            id: menu.id,
            name: res.data?.name || menu.name,
            description: res.data?.description ?? menu.description,
            sections: sections.map((section: any) => ({
              id: section.id,
              name: section.name,
              sort: section.sort,
              items: (Array.isArray(section.items) ? section.items : []).map((item: any) => ({
                id: item.id,
                name: item.name,
                description: item.description,
                prices: Array.isArray(item.prices) ? item.prices : [],
              })),
            })),
          });
        } catch {
          // Fallback admin (idioma base) si el menú no está publicado o falla el público
          try {
            const [sectionsRes, itemsRes] = await Promise.all([
              api.get('/menu-sections', { params: { menuId: menu.id } }),
              api.get('/menu-items', { params: { menuId: menu.id } }),
            ]);
            const sectionsRaw = Array.isArray(sectionsRes.data)
              ? sectionsRes.data
              : Array.isArray(sectionsRes.data?.data)
                ? sectionsRes.data.data
                : [];
            const itemsRaw = Array.isArray(itemsRes.data)
              ? itemsRes.data
              : Array.isArray(itemsRes.data?.data)
                ? itemsRes.data.data
                : [];

            const sectionsSorted = [...sectionsRaw].sort(
              (a: any, b: any) => (a.sort ?? 999) - (b.sort ?? 999),
            );
            trees.push({
              id: menu.id,
              name: menu.name,
              description: menu.description ?? null,
              sections: sectionsSorted.map((section: any) => ({
                id: section.id,
                name: section.name,
                sort: section.sort,
                items: itemsRaw
                  .filter((item: any) => item.sectionId === section.id || item.section_id === section.id)
                  .map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    description: item.description ?? null,
                    prices: Array.isArray(item.prices) ? item.prices : [],
                  })),
              })),
            });
          } catch {
            trees.push({
              id: menu.id,
              name: menu.name,
              description: menu.description ?? null,
              sections: [],
            });
          }
        }
      }

      setPrintMenus(trees);
    } finally {
      setLoadingPreview(false);
    }
  }, [restaurant, menus, selectedMenuIds, selectedLocale]);

  useEffect(() => {
    if (!restaurant || loading) return;
    loadPreviewContent();
  }, [restaurant, loading, loadPreviewContent]);

  const toggleMenu = (menuId: string) => {
    setSelectedMenuIds((prev) =>
      prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId],
    );
  };

  const selectAllMenus = () => setSelectedMenuIds(menus.map((m) => m.id));
  const clearMenus = () => setSelectedMenuIds([]);

  const headerRestaurant = displayRestaurant || restaurant;
  const canPrint = Boolean(headerRestaurant && selectedMenuIds.length > 0);

  const sortedPrintMenus = useMemo(() => printMenus, [printMenus]);

  return (
    <AdminLayout>
      <Head>
        <style>{PRINT_MENU_TEMPLATE_STYLES}</style>
      </Head>
      <div className="admin-main">
        <div className="print-menu-toolbar no-print">
          <div>
            <Link href="/admin/restaurants" className="btn btn-sm btn-outline-secondary me-2">
              ← Volver
            </Link>
            <h1 className="admin-title d-inline-block mb-0 ms-1">
              Imprimir carta{restaurant ? `: ${restaurant.name}` : ''}
            </h1>
          </div>
          <div className="print-menu-toolbar-actions">
            <button
              type="button"
              className="btn btn-primary"
              disabled={!canPrint || loadingPreview}
              onClick={() => window.print()}
            >
              Imprimir
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5 no-print">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger no-print">{error}</div>
        ) : !restaurant ? (
          <div className="alert alert-warning no-print">Restaurante no encontrado.</div>
        ) : (
          <div className="print-menu-page">
            <div className="print-menu-preview-wrap">
              {loadingPreview ? (
                <div className="print-menu-empty no-print">
                  <div className="spinner-border spinner-border-sm me-2" role="status" />
                  Actualizando vista previa…
                </div>
              ) : null}
              <article
                className="print-menu-sheet"
                data-print-template={printTemplate}
                aria-label="Vista previa de la carta"
              >
                {showCover && headerRestaurant?.coverUrl ? (
                  <img
                    src={headerRestaurant.coverUrl}
                    alt=""
                    className="print-menu-cover"
                  />
                ) : null}

                {(showLogo || showName || showDescription) && (
                  <header className="print-menu-header">
                    {showLogo && headerRestaurant?.logoUrl ? (
                      <img
                        src={headerRestaurant.logoUrl}
                        alt=""
                        className="print-menu-logo"
                      />
                    ) : null}
                    <div>
                      {showName ? (
                        <h2 className="print-menu-title">{headerRestaurant?.name}</h2>
                      ) : null}
                      {showDescription && headerRestaurant?.description ? (
                        <p className="print-menu-desc">{headerRestaurant.description}</p>
                      ) : null}
                    </div>
                  </header>
                )}

                {sortedPrintMenus.length === 0 ? (
                  <p className="print-menu-empty">
                    Seleccioná al menos un menú para ver la vista previa.
                  </p>
                ) : (
                  sortedPrintMenus.map((menu, menuIndex) => (
                    <section
                      key={menu.id}
                      className={`print-menu-block${
                        sectionLayout === 'per-page' && menuIndex > 0
                          ? ' print-menu-block--page-break'
                          : ''
                      }`}
                    >
                      <h3 className="print-menu-name">{menu.name}</h3>
                      {menu.description ? (
                        <p className="print-menu-menu-desc">{menu.description}</p>
                      ) : null}
                      {menu.sections.length === 0 ? (
                        <p className="text-muted small">Sin secciones o productos.</p>
                      ) : (
                        menu.sections.map((section, sectionIndex) => {
                          const forcePageBreak =
                            sectionLayout === 'per-page' && sectionIndex > 0;
                          return (
                            <div
                              key={section.id}
                              className={`print-menu-section${
                                forcePageBreak ? ' print-menu-section--page-break' : ''
                              }`}
                            >
                              <h4 className="print-menu-section-title">{section.name}</h4>
                              {section.items.length === 0 ? (
                                <p className="text-muted small mb-0">Sin productos.</p>
                              ) : (
                                section.items.map((item) => (
                                  <div key={item.id} className="print-menu-item">
                                    <div>
                                      <p className="print-menu-item-name">{item.name}</p>
                                      {item.description ? (
                                        <p className="print-menu-item-desc">{item.description}</p>
                                      ) : null}
                                    </div>
                                    <div className="print-menu-item-prices">
                                      {item.prices.map((price, idx) => (
                                        <div key={idx}>
                                          {price.label ? (
                                            <span className="print-menu-item-price-label">
                                              {price.label}:
                                            </span>
                                          ) : null}
                                          {formatPrice(price)}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          );
                        })
                      )}
                    </section>
                  ))
                )}

                <footer className="print-menu-footer">
                  <h4>{headerRestaurant?.name}</h4>
                  {headerRestaurant?.address ? <p>{headerRestaurant.address}</p> : null}
                  {headerRestaurant?.phone ? <p>Tel: {headerRestaurant.phone}</p> : null}
                  {headerRestaurant?.whatsapp ? <p>WhatsApp: {headerRestaurant.whatsapp}</p> : null}
                  {headerRestaurant?.email ? <p>{headerRestaurant.email}</p> : null}
                  {headerRestaurant?.website ? <p>{headerRestaurant.website}</p> : null}
                </footer>
              </article>
            </div>

            <aside className="print-menu-options no-print">
              <h2>Opciones de impresión</h2>

              <div className="print-menu-options-group">
                <h3>Plantilla de impresión</h3>
                <select
                  className="form-select form-select-sm"
                  value={printTemplate}
                  onChange={(e) => setPrintTemplate(e.target.value as PrintMenuTemplateId)}
                  aria-label="Plantilla de impresión"
                >
                  {PRINT_MENU_TEMPLATES.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.label}
                    </option>
                  ))}
                </select>
                <p className="print-menu-template-hint">
                  {PRINT_MENU_TEMPLATES.find((t) => t.id === printTemplate)?.description}
                </p>
              </div>

              <div className="print-menu-options-group">
                <h3>Datos del restaurante</h3>
                <label className="print-menu-check">
                  <input
                    type="checkbox"
                    checked={showLogo}
                    onChange={(e) => setShowLogo(e.target.checked)}
                    disabled={!restaurant.logoUrl}
                  />
                  <span>Logo</span>
                </label>
                <label className="print-menu-check">
                  <input
                    type="checkbox"
                    checked={showCover}
                    onChange={(e) => setShowCover(e.target.checked)}
                    disabled={!restaurant.coverUrl}
                  />
                  <span>Portada</span>
                </label>
                <label className="print-menu-check">
                  <input
                    type="checkbox"
                    checked={showName}
                    onChange={(e) => setShowName(e.target.checked)}
                  />
                  <span>Nombre</span>
                </label>
                <label className="print-menu-check">
                  <input
                    type="checkbox"
                    checked={showDescription}
                    onChange={(e) => setShowDescription(e.target.checked)}
                    disabled={!restaurant.description}
                  />
                  <span>Descripción</span>
                </label>
              </div>

              <div className="print-menu-options-group">
                <h3>Secciones</h3>
                <label className="print-menu-check">
                  <input
                    type="radio"
                    name="sectionLayout"
                    checked={sectionLayout === 'stacked'}
                    onChange={() => setSectionLayout('stacked')}
                  />
                  <span>Una debajo de la otra</span>
                </label>
                <label className="print-menu-check">
                  <input
                    type="radio"
                    name="sectionLayout"
                    checked={sectionLayout === 'per-page'}
                    onChange={() => setSectionLayout('per-page')}
                  />
                  <span>Una sección por página</span>
                </label>
              </div>

              {locales.length > 1 ? (
                <div className="print-menu-options-group">
                  <h3>Idioma de la carta</h3>
                  <select
                    className="form-select form-select-sm"
                    value={selectedLocale}
                    onChange={(e) => setSelectedLocale(e.target.value)}
                  >
                    {locales.map((locale) => (
                      <option key={locale} value={locale}>
                        {localeLabel(locale)}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div className="print-menu-options-group">
                <h3>Menús a imprimir</h3>
                <div className="d-flex gap-2 mb-2">
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={selectAllMenus}>
                    Todos
                  </button>
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={clearMenus}>
                    Ninguno
                  </button>
                </div>
                {menus.length === 0 ? (
                  <p className="text-muted small mb-0">Este restaurante no tiene menús.</p>
                ) : (
                  menus.map((menu) => (
                    <label key={menu.id} className="print-menu-check">
                      <input
                        type="checkbox"
                        checked={selectedMenuIds.includes(menu.id)}
                        onChange={() => toggleMenu(menu.id)}
                      />
                      <span>
                        {menu.name}
                        {menu.status && menu.status !== 'PUBLISHED' ? (
                          <span className="text-muted"> ({menu.status})</span>
                        ) : null}
                      </span>
                    </label>
                  ))
                )}
              </div>

              <button
                type="button"
                className="btn btn-primary w-100 mt-2"
                disabled={!canPrint || loadingPreview}
                onClick={() => window.print()}
              >
                Imprimir
              </button>
            </aside>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
