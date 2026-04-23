import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import api from '../lib/axios';
import ProductWizard from './ProductWizard';

interface MenuWizardProps {
  restaurantId: string;
  restaurants: any[];
  onComplete: () => void;
  onCancel?: () => void;
  /** Tras crear un restaurante: pantalla inicial crear / asignar / CSV */
  fromRestaurantCreation?: boolean;
  /** Desde admin Menús «Nuevo menú»: misma pantalla inicial sin el texto de restaurante recién creado */
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
  /** Restaurante destino al asignar menús existentes (admin Menús sin `initialRestaurantId`) */
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
      setCsvError('Elegí un archivo .csv válido.');
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
      setCsvError('Soltá un archivo .csv válido.');
    }
  };

  const getTenantIdForSuperAdmin = useCallback(
    (restaurantId?: string): string | null => {
      if (typeof window === 'undefined') return null;
      try {
        const u = JSON.parse(localStorage.getItem('user') || 'null');
        if (u?.role !== 'SUPER_ADMIN') return null;
        const rid = restaurantId || initialRestaurantId;
        const r = restaurants.find((x) => x.id === rid);
        return r?.tenantId ?? r?.tenant_id ?? null;
      } catch {
        return null;
      }
    },
    [restaurants, initialRestaurantId],
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
            e.response?.data?.message || 'No se pudieron cargar los menús asignables',
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
  }, [entryPhase, assignFetchRestaurantId, getTenantIdForSuperAdmin]);

  // Si solo hay un restaurante, usar ese automáticamente
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
      alert('Seleccioná al menos un menú para asignar a este restaurante.');
      return;
    }
    const targetRestaurantId =
      initialRestaurantId || assignMenuRestaurantId || formData.restaurantId || '';
    if (!targetRestaurantId.trim()) {
      alert('Seleccioná el restaurante al que querés vincular los menús.');
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
      alert(e.response?.data?.message || 'Error al asignar los menús');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCsvImport = async () => {
    if (!csvFile) {
      alert('Seleccioná un archivo CSV.');
      return;
    }
    if (!csvTargetRestaurantId.trim()) {
      alert('Seleccioná el restaurante al que querés importar el menú.');
      return;
    }
    if (!csvMenuName.trim()) {
      alert('Ingresá el nombre del menú.');
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
      const text = Array.isArray(m) ? m.join(', ') : m || 'Error al importar el CSV';
      setCsvError(text);
      alert(
        `No se pudo crear el menú desde el CSV.\n\n${text}\n\nRevisá el archivo y volvé a intentar; seguís en esta pantalla para corregirlo.`,
      );
    } finally {
      setCsvSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Validar que tenga nombre
      if (!formData.name.trim()) {
        alert('Por favor ingresa un nombre para el menú');
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
      alert('Por favor ingresa un nombre para la sección');
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
    if (!confirm('¿Estás seguro de eliminar esta sección?')) return;
    
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
          alert('Debes agregar al menos una sección activa antes de crear el menú. Por favor, agrega una sección usando el formulario de arriba.');
        } else {
          alert('Debes tener al menos una sección activa antes de crear el menú. Tienes secciones creadas pero todas están inactivas. Por favor, edita una sección y márcala como "Activa".');
        }
        return;
      }

      // Guardar el menú y las secciones
      setLoading(true);
      try {
        // Primero crear el menú
        const tenantId = getTenantIdForSuperAdmin();
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
        alert(error.response?.data?.message || 'Error creando menú');
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

  // Obtener la moneda por defecto del restaurante
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

  // Pantalla inicial: crear / asignar / CSV (tras nuevo restaurante o desde admin Menús)
  if (useEntryPickFlow && entryPhase === 'pick') {
    const pickTitle = fromRestaurantCreation
      ? '¡Restaurante creado exitosamente!'
      : 'Nuevo menú';
    const pickSubtitle = fromRestaurantCreation
      ? 'Ahora creá, asigná o importá un menú para tu restaurante'
      : 'Elegí si querés crear un menú desde cero, vincular menús que ya existen o importar con un archivo CSV.';
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
            <h3 className="wizard-option-title">Crear nuevo menú</h3>
            <p className="wizard-option-description">
              Crea un menú desde cero con nombre y descripción
            </p>
          </div>

          <div 
            className="wizard-option-card"
            onClick={handleSelectExisting}
          >
            <div className="wizard-option-icon">📋</div>
            <h3 className="wizard-option-title">Seleccionar menús existentes</h3>
            <p className="wizard-option-description">
              Asigná menús que ya creaste (sin local u otro local) a este restaurante
            </p>
          </div>

          <div 
            className="wizard-option-card"
            onClick={handleImportCsv}
          >
            <div className="wizard-option-icon">📥</div>
            <h3 className="wizard-option-title">Importar menú con CSV</h3>
            <p className="wizard-option-description">
              Elegís restaurante y nombre del menú en pantalla; el CSV lleva secciones, orden y productos
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
              {fromRestaurantCreation ? 'Omitir por ahora' : 'Cancelar'}
            </button>
          </div>
        )}
      </div>
    );
  }

  if (useEntryPickFlow && entryPhase === 'selectMenus') {
    const targetRid = initialRestaurantId || assignMenuRestaurantId || formData.restaurantId || '';
    const rName = restaurants.find((r) => r.id === targetRid)?.name || 'este restaurante';
    return (
      <div className="restaurant-wizard">
        <div className="wizard-header">
          <h2 className="wizard-title">Seleccionar menús existentes</h2>
          <p className="wizard-subtitle">
            Marcá los menús que querés vincular a <strong>{rName}</strong>. Los menús asignados a otro local pasarán a este.
          </p>
        </div>

        <div className="wizard-fields-container" style={{ maxWidth: 720, margin: '0 auto' }}>
          {!initialRestaurantId && restaurants.length > 1 && (
            <div className="wizard-field wizard-field-large" style={{ marginBottom: 20 }}>
              <label className="wizard-label" htmlFor="assign-menu-restaurant">
                Restaurante destino
              </label>
              <select
                id="assign-menu-restaurant"
                className="admin-form-control"
                value={assignMenuRestaurantId}
                onChange={(e) => setAssignMenuRestaurantId(e.target.value)}
                disabled={loadingAssignable}
              >
                <option value="">Seleccioná un restaurante…</option>
                {restaurants.map((rest: { id: string; name: string }) => (
                  <option key={rest.id} value={rest.id}>
                    {rest.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {loadingAssignable && <p>Cargando menús…</p>}
          {assignableError && (
            <p style={{ color: '#c0392b' }}>{assignableError}</p>
          )}
          {!loadingAssignable && !assignableError && assignableMenus.length === 0 && (
            <p className="wizard-step-description">
              No hay menús disponibles para asignar. Podés crear uno nuevo o importar con CSV.
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
                        Actualmente en: <strong>{m.assignedRestaurantName}</strong>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.85rem', marginTop: 6, color: 'var(--admin-text-muted)' }}>
                        Sin restaurante asignado
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
            ← Volver
          </button>
          <div className="wizard-footer-right">
            <button
              type="button"
              className="admin-btn"
              onClick={handleConfirmAssignMenus}
              disabled={loading || loadingAssignable || selectedMenuIds.length === 0}
            >
              {loading ? 'Guardando…' : `Asignar menús (${selectedMenuIds.length})`}
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
            Importar menú con CSV
          </h2>
          <div className="wizard-subtitle" style={{ textAlign: 'left', maxWidth: 640, margin: '0 auto' }}>
            <p className="mb-3" style={{ lineHeight: 1.55 }}>
              Un archivo CSV = un menú nuevo. Primero elegís el <strong>restaurante</strong> y el <strong>nombre del menú</strong> en esta pantalla.
            </p>
            <p className="mb-3" style={{ lineHeight: 1.55 }}>
              En el CSV, el <strong>orden de las secciones</strong> es el orden en que aparecen por primera vez al leer el archivo de arriba abajo. Repetí el mismo <code>nombre_seccion</code> en cada fila de productos que pertenezcan a esa categoría. El orden se puede ajustar después en <strong>Editar menú</strong>. Cada fila incluye el <strong>producto</strong> con precios, destacado y alérgenos.
            </p>
            <p className="mb-3" style={{ lineHeight: 1.55 }}>
              Luego de la importación podés <strong>modificar el menú y sus productos de forma manual</strong> desde la administración. Si tu plan permite fotos en productos, podés <strong>cargarlas después</strong> desde la edición del menú. El menú queda en <strong>borrador</strong>: en <strong>Menús</strong> usá el botón <strong>Publicar</strong> para que esté visible online.
            </p>
            <p className="mb-0" style={{ lineHeight: 1.55 }}>
              Si querés más información sobre la importación con CSV, visitá la{' '}
              <a
                href="/documentacion#importarMenuCsv"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--admin-primary)', fontWeight: 600 }}
              >
                documentación: importar menú con CSV
              </a>
              .
            </p>
          </div>
        </div>

        <div className="wizard-fields-container" style={{ maxWidth: 640, margin: '0 auto' }}>
          <p className="wizard-step-description" style={{ marginBottom: 16 }}>
            Descargá la plantilla de ejemplo para ver las columnas. El import respeta los límites de menús y productos de tu plan. Si tu CSV incluye la columna <code>nombre_restaurante</code>, debe coincidir con el restaurante elegido abajo; también podés omitir esa columna y usar solo el selector.
          </p>
          <p style={{ marginBottom: 20 }}>
            <a href={templateHref} download className="admin-btn admin-btn-secondary" style={{ display: 'inline-block', textDecoration: 'none' }}>
              Descargar plantilla de ejemplo (CSV)
            </a>
          </p>
          <div className="wizard-field wizard-field-large">
            <label className="wizard-label" htmlFor="csv-restaurant">
              Seleccioná el restaurante al que pertenece el menú
            </label>
            <select
              id="csv-restaurant"
              className="admin-form-control"
              value={csvTargetRestaurantId}
              onChange={(e) => setCsvTargetRestaurantId(e.target.value)}
              disabled={csvSubmitting}
            >
              <option value="">Seleccioná un restaurante…</option>
              {restaurants.map((rest: { id: string; name: string }) => (
                <option key={rest.id} value={rest.id}>
                  {rest.name}
                </option>
              ))}
            </select>
          </div>
          <div className="wizard-field wizard-field-large">
            <label className="wizard-label" htmlFor="csv-menu-name">
              Nombre del menú
            </label>
            <input
              id="csv-menu-name"
              type="text"
              className="admin-form-control"
              value={csvMenuName}
              onChange={(e) => setCsvMenuName(e.target.value)}
              placeholder="Ej. Menú principal"
              disabled={csvSubmitting}
            />
          </div>
          <div className="wizard-field wizard-field-large">
            <label className="wizard-label" htmlFor="csv-menu-desc">
              Descripción del menú <span style={{ fontWeight: 400, color: 'var(--admin-text-muted)' }}>(opcional)</span>
            </label>
            <textarea
              id="csv-menu-desc"
              className="admin-form-control"
              rows={2}
              value={csvMenuDescription}
              onChange={(e) => setCsvMenuDescription(e.target.value)}
              placeholder="Texto breve que verán los comensales al elegir el menú"
              disabled={csvSubmitting}
            />
          </div>
          <div className="wizard-field wizard-field-large">
            <label className="wizard-label">Archivo CSV</label>
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
                    {(csvFile.size / 1024).toFixed(1)} KB · Hacé clic para cambiar el archivo
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
                    Quitar archivo
                  </button>
                </div>
              ) : (
                <div className="wizard-upload-placeholder">
                  <div className="wizard-upload-icon" aria-hidden>
                    📄
                  </div>
                  <span className="wizard-upload-text">Arrastrá un CSV o hacé clic para seleccionar</span>
                  <span className="wizard-upload-hint">Solo archivos .csv</span>
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
            ← Volver
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
              {csvSubmitting ? 'Importando…' : 'Importar'}
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
        <h2 className="wizard-title">Crear nuevo menú</h2>
        <p className="wizard-subtitle">Completa la información del menú paso a paso</p>
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
            <div className="wizard-step-label">Información</div>
          </div>
          <div className={`wizard-step ${currentStep >= 2 ? 'active' : ''}`}>
            <div className="wizard-step-number">2</div>
            <div className="wizard-step-label">Secciones</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="wizard-form">
        {currentStep === 1 && (
          <div className="wizard-step-content wizard-step-centered">
            <div className="wizard-step-header">
              <h3 className="wizard-step-title">Información básica</h3>
              <p className="wizard-step-description">Ingresa el nombre y descripción del menú</p>
            </div>

            <div className="wizard-fields-container">
              {/* Selector de restaurante (solo si hay más de uno) */}
              {restaurants.length > 1 && (
                <div className="wizard-field wizard-field-large">
                  <label className="wizard-label">Restaurante *</label>
                  <select
                    className="admin-form-control wizard-input-large"
                    value={formData.restaurantId}
                    onChange={(e) => setFormData({ ...formData, restaurantId: e.target.value })}
                    required
                  >
                    <option value="">Selecciona un restaurante</option>
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
                <label className="wizard-label">Nombre del menú *</label>
                <input
                  type="text"
                  className="admin-form-control wizard-input-large"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Menú del Día, Menú Ejecutivo, etc."
                  required
                />
              </div>

              {/* Descripción */}
              <div className="wizard-field wizard-field-large">
                <label className="wizard-label">Descripción (opcional)</label>
                <textarea
                  className="admin-form-control wizard-textarea-large"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe tu menú..."
                  rows={4}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="wizard-step-content wizard-step-centered">
            <div className="wizard-step-header">
              <h3 className="wizard-step-title">Secciones del menú</h3>
              <p className="wizard-step-description">
                Agrega, edita o elimina secciones. Arrastra para reordenar. <strong>Debes agregar al menos una sección activa para poder crear el menú.</strong>
              </p>
            </div>

            <div className="wizard-fields-container">
              {/* Formulario para agregar/editar sección */}
              <div className="wizard-section-form">
                <div className="wizard-section-form-row">
                  <div className="wizard-section-form-field">
                    <label className="wizard-label">Nombre de la sección *</label>
                    <input
                      type="text"
                      className="admin-form-control"
                      value={sectionFormData.name}
                      onChange={(e) => setSectionFormData({ ...sectionFormData, name: e.target.value })}
                      placeholder="Ej: Entradas, Platos principales, Postres..."
                    />
                  </div>
                  <div className="wizard-section-form-field">
                    <label className="wizard-label">Estado</label>
                    <select
                      className="admin-form-control"
                      value={sectionFormData.isActive ? 'true' : 'false'}
                      onChange={(e) => setSectionFormData({ ...sectionFormData, isActive: e.target.value === 'true' })}
                    >
                      <option value="true">Activa</option>
                      <option value="false">Inactiva</option>
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
                          Actualizar
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn-secondary"
                          onClick={() => {
                            setEditingSection(null);
                            setSectionFormData({ name: '', isActive: true });
                          }}
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="admin-btn"
                        onClick={handleAddSection}
                      >
                        + Agregar Sección
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Lista de secciones con drag and drop */}
              {sections.length === 0 ? (
                <div className="wizard-empty-state">
                  <p><strong>No hay secciones creadas.</strong> Agrega al menos una sección activa usando el formulario de arriba para poder crear el menú.</p>
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
                            title={`Haz clic para ${section.isActive ? 'desactivar' : 'activar'} esta sección`}
                          >
                            {section.isActive ? 'Activa' : 'Inactiva'}
                          </span>
                        </div>
                      </div>
                      <div className="wizard-section-actions">
                        <button
                          type="button"
                          className="admin-btn admin-btn-sm"
                          onClick={() => handleEditSection(index)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn-sm admin-btn-danger"
                          onClick={() => handleDeleteSection(index)}
                        >
                          Eliminar
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
            {useEntryPickFlow && currentStep === 1 ? '← Volver' : '← Anterior'}
          </button>
          <div className="wizard-footer-right">
            {onCancel && currentStep === 1 && (
              <button 
                type="button" 
                className="admin-btn admin-btn-secondary"
                onClick={onCancel}
                disabled={loading}
              >
                Cancelar
              </button>
            )}
            {currentStep < totalSteps ? (
              <button 
                type="submit" 
                className="admin-btn"
                disabled={loading || (currentStep === 1 && !formData.name.trim())}
              >
                Siguiente →
              </button>
            ) : (
              <>
                <button 
                  type="submit" 
                  className="admin-btn"
                  disabled={loading || sections.filter(s => s.isActive).length === 0}
                  title={sections.filter(s => s.isActive).length === 0 ? 'Debes agregar al menos una sección activa' : ''}
                >
                  {loading ? 'Guardando...' : 'Crear Menú'}
                </button>
                {sections.filter(s => s.isActive).length === 0 && sections.length > 0 && (
                  <p style={{ 
                    color: '#dc3545', 
                    fontSize: '0.875rem', 
                    marginTop: '8px',
                    marginBottom: 0
                  }}>
                    ⚠️ Debes tener al menos una sección activa para crear el menú
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
