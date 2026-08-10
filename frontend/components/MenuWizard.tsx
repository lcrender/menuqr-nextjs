import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { Trans, useTranslation } from 'react-i18next';
import api, { type AxiosErrorWithMessage } from '../lib/axios';
import { getApiErrorMessage } from '../lib/api-error-message';
import i18n from '../src/i18n/config';
import menuWizardEs from '../src/locales/fragments/menuWizard.es.json';
import menuWizardEn from '../src/locales/fragments/menuWizard.en.json';
import ProductWizard from './ProductWizard';

i18n.addResourceBundle('es-ES', 'translation', { menuWizard: menuWizardEs }, true, true);
i18n.addResourceBundle('en-US', 'translation', { menuWizard: menuWizardEn }, true, true);

interface MenuWizardProps {
  restaurantId: string;
  restaurants: any[];
  onComplete: () => void;
  onCancel?: () => void;
  /** Tras crear un comercio: pantalla inicial crear / asignar / CSV */
  fromRestaurantCreation?: boolean;
  /** Desde admin Menús «Nuevo menú»: misma pantalla inicial sin el texto de comercio recién creado */
  showMenuEntryChoice?: boolean;
}

type EntryPhase = 'pick' | 'create' | 'selectMenus' | 'importCsv';

function looksLikeCsvFile(file: File): boolean {
  const name = file.name.toLowerCase();
  if (name.endsWith('.csv')) return true;
  const t = (file.type || '').toLowerCase();
  return t === 'text/csv' || t === 'application/csv' || t === 'text/comma-separated-values';
}

interface Section {
  id?: string;
  name: string;
  sort: number;
  isActive: boolean;
  tempId?: string; // Para secciones nuevas que aún no tienen ID
}

