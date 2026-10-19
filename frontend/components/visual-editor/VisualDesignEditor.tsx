import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Trans, useTranslation } from 'react-i18next';
import api from '../../lib/axios';
import { getApiErrorMessage } from '../../lib/api-error-message';
import {
  TEMPLATE_CONFIG_SCHEMAS,
  buildTemplateConfigDefaults,
  type TemplateConfigOption,
} from '../../lib/template-config-schema';
import { TEMPLATES_CATALOG } from '../../lib/templates-catalog';
import { translateTemplateName } from '../../lib/template-config-i18n';
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
import VisualProductEditDialog, {
  type ProductEditDraft,
} from './VisualProductEditDialog';
import VisualFooterEditDialog, {
  type FooterContactDraft,
} from './VisualFooterEditDialog';
import VisualSectionEditDialog, {
  type SectionEditDraft,
} from './VisualSectionEditDialog';
import {
  detectVisualHit,
  elementsForSelectionKey,
  findClosestItemId,
  findClosestSectionId,
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
const NO_OUTLINE_HITS = new Set<VisualHit>([
  'name',
  'description',
  'logo',
  'cover',
  'footer',
  'product',
  'price',
]);

function parseRestaurantContact(data: Record<string, any>): FooterContactDraft {
  const rawPhone = typeof data.phone === 'string' ? data.phone : '';
  let phone = rawPhone;
  let whatsapp = typeof data.whatsapp === 'string' ? data.whatsapp : '';
  if (rawPhone.includes('WhatsApp:')) {
    const match = rawPhone.match(/WhatsApp:\s*(.+?)(?:\s*\|)?$/i);
    const fromPhone = match?.[1]?.trim() ?? '';
    if (!whatsapp) whatsapp = fromPhone;
    phone = rawPhone.split('|')[0]?.replace(/WhatsApp:.*/i, '').trim() || '';
  }
  return {
    address: typeof data.address === 'string' ? data.address : '',
    phone,
    whatsapp,
    email: typeof data.email === 'string' ? data.email : '',
    website: typeof data.website === 'string' ? data.website : '',
  };
}

function contactsEqual(a: FooterContactDraft, b: FooterContactDraft): boolean {
  return (
    a.address === b.address &&
    a.phone === b.phone &&
    a.whatsapp === b.whatsapp &&
    a.email === b.email &&
    a.website === b.website
  );
}

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
  isActive: boolean;
  items: Array<{
    id: string;
    name: string;
    description?: string;
    prices: Array<{ currency: string; label?: string; amount: number }>;
    icons: string[];
    photos: string[];
    highlighted: boolean;
    active: boolean;
  }>;
};

type EditorMode = 'design' | 'content';

function newTempId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function entityId(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return '';
  const id = (payload as { id?: unknown }).id;
  return typeof id === 'string' && id.trim() ? id : '';
}

function isMenuPublished(status: string | undefined | null): boolean {
  const normalized = String(status || '').toUpperCase();
  return normalized === 'PUBLISHED';
}

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

