import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/AdminLayout';
import api from '../../../lib/axios';
import {
  buildPreviewDocument,
  emailLocaleLabel,
  interpolateWithSamples,
  type EmailTemplateCategory,
  type EmailTemplateCategoryMeta,
  type EmailTemplateDetail,
  type EmailTemplateLang,
  type EmailTemplateListResponse,
  type EmailTemplateSummary,
} from '../../../lib/admin-email-templates';

type Draft = Record<EmailTemplateLang, { subject: string; bodyHtml: string }>;

const EMPTY_DRAFT: Draft = {
  es: { subject: '', bodyHtml: '' },
  en: { subject: '', bodyHtml: '' },
};

export default function AdminConfigEmails() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [categories, setCategories] = useState<EmailTemplateCategoryMeta[]>([]);
  const [templates, setTemplates] = useState<EmailTemplateSummary[]>([]);
  const [activeCategory, setActiveCategory] = useState<EmailTemplateCategory>('auth');

  const [detail, setDetail] = useState<EmailTemplateDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [editorLang, setEditorLang] = useState<EmailTemplateLang>('es');
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

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

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<EmailTemplateListResponse>('/admin/email-templates');
      setCategories(res.data.categories || []);
      setTemplates(res.data.templates || []);
    } catch (e: any) {
      setError(e.response?.data?.message || 'No se pudieron cargar las plantillas de email');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'SUPER_ADMIN') return;
    load();
  }, [user, load]);

  const categoryMeta = useMemo(
    () => categories.find((c) => c.id === activeCategory),
    [categories, activeCategory],
  );

  const countByCategory = useMemo(() => {
    const counts = new Map<EmailTemplateCategory, number>();
    templates.forEach((t) => counts.set(t.category, (counts.get(t.category) || 0) + 1));
    return counts;
  }, [templates]);

  const visibleTemplates = useMemo(
    () => templates.filter((t) => t.category === activeCategory),
    [templates, activeCategory],
  );

  const applyDetail = (data: EmailTemplateDetail) => {
    setDetail(data);
    setDraft({
      es: {
        subject: data.content.es?.subject || '',
        bodyHtml: data.content.es?.bodyHtml || '',
      },
      en: {
        subject: data.content.en?.subject || '',
        bodyHtml: data.content.en?.bodyHtml || '',
      },
    });
  };

  const openTemplate = async (id: string) => {
    setDetail(null);
    setDetailError(null);
    setDetailLoading(true);
    setEditorLang('es');
    setShowPreview(true);
    try {
      const res = await api.get<EmailTemplateDetail>(`/admin/email-templates/${id}`);
      applyDetail(res.data);
    } catch (e: any) {
      setDetailError(e.response?.data?.message || 'No se pudo cargar la plantilla');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeEditor = () => {
    setDetail(null);
    setDetailError(null);
    setDraft(EMPTY_DRAFT);
  };

  const save = async () => {
    if (!detail) return;
    setSaving(true);
    setDetailError(null);
    setSuccess(null);
    try {
      const payload: Record<string, { subject: string; bodyHtml: string }> = {};
      detail.locales.forEach((lang) => {
        payload[lang] = {
          subject: draft[lang].subject,
          bodyHtml: draft[lang].bodyHtml,
        };
      });
      const res = await api.put<EmailTemplateDetail>(
        `/admin/email-templates/${detail.id}`,
        payload,
      );
      applyDetail(res.data);
      setSuccess(`Plantilla “${res.data.name}” guardada.`);
      await load();
    } catch (e: any) {
      setDetailError(e.response?.data?.message || 'No se pudo guardar la plantilla');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = async () => {
    if (!detail) return;
    if (!window.confirm('¿Restaurar el contenido original de esta plantilla?')) return;
    setResetting(true);
    setDetailError(null);
    setSuccess(null);
    try {
      const res = await api.post<EmailTemplateDetail>(
        `/admin/email-templates/${detail.id}/reset`,
      );
      applyDetail(res.data);
      setSuccess(`Plantilla “${res.data.name}” restaurada al contenido por defecto.`);
      await load();
    } catch (e: any) {
      setDetailError(e.response?.data?.message || 'No se pudo restaurar la plantilla');
    } finally {
      setResetting(false);
    }
  };

  const previewDoc = useMemo(() => {
    if (!detail) return '';
    return buildPreviewDocument({
      lang: editorLang,
      bodyHtml: draft[editorLang].bodyHtml,
      variables: detail.variables,
      wrapInShell: detail.wrapInShell,
    });
  }, [detail, draft, editorLang]);

  const insertVariable = (key: string) => {
    setDraft((prev) => ({
      ...prev,
      [editorLang]: {
        ...prev[editorLang],
        bodyHtml: `${prev[editorLang].bodyHtml}{{${key}}}`,
      },
    }));
  };

  if (!user || user.role !== 'SUPER_ADMIN') {
    return (
      <AdminLayout>
        <div className="text-center p-5">
          <div className="spinner-border" role="status" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-page-config-emails" style={{ maxWidth: 1100 }}>
        <h1 className="admin-title mb-2">Emails</h1>
        <p className="text-muted mb-4">
          Plantillas que envía el sistema. Editá el asunto y el cuerpo HTML; las variables{' '}
          <code>{'{{variable}}'}</code> se reemplazan al enviar.
        </p>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success" role="alert">
            {success}
          </div>
        )}

        <ul className="nav nav-tabs flex-wrap mb-3" role="tablist">
          {categories.map((cat) => {
            const active = cat.id === activeCategory;
            return (
              <li key={cat.id} className="nav-item" role="presentation">
                <button
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`nav-link ${active ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.label}
                  <span className="badge text-bg-light ms-2">
                    {countByCategory.get(cat.id) || 0}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {categoryMeta ? (
          <p className="text-muted small mb-3">{categoryMeta.description}</p>
        ) : null}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status" />
          </div>
        ) : (
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th scope="col">Plantilla</th>
                      <th scope="col">Cuándo se envía</th>
                      <th scope="col">Destinatario</th>
                      <th scope="col">Idioma</th>
                      <th scope="col">Estado</th>
                      <th scope="col" className="text-end">
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleTemplates.map((tpl) => (
                      <tr
                        key={tpl.id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => openTemplate(tpl.id)}
                      >
                        <td>
                          <div className="fw-semibold">{tpl.name}</div>
                          <div className="small text-muted font-monospace">{tpl.id}</div>
                          {tpl.note ? (
                            <div className="small text-muted mt-1">{tpl.note}</div>
                          ) : null}
                        </td>
                        <td style={{ maxWidth: 300 }}>{tpl.when}</td>
                        <td>{tpl.recipient}</td>
                        <td>
                          <span className="badge text-bg-secondary">
                            {emailLocaleLabel(tpl.locales)}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex flex-column gap-1 align-items-start">
                            {tpl.sendUsesOverride ? (
                              <span className="badge text-bg-success">Se usa al enviar</span>
                            ) : (
                              <span className="badge text-bg-warning text-dark">
                                Edición guardada; envío aún usa código (próximamente)
                              </span>
                            )}
                            {tpl.hasOverride ? (
                              <span className="badge text-bg-info text-dark">Personalizada</span>
                            ) : null}
                          </div>
                        </td>
                        <td className="text-end">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              openTemplate(tpl.id);
                            }}
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                    {visibleTemplates.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center text-muted py-4">
                          No hay plantillas en esta categoría.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {(detailLoading || detail || detailError) && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          tabIndex={-1}
          role="dialog"
        >
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title mb-0">
                    {detail ? detail.name : 'Cargando plantilla…'}
                  </h5>
                  {detail ? (
                    <div className="small text-muted font-monospace">{detail.id}</div>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Cerrar"
                  onClick={closeEditor}
                />
              </div>

              <div className="modal-body">
                {detailLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border" role="status" />
                  </div>
                ) : detail ? (
                  <>
                    {detailError && (
                      <div className="alert alert-danger" role="alert">
                        {detailError}
                      </div>
                    )}

                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {detail.sendUsesOverride ? (
                        <span className="badge text-bg-success">Se usa al enviar</span>
                      ) : (
                        <span className="badge text-bg-warning text-dark">
                          Edición guardada; envío aún usa código (próximamente)
                        </span>
                      )}
                      {detail.isOverridden ? (
                        <span className="badge text-bg-info text-dark">Personalizada</span>
                      ) : (
                        <span className="badge text-bg-light text-muted">Contenido por defecto</span>
                      )}
                    </div>

                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <div className="small text-muted">Cuándo se envía</div>
                        <div>{detail.when}</div>
                      </div>
                      <div className="col-md-6">
                        <div className="small text-muted">Destinatario</div>
                        <div>{detail.recipient}</div>
                      </div>
                    </div>

                    {detail.note ? (
                      <div className="alert alert-secondary py-2 small">{detail.note}</div>
                    ) : null}

                    <div className="mb-3">
                      <div className="small text-muted mb-1">
                        Variables disponibles (hacé clic para insertarlas en el cuerpo)
                      </div>
                      <div className="d-flex flex-wrap gap-2">
                        {detail.variables.map((v) => (
                          <button
                            key={v.key}
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            title={`${v.description} — ejemplo: ${v.sample}`}
                            onClick={() => insertVariable(v.key)}
                          >
                            <span className="font-monospace">{`{{${v.key}}}`}</span>
                            {v.allowHtml ? (
                              <span className="badge text-bg-light text-muted ms-2">HTML</span>
                            ) : null}
                          </button>
                        ))}
                      </div>
                    </div>

                    {detail.locales.length > 1 ? (
                      <ul className="nav nav-pills mb-3">
                        {detail.locales.map((lang) => (
                          <li className="nav-item" key={lang}>
                            <button
                              type="button"
                              className={`nav-link ${editorLang === lang ? 'active' : ''}`}
                              onClick={() => setEditorLang(lang)}
                            >
                              {lang === 'es' ? 'Español' : 'Inglés'}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    <div className="mb-3">
                      <label className="form-label" htmlFor="tpl-subject">
                        Asunto
                      </label>
                      <input
                        id="tpl-subject"
                        type="text"
                        className="form-control"
                        value={draft[editorLang].subject}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            [editorLang]: { ...prev[editorLang], subject: e.target.value },
                          }))
                        }
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label" htmlFor="tpl-body">
                        Cuerpo HTML
                      </label>
                      <textarea
                        id="tpl-body"
                        className="form-control font-monospace"
                        rows={14}
                        style={{ fontSize: 13 }}
                        value={draft[editorLang].bodyHtml}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            [editorLang]: { ...prev[editorLang], bodyHtml: e.target.value },
                          }))
                        }
                      />
                      <div className="small text-muted mt-1">
                        {detail.wrapInShell
                          ? 'Se envía dentro de la plantilla base (header con logo y estilos). Podés usar las clases content, button, alert y footer.'
                          : 'Se envía tal cual: incluí los estilos inline que necesites.'}
                      </div>
                    </div>

                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <h2 className="h6 mb-0">Vista previa (con valores de ejemplo)</h2>
                      <button
                        type="button"
                        className="btn btn-sm btn-link"
                        onClick={() => setShowPreview((v) => !v)}
                      >
                        {showPreview ? 'Ocultar' : 'Mostrar'}
                      </button>
                    </div>
                    {showPreview ? (
                      <>
                        <div className="border rounded p-2 mb-2 bg-light small">
                          <strong>Asunto: </strong>
                          {interpolateWithSamples(
                            draft[editorLang].subject,
                            detail.variables.map((v) => ({ ...v, allowHtml: true })),
                          )}
                        </div>
                        <iframe
                          title="Vista previa del email"
                          srcDoc={previewDoc}
                          className="border rounded w-100"
                          style={{ height: 420, background: '#fff' }}
                          sandbox=""
                        />
                      </>
                    ) : null}
                  </>
                ) : detailError ? (
                  <div className="alert alert-danger mb-0" role="alert">
                    {detailError}
                  </div>
                ) : null}
              </div>

              <div className="modal-footer justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={resetToDefault}
                  disabled={!detail || !detail.isOverridden || saving || resetting}
                >
                  {resetting ? 'Restaurando…' : 'Restaurar por defecto'}
                </button>
                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-outline-secondary" onClick={closeEditor}>
                    Cerrar
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={save}
                    disabled={!detail || saving || resetting}
                  >
                    {saving ? 'Guardando…' : 'Guardar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
