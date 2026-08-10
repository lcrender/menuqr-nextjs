import Link from 'next/link';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../src/i18n/config';
import documentationEs from '../../src/locales/fragments/documentation.es.json';
import documentationEn from '../../src/locales/fragments/documentation.en.json';
import {
  DOCUMENTATION_SECTIONS,
  docHref,
  getAdjacentSections,
  getDocBySlug,
  matchesDocSearch,
  normalizeDocBasePath,
  translateDocSection,
  type DocSection,
} from '../../lib/documentation-nav';

i18n.addResourceBundle('es-ES', 'translation', { documentation: documentationEs }, true, true);
i18n.addResourceBundle('en-US', 'translation', { documentation: documentationEn }, true, true);

type DocumentationShellProps = {
  basePath: string;
  currentSlug: string;
  children: ReactNode;
  /** Público: landing; admin: panel */
  variant: 'public' | 'admin';
};

function groupSections(sections: DocSection[]): { group: string; items: DocSection[] }[] {
  const out: { group: string; items: DocSection[] }[] = [];
  for (const s of sections) {
    const last = out[out.length - 1];
    if (!last || last.group !== s.group) {
      out.push({ group: s.group, items: [s] });
    } else {
      last.items.push(s);
    }
  }
  return out;
}

export function DocumentationShell({ basePath, currentSlug, children, variant }: DocumentationShellProps) {
  const { t } = useTranslation();
  const base = normalizeDocBasePath(basePath);
  const [search, setSearch] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const grouped = useMemo(() => groupSections(DOCUMENTATION_SECTIONS), []);
  const searchHits = useMemo(
    () => DOCUMENTATION_SECTIONS.filter((s) => matchesDocSearch(s, search, t)).slice(0, 12),
    [search, t],
  );

  const { prev, next } = getAdjacentSections(currentSlug);
  const current = getDocBySlug(currentSlug);
  const currentLocalized = current ? translateDocSection(current, t) : undefined;
  const prevLocalized = prev ? translateDocSection(prev, t) : null;
  const nextLocalized = next ? translateDocSection(next, t) : null;

  const closeMobile = useCallback(() => setMobileNavOpen(false), []);

  const navBlock = (
    <>
      <div className="mb-3">
        <label htmlFor="docs-search-input" className="form-label small text-muted mb-1">
          {t('documentation.searchLabel')}
        </label>
        <input
          id="docs-search-input"
          type="search"
          className="form-control form-control-sm"
          placeholder={t('documentation.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoComplete="off"
        />
        {search.trim() ? (
          <ul className="list-unstyled small mt-2 mb-0 border rounded bg-light py-2 px-2">
            {searchHits.length === 0 ? (
              <li className="text-muted px-1">{t('documentation.noMatches')}</li>
            ) : (
              searchHits.map((s) => {
                const loc = translateDocSection(s, t);
                return (
                  <li key={s.slug} className="mb-1">
                    <Link
                      href={docHref(base, s.slug)}
                      className="text-decoration-none d-block text-truncate"
                      onClick={closeMobile}
                    >
                      {loc.shortTitle}
                    </Link>
                  </li>
                );
              })
            )}
          </ul>
        ) : null}
      </div>
      <nav aria-label={t('documentation.navAriaLabel')}>
        {grouped.map(({ group, items }) => {
          const groupLabel = translateDocSection(items[0]!, t).group || group;
          return (
            <div key={group} className="mb-3">
              <div className="docs-nav-group-label text-uppercase small fw-semibold mb-2 px-1">{groupLabel}</div>
              <ul className="list-unstyled small mb-0">
                {items.map((s) => {
                  const href = docHref(base, s.slug);
                  const active = s.slug === currentSlug;
                  const loc = translateDocSection(s, t);
                  return (
                    <li key={s.slug} className="mb-1">
                      <Link
                        href={href}
                        className={`d-block text-decoration-none rounded px-2 py-1 ${active ? 'bg-primary text-white' : 'text-body'}`}
                        aria-current={active ? 'page' : undefined}
                        onClick={closeMobile}
                      >
                        {loc.shortTitle}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
    </>
  );

  const shellMainClass = variant === 'admin' ? 'admin-docs-main' : '';

  return (
    <div className={`documentation-shell ${variant === 'admin' ? 'documentation-shell--admin' : ''}`}>
      {mobileNavOpen ? (
        <button
          type="button"
          className="position-fixed top-0 start-0 w-100 h-100 border-0 p-0"
          style={{ zIndex: 1040, background: 'rgba(0,0,0,0.45)' }}
          aria-label={t('documentation.closeMenu')}
          onClick={closeMobile}
        />
      ) : null}

      <div className="d-flex align-items-center gap-2 mb-3 d-lg-none">
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => setMobileNavOpen(true)}
        >
          {t('documentation.indexButton')}
        </button>
      </div>

      <div className="row g-4">
        <aside
          className="col-lg-3 d-none d-lg-block"
          style={{ maxHeight: 'calc(100vh - 8rem)' }}
        >
          <div className="pe-lg-3 border-end position-sticky top-0 pt-1" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 6rem)' }}>
            {navBlock}
          </div>
        </aside>

        {mobileNavOpen ? (
          <aside
            className="d-lg-none position-fixed top-0 start-0 h-100 bg-white shadow"
            style={{ zIndex: 1050, width: 'min(280px, 88vw)', overflowY: 'auto', padding: '1rem' }}
          >
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-semibold small">{t('documentation.docsTitle')}</span>
              <button type="button" className="btn-close" aria-label={t('documentation.close')} onClick={closeMobile} />
            </div>
            {navBlock}
          </aside>
        ) : null}

        <div className={`col-lg-9 ${shellMainClass}`}>
          {currentSlug === 'intro' ? (
            <>
              <h1 className="mb-3">{t('documentation.introH1')}</h1>
              <p className="lead mb-4">{t('documentation.introLead')}</p>
            </>
          ) : currentLocalized ? (
            <h1 className="h2 mb-4">{currentLocalized.title}</h1>
          ) : null}
          <div className="docs-page-body w-100">{children}</div>

          <footer className="docs-prev-next border-top mt-5 pt-4 d-flex flex-wrap justify-content-between gap-3">
            <div>
              {prevLocalized ? (
                <Link href={docHref(base, prevLocalized.slug)} className="btn btn-outline-secondary btn-sm">
                  ← {prevLocalized.shortTitle}
                </Link>
              ) : (
                <span className="text-muted small">{t('documentation.guideStart')}</span>
              )}
            </div>
            <div>
              {nextLocalized ? (
                <Link href={docHref(base, nextLocalized.slug)} className="btn btn-outline-primary btn-sm">
                  {nextLocalized.shortTitle} →
                </Link>
              ) : (
                <span className="text-muted small">{t('documentation.guideEnd')}</span>
              )}
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
