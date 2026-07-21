import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import api from '../../../../lib/axios';
import AdminMenuPreviewConfigDrawer from '../../../../components/preview/AdminMenuPreviewConfigDrawer';
import {
  TEMPLATE_CONFIG_SCHEMAS,
  buildTemplateConfigDefaults,
} from '../../../../lib/template-config-schema';
import { TEMPLATES_CATALOG } from '../../../../lib/templates-catalog';
import ClassicTemplate from '../../../../templates/classic/ClassicTemplate';
import MinimalistTemplate from '../../../../templates/minimalist/MinimalistTemplate';
import FoodieTemplate from '../../../../templates/foodie/FoodieTemplate';
import BurgersTemplate from '../../../../templates/burgers/BurgersTemplate';
import ItalianFoodTemplate from '../../../../templates/italianfood/ItalianFoodTemplate';
import GourmetTemplate from '../../../../templates/gourmet/GourmetTemplate';
import ProMobileTemplate from '../../../../templates/promobile/ProMobileTemplate';
import NightClubTemplate from '../../../../templates/nightclub/NightClubTemplate';
import SmartFoodTemplate from '../../../../templates/smartfood/SmartFoodTemplate';
import BeachBarTemplate from '../../../../templates/beachbar/BeachBarTemplate';
import SolNocheTemplate from '../../../../templates/solnoche/SolNocheTemplate';

function normalizePlanKey(plan: string | null | undefined): string {
  const raw = (plan || 'free').toString().toLowerCase().trim().replace(/\s+/g, '_');
  return raw === 'proteam' ? 'pro_team' : raw;
}

function planAllowsPaidTemplateOptions(plan: string | null | undefined): boolean {
  const p = normalizePlanKey(plan);
  return p === 'pro' || p === 'pro_team' || p === 'premium';
}

type MenuItemRow = {
  id: string;
  name: string;
  description?: string | null;
  prices?: Array<{ currency: string; label?: string; amount: number }>;
  icons?: string[];
  photos?: string[];
  highlighted?: boolean;
  sectionId?: string;
  section_id?: string;
  sort?: number;
};

type MenuSectionRow = {
  id: string;
  name: string;
  sort?: number;
  items: MenuItemRow[];
};

const iconLabels: Record<string, string> = {
  celiaco: 'Sin Gluten',
  picante: 'Picante',
  vegano: 'Vegano',
  vegetariano: 'Vegetariano',
  'sin-gluten': 'Sin Gluten',
  'sin-lactosa': 'Sin Lactosa',
};

const countryCodes: Record<string, string> = {
  Argentina: '54',
  Brasil: '55',
  Chile: '56',
  Colombia: '57',
  México: '52',
  Perú: '51',
  España: '34',
  'Estados Unidos': '1',
};

