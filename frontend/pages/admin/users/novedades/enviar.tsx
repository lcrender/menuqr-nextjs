import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '../../../../components/AdminLayout';
import api from '../../../../lib/axios';
import {
  buildPreviewDocument,
  type EmailTemplateLang,
} from '../../../../lib/admin-email-templates';
import {
  appendBlogArticlesToBodyHtml,
  BLOG_EMAIL_LAYOUTS,
  buildBlogArticlesEmailHtml,
  listBlogArticlesForEmailEs,
  resolveBlogArticlesForEmailEs,
  type BlogEmailLayoutId,
} from '../../../../lib/marketing-blog-email';

type Audience = 'test' | 'verified' | 'all' | 'plan';

type ComposeResponse = {
  templateId: string;
  lang: EmailTemplateLang;
  subject: string;
  bodyHtml: string;
  wrapInShell: boolean;
  plans: Array<{ slug: string; label: string; count: number }>;
  counts: {
    all: number;
    verified: number;
    byPlan: Record<string, number>;
  };
};

type SendResult = {
  audience: Audience;
  plan: string | null;
  total: number;
  sent: number;
  failed: Array<{ email: string; error: string }>;
};

const MARKETING_VARS = [
  { key: 'firstName', description: 'Nombre', sample: 'Lucía', allowHtml: false },
  { key: 'year', description: 'Año', sample: String(new Date().getFullYear()), allowHtml: false },
];

const BLOG_ARTICLES_ES = listBlogArticlesForEmailEs();

export default function AdminNovedadesEnviarPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ role?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [result, setResult] = useState<SendResult | null>(null);

  const [lang, setLang] = useState<EmailTemplateLang>('es');
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [audience, setAudience] = useState<Audience>('test');
  const [testEmail, setTestEmail] = useState('');
  const [plan, setPlan] = useState('free');
  const [plans, setPlans] = useState<ComposeResponse['plans']>([]);
  const [counts, setCounts] = useState<ComposeResponse['counts'] | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [selectedBlogSlugs, setSelectedBlogSlugs] = useState<string[]>([]);
  const [blogLayout, setBlogLayout] = useState<BlogEmailLayoutId>('cards');

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
      if (u.role !== 'SUPER_ADMIN') router.replace('/admin');
    } catch {
      router.push('/login');
    }
  }, [router]);

  const loadCompose = useCallback(async (nextLang: EmailTemplateLang) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ComposeResponse>('/users/marketing-opt-in/compose', {
        params: { lang: nextLang },
      });
      setSubject(res.data.subject || '');
      setBodyHtml(res.data.bodyHtml || '');
      setPlans(res.data.plans || []);
      setCounts(res.data.counts || null);
      if (res.data.plans?.length && !res.data.plans.some((p) => p.slug === plan)) {
        setPlan(res.data.plans[0].slug);
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || 'No se pudo cargar la plantilla');
    } finally {
      setLoading(false);
    }
  }, [plan]);

  useEffect(() => {
    if (user?.role !== 'SUPER_ADMIN') return;
    void loadCompose(lang);
    // Solo al montar / cambiar idioma; loadCompose depende de plan a propósito no re-disparar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, lang]);

  const recipientCount = useMemo(() => {
    if (!counts) return 0;
    if (audience === 'test') return testEmail.trim() ? 1 : 0;
    if (audience === 'verified') return counts.verified;
    if (audience === 'all') return counts.all;
    return counts.byPlan[plan] ?? 0;
  }, [audience, counts, plan, testEmail]);

  const previewHtml = useMemo(
    () =>
      buildPreviewDocument({
        lang,
        bodyHtml,
        variables: MARKETING_VARS,
        wrapInShell: true,
      }),
    [lang, bodyHtml],
  );

  const audienceLabel = useMemo(() => {
    if (audience === 'test') return `prueba (${testEmail.trim() || 'sin email'})`;
    if (audience === 'verified') return `todos los verificados (${recipientCount})`;
    if (audience === 'all') return `todos los suscriptores (${recipientCount})`;
    const planLabel = plans.find((p) => p.slug === plan)?.label || plan;
    return `plan ${planLabel} (${recipientCount})`;
  }, [audience, testEmail, recipientCount, plan, plans]);

  const toggleBlogSlug = (slug: string) => {
    setSelectedBlogSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  };

  const moveBlogSlug = (slug: string, direction: -1 | 1) => {
    setSelectedBlogSlugs((prev) => {
      const index = prev.indexOf(slug);
      if (index < 0) return prev;
      const next = index + direction;
      if (next < 0 || next >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(next, 0, item);
      return copy;
    });
  };

  const handleInsertBlogArticles = () => {
    setError(null);
    if (!selectedBlogSlugs.length) {
      setError('Seleccioná al menos un artículo del blog');
      return;
    }
    const articles = resolveBlogArticlesForEmailEs(selectedBlogSlugs);
    if (!articles.length) {
      setError('No se encontraron los artículos seleccionados');
      return;
    }
    const block = buildBlogArticlesEmailHtml(articles, blogLayout);
    setBodyHtml((prev) => appendBlogArticlesToBodyHtml(prev, block));
    setSuccess(
      `Se agregaron ${articles.length} artículo${articles.length === 1 ? '' : 's'} al cuerpo (${BLOG_EMAIL_LAYOUTS.find((l) => l.id === blogLayout)?.label || blogLayout}).`,
    );
  };

  const handleSend = async () => {
    setError(null);
    setSuccess(null);
    setResult(null);

    if (!subject.trim() || !bodyHtml.trim()) {
      setError('Completá el asunto y el cuerpo del email');
      return;
    }
    if (audience === 'test' && !testEmail.trim()) {
      setError('Indicá el email de prueba');
      return;
    }
    if (recipientCount < 1) {
      setError('No hay destinatarios para esa audiencia');
      return;
    }

    const confirmMsg =
      audience === 'test'
        ? `¿Enviar email de prueba a ${testEmail.trim()}?`
        : `¿Enviar este email a ${audienceLabel}? Esta acción no se puede deshacer.`;
    if (!window.confirm(confirmMsg)) return;

    setSending(true);
    try {
      const payload: Record<string, string> = {
        audience,
        subject: subject.trim(),
        bodyHtml: bodyHtml.trim(),
        lang,
      };
      if (audience === 'test') payload.testEmail = testEmail.trim();
      if (audience === 'plan') payload.plan = plan;

      const res = await api.post<SendResult>('/users/marketing-opt-in/send', payload);
      setResult(res.data);
      setSuccess(
        `Enviado: ${res.data.sent} de ${res.data.total}` +
          (res.data.failed.length ? ` · Fallidos: ${res.data.failed.length}` : ''),
      );
      // refrescar conteos
      const compose = await api.get<ComposeResponse>('/users/marketing-opt-in/compose', {
        params: { lang },
      });
      setCounts(compose.data.counts || null);
      setPlans(compose.data.plans || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'No se pudo enviar el email');
    } finally {
      setSending(false);
    }
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
      <div className="mb-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
          <h1 className="h3 mb-0">Redactar email de novedades</h1>
          <Link href="/admin/users/novedades" className="btn btn-outline-secondary btn-sm">
            Volver a suscriptores
          </Link>
        </div>
        <p className="text-muted mb-0">
          Parte de la plantilla del sistema (misma cáscara con logo). Solo se envía a usuarios
          suscriptos a novedades.
        </p>
      </div>

      {error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      ) : null}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status" />
        </div>
      ) : (
        <div className="row g-3">
          <div className="col-lg-7">
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label" htmlFor="nl-lang">
                    Idioma de la plantilla base
                  </label>
                  <select
                    id="nl-lang"
                    className="form-select form-select-sm"
                    style={{ maxWidth: 160 }}
                    value={lang}
                    onChange={(e) => setLang(e.target.value as EmailTemplateLang)}
                    disabled={sending}
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                  </select>
                  <div className="form-text">
                    Al cambiar el idioma se recarga el texto por defecto de la plantilla (podés
                    perder ediciones no enviadas).
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="nl-subject">
                    Asunto
                  </label>
                  <input
                    id="nl-subject"
                    className="form-control"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={sending}
                    maxLength={200}
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label" htmlFor="nl-body">
                    Cuerpo HTML
                  </label>
                  <textarea
                    id="nl-body"
                    className="form-control font-monospace"
                    rows={16}
                    value={bodyHtml}
                    onChange={(e) => setBodyHtml(e.target.value)}
                    disabled={sending}
                    spellCheck={false}
                  />
                  <div className="form-text">
                    Variables: <code>{'{{firstName}}'}</code>, <code>{'{{year}}'}</code>. El sistema
                    agrega la cabecera con logo.
                  </div>
                </div>
              </div>
            </div>

            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <h2 className="h6 mb-1">Artículos del blog</h2>
                <p className="small text-muted mb-3">
                  Seleccioná uno o varios (solo español). El diseño se <strong>agrega</strong> al
                  cuerpo actual, antes del pie si existe.
                </p>

                <div className="mb-3">
                  <label className="form-label" htmlFor="nl-blog-layout">
                    Layout
                  </label>
                  <select
                    id="nl-blog-layout"
                    className="form-select form-select-sm"
                    value={blogLayout}
                    onChange={(e) => setBlogLayout(e.target.value as BlogEmailLayoutId)}
                    disabled={sending}
                  >
                    {BLOG_EMAIL_LAYOUTS.map((layout) => (
                      <option key={layout.id} value={layout.id}>
                        {layout.label}
                      </option>
                    ))}
                  </select>
                  <div className="form-text">
                    {BLOG_EMAIL_LAYOUTS.find((l) => l.id === blogLayout)?.description}
                  </div>
                </div>

                <div className="d-flex flex-column gap-2 mb-3">
                  {BLOG_ARTICLES_ES.map((article) => {
                    const checked = selectedBlogSlugs.includes(article.slug);
                    const order = checked ? selectedBlogSlugs.indexOf(article.slug) + 1 : null;
                    return (
                      <div
                        key={article.slug}
                        className="border rounded p-2 d-flex gap-2 align-items-start"
                      >
                        <input
                          className="form-check-input mt-1"
                          type="checkbox"
                          id={`blog-${article.slug}`}
                          checked={checked}
                          onChange={() => toggleBlogSlug(article.slug)}
                          disabled={sending}
                        />
                        <div className="flex-grow-1 min-w-0">
                          <label
                            className="form-check-label d-block"
                            htmlFor={`blog-${article.slug}`}
                          >
                            <span className="fw-semibold d-block text-truncate">
                              {order ? `${order}. ` : ''}
                              {article.title}
                            </span>
                            <span className="small text-muted">{article.categoryLabel}</span>
                          </label>
                        </div>
                        {checked ? (
                          <div className="btn-group btn-group-sm">
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              title="Subir"
                              disabled={sending || selectedBlogSlugs[0] === article.slug}
                              onClick={() => moveBlogSlug(article.slug, -1)}
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              title="Bajar"
                              disabled={
                                sending ||
                                selectedBlogSlugs[selectedBlogSlugs.length - 1] === article.slug
                              }
                              onClick={() => moveBlogSlug(article.slug, 1)}
                            >
                              ↓
                            </button>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={handleInsertBlogArticles}
                  disabled={sending || selectedBlogSlugs.length === 0}
                >
                  Agregar al cuerpo ({selectedBlogSlugs.length})
                </button>
              </div>
            </div>

            <div className="card shadow-sm">
              <div className="card-body">
                <h2 className="h6 mb-3">Destinatarios</h2>

                <div className="d-flex flex-column gap-2 mb-3">
                  <label className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="audience"
                      checked={audience === 'test'}
                      onChange={() => setAudience('test')}
                      disabled={sending}
                    />
                    <span className="form-check-label">Probar con un suscriptor</span>
                  </label>
                  <label className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="audience"
                      checked={audience === 'verified'}
                      onChange={() => setAudience('verified')}
                      disabled={sending}
                    />
                    <span className="form-check-label">
                      Todos los verificados
                      {counts ? ` (${counts.verified})` : ''}
                    </span>
                  </label>
                  <label className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="audience"
                      checked={audience === 'all'}
                      onChange={() => setAudience('all')}
                      disabled={sending}
                    />
                    <span className="form-check-label">
                      Todos los suscriptores
                      {counts ? ` (${counts.all})` : ''}
                    </span>
                  </label>
                  <label className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="audience"
                      checked={audience === 'plan'}
                      onChange={() => setAudience('plan')}
                      disabled={sending}
                    />
                    <span className="form-check-label">Usuarios de un plan</span>
                  </label>
                </div>

                {audience === 'test' ? (
                  <div className="mb-3">
                    <label className="form-label" htmlFor="nl-test-email">
                      Email del suscriptor
                    </label>
                    <input
                      id="nl-test-email"
                      type="email"
                      className="form-control"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="usuario@dominio.com"
                      disabled={sending}
                    />
                  </div>
                ) : null}

                {audience === 'plan' ? (
                  <div className="mb-3">
                    <label className="form-label" htmlFor="nl-plan">
                      Plan
                    </label>
                    <select
                      id="nl-plan"
                      className="form-select"
                      value={plan}
                      onChange={(e) => setPlan(e.target.value)}
                      disabled={sending}
                    >
                      {plans.map((p) => (
                        <option key={p.slug} value={p.slug}>
                          {p.label} ({p.count})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}

                <p className="small text-muted mb-3">
                  Destinatarios estimados: <strong>{recipientCount}</strong>
                </p>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => void handleSend()}
                  disabled={sending || recipientCount < 1}
                >
                  {sending ? 'Enviando…' : 'Enviar email'}
                </button>
              </div>
            </div>

            {result?.failed?.length ? (
              <div className="card shadow-sm mt-3 border-warning">
                <div className="card-body">
                  <h2 className="h6">Fallidos ({result.failed.length})</h2>
                  <ul className="small mb-0">
                    {result.failed.slice(0, 20).map((f) => (
                      <li key={f.email}>
                        <code>{f.email}</code>: {f.error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>

          <div className="col-lg-5">
            <div className="card shadow-sm sticky-top" style={{ top: 80 }}>
              <div className="card-header d-flex justify-content-between align-items-center">
                <span className="fw-semibold">Vista previa</span>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setShowPreview((v) => !v)}
                >
                  {showPreview ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              {showPreview ? (
                <div className="card-body p-0">
                  <div className="px-3 pt-2 small text-muted border-bottom">
                    Asunto: <strong>{subject || '—'}</strong>
                  </div>
                  <iframe
                    title="Vista previa del email"
                    srcDoc={previewHtml}
                    style={{ width: '100%', height: 520, border: 0 }}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
