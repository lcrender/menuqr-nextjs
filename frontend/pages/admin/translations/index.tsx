import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Trans, useTranslation } from 'react-i18next';
import api from '../../../lib/axios';
import { MenuLocaleFlagGlyph } from '../../../lib/menu-locale-flag';
import { nativeLocaleDisplayName } from '../../../lib/menu-locale-native-names';
import AdminLayout from '../../../components/AdminLayout';
import AdminSelect from '../../../components/AdminSelect';
import AlertModal from '../../../components/AlertModal';
import ConfirmModal from '../../../components/ConfirmModal';
import i18n from '../../../src/i18n/config';
import adminTranslationsEs from '../../../src/locales/fragments/adminTranslations.es.json';
import adminTranslationsEn from '../../../src/locales/fragments/adminTranslations.en.json';

i18n.addResourceBundle('es-ES', 'translation', { adminTranslations: adminTranslationsEs }, true, true);
i18n.addResourceBundle('en-US', 'translation', { adminTranslations: adminTranslationsEn }, true, true);

type ManifestEntry = { locale: string; label?: string; flagCode?: string; enabledPublic?: boolean };

type MenuRow = {
  id: string;
  name: string;
  slug?: string;
  status?: string;
  /** Idioma base del menú (BCP-47), p.ej. es-ES | en-US */
  sourceLocale?: string;
  translationManifest: ManifestEntry[] | null;
  locales: string[];
  /** Ya se ejecutó traducción automática (beta) al menos una vez */
  autoTranslated?: boolean;
  /** Locales que ya se tradujeron automáticamente (cuando la BD lo soporta). */
  autoTranslatedLocales?: string[];
};

type WorkbenchSection = { id: string; baseName: string; name: string; nameStale?: boolean };
type WorkbenchItem = {
  id: string;
  sectionId: string;
  baseName: string;
  baseDescription: string;
  name: string;
  description: string;
  nameStale?: boolean;
  descriptionStale?: boolean;
};

function normalizePlanKey(plan: string | null | undefined): string {
  const raw = (plan || 'free').toString().toLowerCase().trim().replace(/\s+/g, '_');
  if (raw === 'proteam') return 'pro_team';
  return raw;
}

function planAllowsTranslations(plan: string | null | undefined): boolean {
  const p = normalizePlanKey(plan);
  return p === 'pro' || p === 'pro_team' || p === 'premium';
}

function regionFromLocale(locale: string): string | undefined {
  const parts = locale.split('-').filter(Boolean);
  if (parts.length < 2) return undefined;
  const tail = parts[parts.length - 1] ?? '';
  return tail.length === 2 ? tail.toUpperCase() : undefined;
}

/** ISO 3166-1 alpha-2 para el emoji regional: p. ej. ca-ES → ES. No usar «CA» pensando en Cataluña: CA es Canadá. */
function suggestedFlagCodeFromLocale(locale: string): string {
  const r = regionFromLocale(locale);
  return r && /^[A-Z]{2}$/.test(r) ? r : '';
}

/** Misma regla que el backend (`menu-locale.constants.ts`). */
const MENU_LOCALE_BCP47_RE = /^[a-z]{2,3}(-[a-zA-Z0-9]{2,8})+$/;

/** Código de bandera / etiqueta corta (alineado con backend). */
const MENU_FLAG_CODE_RE = /^[A-Z0-9]{2,10}$/;

const ADD_LOCALE_CUSTOM = '__custom__';

function normalizeMenuLocaleInput(raw: string): string {
  const trimmed = raw.trim().replace(/_/g, '-');
  if (!trimmed) return '';
  const parts = trimmed.split('-').filter(Boolean);
  if (parts.length === 0) return '';
  const lang = parts[0]!.toLowerCase();
  const rest = parts.slice(1).map((p) => {
    if (/^[0-9]{3}$/.test(p)) return p;
    if (p.length === 2 && /^[a-zA-Z]{2}$/.test(p)) return p.toUpperCase();
    return p.toLowerCase();
  });
  return [lang, ...rest].join('-');
}

/** Presets agrupados para el selector «Agregar idioma» (BCP-47). */
const LOCALE_PRESET_GROUP_DEFS: { groupKey: string; locales: string[] }[] = [
  {
    groupKey: 'englishGermanic',
    locales: [
      'en-US',
      'en-GB',
      'en-CA',
      'en-AU',
      'en-NZ',
      'en-IE',
      'de-DE',
      'de-AT',
      'de-CH',
      'nl-NL',
      'nl-BE',
      'sv-SE',
      'da-DK',
      'fi-FI',
      'is-IS',
      'nb-NO',
      'nn-NO',
    ],
  },
  {
    groupKey: 'romance',
    locales: [
      'fr-FR',
      'fr-CA',
      'fr-BE',
      'fr-CH',
      'it-IT',
      'it-CH',
      'pt-BR',
      'pt-PT',
      'ro-RO',
      'ca-ES',
      'gl-ES',
      'eu-ES',
    ],
  },
  {
    groupKey: 'spanishRegional',
    locales: [
      'es-ES',
      'es-MX',
      'es-AR',
      'es-CO',
      'es-CL',
      'es-PE',
      'es-VE',
      'es-EC',
      'es-GT',
      'es-CR',
      'es-PA',
      'es-DO',
      'es-UY',
      'es-PY',
      'es-BO',
      'es-419',
    ],
  },
  {
    groupKey: 'centralEasternEurope',
    locales: [
      'pl-PL',
      'cs-CZ',
      'sk-SK',
      'hu-HU',
      'bg-BG',
      'hr-HR',
      'sl-SI',
      'sr-RS',
      'bs-BA',
      'mk-MK',
      'sq-AL',
      'el-GR',
      'uk-UA',
      'ru-RU',
      'be-BY',
      'lt-LT',
      'lv-LV',
      'et-EE',
    ],
  },
  {
    groupKey: 'asiaPacific',
    locales: [
      'zh-CN',
      'zh-TW',
      'zh-HK',
      'ja-JP',
      'ko-KR',
      'hi-IN',
      'bn-IN',
      'ta-IN',
      'ur-PK',
      'th-TH',
      'vi-VN',
      'id-ID',
      'ms-MY',
      'fil-PH',
      'km-KH',
      'my-MM',
    ],
  },
  {
    groupKey: 'middleEastAfrica',
    locales: [
      'ar-SA',
      'ar-AE',
      'ar-EG',
      'ar-MA',
      'ar-DZ',
      'fa-IR',
      'he-IL',
      'tr-TR',
      'sw-KE',
      'af-ZA',
      'am-ET',
    ],
  },
];

function manifestMap(manifest: ManifestEntry[] | null | undefined): Record<string, ManifestEntry> {
  const m: Record<string, ManifestEntry> = {};
  if (!Array.isArray(manifest)) return m;
  for (const e of manifest) {
    if (e?.locale) m[e.locale] = e;
  }
  return m;
}

function menuSourceLocale(m: Pick<MenuRow, 'sourceLocale'> | null | undefined): string {
  return (m?.sourceLocale || 'es-ES').trim() || 'es-ES';
}

function defaultLocaleLabel(locale: string): string {
  // Preferir etiqueta con región (Español (Argentina), etc.) sobre el endónimo genérico.
  const presetKey = `adminTranslations.localePresets.items.${locale}`;
  const preset = i18n.t(presetKey);
  if (preset && preset !== presetKey) return preset;
  const native = nativeLocaleDisplayName(locale);
  if (native && native !== locale) return native;
  if (locale === 'es-ES') return i18n.t('adminTranslations.localeLabels.es-ES');
  if (locale === 'en-US') return i18n.t('adminTranslations.localeLabels.en-US');
  return locale;
}

function menuStatusLabel(status: string | undefined): string | null {
  if (!status) return null;
  const key = `adminTranslations.status.${status}`;
  const label = i18n.t(key);
  if (label && label !== key) return label;
  return status;
}

function defaultManifestDisplayLabel(locale: string, manifestLabel?: string | null): string {
  const label = (manifestLabel ?? '').trim();
  if (label) return label;
  return defaultLocaleLabel(locale);
}

function sortLocalesWithBaseFirst(locales: string[], sourceLocale: string): string[] {
  return [...locales].sort((a, b) => {
    if (a === sourceLocale) return -1;
    if (b === sourceLocale) return 1;
    return a.localeCompare(b);
  });
}

function defaultFlagForLocale(locale: string): string {
  if (locale === 'es-ES') return 'ES';
  if (locale === 'en-US') return 'US';
  return regionFromLocale(locale) || '';
}

/** Manifest completo para PATCH `/menu-translations/menus/:id/settings` (reemplaza el JSON en BD). */
function buildTranslationManifestPayload(
  m: MenuRow,
  localePatch?: { locale: string; enabledPublic: boolean },
): Array<{ locale: string; label?: string; flagCode?: string; enabledPublic?: false }> {
  const mm = manifestMap(m.translationManifest);
  const source = menuSourceLocale(m);
  const sortedLocales = sortLocalesWithBaseFirst(m.locales || [], source);
  return sortedLocales.map((locale) => {
    const loc = locale.trim();
    const isBase = locale === source;
    const rawLabel = isBase
      ? (mm[locale]?.label?.trim() || defaultLocaleLabel(locale))
      : (mm[locale]?.label || '').trim();
    const label = isBase ? rawLabel || defaultLocaleLabel(locale) : rawLabel || undefined;
    let fc = ((mm[locale]?.flagCode ?? '') as string).trim().toUpperCase();
    if (isBase && (!fc || !MENU_FLAG_CODE_RE.test(fc))) fc = defaultFlagForLocale(locale);
    let enabledPublic = mm[locale]?.enabledPublic !== false;
    if (localePatch && localePatch.locale === locale) {
      enabledPublic = localePatch.enabledPublic;
    }
    const flagOk = fc && MENU_FLAG_CODE_RE.test(fc) ? fc : undefined;
    return {
      locale: loc,
      ...(label !== undefined ? { label } : {}),
      ...(flagOk ? { flagCode: flagOk } : {}),
      ...(enabledPublic === false ? { enabledPublic: false as const } : {}),
    };
  });
}