function formatPrice(price: { currency: string; amount: number }) {
  if (price.currency === 'ARS') {
    return `$ ${Math.round(price.amount).toLocaleString('es-AR')}`;
  }
  if (price.currency === 'EUR') {
    return `€ ${price.amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${price.currency} ${price.amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatWhatsAppForLink(whatsapp: string, country?: string): string {
  let cleaned = whatsapp.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('+')) return cleaned.substring(1);
  if (country && countryCodes[country]) return `${countryCodes[country]}${cleaned}`;
  return cleaned;
}

function asArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)) {
    return (data as { data: T[] }).data;
  }
  return [];
}

/**
 * Vista previa admin del menú (incluye borradores) con marco móvil.
 * URL: /admin/menus/preview/[menuId]
 */
export default function AdminMenuPreviewPage() {
  const router = useRouter();
  const menuId = typeof router.query.menuId === 'string' ? router.query.menuId : '';
  const restaurantNameFromQuery =
    typeof router.query.restaurantName === 'string' ? router.query.restaurantName.trim() : '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menu, setMenu] = useState<any>(null);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [sections, setSections] = useState<MenuSectionRow[]>([]);
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);
  const [configValues, setConfigValues] = useState<Record<string, unknown>>({});
  const [configSaving, setConfigSaving] = useState(false);
  const [configSaveError, setConfigSaveError] = useState<string | null>(null);
  const [configSaveSuccess, setConfigSaveSuccess] = useState<string | null>(null);
  const [proSaveLockOpen, setProSaveLockOpen] = useState(false);
  const [viewerRole, setViewerRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      void router.replace('/login');
      return;
    }
    try {
      const parsed = JSON.parse(localStorage.getItem('user') || 'null');
      setViewerRole(parsed?.role ?? null);
    } catch {
      setViewerRole(null);
    }
  }, [router]);

  useEffect(() => {
    if (!menuId || !router.isReady) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const userRaw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        let userRole: string | null = null;
        let userTenantId: string | null = null;
        try {
          const parsed = userRaw ? JSON.parse(userRaw) : null;
          userRole = parsed?.role ?? null;
          userTenantId = parsed?.tenantId ?? parsed?.tenant?.id ?? null;
        } catch {
          /* ignore */
        }

        const menuRes = await api.get(`/menus/${menuId}`, {
          params:
            userRole === 'SUPER_ADMIN' && userTenantId ? { tenantId: userTenantId } : undefined,
        });
        const menuData = menuRes.data;
        if (cancelled) return;

        const menuTenantId = menuData.tenantId || menuData.tenant_id || null;
        // SUPER_ADMIN: pasar tenant del menú si existe; si no, sin filtro (findById sin tenant).
        // ADMIN: el backend usa req.user.tenantId solo.
        const restaurantQuery =
          userRole === 'SUPER_ADMIN' && menuTenantId
            ? { tenantId: String(menuTenantId) }
            : undefined;

        let restaurantData: any = null;
        const restaurantId = menuData.restaurantId || menuData.restaurant_id;
        if (restaurantId) {
          try {
            const restaurantRes = await api.get(`/restaurants/${restaurantId}`, {
              params: restaurantQuery,
              validateStatus: (status) => status === 200 || status === 404,
            });
            if (restaurantRes.status === 200) {
              restaurantData = restaurantRes.data;
            }
          } catch (err: any) {
            if (err?.response?.status !== 404) {
              console.error('Error cargando restaurante para preview:', err);
            }
          }
        }

        // Fallback: listar restaurantes y buscar por id
        if (!restaurantData && restaurantId) {
          try {
            const listRes = await api.get('/restaurants', {
              params:
                userRole === 'SUPER_ADMIN'
                  ? menuTenantId
                    ? { tenantId: String(menuTenantId), limit: 500 }
                    : { limit: 500 }
                  : undefined,
              validateStatus: (status) => status === 200 || status === 404,
            });
            const list = asArray<any>(listRes.data);
            restaurantData =
              list.find((r) => r?.id === restaurantId) ||
              list.find((r) => r?.slug && r.slug === menuData.restaurantSlug) ||
              null;
          } catch {
            /* ignore */
          }
        }

        const tenantParams = (() => {
          const tid =
            menuTenantId ||
            restaurantData?.tenantId ||
            restaurantData?.tenant_id ||
            (userRole === 'SUPER_ADMIN' ? userTenantId : null);
          return tid ? { tenantId: String(tid) } : {};
        })();

        const [sectionsRes, itemsRes] = await Promise.all([
          api.get('/menu-sections', { params: { menuId, ...tenantParams } }),
          api.get('/menu-items', { params: { menuId, ...tenantParams } }),
        ]);

        if (cancelled) return;

        const sectionsRaw = asArray<any>(sectionsRes.data).sort(
          (a, b) => (a.sort ?? 999) - (b.sort ?? 999),
        );
        const itemsRaw = asArray<MenuItemRow>(itemsRes.data);

        const builtSections: MenuSectionRow[] = sectionsRaw.map((section) => ({
          id: section.id,
          name: section.name,
          sort: section.sort,
          items: itemsRaw
            .filter((item) => item.sectionId === section.id || item.section_id === section.id)
            .sort((a, b) => (a.sort ?? 999) - (b.sort ?? 999))
            .map((item) => ({
              id: item.id,
              name: item.name,
              description: item.description ?? undefined,
              prices: Array.isArray(item.prices) ? item.prices : [],
              icons: Array.isArray(item.icons) ? item.icons : [],
              photos: Array.isArray(item.photos)
                ? item.photos
                    .map((photo: unknown) => {
                      if (typeof photo === 'string') return photo;
                      if (photo && typeof photo === 'object' && typeof (photo as { url?: unknown }).url === 'string') {
                        return (photo as { url: string }).url;
                      }
                      return null;
                    })
                    .filter((url: string | null): url is string => Boolean(url))
                : [],
              highlighted: Boolean(item.highlighted),
            })),
        }));

        let whatsapp = restaurantData?.whatsapp || '';
        if (!whatsapp && (restaurantData?.phone || menuData.restaurantPhone)?.includes?.('WhatsApp:')) {
          const phone = String(restaurantData?.phone || menuData.restaurantPhone || '');
          const match = phone.match(/WhatsApp:\s*(.+?)(?:\s*\|)?$/i);
          whatsapp = match ? match[1].trim() : '';
        }

        const restaurantName =
          restaurantData?.name ||
          menuData.restaurantName ||
          menuData.restaurant_name ||
          restaurantNameFromQuery ||
          null;

        setMenu(menuData);
        const nextRestaurant = {
          ...(restaurantData || {}),
          id: restaurantData?.id || restaurantId || menuData.id,
          name: restaurantName || 'Restaurante',
          slug: restaurantData?.slug || menuData.restaurantSlug || 'preview',
          description: restaurantData?.description || menuData.restaurantDescription || undefined,
          address: restaurantData?.address || menuData.restaurantAddress || undefined,
          phone: restaurantData?.phone || menuData.restaurantPhone || undefined,
          email: restaurantData?.email || menuData.restaurantEmail || undefined,
          website: restaurantData?.website || menuData.restaurantWebsite || undefined,
          logoUrl: restaurantData?.logoUrl || menuData.restaurantLogoUrl || undefined,
          coverUrl: restaurantData?.coverUrl || menuData.restaurantCoverUrl || undefined,
          template:
            restaurantData?.template ||
            menuData.restaurantTemplate ||
            menuData.template ||
            'classic',
          primaryColor:
            restaurantData?.primaryColor || menuData.restaurantPrimaryColor || undefined,
          secondaryColor:
            restaurantData?.secondaryColor || menuData.restaurantSecondaryColor || undefined,
          templateConfig:
            restaurantData?.templateConfig || menuData.restaurantTemplateConfig || undefined,
          tenantPlan: restaurantData?.tenantPlan || restaurantData?.plan || null,
          country: restaurantData?.country || undefined,
          whatsapp,
        };
        setRestaurant(nextRestaurant);
        setConfigValues(
          buildTemplateConfigDefaults(nextRestaurant.template, nextRestaurant.templateConfig, {
            primaryColor: nextRestaurant.primaryColor,
            secondaryColor: nextRestaurant.secondaryColor,
          }),
        );
        setSections(builtSections);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.message || err?.message || 'No se pudo cargar la vista previa');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [menuId, restaurantNameFromQuery, router.isReady]);

  const templateId = restaurant?.template || menu?.template || 'classic';
  const hasProTemplatesAccess =
    viewerRole === 'SUPER_ADMIN' || planAllowsPaidTemplateOptions(restaurant?.tenantPlan);

  const templateOptions = useMemo(
    () =>
      [...TEMPLATES_CATALOG]
        .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }))
        .map((t) => ({
          id: t.id,
          name: t.name,
          requiresPro: Boolean(t.requiresProOrPremium),
        })),
    [],
  );

  const selectedTemplateMeta = TEMPLATES_CATALOG.find((t) => t.id === templateId);
  const previewingLockedPro =
    Boolean(selectedTemplateMeta?.requiresProOrPremium) && !hasProTemplatesAccess;

  const configSchema = useMemo(() => {
    const schema = TEMPLATE_CONFIG_SCHEMAS[templateId] || [];
    return schema.filter(
      (opt) =>
        !opt.restrictToPaidPlans ||
        viewerRole === 'SUPER_ADMIN' ||
        planAllowsPaidTemplateOptions(restaurant?.tenantPlan),
    );
  }, [templateId, restaurant?.tenantPlan, viewerRole]);

  const applyConfigToRestaurant = useCallback((values: Record<string, unknown>, nextTemplate?: string) => {
    setRestaurant((prev: any) => {
      if (!prev) return prev;
      const hex = (v: unknown) => (typeof v === 'string' && /^#[0-9A-Fa-f]{6}$/.test(v) ? v : null);
      return {
        ...prev,
        ...(nextTemplate ? { template: nextTemplate } : {}),
        templateConfig: values,
        primaryColor: hex(values.primaryColor) ?? prev.primaryColor,
        secondaryColor: hex(values.secondaryColor) ?? prev.secondaryColor,
      };
    });
  }, []);

  const handleConfigChange = useCallback(
    (optionId: string, value: unknown) => {
      setConfigSaveError(null);
      setConfigSaveSuccess(null);
      setConfigValues((prev) => {
        const next = { ...prev, [optionId]: value };
        applyConfigToRestaurant(next);
        return next;
      });
    },
    [applyConfigToRestaurant],
  );

  const handleTemplateChange = useCallback(
    (nextTemplateId: string) => {
      if (!restaurant) return;
      setProSaveLockOpen(false);
      setConfigSaveError(null);
      setConfigSaveSuccess(null);
      const nextValues = buildTemplateConfigDefaults(nextTemplateId, restaurant.templateConfig, {
        primaryColor:
          (typeof configValues.primaryColor === 'string' && configValues.primaryColor) ||
          restaurant.primaryColor,
        secondaryColor:
          (typeof configValues.secondaryColor === 'string' && configValues.secondaryColor) ||
          restaurant.secondaryColor,
      });
      setConfigValues(nextValues);
      applyConfigToRestaurant(nextValues, nextTemplateId);
    },
    [applyConfigToRestaurant, configValues.primaryColor, configValues.secondaryColor, restaurant],
  );

  const handleContinueWithFreeTemplate = useCallback(() => {
    setProSaveLockOpen(false);
    handleTemplateChange('classic');
  }, [handleTemplateChange]);

  const handleSaveConfig = useCallback(async () => {
    if (!restaurant?.id) {
      setConfigSaveError('No se pudo identificar el restaurante');
      return;
    }
    const currentMeta = TEMPLATES_CATALOG.find((t) => t.id === (restaurant.template || 'classic'));
    if (currentMeta?.requiresProOrPremium && !hasProTemplatesAccess) {
      setConfigSaveSuccess(null);
      setConfigSaveError(null);
      setProSaveLockOpen(true);
      return;
    }
    setConfigSaving(true);
    setConfigSaveError(null);
    setConfigSaveSuccess(null);
    setProSaveLockOpen(false);
    try {
      const hex = (v: unknown) => (typeof v === 'string' && /^#[0-9A-Fa-f]{6}$/.test(v) ? v : null);
      const payload: Record<string, unknown> = {
        template: restaurant.template || 'classic',
        templateConfig: configValues,
      };
      payload.primaryColor = hex(configValues.primaryColor) ?? restaurant.primaryColor ?? '#007bff';
      payload.secondaryColor = hex(configValues.secondaryColor) ?? restaurant.secondaryColor ?? '#0056b3';
      await api.put(`/restaurants/${restaurant.id}`, payload);
      applyConfigToRestaurant(configValues, restaurant.template);
      setConfigSaveSuccess('Configuración guardada.');
    } catch (err: any) {
      setConfigSaveError(err?.response?.data?.message || 'Error al guardar la configuración');
    } finally {
      setConfigSaving(false);
    }
  }, [applyConfigToRestaurant, configValues, hasProTemplatesAccess, restaurant]);

  const templateBody = useMemo(() => {
    if (!menu || !restaurant) return null;

    const template = restaurant.template || menu.template || 'classic';
    const selectedMenu = {
      id: menu.id,
      name: menu.name,
      slug: menu.slug,
      ...(menu.description ? { description: menu.description } : {}),
      sections,
    };
    const menuList = [
      {
        id: menu.id,
        name: menu.name,
        slug: menu.slug,
        ...(menu.description ? { description: menu.description } : {}),
      },
    ];

    const templateProps = {
      restaurant,
      menuList,
      selectedMenu,
      onMenuSelect: () => {},
      formatPrice,
      formatWhatsAppForLink,
      iconLabels,
    };

    let body: ReactNode;
    if (template === 'classic') body = <ClassicTemplate {...templateProps} />;
    else if (template === 'minimalist') body = <MinimalistTemplate {...templateProps} />;
    else if (template === 'foodie') body = <FoodieTemplate {...templateProps} />;
    else if (template === 'burgers') body = <BurgersTemplate {...templateProps} />;
    else if (template === 'gourmet') body = <GourmetTemplate {...templateProps} />;
    else if (template === 'proMobile') body = <ProMobileTemplate {...templateProps} />;
    else if (template === 'nightClub') body = <NightClubTemplate {...templateProps} />;
    else if (template === 'smartFood') body = <SmartFoodTemplate {...templateProps} />;
    else if (template === 'beachBar') body = <BeachBarTemplate {...templateProps} />;
    else if (template === 'solNoche') body = <SolNocheTemplate {...templateProps} />;
    else if (template === 'italianFood') body = <ItalianFoodTemplate {...templateProps} />;
    else body = <ClassicTemplate {...templateProps} />;

    return body;
  }, [menu, restaurant, sections]);

  const statusLabel =
    menu?.status === 'PUBLISHED' ? 'Publicado' : menu?.status === 'DRAFT' ? 'Borrador' : menu?.status || '';

  return (
    <>
      <Head>
        <title>
          {menu?.name ? `Vista previa: ${menu.name}` : 'Vista previa del menú'} | AppMenuQR
        </title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className={`admin-menu-preview-page ${viewMode === 'desktop' ? 'is-desktop' : 'is-mobile'}`}>
        <header className="admin-menu-preview-bar">
          <div className="admin-menu-preview-bar-inner">
            <div className="admin-menu-preview-bar-text">
              <strong>Vista previa</strong>
              {menu?.name ? <span className="admin-menu-preview-menu-name">{menu.name}</span> : null}
              {statusLabel ? (
                <span
                  className={`admin-menu-preview-badge ${
                    menu?.status === 'PUBLISHED' ? 'is-published' : 'is-draft'
                  }`}
                >
                  {statusLabel}
                </span>
              ) : null}
            </div>
            <div className="admin-menu-preview-bar-actions">
              <div
                className="admin-menu-preview-toggle"
                role="group"
                aria-label="Modo de vista"
              >
                <button
                  type="button"
                  className={`admin-menu-preview-toggle-btn ${viewMode === 'mobile' ? 'is-active' : ''}`}
                  onClick={() => setViewMode('mobile')}
                  aria-pressed={viewMode === 'mobile'}
                >
                  Móvil
                </button>
                <button
                  type="button"
                  className={`admin-menu-preview-toggle-btn ${viewMode === 'desktop' ? 'is-active' : ''}`}
                  onClick={() => setViewMode('desktop')}
                  aria-pressed={viewMode === 'desktop'}
                >
                  Desktop
                </button>
              </div>
              <button
                type="button"
                className="admin-menu-preview-config-btn"
                onClick={() => {
                  setConfigSaveError(null);
                  setConfigSaveSuccess(null);
                  setConfigDrawerOpen(true);
                }}
                disabled={!restaurant || loading}
                aria-expanded={configDrawerOpen}
                aria-controls="admin-preview-config-drawer"
              >
                Configurar
              </button>
            </div>
          </div>
        </header>

        <AdminMenuPreviewConfigDrawer
          open={configDrawerOpen}
          onClose={() => {
            setProSaveLockOpen(false);
            setConfigDrawerOpen(false);
          }}
          templateId={templateId}
          templateOptions={templateOptions}
          onTemplateChange={handleTemplateChange}
          schema={configSchema}
          formValues={configValues}
          onChange={handleConfigChange}
          restaurantId={restaurant?.id}
          saving={configSaving}
          saveError={configSaveError}
          saveSuccess={configSaveSuccess}
          onSave={handleSaveConfig}
          previewingLockedPro={previewingLockedPro}
          proSaveLockOpen={proSaveLockOpen}
          proSaveLockTemplateName={selectedTemplateMeta?.name}
          onCloseProSaveLock={() => setProSaveLockOpen(false)}
          onContinueWithFreeTemplate={handleContinueWithFreeTemplate}
          subscriptionHref="/admin/profile/subscription"
        />

        <main className="admin-menu-preview-stage">
          {loading ? (
            <div className="admin-menu-preview-state">
              <div className="spinner-border text-secondary" role="status">
                <span className="visually-hidden">Cargando…</span>
              </div>
            </div>
          ) : error ? (
            <div className="admin-menu-preview-state">
              <p className="admin-menu-preview-error">{error}</p>
            </div>
          ) : viewMode === 'mobile' ? (
            <div className="admin-menu-preview-phone-stage">
              <div className="preview-phone-wrap">
                <div className="preview-phone" aria-label="Vista previa en móvil">
                  <div className="preview-phone-screen">
                    <div className="preview-phone-live">{templateBody}</div>
                  </div>
                </div>
              </div>
              <p className="admin-menu-preview-hint">
                Vista móvil
                {menu?.status === 'DRAFT' ? ' · borrador' : ''}.
              </p>
            </div>
          ) : (
            <div className="admin-menu-preview-desktop-stage">{templateBody}</div>
          )}
        </main>
      </div>

      <style jsx>{`
        .admin-menu-preview-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
        }

        .admin-menu-preview-page.is-desktop {
          background: #fff;
        }

        .admin-menu-preview-bar {
          position: sticky;
          top: 0;
          z-index: 20;
          background: #0f172a;
          color: #fff;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .admin-menu-preview-bar-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .admin-menu-preview-bar-text {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          min-width: 0;
        }

        .admin-menu-preview-menu-name {
          color: rgba(255, 255, 255, 0.75);
          font-size: 0.95rem;
        }

        .admin-menu-preview-badge {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          border-radius: 999px;
          padding: 3px 10px;
        }

        .admin-menu-preview-badge.is-draft {
          background: #f59e0b;
          color: #111827;
        }

        .admin-menu-preview-badge.is-published {
          background: #22c55e;
          color: #052e16;
        }

        .admin-menu-preview-bar-actions {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .admin-menu-preview-toggle {
          display: inline-flex;
          padding: 3px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.14);
        }

        .admin-menu-preview-toggle-btn {
          border: 0;
          background: transparent;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.875rem;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 999px;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
        }

        .admin-menu-preview-toggle-btn.is-active {
          background: #6366f1;
          color: #fff;
        }

        .admin-menu-preview-config-btn {
          border: 1px solid rgba(255, 255, 255, 0.22);
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          font-size: 0.875rem;
          font-weight: 600;
          padding: 9px 16px;
          border-radius: 999px;
          cursor: pointer;
          transition: background 0.15s ease, border-color 0.15s ease;
        }

        .admin-menu-preview-config-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.18);
          border-color: rgba(255, 255, 255, 0.35);
        }

        .admin-menu-preview-config-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .admin-menu-preview-stage {
          padding: 0;
        }

        .admin-menu-preview-page.is-mobile .admin-menu-preview-stage {
          padding: 28px 16px 40px;
        }

        .admin-menu-preview-phone-stage {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .preview-phone-wrap {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 8px 0;
        }

        .preview-phone {
          width: 390px;
          max-width: 96vw;
          border-radius: 42px;
          background: #0b1220;
          padding: 10px;
          box-shadow: 0 10px 35px rgba(0, 0, 0, 0.2);
        }

        .preview-phone-screen {
          width: 100%;
          height: min(720px, calc(100vh - 140px));
          max-height: calc(100vh - 140px);
          background: #ffffff;
          border-radius: 32px;
          overflow: hidden;
          position: relative;
        }

        .preview-phone-live {
          width: 100%;
          height: 100%;
          overflow-x: hidden;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          background: #fff;
        }

        .admin-menu-preview-hint {
          margin: 0;
          color: #64748b;
          font-size: 0.9rem;
          text-align: center;
        }

        .admin-menu-preview-desktop-stage {
          width: 100%;
          min-height: calc(100vh - 57px);
          background: #fff;
        }

        .admin-menu-preview-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          min-height: 50vh;
          padding: 28px 16px;
        }

        .admin-menu-preview-error {
          color: #b91c1c;
          margin: 0;
        }
      `}</style>
    </>
  );
}
