import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../../../lib/axios';
import { MenuLocaleFlagGlyph } from '../../../lib/menu-locale-flag';
import AdminLayout from '../../../components/AdminLayout';
import AlertModal from '../../../components/AlertModal';

type ManifestEntry = { locale: string; label?: string; flagCode?: string; enabledPublic?: boolean };

type MenuRow = {
  id: string;
  name: string;
  slug?: string;
  status?: string;
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
  const t = raw.trim().replace(/_/g, '-');
  if (!t) return '';
  const parts = t.split('-').filter(Boolean);
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
const LOCALE_PRESET_GROUPS: { label: string; items: { locale: string; title: string }[] }[] = [
  {
    label: 'Inglés y germánicos',
    items: [
      { locale: 'en-US', title: 'Inglés (EE.UU.)' },
      { locale: 'en-GB', title: 'Inglés (Reino Unido)' },
      { locale: 'en-CA', title: 'Inglés (Canadá)' },
      { locale: 'en-AU', title: 'Inglés (Australia)' },
      { locale: 'en-NZ', title: 'Inglés (Nueva Zelanda)' },
      { locale: 'en-IE', title: 'Inglés (Irlanda)' },
      { locale: 'de-DE', title: 'Alemán (Alemania)' },
      { locale: 'de-AT', title: 'Alemán (Austria)' },
      { locale: 'de-CH', title: 'Alemán (Suiza)' },
      { locale: 'nl-NL', title: 'Neerlandés (Países Bajos)' },
      { locale: 'nl-BE', title: 'Neerlandés (Bélgica)' },
      { locale: 'sv-SE', title: 'Sueco' },
      { locale: 'da-DK', title: 'Danés' },
      { locale: 'fi-FI', title: 'Finlandés' },
      { locale: 'is-IS', title: 'Islandés' },
      { locale: 'nb-NO', title: 'Noruego (bokmål)' },
      { locale: 'nn-NO', title: 'Noruego (nynorsk)' },
    ],
  },
  {
    label: 'Romances',
    items: [
      { locale: 'fr-FR', title: 'Francés (Francia)' },
      { locale: 'fr-CA', title: 'Francés (Canadá)' },
      { locale: 'fr-BE', title: 'Francés (Bélgica)' },
      { locale: 'fr-CH', title: 'Francés (Suiza)' },
      { locale: 'it-IT', title: 'Italiano (Italia)' },
      { locale: 'it-CH', title: 'Italiano (Suiza)' },
      { locale: 'pt-BR', title: 'Portugués (Brasil)' },
      { locale: 'pt-PT', title: 'Portugués (Portugal)' },
      { locale: 'ro-RO', title: 'Rumano' },
      { locale: 'ca-ES', title: 'Catalán' },
      { locale: 'gl-ES', title: 'Gallego' },
      { locale: 'eu-ES', title: 'Euskera' },
    ],
  },
  {
    label: 'Español regional',
    items: [
      { locale: 'es-MX', title: 'Español (México)' },
      { locale: 'es-AR', title: 'Español (Argentina)' },
      { locale: 'es-CO', title: 'Español (Colombia)' },
      { locale: 'es-CL', title: 'Español (Chile)' },
      { locale: 'es-PE', title: 'Español (Perú)' },
      { locale: 'es-VE', title: 'Español (Venezuela)' },
      { locale: 'es-EC', title: 'Español (Ecuador)' },
      { locale: 'es-GT', title: 'Español (Guatemala)' },
      { locale: 'es-CR', title: 'Español (Costa Rica)' },
      { locale: 'es-PA', title: 'Español (Panamá)' },
      { locale: 'es-DO', title: 'Español (Rep. Dominicana)' },
      { locale: 'es-UY', title: 'Español (Uruguay)' },
      { locale: 'es-PY', title: 'Español (Paraguay)' },
      { locale: 'es-BO', title: 'Español (Bolivia)' },
      { locale: 'es-419', title: 'Español (Latinoamérica, genérico)' },
    ],
  },
  {
    label: 'Europa central y oriental',
    items: [
      { locale: 'pl-PL', title: 'Polaco' },
      { locale: 'cs-CZ', title: 'Checo' },
      { locale: 'sk-SK', title: 'Eslovaco' },
      { locale: 'hu-HU', title: 'Húngaro' },
      { locale: 'bg-BG', title: 'Búlgaro' },
      { locale: 'hr-HR', title: 'Croata' },
      { locale: 'sl-SI', title: 'Esloveno' },
      { locale: 'sr-RS', title: 'Serbio (Serbia)' },
      { locale: 'bs-BA', title: 'Bosnio' },
      { locale: 'mk-MK', title: 'Macedonio' },
      { locale: 'sq-AL', title: 'Albanés' },
      { locale: 'el-GR', title: 'Griego' },
      { locale: 'uk-UA', title: 'Ucraniano' },
      { locale: 'ru-RU', title: 'Ruso' },
      { locale: 'be-BY', title: 'Bielorruso' },
      { locale: 'lt-LT', title: 'Lituano' },
      { locale: 'lv-LV', title: 'Letón' },
      { locale: 'et-EE', title: 'Estonio' },
    ],
  },
  {
    label: 'Asia y Pacífico',
    items: [
      { locale: 'zh-CN', title: 'Chino (simplificado, China)' },
      { locale: 'zh-TW', title: 'Chino (tradicional, Taiwán)' },
      { locale: 'zh-HK', title: 'Chino (Hong Kong)' },
      { locale: 'ja-JP', title: 'Japonés' },
      { locale: 'ko-KR', title: 'Coreano' },
      { locale: 'hi-IN', title: 'Hindi (India)' },
      { locale: 'bn-IN', title: 'Bengalí (India)' },
      { locale: 'ta-IN', title: 'Tamil (India)' },
      { locale: 'ur-PK', title: 'Urdu (Pakistán)' },
      { locale: 'th-TH', title: 'Tailandés' },
      { locale: 'vi-VN', title: 'Vietnamita' },
      { locale: 'id-ID', title: 'Indonesio' },
      { locale: 'ms-MY', title: 'Malayo' },
      { locale: 'fil-PH', title: 'Filipino' },
      { locale: 'km-KH', title: 'Jemer' },
      { locale: 'my-MM', title: 'Birmano' },
    ],
  },
  {
    label: 'Oriente Medio y África',
    items: [
      { locale: 'ar-SA', title: 'Árabe (Arabia Saudita)' },
      { locale: 'ar-AE', title: 'Árabe (Emiratos)' },
      { locale: 'ar-EG', title: 'Árabe (Egipto)' },
      { locale: 'ar-MA', title: 'Árabe (Marruecos)' },
      { locale: 'ar-DZ', title: 'Árabe (Argelia)' },
      { locale: 'fa-IR', title: 'Persa (Irán)' },
      { locale: 'he-IL', title: 'Hebreo' },
      { locale: 'tr-TR', title: 'Turco' },
      { locale: 'sw-KE', title: 'Suajili (Kenia)' },
      { locale: 'af-ZA', title: 'Afrikáans' },
      { locale: 'am-ET', title: 'Amárico' },
    ],
  },
];

const FLAT_LOCALE_PRESETS: { locale: string; title: string; group: string }[] = LOCALE_PRESET_GROUPS.flatMap((g) =>
  g.items.map((it) => ({ ...it, group: g.label })),
);

function manifestMap(manifest: ManifestEntry[] | null | undefined): Record<string, ManifestEntry> {
  const m: Record<string, ManifestEntry> = {};
  if (!Array.isArray(manifest)) return m;
  for (const e of manifest) {
    if (e?.locale) m[e.locale] = e;
  }
  return m;
}

/** Etiqueta por defecto del idioma base en panel público y admin. */
const DEFAULT_ES_MANIFEST_LABEL = 'Español';

function defaultManifestDisplayLabel(locale: string, manifestLabel?: string | null): string {
  const t = (manifestLabel ?? '').trim();
  if (t) return t;
  if (locale === 'es-ES') return DEFAULT_ES_MANIFEST_LABEL;
  return locale;
}

/** Manifest completo para PATCH `/menu-translations/menus/:id/settings` (reemplaza el JSON en BD). */
function buildTranslationManifestPayload(
  m: MenuRow,
  localePatch?: { locale: string; enabledPublic: boolean },
): Array<{ locale: string; label?: string; flagCode?: string; enabledPublic?: false }> {
  const mm = manifestMap(m.translationManifest);
  const sortedLocales = [...(m.locales || [])].sort((a, b) => {
    if (a === 'es-ES') return -1;
    if (b === 'es-ES') return 1;
    return a.localeCompare(b);
  });
  return sortedLocales.map((locale) => {
    const loc = locale.trim();
    const rawLabel =
      locale === 'es-ES'
        ? (mm[locale]?.label?.trim() || DEFAULT_ES_MANIFEST_LABEL)
        : (mm[locale]?.label || '').trim();
    const label = loc === 'es-ES' ? rawLabel || DEFAULT_ES_MANIFEST_LABEL : rawLabel || undefined;
    let fc = ((mm[locale]?.flagCode ?? '') as string).trim().toUpperCase();
    if (locale === 'es-ES' && (!fc || !MENU_FLAG_CODE_RE.test(fc))) fc = 'ES';
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
    if (!q) return FLAT_LOCALE_PRESETS;
    return FLAT_LOCALE_PRESETS.filter(
      (it) =>
        it.title.toLowerCase().includes(q) ||
        it.locale.toLowerCase().includes(q) ||
        it.group.toLowerCase().includes(q),
    );
  }, [addLocaleSearch]);

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
        showAlertMsg('Error', 'No se pudieron cargar los restaurantes.', 'error');
        setRestaurants([]);
      }
    },
    [isSuperAdmin, showAlertMsg],
  );

  useEffect(() => {
    if (!user) return;
    setLoadingPage(false);
    void loadRestaurants();
  }, [user, loadRestaurants]);

  const loadMenus = useCallback(async () => {
    if (!selectedRestaurantId || !canAccessPage) {
      setMenus([]);
      return;
    }
    if (isSuperAdmin && !tenantIdForApi) {
      setMenus([]);
      showAlertMsg('Tenant no disponible', 'Elegí un restaurante válido (con cuenta asociada).', 'warning');
      return;
    }
    setLoadingMenus(true);
    try {
      const params: Record<string, string> = { restaurantId: selectedRestaurantId };
      if (isSuperAdmin && tenantIdForApi) params.tenantId = tenantIdForApi;
      const res = await api.get('/menu-translations/menus', { params });
      setMenus(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Error al cargar menús';
      showAlertMsg('Traducciones', String(msg), 'error');
      setMenus([]);
    } finally {
      setLoadingMenus(false);
    }
  }, [selectedRestaurantId, canAccessPage, isSuperAdmin, tenantIdForApi, showAlertMsg]);

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

  const deleteMenuLocale = useCallback(
    async (m: MenuRow, locale: string) => {
      if (locale === 'es-ES') return;
      if (
        !window.confirm(
          `¿Eliminar el idioma «${locale}» y todas sus traducciones de este menú? Esta acción no se puede deshacer.`,
        )
      ) {
        return;
      }
      setDeleteLocaleBusy({ menuId: m.id, locale });
      try {
        const params: Record<string, string> = { locale };
        if (isSuperAdmin && tenantIdForApi) params.tenantId = tenantIdForApi;
        await api.delete(`/menu-translations/menus/${m.id}/locales`, { params });
        showAlertMsg('Idioma eliminado', `Se quitó ${locale} del menú.`, 'success');
        await loadMenus();
      } catch (e: unknown) {
        const msg =
          (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (e as Error)?.message ||
          'Error';
        showAlertMsg('Eliminar idioma', String(msg), 'error');
      } finally {
        setDeleteLocaleBusy(null);
      }
    },
    [isSuperAdmin, tenantIdForApi, loadMenus, showAlertMsg],
  );

  const submitAddLocale = async () => {
    if (!addMenuId) return;
    const rawLocale =
      addLocalePreset === ADD_LOCALE_CUSTOM ? addLocaleCustom : addLocalePreset;
    const locale = normalizeMenuLocaleInput(rawLocale);
    if (!locale) {
      showAlertMsg('Idioma', 'Elegí un idioma de la lista o escribí un código BCP-47.', 'warning');
      return;
    }
    if (!MENU_LOCALE_BCP47_RE.test(locale)) {
      showAlertMsg(
        'Idioma',
        'Código no válido. Usá al menos idioma + región u otro subtag (ej. en-US, es-MX, zh-CN, fil-PH).',
        'warning',
      );
      return;
    }
    if (locale === 'es-ES') {
      showAlertMsg('Idioma', 'es-ES ya es el idioma base del menú.', 'warning');
      return;
    }
    const fc = addFlag.trim().toUpperCase();
    if (fc && !MENU_FLAG_CODE_RE.test(fc)) {
      showAlertMsg(
        'Bandera / etiqueta',
        'Usá 2–10 letras o números (ej. ES, US, CAT). Para emoji de país usá el código ISO de 2 letras.',
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
      showAlertMsg('Listo', 'Idioma agregado. Podés abrir el editor para afinar las traducciones.', 'success');
      await loadMenus();
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Error';
      showAlertMsg('Agregar idioma', String(msg), 'error');
    } finally {
      setAddSaving(false);
    }
  };

  const openSettings = (m: MenuRow) => {
    setSettingsMenu(m);
    setSettingsName(m.name || '');
    const mm = manifestMap(m.translationManifest);
    const sortedLocales = [...(m.locales || [])].sort((a, b) => {
      if (a === 'es-ES') return -1;
      if (b === 'es-ES') return 1;
      return a.localeCompare(b);
    });
    setSettingsManifestRows(
      sortedLocales.map((locale) => ({
        locale,
        label:
          locale === 'es-ES'
            ? (mm[locale]?.label?.trim() || DEFAULT_ES_MANIFEST_LABEL)
            : mm[locale]?.label || '',
        flagCode:
          locale === 'es-ES'
            ? (mm[locale]?.flagCode || 'ES')
            : mm[locale]?.flagCode || regionFromLocale(locale) || '',
        enabledPublic: mm[locale]?.enabledPublic !== false,
      })),
    );
    const renameCandidates = sortedLocales.filter((l) => l !== 'es-ES');
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
          'Bandera / etiqueta',
          `Código inválido para ${r.locale}: 2–10 caracteres alfanuméricos (ej. ES, CAT).`,
          'warning',
        );
        return;
      }
    }
    setSettingsSaving(true);
    try {
      const body: any = { name: settingsName.trim() };
      const manifest = settingsManifestRows
        .filter((r) => r.locale && r.locale.trim())
        .map((r) => {
          const loc = r.locale.trim();
          const rawLabel = (r.label || '').trim();
          const label = loc === 'es-ES' ? rawLabel || DEFAULT_ES_MANIFEST_LABEL : rawLabel || undefined;
          let fc = (r.flagCode || '').trim().toUpperCase();
          if (loc === 'es-ES' && (!fc || !MENU_FLAG_CODE_RE.test(fc))) fc = 'ES';
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
            'Código de idioma',
            'El nuevo código debe ser BCP-47 válido (ej. en-US, es-MX, zh-CN).',
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
      showAlertMsg('Guardado', 'Ajustes del menú actualizados.', 'success');
      await loadMenus();
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Error';
      showAlertMsg('Ajustes', String(msg), 'error');
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
          'Error';
        showAlertMsg('Menú público', String(msg), 'error');
      } finally {
        setLocaleToggleKey(null);
      }
    },
    [isSuperAdmin, tenantIdForApi, loadMenus, showAlertMsg],
  );

  useEffect(() => {
    setAutoLocalePick((prev) => {
      const next = { ...prev };
      for (const m of menus) {
        if (!next[m.id]) {
          const f = (m.locales || []).find((l) => l !== 'es-ES');
          if (f) next[m.id] = f;
        }
      }
      return next;
    });
  }, [menus]);

  const runMenuAutoTranslate = useCallback(
    async (m: MenuRow) => {
      const loc =
        autoLocalePick[m.id] || (m.locales || []).find((l) => l !== 'es-ES');
      if (!loc) {
        showAlertMsg('Traducción automática', 'Agregá al menos un idioma distinto de es-ES.', 'warning');
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
          showAlertMsg('Traducción automática', st.reason || 'No se puede ejecutar.', 'warning');
          return;
        }
        const extra = st.monthlyLimit != null ? ` Usos este mes: ${st.monthlyUsed}/${st.monthlyLimit}.` : '';
        if (
          !window.confirm(
            `Se traducirá el menú desde español a ${loc}.${force ? ' Modo forzar: consume un uso aunque el menú ya tenga traducción automática previa.' : ''}${extra} ¿Continuar?`,
          )
        ) {
          return;
        }
        const body: Record<string, unknown> = { targetLocale: loc, force };
        if (isSuperAdmin && tenantIdForApi) body.tenantId = tenantIdForApi;
        const res = await api.post(`/menu-translations/menus/${m.id}/auto-translate`, body);
        const d = res.data as { segmentCount?: number; apiUnits?: number; cacheHits?: number };
        showAlertMsg(
          'Traducción automática',
          `Listo: ${d.segmentCount ?? 0} segmentos. Llamadas nuevas a la API: ${d.apiUnits ?? 0}. Reutilizados desde caché: ${d.cacheHits ?? 0}.`,
          'success',
        );
        await loadMenus();
      } catch (e: unknown) {
        const msg =
          (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (e as Error)?.message ||
          'Error';
        showAlertMsg('Traducción automática', String(msg), 'error');
      } finally {
        setAutoBusyMenuId(null);
      }
    },
    [autoLocalePick, autoForce, isSuperAdmin, tenantIdForApi, loadMenus, showAlertMsg],
  );

  const openWorkbench = async (menuId: string, locale: string) => {
    if (locale === 'es-ES') {
      showAlertMsg(
        'Idioma base',
        'El español (es-ES) se edita desde la sección Menús. Acá solo se traduce a otros idiomas.',
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
      const msg = e?.response?.data?.message || e?.message || 'Error';
      showAlertMsg('Editor', String(msg), 'error');
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
      showAlertMsg('Guardado', 'Traducciones guardadas.', 'success');
      setBenchOpen(false);
      await loadMenus();
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Error';
      showAlertMsg('Guardar', String(msg), 'error');
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
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!canAccessPage) {
    return (
      <AdminLayout>
        <div className="py-4">
          <h1 className="h3 mb-3">Traducciones</h1>
          <div className="alert alert-info">
            Las traducciones de menú están disponibles en planes <strong>Pro</strong> y{' '}
            <strong>Pro Team</strong>. Podés revisar o cambiar tu plan en{' '}
            <Link href="/admin/profile/subscription">Mi perfil → Suscripción</Link>.
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="py-3">
        <h1 className="h3 mb-2">Traducciones</h1>
        <p className="text-muted small mb-4">
          Gestioná idiomas por menú: banderas, editor por idioma y corrección del código BCP-47 si hubo un error al
          crear el idioma. Usá el interruptor <strong>Menú público</strong> en cada idioma para mostrarlo u ocultarlo en
          la carta QR (sigue disponible en el editor aunque esté oculto). En planes <strong>Pro</strong>,{' '}
          <strong>Pro Team</strong> y <strong>Premium</strong> aparece <strong>Traducción automática (beta)</strong>{' '}
          por menú (límite mensual por usuario según límites de planes).
        </p>

        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <label className="form-label">Restaurante</label>
            {isSuperAdmin && (
              <div className="input-group mb-2">
                <input
                  className="form-control"
                  placeholder="Buscar por nombre…"
                  value={restaurantSearch}
                  onChange={(e) => setRestaurantSearch(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => void loadRestaurants(restaurantSearch)}
                >
                  Buscar
                </button>
              </div>
            )}
            <select
              className="form-select"
              value={selectedRestaurantId}
              onChange={(e) => setSelectedRestaurantId(e.target.value)}
            >
              <option value="">Elegí un restaurante…</option>
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
          <p className="text-muted">Seleccioná un restaurante para ver sus menús.</p>
        ) : loadingMenus ? (
          <div className="text-center py-5">
            <div className="spinner-border spinner-border-sm" />
          </div>
        ) : menus.length === 0 ? (
          <p className="text-muted">No hay menús en este restaurante.</p>
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
                            Agregar idioma
                          </button>
                          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => openSettings(m)}>
                            Nombre e idiomas
                          </button>
                        </div>
                      </div>
                      <div className="d-flex flex-wrap align-items-stretch gap-2 mt-3">
                        {(m.locales || []).map((loc) => {
                          const meta = mm[loc];
                          const isBase = loc === 'es-ES';
                          const visiblePublic = meta?.enabledPublic !== false;
                          const toggleBusy = localeToggleKey === `${m.id}:${loc}`;
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
                                {!isBase && (m.autoTranslatedLocales || []).includes(loc) && (
                                  <span className="badge bg-info text-dark ms-1" title="Traducción automática ya ejecutada para este idioma">
                                    Auto
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
                                  title="Si está apagado, el idioma no aparece en la carta pública (sí en el editor)"
                                  onChange={(e) => void toggleLocaleVisibleOnPublicMenu(m, loc, e.target.checked)}
                                />
                                <label className="form-check-label small" htmlFor={`public-${m.id}-${loc}`}>
                                  Menú público
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
                                      Traducir
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-link btn-sm p-0 text-danger"
                                      disabled={
                                        !!deleteLocaleBusy &&
                                        deleteLocaleBusy.menuId === m.id &&
                                        deleteLocaleBusy.locale === loc
                                      }
                                      onClick={() => void deleteMenuLocale(m, loc)}
                                    >
                                      {deleteLocaleBusy?.menuId === m.id && deleteLocaleBusy?.locale === loc
                                        ? 'Borrando…'
                                        : 'Borrar idioma'}
                                    </button>
                                  </>
                                ) : (
                                  <Link href="/admin/menus" className="btn btn-link btn-sm p-0">
                                    Editar base
                                  </Link>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {canAccessPage && (m.locales || []).some((l) => l !== 'es-ES') && (
                        <div className="mt-3 pt-3 border-top">
                          <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                            <h3 className="h6 text-muted mb-0">Traducción automática (beta)</h3>
                          </div>
                          <p className="small text-muted mb-2">
                            Traduce todos los textos desde <strong>es-ES</strong> al idioma elegido. El consumo mensual
                            depende de tu plan. Podés editar después a mano en «Traducir».
                          </p>
                          <div className="row g-2 align-items-end">
                            <div className="col-md-4">
                              <label className="form-label small mb-0">Idioma destino</label>
                              <select
                                className="form-select form-select-sm"
                                value={autoLocalePick[m.id] || (m.locales || []).find((l) => l !== 'es-ES') || ''}
                                onChange={(e) =>
                                  setAutoLocalePick((prev) => ({ ...prev, [m.id]: e.target.value }))
                                }
                              >
                                {(m.locales || [])
                                  .filter((l) => l !== 'es-ES')
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
                                  Forzar retraducción (consume un uso aunque ya se haya traducido)
                                </label>
                              </div>
                            </div>
                            <div className="col-md-4">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary w-100"
                                disabled={autoBusyMenuId === m.id}
                                onClick={() => void runMenuAutoTranslate(m)}
                              >
                                {autoBusyMenuId === m.id ? 'Procesando…' : 'Traducir automáticamente'}
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
      </div>

      {addOpen && addMenuId && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }} role="dialog">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Agregar idioma</h5>
                <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setAddOpen(false)} />
              </div>
              <div className="modal-body">
                <p className="small text-muted">
                  Se copiarán los textos actuales en español como punto de partida. Después podés refinarlas en el
                  editor.
                </p>
                <div className="mb-3">
                  <label className="form-label">Idioma (BCP-47)</label>
                  <input
                    type="search"
                    className="form-control form-control-sm mb-2"
                    placeholder="Buscar por nombre o código (ej. catal, ca-ES)…"
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
                        <div className="p-3 small text-muted">Sin coincidencias. Usá «Otro» abajo.</div>
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
                        Otro… (código BCP-47 manual)
                      </button>
                    </div>
                  </div>
                  {addLocalePreset !== ADD_LOCALE_CUSTOM && (
                    <p className="form-text small text-muted mb-0 mt-1">
                      Seleccionado: <strong>{addLocalePreset}</strong>
                    </p>
                  )}
                </div>
                {addLocalePreset === ADD_LOCALE_CUSTOM && (
                  <div className="mb-3">
                    <label className="form-label">Código BCP-47 manual</label>
                    <input
                      className="form-control font-monospace"
                      value={addLocaleCustom}
                      onChange={(e) => {
                        const v = e.target.value;
                        setAddLocaleCustom(v);
                        const n = normalizeMenuLocaleInput(v);
                        if (n) setAddFlag(suggestedFlagCodeFromLocale(n));
                      }}
                      placeholder="ej. sr-Latn-RS, zh-Hans-CN, lb-LU"
                    />
                    <p className="form-text small text-muted mb-0">
                      Idioma en minúsculas y subtags separados por guiones. Si no está en la lista, podés pegar el
                      código exacto que necesites (respetando el límite de caracteres del servidor).
                    </p>
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label">Etiqueta en panel (opcional)</label>
                  <input
                    className="form-control"
                    value={addLabel}
                    onChange={(e) => setAddLabel(e.target.value)}
                    placeholder="Ej. English"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Código país para bandera (opcional, ISO 3166-1, 2 letras)</label>
                  <input
                    className="form-control"
                    maxLength={10}
                    value={addFlag}
                    onChange={(e) => setAddFlag(e.target.value.toUpperCase())}
                    placeholder="ES, US o CAT…"
                  />
                  <p className="form-text small text-muted mb-0">
                    <strong>2 letras ISO</strong> (ej. ES) = emoji de bandera. <strong>Más caracteres</strong> (ej. CAT)
                    = insignia de texto en el panel y carta. Podés dejar vacío y se usará la región del BCP-47 si
                    aplica.
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
                    Mostrar este idioma en el menú público (carta QR)
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setAddOpen(false)}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-primary" disabled={addSaving} onClick={() => void submitAddLocale()}>
                  {addSaving ? 'Guardando…' : 'Agregar'}
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
                <h5 className="modal-title">Nombre del menú e idiomas</h5>
                <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setSettingsOpen(false)} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Nombre del menú (canónico / español base)</label>
                  <input className="form-control" value={settingsName} onChange={(e) => setSettingsName(e.target.value)} />
                </div>
                <hr />
                <h6 className="text-muted">Etiqueta y bandera por idioma</h6>
                <p className="small text-muted">
                  Ajustá cómo se muestra cada idioma en el panel y en el menú público. Incluye el idioma base (es-ES);
                  por defecto se muestra como «{DEFAULT_ES_MANIFEST_LABEL}». El código de país debe ser ISO de 2 letras
                  (US, ES, IT…).                   Para <code>ca-ES</code> podés usar <strong>ES</strong> (bandera) o una etiqueta como <strong>CAT</strong>.
                  Desmarcá «Visible en menú público» para ocultar un idioma en la carta (sigue disponible en el editor).
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
                      <label className="form-label small">Etiqueta</label>
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
                      <label className="form-label small">Código país (bandera)</label>
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
                          Visible en menú público
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
                <hr />
                <h6 className="text-muted">Corregir código de idioma (BCP-47)</h6>
                <p className="small text-muted">
                  Si creaste por error <code>it-IT</code> pero el contenido es inglés, renombrá a <code>en-US</code>.
                  No afecta al idioma base <code>es-ES</code>.
                </p>
                <div className="row g-2">
                  <div className="col-md-4">
                    <label className="form-label small">Idioma actual</label>
                    <select
                      className="form-select form-select-sm"
                      value={renameFrom}
                      onChange={(e) => setRenameFrom(e.target.value)}
                    >
                      <option value="">—</option>
                      {settingsManifestRows
                        .filter((r) => r.locale !== 'es-ES')
                        .map((r) => (
                          <option key={r.locale} value={r.locale}>
                            {r.locale}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small">Nuevo código</label>
                    <input
                      className="form-control form-control-sm"
                      placeholder="en-US"
                      value={renameTo}
                      onChange={(e) => setRenameTo(e.target.value)}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small">Etiqueta</label>
                    <input
                      className="form-control form-control-sm"
                      value={renameLabel}
                      onChange={(e) => setRenameLabel(e.target.value)}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small">País</label>
                    <input
                      className="form-control form-control-sm"
                      maxLength={10}
                      value={renameFlag}
                      onChange={(e) => setRenameFlag(e.target.value.toUpperCase())}
                      placeholder="ES o CAT"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setSettingsOpen(false)}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-primary" disabled={settingsSaving} onClick={() => void saveSettings()}>
                  {settingsSaving ? 'Guardando…' : 'Guardar'}
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
                  Traducir — <span className="text-muted">{benchLocale}</span>
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Cerrar"
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
                        Hay textos marcados como <strong>desactualizados</strong>: cambió el contenido en español
                        (base) después de la última traducción. Revisalos y guardá para confirmar que siguen siendo
                        correctos en {benchLocale}.
                      </div>
                    )}
                    <div className="mb-4 p-3 border rounded bg-light">
                      <h6 className="text-muted small text-uppercase">Menú</h6>
                      <div className="mb-2">
                        <label className="form-label small d-flex align-items-center gap-2 flex-wrap">
                          Nombre
                          {benchMenuStale.name && (
                            <span className="badge bg-warning text-dark">Desactualizado</span>
                          )}
                        </label>
                        <input className="form-control" value={benchMenuName} onChange={(e) => setBenchMenuName(e.target.value)} />
                      </div>
                      <div>
                        <label className="form-label small d-flex align-items-center gap-2 flex-wrap">
                          Descripción
                          {benchMenuStale.description && (
                            <span className="badge bg-warning text-dark">Desactualizado</span>
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
                          <h6 className="mb-0">Sección</h6>
                          <span className="small text-muted">(referencia: {sec.baseName})</span>
                          {sec.nameStale && (
                            <span className="badge bg-warning text-dark small">Nombre desactualizado</span>
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
                                Ref: {it.baseName}
                                {it.baseDescription ? ` — ${it.baseDescription.slice(0, 80)}${it.baseDescription.length > 80 ? '…' : ''}` : ''}
                              </div>
                              <label className="form-label small mb-0 d-flex align-items-center gap-2 flex-wrap">
                                Nombre
                                {it.nameStale && (
                                  <span className="badge bg-warning text-dark">Desactualizado</span>
                                )}
                              </label>
                              <input
                                className="form-control form-control-sm mb-2"
                                value={it.name}
                                onChange={(e) => updateItem(it.id, { name: e.target.value })}
                              />
                              <label className="form-label small mb-0 d-flex align-items-center gap-2 flex-wrap">
                                Descripción
                                {it.descriptionStale && (
                                  <span className="badge bg-warning text-dark">Desactualizado</span>
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
                  Cerrar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={benchLoading || benchSaving}
                  onClick={() => void saveWorkbench()}
                >
                  {benchSaving ? 'Guardando…' : 'Guardar traducciones'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
