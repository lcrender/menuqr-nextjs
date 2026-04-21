import { useState, useCallback } from 'react';
import Head from 'next/head';
import LandingNav from '../components/LandingNav';
import LandingFooter from '../components/LandingFooter';
import {
  TEMPLATES_CATALOG,
  PREVIEW_IMAGE_BASE,
  PREVIEW_DEFAULT_IMAGE,
} from '../lib/templates-catalog';
export default function DemosPage() {
  const [previewSelectedId, setPreviewSelectedId] = useState<string | null>(null);
  const [previewDrawerOpen, setPreviewDrawerOpen] = useState(false);
  const [previewImageError, setPreviewImageError] = useState<Record<string, boolean>>({});

  const openPreview = (templateId: string) => {
    setPreviewSelectedId(templateId);
    setPreviewDrawerOpen(true);
  };

  const goToAdjacent = useCallback(
    (dir: 'prev' | 'next') => {
      if (!previewSelectedId) return;
      const idx = TEMPLATES_CATALOG.findIndex((t) => t.id === previewSelectedId);
      if (idx < 0) return;
      const nextIdx = dir === 'prev' ? idx - 1 : idx + 1;
      if (nextIdx < 0 || nextIdx >= TEMPLATES_CATALOG.length) return;
      const nextTpl = TEMPLATES_CATALOG[nextIdx];
      if (!nextTpl) return;
      setPreviewSelectedId(nextTpl.id);
    },
    [previewSelectedId],
  );

  const current = previewSelectedId
    ? TEMPLATES_CATALOG.find((t) => t.id === previewSelectedId)
    : null;
  const previewIdx = previewSelectedId
    ? TEMPLATES_CATALOG.findIndex((t) => t.id === previewSelectedId)
    : -1;

  return (
    <>
      <Head>
        <title>Demos de plantillas | AppMenuQR</title>
        <meta
          name="description"
          content="Explora todas las plantillas de menú digital de AppMenuQR. Vista previa interactiva sin registro."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="landing-page landing-demos-page">
        <LandingNav />

        <section className="landing-demos-hero">
          <div className="container">
            <h1 className="landing-demos-title">Demos de plantillas</h1>
            <p className="landing-demos-lead">
              Elige una plantilla para ver una vista previa en vivo. Puedes pasar de una a otra con Anterior y
              Próxima, o abrir la demo completa en otra pestaña.
            </p>
          </div>
        </section>

        <section className="landing-demos-grid-section">
          <div className="container">
            <div className="landing-demos-grid">
              {TEMPLATES_CATALOG.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  className={`landing-demos-card ${previewSelectedId === template.id ? 'landing-demos-card-active' : ''}`}
                  onClick={() => openPreview(template.id)}
                >
                  {template.requiresProOrPremium && (
                    <span className="landing-demos-pro-badge">PRO</span>
                  )}
                  <div className="landing-demos-card-thumb">
                    <img
                      src={
                        previewImageError[template.id]
                          ? PREVIEW_DEFAULT_IMAGE
                          : `${PREVIEW_IMAGE_BASE}/preview-${template.id}.jpg`
                      }
                      alt=""
                      className="landing-demos-card-img"
                      onError={() =>
                        setPreviewImageError((prev) => ({ ...prev, [template.id]: true }))
                      }
                      loading="lazy"
                    />
                  </div>
                  <div className="landing-demos-card-body">
                    <span className="landing-demos-card-emoji" aria-hidden>
                      {template.preview}
                    </span>
                    <h2 className="landing-demos-card-name">{template.name}</h2>
                    <p className="landing-demos-card-desc">{template.description}</p>
                    <span className="landing-demos-card-cta">Ver vista previa →</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <LandingFooter />
      </div>

      {previewDrawerOpen && previewSelectedId && current && (
        <div
          className="admin-templates-preview-drawer-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Vista previa de plantilla"
          onClick={() => setPreviewDrawerOpen(false)}
        >
          <div className="admin-templates-preview-drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="admin-templates-preview-drawer-header">
              <div className="fw-semibold">
                Vista previa: {current.name}
                {current.requiresProOrPremium && (
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#b48c2d',
                      background: 'rgba(180, 140, 45, 0.15)',
                      padding: '2px 8px',
                      borderRadius: 4,
                    }}
                  >
                    PRO
                  </span>
                )}
              </div>
              <button
                type="button"
                className="btn-close"
                aria-label="Cerrar"
                onClick={() => setPreviewDrawerOpen(false)}
              />
            </div>

            <div className="admin-templates-preview-drawer-body">
              <div className="wizard-preview-mobile-nav">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary wizard-preview-nav-btn"
                  onClick={() => goToAdjacent('prev')}
                  disabled={previewIdx <= 0}
                  aria-label="Plantilla anterior"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary wizard-preview-nav-btn"
                  onClick={() => goToAdjacent('next')}
                  disabled={previewIdx >= TEMPLATES_CATALOG.length - 1}
                  aria-label="Plantilla siguiente"
                >
                  Próxima
                </button>
              </div>
              <iframe
                key={previewSelectedId}
                src={`/preview/${previewSelectedId}`}
                title={`Demo ${current.name}`}
                className="admin-templates-preview-drawer-iframe"
                loading="lazy"
              />
            </div>

            <div
              className="admin-templates-preview-drawer-footer"
              style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}
            >
              <a
                href={`/preview/${previewSelectedId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-btn admin-templates-preview-drawer-cta"
              >
                Ver plantilla
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
