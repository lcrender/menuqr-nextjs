import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Trans, useTranslation } from 'react-i18next';
import api from '../../lib/axios';
import {
  TEMPLATE_CONFIG_SCHEMAS,
  buildTemplateConfigDefaults,
  type TemplateConfigOption,
} from '../../lib/template-config-schema';
import { TEMPLATES_CATALOG } from '../../lib/templates-catalog';
import { translateTemplateName } from '../../lib/template-config-i18n';
import { googleFontCatalogStylesheetHref } from '../../lib/template-google-fonts';
import {
  BEACH_BAR_BACKGROUNDS,
  DEFAULT_BEACH_BAR_BACKGROUND_ID,
} from '../../lib/beach-bar-template';
import {
  BURGERS_BACKGROUNDS,
  DEFAULT_BURGERS_BACKGROUND_ID,
} from '../../lib/burgers-template';
import PreviewTemplateConfigField from '../preview/PreviewTemplateConfigField';
import BackgroundThumbPicker from './BackgroundThumbPicker';
import FontPicker from './FontPicker';
import FontSizeStepper from './FontSizeStepper';
import MenuTemplatePreview from './MenuTemplatePreview';
import VisualCommerceEditDialog, {
  type CommerceEditKind,
} from './VisualCommerceEditDialog';
import {
  detectVisualHit,
  elementsForSelectionKey,
  focusForHit,
  FONT_SIZE_OPTION_IDS,
  groupForOption,
  hitTestVeAttrAtPoint,
  selectionKey,
  type VisualEditorGroupId,
  type VisualHit,
} from '../../lib/visual-editor-groups';
import styles from './VisualDesignEditor.module.css';

const COMMERCE_EDIT_HITS = new Set<VisualHit>(['name', 'description', 'logo', 'cover']);

function revokeIfBlob(url: string | null | undefined) {
  if (url && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      /* noop */
    }
  }
}

function backgroundPresetsForTemplate(templateId: string) {
  if (templateId === 'burgers') {
    return {
      presets: BURGERS_BACKGROUNDS,
      defaultId: DEFAULT_BURGERS_BACKGROUND_ID,
    };
  }
  return {
    presets: BEACH_BAR_BACKGROUNDS,
    defaultId: DEFAULT_BEACH_BAR_BACKGROUND_ID,
  };
}

type MenuSummary = { id: string; name: string; slug: string; description?: string; status?: string };

type MenuSection = {
  id: string;
  name: string;
  sort?: number;
  items: Array<{
    id: string;
    name: string;
    description?: string;
    prices: Array<{ currency: string; label?: string; amount: number }>;
    icons: string[];
    photos: string[];
    highlighted: boolean;
  }>;
};

type Selection = { hit: VisualHit; classKey: string; index: number };

const GROUPS: VisualEditorGroupId[] = ['styles', 'colors', 'typography', 'header', 'background', 'elements'];

function asArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)) {
    return (data as { data: T[] }).data;
  }
  return [];
}

function itemIsHighlighted(item: { highlighted?: unknown; extra?: { highlighted?: unknown } | null }): boolean {
  if (item?.highlighted === true) return true;
  if (item?.extra && typeof item.extra === 'object' && item.extra.highlighted === true) return true;
  return false;
}

function mapItemPhotos(photosRaw: unknown): string[] {
  if (!Array.isArray(photosRaw)) return [];
  return photosRaw
    .map((photo: unknown) => {
      if (typeof photo === 'string') return photo;
      if (photo && typeof photo === 'object' && typeof (photo as { url?: unknown }).url === 'string') {
        return (photo as { url: string }).url;
      }
      return null;
    })
    .filter((url: string | null): url is string => Boolean(url));
}

function planAllowsPaidTemplates(plan: string | null | undefined, isSuperAdmin: boolean): boolean {
  if (isSuperAdmin) return true;
  const normalized = (plan || '').toLowerCase().replace(/[\s-]+/g, '_');
  return normalized === 'pro' || normalized === 'pro_team' || normalized === 'premium';
}

function hexColor(value: unknown, fallback: string): string {
  return typeof value === 'string' && /^#[0-9A-Fa-f]{6}$/.test(value) ? value : fallback;
}