export default function MenuWizard({
  restaurantId: initialRestaurantId,
  restaurants,
  onComplete,
  onCancel,
  fromRestaurantCreation = false,
  showMenuEntryChoice = false,
}: MenuWizardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const useEntryPickFlow = fromRestaurantCreation || showMenuEntryChoice;
  const [entryPhase, setEntryPhase] = useState<EntryPhase>(
    useEntryPickFlow ? 'pick' : 'create',
  );
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    restaurantId: initialRestaurantId || '',
    name: '',
    description: '',
  });
  const [sections, setSections] = useState<Section[]>([]);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [sectionFormData, setSectionFormData] = useState({
    name: '',
    isActive: true,
  });
  const [draggedSection, setDraggedSection] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showProductWizard, setShowProductWizard] = useState(false);
  const [newMenuId, setNewMenuId] = useState<string | null>(null);
  const [menus, setMenus] = useState<any[]>([]);

  const [assignableMenus, setAssignableMenus] = useState<any[]>([]);
  const [loadingAssignable, setLoadingAssignable] = useState(false);
  const [assignableError, setAssignableError] = useState('');
  const [selectedMenuIds, setSelectedMenuIds] = useState<string[]>([]);

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvSubmitting, setCsvSubmitting] = useState(false);
  const [csvError, setCsvError] = useState('');
  const [csvTargetRestaurantId, setCsvTargetRestaurantId] = useState(
    () => initialRestaurantId || '',
  );
  const [csvMenuName, setCsvMenuName] = useState('');
  const [csvMenuDescription, setCsvMenuDescription] = useState('');
  const csvInputRef = useRef<HTMLInputElement>(null);
  /** Comercio destino al asignar menús existentes (admin Menús sin `initialRestaurantId`) */
  const [assignMenuRestaurantId, setAssignMenuRestaurantId] = useState('');

  const clearCsvFile = useCallback(() => {
    setCsvFile(null);
    setCsvError('');
    if (csvInputRef.current) csvInputRef.current.value = '';
  }, []);

  const handleCsvInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (looksLikeCsvFile(file)) {
      setCsvFile(file);
      setCsvError('');
    } else {
      setCsvError(t('menuWizard.importCsv.invalidCsvPick'));
    }
    e.target.value = '';
  };

  const handleCsvDropZoneDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleCsvDropZoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (looksLikeCsvFile(file)) {
      setCsvFile(file);
      setCsvError('');
    } else {
      setCsvError(t('menuWizard.importCsv.invalidCsvDrop'));
    }
  };

  const getTenantIdForSuperAdmin = useCallback(
    (restaurantId?: string): string | null => {
      if (typeof window === 'undefined') return null;
      try {
        const u = JSON.parse(localStorage.getItem('user') || 'null');
        if (u?.role !== 'SUPER_ADMIN') return null;
        const rid = restaurantId || initialRestaurantId || formData.restaurantId;
        const r = restaurants.find((x) => x.id === rid);
        return r?.tenantId ?? r?.tenant_id ?? null;
      } catch {
        return null;
      }
    },
    [restaurants, initialRestaurantId, formData.restaurantId],
  );

  const assignFetchRestaurantId =
    initialRestaurantId || assignMenuRestaurantId || formData.restaurantId || '';

  useEffect(() => {
    if (entryPhase !== 'selectMenus' || !assignFetchRestaurantId) return;
    let cancelled = false;
    (async () => {
      setLoadingAssignable(true);
      setAssignableError('');
      try {
        const tenantId = getTenantIdForSuperAdmin(assignFetchRestaurantId);
        const params: Record<string, string> = { targetRestaurantId: assignFetchRestaurantId };
        if (tenantId) params.tenantId = tenantId;
        const res = await api.get('/menus/assignable', { params });
        if (!cancelled) setAssignableMenus(Array.isArray(res.data) ? res.data : []);
      } catch (e: any) {
        if (!cancelled) {
          setAssignableError(
            e.response?.data?.message || t('menuWizard.selectMenus.loadError'),
          );
          setAssignableMenus([]);
        }
      } finally {
        if (!cancelled) setLoadingAssignable(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [entryPhase, assignFetchRestaurantId, getTenantIdForSuperAdmin, t]);

  // Si solo hay un comercio, usar ese automáticamente
  useEffect(() => {
    if (initialRestaurantId) {
      setFormData(prev => ({ ...prev, restaurantId: initialRestaurantId }));
    } else if (restaurants.length === 1 && !formData.restaurantId) {
      setFormData(prev => ({ ...prev, restaurantId: restaurants[0].id }));
    }
  }, [restaurants, initialRestaurantId, formData.restaurantId]);

  useEffect(() => {
    if (initialRestaurantId) {
      setAssignMenuRestaurantId(initialRestaurantId);
    }
  }, [initialRestaurantId]);

  const handleCreateNew = () => {
    setEntryPhase('create');
    setCurrentStep(1);
  };

  const handleSelectExisting = () => {
    setSelectedMenuIds([]);
    const rid = initialRestaurantId || formData.restaurantId || restaurants[0]?.id || '';
    setAssignMenuRestaurantId(rid);
    setEntryPhase('selectMenus');
  };

  const handleImportCsv = () => {
    setCsvFile(null);
    setCsvError('');
    setCsvMenuName('');
    setCsvMenuDescription('');
    setCsvTargetRestaurantId(initialRestaurantId || restaurants[0]?.id || '');
    setEntryPhase('importCsv');
  };

  const toggleMenuSelection = (menuId: string) => {
    setSelectedMenuIds((prev) =>
      prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId],
    );
  };

  const handleConfirmAssignMenus = async () => {
    if (selectedMenuIds.length === 0) {
      alert(t('menuWizard.selectMenus.selectAtLeastOne'));
      return;
    }
    const targetRestaurantId =
      initialRestaurantId || assignMenuRestaurantId || formData.restaurantId || '';
    if (!targetRestaurantId.trim()) {
      alert(t('menuWizard.selectMenus.selectTargetBusiness'));
      return;
    }
    setLoading(true);
    const tenantId = getTenantIdForSuperAdmin(targetRestaurantId);
    try {
      await Promise.all(
        selectedMenuIds.map((id) =>
          api.put(`/menus/${id}`, {
            restaurantId: targetRestaurantId,
            ...(tenantId ? { tenantId } : {}),
          }),
        ),
      );
      onComplete();
    } catch (e: any) {
      alert(e.response?.data?.message || t('menuWizard.selectMenus.assignError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCsvImport = async () => {
    if (!csvFile) {
      alert(t('menuWizard.importCsv.selectFile'));
      return;
    }
    if (!csvTargetRestaurantId.trim()) {
      alert(t('menuWizard.importCsv.selectBusinessAlert'));
      return;
    }
    if (!csvMenuName.trim()) {
      alert(t('menuWizard.importCsv.enterMenuName'));
      return;
    }
    setCsvSubmitting(true);
    setCsvError('');
    try {
      const fd = new FormData();
      fd.append('file', csvFile);
      fd.append('targetRestaurantId', csvTargetRestaurantId.trim());
      fd.append('menuName', csvMenuName.trim());
      if (csvMenuDescription.trim()) {
        fd.append('menuDescription', csvMenuDescription.trim());
      }
      const tenantId = getTenantIdForSuperAdmin(csvTargetRestaurantId.trim());
      if (tenantId) fd.append('tenantId', tenantId);
      const res = await api.post('/menus/import-csv', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const warnings = res.data?.warnings;
      try {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(
            'menuCsvImportFlash',
            JSON.stringify({
              ok: true,
              warnings: Array.isArray(warnings) ? warnings : [],
            }),
          );
        }
      } catch {
        /* ignore */
      }
      await router.push('/admin/menus');
      onComplete();
    } catch (e: any) {
      const m = e.response?.data?.message;
      const text = Array.isArray(m) ? m.join(', ') : m || t('menuWizard.importCsv.importError');
      setCsvError(text);
      alert(t('menuWizard.importCsv.importFailedAlert', { detail: text }));
    } finally {
      setCsvSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Validar que tenga nombre
      if (!formData.name.trim()) {
        alert(t('menuWizard.create.enterMenuName'));
        return;
      }
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    if (entryPhase === 'selectMenus' || entryPhase === 'importCsv') {
      setEntryPhase('pick');
      setCsvFile(null);
      setCsvError('');
      setCsvMenuName('');
      setCsvMenuDescription('');
      setCsvTargetRestaurantId(initialRestaurantId || restaurants[0]?.id || '');
      setSelectedMenuIds([]);
      setAssignMenuRestaurantId(initialRestaurantId || '');
      return;
    }
    if (currentStep === 1) {
      if (useEntryPickFlow) {
        setEntryPhase('pick');
      } else if (onCancel) {
        onCancel();
      }
      return;
    }
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  // Gestión de secciones
  const handleAddSection = () => {
    if (!sectionFormData.name.trim()) {
      alert(t('menuWizard.sections.enterName'));
      return;
    }

    const newSection: Section = {
      tempId: `temp-${Date.now()}`,
      name: sectionFormData.name.trim(),
      sort: sections.length,
      isActive: sectionFormData.isActive,
    };

    setSections([...sections, newSection]);
    setSectionFormData({ name: '', isActive: true });
  };

  const handleEditSection = (index: number) => {
    const section = sections[index];
    if (!section) return;
    setEditingSection(section);
    setSectionFormData({
      name: section.name,
      isActive: section.isActive,
    });
  };

  const handleUpdateSection = () => {
    if (!editingSection || !sectionFormData.name.trim()) {
      return;
    }

    const index = sections.findIndex(s => 
      (s.id && s.id === editingSection.id) || 
      (s.tempId && s.tempId === editingSection.tempId)
    );

    if (index !== -1) {
      const updated = [...sections];
      const existing = updated[index];
      if (!existing) return;
      updated[index] = {
        ...existing,
        name: sectionFormData.name.trim(),
        isActive: sectionFormData.isActive,
        sort: existing.sort,
      };
      setSections(updated);
    }

    setEditingSection(null);
    setSectionFormData({ name: '', isActive: true });
  };

  const handleDeleteSection = (index: number) => {
    if (!confirm(t('menuWizard.sections.confirmDelete'))) return;
    
    const updated = sections.filter((_, i) => i !== index);
    // Reordenar los índices
    const reordered = updated.map((section, i) => ({ ...section, sort: i }));
    setSections(reordered);
  };

  const handleToggleSectionActive = (index: number) => {
    const section = sections[index];
    if (!section) return;
    const updated = [...sections];
    updated[index] = { ...section, isActive: !section.isActive, sort: section.sort };
    setSections(updated);
  };

  // Drag and Drop
  const handleDragStart = (index: number) => {
    setDraggedSection(index);
  };

  const handleDragOver = (e: React.DragEvent, _index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedSection === null || draggedSection === dropIndex) {
      setDraggedSection(null);
      return;
    }

    const updated = [...sections];
    const draggedItem = updated[draggedSection];
    if (!draggedItem) {
      setDraggedSection(null);
      return;
    }

    // Remover el item arrastrado
    updated.splice(draggedSection, 1);
    // Insertar en la nueva posición
    updated.splice(dropIndex, 0, draggedItem);
    // Actualizar el orden
    const reordered = updated.map((section, i) => ({ ...section, sort: i }));
    setSections(reordered);
    setDraggedSection(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 2) {
      // Validar que haya al menos una sección activa
      const activeSections = sections.filter(section => section.isActive);
      if (activeSections.length === 0) {
        if (sections.length === 0) {
          alert(t('menuWizard.sections.needActiveEmpty'));
        } else {
          alert(t('menuWizard.sections.needActiveInactive'));
        }
        return;
      }

      // Guardar el menú y las secciones
      setLoading(true);
      try {
        // Primero crear el menú
        const tenantId = getTenantIdForSuperAdmin(formData.restaurantId);
        const menuData: Record<string, unknown> = {
          restaurantId: formData.restaurantId,
          name: formData.name,
          description: formData.description || undefined,
        };
        if (tenantId) menuData.tenantId = tenantId;

        const res = await api.post('/menus', menuData);
        const createdMenuId = res.data.id;
        
        // Luego crear las secciones (solo las activas)
        if (activeSections.length > 0) {
          const sectionsPromises = activeSections.map((section, index) =>
            api.post('/menu-sections', {
              menuId: createdMenuId,
              name: section.name,
              sort: index,
              isActive: section.isActive,
              ...(tenantId ? { tenantId } : {}),
            })
          );
          
          await Promise.all(sectionsPromises);
        }
        
        // Cargar lista de menús para el wizard de productos
        try {
          const menusRes = await api.get('/menus');
          setMenus(menusRes.data);
        } catch (err) {
          setMenus([{ id: createdMenuId, name: formData.name }]);
        }
        
        // Abrir wizard de productos
        setNewMenuId(createdMenuId);
        setShowProductWizard(true);
      } catch (error: any) {
        alert(
          (error as AxiosErrorWithMessage).userMessage ||
            getApiErrorMessage(error, t('menuWizard.create.createError')),
        );
      } finally {
        setLoading(false);
      }
    } else {
      handleNext();
    }
  };

  const handleProductWizardComplete = () => {
    setShowProductWizard(false);
    setNewMenuId(null);
    onComplete();
  };

  const handleProductWizardCancel = () => {
    setShowProductWizard(false);
    setNewMenuId(null);
    onComplete();
  };

  // Obtener la moneda por defecto del comercio
  const getDefaultCurrency = () => {
    if (formData.restaurantId) {
      const restaurant = restaurants.find(r => r.id === formData.restaurantId);
      return restaurant?.defaultCurrency || 'USD';
    }
    return 'USD';
  };

  // Mostrar wizard de productos si se acaba de crear un menú
  if (showProductWizard && newMenuId) {
    return (
      <ProductWizard
        menuId={newMenuId}
        menus={menus.length > 0 ? menus : []}
        restaurants={restaurants}
        {...(formData.restaurantId || initialRestaurantId
          ? { initialRestaurantId: formData.restaurantId || initialRestaurantId }
          : {})}
        defaultCurrency={getDefaultCurrency()}
        onComplete={handleProductWizardComplete}
        onCancel={handleProductWizardCancel}
        onPublishMenu={handleProductWizardComplete}
      />
    );
  }

  // Pantalla inicial: crear / asignar / CSV (tras nuevo comercio o desde admin Menús)
  if (useEntryPickFlow && entryPhase === 'pick') {
    const pickTitle = fromRestaurantCreation
      ? t('menuWizard.entry.titleCreated')
      : t('menuWizard.entry.titleNew');
    const pickSubtitle = fromRestaurantCreation
      ? t('menuWizard.entry.subtitleCreated')
      : t('menuWizard.entry.subtitleNew');
    return (
      <div className="restaurant-wizard">
        <div className="wizard-header">
          <h2 className="wizard-title">{pickTitle}</h2>
          <p className="wizard-subtitle">{pickSubtitle}</p>
        </div>

        <div className="wizard-options wizard-options--three">
          <div 
            className="wizard-option-card"
            onClick={handleCreateNew}
          >
            <div className="wizard-option-icon">➕</div>
            <h3 className="wizard-option-title">{t('menuWizard.entry.createTitle')}</h3>
            <p className="wizard-option-description">
              {t('menuWizard.entry.createDesc')}
            </p>
          </div>

          <div 
            className="wizard-option-card"
            onClick={handleSelectExisting}
          >
            <div className="wizard-option-icon">📋</div>
            <h3 className="wizard-option-title">{t('menuWizard.entry.selectTitle')}</h3>
            <p className="wizard-option-description">
              {t('menuWizard.entry.selectDesc')}
            </p>
          </div>

          <div 
            className="wizard-option-card"
            onClick={handleImportCsv}
          >
            <div className="wizard-option-icon">📥</div>
            <h3 className="wizard-option-title">{t('menuWizard.entry.importTitle')}</h3>
            <p className="wizard-option-description">
              {t('menuWizard.entry.importDesc')}
            </p>
          </div>
        </div>

        {onCancel && (
          <div className="wizard-footer" style={{ marginTop: '40px' }}>
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={onCancel}
            >
              {fromRestaurantCreation ? t('menuWizard.entry.skip') : t('menuWizard.entry.cancel')}
            </button>
          </div>
        )}
      </div>
    );
  }

  if (useEntryPickFlow && entryPhase === 'selectMenus') {
    const targetRid = initialRestaurantId || assignMenuRestaurantId || formData.restaurantId || '';
    const rName = restaurants.find((r) => r.id === targetRid)?.name || t('menuWizard.selectMenus.thisBusiness');
    return (
      <div className="restaurant-wizard">
        <div className="wizard-header">
          <h2 className="wizard-title">{t('menuWizard.selectMenus.title')}</h2>
          <p className="wizard-subtitle">
            <Trans
              i18nKey="menuWizard.selectMenus.subtitle"
              values={{ name: rName }}
              components={{ strong: <strong /> }}
            />
          </p>
        </div>

        <div className="wizard-fields-container" style={{ maxWidth: 720, margin: '0 auto' }}>
          {!initialRestaurantId && restaurants.length > 1 && (
            <div className="wizard-field wizard-field-large" style={{ marginBottom: 20 }}>
              <label className="wizard-label" htmlFor="assign-menu-restaurant">
                {t('menuWizard.selectMenus.targetBusiness')}
              </label>
              <select
                id="assign-menu-restaurant"
                className="admin-form-control"
                value={assignMenuRestaurantId}
                onChange={(e) => setAssignMenuRestaurantId(e.target.value)}
                disabled={loadingAssignable}
              >
                <option value="">{t('menuWizard.selectMenus.selectBusiness')}</option>
                {restaurants.map((rest: { id: string; name: string }) => (
                  <option key={rest.id} value={rest.id}>
                    {rest.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {loadingAssignable && <p>{t('menuWizard.selectMenus.loading')}</p>}
          {assignableError && (
            <p style={{ color: '#c0392b' }}>{assignableError}</p>
          )}
          {!loadingAssignable && !assignableError && assignableMenus.length === 0 && (
            <p className="wizard-step-description">
              {t('menuWizard.selectMenus.empty')}
            </p>
          )}
          {!loadingAssignable && assignableMenus.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {assignableMenus.map((m) => (
                <li
                  key={m.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '14px 16px',
                    border: '1px solid var(--admin-border)',
                    borderRadius: 12,
                    marginBottom: 10,
                    background: 'white',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedMenuIds.includes(m.id)}
                    onChange={() => toggleMenuSelection(m.id)}
                    style={{ marginTop: 4 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{m.name}</div>
                    {m.description ? (
                      <div style={{ fontSize: '0.9rem', color: 'var(--admin-text-muted)', marginTop: 4 }}>
                        {m.description}
                      </div>
                    ) : null}
                    {m.assignedRestaurantName ? (
                      <div style={{ fontSize: '0.85rem', marginTop: 6 }}>
                        {t('menuWizard.selectMenus.currentlyAt')}{' '}
                        <strong>{m.assignedRestaurantName}</strong>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.85rem', marginTop: 6, color: 'var(--admin-text-muted)' }}>
                        {t('menuWizard.selectMenus.unassigned')}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="wizard-footer" style={{ marginTop: 32 }}>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={handleBack}
            disabled={loading}
          >
            {t('menuWizard.footer.back')}
          </button>
          <div className="wizard-footer-right">
            <button
              type="button"
              className="admin-btn"
              onClick={handleConfirmAssignMenus}
              disabled={loading || loadingAssignable || selectedMenuIds.length === 0}
            >
              {loading
                ? t('menuWizard.selectMenus.saving')
                : t('menuWizard.selectMenus.assign', { count: selectedMenuIds.length })}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (useEntryPickFlow && entryPhase === 'importCsv') {
    const templateHref = '/templates/menu-import-ejemplo.csv';
    return (
      <div className="restaurant-wizard">
        <div className="wizard-header">
          <h2 className="wizard-title" style={{ marginBottom: '1rem' }}>
            {t('menuWizard.importCsv.title')}
          </h2>
          <div className="wizard-subtitle" style={{ textAlign: 'left', maxWidth: 640, margin: '0 auto' }}>
            <p className="mb-3" style={{ lineHeight: 1.55 }}>
              <Trans
                i18nKey="menuWizard.importCsv.intro1"
                components={{ strong: <strong /> }}
              />
            </p>
            <p className="mb-3" style={{ lineHeight: 1.55 }}>
              <Trans
                i18nKey="menuWizard.importCsv.intro2"
                components={{ strong: <strong />, code: <code /> }}
              />
            </p>
            <p className="mb-3" style={{ lineHeight: 1.55 }}>
              <Trans
                i18nKey="menuWizard.importCsv.intro3"
                components={{ strong: <strong /> }}
              />
            </p>
            <p className="mb-0" style={{ lineHeight: 1.55 }}>
              <Trans
                i18nKey="menuWizard.importCsv.intro4"
                components={{
                  docs: (
                    <a
                      href="/documentacion/importar-menu-csv"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--admin-primary)', fontWeight: 600 }}
                    />
                  ),
                }}
              />
            </p>
          </div>
        </div>

        <div className="wizard-fields-container" style={{ maxWidth: 640, margin: '0 auto' }}>
          <p className="wizard-step-description" style={{ marginBottom: 16 }}>
            <Trans
              i18nKey="menuWizard.importCsv.templateHint"
              components={{ code: <code /> }}
            />
          </p>
          <p style={{ marginBottom: 20 }}>
            <a href={templateHref} download className="admin-btn admin-btn-secondary" style={{ display: 'inline-block', textDecoration: 'none' }}>
              {t('menuWizard.importCsv.downloadTemplate')}
            </a>
          </p>
          <div className="wizard-field wizard-field-large">
            <label className="wizard-label" htmlFor="csv-restaurant">
              {t('menuWizard.importCsv.businessLabel')}
            </label>
            <select
              id="csv-restaurant"
              className="admin-form-control"
              value={csvTargetRestaurantId}
              onChange={(e) => setCsvTargetRestaurantId(e.target.value)}
              disabled={csvSubmitting}
            >
              <option value="">{t('menuWizard.importCsv.selectBusiness')}</option>
              {restaurants.map((rest: { id: string; name: string }) => (
                <option key={rest.id} value={rest.id}>
                  {rest.name}
                </option>
              ))}
            </select>
          </div>
          <div className="wizard-field wizard-field-large">
            <label className="wizard-label" htmlFor="csv-menu-name">
              {t('menuWizard.importCsv.menuNameLabel')}
            </label>
            <input
              id="csv-menu-name"
              type="text"
              className="admin-form-control"
              value={csvMenuName}
              onChange={(e) => setCsvMenuName(e.target.value)}
              placeholder={t('menuWizard.importCsv.menuNamePlaceholder')}
              disabled={csvSubmitting}
            />
          </div>
          <div className="wizard-field wizard-field-large">
            <label className="wizard-label" htmlFor="csv-menu-desc">
              {t('menuWizard.importCsv.menuDescLabel')}{' '}
              <span style={{ fontWeight: 400, color: 'var(--admin-text-muted)' }}>
                {t('menuWizard.importCsv.optional')}
              </span>
            </label>
            <textarea
              id="csv-menu-desc"
              className="admin-form-control"
              rows={2}
              value={csvMenuDescription}
              onChange={(e) => setCsvMenuDescription(e.target.value)}
              placeholder={t('menuWizard.importCsv.menuDescPlaceholder')}
              disabled={csvSubmitting}
            />
          </div>
          <div className="wizard-field wizard-field-large">
            <label className="wizard-label">{t('menuWizard.importCsv.fileLabel')}</label>
            <div
              className={`wizard-image-upload-zone ${csvFile ? 'wizard-csv-upload-zone--has-file' : ''}`}
              onClick={() => !csvSubmitting && csvInputRef.current?.click()}
              onDrop={handleCsvDropZoneDrop}
              onDragOver={handleCsvDropZoneDragOver}
              style={{ cursor: csvSubmitting ? 'not-allowed' : 'pointer', opacity: csvSubmitting ? 0.7 : 1 }}
            >
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv,text/csv,text/comma-separated-values"
                style={{ display: 'none' }}
                onChange={handleCsvInputChange}
                disabled={csvSubmitting}
              />
              {csvFile ? (
                <div className="wizard-csv-file-inner">
                  <div className="wizard-upload-icon" aria-hidden>
                    📄
                  </div>
                  <span className="wizard-upload-text">{csvFile.name}</span>
                  <span className="wizard-upload-hint">
                    {t('menuWizard.importCsv.fileChangeHint', {
                      size: (csvFile.size / 1024).toFixed(1),
                    })}
                  </span>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm mt-1"
                    onClick={(ev) => {
                      ev.preventDefault();
                      ev.stopPropagation();
                      clearCsvFile();
                    }}
                    disabled={csvSubmitting}
                  >
                    {t('menuWizard.importCsv.removeFile')}
                  </button>
                </div>
              ) : (
                <div className="wizard-upload-placeholder">
                  <div className="wizard-upload-icon" aria-hidden>
                    📄
                  </div>
                  <span className="wizard-upload-text">{t('menuWizard.importCsv.dropHint')}</span>
                  <span className="wizard-upload-hint">{t('menuWizard.importCsv.csvOnly')}</span>
                </div>
              )}
            </div>
          </div>
          {csvError && (
            <p style={{ color: '#c0392b', marginTop: 12 }}>{csvError}</p>
          )}
        </div>

        <div className="wizard-footer" style={{ marginTop: 32 }}>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={handleBack}
            disabled={csvSubmitting}
          >
            {t('menuWizard.footer.back')}
          </button>
          <div className="wizard-footer-right">
            <button
              type="button"
              className="admin-btn"
              onClick={handleSubmitCsvImport}
              disabled={
                csvSubmitting || !csvFile || !csvTargetRestaurantId.trim() || !csvMenuName.trim()
              }
            >
              {csvSubmitting ? t('menuWizard.importCsv.importing') : t('menuWizard.importCsv.import')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Wizard de creación de menú
  const totalSteps = 2;
  return (
    <div className="restaurant-wizard">
      <div className="wizard-header">
        <h2 className="wizard-title">{t('menuWizard.create.title')}</h2>
        <p className="wizard-subtitle">{t('menuWizard.create.subtitle')}</p>
      </div>

      {/* Progress bar */}
      <div className="wizard-progress">
        <div className="wizard-progress-bar">
          <div 
            className="wizard-progress-fill" 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
        <div className="wizard-steps">
          <div className={`wizard-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <div className="wizard-step-number">1</div>
            <div className="wizard-step-label">{t('menuWizard.create.stepInfo')}</div>
          </div>
          <div className={`wizard-step ${currentStep >= 2 ? 'active' : ''}`}>
            <div className="wizard-step-number">2</div>
            <div className="wizard-step-label">{t('menuWizard.create.stepSections')}</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="wizard-form">
        {currentStep === 1 && (
          <div className="wizard-step-content wizard-step-centered">
            <div className="wizard-step-header">
              <h3 className="wizard-step-title">{t('menuWizard.create.basicTitle')}</h3>
              <p className="wizard-step-description">{t('menuWizard.create.basicDesc')}</p>
            </div>

            <div className="wizard-fields-container">
              {/* Selector de comercio (solo si hay más de uno) */}
              {restaurants.length > 1 && (
                <div className="wizard-field wizard-field-large">
                  <label className="wizard-label">{t('menuWizard.create.businessLabel')}</label>
                  <select
                    className="admin-form-control wizard-input-large"
                    value={formData.restaurantId}
                    onChange={(e) => setFormData({ ...formData, restaurantId: e.target.value })}
                    required
                  >
                    <option value="">{t('menuWizard.create.selectBusiness')}</option>
                    {restaurants.map((restaurant) => (
                      <option key={restaurant.id} value={restaurant.id}>
                        {restaurant.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Nombre del menú */}
              <div className="wizard-field wizard-field-large">
                <label className="wizard-label">{t('menuWizard.create.menuNameLabel')}</label>
                <input
                  type="text"
                  className="admin-form-control wizard-input-large"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('menuWizard.create.menuNamePlaceholder')}
                  required
                />
              </div>

              {/* Descripción */}
              <div className="wizard-field wizard-field-large">
                <label className="wizard-label">{t('menuWizard.create.descriptionLabel')}</label>
                <textarea
                  className="admin-form-control wizard-textarea-large"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('menuWizard.create.descriptionPlaceholder')}
                  rows={4}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="wizard-step-content wizard-step-centered">
            <div className="wizard-step-header">
              <h3 className="wizard-step-title">{t('menuWizard.sections.title')}</h3>
              <p className="wizard-step-description">
                <Trans
                  i18nKey="menuWizard.sections.description"
                  components={{ strong: <strong /> }}
                />
              </p>
            </div>

            <div className="wizard-fields-container">
              {/* Formulario para agregar/editar sección */}
              <div className="wizard-section-form">
                <div className="wizard-section-form-row">
                  <div className="wizard-section-form-field">
                    <label className="wizard-label">{t('menuWizard.sections.nameLabel')}</label>
                    <input
                      type="text"
                      className="admin-form-control"
                      value={sectionFormData.name}
                      onChange={(e) => setSectionFormData({ ...sectionFormData, name: e.target.value })}
                      placeholder={t('menuWizard.sections.namePlaceholder')}
                    />
                  </div>
                  <div className="wizard-section-form-field">
                    <label className="wizard-label">{t('menuWizard.sections.statusLabel')}</label>
                    <select
                      className="admin-form-control"
                      value={sectionFormData.isActive ? 'true' : 'false'}
                      onChange={(e) => setSectionFormData({ ...sectionFormData, isActive: e.target.value === 'true' })}
                    >
                      <option value="true">{t('menuWizard.sections.active')}</option>
                      <option value="false">{t('menuWizard.sections.inactive')}</option>
                    </select>
                  </div>
                  <div className="wizard-section-form-actions">
                    {editingSection ? (
                      <>
                        <button
                          type="button"
                          className="admin-btn"
                          onClick={handleUpdateSection}
                        >
                          {t('menuWizard.sections.update')}
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn-secondary"
                          onClick={() => {
                            setEditingSection(null);
                            setSectionFormData({ name: '', isActive: true });
                          }}
                        >
                          {t('menuWizard.sections.cancel')}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="admin-btn"
                        onClick={handleAddSection}
                      >
                        {t('menuWizard.sections.add')}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Lista de secciones con drag and drop */}
              {sections.length === 0 ? (
                <div className="wizard-empty-state">
                  <p>
                    <Trans
                      i18nKey="menuWizard.sections.empty"
                      components={{ strong: <strong /> }}
                    />
                  </p>
                </div>
              ) : (
                <div className="wizard-sections-list">
                  {sections.map((section, index) => (
                    <div
                      key={section.id || section.tempId || index}
                      className={`wizard-section-item ${draggedSection === index ? 'dragging' : ''}`}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      <div className="wizard-section-drag-handle">
                        <span>☰</span>
                      </div>
                      <div className="wizard-section-content">
                        <div className="wizard-section-info">
                          <span className="wizard-section-order">{index + 1}</span>
                          <span className="wizard-section-name">{section.name}</span>
                          <span 
                            className={`wizard-section-badge ${section.isActive ? 'active' : 'inactive'}`}
                            onClick={() => handleToggleSectionActive(index)}
                            style={{ 
                              cursor: 'pointer',
                              userSelect: 'none'
                            }}
                            title={t('menuWizard.sections.toggleTitle', {
                              action: section.isActive
                                ? t('menuWizard.sections.deactivate')
                                : t('menuWizard.sections.activate'),
                            })}
                          >
                            {section.isActive
                              ? t('menuWizard.sections.active')
                              : t('menuWizard.sections.inactive')}
                          </span>
                        </div>
                      </div>
                      <div className="wizard-section-actions">
                        <button
                          type="button"
                          className="admin-btn admin-btn-sm"
                          onClick={() => handleEditSection(index)}
                        >
                          {t('menuWizard.sections.edit')}
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn-sm admin-btn-danger"
                          onClick={() => handleDeleteSection(index)}
                        >
                          {t('menuWizard.sections.delete')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Wizard footer */}
        <div className="wizard-footer">
          <button 
            type="button" 
            className="admin-btn admin-btn-secondary"
            onClick={handleBack}
            disabled={loading}
          >
            {useEntryPickFlow && currentStep === 1
              ? t('menuWizard.footer.back')
              : t('menuWizard.footer.previous')}
          </button>
          <div className="wizard-footer-right">
            {onCancel && currentStep === 1 && (
              <button 
                type="button" 
                className="admin-btn admin-btn-secondary"
                onClick={onCancel}
                disabled={loading}
              >
                {t('menuWizard.footer.cancel')}
              </button>
            )}
            {currentStep < totalSteps ? (
              <button 
                type="submit" 
                className="admin-btn"
                disabled={loading || (currentStep === 1 && !formData.name.trim())}
              >
                {t('menuWizard.footer.next')}
              </button>
            ) : (
              <>
                <button 
                  type="submit" 
                  className="admin-btn"
                  disabled={loading || sections.filter(s => s.isActive).length === 0}
                  title={
                    sections.filter(s => s.isActive).length === 0
                      ? t('menuWizard.sections.needActiveTitle')
                      : ''
                  }
                >
                  {loading
                    ? t('menuWizard.footer.saving')
                    : t('menuWizard.footer.createMenu')}
                </button>
                {sections.filter(s => s.isActive).length === 0 && sections.length > 0 && (
                  <p style={{ 
                    color: '#dc3545', 
                    fontSize: '0.875rem', 
                    marginTop: '8px',
                    marginBottom: 0
                  }}>
                    {t('menuWizard.sections.needActiveWarning')}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
