import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Trans, useTranslation } from 'react-i18next';
import api from '../../../lib/axios';
import { MenuLocaleFlagGlyph } from '../../../lib/menu-locale-flag';
import AdminLayout from '../../../components/AdminLayout';
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
  if (locale === 'es-ES') return i18n.t('adminTranslations.localeLabels.es-ES');
  if (locale === 'en-US') return i18n.t('adminTranslations.localeLabels.en-US');
  return locale;
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
  const [addMenuId, setAddMenuId] = useState<string | null>(null);
  const [addLocalePreset, setAddLocalePreset] = useState('en-US');
  const [addLocaleCustom, setAddLocaleCustom] = useState('');
  const [addLabel, setAddLabel] = useState('');
  const [addFlag, setAddFlag] = useState('');
  const [addSaving, setAddSaving] = useState(false);
  const [addVisiblePublic, setAddVisiblePublic] = useState(true);
  const [addLocaleSearch, setAddLocaleSearch] = useState('');
  const [deleteLocaleBusy, setDeleteLocaleBusy] = useState<{ menuId: string; locale: string } | null>(null);
  const [setDefaultBusyKey, setSetDefaultBusyKey] = useState<string | null>(null);
  const [confirmDeleteLocale, setConfirmDeleteLocale] = useState<{ menu: MenuRow; locale: string } | null>(null);
  const [confirmAutoTranslate, setConfirmAutoTranslate] = useState<{
    menu: MenuRow;
    locale: string;
    force: boolean;
    message: string;
  } | null>(null);

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
      }));
    });
  }, [t]);

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

  const filteredLocalePresets = useMemo(() => {
    const q = addLocaleSearch.trim().toLowerCase();
    if (!q) return flatLocalePresets;
    return flatLocalePresets.filter(
      (it) =>
        it.title.toLowerCase().includes(q) ||
        it.locale.toLowerCase().includes(q) ||
        it.group.toLowerCase().includes(q),
    );
  }, [addLocaleSearch, flatLocalePresets]);

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

  const loadMenus = useCallback(async () => {
    if (!selectedRestaurantId || !canAccessPage) {
      setMenus([]);
      return;
    }
    if (isSuperAdmin && !tenantIdForApi) {
      setMenus([]);
      showAlertMsg(
        t('adminTranslations.alerts.tenantUnavailableTitle'),
        t('adminTranslations.alerts.tenantUnavailable'),
        'warning',
      );
      return;
    }
    setLoadingMenus(true);
    try {
      const params: Record<string, string> = { restaurantId: selectedRestaurantId };
      if (isSuperAdmin && tenantIdForApi) params.tenantId = tenantIdForApi;
      const res = await api.get('/menu-translations/menus', { params });
      setMenus(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || t('adminTranslations.alerts.loadMenusError');
      showAlertMsg(t('adminTranslations.alerts.translationsTitle'), String(msg), 'error');
      setMenus([]);
    } finally {
      setLoadingMenus(false);
    }
  }, [selectedRestaurantId, canAccessPage, isSuperAdmin, tenantIdForApi, showAlertMsg, t]);

  useEffect(() => {
    void loadMenus();
  }, [loadMenus]);

  const openAddLocale = (menuId: string) => {
    setAddMenuId(menuId);
    const initial = 'en-US';
    setAddLocalePreset(initial);
    setAddLocaleCustom('');
    setAddLocaleSearch('');
    setAddLabel('');
    setAddFlag(suggestedFlagCodeFromLocale(initial) || 'US');
    setAddVisiblePublic(true);
    setAddOpen(true);
  };

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

  const setMenuDefaultLocale = useCallback(
    async (m: MenuRow, locale: string) => {
      const source = menuSourceLocale(m);
      if (locale === source) return;
      setSetDefaultBusyKey(`${m.id}:${locale}`);
      try {
        const body: Record<string, string> = { locale };
        if (isSuperAdmin && tenantIdForApi) body.tenantId = tenantIdForApi;
        await api.post(`/menu-translations/menus/${m.id}/set-default-locale`, body);
        showAlertMsg(
          t('adminTranslations.alerts.defaultLocaleTitle'),
          t('adminTranslations.alerts.defaultLocaleSuccess', { locale, previous: source }),
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
        setSetDefaultBusyKey(null);
      }
    },
    [isSuperAdmin, tenantIdForApi, loadMenus, showAlertMsg, t],
  );

  const submitAddLocale = async () => {
    if (!addMenuId) return;
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
    const addBase = menuSourceLocale(menus.find((x) => x.id === addMenuId) || { sourceLocale: 'es-ES' });
    if (locale === addBase) {
      showAlertMsg(
        t('adminTranslations.alerts.localeTitle'),
        t('adminTranslations.addLocale.alreadyBase', { locale }),
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
    setAddSaving(true);
    try {
      const body: any = {
        locale,
        label: addLabel.trim() || undefined,
        flagCode: fc || undefined,
        ...(addVisiblePublic ? {} : { enabledPublic: false }),
      };
      if (isSuperAdmin && tenantIdForApi) body.tenantId = tenantIdForApi;
      await api.post(`/menu-translations/menus/${addMenuId}/locales`, body);
      setAddOpen(false);
      showAlertMsg(t('adminTranslations.alerts.doneTitle'), t('adminTranslations.addLocale.success'), 'success');
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
        showAlertMsg(
          t('adminTranslations.alerts.autoTranslateTitle'),
          t('adminTranslations.autoTranslate.needLocale', { source }),
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
        setConfirmAutoTranslate({
          menu: m,
          locale: loc,
          force,
          message: t('adminTranslations.autoTranslate.confirmMessage', {
            source,
            locale: loc,
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
      const res = await api.post(`/menu-translations/menus/${m.id}/auto-translate`, body);
      const d = res.data as { segmentCount?: number; apiUnits?: number; cacheHits?: number };
      showAlertMsg(
        t('adminTranslations.alerts.autoTranslateTitle'),
        t('adminTranslations.autoTranslate.success', {
          segments: d.segmentCount ?? 0,
          apiUnits: d.apiUnits ?? 0,
          cacheHits: d.cacheHits ?? 0,
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
      setAutoBusyMenuId(null);
    }
  }, [confirmAutoTranslate, isSuperAdmin, tenantIdForApi, loadMenus, showAlertMsg, t]);

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

  const addMenuSource = menuSourceLocale(menus.find((x) => x.id === addMenuId) || { sourceLocale: 'es-ES' });

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
          <h1 className="h3 mb-3">{t('adminTranslations.title')}</h1>
          <p className="lead text-muted mb-2" style={{ fontSize: '1.05rem' }}>
            <Trans i18nKey="adminTranslations.upgrade.lead" components={{ strong: <strong /> }} />
          </p>
          <p className="text-muted mb-4">
            <Trans i18nKey="adminTranslations.upgrade.body" components={{ strong: <strong /> }} />
          </p>

          <div className="row g-4 align-items-stretch">
            <div className="col-12 col-md-4">
              <div className="card h-100 border-secondary shadow-sm" style={{ opacity: 0.92 }}>
                <div className="card-body d-flex flex-column">
                  <h2 className="h5 mb-2">{t('adminTranslations.upgrade.cardTranslationsTitle')}</h2>
                  <p className="small text-muted flex-grow-1 mb-3">
                    {t('adminTranslations.upgrade.cardTranslationsDesc')}
                  </p>
                  <button
                    type="button"
                    className="btn btn-outline-primary w-100"
                    disabled
                    tabIndex={-1}
                    style={{ pointerEvents: 'none' }}
                  >
                    {t('adminTranslations.upgrade.availableOnPlans')}
                  </button>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="card h-100 border-secondary shadow-sm" style={{ opacity: 0.92 }}>
                <div className="card-body d-flex flex-column">
                  <h2 className="h5 mb-2">
                    {t('adminTranslations.upgrade.cardAutoTitle')}{' '}
                    <span className="badge bg-info text-dark">{t('adminTranslations.common.beta')}</span>
                  </h2>
                  <p className="small text-muted flex-grow-1 mb-3">
                    {t('adminTranslations.upgrade.cardAutoDesc')}
                  </p>
                  <button
                    type="button"
                    className="btn btn-outline-primary w-100"
                    disabled
                    tabIndex={-1}
                    style={{ pointerEvents: 'none' }}
                  >
                    {t('adminTranslations.upgrade.availableOnPlans')}
                  </button>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div
                className="admin-stat-card h-100 d-flex flex-column justify-content-center"
                style={{
                  background: 'linear-gradient(135deg, #e8f4fd 0%, #d4ebfa 100%)',
                  border: '2px solid var(--bs-primary, #0d6efd)',
                  boxShadow: '0 4px 12px rgba(13, 110, 253, 0.2)',
                }}
              >
                <p className="admin-stat-title mb-2" style={{ fontSize: '1rem' }}>
                  {t('adminTranslations.upgrade.promoTitle')}
                </p>
                <p className="small text-muted mb-3" style={{ lineHeight: 1.4 }}>
                  {t('adminTranslations.upgrade.promoBody')}
                </p>
                <Link
                  href="/admin/profile/subscription"
                  className="btn btn-primary btn-sm align-self-start"
                  style={{ textDecoration: 'none', fontWeight: 600 }}
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
      <div className="py-3">
        <h1 className="h3 mb-2">{t('adminTranslations.title')}</h1>
        {(restaurants.length > 0 || isSuperAdmin) && (
          <p className="text-muted small mb-4">
            <Trans i18nKey="adminTranslations.page.publicToggleHint" components={{ strong: <strong /> }} />
          </p>
        )}

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
          <>
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <label className="form-label">{t('adminTranslations.page.businessLabel')}</label>
            {isSuperAdmin && (
              <div className="input-group mb-2">
                <input
                  className="form-control"
                  placeholder={t('adminTranslations.page.searchPlaceholder')}
                  value={restaurantSearch}
                  onChange={(e) => setRestaurantSearch(e.target.value)}
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
            <select
              className="form-select"
              value={selectedRestaurantId}
              onChange={(e) => setSelectedRestaurantId(e.target.value)}
            >
              <option value="">{t('adminTranslations.page.selectBusiness')}</option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                  {r.tenantName ? ` — ${r.tenantName}` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!selectedRestaurantId ? (
          <p className="text-muted">{t('adminTranslations.page.selectBusinessHint')}</p>
        ) : loadingMenus ? (
          <div className="text-center py-5">
            <div className="spinner-border spinner-border-sm" />
          </div>
        ) : menus.length === 0 ? (
          <p className="text-muted">{t('adminTranslations.page.noMenus')}</p>
        ) : (
          <div className="row g-3">
            {menus.map((m) => {
              const mm = manifestMap(m.translationManifest);
              return (
                <div key={m.id} className="col-12 col-lg-6">
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                        <div>
                          <h2 className="h5 mb-0">{m.name}</h2>
                          {m.status && (
                            <span className="badge bg-secondary text-uppercase small">{m.status}</span>
                          )}
                        </div>
                        <div className="d-flex flex-wrap gap-1">
                          <button type="button" className="btn btn-sm btn-primary" onClick={() => openAddLocale(m.id)}>
                            {t('adminTranslations.menuCard.addLocale')}
                          </button>
                          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => openSettings(m)}>
                            {t('adminTranslations.menuCard.nameAndLocales')}
                          </button>
                        </div>
                      </div>
                      <div className="d-flex flex-wrap align-items-stretch gap-2 mt-3">
                        {(m.locales || []).map((loc) => {
                          const meta = mm[loc];
                          const source = menuSourceLocale(m);
                          const isBase = loc === source;
                          const visiblePublic = meta?.enabledPublic !== false;
                          const toggleBusy = localeToggleKey === `${m.id}:${loc}`;
                          const setDefaultBusy =
                            setDefaultBusyKey === `${m.id}:${loc}`;
                          return (
                            <div
                              key={loc}
                              className="d-flex flex-column border rounded px-2 py-2 bg-light"
                              style={{ fontSize: '0.9rem', minWidth: '140px' }}
                            >
                              <div className="d-flex align-items-center gap-1 flex-wrap">
                                <span title={loc} style={{ fontSize: '1.25rem', lineHeight: 1 }}>
                                  <MenuLocaleFlagGlyph flagCode={meta?.flagCode} locale={loc} />
                                </span>
                                <span className="text-muted">{defaultManifestDisplayLabel(loc, meta?.label)}</span>
                                {isBase && (
                                  <span
                                    className="badge bg-primary ms-1"
                                    title={t('adminTranslations.menuCard.defaultBadgeTitle')}
                                  >
                                    {t('adminTranslations.menuCard.defaultBadge')}
                                  </span>
                                )}
                                {!isBase && (m.autoTranslatedLocales || []).includes(loc) && (
                                  <span
                                    className="badge bg-info text-dark ms-1"
                                    title={t('adminTranslations.menuCard.autoBadgeTitle')}
                                  >
                                    {t('adminTranslations.menuCard.autoBadge')}
                                  </span>
                                )}
                              </div>
                              <div className="form-check form-switch mt-2 mb-1">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  id={`public-${m.id}-${loc}`}
                                  checked={visiblePublic}
                                  disabled={toggleBusy}
                                  title={t('adminTranslations.menuCard.publicToggleTitle')}
                                  onChange={(e) => void toggleLocaleVisibleOnPublicMenu(m, loc, e.target.checked)}
                                />
                                <label className="form-check-label small" htmlFor={`public-${m.id}-${loc}`}>
                                  {t('adminTranslations.menuCard.publicMenu')}
                                </label>
                              </div>
                              <div className="mt-auto d-flex flex-wrap gap-2 align-items-center">
                                {!isBase ? (
                                  <>
                                    <button
                                      type="button"
                                      className="btn btn-link btn-sm p-0"
                                      onClick={() => void openWorkbench(m.id, loc)}
                                    >
                                      {t('adminTranslations.menuCard.translate')}
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-link btn-sm p-0"
                                      disabled={setDefaultBusy}
                                      onClick={() => void setMenuDefaultLocale(m, loc)}
                                      title={t('adminTranslations.menuCard.useAsDefaultTitle')}
                                    >
                                      {setDefaultBusy
                                        ? t('adminTranslations.menuCard.changing')
                                        : t('adminTranslations.menuCard.useAsDefault')}
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-link btn-sm p-0 text-danger"
                                      disabled={
                                        !!deleteLocaleBusy &&
                                        deleteLocaleBusy.menuId === m.id &&
                                        deleteLocaleBusy.locale === loc
                                      }
                                      onClick={() => requestDeleteMenuLocale(m, loc)}
                                    >
                                      {deleteLocaleBusy?.menuId === m.id && deleteLocaleBusy?.locale === loc
                                        ? t('adminTranslations.menuCard.deleting')
                                        : t('adminTranslations.menuCard.deleteLocale')}
                                    </button>
                                  </>
                                ) : (
                                  <Link href="/admin/menus" className="btn btn-link btn-sm p-0">
                                    {t('adminTranslations.menuCard.editBase')}
                                  </Link>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {canAccessPage && (m.locales || []).some((l) => l !== menuSourceLocale(m)) && (
                        <div className="mt-3 pt-3 border-top">
                          <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                            <h3 className="h6 text-muted mb-0">{t('adminTranslations.autoTranslate.title')}</h3>
                          </div>
                          <p className="small text-muted mb-2">
                            <Trans
                              i18nKey="adminTranslations.autoTranslate.help"
                              values={{ source: menuSourceLocale(m) }}
                              components={{ strong: <strong /> }}
                            />
                          </p>
                          <div className="row g-2 align-items-end">
                            <div className="col-md-4">
                              <label className="form-label small mb-0">
                                {t('adminTranslations.autoTranslate.targetLocale')}
                              </label>
                              <select
                                className="form-select form-select-sm"
                                value={autoLocalePick[m.id] || (m.locales || []).find((l) => l !== menuSourceLocale(m)) || ''}
                                onChange={(e) =>
                                  setAutoLocalePick((prev) => ({ ...prev, [m.id]: e.target.value }))
                                }
                              >
                                {(m.locales || [])
                                  .filter((l) => l !== menuSourceLocale(m))
                                  .map((l) => (
                                    <option key={l} value={l}>
                                      {defaultManifestDisplayLabel(l, mm[l]?.label)} ({l})
                                    </option>
                                  ))}
                              </select>
                            </div>
                            <div className="col-md-4">
                              <div className="form-check mt-2">
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
                                  {t('adminTranslations.autoTranslate.force')}
                                </label>
                              </div>
                            </div>
                            <div className="col-md-4">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary w-100"
                                disabled={autoBusyMenuId === m.id}
                                onClick={() => void requestMenuAutoTranslate(m)}
                              >
                                {autoBusyMenuId === m.id
                                  ? t('adminTranslations.autoTranslate.processing')
                                  : t('adminTranslations.autoTranslate.run')}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
          </>
        )}
      </div>

      {addOpen && addMenuId && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }} role="dialog">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{t('adminTranslations.addLocale.title')}</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label={t('adminTranslations.common.close')}
                  onClick={() => setAddOpen(false)}
                />
              </div>
              <div className="modal-body">
                <p className="small text-muted">
                  {t('adminTranslations.addLocale.intro', { source: addMenuSource })}
                </p>
                <div className="mb-3">
                  <label className="form-label">{t('adminTranslations.addLocale.localeLabel')}</label>
                  <input
                    type="search"
                    className="form-control form-control-sm mb-2"
                    placeholder={t('adminTranslations.addLocale.searchPlaceholder')}
                    value={addLocaleSearch}
                    onChange={(e) => setAddLocaleSearch(e.target.value)}
                    autoComplete="off"
                  />
                  <div className="border rounded bg-white" style={{ maxHeight: 260 }}>
                    <div className="list-group list-group-flush overflow-auto" style={{ maxHeight: 200 }}>
                      {filteredLocalePresets.map((p) => (
                        <button
                          key={p.locale}
                          type="button"
                          className={`list-group-item list-group-item-action py-2 px-3 w-100 text-start small ${
                            addLocalePreset === p.locale && addLocalePreset !== ADD_LOCALE_CUSTOM ? 'active' : ''
                          }`}
                          onClick={() => {
                            setAddLocalePreset(p.locale);
                            setAddFlag(suggestedFlagCodeFromLocale(p.locale));
                          }}
                        >
                          <span className="fw-semibold">{p.title}</span>{' '}
                          <span className="text-muted">{p.locale}</span>
                          <span className="d-block text-muted" style={{ fontSize: '0.7rem' }}>
                            {p.group}
                          </span>
                        </button>
                      ))}
                      {filteredLocalePresets.length === 0 && (
                        <div className="p-3 small text-muted">{t('adminTranslations.addLocale.noMatches')}</div>
                      )}
                    </div>
                    <div className="border-top p-2 bg-light">
                      <button
                        type="button"
                        className={`btn btn-sm w-100 ${
                          addLocalePreset === ADD_LOCALE_CUSTOM ? 'btn-primary' : 'btn-outline-secondary'
                        }`}
                        onClick={() => {
                          setAddLocalePreset(ADD_LOCALE_CUSTOM);
                          setAddFlag('');
                        }}
                      >
                        {t('adminTranslations.addLocale.customOption')}
                      </button>
                    </div>
                  </div>
                  {addLocalePreset !== ADD_LOCALE_CUSTOM && (
                    <p className="form-text small text-muted mb-0 mt-1">
                      <Trans
                        i18nKey="adminTranslations.addLocale.selected"
                        values={{ locale: addLocalePreset }}
                        components={{ strong: <strong /> }}
                      />
                    </p>
                  )}
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
                        if (n) setAddFlag(suggestedFlagCodeFromLocale(n));
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
                </div>
                <div className="mb-3">
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
                <div className="form-check form-switch mb-0">
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
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setAddOpen(false)}>
                  {t('adminTranslations.common.cancel')}
                </button>
                <button type="button" className="btn btn-primary" disabled={addSaving} onClick={() => void submitAddLocale()}>
                  {addSaving ? t('adminTranslations.common.saving') : t('adminTranslations.addLocale.submit')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {settingsOpen && settingsMenu && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }} role="dialog">
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
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
                <div className="mb-3">
                  <label className="form-label">
                    {t('adminTranslations.settings.menuNameLabel', {
                      sourceSuffix: settingsMenu ? ` ${menuSourceLocale(settingsMenu)}` : '',
                    })}
                  </label>
                  <input className="form-control" value={settingsName} onChange={(e) => setSettingsName(e.target.value)} />
                </div>
                <hr />
                <h6 className="text-muted">{t('adminTranslations.settings.labelsHeading')}</h6>
                <p className="small text-muted">
                  <Trans
                    i18nKey="adminTranslations.settings.labelsHelp"
                    values={{
                      sourceParen: settingsMenu ? ` (${menuSourceLocale(settingsMenu)})` : '',
                    }}
                    components={{ code: <code />, strong: <strong /> }}
                  />
                </p>
                {settingsManifestRows.map((row, idx) => (
                  <div key={row.locale} className="row g-2 align-items-end mb-2">
                      <div className="col-md-2">
                      <label className="form-label small mb-0">{row.locale}</label>
                      <div className="form-control-plaintext fw-semibold d-flex align-items-center" style={{ minHeight: 32 }}>
                        <MenuLocaleFlagGlyph flagCode={row.flagCode} locale={row.locale} />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small">{t('adminTranslations.settings.label')}</label>
                      <input
                        className="form-control form-control-sm"
                        value={row.label || ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          setSettingsManifestRows((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, label: v } : r)),
                          );
                        }}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small">{t('adminTranslations.settings.countryCode')}</label>
                      <input
                        className="form-control form-control-sm"
                        maxLength={10}
                        value={row.flagCode || ''}
                        onChange={(e) => {
                          const v = e.target.value.toUpperCase();
                          setSettingsManifestRows((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, flagCode: v } : r)),
                          );
                        }}
                      />
                    </div>
                    <div className="col-md-3">
                      <div className="form-check mt-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`enabled-public-${row.locale}`}
                          checked={row.enabledPublic !== false}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setSettingsManifestRows((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, enabledPublic: checked } : r)),
                            );
                          }}
                        />
                        <label className="form-check-label small" htmlFor={`enabled-public-${row.locale}`}>
                          {t('adminTranslations.settings.visiblePublic')}
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
                <hr />
                <h6 className="text-muted">{t('adminTranslations.settings.renameHeading')}</h6>
                <p className="small text-muted">
                  <Trans
                    i18nKey="adminTranslations.settings.renameHelp"
                    values={{
                      sourceCode: settingsMenu ? ` (${menuSourceLocale(settingsMenu)})` : '',
                    }}
                    components={{ code: <code /> }}
                  />
                </p>
                <div className="row g-2">
                  <div className="col-md-4">
                    <label className="form-label small">{t('adminTranslations.settings.currentLocale')}</label>
                    <select
                      className="form-select form-select-sm"
                      value={renameFrom}
                      onChange={(e) => setRenameFrom(e.target.value)}
                    >
                      <option value="">—</option>
                      {settingsManifestRows
                        .filter((r) => r.locale !== menuSourceLocale(settingsMenu))
                        .map((r) => (
                          <option key={r.locale} value={r.locale}>
                            {r.locale}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small">{t('adminTranslations.settings.newCode')}</label>
                    <input
                      className="form-control form-control-sm"
                      placeholder="en-US"
                      value={renameTo}
                      onChange={(e) => setRenameTo(e.target.value)}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small">{t('adminTranslations.settings.label')}</label>
                    <input
                      className="form-control form-control-sm"
                      value={renameLabel}
                      onChange={(e) => setRenameLabel(e.target.value)}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small">{t('adminTranslations.settings.country')}</label>
                    <input
                      className="form-control form-control-sm"
                      maxLength={10}
                      value={renameFlag}
                      onChange={(e) => setRenameFlag(e.target.value.toUpperCase())}
                      placeholder={t('adminTranslations.settings.countryPlaceholder')}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setSettingsOpen(false)}>
                  {t('adminTranslations.common.cancel')}
                </button>
                <button type="button" className="btn btn-primary" disabled={settingsSaving} onClick={() => void saveSettings()}>
                  {settingsSaving ? t('adminTranslations.common.saving') : t('adminTranslations.common.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {benchOpen && benchMenuId && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} role="dialog">
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content" style={{ maxHeight: '92vh' }}>
              <div className="modal-header">
                <h5 className="modal-title">
                  <Trans
                    i18nKey="adminTranslations.workbench.title"
                    values={{ locale: benchLocale }}
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
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setBenchOpen(false)}>
                  {t('adminTranslations.common.close')}
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
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
        show={!!confirmDeleteLocale}
        title={t('adminTranslations.confirm.deleteLocaleTitle')}
        message={
          confirmDeleteLocale
            ? t('adminTranslations.confirm.deleteLocaleMessage', { locale: confirmDeleteLocale.locale })
            : ''
        }
        confirmText={t('adminTranslations.confirm.delete')}
        cancelText={t('adminTranslations.common.cancel')}
        variant="danger"
        onConfirm={() => void executeDeleteMenuLocale()}
        onCancel={() => setConfirmDeleteLocale(null)}
      />

      <ConfirmModal
        show={!!confirmAutoTranslate}
        title={t('adminTranslations.autoTranslate.confirmTitle')}
        message={confirmAutoTranslate?.message || ''}
        confirmText={t('adminTranslations.autoTranslate.confirmTranslate')}
        cancelText={t('adminTranslations.common.cancel')}
        variant="primary"
        onConfirm={() => void executeMenuAutoTranslate()}
        onCancel={() => setConfirmAutoTranslate(null)}
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