export default function AdminTranslationsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [tenantPlan, setTenantPlan] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [restaurantSearch, setRestaurantSearch] = useState('');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);
  const [step2Panel, setStep2Panel] = useState<'all' | 'one' | 'default' | null>(null);
  const selectedRestaurantIdRef = useRef(selectedRestaurantId);
  selectedRestaurantIdRef.current = selectedRestaurantId;
  const [defaultLocalePick, setDefaultLocalePick] = useState('');
  const [defaultCoverage, setDefaultCoverage] = useState<{
    locale: string;
    missingLocale: number;
    incomplete: number;
    ready: number;
    menus: Array<{
      menuId: string;
      menuName: string;
      hasLocale: boolean;
      isDefault: boolean;
      ready: boolean;
      status: string;
      missingSections: number;
      missingItems: number;
      staleFields: number;
      sameAsSourceItems: number;
      sameAsSourceSections: number;
    }>;
  } | null>(null);
  const [defaultCoverageLoading, setDefaultCoverageLoading] = useState(false);
  const [defaultLocaleBusy, setDefaultLocaleBusy] = useState(false);
  const [menus, setMenus] = useState<MenuRow[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingMenus, setLoadingMenus] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertData, setAlertData] = useState<{
    title: string;
    message: string;
    variant: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [addScope, setAddScope] = useState<'menu' | 'restaurant'>('menu');
  const [addMenuId, setAddMenuId] = useState<string | null>(null);
  const [addLocalePreset, setAddLocalePreset] = useState('en-US');
  const [addLocaleCustom, setAddLocaleCustom] = useState('');
  const [addLabel, setAddLabel] = useState('');
  const [addFlag, setAddFlag] = useState('');
  const [addSaving, setAddSaving] = useState(false);
  const [addVisiblePublic, setAddVisiblePublic] = useState(true);
  const [addLocaleSearch, setAddLocaleSearch] = useState('');
  const [addLocaleSuggestOpen, setAddLocaleSuggestOpen] = useState(false);
  const [addLocaleHighlight, setAddLocaleHighlight] = useState(0);
  const [deleteLocaleBusy, setDeleteLocaleBusy] = useState<{ menuId: string; locale: string } | null>(null);
  const [deleteRestaurantLocaleBusy, setDeleteRestaurantLocaleBusy] = useState<string | null>(null);
  const [confirmDeleteLocale, setConfirmDeleteLocale] = useState<{ menu: MenuRow; locale: string } | null>(null);
  const [confirmDeleteRestaurantLocale, setConfirmDeleteRestaurantLocale] = useState<string | null>(null);
  const [confirmAutoTranslate, setConfirmAutoTranslate] = useState<{
    menu: MenuRow;
    locale: string;
    force: boolean;
    message: string;
  } | null>(null);
  const [confirmRestaurantAutoTranslate, setConfirmRestaurantAutoTranslate] = useState<{
    force: boolean;
    message: string;
  } | null>(null);
  const [restaurantAutoBusy, setRestaurantAutoBusy] = useState(false);
  const [restaurantAutoForce, setRestaurantAutoForce] = useState(false);
  const [restaurantAutoLocale, setRestaurantAutoLocale] = useState('');

  const [localeToggleKey, setLocaleToggleKey] = useState<string | null>(null);

  const [autoBusyMenuId, setAutoBusyMenuId] = useState<string | null>(null);
  const [autoLocalePick, setAutoLocalePick] = useState<Record<string, string>>({});
  const [autoForce, setAutoForce] = useState<Record<string, boolean>>({});

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsMenu, setSettingsMenu] = useState<MenuRow | null>(null);
  const [settingsName, setSettingsName] = useState('');
  const [settingsManifestRows, setSettingsManifestRows] = useState<ManifestEntry[]>([]);
  const [renameFrom, setRenameFrom] = useState('');
  const [renameTo, setRenameTo] = useState('');
  const [renameLabel, setRenameLabel] = useState('');
  const [renameFlag, setRenameFlag] = useState('');
  const [settingsSaving, setSettingsSaving] = useState(false);

  const [benchOpen, setBenchOpen] = useState(false);
  const [benchMenuId, setBenchMenuId] = useState<string | null>(null);
  const [benchLocale, setBenchLocale] = useState('');
  const [benchMenuName, setBenchMenuName] = useState('');
  const [benchMenuDesc, setBenchMenuDesc] = useState('');
  const [benchMenuStale, setBenchMenuStale] = useState<{ name: boolean; description: boolean }>({
    name: false,
    description: false,
  });
  const [benchSections, setBenchSections] = useState<WorkbenchSection[]>([]);
  const [benchItems, setBenchItems] = useState<WorkbenchItem[]>([]);
  const [benchLoading, setBenchLoading] = useState(false);
  const [benchSaving, setBenchSaving] = useState(false);

  const flatLocalePresets = useMemo(() => {
    return LOCALE_PRESET_GROUP_DEFS.flatMap((g) => {
      const group = t(`adminTranslations.localePresets.groups.${g.groupKey}`);
      return g.locales.map((locale) => ({
        locale,
        title: t(`adminTranslations.localePresets.items.${locale}`),
        group,
        groupKey: g.groupKey,
      }));
    });
  }, [t]);

  const filteredLocalePresets = useMemo(() => {
    const q = addLocaleSearch.trim().toLowerCase();
    if (!q) return flatLocalePresets.slice(0, 8);
    return flatLocalePresets
      .filter((it) => {
        const native = nativeLocaleDisplayName(it.locale).toLowerCase();
        return (
          it.title.toLowerCase().includes(q) ||
          native.includes(q) ||
          it.locale.toLowerCase().includes(q) ||
          it.group.toLowerCase().includes(q)
        );
      })
      .slice(0, 12);
  }, [addLocaleSearch, flatLocalePresets]);

  const pickAddLocalePreset = useCallback((locale: string, title: string) => {
    setAddLocalePreset(locale);
    setAddLocaleSearch(title);
    setAddFlag(suggestedFlagCodeFromLocale(locale));
    setAddLabel(title || defaultLocaleLabel(locale));
    setAddLocaleSuggestOpen(false);
    setAddLocaleHighlight(0);
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    try {
      setUser(JSON.parse(userData));
    } catch {
      router.push('/login');
    }
  }, [router]);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    if (!user || isSuperAdmin) return;
    api
      .get('/restaurants/dashboard-stats')
      .then((res) => {
        const plan = res.data?.plan ?? null;
        if (plan) {
          setTenantPlan(plan);
          if (user?.tenant && user.tenant.plan !== plan) {
            const updated = { ...user, tenant: { ...user.tenant, plan } };
            localStorage.setItem('user', JSON.stringify(updated));
            setUser(updated);
          }
        }
      })
      .catch(() => {});
  }, [user?.id, isSuperAdmin]);

  const effectivePlan = useMemo(() => {
    if (isSuperAdmin) return 'super_admin';
    return tenantPlan ?? user?.tenant?.plan ?? null;
  }, [isSuperAdmin, tenantPlan, user?.tenant?.plan]);

  const canAccessPage = isSuperAdmin || planAllowsTranslations(effectivePlan);

  const selectedRestaurant = useMemo(
    () => restaurants.find((r) => r.id === selectedRestaurantId),
    [restaurants, selectedRestaurantId],
  );

  const tenantIdForApi = useMemo(() => {
    if (!isSuperAdmin) return undefined;
    return selectedRestaurant?.tenantId || selectedRestaurant?.tenant_id;
  }, [isSuperAdmin, selectedRestaurant]);

  const showAlertMsg = useCallback((title: string, message: string, variant: 'success' | 'error' | 'warning' | 'info') => {
    setAlertData({ title, message, variant });
    setShowAlert(true);
  }, []);

  const loadRestaurants = useCallback(
    async (searchName?: string) => {
      try {
        const params: Record<string, string | number> = {};
        if (isSuperAdmin) {
          params.limit = 800;
          const n = (searchName ?? '').trim();
          if (n) params.restaurantName = n;
        }
        const res = await api.get('/restaurants', { params });
        let list = res.data;
        if (res.data?.data && Array.isArray(res.data.data)) {
          list = res.data.data;
        }
        setRestaurants(Array.isArray(list) ? list : []);
      } catch (e: any) {
        console.error(e);
        showAlertMsg(t('adminTranslations.common.error'), t('adminTranslations.alerts.loadRestaurantsError'), 'error');
        setRestaurants([]);
      }
    },
    [isSuperAdmin, showAlertMsg, t],
  );

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      await loadRestaurants();
      if (!cancelled) setLoadingPage(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, loadRestaurants]);

  const beginRestaurantStep2 = useCallback((restaurantId: string) => {
    setSelectedRestaurantId(restaurantId);
    setStep2Panel(null);
    setMenus([]);
    setDefaultCoverage(null);
    setLoadingMenus(true);
    setWizardStep(2);
  }, []);

  /** Un solo comercio: saltear el paso 1 y entrar directo a traducciones. */
  useEffect(() => {
    if (loadingPage) return;
    if (restaurantSearch.trim()) return;
    if (restaurants.length !== 1) return;
    const onlyId = String(restaurants[0]?.id || '');
    if (!onlyId) return;
    if (wizardStep !== 1) return;
    beginRestaurantStep2(onlyId);
  }, [loadingPage, restaurants, restaurantSearch, wizardStep, beginRestaurantStep2]);

  const selectRestaurantAndContinue = useCallback(
    (restaurantId: string) => {
      beginRestaurantStep2(restaurantId);
    },
    [beginRestaurantStep2],
  );

  const loadMenus = useCallback(async () => {
    if (!selectedRestaurantId || !canAccessPage) {
      setMenus([]);
      setLoadingMenus(false);
      return;
    }
    if (isSuperAdmin && !tenantIdForApi) {
      setMenus([]);
      setLoadingMenus(false);
      showAlertMsg(
        t('adminTranslations.alerts.tenantUnavailableTitle'),
        t('adminTranslations.alerts.tenantUnavailable'),
        'warning',
      );
      return;
    }
    const restaurantId = selectedRestaurantId;
    setLoadingMenus(true);
    try {
      const params: Record<string, string> = { restaurantId };
      if (isSuperAdmin && tenantIdForApi) params.tenantId = tenantIdForApi;
      const res = await api.get('/menu-translations/menus', { params });
      if (selectedRestaurantIdRef.current !== restaurantId) return;
      setMenus(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      if (selectedRestaurantIdRef.current !== restaurantId) return;
      const msg = e?.response?.data?.message || e?.message || t('adminTranslations.alerts.loadMenusError');
      showAlertMsg(t('adminTranslations.alerts.translationsTitle'), String(msg), 'error');
      setMenus([]);
    } finally {
      if (selectedRestaurantIdRef.current === restaurantId) setLoadingMenus(false);
    }
  }, [selectedRestaurantId, canAccessPage, isSuperAdmin, tenantIdForApi, showAlertMsg, t]);

  useEffect(() => {
    void loadMenus();
  }, [loadMenus]);

  const beginAddLocale = (scope: 'menu' | 'restaurant', menuId: string | null) => {
    setAddScope(scope);
    setAddMenuId(menuId);
    setAddLocalePreset('');
    setAddLocaleCustom('');
    setAddLocaleSearch('');
    setAddLocaleSuggestOpen(false);
    setAddLocaleHighlight(0);
    setAddLabel('');
    setAddFlag('');
    setAddVisiblePublic(true);
    setAddOpen(true);
  };

  const openAddLocale = (menuId: string) => beginAddLocale('menu', menuId);
  const openAddLocaleRestaurant = () => beginAddLocale('restaurant', null);

  const requestDeleteMenuLocale = useCallback((m: MenuRow, locale: string) => {
    if (locale === menuSourceLocale(m)) return;
    setConfirmDeleteLocale({ menu: m, locale });
  }, []);

  const executeDeleteMenuLocale = useCallback(async () => {
    if (!confirmDeleteLocale) return;
    const { menu: m, locale } = confirmDeleteLocale;
    setConfirmDeleteLocale(null);
    setDeleteLocaleBusy({ menuId: m.id, locale });
    try {
      const params: Record<string, string> = { locale };
      if (isSuperAdmin && tenantIdForApi) params.tenantId = tenantIdForApi;
      await api.delete(`/menu-translations/menus/${m.id}/locales`, { params });
      showAlertMsg(
        t('adminTranslations.alerts.localeDeletedTitle'),
        t('adminTranslations.alerts.localeDeleted', { locale }),
        'success',
      );
      await loadMenus();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (e as Error)?.message ||
        t('adminTranslations.common.error');
      showAlertMsg(t('adminTranslations.alerts.deleteLocaleTitle'), String(msg), 'error');
    } finally {
      setDeleteLocaleBusy(null);
    }
  }, [confirmDeleteLocale, isSuperAdmin, tenantIdForApi, loadMenus, showAlertMsg, t]);

  const requestDeleteRestaurantLocale = useCallback((locale: string) => {
    if (!locale || !selectedRestaurantId) return;
    setConfirmDeleteRestaurantLocale(locale);
  }, [selectedRestaurantId]);

  const executeDeleteRestaurantLocale = useCallback(async () => {
    if (!confirmDeleteRestaurantLocale || !selectedRestaurantId) return;
    const locale = confirmDeleteRestaurantLocale;
    setConfirmDeleteRestaurantLocale(null);
    setDeleteRestaurantLocaleBusy(locale);
    try {
      const params: Record<string, string> = { locale };
      if (isSuperAdmin && tenantIdForApi) params.tenantId = tenantIdForApi;
      const res = await api.delete(`/menu-translations/restaurants/${selectedRestaurantId}/locales`, {
        params,
      });
      const removed = Number(res?.data?.removedCount ?? 0);
      const skipped = Number(res?.data?.skippedCount ?? 0);
      showAlertMsg(
        t('adminTranslations.alerts.localeDeletedTitle'),
        t('adminTranslations.alerts.localeDeletedRestaurant', { locale, removed, skipped }),
        'success',
      );
      await loadMenus();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (e as Error)?.message ||
        t('adminTranslations.common.error');
      showAlertMsg(t('adminTranslations.alerts.deleteLocaleTitle'), String(msg), 'error');
    } finally {
      setDeleteRestaurantLocaleBusy(null);
    }
  }, [
    confirmDeleteRestaurantLocale,
    selectedRestaurantId,
    isSuperAdmin,
    tenantIdForApi,
    loadMenus,
    showAlertMsg,
    t,
  ]);

  const submitAddLocale = async () => {
    if (addScope === 'menu' && !addMenuId) return;
    if (addScope === 'restaurant' && menus.length === 0) return;
    const rawLocale =
      addLocalePreset === ADD_LOCALE_CUSTOM ? addLocaleCustom : addLocalePreset;
    const locale = normalizeMenuLocaleInput(rawLocale);
    if (!locale) {
      showAlertMsg(t('adminTranslations.alerts.localeTitle'), t('adminTranslations.addLocale.needLocale'), 'warning');
      return;
    }
    if (!MENU_LOCALE_BCP47_RE.test(locale)) {
      showAlertMsg(
        t('adminTranslations.alerts.localeTitle'),
        t('adminTranslations.addLocale.invalidLocale'),
        'warning',
      );
      return;
    }
    const fc = addFlag.trim().toUpperCase();
    if (fc && !MENU_FLAG_CODE_RE.test(fc)) {
      showAlertMsg(
        t('adminTranslations.alerts.flagTitle'),
        t('adminTranslations.addLocale.invalidFlag'),
        'warning',
      );
      return;
    }
    const bodyBase: Record<string, unknown> = {
      locale,
      label: addLabel.trim() || nativeLocaleDisplayName(locale) || undefined,
      flagCode: fc || undefined,
      ...(addVisiblePublic ? {} : { enabledPublic: false }),
    };
    if (isSuperAdmin && tenantIdForApi) bodyBase.tenantId = tenantIdForApi;

    setAddSaving(true);
    try {
      if (addScope === 'menu' && addMenuId) {
        const addBase = menuSourceLocale(menus.find((x) => x.id === addMenuId) || { sourceLocale: 'es-ES' });
        if (locale === addBase) {
          showAlertMsg(
            t('adminTranslations.alerts.localeTitle'),
            t('adminTranslations.addLocale.alreadyBase', { locale: defaultLocaleLabel(locale) }),
            'warning',
          );
          return;
        }
        await api.post(`/menu-translations/menus/${addMenuId}/locales`, bodyBase);
        showAlertMsg(t('adminTranslations.alerts.doneTitle'), t('adminTranslations.addLocale.success'), 'success');
      } else {
        let added = 0;
        let skipped = 0;
        for (const m of menus) {
          const source = menuSourceLocale(m);
          if (locale === source || (m.locales || []).includes(locale)) {
            skipped++;
            continue;
          }
          try {
            await api.post(`/menu-translations/menus/${m.id}/locales`, bodyBase);
            added++;
          } catch {
            skipped++;
          }
        }
        if (added === 0) {
          showAlertMsg(
            t('adminTranslations.alerts.addLocaleTitle'),
            t('adminTranslations.addLocale.restaurantNoneAdded', {
              locale: defaultLocaleLabel(locale),
            }),
            'warning',
          );
          return;
        }
        showAlertMsg(
          t('adminTranslations.alerts.doneTitle'),
          t('adminTranslations.addLocale.restaurantSuccess', { added, skipped }),
          'success',
        );
      }
      setAddOpen(false);
      await loadMenus();
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || t('adminTranslations.common.error');
      showAlertMsg(t('adminTranslations.alerts.addLocaleTitle'), String(msg), 'error');
    } finally {
      setAddSaving(false);
    }
  };

  const openSettings = (m: MenuRow) => {
    setSettingsMenu(m);
    setSettingsName(m.name || '');
    const mm = manifestMap(m.translationManifest);
    const source = menuSourceLocale(m);
    const sortedLocales = sortLocalesWithBaseFirst(m.locales || [], source);
    setSettingsManifestRows(
      sortedLocales.map((locale) => ({
        locale,
        label:
          locale === source
            ? (mm[locale]?.label?.trim() || defaultLocaleLabel(locale))
            : mm[locale]?.label || '',
        flagCode:
          locale === source
            ? (mm[locale]?.flagCode || defaultFlagForLocale(locale))
            : mm[locale]?.flagCode || regionFromLocale(locale) || '',
        enabledPublic: mm[locale]?.enabledPublic !== false,
      })),
    );
    const renameCandidates = sortedLocales.filter((l) => l !== source);
    setRenameFrom(renameCandidates[0] || '');
    setRenameTo('');
    setRenameLabel('');
    setRenameFlag('');
    setSettingsOpen(true);
  };

  const saveSettings = async () => {
    if (!settingsMenu) return;
    for (const r of settingsManifestRows) {
      const fc = (r.flagCode || '').trim().toUpperCase();
      if (fc && !MENU_FLAG_CODE_RE.test(fc)) {
        showAlertMsg(
          t('adminTranslations.alerts.flagTitle'),
          t('adminTranslations.settings.invalidFlagForLocale', { locale: r.locale }),
          'warning',
        );
        return;
      }
    }
    setSettingsSaving(true);
    try {
      const body: any = { name: settingsName.trim() };
      const settingsSource = menuSourceLocale(settingsMenu);
      const manifest = settingsManifestRows
        .filter((r) => r.locale && r.locale.trim())
        .map((r) => {
          const loc = r.locale.trim();
          const rawLabel = (r.label || '').trim();
          const isBase = loc === settingsSource;
          const label = isBase ? rawLabel || defaultLocaleLabel(loc) : rawLabel || undefined;
          let fc = (r.flagCode || '').trim().toUpperCase();
          if (isBase && (!fc || !MENU_FLAG_CODE_RE.test(fc))) fc = defaultFlagForLocale(loc);
          return {
            locale: loc,
            label,
            flagCode: fc && MENU_FLAG_CODE_RE.test(fc) ? fc : undefined,
            ...(r.enabledPublic === false ? { enabledPublic: false } : {}),
          };
        });
      body.translationManifest = manifest;
      if (isSuperAdmin && tenantIdForApi) body.tenantId = tenantIdForApi;
      await api.patch(`/menu-translations/menus/${settingsMenu.id}/settings`, body);

      if (renameFrom && renameTo.trim() && renameFrom !== renameTo.trim()) {
        const to = normalizeMenuLocaleInput(renameTo);
        if (!MENU_LOCALE_BCP47_RE.test(to)) {
          showAlertMsg(
            t('adminTranslations.alerts.localeCodeTitle'),
            t('adminTranslations.settings.invalidRenameCode'),
            'warning',
          );
          setSettingsSaving(false);
          return;
        }
        const rf = renameFlag.trim().toUpperCase();
        const renameBody: any = {
          fromLocale: renameFrom,
          toLocale: to,
          label: renameLabel.trim() || undefined,
          flagCode: rf && MENU_FLAG_CODE_RE.test(rf) ? rf : undefined,
        };
        if (isSuperAdmin && tenantIdForApi) renameBody.tenantId = tenantIdForApi;
        await api.patch(`/menu-translations/menus/${settingsMenu.id}/locales/rename`, renameBody);
      }

      setSettingsOpen(false);
      showAlertMsg(t('adminTranslations.alerts.savedTitle'), t('adminTranslations.settings.saved'), 'success');
      await loadMenus();
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || t('adminTranslations.common.error');
      showAlertMsg(t('adminTranslations.alerts.settingsTitle'), String(msg), 'error');
    } finally {
      setSettingsSaving(false);
    }
  };

  const toggleLocaleVisibleOnPublicMenu = useCallback(
    async (m: MenuRow, locale: string, visible: boolean) => {
      const key = `${m.id}:${locale}`;
      setLocaleToggleKey(key);
      try {
        const manifest = buildTranslationManifestPayload(m, { locale, enabledPublic: visible });
        const body: Record<string, unknown> = { translationManifest: manifest };
        if (isSuperAdmin && tenantIdForApi) body.tenantId = tenantIdForApi;
        await api.patch(`/menu-translations/menus/${m.id}/settings`, body);
        await loadMenus();
      } catch (e: unknown) {
        const msg =
          (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (e as Error)?.message ||
          t('adminTranslations.common.error');
        showAlertMsg(t('adminTranslations.alerts.publicMenuTitle'), String(msg), 'error');
      } finally {
        setLocaleToggleKey(null);
      }
    },
    [isSuperAdmin, tenantIdForApi, loadMenus, showAlertMsg, t],
  );

  useEffect(() => {
    setAutoLocalePick((prev) => {
      const next = { ...prev };
      for (const m of menus) {
        if (!next[m.id]) {
          const source = menuSourceLocale(m);
          const f = (m.locales || []).find((l) => l !== source);
          if (f) next[m.id] = f;
        }
      }
      return next;
    });
  }, [menus]);

  const requestMenuAutoTranslate = useCallback(
    async (m: MenuRow) => {
      const source = menuSourceLocale(m);
      const loc =
        autoLocalePick[m.id] || (m.locales || []).find((l) => l !== source);
      if (!loc) {
        const mmEmpty = manifestMap(m.translationManifest);
        showAlertMsg(
          t('adminTranslations.alerts.autoTranslateTitle'),
          t('adminTranslations.autoTranslate.needLocale', {
            source: defaultManifestDisplayLabel(source, mmEmpty[source]?.label),
          }),
          'warning',
        );
        return;
      }
      const force = !!autoForce[m.id];
      setAutoBusyMenuId(m.id);
      try {
        const params: Record<string, string> = { locale: loc };
        if (isSuperAdmin && tenantIdForApi) params.tenantId = tenantIdForApi;
        const stRes = await api.get(`/menu-translations/menus/${m.id}/auto-translate/status`, { params });
        const st = stRes.data as {
          canRun?: boolean;
          reason?: string;
          monthlyUsed?: number;
          monthlyLimit?: number;
        };
        if (!st.canRun) {
          showAlertMsg(
            t('adminTranslations.alerts.autoTranslateTitle'),
            st.reason || t('adminTranslations.autoTranslate.cannotRun'),
            'warning',
          );
          return;
        }
        const extra =
          st.monthlyLimit != null
            ? t('adminTranslations.autoTranslate.monthlyUsage', {
                used: st.monthlyUsed,
                limit: st.monthlyLimit,
              })
            : '';
        const mm = manifestMap(m.translationManifest);
        setConfirmAutoTranslate({
          menu: m,
          locale: loc,
          force,
          message: t('adminTranslations.autoTranslate.confirmMessage', {
            source: defaultManifestDisplayLabel(source, mm[source]?.label),
            locale: defaultManifestDisplayLabel(loc, mm[loc]?.label),
            forceNote: force ? t('adminTranslations.autoTranslate.forceNote') : '',
            extra,
          }),
        });
      } catch (e: unknown) {
        const msg =
          (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (e as Error)?.message ||
          t('adminTranslations.common.error');
        showAlertMsg(t('adminTranslations.alerts.autoTranslateTitle'), String(msg), 'error');
      } finally {
        setAutoBusyMenuId(null);
      }
    },
    [autoLocalePick, autoForce, isSuperAdmin, tenantIdForApi, showAlertMsg, t],
  );

  const executeMenuAutoTranslate = useCallback(async () => {
    if (!confirmAutoTranslate) return;
    const { menu: m, locale: loc, force } = confirmAutoTranslate;
    setConfirmAutoTranslate(null);
    setAutoBusyMenuId(m.id);
    try {
      const body: Record<string, unknown> = { targetLocale: loc, force };
      if (isSuperAdmin && tenantIdForApi) body.tenantId = tenantIdForApi;
      await api.post(`/menu-translations/menus/${m.id}/auto-translate`, body);
      showAlertMsg(
        t('adminTranslations.alerts.autoTranslateTitle'),
        t('adminTranslations.autoTranslate.success'),
        'success',
      );
      await loadMenus();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (e as Error)?.message ||
        t('adminTranslations.common.error');
      showAlertMsg(t('adminTranslations.alerts.autoTranslateTitle'), String(msg), 'error');
    } finally {
      setAutoBusyMenuId(null);
    }
  }, [confirmAutoTranslate, isSuperAdmin, tenantIdForApi, loadMenus, showAlertMsg, t]);

  const restaurantDefaultLocale = useMemo(() => {
    if (menus.length === 0) return '';
    const sources = menus.map((m) => menuSourceLocale(m));
    const first = sources[0] || '';
    return sources.every((s) => s === first) ? first : first;
  }, [menus]);

  const restaurantTargetLocales = useMemo(() => {
    const set = new Map<string, { locale: string; label: string }>();
    for (const m of menus) {
      const source = menuSourceLocale(m);
      const mm = manifestMap(m.translationManifest);
      for (const loc of m.locales || []) {
        if (loc === source) continue;
        if (!set.has(loc)) {
          set.set(loc, {
            locale: loc,
            label: defaultManifestDisplayLabel(loc, mm[loc]?.label),
          });
        }
      }
    }
    return Array.from(set.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [menus]);

  useEffect(() => {
    if (restaurantTargetLocales.length === 0) {
      setRestaurantAutoLocale('');
      return;
    }
    if (!restaurantTargetLocales.some((l) => l.locale === restaurantAutoLocale)) {
      setRestaurantAutoLocale(restaurantTargetLocales[0]!.locale);
    }
  }, [restaurantTargetLocales, restaurantAutoLocale]);

  /** Solo si hay más de un comercio (con uno solo no tiene sentido “cambiar”) */
  const canChangeRestaurant = restaurants.length > 1;

  /** Idiomas ya presentes en menús del comercio (atajos). */
  const restaurantConfiguredLocales = useMemo(() => {
    const map = new Map<string, { locale: string; label: string; countryCode: string }>();
    for (const m of menus) {
      const mm = manifestMap(m.translationManifest);
      for (const loc of m.locales || []) {
        if (!map.has(loc)) {
          const fromManifest = String(mm[loc]?.flagCode || '')
            .trim()
            .toUpperCase();
          const countryCode =
            fromManifest && MENU_FLAG_CODE_RE.test(fromManifest)
              ? fromManifest
              : suggestedFlagCodeFromLocale(loc);
          map.set(loc, {
            locale: loc,
            label: defaultManifestDisplayLabel(loc, mm[loc]?.label),
            countryCode,
          });
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [menus]);

  /** Idiomas del comercio + presets (para corregir el base sin agregarlo antes). */
  const restaurantAllLocales = useMemo(() => {
    const map = new Map(restaurantConfiguredLocales.map((l) => [l.locale, l]));
    for (const g of LOCALE_PRESET_GROUP_DEFS) {
      for (const loc of g.locales) {
        if (map.has(loc)) continue;
        map.set(loc, {
          locale: loc,
          label: defaultLocaleLabel(loc),
          countryCode: suggestedFlagCodeFromLocale(loc),
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [restaurantConfiguredLocales]);

  useEffect(() => {
    if (step2Panel !== 'default') return;
    if (!defaultLocalePick && restaurantDefaultLocale) {
      setDefaultLocalePick(restaurantDefaultLocale);
    }
  }, [step2Panel, defaultLocalePick, restaurantDefaultLocale]);

  useEffect(() => {
    if (step2Panel !== 'default' || !selectedRestaurantId || !defaultLocalePick) {
      setDefaultCoverage(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setDefaultCoverageLoading(true);
      try {
        const params: Record<string, string> = { locale: defaultLocalePick };
        if (isSuperAdmin && tenantIdForApi) params.tenantId = tenantIdForApi;
        const res = await api.get(
          `/menu-translations/restaurants/${selectedRestaurantId}/locale-coverage`,
          { params },
        );
        if (!cancelled) setDefaultCoverage(res.data);
      } catch (e: unknown) {
        if (!cancelled) {
          setDefaultCoverage(null);
          const msg =
            (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            (e as Error)?.message ||
            t('adminTranslations.common.error');
          showAlertMsg(t('adminTranslations.alerts.defaultLocaleTitle'), String(msg), 'error');
        }
      } finally {
        if (!cancelled) setDefaultCoverageLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    step2Panel,
    selectedRestaurantId,
    defaultLocalePick,
    isSuperAdmin,
    tenantIdForApi,
    showAlertMsg,
    t,
  ]);

  const applyRestaurantDefaultLocale = useCallback(async () => {
    if (!selectedRestaurantId || !defaultLocalePick) return;
    if (defaultLocalePick === restaurantDefaultLocale) return;
    setDefaultLocaleBusy(true);
    try {
      const body: Record<string, string> = { locale: defaultLocalePick };
      if (isSuperAdmin && tenantIdForApi) body.tenantId = tenantIdForApi;
      const res = await api.post(
        `/menu-translations/restaurants/${selectedRestaurantId}/set-default-locale`,
        body,
      );
      const d = res.data as { updatedCount?: number; skippedCount?: number };
      showAlertMsg(
        t('adminTranslations.alerts.defaultLocaleTitle'),
        t('adminTranslations.wizard.defaultApplied', {
          locale: defaultLocaleLabel(defaultLocalePick),
          updated: d.updatedCount ?? 0,
          skipped: d.skippedCount ?? 0,
        }),
        'success',
      );
      await loadMenus();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (e as Error)?.message ||
        t('adminTranslations.common.error');
      showAlertMsg(t('adminTranslations.alerts.defaultLocaleTitle'), String(msg), 'error');
    } finally {
      setDefaultLocaleBusy(false);
    }
  }, [
    selectedRestaurantId,
    defaultLocalePick,
    restaurantDefaultLocale,
    isSuperAdmin,
    tenantIdForApi,
    loadMenus,
    showAlertMsg,
    t,
  ]);

  const toggleStep2Panel = (panel: 'all' | 'one' | 'default') => {
    setStep2Panel((prev) => (prev === panel ? null : panel));
  };

  const requestRestaurantAutoTranslate = useCallback(async () => {
    if (!selectedRestaurantId || menus.length === 0) return;
    const loc = restaurantAutoLocale;
    if (!loc) {
      showAlertMsg(
        t('adminTranslations.alerts.autoTranslateTitle'),
        t('adminTranslations.autoTranslate.restaurantNeedLocales'),
        'warning',
      );
      return;
    }
    const force = restaurantAutoForce;
    setRestaurantAutoBusy(true);
    try {
      const first = menus.find((m) => (m.locales || []).some((l) => l === loc));
      let extra = '';
      if (first) {
        const params: Record<string, string> = { locale: loc };
        if (isSuperAdmin && tenantIdForApi) params.tenantId = tenantIdForApi;
        const stRes = await api.get(`/menu-translations/menus/${first.id}/auto-translate/status`, {
          params,
        });
        const st = stRes.data as {
          reason?: string;
          reasonCode?: string;
          monthlyUsed?: number;
          monthlyLimit?: number;
        };
        const hardBlock = new Set([
          'monthly_limit',
          'plan_not_allowed',
          'plan_limit_zero',
          'global_disabled',
          'user_disabled',
          'translator_not_configured',
        ]);
        if (st.reasonCode && hardBlock.has(st.reasonCode)) {
          showAlertMsg(
            t('adminTranslations.alerts.autoTranslateTitle'),
            st.reason || t('adminTranslations.autoTranslate.cannotRun'),
            'warning',
          );
          return;
        }
        if (st.monthlyLimit != null) {
          extra = t('adminTranslations.autoTranslate.monthlyUsage', {
            used: st.monthlyUsed,
            limit: st.monthlyLimit,
          });
        }
      }
      const localeLabel =
        restaurantTargetLocales.find((x) => x.locale === loc)?.label ||
        defaultLocaleLabel(loc);
      const sourceLabel = defaultLocaleLabel(restaurantDefaultLocale);
      setConfirmRestaurantAutoTranslate({
        force,
        message: t('adminTranslations.autoTranslate.restaurantConfirmMessage', {
          source: sourceLabel,
          locale: localeLabel,
          forceNote: force ? t('adminTranslations.autoTranslate.restaurantForceNote') : '',
          extra,
        }),
      });
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (e as Error)?.message ||
        t('adminTranslations.common.error');
      showAlertMsg(t('adminTranslations.alerts.autoTranslateTitle'), String(msg), 'error');
    } finally {
      setRestaurantAutoBusy(false);
    }
  }, [
    selectedRestaurantId,
    menus,
    restaurantAutoLocale,
    restaurantAutoForce,
    restaurantTargetLocales,
    restaurantDefaultLocale,
    isSuperAdmin,
    tenantIdForApi,
    showAlertMsg,
    t,
  ]);

  const executeRestaurantAutoTranslate = useCallback(async () => {
    if (!confirmRestaurantAutoTranslate || !selectedRestaurantId || !restaurantAutoLocale) return;
    const { force } = confirmRestaurantAutoTranslate;
    setConfirmRestaurantAutoTranslate(null);
    setRestaurantAutoBusy(true);
    try {
      const body: Record<string, unknown> = {
        force,
        targetLocale: restaurantAutoLocale,
      };
      if (isSuperAdmin && tenantIdForApi) body.tenantId = tenantIdForApi;
      const res = await api.post(
        `/menu-translations/restaurants/${selectedRestaurantId}/auto-translate`,
        body,
      );
      const d = res.data as { menuCount?: number; localeRuns?: number };
      showAlertMsg(
        t('adminTranslations.alerts.autoTranslateTitle'),
        t('adminTranslations.autoTranslate.restaurantSuccess', {
          menus: d.menuCount ?? 0,
          locales: d.localeRuns ?? 0,
        }),
        'success',
      );
      await loadMenus();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (e as Error)?.message ||
        t('adminTranslations.common.error');
      showAlertMsg(t('adminTranslations.alerts.autoTranslateTitle'), String(msg), 'error');
    } finally {
      setRestaurantAutoBusy(false);
    }
  }, [
    confirmRestaurantAutoTranslate,
    selectedRestaurantId,
    restaurantAutoLocale,
    isSuperAdmin,
    tenantIdForApi,
    loadMenus,
    showAlertMsg,
    t,
  ]);

  const openWorkbench = async (menuId: string, locale: string) => {
    const menuRow = menus.find((x) => x.id === menuId);
    const source = menuSourceLocale(menuRow);
    if (locale === source) {
      showAlertMsg(
        t('adminTranslations.workbench.baseInfoTitle'),
        t('adminTranslations.workbench.baseInfo', { source }),
        'info',
      );
      return;
    }
    setBenchMenuId(menuId);
    setBenchLocale(locale);
    setBenchOpen(true);
    setBenchLoading(true);
    try {
      const params: Record<string, string> = { locale };
      if (isSuperAdmin && tenantIdForApi) params.tenantId = tenantIdForApi;
      const res = await api.get(`/menu-translations/menus/${menuId}/workbench`, { params });
      const d = res.data;
      setBenchMenuName(d.menu?.name ?? '');
      setBenchMenuDesc(d.menu?.description ?? '');
      setBenchMenuStale({
        name: !!d.menu?.nameStale,
        description: !!d.menu?.descriptionStale,
      });
      setBenchSections(Array.isArray(d.sections) ? d.sections : []);
      setBenchItems(Array.isArray(d.items) ? d.items : []);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || t('adminTranslations.common.error');
      showAlertMsg(t('adminTranslations.alerts.editorTitle'), String(msg), 'error');
      setBenchOpen(false);
    } finally {
      setBenchLoading(false);
    }
  };

  const saveWorkbench = async () => {
    if (!benchMenuId || !benchLocale) return;
    setBenchSaving(true);
    try {
      const body: any = {
        menu: { name: benchMenuName, description: benchMenuDesc },
        sections: benchSections.map((s) => ({ id: s.id, name: s.name })),
        items: benchItems.map((it) => ({
          id: it.id,
          name: it.name,
          description: it.description ?? '',
        })),
      };
      if (isSuperAdmin && tenantIdForApi) body.tenantId = tenantIdForApi;
      await api.put(`/menu-translations/menus/${benchMenuId}/workbench`, body, {
        params: { locale: benchLocale },
      });
      showAlertMsg(t('adminTranslations.alerts.savedTitle'), t('adminTranslations.workbench.saved'), 'success');
      setBenchOpen(false);
      await loadMenus();
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || t('adminTranslations.common.error');
      showAlertMsg(t('adminTranslations.alerts.saveTitle'), String(msg), 'error');
    } finally {
      setBenchSaving(false);
    }
  };

  const updateSectionName = (id: string, name: string) => {
    setBenchSections((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
  };

  const updateItem = (id: string, patch: Partial<WorkbenchItem>) => {
    setBenchItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const itemsBySection = useMemo(() => {
    const map = new Map<string, WorkbenchItem[]>();
    for (const it of benchItems) {
      const arr = map.get(it.sectionId) || [];
      arr.push(it);
      map.set(it.sectionId, arr);
    }
    return map;
  }, [benchItems]);

  const benchHasStaleTranslations = useMemo(() => {
    if (benchMenuStale.name || benchMenuStale.description) return true;
    if (benchSections.some((s) => s.nameStale)) return true;
    if (benchItems.some((it) => it.nameStale || it.descriptionStale)) return true;
    return false;
  }, [benchMenuStale, benchSections, benchItems]);

  if (loadingPage || !user) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">{t('adminTranslations.loading')}</span>
        </div>
      </div>
    );
  }

  if (!canAccessPage) {
    return (
      <AdminLayout>
        <div className="py-4 px-2 px-md-0">
          <h1 className="admin-title mb-3">{t('adminTranslations.title')}</h1>
          <p className="lead text-muted mb-2" style={{ fontSize: '1.05rem' }}>
            <Trans i18nKey="adminTranslations.upgrade.lead" components={{ strong: <strong /> }} />
          </p>
          <p className="text-muted mb-4">
            <Trans i18nKey="adminTranslations.upgrade.body" components={{ strong: <strong /> }} />
          </p>

          <div className="row g-4 align-items-stretch">
            <div className="col-12 col-md-4">
              <div className="admin-stat-card h-100 d-flex flex-column" style={{ opacity: 0.92 }}>
                <h2 className="h5 mb-2">{t('adminTranslations.upgrade.cardTranslationsTitle')}</h2>
                <p className="small text-muted flex-grow-1 mb-3">
                  {t('adminTranslations.upgrade.cardTranslationsDesc')}
                </p>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary w-100"
                  disabled
                  tabIndex={-1}
                  style={{ pointerEvents: 'none' }}
                >
                  {t('adminTranslations.upgrade.availableOnPlans')}
                </button>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="admin-stat-card h-100 d-flex flex-column" style={{ opacity: 0.92 }}>
                <h2 className="h5 mb-2">{t('adminTranslations.upgrade.cardAutoTitle')}</h2>
                <p className="small text-muted flex-grow-1 mb-3">
                  {t('adminTranslations.upgrade.cardAutoDesc')}
                </p>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary w-100"
                  disabled
                  tabIndex={-1}
                  style={{ pointerEvents: 'none' }}
                >
                  {t('adminTranslations.upgrade.availableOnPlans')}
                </button>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="admin-stat-card admin-cta-card h-100 d-flex flex-column justify-content-center">
                <p className="admin-stat-title mb-2" style={{ fontSize: '1rem' }}>
                  {t('adminTranslations.upgrade.promoTitle')}
                </p>
                <p className="small text-muted mb-3" style={{ lineHeight: 1.4 }}>
                  {t('adminTranslations.upgrade.promoBody')}
                </p>
                <Link
                  href="/admin/profile/subscription"
                  className="admin-btn admin-btn-accent align-self-start"
                  style={{ textDecoration: 'none', padding: '8px 16px', fontSize: '0.875rem' }}
                >
                  {t('adminTranslations.upgrade.manageSubscription')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="py-3 admin-translations-page">
        {!isSuperAdmin && restaurants.length === 0 && (
          <div className="admin-card mb-4" style={{ textAlign: 'center', padding: '2rem' }}>
            <p className="mb-3" style={{ fontSize: '1.1rem', color: 'var(--admin-text-secondary)' }}>
              {t('adminTranslations.page.needBusiness')}
            </p>
            <a href="/admin/comercios?wizard=true" className="admin-btn">
              {t('adminTranslations.page.createFirstBusiness')}
            </a>
          </div>
        )}

        {(restaurants.length > 0 || isSuperAdmin) && (
          <div className="restaurant-wizard-container admin-translations-wizard">
            {wizardStep === 1 && (
              <>
            <div className="wizard-header">
              <h1 className="wizard-title">{t('adminTranslations.title')}</h1>
            </div>

            <div className="wizard-progress">
              <div className="wizard-progress-bar">
                <div className="wizard-progress-fill" style={{ width: '50%' }} />
              </div>
            </div>
              </>
            )}

            {wizardStep === 1 && (
              <div className="wizard-step-content wizard-step-centered">
                <div className="wizard-step-header">
                  <h3 className="wizard-step-title">{t('adminTranslations.wizard.step1Title')}</h3>
                </div>
                <div className="wizard-fields-container">
                  <div className="wizard-field wizard-field-large">
                    {isSuperAdmin && (
                      <div className="input-group input-group-sm mb-3">
                        <input
                          className="form-control"
                          placeholder={t('adminTranslations.page.searchPlaceholder')}
                          value={restaurantSearch}
                          onChange={(e) => setRestaurantSearch(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              void loadRestaurants(restaurantSearch);
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => void loadRestaurants(restaurantSearch)}
                        >
                          {t('adminTranslations.page.search')}
                        </button>
                      </div>
                    )}
                    {restaurants.length === 0 ? (
                      <p className="text-muted mb-0">{t('adminTranslations.page.noBusinessMatches')}</p>
                    ) : (
                      <div
                        className="admin-translations-restaurant-list"
                        role="listbox"
                        aria-label={t('adminTranslations.page.businessLabel')}
                      >
                        {restaurants.map((r) => {
                          const id = String(r.id);
                          const selected = id === selectedRestaurantId;
                          return (
                            <button
                              key={id}
                              type="button"
                              role="option"
                              aria-selected={selected}
                              className={`admin-translations-restaurant-option ${selected ? 'is-selected' : ''}`}
                              onClick={() => selectRestaurantAndContinue(id)}
                            >
                              <span className="admin-translations-restaurant-option__name">
                                {String(r.name || id)}
                              </span>
                              {r.tenantName ? (
                                <span className="admin-translations-restaurant-option__hint">
                                  {String(r.tenantName)}
                                </span>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {wizardStep === 2 && (
              <div
                className={`wizard-step-content admin-translations-step2 ${
                  canChangeRestaurant ? 'has-fixed-footer' : ''
                }`}
              >
                <div className="admin-translations-panel-toggles mb-3">
                  <button
                    type="button"
                    className={`admin-translations-panel-toggle ${
                      step2Panel === 'all' ? 'is-active' : ''
                    }`}
                    disabled={loadingMenus || menus.length === 0}
                    onClick={() => toggleStep2Panel('all')}
                  >
                    {t('adminTranslations.wizard.panelAll')}
                  </button>
                  <button
                    type="button"
                    className={`admin-translations-panel-toggle ${
                      step2Panel === 'one' ? 'is-active' : ''
                    }`}
                    disabled={loadingMenus || menus.length === 0}
                    onClick={() => toggleStep2Panel('one')}
                  >
                    {t('adminTranslations.wizard.panelOne')}
                  </button>
                  <button
                    type="button"
                    className={`admin-translations-panel-toggle ${
                      step2Panel === 'default' ? 'is-active' : ''
                    }`}
                    disabled={loadingMenus || menus.length === 0}
                    onClick={() => toggleStep2Panel('default')}
                  >
                    {t('adminTranslations.wizard.panelDefault')}
                  </button>
                </div>

                {loadingMenus ? (
                  <div className="text-center py-4">
                    <div className="spinner-border spinner-border-sm" />
                  </div>
                ) : menus.length === 0 ? (
                  <p className="text-muted">{t('adminTranslations.page.noMenus')}</p>
                ) : (
                  <>
                    {step2Panel === 'all' && (
                      <section className="admin-translations-section admin-card mb-4">
                        <div className="admin-card-body">
                          <h4 className="wizard-section-title mb-2">
                            {t('adminTranslations.wizard.panelAll')}
                          </h4>
                          <p className="small text-muted mb-3">
                            {t('adminTranslations.autoTranslate.restaurantHelp')}
                          </p>

                          <div className="admin-translations-field mb-3">
                            <label className="wizard-label">
                              {t('adminTranslations.autoTranslate.defaultLocale')}
                            </label>
                            <div className="admin-translations-restaurant-auto__meta">
                              <div className="fw-semibold d-flex align-items-center gap-2">
                                <MenuLocaleFlagGlyph
                                  flagCode={suggestedFlagCodeFromLocale(restaurantDefaultLocale)}
                                  locale={restaurantDefaultLocale}
                                />
                                <span>{defaultLocaleLabel(restaurantDefaultLocale)}</span>
                                {suggestedFlagCodeFromLocale(restaurantDefaultLocale) ? (
                                  <span className="admin-translations-default-option__code">
                                    {suggestedFlagCodeFromLocale(restaurantDefaultLocale)}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </div>

                          {restaurantTargetLocales.length === 0 ? (
                            <p className="small text-muted mb-3">
                              {t('adminTranslations.wizard.noAdditionalLocales')}
                            </p>
                          ) : (
                            <>
                              <div className="admin-translations-field mb-3">
                                <label className="wizard-label" htmlFor="restaurant-auto-locale">
                                  {t('adminTranslations.autoTranslate.targetLocale')}
                                </label>
                                <AdminSelect
                                  value={restaurantAutoLocale}
                                  onChange={setRestaurantAutoLocale}
                                  options={restaurantTargetLocales.map((l) => {
                                    const code = suggestedFlagCodeFromLocale(l.locale);
                                    return code
                                      ? { value: l.locale, label: l.label, hint: code }
                                      : { value: l.locale, label: l.label };
                                  })}
                                  placeholder={t('adminTranslations.autoTranslate.targetLocale')}
                                  searchable={restaurantTargetLocales.length > 6}
                                  searchPlaceholder={t('adminTranslations.page.searchPlaceholder')}
                                  emptyMessage={t('adminTranslations.page.noBusinessMatches')}
                                  aria-label={t('adminTranslations.autoTranslate.targetLocale')}
                                  className="admin-translations-embedded-select"
                                />
                              </div>

                              <div className="admin-translations-all-actions mb-3">
                                <button
                                  type="button"
                                  className="admin-btn admin-translations-all-actions__run"
                                  disabled={restaurantAutoBusy || !restaurantAutoLocale}
                                  onClick={() => void requestRestaurantAutoTranslate()}
                                >
                                  {restaurantAutoBusy
                                    ? t('adminTranslations.autoTranslate.processing')
                                    : t('adminTranslations.autoTranslate.restaurantRun')}
                                </button>
                                <div className="form-check mb-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="restaurant-auto-force"
                                    checked={restaurantAutoForce}
                                    onChange={(e) => setRestaurantAutoForce(e.target.checked)}
                                  />
                                  <label
                                    className="form-check-label small"
                                    htmlFor="restaurant-auto-force"
                                  >
                                    {t('adminTranslations.autoTranslate.forceShort')}
                                  </label>
                                </div>
                              </div>
                            </>
                          )}

                          <div className="admin-translations-all-divider" />

                          {restaurantTargetLocales.length > 0 ? (
                            <div className="mb-3">
                              <p className="small text-muted mb-2">
                                {t('adminTranslations.wizard.removeLocaleAllHelp')}
                              </p>
                              <div className="admin-translations-locale-list">
                                {restaurantTargetLocales.map((l) => (
                                  <div key={l.locale} className="admin-translations-locale-row">
                                    <div className="admin-translations-locale-row__meta">
                                      <span style={{ fontSize: '1.25rem', lineHeight: 1 }} aria-hidden>
                                        <MenuLocaleFlagGlyph
                                          flagCode={suggestedFlagCodeFromLocale(l.locale)}
                                          locale={l.locale}
                                        />
                                      </span>
                                      <span className="admin-translations-locale-row__name">{l.label}</span>
                                    </div>
                                    <button
                                      type="button"
                                      className="btn btn-link text-danger admin-translations-locale-delete"
                                      disabled={deleteRestaurantLocaleBusy === l.locale}
                                      onClick={() => requestDeleteRestaurantLocale(l.locale)}
                                    >
                                      {deleteRestaurantLocaleBusy === l.locale
                                        ? t('adminTranslations.wizard.removeLocaleAllBusy')
                                        : t('adminTranslations.wizard.removeLocaleAllMenus')}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}

                          <button
                            type="button"
                            className="btn btn-outline-primary w-100"
                            onClick={openAddLocaleRestaurant}
                          >
                            {t('adminTranslations.wizard.addLocaleAllMenus')}
                          </button>
                        </div>
                      </section>
                    )}

                    {step2Panel === 'one' && (
                      <section className="admin-translations-section mb-3">
                        <h4 className="wizard-section-title mb-1">
                          {t('adminTranslations.wizard.panelOne')}
                        </h4>
                        <p className="small text-muted mb-3">{t('adminTranslations.wizard.sectionBHelp')}</p>

                        <div className="row g-3">
                          {menus.map((m) => {
                            const mm = manifestMap(m.translationManifest);
                            const source = menuSourceLocale(m);
                            const statusText = menuStatusLabel(m.status);
                            const extraLocales = (m.locales || []).filter((l) => l !== source);
                            const orderedLocales = [
                              ...(m.locales || []).includes(source) ? [source] : [],
                              ...extraLocales,
                            ];
                            return (
                              <div key={m.id} className="col-12 col-lg-6">
                                <div className="admin-card h-100 mb-0">
                                  <div className="card-body">
                                    <div className="admin-translations-card-header">
                                      <div className="admin-translations-card-title-row">
                                        <h2 className="h5 mb-0 admin-translations-card-title">{m.name}</h2>
                                        {statusText && (
                                          <span className="badge bg-secondary admin-translations-card-status">
                                            {statusText}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="admin-translations-locale-list">
                                      {orderedLocales.map((loc) => {
                                        const meta = mm[loc];
                                        const isBase = loc === source;
                                        const visiblePublic = meta?.enabledPublic !== false;
                                        const toggleBusy = localeToggleKey === `${m.id}:${loc}`;
                                        const displayName = defaultManifestDisplayLabel(loc, meta?.label);
                                        return (
                                          <div key={loc} className="admin-translations-locale-row" title={loc}>
                                            <div className="admin-translations-locale-row__meta">
                                              <span style={{ fontSize: '1.25rem', lineHeight: 1 }} aria-hidden>
                                                <MenuLocaleFlagGlyph flagCode={meta?.flagCode} locale={loc} />
                                              </span>
                                              <span className="admin-translations-locale-row__name">{displayName}</span>
                                              {isBase && (
                                                <span className="badge bg-primary">
                                                  {t('adminTranslations.menuCard.defaultBadge')}
                                                </span>
                                              )}
                                            </div>
                                            <div className="admin-translations-locale-row__controls">
                                              <div className="form-check form-switch">
                                                <input
                                                  className="form-check-input"
                                                  type="checkbox"
                                                  role="switch"
                                                  id={`public-${m.id}-${loc}`}
                                                  checked={visiblePublic}
                                                  disabled={toggleBusy}
                                                  onChange={(e) =>
                                                    void toggleLocaleVisibleOnPublicMenu(m, loc, e.target.checked)
                                                  }
                                                />
                                                <label className="form-check-label small" htmlFor={`public-${m.id}-${loc}`}>
                                                  {t('adminTranslations.menuCard.publicMenu')}
                                                </label>
                                              </div>
                                              {!isBase ? (
                                                <>
                                                  <button
                                                    type="button"
                                                    className="btn btn-outline-primary admin-translations-locale-action"
                                                    onClick={() => void openWorkbench(m.id, loc)}
                                                  >
                                                    {t('adminTranslations.menuCard.translate')}
                                                  </button>
                                                  <button
                                                    type="button"
                                                    className="btn btn-link text-danger admin-translations-locale-delete"
                                                    disabled={
                                                      !!deleteLocaleBusy &&
                                                      deleteLocaleBusy.menuId === m.id &&
                                                      deleteLocaleBusy.locale === loc
                                                    }
                                                    onClick={() => requestDeleteMenuLocale(m, loc)}
                                                  >
                                                    {t('adminTranslations.menuCard.deleteLocale')}
                                                  </button>
                                                </>
                                              ) : (
                                                <Link
                                                  href="/admin/menus"
                                                  className="btn btn-outline-secondary admin-translations-locale-action"
                                                >
                                                  {t('adminTranslations.menuCard.editBase')}
                                                </Link>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>

                                    <div className="admin-translations-card-actions mt-4">
                                      <button
                                        type="button"
                                        className="admin-btn"
                                        onClick={() => openAddLocale(m.id)}
                                      >
                                        {t('adminTranslations.menuCard.addLocale')}
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => openSettings(m)}
                                      >
                                        {t('adminTranslations.menuCard.nameAndLocales')}
                                      </button>
                                    </div>

                                    {extraLocales.length > 0 && (
                                      <div className="admin-translations-auto">
                                        <h3 className="h6 text-muted mb-1">{t('adminTranslations.autoTranslate.title')}</h3>
                                        <div className="admin-translations-restaurant-auto__meta mb-2">
                                          <div className="small text-muted mb-0">
                                            {t('adminTranslations.autoTranslate.defaultLocale')}
                                          </div>
                                          <div className="fw-semibold small">
                                            {defaultManifestDisplayLabel(source, mm[source]?.label)}
                                          </div>
                                        </div>
                                        <div className="admin-translations-auto-actions mb-2">
                                          <div className="admin-translations-auto-select">
                                            <label className="form-label small mb-0">
                                              {t('adminTranslations.autoTranslate.targetLocale')}
                                            </label>
                                            <select
                                              className="form-select form-select-sm"
                                              value={autoLocalePick[m.id] || extraLocales[0] || ''}
                                              onChange={(e) =>
                                                setAutoLocalePick((prev) => ({ ...prev, [m.id]: e.target.value }))
                                              }
                                            >
                                              {extraLocales.map((l) => (
                                                <option key={l} value={l}>
                                                  {defaultManifestDisplayLabel(l, mm[l]?.label)}
                                                </option>
                                              ))}
                                            </select>
                                          </div>
                                          <button
                                            type="button"
                                            className="btn btn-outline-primary admin-translations-all-actions__run"
                                            disabled={autoBusyMenuId === m.id}
                                            onClick={() => void requestMenuAutoTranslate(m)}
                                          >
                                            {autoBusyMenuId === m.id
                                              ? t('adminTranslations.autoTranslate.processing')
                                              : t('adminTranslations.autoTranslate.run')}
                                          </button>
                                        </div>
                                        <div className="form-check">
                                          <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id={`auto-force-${m.id}`}
                                            checked={!!autoForce[m.id]}
                                            onChange={(e) =>
                                              setAutoForce((prev) => ({ ...prev, [m.id]: e.target.checked }))
                                            }
                                          />
                                          <label className="form-check-label small" htmlFor={`auto-force-${m.id}`}>
                                            {t('adminTranslations.autoTranslate.forceShort')}
                                          </label>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    )}

                    {step2Panel === 'default' && (
                      <section className="admin-translations-section admin-card mb-4">
                        <div className="admin-card-body">
                          <h4 className="wizard-section-title mb-2">
                            {t('adminTranslations.wizard.panelDefault')}
                          </h4>
                          <p className="small text-muted mb-3">
                            {t('adminTranslations.wizard.defaultHelp')}
                          </p>
                          <p className="small text-muted mb-3">
                            {t('adminTranslations.wizard.defaultPickHint')}
                          </p>

                          {restaurantConfiguredLocales.length > 0 ? (
                            <div className="admin-translations-default-list mb-3">
                              {restaurantConfiguredLocales.map((l) => {
                                const isCurrent = l.locale === restaurantDefaultLocale;
                                const isPick = l.locale === defaultLocalePick;
                                return (
                                  <button
                                    key={l.locale}
                                    type="button"
                                    className={`admin-translations-default-option ${isPick ? 'is-selected' : ''} ${
                                      isCurrent ? 'is-current' : ''
                                    }`}
                                    onClick={() => setDefaultLocalePick(l.locale)}
                                  >
                                    <span className="admin-translations-default-option__main">
                                      <MenuLocaleFlagGlyph flagCode={l.countryCode} locale={l.locale} />
                                      <span className="admin-translations-default-option__name">{l.label}</span>
                                      {l.countryCode ? (
                                        <span className="admin-translations-default-option__code">
                                          {l.countryCode}
                                        </span>
                                      ) : null}
                                    </span>
                                    {isCurrent && (
                                      <span className="badge bg-primary">
                                        {t('adminTranslations.menuCard.defaultBadge')}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          ) : null}

                          <div className="admin-translations-field mb-3">
                            <label className="wizard-label" htmlFor="restaurant-default-locale-pick">
                              {t('adminTranslations.wizard.panelDefault')}
                            </label>
                            <AdminSelect
                              value={defaultLocalePick}
                              onChange={setDefaultLocalePick}
                              options={restaurantAllLocales.map((l) => {
                                const code = l.countryCode;
                                return code
                                  ? { value: l.locale, label: l.label, hint: code }
                                  : { value: l.locale, label: l.label };
                              })}
                              placeholder={t('adminTranslations.wizard.panelDefault')}
                              searchable={restaurantAllLocales.length > 6}
                              searchPlaceholder={t('adminTranslations.page.searchPlaceholder')}
                              emptyMessage={t('adminTranslations.page.noBusinessMatches')}
                              aria-label={t('adminTranslations.wizard.panelDefault')}
                              className="admin-translations-embedded-select"
                            />
                          </div>

                          {defaultCoverageLoading ? (
                            <div className="text-center py-3">
                              <div className="spinner-border spinner-border-sm" />
                            </div>
                          ) : defaultCoverage && defaultLocalePick !== restaurantDefaultLocale ? (
                            <div className="admin-translations-gaps mb-3">
                              <h5 className="h6 mb-2">{t('adminTranslations.wizard.gapsTitle')}</h5>
                              {(defaultCoverage.missingLocale > 0 || defaultCoverage.incomplete > 0) && (
                                <div className="alert alert-warning py-2 small mb-3" role="status">
                                  {t('adminTranslations.wizard.gapsSummary', {
                                    missing: defaultCoverage.missingLocale,
                                    incomplete: defaultCoverage.incomplete,
                                    ready: defaultCoverage.ready,
                                  })}
                                </div>
                              )}
                              {defaultCoverage.missingLocale === 0 && defaultCoverage.incomplete === 0 && (
                                <div className="alert alert-success py-2 small mb-3" role="status">
                                  {t('adminTranslations.wizard.gapsReady')}
                                </div>
                              )}
                              <ul className="admin-translations-gaps__list list-unstyled mb-0">
                                {defaultCoverage.menus.map((row) => {
                                  if (row.isDefault || row.ready) {
                                    return (
                                      <li key={row.menuId} className="admin-translations-gaps__item is-ok">
                                        <strong>{row.menuName}</strong>
                                        <span className="text-muted small ms-2">
                                          {row.isDefault
                                            ? t('adminTranslations.wizard.gapAlreadyDefault')
                                            : t('adminTranslations.wizard.gapOk')}
                                        </span>
                                      </li>
                                    );
                                  }
                                  const bits: string[] = [];
                                  if (!row.hasLocale) {
                                    bits.push(t('adminTranslations.wizard.gapMissingLocale'));
                                  } else {
                                    if (row.missingItems > 0) {
                                      bits.push(
                                        t('adminTranslations.wizard.gapMissingItems', {
                                          count: row.missingItems,
                                        }),
                                      );
                                    }
                                    if (row.missingSections > 0) {
                                      bits.push(
                                        t('adminTranslations.wizard.gapMissingSections', {
                                          count: row.missingSections,
                                        }),
                                      );
                                    }
                                    if (row.sameAsSourceItems > 0) {
                                      bits.push(
                                        t('adminTranslations.wizard.gapSameAsSourceItems', {
                                          count: row.sameAsSourceItems,
                                        }),
                                      );
                                    }
                                    if (row.sameAsSourceSections > 0) {
                                      bits.push(
                                        t('adminTranslations.wizard.gapSameAsSourceSections', {
                                          count: row.sameAsSourceSections,
                                        }),
                                      );
                                    }
                                    if (row.staleFields > 0) {
                                      bits.push(
                                        t('adminTranslations.wizard.gapStale', { count: row.staleFields }),
                                      );
                                    }
                                  }
                                  return (
                                    <li key={row.menuId} className="admin-translations-gaps__item is-warn">
                                      <div className="fw-semibold">{row.menuName}</div>
                                      <div className="small text-muted">{bits.join(' · ')}</div>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          ) : null}

                          <button
                            type="button"
                            className="admin-btn w-100 admin-translations-all-actions__run"
                            disabled={
                              defaultLocaleBusy ||
                              !defaultLocalePick ||
                              defaultLocalePick === restaurantDefaultLocale ||
                              defaultCoverageLoading
                            }
                            onClick={() => void applyRestaurantDefaultLocale()}
                          >
                            {defaultLocaleBusy
                              ? t('adminTranslations.common.saving')
                              : t('adminTranslations.wizard.defaultApply')}
                          </button>
                          {defaultCoverage &&
                            defaultLocalePick !== restaurantDefaultLocale &&
                            defaultCoverage.missingLocale > 0 && (
                              <p className="form-text small text-muted mt-2 mb-0">
                                {t('adminTranslations.wizard.defaultSkipNote')}
                              </p>
                            )}
                        </div>
                      </section>
                    )}

                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Fuera del wizard: siempre pegado al borde inferior del viewport */}
        {wizardStep === 2 && canChangeRestaurant && (
          <div className="admin-translations-wizard-footer" role="navigation" aria-label={t('adminTranslations.wizard.back')}>
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => {
                setStep2Panel(null);
                setWizardStep(1);
              }}
            >
              {t('adminTranslations.wizard.back')}
            </button>
          </div>
        )}
      </div>

      {addOpen && (
        <div
          className="modal show d-block admin-translations-modal admin-translations-sheet"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-scrollable admin-translations-sheet__dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {addScope === 'restaurant'
                    ? t('adminTranslations.addLocale.titleRestaurant')
                    : t('adminTranslations.addLocale.title')}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label={t('adminTranslations.common.close')}
                  onClick={() => setAddOpen(false)}
                />
              </div>
              <div className="modal-body">
                <p className="small text-muted">
                  {addScope === 'restaurant'
                    ? t('adminTranslations.addLocale.introRestaurant')
                    : t('adminTranslations.addLocale.intro')}
                </p>
                <div className="mb-3">
                  <label className="form-label" htmlFor="add-locale-autocomplete">
                    {t('adminTranslations.addLocale.localeLabel')}
                  </label>
                  <div className="admin-translations-autocomplete">
                    <input
                      id="add-locale-autocomplete"
                      type="search"
                      className="form-control"
                      placeholder={t('adminTranslations.addLocale.searchPlaceholder')}
                      value={addLocaleSearch}
                      autoComplete="off"
                      autoFocus
                      role="combobox"
                      aria-expanded={addLocaleSuggestOpen}
                      aria-controls="add-locale-suggestions"
                      aria-autocomplete="list"
                      onFocus={() => setAddLocaleSuggestOpen(true)}
                      onChange={(e) => {
                        const v = e.target.value;
                        setAddLocaleSearch(v);
                        setAddLocaleSuggestOpen(true);
                        setAddLocaleHighlight(0);
                        if (addLocalePreset && addLocalePreset !== ADD_LOCALE_CUSTOM) {
                          setAddLocalePreset('');
                        }
                      }}
                      onKeyDown={(e) => {
                        if (!addLocaleSuggestOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
                          setAddLocaleSuggestOpen(true);
                        }
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          setAddLocaleHighlight((h) =>
                            Math.min(filteredLocalePresets.length - 1, h + 1),
                          );
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          setAddLocaleHighlight((h) => Math.max(0, h - 1));
                        } else if (e.key === 'Enter') {
                          e.preventDefault();
                          const pick = filteredLocalePresets[addLocaleHighlight];
                          if (pick) pickAddLocalePreset(pick.locale, pick.title);
                        } else if (e.key === 'Escape') {
                          setAddLocaleSuggestOpen(false);
                        }
                      }}
                      onBlur={() => {
                        window.setTimeout(() => setAddLocaleSuggestOpen(false), 150);
                      }}
                    />
                    {addLocaleSuggestOpen && (
                      <div
                        id="add-locale-suggestions"
                        className="admin-translations-autocomplete__list"
                        role="listbox"
                      >
                        {filteredLocalePresets.length === 0 ? (
                          <div className="admin-translations-autocomplete__empty">
                            {t('adminTranslations.addLocale.noMatches')}
                          </div>
                        ) : (
                          filteredLocalePresets.map((p, idx) => (
                            <button
                              key={p.locale}
                              type="button"
                              role="option"
                              aria-selected={
                                addLocalePreset === p.locale || addLocaleHighlight === idx
                              }
                              className={`admin-translations-autocomplete__item ${
                                addLocaleHighlight === idx || addLocalePreset === p.locale
                                  ? 'is-active'
                                  : ''
                              }`}
                              onMouseDown={(e) => e.preventDefault()}
                              onMouseEnter={() => setAddLocaleHighlight(idx)}
                              onClick={() => pickAddLocalePreset(p.locale, p.title)}
                            >
                              <span className="fw-semibold">{p.title}</span>
                              <span className="admin-translations-autocomplete__native">
                                {nativeLocaleDisplayName(p.locale)}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  {addLocalePreset && addLocalePreset !== ADD_LOCALE_CUSTOM && (
                    <p className="form-text small text-muted mb-0 mt-1">
                      <Trans
                        i18nKey="adminTranslations.addLocale.selected"
                        values={{ name: defaultLocaleLabel(addLocalePreset) }}
                        components={{ strong: <strong /> }}
                      />
                    </p>
                  )}
                </div>
                <div className="form-check form-switch mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="add-locale-visible-public"
                    checked={addVisiblePublic}
                    onChange={(e) => setAddVisiblePublic(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="add-locale-visible-public">
                    {t('adminTranslations.addLocale.showPublic')}
                  </label>
                </div>
                <details className="admin-translations-advanced">
                  <summary>{t('adminTranslations.common.advancedOptions')}</summary>
                  <div className="admin-translations-advanced__body pt-3">
                    <div className="mb-3">
                      <button
                        type="button"
                        className={`btn btn-sm w-100 ${
                          addLocalePreset === ADD_LOCALE_CUSTOM ? 'btn-primary' : 'btn-outline-secondary'
                        }`}
                        onClick={() => {
                          setAddLocalePreset(ADD_LOCALE_CUSTOM);
                          setAddFlag('');
                          setAddLabel('');
                        }}
                      >
                        {t('adminTranslations.addLocale.customOption')}
                      </button>
                    </div>
                    {addLocalePreset === ADD_LOCALE_CUSTOM && (
                      <div className="mb-3">
                        <label className="form-label">{t('adminTranslations.addLocale.customCodeLabel')}</label>
                        <input
                          className="form-control font-monospace"
                          value={addLocaleCustom}
                          onChange={(e) => {
                            const v = e.target.value;
                            setAddLocaleCustom(v);
                            const n = normalizeMenuLocaleInput(v);
                            if (n) {
                              setAddFlag(suggestedFlagCodeFromLocale(n));
                              setAddLabel(nativeLocaleDisplayName(n));
                            }
                          }}
                          placeholder={t('adminTranslations.addLocale.customCodePlaceholder')}
                        />
                        <p className="form-text small text-muted mb-0">
                          {t('adminTranslations.addLocale.customCodeHelp')}
                        </p>
                      </div>
                    )}
                    <div className="mb-3">
                      <label className="form-label">{t('adminTranslations.addLocale.panelLabel')}</label>
                      <input
                        className="form-control"
                        value={addLabel}
                        onChange={(e) => setAddLabel(e.target.value)}
                        placeholder={t('adminTranslations.addLocale.panelLabelPlaceholder')}
                      />
                      <p className="form-text small text-muted mb-0">
                        {t('adminTranslations.addLocale.panelLabelHelp')}
                      </p>
                    </div>
                    <div className="mb-0">
                      <label className="form-label">{t('adminTranslations.addLocale.flagLabel')}</label>
                      <input
                        className="form-control"
                        maxLength={10}
                        value={addFlag}
                        onChange={(e) => setAddFlag(e.target.value.toUpperCase())}
                        placeholder={t('adminTranslations.addLocale.flagPlaceholder')}
                      />
                      <p className="form-text small text-muted mb-0">
                        <Trans i18nKey="adminTranslations.addLocale.flagHelp" components={{ strong: <strong /> }} />
                      </p>
                    </div>
                  </div>
                </details>
              </div>
              <div className="modal-footer admin-translations-sheet__footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setAddOpen(false)}>
                  {t('adminTranslations.common.cancel')}
                </button>
                <button type="button" className="admin-btn" disabled={addSaving} onClick={() => void submitAddLocale()}>
                  {addSaving ? t('adminTranslations.common.saving') : t('adminTranslations.addLocale.submit')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {settingsOpen && settingsMenu && (
        <div
          className="modal show d-block admin-translations-modal admin-translations-sheet"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-scrollable admin-translations-sheet__dialog admin-translations-sheet__dialog--md">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{t('adminTranslations.settings.title')}</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label={t('adminTranslations.common.close')}
                  onClick={() => setSettingsOpen(false)}
                />
              </div>
              <div className="modal-body">
                <div className="admin-translations-field mb-4">
                  <label className="wizard-label" htmlFor="settings-menu-name">
                    {t('adminTranslations.settings.menuNameLabel')}
                  </label>
                  <input
                    id="settings-menu-name"
                    className="form-control form-control-lg admin-translations-settings-name"
                    value={settingsName}
                    onChange={(e) => setSettingsName(e.target.value)}
                  />
                  <p className="form-text small text-muted mb-0">
                    {t('adminTranslations.settings.menuNameHelp')}
                  </p>
                </div>

                <h6 className="wizard-section-title mb-1">
                  {t('adminTranslations.settings.labelsHeading')}
                </h6>
                <p className="small text-muted mb-3">{t('adminTranslations.settings.labelsHelp')}</p>

                <div className="admin-translations-settings-locales">
                  {settingsManifestRows.map((row, idx) => {
                    const isBase = row.locale === menuSourceLocale(settingsMenu);
                    return (
                      <div key={row.locale} className="admin-translations-settings-locale">
                        <div className="admin-translations-settings-locale__head">
                          <span className="admin-translations-settings-locale__flag" aria-hidden>
                            <MenuLocaleFlagGlyph flagCode={row.flagCode} locale={row.locale} />
                          </span>
                          <div className="min-w-0 flex-grow-1">
                            <div className="fw-semibold text-truncate">
                              {defaultManifestDisplayLabel(row.locale, row.label)}
                            </div>
                            {isBase && (
                              <span className="badge bg-primary mt-1">
                                {t('adminTranslations.menuCard.defaultBadge')}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="admin-translations-settings-locale__fields">
                          <div className="admin-translations-field mb-2">
                            <label className="form-label small mb-1" htmlFor={`settings-label-${row.locale}`}>
                              {t('adminTranslations.settings.label')}
                            </label>
                            <input
                              id={`settings-label-${row.locale}`}
                              className="form-control"
                              value={row.label || ''}
                              onChange={(e) => {
                                const v = e.target.value;
                                setSettingsManifestRows((prev) =>
                                  prev.map((r, i) => (i === idx ? { ...r, label: v } : r)),
                                );
                              }}
                              placeholder={nativeLocaleDisplayName(row.locale)}
                            />
                          </div>
                          <div className="admin-translations-field mb-2">
                            <label className="form-label small mb-1" htmlFor={`settings-flag-${row.locale}`}>
                              {t('adminTranslations.settings.countryCode')}
                            </label>
                            <input
                              id={`settings-flag-${row.locale}`}
                              className="form-control"
                              maxLength={10}
                              value={row.flagCode || ''}
                              onChange={(e) => {
                                const v = e.target.value.toUpperCase();
                                setSettingsManifestRows((prev) =>
                                  prev.map((r, i) => (i === idx ? { ...r, flagCode: v } : r)),
                                );
                              }}
                              placeholder={t('adminTranslations.settings.countryPlaceholder')}
                            />
                          </div>
                          <div className="form-check form-switch mb-0">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              role="switch"
                              id={`enabled-public-${row.locale}`}
                              checked={row.enabledPublic !== false}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setSettingsManifestRows((prev) =>
                                  prev.map((r, i) => (i === idx ? { ...r, enabledPublic: checked } : r)),
                                );
                              }}
                            />
                            <label className="form-check-label" htmlFor={`enabled-public-${row.locale}`}>
                              {t('adminTranslations.settings.visiblePublic')}
                            </label>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <details className="admin-translations-advanced mt-3">
                  <summary>{t('adminTranslations.common.advancedOptions')}</summary>
                  <div className="admin-translations-advanced__body pt-3">
                    <h6 className="text-muted">{t('adminTranslations.settings.renameHeading')}</h6>
                    <p className="small text-muted">{t('adminTranslations.settings.renameHelp')}</p>
                    <div className="admin-translations-field mb-2">
                      <label className="form-label small">
                        {t('adminTranslations.settings.currentLocale')}
                      </label>
                      <select
                        className="form-select"
                        value={renameFrom}
                        onChange={(e) => setRenameFrom(e.target.value)}
                      >
                        <option value="">—</option>
                        {settingsManifestRows
                          .filter((r) => r.locale !== menuSourceLocale(settingsMenu))
                          .map((r) => (
                            <option key={r.locale} value={r.locale}>
                              {defaultManifestDisplayLabel(r.locale, r.label)}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="admin-translations-field mb-2">
                      <label className="form-label small">{t('adminTranslations.settings.newCode')}</label>
                      <input
                        className="form-control"
                        placeholder="en-US"
                        value={renameTo}
                        onChange={(e) => setRenameTo(e.target.value)}
                      />
                    </div>
                    <div className="admin-translations-field mb-2">
                      <label className="form-label small">{t('adminTranslations.settings.label')}</label>
                      <input
                        className="form-control"
                        value={renameLabel}
                        onChange={(e) => setRenameLabel(e.target.value)}
                      />
                    </div>
                    <div className="admin-translations-field mb-0">
                      <label className="form-label small">{t('adminTranslations.settings.country')}</label>
                      <input
                        className="form-control"
                        maxLength={10}
                        value={renameFlag}
                        onChange={(e) => setRenameFlag(e.target.value.toUpperCase())}
                        placeholder={t('adminTranslations.settings.countryPlaceholder')}
                      />
                    </div>
                  </div>
                </details>
              </div>
              <div className="modal-footer admin-translations-sheet__footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setSettingsOpen(false)}>
                  {t('adminTranslations.common.cancel')}
                </button>
                <button type="button" className="admin-btn" disabled={settingsSaving} onClick={() => void saveSettings()}>
                  {settingsSaving ? t('adminTranslations.common.saving') : t('adminTranslations.common.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {benchOpen && benchMenuId && (
        <div
          className="modal show d-block admin-translations-modal admin-translations-sheet"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-scrollable admin-translations-sheet__dialog admin-translations-sheet__dialog--xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <Trans
                    i18nKey="adminTranslations.workbench.title"
                    values={{
                      locale: (() => {
                        const menuRow = menus.find((x) => x.id === benchMenuId);
                        const meta = manifestMap(menuRow?.translationManifest)[benchLocale];
                        return defaultManifestDisplayLabel(benchLocale, meta?.label);
                      })(),
                    }}
                    components={{ muted: <span className="text-muted" /> }}
                  />
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label={t('adminTranslations.common.close')}
                  onClick={() => setBenchOpen(false)}
                />
              </div>
              <div className="modal-body" style={{ overflowY: 'auto' }}>
                {benchLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border" />
                  </div>
                ) : (
                  <>
                    {benchHasStaleTranslations && (
                      <div className="alert alert-warning py-2 small mb-3" role="status">
                        <Trans
                          i18nKey="adminTranslations.workbench.staleAlert"
                          values={{ locale: benchLocale }}
                          components={{ strong: <strong /> }}
                        />
                      </div>
                    )}
                    <div className="mb-4 p-3 border rounded bg-light">
                      <h6 className="text-muted small text-uppercase">{t('adminTranslations.workbench.menuHeading')}</h6>
                      <div className="mb-2">
                        <label className="form-label small d-flex align-items-center gap-2 flex-wrap">
                          {t('adminTranslations.workbench.name')}
                          {benchMenuStale.name && (
                            <span className="badge bg-warning text-dark">{t('adminTranslations.workbench.stale')}</span>
                          )}
                        </label>
                        <input className="form-control" value={benchMenuName} onChange={(e) => setBenchMenuName(e.target.value)} />
                      </div>
                      <div>
                        <label className="form-label small d-flex align-items-center gap-2 flex-wrap">
                          {t('adminTranslations.workbench.description')}
                          {benchMenuStale.description && (
                            <span className="badge bg-warning text-dark">{t('adminTranslations.workbench.stale')}</span>
                          )}
                        </label>
                        <textarea
                          className="form-control"
                          rows={2}
                          value={benchMenuDesc}
                          onChange={(e) => setBenchMenuDesc(e.target.value)}
                        />
                      </div>
                    </div>
                    {benchSections.map((sec) => (
                      <div key={sec.id} className="mb-4">
                        <div className="d-flex align-items-baseline gap-2 mb-2">
                          <h6 className="mb-0">{t('adminTranslations.workbench.section')}</h6>
                          <span className="small text-muted">
                            {t('adminTranslations.workbench.reference', { name: sec.baseName })}
                          </span>
                          {sec.nameStale && (
                            <span className="badge bg-warning text-dark small">
                              {t('adminTranslations.workbench.staleName')}
                            </span>
                          )}
                        </div>
                        <input
                          className="form-control mb-3"
                          value={sec.name}
                          onChange={(e) => updateSectionName(sec.id, e.target.value)}
                        />
                        {(itemsBySection.get(sec.id) || []).map((it) => (
                          <div key={it.id} className="card mb-2">
                            <div className="card-body py-2">
                              <div className="small text-muted mb-1">
                                {t('adminTranslations.workbench.ref', { name: it.baseName })}
                                {it.baseDescription ? ` — ${it.baseDescription.slice(0, 80)}${it.baseDescription.length > 80 ? '…' : ''}` : ''}
                              </div>
                              <label className="form-label small mb-0 d-flex align-items-center gap-2 flex-wrap">
                                {t('adminTranslations.workbench.name')}
                                {it.nameStale && (
                                  <span className="badge bg-warning text-dark">{t('adminTranslations.workbench.stale')}</span>
                                )}
                              </label>
                              <input
                                className="form-control form-control-sm mb-2"
                                value={it.name}
                                onChange={(e) => updateItem(it.id, { name: e.target.value })}
                              />
                              <label className="form-label small mb-0 d-flex align-items-center gap-2 flex-wrap">
                                {t('adminTranslations.workbench.description')}
                                {it.descriptionStale && (
                                  <span className="badge bg-warning text-dark">{t('adminTranslations.workbench.stale')}</span>
                                )}
                              </label>
                              <textarea
                                className="form-control form-control-sm"
                                rows={2}
                                value={it.description}
                                onChange={(e) => updateItem(it.id, { description: e.target.value })}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </>
                )}
              </div>
              <div className="modal-footer admin-translations-sheet__footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setBenchOpen(false)}>
                  {t('adminTranslations.common.close')}
                </button>
                <button
                  type="button"
                  className="admin-btn"
                  disabled={benchLoading || benchSaving}
                  onClick={() => void saveWorkbench()}
                >
                  {benchSaving ? t('adminTranslations.common.saving') : t('adminTranslations.workbench.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        className="admin-translations-modal admin-translations-sheet"
        show={!!confirmDeleteLocale}
        title={t('adminTranslations.confirm.deleteLocaleTitle')}
        message={
          confirmDeleteLocale
            ? t('adminTranslations.confirm.deleteLocaleMessage', {
                locale: defaultManifestDisplayLabel(
                  confirmDeleteLocale.locale,
                  manifestMap(confirmDeleteLocale.menu.translationManifest)[confirmDeleteLocale.locale]
                    ?.label,
                ),
              })
            : ''
        }
        confirmText={t('adminTranslations.confirm.delete')}
        cancelText={t('adminTranslations.common.cancel')}
        variant="danger"
        onConfirm={() => void executeDeleteMenuLocale()}
        onCancel={() => setConfirmDeleteLocale(null)}
      />

      <ConfirmModal
        className="admin-translations-modal admin-translations-sheet"
        show={!!confirmDeleteRestaurantLocale}
        title={t('adminTranslations.confirm.deleteLocaleRestaurantTitle')}
        message={
          confirmDeleteRestaurantLocale
            ? t('adminTranslations.confirm.deleteLocaleRestaurantMessage', {
                locale: defaultManifestDisplayLabel(
                  confirmDeleteRestaurantLocale,
                  restaurantTargetLocales.find((x) => x.locale === confirmDeleteRestaurantLocale)?.label,
                ),
              })
            : ''
        }
        confirmText={t('adminTranslations.confirm.delete')}
        cancelText={t('adminTranslations.common.cancel')}
        variant="danger"
        onConfirm={() => void executeDeleteRestaurantLocale()}
        onCancel={() => setConfirmDeleteRestaurantLocale(null)}
      />

      <ConfirmModal
        className="admin-translations-modal admin-translations-sheet"
        show={!!confirmAutoTranslate}
        title={t('adminTranslations.autoTranslate.confirmTitle')}
        message={confirmAutoTranslate?.message || ''}
        confirmText={t('adminTranslations.autoTranslate.confirmTranslate')}
        cancelText={t('adminTranslations.common.cancel')}
        variant="primary"
        onConfirm={() => void executeMenuAutoTranslate()}
        onCancel={() => setConfirmAutoTranslate(null)}
      />

      <ConfirmModal
        className="admin-translations-modal admin-translations-sheet"
        show={!!confirmRestaurantAutoTranslate}
        title={t('adminTranslations.autoTranslate.restaurantConfirmTitle')}
        message={confirmRestaurantAutoTranslate?.message || ''}
        confirmText={t('adminTranslations.autoTranslate.confirmTranslate')}
        cancelText={t('adminTranslations.common.cancel')}
        variant="primary"
        onConfirm={() => void executeRestaurantAutoTranslate()}
        onCancel={() => setConfirmRestaurantAutoTranslate(null)}
      />

      {alertData && (
        <AlertModal
          show={showAlert}
          title={alertData.title}
          message={alertData.message}
          variant={alertData.variant}
          onClose={() => {
            setShowAlert(false);
            setAlertData(null);
          }}
        />
      )}
    </AdminLayout>
  );
}