function configsEqual(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

type StoredDraft = {
  template: string;
  config: Record<string, unknown>;
  menuId?: string | null;
  name?: string;
  description?: string;
};

function draftStorageKey(restaurantId: string): string {
  return `menuqr.visualDraft.${restaurantId}`;
}

function readStoredDraft(restaurantId: string): StoredDraft | null {
  try {
    const raw = sessionStorage.getItem(draftStorageKey(restaurantId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredDraft;
    if (!parsed || typeof parsed.template !== 'string' || !parsed.config || typeof parsed.config !== 'object') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeStoredDraft(restaurantId: string, draft: StoredDraft) {
  try {
    sessionStorage.setItem(draftStorageKey(restaurantId), JSON.stringify(draft));
  } catch {
    /* Si el navegador rechaza el guardado, el borrador sigue en memoria. */
  }
}

function clearStoredDraft(restaurantId: string) {
  try {
    sessionStorage.removeItem(draftStorageKey(restaurantId));
  } catch {
    /* noop */
  }
}

type Props = { restaurantId: string };

export default function VisualDesignEditor({ restaurantId }: Props) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const stageRef = useRef<HTMLDivElement>(null);
  const dirtyRef = useRef(false);
  const leaveMessageRef = useRef('');
  const restaurantIdRef = useRef(restaurantId);
  const draftLogoBlobRef = useRef<string | null>(null);
  const draftCoverBlobRef = useRef<string | null>(null);
  restaurantIdRef.current = restaurantId;

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [restaurant, setRestaurant] = useState<Record<string, any> | null>(null);
  const [menus, setMenus] = useState<MenuSummary[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [hasPaidTemplates, setHasPaidTemplates] = useState(false);

  const [savedTemplate, setSavedTemplate] = useState('classic');
  const [savedConfig, setSavedConfig] = useState<Record<string, unknown>>({});
  const [draftTemplate, setDraftTemplate] = useState('classic');
  const [draftConfig, setDraftConfig] = useState<Record<string, unknown>>({});

  const [savedName, setSavedName] = useState('');
  const [savedDescription, setSavedDescription] = useState('');
  const [savedLogoUrl, setSavedLogoUrl] = useState<string | null>(null);
  const [savedCoverUrl, setSavedCoverUrl] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [draftLogoUrl, setDraftLogoUrl] = useState<string | null>(null);
  const [draftCoverUrl, setDraftCoverUrl] = useState<string | null>(null);
  const [draftLogoFile, setDraftLogoFile] = useState<File | null>(null);
  const [draftCoverFile, setDraftCoverFile] = useState<File | null>(null);

  const [group, setGroup] = useState<VisualEditorGroupId | null>('styles');
  const [focusedOptionId, setFocusedOptionId] = useState<string | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [hit, setHit] = useState<VisualHit | null>(null);
  const [commerceEdit, setCommerceEdit] = useState<CommerceEditKind | null>(null);
  const [viewport, setViewport] = useState<'phone' | 'desktop'>('phone');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<string | null>(null);
  const [proBlockedName, setProBlockedName] = useState<string | null>(null);
  const [slugChoiceOpen, setSlugChoiceOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState('');

  const tx = (key: string, fallback: string) => t(key, { defaultValue: fallback });

  leaveMessageRef.current = tx(
    'adminTemplates.visual.leaveConfirm',
    'Tenés cambios sin publicar. Si salís ahora, se pierden.',
  );

  const profileDirty =
    draftName !== savedName ||
    draftDescription !== savedDescription ||
    !!draftLogoFile ||
    !!draftCoverFile;
  const dirty =
    !!restaurant &&
    (draftTemplate !== savedTemplate || !configsEqual(draftConfig, savedConfig) || profileDirty);
  dirtyRef.current = dirty;

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      event.preventDefault();
      event.returnValue = '';
    };
    const onStart = (url: string) => {
      if (!dirtyRef.current) return;
      const nextPath = url.split(/[?#]/)[0] ?? '';
      const here = (router.asPath.split(/[?#]/)[0] ?? '');
      const sameEditor = nextPath === here;
      if (!sameEditor && window.confirm(leaveMessageRef.current)) {
        clearStoredDraft(restaurantIdRef.current);
        return;
      }
      const cancel = Object.assign(new Error('Route Cancelled'), { cancelled: true });
      router.events.emit('routeChangeError', cancel, url, { shallow: false });
      // Next.js aborta la navegación si el listener lanza. Así el editor no se desmonta.
      throw 'Abort route change. Please ignore this error.';
    };
    const blockPreviewNavigation = (event: MouseEvent) => {
      const root = stageRef.current;
      const target = event.target;
      if (!root || !(target instanceof Element) || !root.contains(target)) return;
      if (target.closest('a')) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (target.closest('button')) event.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('click', blockPreviewNavigation, true);
    router.events.on('routeChangeStart', onStart);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      window.removeEventListener('click', blockPreviewNavigation, true);
      router.events.off('routeChangeStart', onStart);
    };
  }, [router]);

  useEffect(() => {
    return () => {
      revokeIfBlob(draftLogoBlobRef.current);
      revokeIfBlob(draftCoverBlobRef.current);
    };
  }, []);

  useEffect(() => {
    if (loading || !restaurant) return;
    if (!dirty) {
      clearStoredDraft(restaurantId);
      return;
    }
    writeStoredDraft(restaurantId, {
      template: draftTemplate,
      config: draftConfig,
      menuId: selectedMenuId,
      ...(draftName.trim() ? { name: draftName } : {}),
      ...(draftDescription !== savedDescription || draftDescription
        ? { description: draftDescription }
        : {}),
    });
  }, [
    loading,
    restaurant,
    dirty,
    restaurantId,
    draftTemplate,
    draftConfig,
    selectedMenuId,
    draftName,
    draftDescription,
    savedDescription,
  ]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError('');
      try {
        const userRaw = localStorage.getItem('user');
        let isSuperAdmin = false;
        try {
          isSuperAdmin = JSON.parse(userRaw || 'null')?.role === 'SUPER_ADMIN';
        } catch {
          isSuperAdmin = false;
        }
        const [restaurantRes, menusRes, planRes] = await Promise.all([
          api.get(`/restaurants/${restaurantId}`),
          api.get('/menus', { params: { restaurantId } }),
          api.get('/restaurants/dashboard-stats').catch(() => null),
        ]);
        if (cancelled) return;
        const data = restaurantRes.data || {};
        const templateId = String(data.template || 'classic');
        const config = {
          ...(typeof data.templateConfig === 'object' && data.templateConfig ? data.templateConfig : {}),
          ...buildTemplateConfigDefaults(templateId, data.templateConfig, {
            primaryColor: data.primaryColor,
            secondaryColor: data.secondaryColor,
          }),
        };
        const menuRows = asArray<MenuSummary>(menusRes.data);
        const preferred =
          menuRows.find((menu) => menu.status === 'PUBLISHED' || menu.status === 'published') ||
          menuRows[0] ||
          null;
        const stored = readStoredDraft(restaurantId);
        const storedMenuId =
          stored?.menuId && menuRows.some((menu) => menu.id === stored.menuId) ? stored.menuId : null;
        const name = String(data.name || '');
        const description = typeof data.description === 'string' ? data.description : '';
        const logoUrl = typeof data.logoUrl === 'string' ? data.logoUrl : null;
        const coverUrl = typeof data.coverUrl === 'string' ? data.coverUrl : null;
        // No restaurar nombre vacío desde sessionStorage (borra el preview).
        const storedName =
          typeof stored?.name === 'string' && stored.name.trim() ? stored.name.trim() : null;
        const hasStoredDescription = Boolean(stored && Object.prototype.hasOwnProperty.call(stored, 'description'));
        const storedDescription =
          hasStoredDescription && typeof stored?.description === 'string' ? stored.description : null;
        setRestaurant(data);
        setSavedTemplate(templateId);
        setSavedConfig(config);
        setDraftTemplate(stored?.template || templateId);
        setDraftConfig(stored ? { ...config, ...stored.config } : { ...config });
        setSavedName(name);
        setSavedDescription(description);
        setSavedLogoUrl(logoUrl);
        setSavedCoverUrl(coverUrl);
        setDraftName(storedName || name);
        setDraftDescription(storedDescription !== null ? storedDescription : description);
        setDraftLogoUrl(logoUrl);
        setDraftCoverUrl(coverUrl);
        setDraftLogoFile(null);
        setDraftCoverFile(null);
        setMenus(menuRows);
        setSelectedMenuId(storedMenuId || preferred?.id || null);
        setHasPaidTemplates(planAllowsPaidTemplates(planRes?.data?.plan, isSuperAdmin));
      } catch (error: any) {
        if (!cancelled) {
          const status = error?.response?.status;
          setLoadError(
            status === 403 || status === 404
              ? tx('adminTemplates.visual.forbidden', 'No podés editar el diseño de este comercio.')
              : tx('adminTemplates.visual.loadError', 'No se pudo cargar el diseño del comercio.'),
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // La carga inicial depende solo del comercio.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  useEffect(() => {
    if (!selectedMenuId) {
      setSections([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [sectionsRes, itemsRes] = await Promise.all([
          api.get('/menu-sections', { params: { menuId: selectedMenuId } }),
          api.get('/menu-items', { params: { menuId: selectedMenuId } }),
        ]);
        if (cancelled) return;
        const sectionsRaw = asArray<any>(sectionsRes.data).sort(
          (a, b) => (a.sort ?? 999) - (b.sort ?? 999),
        );
        const itemsRaw = asArray<any>(itemsRes.data);
        setSections(
          sectionsRaw.map((section) => ({
            id: section.id,
            name: section.name,
            sort: section.sort,
            items: itemsRaw
              .filter((item) => item.sectionId === section.id || item.section_id === section.id)
              .sort((a, b) => (a.sort ?? 999) - (b.sort ?? 999))
              .map((item) => ({
                id: item.id,
                name: item.name,
                ...(typeof item.description === 'string' && item.description.trim()
                  ? { description: item.description }
                  : {}),
                prices: Array.isArray(item.prices) ? item.prices : [],
                icons: Array.isArray(item.icons) ? item.icons : [],
                photos: mapItemPhotos(item.photos),
                highlighted: itemIsHighlighted(item),
              })),
          })),
        );
      } catch {
        if (!cancelled) setSections([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedMenuId]);

  useEffect(() => {
    const root = stageRef.current;
    if (!root) return;
    root.querySelectorAll('.ve-selected').forEach((node) => node.classList.remove('ve-selected'));
    // Nombre/descripcion/logo/portada abren diálogo: sin contorno persistente.
    if (!selection || COMMERCE_EDIT_HITS.has(selection.hit)) return;
    const nodes = elementsForSelectionKey(root, selection.classKey);
    const el = nodes[selection.index];
    el?.classList.add('ve-selected');
  });

  useEffect(() => {
    if (!focusedOptionId) return;
    document.getElementById(`field-${focusedOptionId}`)?.scrollIntoView({ block: 'nearest' });
  }, [focusedOptionId, group]);

  useEffect(() => {
    if (group !== 'typography') return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = googleFontCatalogStylesheetHref();
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, [group]);

  const schema = TEMPLATE_CONFIG_SCHEMAS[draftTemplate] || TEMPLATE_CONFIG_SCHEMAS.classic || [];
  const optionIds = schema.map((option) => option.id);
  const grouped = useMemo(() => {
    const buckets: Record<VisualEditorGroupId, TemplateConfigOption[]> = {
      styles: [],
      colors: [],
      typography: [],
      header: [],
      background: [],
      elements: [],
    };
    schema.forEach((option) => {
      if (option.restrictToPaidPlans && !hasPaidTemplates) return;
      buckets[groupForOption(option)].push(option);
    });
    return buckets;
  }, [schema, hasPaidTemplates]);

  const selectedMenu = menus.find((menu) => menu.id === selectedMenuId) || null;
  const previewRestaurant = useMemo(() => {
    if (!restaurant) return null;
    // Si el borrador aún está vacío (carrera de carga / sessionStorage), usar el comercio.
    const previewName = draftName.trim() || String(restaurant.name || '');
    const descriptionEdited = draftDescription !== savedDescription;
    const previewDescription = descriptionEdited
      ? draftDescription
      : draftDescription ||
        (typeof restaurant.description === 'string' ? restaurant.description : '');
    const next: Record<string, unknown> = {
      ...restaurant,
      id: String(restaurant.id),
      name: previewName,
      description: previewDescription,
      slug: String(restaurant.slug || 'preview'),
      template: draftTemplate,
      templateConfig: draftConfig,
      primaryColor: hexColor(draftConfig.primaryColor, restaurant.primaryColor || '#007bff'),
      secondaryColor: hexColor(draftConfig.secondaryColor, restaurant.secondaryColor || '#0056b3'),
    };
    if (draftLogoUrl) next.logoUrl = draftLogoUrl;
    else delete next.logoUrl;
    if (draftCoverUrl) next.coverUrl = draftCoverUrl;
    else delete next.coverUrl;
    return next as typeof restaurant & {
      id: string;
      name: string;
      description: string;
      slug: string;
      template: string;
      templateConfig: Record<string, unknown>;
      primaryColor: string;
      secondaryColor: string;
      logoUrl?: string;
      coverUrl?: string;
    };
  }, [
    restaurant,
    draftTemplate,
    draftConfig,
    draftName,
    draftDescription,
    savedDescription,
    draftLogoUrl,
    draftCoverUrl,
  ]);

  const previewMenu = selectedMenu
    ? {
        id: selectedMenu.id,
        name: selectedMenu.name,
        slug: selectedMenu.slug,
        ...(selectedMenu.description ? { description: selectedMenu.description } : {}),
        sections,
      }
    : {
        id: 'empty',
        name: restaurant?.name || 'Menú',
        slug: 'preview',
        sections,
      };

  const updateOption = (id: string, value: unknown) => {
    setDraftConfig((prev) => ({ ...prev, [id]: value }));
    setSaveState('idle');
    setSaveError('');
  };

  const requestTemplate = (templateId: string) => {
    if (templateId === draftTemplate) return;
    const item = TEMPLATES_CATALOG.find((template) => template.id === templateId);
    const locked = Boolean(item?.requiresProOrPremium) && !hasPaidTemplates && templateId !== savedTemplate;
    if (locked) {
      setProBlockedName(item ? translateTemplateName(t, item.id) || item.name : templateId);
      return;
    }
    setPendingTemplate(templateId);
  };

  const confirmTemplate = () => {
    if (!pendingTemplate || !restaurant) return;
    setDraftConfig((prev) => ({
      ...prev,
      ...buildTemplateConfigDefaults(pendingTemplate, prev, {
        primaryColor: typeof prev.primaryColor === 'string' ? prev.primaryColor : restaurant.primaryColor,
        secondaryColor: typeof prev.secondaryColor === 'string' ? prev.secondaryColor : restaurant.secondaryColor,
      }),
    }));
    setDraftTemplate(pendingTemplate);
    setPendingTemplate(null);
    setSaveState('idle');
    setGroup('styles');
  };

  const resetDraft = () => {
    revokeIfBlob(draftLogoBlobRef.current);
    revokeIfBlob(draftCoverBlobRef.current);
    draftLogoBlobRef.current = null;
    draftCoverBlobRef.current = null;
    setDraftTemplate(savedTemplate);
    setDraftConfig(savedConfig);
    setDraftName(savedName);
    setDraftDescription(savedDescription);
    setDraftLogoUrl(savedLogoUrl);
    setDraftCoverUrl(savedCoverUrl);
    setDraftLogoFile(null);
    setDraftCoverFile(null);
    setCommerceEdit(null);
    setSelection(null);
    setHit(null);
    setFocusedOptionId(null);
    setSaveState('idle');
    setSaveError('');
  };

  const requestPublish = () => {
    if (!restaurant || saving) return;
    const nextName = draftName.trim() || savedName;
    const nameChanged = nextName !== savedName.trim();
    if (nameChanged && restaurant.slug) {
      setSlugChoiceOpen(true);
      return;
    }
    void publish({ updateSlug: false });
  };

  const publish = async (opts: { updateSlug: boolean }) => {
    if (!restaurant || saving) return;
    setSlugChoiceOpen(false);
    setSaving(true);
    setSaveError('');
    setSaveState('idle');
    try {
      let nextLogoUrl = draftLogoUrl;
      let nextCoverUrl = draftCoverUrl;

      if (draftLogoFile) {
        const formDataLogo = new FormData();
        formDataLogo.append('file', draftLogoFile);
        const logoRes = await api.post(`/media/restaurants/${restaurantId}/photo`, formDataLogo);
        if (typeof logoRes.data?.url === 'string') nextLogoUrl = logoRes.data.url;
      }
      if (draftCoverFile) {
        const formDataCover = new FormData();
        formDataCover.append('file', draftCoverFile);
        const coverRes = await api.post(`/media/restaurants/${restaurantId}/cover`, formDataCover);
        if (typeof coverRes.data?.url === 'string') nextCoverUrl = coverRes.data.url;
      }

      const primary = hexColor(draftConfig.primaryColor, restaurant.primaryColor || '#007bff');
      const secondary = hexColor(draftConfig.secondaryColor, restaurant.secondaryColor || '#0056b3');
      const templateConfig = { ...draftConfig, primaryColor: primary, secondaryColor: secondary };
      const nextName = draftName.trim() || savedName;
      const nextDescription = draftDescription;
      const nameChanged = nextName !== savedName.trim();
      const payload: Record<string, unknown> = {
        description: nextDescription,
        template: draftTemplate,
        templateConfig,
        primaryColor: primary,
        secondaryColor: secondary,
      };
      if (nameChanged) {
        payload.name = nextName;
        payload.updateSlug = opts.updateSlug;
      }

      const putRes = await api.put(`/restaurants/${restaurantId}`, payload);
      const updated = putRes.data || {};
      const nextSlug =
        typeof updated.slug === 'string' && updated.slug.trim()
          ? updated.slug
          : String(restaurant.slug || '');

      revokeIfBlob(draftLogoBlobRef.current);
      revokeIfBlob(draftCoverBlobRef.current);
      draftLogoBlobRef.current = null;
      draftCoverBlobRef.current = null;

      setDraftConfig(templateConfig);
      setSavedConfig(templateConfig);
      setSavedTemplate(draftTemplate);
      setDraftName(nextName);
      setSavedName(nextName);
      setDraftDescription(nextDescription);
      setSavedDescription(nextDescription);
      setDraftLogoUrl(nextLogoUrl);
      setSavedLogoUrl(nextLogoUrl);
      setDraftCoverUrl(nextCoverUrl);
      setSavedCoverUrl(nextCoverUrl);
      setDraftLogoFile(null);
      setDraftCoverFile(null);
      setRestaurant((prev) =>
        prev
          ? {
              ...prev,
              name: nextName,
              description: nextDescription,
              slug: nextSlug || prev.slug,
              logoUrl: nextLogoUrl,
              coverUrl: nextCoverUrl,
              template: draftTemplate,
              templateConfig,
              primaryColor: primary,
              secondaryColor: secondary,
            }
          : prev,
      );
      setSaveState('saved');
    } catch (error: any) {
      setSaveState('error');
      setSaveError(
        error?.response?.data?.message ||
          tx('adminTemplates.visual.saveError', 'No se pudo publicar. Tus cambios siguen en el editor.'),
      );
    } finally {
      setSaving(false);
    }
  };

  const onPreviewClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const root = stageRef.current;
    if (!root) return;
    const target = event.target as HTMLElement | null;
    if (!target) return;
    const anchor = target.closest('a');
    if (anchor) {
      event.preventDefault();
      event.stopPropagation();
    }
    const control = target.closest('button, input, select, textarea');
    if (control instanceof HTMLButtonElement) {
      event.preventDefault();
    }
    // Nombre sobre portada (Sol & Noche): el degradé deja pasar el clic a la imagen.
    // Preferimos el hit geométrico del nombre si el punto cae dentro de su caja.
    const nameAtPoint = hitTestVeAttrAtPoint(root, event.clientX, event.clientY, 'name');
    if (nameAtPoint && !control) {
      event.preventDefault();
      event.stopPropagation();
      applyHit('name', nameAtPoint, root);
      return;
    }
    const found = detectVisualHit(target, root);
    if (control) {
      if (found) applyHit(found.hit, found.element, root);
      else clearPreviewSelection();
      return;
    }
    if (!found) {
      clearPreviewSelection();
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    applyHit(found.hit, found.element, root);
  };

  const clearPreviewSelection = () => {
    setSelection(null);
    setHit(null);
    setFocusedOptionId(null);
  };

  const applyHit = (nextHit: VisualHit, element: Element, root: HTMLElement) => {
    const classKey = selectionKey(element);
    const index = elementsForSelectionKey(root, classKey).indexOf(element);
    // Comercio: sin outline; el diálogo es el feedback.
    setSelection(
      COMMERCE_EDIT_HITS.has(nextHit)
        ? null
        : { hit: nextHit, classKey, index: Math.max(0, index) },
    );
    setHit(nextHit);
    const focus = focusForHit(nextHit, optionIds);
    setGroup(focus.group);
    setFocusedOptionId(focus.optionId ?? null);
    setSheetOpen(true);
    if (COMMERCE_EDIT_HITS.has(nextHit)) {
      setCommerceEdit(nextHit as CommerceEditKind);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">{tx('adminTemplates.loading', 'Cargando...')}</span>
        </div>
      </div>
    );
  }

  if (loadError || !restaurant || !previewRestaurant) {
    return (
      <div className="admin-card p-4">
        <p>{loadError || tx('adminTemplates.visual.loadError', 'No se pudo cargar el diseño del comercio.')}</p>
        <Link href="/admin/templates" className="admin-btn">
          {tx('adminTemplates.visual.back', 'Volver a Plantillas')}
        </Link>
      </div>
    );
  }

  const statusClass = saveState === 'error'
    ? styles.statusError
    : dirty
      ? styles.statusPending
      : saveState === 'saved'
        ? styles.statusSaved
        : styles.status;
  const statusText = saveState === 'error'
    ? saveError
    : dirty
      ? tx('adminTemplates.visual.pending', 'Cambios sin publicar')
      : saveState === 'saved'
        ? tx('adminTemplates.visual.saved', 'Publicado')
        : tx('adminTemplates.visual.published', 'Sin cambios pendientes');

  const hitNote = hit
    ? tx(
        `adminTemplates.visual.hit.${hit}`,
        'Este ajuste es del comercio: se aplica a todos los elementos iguales y a todos sus menús.',
      )
    : tx(
        'adminTemplates.visual.globalNote',
        'El diseño es del comercio. Al publicarlo, cambia en todos sus menús.',
      );

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.identity}>
          <h1 className={styles.name}>{draftName || restaurant.name}</h1>
          <p className={statusClass}>{saving ? tx('adminTemplates.visual.saving', 'Publicando…') : statusText}</p>
        </div>
        <div className={styles.viewToggle} role="group" aria-label={tx('adminTemplates.visual.viewport', 'Tamaño de vista previa')}>
          <button
            type="button"
            className={viewport === 'phone' ? styles.viewOn : undefined}
            onClick={() => setViewport('phone')}
          >
            {tx('adminTemplates.visual.viewportPhone', 'Móvil')}
          </button>
          <button
            type="button"
            className={viewport === 'desktop' ? styles.viewOn : undefined}
            onClick={() => setViewport('desktop')}
          >
            {tx('adminTemplates.visual.viewportTablet', 'Tablet')}
          </button>
        </div>
        <div className={styles.actions}>
          {restaurant.slug ? (
            <a
              className={`admin-btn ${styles.backLink}`}
              href={`/r/${encodeURIComponent(String(restaurant.slug))}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {tx('adminTemplates.visual.openPublic', 'Ver comercio')}
            </a>
          ) : null}
          <Link href="/admin/templates" className={`admin-btn ${styles.backLink}`}>
            {tx('adminTemplates.visual.back', 'Volver a Plantillas')}
          </Link>
          <button type="button" className="admin-btn" onClick={resetDraft} disabled={!dirty || saving}>
            {tx('adminTemplates.visual.reset', 'Restablecer')}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={requestPublish}
            disabled={!dirty || saving}
          >
            {tx('adminTemplates.visual.save', 'Guardar y publicar')}
          </button>
        </div>
      </div>

      <div className={styles.body}>
        <aside className={`${styles.tools}${sheetOpen ? ` ${styles.toolsOpen}` : ''}`}>
          <button type="button" className={styles.sheetHandle} onClick={() => setSheetOpen((open) => !open)}>
            {sheetOpen
              ? tx('adminTemplates.visual.closeTools', 'Cerrar herramientas')
              : tx('adminTemplates.visual.openTools', 'Editar diseño')}
          </button>
          <div className={styles.accordion}>
            <div className={styles.hintWrap}>
              <p className={styles.hint}>{hitNote}</p>
            </div>
            {GROUPS.map((id) => {
              const open = group === id;
              const hasFields = id === 'styles' || (grouped[id]?.length ?? 0) > 0;
              if (!hasFields) return null;
              return (
                <section key={id} className={styles.accordionItem}>
                  <button
                    type="button"
                    className={`${styles.groupBtn}${open ? ` ${styles.groupOn}` : ''}`}
                    aria-expanded={open}
                    onClick={() => {
                      setGroup(open ? null : id);
                      setSheetOpen(true);
                    }}
                  >
                    {tx(`adminTemplates.visual.groups.${id}`, id)}
                    <span className={styles.chevron} aria-hidden="true" />
                  </button>
                  {open ? (
                    <div className={styles.panel}>
                      {id === 'styles' ? (
                        <div className={styles.templateGrid}>
                          {TEMPLATES_CATALOG.map((template) => {
                            const isPro = Boolean(template.requiresProOrPremium);
                            const selected = template.id === draftTemplate;
                            return (
                              <button
                                key={template.id}
                                type="button"
                                className={`${styles.templateCard}${selected ? ` ${styles.templateOn}` : ''}${isPro ? ` ${styles.templatePro}` : ''}`}
                                onClick={() => requestTemplate(template.id)}
                              >
                                <span className={styles.templateHead}>
                                  <strong>{translateTemplateName(t, template.id) || template.name}</strong>
                                  {isPro ? (
                                    <em className={styles.proBadge}>{tx('adminTemplates.visual.proBadge', 'Pro')}</em>
                                  ) : null}
                                </span>
                                <span>{template.category}</span>
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                      {id === 'typography' ? (
                        <FontPicker
                          value={draftConfig.googleFont}
                          onChange={(fontId) => updateOption('googleFont', fontId)}
                        />
                      ) : null}
                      {grouped[id]
                        .filter((option) => option.id !== 'googleFont')
                        .map((option) =>
                          option.id === 'backgroundId' ? (
                            (() => {
                              const bgCatalog = backgroundPresetsForTemplate(draftTemplate);
                              return (
                            <BackgroundThumbPicker
                              key={option.id}
                              option={option}
                              value={draftConfig.backgroundId}
                              customUrl={draftConfig.backgroundImageUrl}
                              customMediaId={draftConfig.backgroundMediaId}
                              restaurantId={restaurantId}
                              presets={bgCatalog.presets}
                              defaultId={bgCatalog.defaultId}
                              onSelectPreset={(backgroundId) => updateOption('backgroundId', backgroundId)}
                              onCustomUploaded={({ url, mediaId }) => {
                                setDraftConfig((prev) => ({
                                  ...prev,
                                  backgroundId: 'custom',
                                  backgroundImageUrl: url,
                                  backgroundMediaId: mediaId,
                                }));
                                setSaveState('idle');
                                setSaveError('');
                              }}
                              highlighted={focusedOptionId === option.id}
                            />
                              );
                            })()
                          ) : FONT_SIZE_OPTION_IDS.has(option.id) ? (
                            <FontSizeStepper
                              key={option.id}
                              option={option}
                              value={draftConfig[option.id]}
                              onChange={(value) => updateOption(option.id, value)}
                              highlighted={focusedOptionId === option.id}
                            />
                          ) : (
                            <PreviewTemplateConfigField
                              key={option.id}
                              option={option}
                              value={draftConfig[option.id]}
                              onChange={(value) => updateOption(option.id, value)}
                              highlighted={focusedOptionId === option.id}
                              restaurantId={restaurantId}
                            />
                          ),
                        )}
                    </div>
                  ) : null}
                </section>
              );
            })}
          </div>
        </aside>

        <form className={styles.stageWrap} onSubmit={(event) => event.preventDefault()}>
          <div
            ref={stageRef}
            className={`visual-editor-stage ${styles.stage}${viewport === 'phone' ? ` ${styles.stagePhone}` : ''}`}
            onClickCapture={onPreviewClick}
          >
            <MenuTemplatePreview
              restaurant={previewRestaurant}
              menus={menus.length ? menus : [{ id: previewMenu.id, name: previewMenu.name, slug: previewMenu.slug }]}
              selectedMenu={previewMenu}
              locale={i18n.language || 'es-ES'}
              onMenuSelect={(slug) => {
                const found = menus.find((menu) => menu.slug === slug);
                if (found) setSelectedMenuId(found.id);
              }}
            />
          </div>
        </form>
      </div>

      {proBlockedName ? (
        <div className={styles.backdrop} role="presentation">
          <div className={styles.dialog} role="dialog" aria-modal="true">
            <h2>{tx('adminTemplates.visual.proBlockedTitle', 'Este estilo es Pro')}</h2>
            <p>
              <Trans
                i18nKey="adminTemplates.visual.proBlockedMessage"
                values={{ name: proBlockedName }}
                components={{
                  pro: <strong />,
                  premium: <strong />,
                }}
              >
                {proBlockedName} está disponible en los planes <strong>Pro</strong> y <strong>Premium</strong>. Con Free o Starter podés usar el resto de los estilos.
              </Trans>
            </p>
            <div className={styles.dialogActions}>
              <button type="button" className="admin-btn" onClick={() => setProBlockedName(null)}>
                {tx('adminTemplates.visual.templateSwitchCancel', 'Cancelar')}
              </button>
              <Link href="/admin/profile/subscription/checkout?plan=pro" className="admin-btn admin-btn-primary">
                {tx('adminTemplates.visual.proUpgrade', 'Mejorar plan')}
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {pendingTemplate ? (
        <div className={styles.backdrop} role="presentation">
          <div className={styles.dialog} role="dialog" aria-modal="true">
            <h2>{tx('adminTemplates.visual.templateSwitchTitle', 'Cambiar estilo')}</h2>
            <p>
              {tx(
                'adminTemplates.visual.templateSwitchMessage',
                'La vista previa cambia al instante. Se conservan los colores, la fuente y las opciones que las dos plantillas comparten. El menú público no cambia hasta que publiques.',
              )}
            </p>
            <div className={styles.dialogActions}>
              <button type="button" className="admin-btn" onClick={() => setPendingTemplate(null)}>
                {tx('adminTemplates.visual.templateSwitchCancel', 'Cancelar')}
              </button>
              <button type="button" className="admin-btn admin-btn-primary" onClick={confirmTemplate}>
                {tx('adminTemplates.visual.templateSwitchConfirm', 'Cambiar estilo')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {slugChoiceOpen ? (
        <div className={styles.backdrop} role="presentation" onClick={() => !saving && setSlugChoiceOpen(false)}>
          <div
            className={`${styles.dialog} ${styles.dialogWide}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ve-slug-choice-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="ve-slug-choice-title">
              {tx('adminTemplates.visual.slugChoice.title', 'Cambio de nombre y URL')}
            </h2>
            <p>
              <Trans
                i18nKey="adminTemplates.visual.slugChoice.body"
                components={{ strong: <strong /> }}
              >
                Cambiar el nombre puede regenerar la <strong>URL pública</strong>. Los{' '}
                <strong>QR impresos</strong> y enlaces viejos dejarían de funcionar.
              </Trans>
            </p>
            {restaurant.slug ? (
              <p className={styles.slugChoiceUrl}>
                {tx('adminTemplates.visual.slugChoice.currentUrl', 'URL actual:')}{' '}
                <code>{`/r/${String(restaurant.slug)}`}</code>
              </p>
            ) : null}
            <div className={styles.dialogActionsStack}>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                disabled={saving}
                onClick={() => void publish({ updateSlug: false })}
              >
                {tx(
                  'adminTemplates.visual.slugChoice.keepUrl',
                  'Cambiar nombre y mantener la URL (QR siguen funcionando)',
                )}
              </button>
              <button
                type="button"
                className="admin-btn"
                disabled={saving}
                onClick={() => void publish({ updateSlug: true })}
              >
                {tx(
                  'adminTemplates.visual.slugChoice.changeUrl',
                  'Cambiar nombre y también la URL (QR viejos dejan de funcionar)',
                )}
              </button>
              <button
                type="button"
                className="admin-btn"
                disabled={saving}
                onClick={() => setSlugChoiceOpen(false)}
              >
                {tx('adminTemplates.visual.templateSwitchCancel', 'Cancelar')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <VisualCommerceEditDialog
        kind={commerceEdit}
        name={draftName}
        description={draftDescription}
        logoUrl={draftLogoUrl}
        coverUrl={draftCoverUrl}
        onClose={() => {
          setCommerceEdit(null);
          clearPreviewSelection();
        }}
        onSaveText={({ name, description }) => {
          setDraftName(name);
          setDraftDescription(description);
          setSaveState('idle');
          setSaveError('');
        }}
        onLogoFile={(file, previewUrl) => {
          revokeIfBlob(draftLogoBlobRef.current);
          draftLogoBlobRef.current = previewUrl;
          setDraftLogoFile(file);
          setDraftLogoUrl(previewUrl);
          setSaveState('idle');
          setSaveError('');
        }}
        onCoverFile={(file, previewUrl) => {
          revokeIfBlob(draftCoverBlobRef.current);
          draftCoverBlobRef.current = previewUrl;
          setDraftCoverFile(file);
          setDraftCoverUrl(previewUrl);
          setSaveState('idle');
          setSaveError('');
        }}
      />
    </div>
  );
}