function mapItemPrices(
  pricesRaw: unknown,
): Array<{ currency: string; label?: string; amount: number }> {
  if (!Array.isArray(pricesRaw)) return [];
  return pricesRaw
    .map((price: unknown) => {
      if (!price || typeof price !== 'object') return null;
      const row = price as { currency?: unknown; label?: unknown; amount?: unknown };
      const currency = typeof row.currency === 'string' ? row.currency : '';
      if (!currency) return null;
      const amountRaw = row.amount;
      const amount =
        typeof amountRaw === 'number'
          ? amountRaw
          : typeof amountRaw === 'string'
            ? Number(amountRaw)
            : NaN;
      if (!Number.isFinite(amount)) return null;
      return {
        currency,
        amount,
        ...(typeof row.label === 'string' && row.label.trim() ? { label: row.label } : {}),
      };
    })
    .filter(
      (price): price is { currency: string; label?: string; amount: number } => Boolean(price),
    );
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
  const productPhotoBlobRef = useRef<Record<string, string>>({});
  const productDragIdRef = useRef<string | null>(null);
  const productDidDragRef = useRef(false);
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
  const emptyContact: FooterContactDraft = {
    address: '',
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
  };
  const [savedContact, setSavedContact] = useState<FooterContactDraft>(emptyContact);
  const [draftContact, setDraftContact] = useState<FooterContactDraft>(emptyContact);

  const [group, setGroup] = useState<VisualEditorGroupId | null>('styles');
  const [focusedOptionId, setFocusedOptionId] = useState<string | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [hit, setHit] = useState<VisualHit | null>(null);
  const [commerceEdit, setCommerceEdit] = useState<CommerceEditKind | null>(null);
  const [footerEditOpen, setFooterEditOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [productDrafts, setProductDrafts] = useState<Record<string, ProductEditDraft>>({});
  const [sectionDrafts, setSectionDrafts] = useState<Record<string, SectionEditDraft>>({});
  /** Orden de productos por sección (ids). Solo si el usuario reordenó. */
  const [productOrderDrafts, setProductOrderDrafts] = useState<Record<string, string[]>>({});
  const [menuDrafts, setMenuDrafts] = useState<Record<string, { name: string }>>({});
  const [editorMode, setEditorMode] = useState<EditorMode>('design');
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
    !!draftCoverFile ||
    !contactsEqual(draftContact, savedContact);
  const productDirty = Object.keys(productDrafts).length > 0;
  const sectionDirty = Object.keys(sectionDrafts).length > 0;
  const menuDirty = Object.keys(menuDrafts).length > 0;
  const orderDirty = Object.keys(productOrderDrafts).length > 0;
  const dirty =
    !!restaurant &&
    (draftTemplate !== savedTemplate ||
      !configsEqual(draftConfig, savedConfig) ||
      profileDirty ||
      productDirty ||
      sectionDirty ||
      menuDirty ||
      orderDirty);
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
      Object.values(productPhotoBlobRef.current).forEach((url) => revokeIfBlob(url));
      productPhotoBlobRef.current = {};
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
        const contact = parseRestaurantContact(data);
        // No restaurar nombre vacío desde sessionStorage (borra el preview).
        const storedName =
          typeof stored?.name === 'string' && stored.name.trim() ? stored.name.trim() : null;
        const hasStoredDescription = Boolean(stored && Object.prototype.hasOwnProperty.call(stored, 'description'));
        const storedDescription =
          hasStoredDescription && typeof stored?.description === 'string' ? stored.description : null;
        setRestaurant({ ...data, ...contact });
        setSavedTemplate(templateId);
        setSavedConfig(config);
        setDraftTemplate(stored?.template || templateId);
        setDraftConfig(stored ? { ...config, ...stored.config } : { ...config });
        setSavedName(name);
        setSavedDescription(description);
        setSavedLogoUrl(logoUrl);
        setSavedCoverUrl(coverUrl);
        setSavedContact(contact);
        setDraftContact(contact);
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
    Object.values(productPhotoBlobRef.current).forEach((url) => revokeIfBlob(url));
    productPhotoBlobRef.current = {};
    setProductDrafts({});
    setSectionDrafts({});
    setProductOrderDrafts({});
    setEditingProductId(null);
    setEditingSectionId(null);
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
            isActive: section.isActive !== false && section.is_active !== false,
            items: itemsRaw
              .filter((item) => item.sectionId === section.id || item.section_id === section.id)
              .sort((a, b) => (a.sort ?? 999) - (b.sort ?? 999))
              .map((item) => ({
                id: item.id,
                name: item.name,
                ...(typeof item.description === 'string' && item.description.trim()
                  ? { description: item.description }
                  : {}),
                prices: mapItemPrices(item.prices),
                icons: Array.isArray(item.icons) ? item.icons : [],
                photos: mapItemPhotos(item.photos),
                highlighted: itemIsHighlighted(item),
                active: item.active !== false,
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
    // Comercio/producto abren diálogo: sin contorno persistente.
    if (!selection || NO_OUTLINE_HITS.has(selection.hit)) return;
    const nodes = elementsForSelectionKey(root, selection.classKey);
    const el = nodes[selection.index];
    el?.classList.add('ve-selected');
  });

  useEffect(() => {
    if (!focusedOptionId) return;
    document.getElementById(`field-${focusedOptionId}`)?.scrollIntoView({ block: 'nearest' });
  }, [focusedOptionId, group]);

  // Marca productos/categorías inactivos en el DOM para atenuarlos (siguen clickeables).
  useEffect(() => {
    const root = stageRef.current;
    if (!root) return;
    root.querySelectorAll('[data-item-id]').forEach((node) => {
      const id = node.getAttribute('data-item-id');
      if (id && inactiveItemIds.has(id)) node.setAttribute('data-ve-inactive', '1');
      else node.removeAttribute('data-ve-inactive');
    });
    root.querySelectorAll('[data-section-id]').forEach((node) => {
      const id = node.getAttribute('data-section-id');
      if (id && inactiveSectionIds.has(id)) node.setAttribute('data-ve-inactive', '1');
      else node.removeAttribute('data-ve-inactive');
    });
  });

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

  const previewMenus = useMemo(
    () =>
      menus.map((menu) => ({
        ...menu,
        name: menuDrafts[menu.id]?.name ?? menu.name,
      })),
    [menus, menuDrafts],
  );

  const selectedMenuDraftName =
    selectedMenuId && menuDrafts[selectedMenuId]
      ? menuDrafts[selectedMenuId].name
      : selectedMenu?.name || '';

  const previewSections = useMemo(() => {
    const mergedSections = sections.map((section) => {
      const sDraft = sectionDrafts[section.id];
      return {
        ...section,
        name: sDraft?.name ?? section.name,
        isActive: sDraft ? sDraft.isActive : section.isActive,
        pendingDelete: Boolean(sDraft?.pendingDelete),
      };
    });
    Object.entries(sectionDrafts).forEach(([id, draft]) => {
      if (!draft.isNew || mergedSections.some((row) => row.id === id)) return;
      mergedSections.push({
        id,
        name: draft.name,
        isActive: draft.isActive,
        pendingDelete: draft.pendingDelete,
        sort: 9999,
        items: [],
      });
    });

    // En el editor se mantienen visibles los inactivos (atenuados) para poder reactivarlos.
    // Solo se ocultan los marcados para borrar al publicar.
    const allSourceItems = mergedSections.flatMap((section) =>
      section.items.map((item) => ({ ...item, homeSectionId: section.id })),
    );

    return mergedSections
      .filter((section) => !section.pendingDelete)
      .map((section) => {
        const applyDraft = (
          item: (typeof allSourceItems)[number] | MenuSection['items'][number],
        ) => {
          const draft = productDrafts[item.id];
          if (!draft) return { ...item, pendingDelete: false as boolean };
          const photos = draft.removePhoto
            ? []
            : draft.photoUrl
              ? [draft.photoUrl]
              : item.photos;
          return {
            ...item,
            name: draft.name,
            description: draft.description,
            prices: draft.prices,
            photos,
            highlighted: draft.highlighted === true,
            active: draft.active,
            icons: Array.isArray(draft.icons) ? draft.icons : item.icons,
            pendingDelete: draft.pendingDelete,
          };
        };

        // Productos propios que no se movieron a otra categoría.
        const homeItems = section.items
          .filter((item) => {
            const draft = productDrafts[item.id];
            if (draft?.pendingDelete) return false;
            if (draft?.sectionId && draft.sectionId !== section.id) return false;
            return true;
          })
          .map(applyDraft);

        // Productos traídos desde otra categoría (o nuevos).
        const movedOrNew = [
          ...allSourceItems
            .filter((item) => {
              const draft = productDrafts[item.id];
              return (
                Boolean(draft?.sectionId) &&
                draft!.sectionId === section.id &&
                draft!.sectionId !== item.homeSectionId &&
                !draft!.pendingDelete
              );
            })
            .map(applyDraft),
          ...Object.entries(productDrafts)
            .filter(
              ([id, draft]) =>
                draft.isNew &&
                draft.sectionId === section.id &&
                !draft.pendingDelete &&
                !homeItems.some((item) => item.id === id) &&
                !allSourceItems.some((item) => item.id === id),
            )
            .map(([id, draft]) => ({
              id,
              name: draft.name,
              description: draft.description,
              prices: draft.prices,
              photos: draft.photoUrl && !draft.removePhoto ? [draft.photoUrl] : [],
              highlighted: draft.highlighted === true,
              active: draft.active !== false,
              icons: Array.isArray(draft.icons) ? draft.icons : [],
              pendingDelete: false,
            })),
        ];

        const seen = new Set<string>();
        const items = [...homeItems, ...movedOrNew].filter((item) => {
          if (item.pendingDelete || seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
        const order = productOrderDrafts[section.id];
        const orderedItems = order?.length
          ? (() => {
              const byId = new Map(items.map((item) => [item.id, item]));
              const next: typeof items = [];
              order.forEach((id) => {
                const row = byId.get(id);
                if (row) {
                  next.push(row);
                  byId.delete(id);
                }
              });
              byId.forEach((row) => next.push(row));
              return next;
            })()
          : items;
        return {
          id: section.id,
          name: section.name,
          isActive: section.isActive !== false,
          ...(typeof section.sort === 'number' ? { sort: section.sort } : {}),
          items: orderedItems.map(({ id, name, description, prices, icons, photos, highlighted, active }) => ({
            id,
            name,
            ...(description ? { description } : {}),
            prices,
            icons,
            photos,
            highlighted,
            active: active !== false,
          })),
        };
      });
  }, [sections, productDrafts, sectionDrafts, productOrderDrafts]);

  const inactiveItemIds = useMemo(() => {
    const ids = new Set<string>();
    previewSections.forEach((section) => {
      section.items.forEach((item) => {
        if ((item as { active?: boolean }).active === false) ids.add(item.id);
      });
    });
    return ids;
  }, [previewSections]);

  const inactiveSectionIds = useMemo(() => {
    const ids = new Set<string>();
    previewSections.forEach((section) => {
      if ((section as { isActive?: boolean }).isActive === false) ids.add(section.id);
    });
    return ids;
  }, [previewSections]);

  const structureSections = useMemo(() => {
    const productRow = (
      id: string,
      name: string,
      active: boolean,
    ): { id: string; name: string; active: boolean } => ({ id, name, active });

    const rows = sections.map((section) => {
      const draft = sectionDrafts[section.id];
      const products = section.items
        .map((item) => {
          const pDraft = productDrafts[item.id];
          if (pDraft?.pendingDelete) return null;
          if (pDraft?.sectionId && pDraft.sectionId !== section.id) return null;
          return productRow(
            item.id,
            pDraft?.name ?? item.name,
            pDraft ? pDraft.active !== false : item.active !== false,
          );
        })
        .filter((row): row is { id: string; name: string; active: boolean } => Boolean(row));

      // Traídos desde otra categoría o nuevos.
      Object.entries(productDrafts).forEach(([id, pDraft]) => {
        if (pDraft.pendingDelete || pDraft.sectionId !== section.id) return;
        if (products.some((row) => row.id === id)) return;
        const home = sections.find((sec) => sec.items.some((item) => item.id === id));
        if (home && home.id === section.id && !pDraft.isNew) return;
        products.push(productRow(id, pDraft.name, pDraft.active !== false));
      });

      const order = productOrderDrafts[section.id];
      const orderedProducts = order?.length
        ? (() => {
            const byId = new Map(products.map((row) => [row.id, row]));
            const next: typeof products = [];
            order.forEach((id) => {
              const row = byId.get(id);
              if (row) {
                next.push(row);
                byId.delete(id);
              }
            });
            byId.forEach((row) => next.push(row));
            return next;
          })()
        : products;
      return {
        id: section.id,
        name: draft?.name ?? section.name,
        isActive: draft ? draft.isActive : section.isActive,
        pendingDelete: Boolean(draft?.pendingDelete),
        isNew: Boolean(draft?.isNew),
        products: orderedProducts,
      };
    });
    Object.entries(sectionDrafts).forEach(([id, draft]) => {
      if (!draft.isNew || rows.some((row) => row.id === id)) return;
      const products = Object.entries(productDrafts)
        .filter(([, pDraft]) => pDraft.sectionId === id && !pDraft.pendingDelete)
        .map(([productId, pDraft]) => productRow(productId, pDraft.name, pDraft.active !== false));
      const order = productOrderDrafts[id];
      const orderedProducts = order?.length
        ? (() => {
            const byId = new Map(products.map((row) => [row.id, row]));
            const next: typeof products = [];
            order.forEach((productId) => {
              const row = byId.get(productId);
              if (row) {
                next.push(row);
                byId.delete(productId);
              }
            });
            byId.forEach((row) => next.push(row));
            return next;
          })()
        : products;
      rows.push({
        id,
        name: draft.name,
        isActive: draft.isActive,
        pendingDelete: draft.pendingDelete,
        isNew: true,
        products: orderedProducts,
      });
    });
    return rows.filter((row) => !row.pendingDelete);
  }, [sections, sectionDrafts, productDrafts, productOrderDrafts]);

  const productCurrencies = useMemo(() => {
    const codes = new Set<string>();
    const defaultCurrency =
      typeof restaurant?.defaultCurrency === 'string' ? restaurant.defaultCurrency : 'USD';
    codes.add(defaultCurrency || 'USD');
    if (Array.isArray(restaurant?.additionalCurrencies)) {
      restaurant.additionalCurrencies.forEach((code: unknown) => {
        if (typeof code === 'string' && code.trim()) codes.add(code.trim().toUpperCase());
      });
    }
    sections.forEach((section) => {
      section.items.forEach((item) => {
        item.prices.forEach((price) => {
          if (price.currency) codes.add(String(price.currency).toUpperCase());
        });
      });
    });
    Object.values(productDrafts).forEach((draft) => {
      draft.prices.forEach((price) => {
        if (price.currency) codes.add(String(price.currency).toUpperCase());
      });
    });
    return Array.from(codes);
  }, [restaurant, sections, productDrafts]);

  const editingProductInitial = useMemo(() => {
    if (!editingProductId) return null;
    const existing = productDrafts[editingProductId];
    if (existing) return existing;
    for (const section of sections) {
      const item = section.items.find((row) => row.id === editingProductId);
      if (!item) continue;
      return {
        name: item.name,
        description: item.description || '',
        prices: item.prices.map((price) => ({
          currency: price.currency,
          amount: price.amount,
          ...(price.label ? { label: price.label } : {}),
        })),
        photoUrl: item.photos[0] || null,
        photoFile: null,
        removePhoto: false,
        active: item.active !== false,
        highlighted: item.highlighted === true,
        icons: Array.isArray(item.icons) ? [...item.icons] : [],
        pendingDelete: false,
        sectionId: section.id,
      } satisfies ProductEditDraft;
    }
    return null;
  }, [editingProductId, productDrafts, sections]);

  const editingSectionInitial = useMemo(() => {
    if (!editingSectionId) return null;
    const existing = sectionDrafts[editingSectionId];
    if (existing) return existing;
    const section = sections.find((row) => row.id === editingSectionId);
    if (!section) return null;
    return {
      name: section.name,
      isActive: section.isActive !== false,
      pendingDelete: false,
    } satisfies SectionEditDraft;
  }, [editingSectionId, sectionDrafts, sections]);

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
      address: draftContact.address || undefined,
      phone: draftContact.phone || undefined,
      whatsapp: draftContact.whatsapp || undefined,
      email: draftContact.email || undefined,
      website: draftContact.website || undefined,
      primaryColor: hexColor(draftConfig.primaryColor, restaurant.primaryColor || '#007bff'),
      secondaryColor: hexColor(draftConfig.secondaryColor, restaurant.secondaryColor || '#0056b3'),
    };
    if (draftLogoUrl) next.logoUrl = draftLogoUrl;
    else delete next.logoUrl;
    if (draftCoverUrl) next.coverUrl = draftCoverUrl;
    else delete next.coverUrl;
    if (!draftContact.address) delete next.address;
    if (!draftContact.phone) delete next.phone;
    if (!draftContact.whatsapp) delete next.whatsapp;
    if (!draftContact.email) delete next.email;
    if (!draftContact.website) delete next.website;
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
      address?: string;
      phone?: string;
      whatsapp?: string;
      email?: string;
      website?: string;
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
    draftContact,
  ]);

  const previewMenuSections = useMemo(
    () =>
      previewSections.map((section) => ({
        id: section.id,
        name: section.name,
        ...(typeof section.sort === 'number' ? { sort: section.sort } : {}),
        items: section.items.map(({ id, name, description, prices, icons, photos, highlighted }) => ({
          id,
          name,
          ...(description ? { description } : {}),
          prices,
          icons,
          photos,
          highlighted,
        })),
      })),
    [previewSections],
  );

  const previewMenu = selectedMenu
    ? {
        id: selectedMenu.id,
        name: menuDrafts[selectedMenu.id]?.name ?? selectedMenu.name,
        slug: selectedMenu.slug,
        ...(selectedMenu.description ? { description: selectedMenu.description } : {}),
        sections: previewMenuSections,
      }
    : {
        id: 'empty',
        name: restaurant?.name || 'Menú',
        slug: 'preview',
        sections: previewMenuSections,
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

  const clearProductDrafts = () => {
    Object.values(productPhotoBlobRef.current).forEach((url) => revokeIfBlob(url));
    productPhotoBlobRef.current = {};
    setProductDrafts({});
    setEditingProductId(null);
  };

  const clearStructureDrafts = () => {
    clearProductDrafts();
    setSectionDrafts({});
    setProductOrderDrafts({});
    setMenuDrafts({});
    setEditingSectionId(null);
  };

  const findSectionIdForProduct = (itemId: string): string | null => {
    const draft = productDrafts[itemId];
    if (draft?.sectionId) return draft.sectionId;
    for (const section of previewSections) {
      if (section.items.some((item) => item.id === itemId)) return section.id;
    }
    for (const section of sections) {
      if (section.items.some((item) => item.id === itemId)) return section.id;
    }
    return null;
  };

  const idsForSectionOrder = (sectionId: string): string[] => {
    if (productOrderDrafts[sectionId]?.length) return [...productOrderDrafts[sectionId]];
    const preview = previewSections.find((row) => row.id === sectionId);
    if (preview) return preview.items.map((item) => item.id);
    return sections.find((row) => row.id === sectionId)?.items.map((item) => item.id) || [];
  };

  const buildProductDraftFromItem = (
    itemId: string,
    sectionId: string,
  ): ProductEditDraft | null => {
    const existing = productDrafts[itemId];
    if (existing) return { ...existing, sectionId, pendingDelete: false };
    for (const section of sections) {
      const item = section.items.find((row) => row.id === itemId);
      if (!item) continue;
      return {
        name: item.name,
        description: item.description || '',
        prices: item.prices.map((price) => ({
          currency: price.currency,
          amount: price.amount,
          ...(price.label ? { label: price.label } : {}),
        })),
        photoUrl: item.photos[0] || null,
        photoFile: null,
        removePhoto: false,
        active: item.active !== false,
        highlighted: item.highlighted === true,
        icons: Array.isArray(item.icons) ? [...item.icons] : [],
        pendingDelete: false,
        sectionId,
      };
    }
    return null;
  };

  /** Reordena dentro de la misma categoría o mueve a otra (toId = ancla; null = al final). */
  const moveProduct = (fromId: string, toSectionId: string, toId: string | null) => {
    if (!fromId || !toSectionId || fromId === toId) return;
    const fromSectionId = findSectionIdForProduct(fromId);
    if (!fromSectionId) return;

    if (fromSectionId === toSectionId) {
      const currentIds = idsForSectionOrder(toSectionId);
      const fromIndex = currentIds.indexOf(fromId);
      if (fromIndex < 0) return;
      const next = [...currentIds];
      const [moved] = next.splice(fromIndex, 1);
      if (!moved) return;
      if (toId) {
        const toIndex = next.indexOf(toId);
        if (toIndex < 0) next.push(moved);
        else next.splice(toIndex, 0, moved);
      } else {
        next.push(moved);
      }
      setProductOrderDrafts((prev) => ({ ...prev, [toSectionId]: next }));
      setSaveState('idle');
      setSaveError('');
      return;
    }

    const draft = buildProductDraftFromItem(fromId, toSectionId);
    if (!draft) return;
    setProductDrafts((prev) => ({ ...prev, [fromId]: draft }));

    setProductOrderDrafts((prev) => {
      const sourceIds = (prev[fromSectionId] || idsForSectionOrder(fromSectionId)).filter(
        (id) => id !== fromId,
      );
      const targetIds = (prev[toSectionId] || idsForSectionOrder(toSectionId)).filter(
        (id) => id !== fromId,
      );
      if (toId) {
        const toIndex = targetIds.indexOf(toId);
        if (toIndex < 0) targetIds.push(fromId);
        else targetIds.splice(toIndex, 0, fromId);
      } else {
        targetIds.push(fromId);
      }
      return {
        ...prev,
        [fromSectionId]: sourceIds,
        [toSectionId]: targetIds,
      };
    });
    setSaveState('idle');
    setSaveError('');
  };

  // Drag & drop de productos en modo contenido (sobre las tarjetas del preview).
  useEffect(() => {
    const root = stageRef.current;
    if (!root || editorMode !== 'content') {
      productDragIdRef.current = null;
      root?.querySelectorAll('[data-item-id]').forEach((node) => {
        if (node instanceof HTMLElement) {
          node.removeAttribute('draggable');
          node.removeAttribute('data-ve-dragging');
          node.removeAttribute('data-ve-drop-target');
        }
      });
      return;
    }

    const cards = () =>
      Array.from(root.querySelectorAll('[data-item-id]')).filter(
        (node): node is HTMLElement => node instanceof HTMLElement,
      );

    cards().forEach((node) => {
      node.setAttribute('draggable', 'true');
    });

    const sectionNodes = () =>
      Array.from(root.querySelectorAll('[data-section-id]')).filter(
        (node): node is HTMLElement => node instanceof HTMLElement,
      );

    const clearDropTargets = () => {
      cards().forEach((node) => node.removeAttribute('data-ve-drop-target'));
      sectionNodes().forEach((node) => node.removeAttribute('data-ve-drop-target'));
    };

    const onDragStart = (event: DragEvent) => {
      const card = (event.target as Element | null)?.closest?.('[data-item-id]');
      if (!(card instanceof HTMLElement) || !root.contains(card)) return;
      const itemId = card.getAttribute('data-item-id');
      if (!itemId) return;
      productDragIdRef.current = itemId;
      productDidDragRef.current = false;
      card.setAttribute('data-ve-dragging', '1');
      event.dataTransfer?.setData('text/ve-item-id', itemId);
      if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = (event: DragEvent) => {
      const fromId = productDragIdRef.current;
      if (!fromId) return;
      const card = (event.target as Element | null)?.closest?.('[data-item-id]');
      if (card instanceof HTMLElement && root.contains(card)) {
        const toId = card.getAttribute('data-item-id');
        if (!toId || toId === fromId) return;
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
        clearDropTargets();
        card.setAttribute('data-ve-drop-target', '1');
        productDidDragRef.current = true;
        return;
      }
      const sectionEl = (event.target as Element | null)?.closest?.('[data-section-id]');
      if (!(sectionEl instanceof HTMLElement) || !root.contains(sectionEl)) return;
      const toSectionId = sectionEl.getAttribute('data-section-id');
      if (!toSectionId) return;
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
      clearDropTargets();
      sectionEl.setAttribute('data-ve-drop-target', '1');
      productDidDragRef.current = true;
    };

    const onDrop = (event: DragEvent) => {
      const fromId =
        productDragIdRef.current || event.dataTransfer?.getData('text/ve-item-id') || null;
      if (!fromId) return;
      event.preventDefault();
      event.stopPropagation();
      clearDropTargets();
      productDidDragRef.current = true;

      const card = (event.target as Element | null)?.closest?.('[data-item-id]');
      if (card instanceof HTMLElement && root.contains(card)) {
        const toId = card.getAttribute('data-item-id');
        if (!toId || toId === fromId) return;
        const toSection = findSectionIdForProduct(toId);
        if (!toSection) return;
        moveProduct(fromId, toSection, toId);
        return;
      }

      const sectionEl = (event.target as Element | null)?.closest?.('[data-section-id]');
      if (!(sectionEl instanceof HTMLElement) || !root.contains(sectionEl)) return;
      const toSectionId = sectionEl.getAttribute('data-section-id');
      if (!toSectionId) return;
      moveProduct(fromId, toSectionId, null);
    };

    const onDragEnd = () => {
      cards().forEach((node) => {
        node.removeAttribute('data-ve-dragging');
        node.removeAttribute('data-ve-drop-target');
      });
      sectionNodes().forEach((node) => node.removeAttribute('data-ve-drop-target'));
      productDragIdRef.current = null;
    };

    root.addEventListener('dragstart', onDragStart);
    root.addEventListener('dragover', onDragOver);
    root.addEventListener('drop', onDrop);
    root.addEventListener('dragend', onDragEnd);
    return () => {
      root.removeEventListener('dragstart', onDragStart);
      root.removeEventListener('dragover', onDragOver);
      root.removeEventListener('drop', onDrop);
      root.removeEventListener('dragend', onDragEnd);
      cards().forEach((node) => {
        node.removeAttribute('draggable');
        node.removeAttribute('data-ve-dragging');
        node.removeAttribute('data-ve-drop-target');
      });
      sectionNodes().forEach((node) => node.removeAttribute('data-ve-drop-target'));
    };
  }, [editorMode, previewSections, productDrafts, productOrderDrafts, sections]);

  const applyMenuNameDraft = (menuId: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const original = menus.find((menu) => menu.id === menuId);
    if (!original) return;
    setMenuDrafts((prev) => {
      if (trimmed === original.name) {
        const next = { ...prev };
        delete next[menuId];
        return next;
      }
      return { ...prev, [menuId]: { name: trimmed } };
    });
    setSaveState('idle');
    setSaveError('');
  };

  const openNewProduct = (sectionId: string) => {
    const tempId = newTempId('new-item');
    const draft: ProductEditDraft = {
      name: tx('adminTemplates.visual.product.newName', 'Nuevo producto'),
      description: '',
      prices: [{ currency: productCurrencies[0] || 'USD', amount: 0 }],
      photoUrl: null,
      photoFile: null,
      removePhoto: false,
      active: true,
      highlighted: false,
      icons: [],
      pendingDelete: false,
      isNew: true,
      sectionId,
    };
    setProductDrafts((prev) => ({ ...prev, [tempId]: draft }));
    setProductOrderDrafts((prev) => {
      const existing =
        prev[sectionId] ||
        previewSections.find((row) => row.id === sectionId)?.items.map((item) => item.id) ||
        sections.find((row) => row.id === sectionId)?.items.map((item) => item.id) ||
        [];
      return { ...prev, [sectionId]: [...existing.filter((id) => id !== tempId), tempId] };
    });
    setEditingSectionId(null);
    setCommerceEdit(null);
    setFooterEditOpen(false);
    setEditingProductId(tempId);
    setSaveState('idle');
    setSaveError('');
  };

  const openNewSection = () => {
    const tempId = newTempId('new-section');
    const draft: SectionEditDraft = {
      name: tx('adminTemplates.visual.section.newName', 'Nueva categoría'),
      isActive: true,
      pendingDelete: false,
      isNew: true,
    };
    setSectionDrafts((prev) => ({ ...prev, [tempId]: draft }));
    setEditingProductId(null);
    setCommerceEdit(null);
    setFooterEditOpen(false);
    setEditingSectionId(tempId);
    setSaveState('idle');
    setSaveError('');
  };

  const resetDraft = () => {
    revokeIfBlob(draftLogoBlobRef.current);
    revokeIfBlob(draftCoverBlobRef.current);
    draftLogoBlobRef.current = null;
    draftCoverBlobRef.current = null;
    clearStructureDrafts();
    setDraftTemplate(savedTemplate);
    setDraftConfig(savedConfig);
    setDraftName(savedName);
    setDraftDescription(savedDescription);
    setDraftLogoUrl(savedLogoUrl);
    setDraftCoverUrl(savedCoverUrl);
    setDraftLogoFile(null);
    setDraftCoverFile(null);
    setDraftContact(savedContact);
    setCommerceEdit(null);
    setFooterEditOpen(false);
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
      // '' rompe @IsEmail/@IsUrl en el backend; vacíos van como null.
      const contactPayload = {
        address: draftContact.address.trim() || null,
        phone: draftContact.phone.trim() || null,
        whatsapp: draftContact.whatsapp.trim() || null,
        email: draftContact.email.trim() || null,
        website: draftContact.website.trim() || null,
      };
      const payload: Record<string, unknown> = {
        description: nextDescription,
        template: draftTemplate,
        templateConfig,
        primaryColor: primary,
        secondaryColor: secondary,
        ...contactPayload,
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

      const sectionIdMap: Record<string, string> = {};
      const menuEntries = Object.entries(menuDrafts);
      for (const [menuId, draft] of menuEntries) {
        const trimmed = draft.name.trim();
        if (!trimmed) continue;
        await api.put(`/menus/${menuId}`, { name: trimmed });
      }
      if (menuEntries.length) {
        setMenus((prev) =>
          prev.map((menu) => {
            const draft = menuDrafts[menu.id];
            if (!draft?.name.trim()) return menu;
            return { ...menu, name: draft.name.trim() };
          }),
        );
      }

      const hasContentChanges =
        Object.keys(sectionDrafts).length > 0 ||
        Object.keys(productDrafts).length > 0 ||
        Object.keys(productOrderDrafts).length > 0 ||
        Object.keys(menuDrafts).length > 0;

      const sectionEntries = Object.entries(sectionDrafts);
      for (const [sectionId, draft] of sectionEntries) {
        if (draft.isNew && draft.pendingDelete) continue;
        if (draft.isNew) {
          if (!selectedMenuId) {
            throw new Error(
              tx(
                'adminTemplates.visual.contentPublishNoMenu',
                'Seleccioná un menú antes de publicar categorías o productos.',
              ),
            );
          }
          const created = await api.post('/menu-sections', {
            menuId: selectedMenuId,
            name: draft.name,
            isActive: draft.isActive,
          });
          const realId = entityId(created.data);
          if (!realId) {
            throw new Error(
              tx(
                'adminTemplates.visual.contentPublishSectionFailed',
                'No se pudo crear una categoría nueva. Intentá de nuevo.',
              ),
            );
          }
          sectionIdMap[sectionId] = realId;
          continue;
        }
        if (draft.pendingDelete) {
          const sectionItems = sections.find((row) => row.id === sectionId)?.items || [];
          for (const item of sectionItems) {
            await api.delete(`/menu-items/${item.id}`);
          }
          await api.delete(`/menu-sections/${sectionId}`);
          continue;
        }
        await api.put(`/menu-sections/${sectionId}`, {
          name: draft.name,
          isActive: draft.isActive,
        });
      }

      const draftEntries = Object.entries(productDrafts);
      const itemIdMap: Record<string, string> = {};
      for (const [itemId, draft] of draftEntries) {
        // Si la categoría ya se borró arriba, no reintentar el producto.
        if (
          draft.sectionId &&
          sectionDrafts[draft.sectionId]?.pendingDelete &&
          !sectionDrafts[draft.sectionId]?.isNew
        ) {
          continue;
        }
        const resolvedSectionId = draft.sectionId
          ? sectionIdMap[draft.sectionId] || draft.sectionId
          : undefined;
        if (draft.isNew && draft.pendingDelete) continue;
        if (draft.isNew) {
          if (!selectedMenuId || !resolvedSectionId || resolvedSectionId.startsWith('new-section-')) {
            throw new Error(
              tx(
                'adminTemplates.visual.contentPublishProductFailed',
                'No se pudo crear un producto nuevo (falta la categoría). Intentá de nuevo.',
              ),
            );
          }
          const created = await api.post('/menu-items', {
            menuId: selectedMenuId,
            sectionId: resolvedSectionId,
            name: draft.name,
            description: draft.description,
            prices: draft.prices,
            active: draft.active !== false,
            highlighted: draft.highlighted === true,
            iconCodes: Array.isArray(draft.icons) ? draft.icons : [],
          });
          const realItemId = entityId(created.data);
          if (!realItemId) {
            throw new Error(
              tx(
                'adminTemplates.visual.contentPublishProductFailed',
                'No se pudo crear un producto nuevo (falta la categoría). Intentá de nuevo.',
              ),
            );
          }
          itemIdMap[itemId] = realItemId;
          if (draft.photoFile) {
            const formDataPhoto = new FormData();
            formDataPhoto.append('file', draft.photoFile);
            await api.post(`/media/items/${realItemId}/photo`, formDataPhoto);
          }
          continue;
        }
        if (draft.pendingDelete) {
          await api.delete(`/menu-items/${itemId}`);
          continue;
        }
        const putBody: Record<string, unknown> = {
          name: draft.name,
          description: draft.description,
          prices: draft.prices,
          active: draft.active !== false,
          highlighted: draft.highlighted === true,
          iconCodes: Array.isArray(draft.icons) ? draft.icons : [],
        };
        if (draft.sectionId) {
          putBody.sectionId = sectionIdMap[draft.sectionId] || draft.sectionId;
        }
        await api.put(`/menu-items/${itemId}`, putBody);
        if (draft.photoFile) {
          const formDataPhoto = new FormData();
          formDataPhoto.append('file', draft.photoFile);
          await api.post(`/media/items/${itemId}/photo`, formDataPhoto);
        } else if (draft.removePhoto) {
          await api.delete(`/media/items/${itemId}/photo`);
        }
      }

      const orderEntries = Object.entries(productOrderDrafts);
      for (const [sectionId, orderedIds] of orderEntries) {
        if (sectionDrafts[sectionId]?.pendingDelete) continue;
        const resolvedSectionId = sectionIdMap[sectionId] || sectionId;
        if (resolvedSectionId.startsWith('new-section-')) {
          throw new Error(
            tx(
              'adminTemplates.visual.contentPublishSectionFailed',
              'No se pudo crear una categoría nueva. Intentá de nuevo.',
            ),
          );
        }
        const itemOrders = orderedIds
          .map((id) => itemIdMap[id] || id)
          .filter((id) => id && !id.startsWith('new-item-'))
          .map((id, sort) => ({ id, sort }));
        if (itemOrders.length > 0) {
          await api.post('/menu-items/reorder', { itemOrders });
        }
      }

      // La página pública solo muestra menús PUBLISHED.
      if (hasContentChanges && selectedMenuId) {
        const selectedMenu = menus.find((menu) => menu.id === selectedMenuId);
        if (selectedMenu && !isMenuPublished(selectedMenu.status)) {
          await api.put(`/menus/${selectedMenuId}/publish`);
          setMenus((prev) =>
            prev.map((menu) =>
              menu.id === selectedMenuId ? { ...menu, status: 'PUBLISHED' } : menu,
            ),
          );
        }
      }

      if (
        (draftEntries.length || sectionEntries.length || menuEntries.length || orderEntries.length) &&
        selectedMenuId
      ) {
        const [sectionsRes, itemsRes] = await Promise.all([
          api.get('/menu-sections', { params: { menuId: selectedMenuId } }),
          api.get('/menu-items', { params: { menuId: selectedMenuId } }),
        ]);
        const sectionsRaw = asArray<any>(sectionsRes.data).sort(
          (a, b) => (a.sort ?? 999) - (b.sort ?? 999),
        );
        const itemsRaw = asArray<any>(itemsRes.data);
        setSections(
          sectionsRaw.map((section) => ({
            id: section.id,
            name: section.name,
            sort: section.sort,
            isActive: section.isActive !== false && section.is_active !== false,
            items: itemsRaw
              .filter((item) => item.sectionId === section.id || item.section_id === section.id)
              .sort((a, b) => (a.sort ?? 999) - (b.sort ?? 999))
              .map((item) => ({
                id: item.id,
                name: item.name,
                ...(typeof item.description === 'string' && item.description.trim()
                  ? { description: item.description }
                  : {}),
                prices: mapItemPrices(item.prices),
                icons: Array.isArray(item.icons) ? item.icons : [],
                photos: mapItemPhotos(item.photos),
                highlighted: itemIsHighlighted(item),
                active: item.active !== false,
              })),
          })),
        );
      }

      revokeIfBlob(draftLogoBlobRef.current);
      revokeIfBlob(draftCoverBlobRef.current);
      draftLogoBlobRef.current = null;
      draftCoverBlobRef.current = null;
      clearStructureDrafts();

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
      setSavedContact(draftContact);
      setRestaurant((prev) =>
        prev
          ? {
              ...prev,
              name: nextName,
              description: nextDescription,
              slug: nextSlug || prev.slug,
              logoUrl: nextLogoUrl,
              coverUrl: nextCoverUrl,
              address: draftContact.address,
              phone: draftContact.phone,
              whatsapp: draftContact.whatsapp,
              email: draftContact.email,
              website: draftContact.website,
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
        getApiErrorMessage(
          error,
          tx('adminTemplates.visual.saveError', 'No se pudo publicar. Tus cambios siguen en el editor.'),
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const onPreviewClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const root = stageRef.current;
    if (!root) return;
    if (productDidDragRef.current) {
      productDidDragRef.current = false;
      event.preventDefault();
      event.stopPropagation();
      return;
    }
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
      if (found) {
        // En modo contenido, las categorías son botones: no deben filtrar/navegar.
        if (
          editorMode === 'content' &&
          (found.hit === 'section' || found.hit === 'product' || found.hit === 'price')
        ) {
          event.preventDefault();
          event.stopPropagation();
        }
        applyHit(found.hit, found.element, root);
      } else clearPreviewSelection();
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
    setEditingProductId(null);
    setEditingSectionId(null);
    setFooterEditOpen(false);
  };

  const applyHit = (nextHit: VisualHit, element: Element, root: HTMLElement) => {
    const classKey = selectionKey(element);
    const index = elementsForSelectionKey(root, classKey).indexOf(element);
    const productId =
      nextHit === 'product' || nextHit === 'price' ? findClosestItemId(element, root) : null;
    const sectionId =
      nextHit === 'section' || editorMode === 'content'
        ? findClosestSectionId(element, root)
        : null;

    // Comercio/producto/categoría: sin outline; el diálogo es el feedback.
    setSelection(
      NO_OUTLINE_HITS.has(nextHit) || (editorMode === 'content' && (productId || sectionId))
        ? null
        : { hit: nextHit, classKey, index: Math.max(0, index) },
    );
    setHit(productId ? 'product' : sectionId && editorMode === 'content' ? 'section' : nextHit);

    if (editorMode === 'content') {
      setSheetOpen(true);
      setGroup(null);
      setFocusedOptionId(null);
      if (productId) {
        setCommerceEdit(null);
        setFooterEditOpen(false);
        setEditingSectionId(null);
        setEditingProductId(productId);
        return;
      }
      if (sectionId || nextHit === 'section') {
        const resolvedSection =
          sectionId || findClosestSectionId(element, root);
        if (resolvedSection) {
          setCommerceEdit(null);
          setFooterEditOpen(false);
          setEditingProductId(null);
          setEditingSectionId(resolvedSection);
          return;
        }
      }
      // En contenido, clic en diseño de comercio/footer sigue permitido.
    }

    const focus = focusForHit(productId ? 'product' : nextHit, optionIds);
    setGroup(focus.group);
    setFocusedOptionId(focus.optionId ?? null);
    setSheetOpen(true);
    if (COMMERCE_EDIT_HITS.has(nextHit)) {
      setEditingProductId(null);
      setEditingSectionId(null);
      setFooterEditOpen(false);
      setCommerceEdit(nextHit as CommerceEditKind);
      return;
    }
    if (nextHit === 'footer') {
      setCommerceEdit(null);
      setEditingProductId(null);
      setEditingSectionId(null);
      setFooterEditOpen(true);
      return;
    }
    if (productId) {
      setCommerceEdit(null);
      setFooterEditOpen(false);
      setEditingSectionId(null);
      setEditingProductId(productId);
      return;
    }
    setEditingProductId(null);
    setEditingSectionId(null);
    setFooterEditOpen(false);
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
        <Link href="/admin/design" className="admin-btn">
          {tx('adminTemplates.visual.back', 'Volver a Diseño')}
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

  const hitNote =
    editorMode === 'content'
      ? tx(
          'adminTemplates.visual.contentHint',
          'Modo contenido: tocá una categoría o producto para editarlo. Los cambios quedan en el borrador hasta publicar.',
        )
      : hit
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
        <div className={styles.modeToggle} role="group" aria-label={tx('adminTemplates.visual.mode', 'Modo del editor')}>
          <button
            type="button"
            className={editorMode === 'design' ? styles.viewOn : undefined}
            onClick={() => {
              setEditorMode('design');
              setEditingSectionId(null);
            }}
          >
            {tx('adminTemplates.visual.modeDesign', 'Diseño')}
          </button>
          <button
            type="button"
            className={editorMode === 'content' ? styles.viewOn : undefined}
            onClick={() => {
              setEditorMode('content');
              setCommerceEdit(null);
              setSelection(null);
              setSheetOpen(true);
            }}
          >
            {tx('adminTemplates.visual.modeContent', 'Contenido')}
          </button>
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
          <Link href="/admin/design" className={`admin-btn ${styles.backLink}`}>
            {tx('adminTemplates.visual.back', 'Volver a Diseño')}
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
              : editorMode === 'content'
                ? tx('adminTemplates.visual.openContentTools', 'Editar contenido')
                : tx('adminTemplates.visual.openTools', 'Editar diseño')}
          </button>
          <div className={styles.accordion}>
            <div className={styles.hintWrap}>
              <p className={styles.hint}>{hitNote}</p>
            </div>
            {editorMode === 'content' ? (
              <section className={styles.accordionItem}>
                <div className={`${styles.groupBtn} ${styles.groupOn}`}>
                  {tx('adminTemplates.visual.contentPanelTitle', 'Estructura del menú')}
                </div>
                <div className={styles.panel}>
                  <div className={styles.contentPanel}>
                    <label>
                      {tx('adminTemplates.visual.contentMenuLabel', 'Menú')}
                      <select
                        value={selectedMenuId || ''}
                        onChange={(event) => setSelectedMenuId(event.target.value || null)}
                      >
                        {previewMenus.map((menu) => (
                          <option key={menu.id} value={menu.id}>
                            {menu.name}
                            {isMenuPublished(menu.status)
                              ? ''
                              : ` (${tx('adminTemplates.visual.contentMenuDraft', 'borrador')})`}
                          </option>
                        ))}
                      </select>
                    </label>
                    {selectedMenuId ? (
                      <label>
                        {tx('adminTemplates.visual.contentMenuNameLabel', 'Nombre del menú')}
                        <input
                          type="text"
                          value={selectedMenuDraftName}
                          onChange={(event) => {
                            const value = event.target.value;
                            setMenuDrafts((prev) => ({
                              ...prev,
                              [selectedMenuId]: { name: value },
                            }));
                            setSaveState('idle');
                            setSaveError('');
                          }}
                          onBlur={() => {
                            const current =
                              menuDrafts[selectedMenuId]?.name ?? selectedMenu?.name ?? '';
                            if (!current.trim()) {
                              setMenuDrafts((prev) => {
                                const next = { ...prev };
                                delete next[selectedMenuId];
                                return next;
                              });
                              return;
                            }
                            applyMenuNameDraft(selectedMenuId, current);
                          }}
                        />
                      </label>
                    ) : null}
                    <p className={styles.commerceHint}>
                      {tx(
                        'adminTemplates.visual.contentMenusNote',
                        'Podés renombrar el menú acá. Para crear o borrar menús enteros usá el panel Menús.',
                      )}
                    </p>
                    <ul className={styles.contentSectionList}>
                      {structureSections.map((section) => (
                        <li
                          key={section.id}
                          className={styles.contentSectionDrop}
                          style={{ flexDirection: 'column', alignItems: 'stretch' }}
                          onDragOver={(event) => {
                            const fromId = productDragIdRef.current;
                            if (!fromId) return;
                            event.preventDefault();
                            event.dataTransfer.dropEffect = 'move';
                            productDidDragRef.current = true;
                            event.currentTarget.setAttribute('data-ve-drop-target', '1');
                          }}
                          onDragLeave={(event) => {
                            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                              event.currentTarget.removeAttribute('data-ve-drop-target');
                            }
                          }}
                          onDrop={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            event.currentTarget.removeAttribute('data-ve-drop-target');
                            const fromId =
                              productDragIdRef.current ||
                              event.dataTransfer.getData('text/ve-item-id') ||
                              event.dataTransfer.getData('text/plain');
                            if (!fromId) return;
                            productDidDragRef.current = true;
                            moveProduct(fromId, section.id, null);
                            productDragIdRef.current = null;
                          }}
                        >
                          <button
                            type="button"
                            className="admin-btn"
                            onClick={() => {
                              setEditingProductId(null);
                              setEditingSectionId(section.id);
                            }}
                          >
                            {section.name}
                            {!section.isActive ? (
                              <span className={styles.contentSectionMuted}>
                                {' '}
                                ({tx('adminTemplates.visual.section.inactive', 'oculta')})
                              </span>
                            ) : null}
                          </button>
                          {section.products.length > 0 ? (
                            <ul className={styles.contentProductList}>
                              {section.products.map((product) => (
                                <li key={product.id}>
                                  <button
                                    type="button"
                                    draggable
                                    className={`admin-btn${product.active ? '' : ` ${styles.contentProductInactive}`}`}
                                    onDragStart={(event) => {
                                      productDragIdRef.current = product.id;
                                      productDidDragRef.current = false;
                                      event.dataTransfer.setData('text/ve-item-id', product.id);
                                      event.dataTransfer.setData('text/plain', product.id);
                                      event.dataTransfer.effectAllowed = 'move';
                                    }}
                                    onDragOver={(event) => {
                                      const fromId = productDragIdRef.current;
                                      if (!fromId || fromId === product.id) return;
                                      event.preventDefault();
                                      event.stopPropagation();
                                      event.dataTransfer.dropEffect = 'move';
                                      productDidDragRef.current = true;
                                      event.currentTarget.setAttribute('data-ve-drop-target', '1');
                                    }}
                                    onDragLeave={(event) => {
                                      event.currentTarget.removeAttribute('data-ve-drop-target');
                                    }}
                                    onDrop={(event) => {
                                      event.preventDefault();
                                      event.stopPropagation();
                                      event.currentTarget.removeAttribute('data-ve-drop-target');
                                      const fromId =
                                        productDragIdRef.current ||
                                        event.dataTransfer.getData('text/ve-item-id') ||
                                        event.dataTransfer.getData('text/plain');
                                      if (!fromId || fromId === product.id) return;
                                      productDidDragRef.current = true;
                                      moveProduct(fromId, section.id, product.id);
                                      productDragIdRef.current = null;
                                    }}
                                    onDragEnd={() => {
                                      productDragIdRef.current = null;
                                      document
                                        .querySelectorAll('[data-ve-drop-target]')
                                        .forEach((node) => node.removeAttribute('data-ve-drop-target'));
                                    }}
                                    onClick={() => {
                                      if (productDidDragRef.current) {
                                        productDidDragRef.current = false;
                                        return;
                                      }
                                      setEditingSectionId(null);
                                      setEditingProductId(product.id);
                                    }}
                                  >
                                    {product.name}
                                    {!product.active ? (
                                      <span className={styles.contentSectionMuted}>
                                        {' '}
                                        ({tx('adminTemplates.visual.product.inactive', 'desactivado')})
                                      </span>
                                    ) : null}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className={styles.contentDropHint}>
                              {tx(
                                'adminTemplates.visual.contentDropHere',
                                'Soltá acá para mover un producto a esta categoría',
                              )}
                            </p>
                          )}
                          <button
                            type="button"
                            className={`admin-btn ${styles.contentAddProductBtn}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              openNewProduct(section.id);
                            }}
                          >
                            {tx('adminTemplates.visual.section.addProduct', 'Agregar producto')}
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button type="button" className="admin-btn admin-btn-primary" onClick={openNewSection}>
                      {tx('adminTemplates.visual.section.add', 'Agregar categoría')}
                    </button>
                  </div>
                </div>
              </section>
            ) : null}
            {editorMode === 'design'
              ? GROUPS.map((id) => {
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
                })
              : null}
          </div>
        </aside>

        <form className={styles.stageWrap} onSubmit={(event) => event.preventDefault()}>
          <div
            ref={stageRef}
            className={`visual-editor-stage ${styles.stage}${viewport === 'phone' ? ` ${styles.stagePhone}` : ''}${editorMode === 'content' ? ` ${styles.stageContentMode}` : ''}`}
            onClickCapture={onPreviewClick}
          >
            <MenuTemplatePreview
              restaurant={previewRestaurant}
              menus={
                previewMenus.length
                  ? previewMenus
                  : [{ id: previewMenu.id, name: previewMenu.name, slug: previewMenu.slug }]
              }
              selectedMenu={previewMenu}
              locale={i18n.language || 'es-ES'}
              onMenuSelect={(slug) => {
                const found = previewMenus.find((menu) => menu.slug === slug);
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

      <VisualProductEditDialog
        open={Boolean(editingProductId && editingProductInitial)}
        itemId={editingProductId}
        initial={editingProductInitial}
        currencies={productCurrencies}
        contentMode={editorMode === 'content'}
        onClose={() => {
          setEditingProductId(null);
          clearPreviewSelection();
        }}
        onApply={(itemId, draft) => {
          const previous = productDrafts[itemId];
          if (draft.photoFile && draft.photoUrl?.startsWith('blob:')) {
            if (previous?.photoUrl?.startsWith('blob:') && previous.photoUrl !== draft.photoUrl) {
              revokeIfBlob(previous.photoUrl);
            }
            productPhotoBlobRef.current[itemId] = draft.photoUrl;
          } else if (draft.removePhoto || !draft.photoFile) {
            const stale = productPhotoBlobRef.current[itemId];
            if (stale) {
              revokeIfBlob(stale);
              delete productPhotoBlobRef.current[itemId];
            }
          }
          if (draft.pendingDelete && draft.isNew) {
            setProductDrafts((prev) => {
              const next = { ...prev };
              delete next[itemId];
              return next;
            });
          } else {
            setProductDrafts((prev) => ({ ...prev, [itemId]: draft }));
          }
          if (draft.pendingDelete) {
            const sectionId = draft.sectionId || findSectionIdForProduct(itemId);
            if (sectionId) {
              setProductOrderDrafts((prev) => {
                const current = prev[sectionId];
                if (!current) return prev;
                return {
                  ...prev,
                  [sectionId]: current.filter((id) => id !== itemId),
                };
              });
            }
          }
          setSaveState('idle');
          setSaveError('');
        }}
      />

      <VisualSectionEditDialog
        open={Boolean(editingSectionId && editingSectionInitial)}
        sectionId={editingSectionId}
        initial={editingSectionInitial}
        onClose={() => {
          setEditingSectionId(null);
          clearPreviewSelection();
        }}
        onApply={(sectionId, draft) => {
          if (draft.pendingDelete && draft.isNew) {
            setSectionDrafts((prev) => {
              const next = { ...prev };
              delete next[sectionId];
              return next;
            });
            setProductDrafts((prev) => {
              const next = { ...prev };
              Object.entries(next).forEach(([itemId, itemDraft]) => {
                if (itemDraft.sectionId === sectionId) delete next[itemId];
              });
              return next;
            });
          } else {
            setSectionDrafts((prev) => ({ ...prev, [sectionId]: draft }));
          }
          setSaveState('idle');
          setSaveError('');
        }}
        onAddProduct={(sectionId) => {
          setEditingSectionId(null);
          openNewProduct(sectionId);
        }}
      />

      <VisualFooterEditDialog
        open={footerEditOpen}
        initial={draftContact}
        onClose={() => {
          setFooterEditOpen(false);
          clearPreviewSelection();
        }}
        onApply={(draft) => {
          setDraftContact(draft);
          setSaveState('idle');
          setSaveError('');
        }}
      />
    </div>
  );
}
