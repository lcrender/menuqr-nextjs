import Link from 'next/link';
import type { ReactNode } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import type { DocSection } from '../../lib/documentation-nav';
import { docHref, getDocBySlug, translateDocSection } from '../../lib/documentation-nav';
import { MENU_TEMPLATES_CATALOG, sortTemplatesByCatalogOrder } from '../../lib/menu-templates-catalog';
import { plantillaCaracteristicasHref } from '../../lib/plantillas-catalog-url';
import i18n from '../../src/i18n/config';
import documentationBodiesEs from '../../src/locales/fragments/documentationBodies.es.json';
import documentationBodiesEn from '../../src/locales/fragments/documentationBodies.en.json';

i18n.addResourceBundle('es-ES', 'translation', { documentationBodies: documentationBodiesEs }, true, true);
i18n.addResourceBundle('en-US', 'translation', { documentationBodies: documentationBodiesEn }, true, true);

type BodyProps = { basePath: string };

function DocAudienceBlock({ title, children }: { title: string; children: ReactNode }): ReactNode {
  return (
    <div className="alert alert-secondary mb-4" role="note">
      <p className="mb-2 fw-semibold">{title}</p>
      <div className="mb-0 small">{children}</div>
    </div>
  );
}

function DocSeeAlso({ basePath, slugs }: { basePath: string; slugs: DocSection['slug'][] }): ReactNode {
  const { t } = useTranslation();
  return (
    <div className="card mb-4 border-0 bg-light">
      <div className="card-body py-3">
        <h3 className="h6 text-uppercase text-muted mb-3">{t('documentation.seeAlso')}</h3>
        <ul className="mb-0 ps-3">
          {slugs.map((slug) => {
            const doc = getDocBySlug(slug);
            if (!doc) return null;
            const localized = translateDocSection(doc, t);
            return (
              <li key={slug} className="mb-2">
                <Link href={docHref(basePath, slug)}>{localized.title}</Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function DocFaqBlock({ items }: { items: { q: string; a: ReactNode }[] }): ReactNode {
  const { t } = useTranslation();
  return (
    <div className="card mb-4 border-secondary">
      <div className="card-header bg-white">
        <h3 className="h5 mb-0">{t('documentation.faq')}</h3>
      </div>
      <div className="card-body">
        {items.map(({ q, a }, i) => (
          <div key={`${i}-${q}`} className={i < items.length - 1 ? 'mb-4' : 'mb-0'}>
            <p className="fw-semibold mb-2">{q}</p>
            <div className="mb-0 small text-body">{a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const PRIMEROS_PASOS_VIDEO_ID = 'M85F7_szTFs';
const PRIMEROS_PASOS_VIDEO_URL = `https://www.youtube.com/embed/${PRIMEROS_PASOS_VIDEO_ID}`;
const PRIMEROS_PASOS_VIDEO_WATCH = `https://youtu.be/${PRIMEROS_PASOS_VIDEO_ID}`;

const TRADUCCIONES_VIDEO_ID = 'j3hupAJNHmI';
const TRADUCCIONES_VIDEO_URL = `https://www.youtube.com/embed/${TRADUCCIONES_VIDEO_ID}`;
const TRADUCCIONES_VIDEO_WATCH = `https://youtu.be/${TRADUCCIONES_VIDEO_ID}`;

/** Video tutorial del flujo inicial (comercio → menú → secciones → productos → plantilla). */
function DocPrimerosPasosVideo(): ReactNode {
  const { t } = useTranslation();
  return (
    <div className="card mb-4 border-0 bg-light">
      <div className="card-body">
        <h2 className="h5 mb-2">{t('documentationBodies.primerosPasosVideo.title')}</h2>
        <p className="mb-3 text-muted small">
          {t('documentationBodies.primerosPasosVideo.description')}{' '}
          <a href={PRIMEROS_PASOS_VIDEO_WATCH} target="_blank" rel="noopener noreferrer">
            {t('documentationBodies.common.watchOnYoutube')}
          </a>
        </p>
        <div className="ratio ratio-16x9 rounded overflow-hidden bg-dark">
          <iframe
            src={PRIMEROS_PASOS_VIDEO_URL}
            title={t('documentationBodies.primerosPasosVideo.iframeTitle')}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </div>
    </div>
  );
}

/** Video tutorial de traducciones / menú multidioma. */
function DocTraduccionesVideo(): ReactNode {
  const { t } = useTranslation();
  return (
    <div className="card mb-4 border-0 bg-light">
      <div className="card-body">
        <h2 className="h5 mb-2">{t('documentationBodies.traduccionesVideo.title')}</h2>
        <p className="mb-3 text-muted small">
          {t('documentationBodies.traduccionesVideo.description')}{' '}
          <a href={TRADUCCIONES_VIDEO_WATCH} target="_blank" rel="noopener noreferrer">
            {t('documentationBodies.common.watchOnYoutube')}
          </a>
        </p>
        <div className="ratio ratio-16x9 rounded overflow-hidden bg-dark">
          <iframe
            src={TRADUCCIONES_VIDEO_URL}
            title={t('documentationBodies.traduccionesVideo.iframeTitle')}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </div>
    </div>
  );
}

export function DocIntroBody({ basePath }: BodyProps): ReactNode {
  const { t } = useTranslation();
  return (
    <>
      <p className="mb-4">
        <Trans i18nKey="documentationBodies.intro.p1" components={{ strong: <strong /> }} />
      </p>

      <div className="card mb-5 border-primary">
        <div className="card-header bg-primary text-white">
          <h2 className="h4 mb-0">{t('documentationBodies.intro.summaryCardTitle')}</h2>
        </div>
        <div className="card-body">
          <ol className="mb-0">
            <li className="mb-2">
              <Trans
                i18nKey="documentationBodies.intro.step1"
                components={{ link: <Link href={docHref(basePath, 'crear-restaurante')} className="fw-bold text-decoration-underline" /> }}
              />
            </li>
            <li className="mb-2">
              <Trans
                i18nKey="documentationBodies.intro.step2"
                components={{ link: <Link href={docHref(basePath, 'crear-menu')} className="fw-bold text-decoration-underline" /> }}
              />
            </li>
            <li className="mb-2">
              <Trans
                i18nKey="documentationBodies.intro.step3"
                components={{ link: <Link href={docHref(basePath, 'crear-secciones')} className="fw-bold text-decoration-underline" /> }}
              />
            </li>
            <li className="mb-2">
              <Trans
                i18nKey="documentationBodies.intro.step4"
                components={{ link: <Link href={docHref(basePath, 'crear-productos')} className="fw-bold text-decoration-underline" /> }}
              />
            </li>
            <li className="mb-2">
              <Trans
                i18nKey="documentationBodies.intro.step5"
                components={{ link: <Link href={docHref(basePath, 'reordenar-productos')} className="fw-bold text-decoration-underline" /> }}
              />
            </li>
            <li className="mb-2">
              <Trans
                i18nKey="documentationBodies.intro.step6"
                components={{ link: <Link href={docHref(basePath, 'importar-menu-csv')} className="fw-bold text-decoration-underline" /> }}
              />
            </li>
            <li className="mb-2">
              <Trans
                i18nKey="documentationBodies.intro.step7"
                components={{ link: <Link href={docHref(basePath, 'plantillas')} className="fw-bold text-decoration-underline" /> }}
              />
            </li>
            <li className="mb-2">
              <Trans
                i18nKey="documentationBodies.intro.step8"
                components={{ link: <Link href={docHref(basePath, 'publicar-menu')} className="fw-bold text-decoration-underline" /> }}
              />
            </li>
            <li className="mb-2">
              <Trans
                i18nKey="documentationBodies.intro.step9"
                components={{ link: <Link href={docHref(basePath, 'programar-menu')} className="fw-bold text-decoration-underline" /> }}
              />
            </li>
            <li className="mb-2">
              <Trans
                i18nKey="documentationBodies.intro.step10"
                components={{ link: <Link href={docHref(basePath, 'descargar-qr')} className="fw-bold text-decoration-underline" /> }}
              />
            </li>
            <li className="mb-2">
              <Trans
                i18nKey="documentationBodies.intro.step11"
                components={{ link: <Link href={docHref(basePath, 'imprimir-carta')} className="fw-bold text-decoration-underline" /> }}
              />
            </li>
          </ol>
        </div>
      </div>

      <div className="card mb-5 border-secondary">
        <div className="card-header bg-secondary text-white">
          <h2 className="h5 mb-0">{t('documentationBodies.intro.adminCardTitle')}</h2>
        </div>
        <div className="card-body">
          <ul className="mb-0 ps-3">
            <li className="mb-2">
              <Trans
                i18nKey="documentationBodies.intro.admin1"
                components={{ link: <Link href={docHref(basePath, 'desactivar-restaurante')} className="fw-semibold text-decoration-underline" /> }}
              />
            </li>
            <li className="mb-2">
              <Trans
                i18nKey="documentationBodies.intro.admin2"
                components={{ link: <Link href={docHref(basePath, 'eliminar-restaurante')} className="fw-semibold text-decoration-underline" /> }}
              />
            </li>
            <li className="mb-2">
              <Trans
                i18nKey="documentationBodies.intro.admin3"
                components={{ link: <Link href={docHref(basePath, 'menu-visibilidad-y-eliminacion')} className="fw-semibold text-decoration-underline" /> }}
              />
            </li>
            <li className="mb-2">
              <Trans
                i18nKey="documentationBodies.intro.admin4"
                components={{ link: <Link href={docHref(basePath, 'traducciones')} className="fw-semibold text-decoration-underline" /> }}
              />
            </li>
            <li className="mb-2">
              <Trans
                i18nKey="documentationBodies.intro.admin5"
                components={{ link: <Link href={docHref(basePath, 'edicion-masiva-productos')} className="fw-semibold text-decoration-underline" /> }}
              />
            </li>
            <li className="mb-2">
              <Trans
                i18nKey="documentationBodies.intro.admin6"
                components={{ link: <Link href={docHref(basePath, 'editar-productos-detalle')} className="fw-semibold text-decoration-underline" /> }}
              />
            </li>
            <li className="mb-0">
              <Trans
                i18nKey="documentationBodies.intro.admin7"
                components={{ link: <Link href={docHref(basePath, 'suscripciones-y-pagos')} className="fw-semibold text-decoration-underline" /> }}
              />
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}

export function DocCrearRestauranteBody(): ReactNode {
  const { t } = useTranslation();
  return (
    <>
      <DocPrimerosPasosVideo />
      <div className="card mb-4">
      <div className="card-header bg-primary text-white">
        <h2 className="h4 mb-0">{t('documentationBodies.crearRestaurante.cardTitle')}</h2>
      </div>
      <div className="card-body">
        <p className="mb-3">{t('documentationBodies.crearRestaurante.p1')}</p>
        <p className="mb-3">
          <Trans i18nKey="documentationBodies.crearRestaurante.p2" components={{ strong: <strong /> }} />
        </p>
        <ol>
          <li className="mb-2">
            <Trans i18nKey="documentationBodies.crearRestaurante.step1" components={{ strong: <strong /> }} />
          </li>
          <li className="mb-2">
            <Trans i18nKey="documentationBodies.crearRestaurante.step2" components={{ strong: <strong /> }} />
          </li>
          <li className="mb-2">
            <Trans i18nKey="documentationBodies.crearRestaurante.step3Intro" components={{ strong: <strong /> }} />
            <ul className="mt-2">
              <li><Trans i18nKey="documentationBodies.crearRestaurante.fieldName" components={{ strong: <strong /> }} /></li>
              <li><Trans i18nKey="documentationBodies.crearRestaurante.fieldDescription" components={{ strong: <strong /> }} /></li>
              <li>
                <Trans i18nKey="documentationBodies.crearRestaurante.fieldAddress" components={{ strong: <strong /> }} />
              </li>
              <li>
                <Trans i18nKey="documentationBodies.crearRestaurante.fieldPhone" components={{ strong: <strong /> }} />
              </li>
              <li>
                <Trans i18nKey="documentationBodies.crearRestaurante.fieldWhatsapp" components={{ strong: <strong /> }} />
              </li>
              <li><Trans i18nKey="documentationBodies.crearRestaurante.fieldEmail" components={{ strong: <strong /> }} /></li>
              <li><Trans i18nKey="documentationBodies.crearRestaurante.fieldLogoLabel" components={{ strong: <strong /> }} />
                <ul>
                  {(t('documentationBodies.crearRestaurante.fieldLogoSpecs', { returnObjects: true }) as string[]).map((spec) => (
                    <li key={spec}>{spec}</li>
                  ))}
                </ul>
              </li>
              <li><Trans i18nKey="documentationBodies.crearRestaurante.fieldCoverLabel" components={{ strong: <strong /> }} />
                <ul>
                  {(t('documentationBodies.crearRestaurante.fieldCoverSpecs', { returnObjects: true }) as string[]).map((spec) => (
                    <li key={spec}>{spec}</li>
                  ))}
                </ul>
              </li>
              <li>
                <Trans i18nKey="documentationBodies.crearRestaurante.fieldTemplate" components={{ strong: <strong /> }} />
              </li>
              <li>
                <Trans i18nKey="documentationBodies.crearRestaurante.fieldCurrency" components={{ strong: <strong /> }} />
              </li>
            </ul>
          </li>
          <li className="mb-2">
            <Trans i18nKey="documentationBodies.crearRestaurante.step4" components={{ strong: <strong /> }} />
          </li>
        </ol>
        <p className="mb-0 mt-3">
          <Trans i18nKey="documentationBodies.crearRestaurante.nextStep" components={{ strong: <strong /> }} />
        </p>
        <div className="alert alert-info mt-3">
          <Trans i18nKey="documentationBodies.crearRestaurante.tip" components={{ strong: <strong /> }} />
        </div>
      </div>
    </div>
    </>
  );
}

export function DocCrearMenuBody({ basePath }: BodyProps): ReactNode {
  const { t } = useTranslation();
  return (
    <>
      <DocPrimerosPasosVideo />
      <div className="card mb-4">
      <div className="card-header bg-success text-white">
        <h2 className="h4 mb-0">{t('documentationBodies.crearMenu.cardTitle')}</h2>
      </div>
      <div className="card-body">
        <p className="mb-3">{t('documentationBodies.crearMenu.p1')}</p>
        <ol>
          <li className="mb-2">
            <Trans i18nKey="documentationBodies.crearMenu.step1" components={{ strong: <strong /> }} />
          </li>
          <li className="mb-2">
            <Trans i18nKey="documentationBodies.crearMenu.step2" components={{ strong: <strong /> }} />
          </li>
          <li className="mb-2">
            <Trans i18nKey="documentationBodies.crearMenu.step3Intro" components={{ strong: <strong /> }} />
            <ul className="mt-2">
              <li>
                <Trans i18nKey="documentationBodies.crearMenu.fieldBusiness" components={{ strong: <strong /> }} />
              </li>
              <li>
                <Trans i18nKey="documentationBodies.crearMenu.fieldName" components={{ strong: <strong /> }} />
              </li>
              <li><Trans i18nKey="documentationBodies.crearMenu.fieldDescription" components={{ strong: <strong /> }} /></li>
            </ul>
          </li>
          <li className="mb-2">
            <Trans i18nKey="documentationBodies.crearMenu.step4" components={{ strong: <strong /> }} />
          </li>
        </ol>
        <p className="mb-3 mt-3">
          <Trans i18nKey="documentationBodies.crearMenu.p2" components={{ strong: <strong /> }} />
        </p>
        <p className="mb-0">
          <Trans
            i18nKey="documentationBodies.crearMenu.alternative"
            components={{ strong: <strong />, link: <Link href={docHref(basePath, 'importar-menu-csv')} /> }}
          />
        </p>
        <div className="alert alert-info mt-3">
          <Trans i18nKey="documentationBodies.crearMenu.tip" components={{ strong: <strong /> }} />
        </div>
      </div>
    </div>
    </>
  );
}

export function DocImportarMenuCsvBody(): ReactNode {
  const { t } = useTranslation();
  return (
    <div className="card mb-4">
      <div className="card-header bg-secondary text-white">
        <h2 className="h4 mb-0">{t('documentationBodies.importarMenuCsv.cardTitle')}</h2>
      </div>
      <div className="card-body">
        <p className="mb-3">
          <Trans i18nKey="documentationBodies.importarMenuCsv.p1" components={{ strong: <strong /> }} />
        </p>
        <h3 className="h6 text-uppercase text-muted mb-2">{t('documentationBodies.importarMenuCsv.fromAppHeading')}</h3>
        <ol className="mb-4">
          <li className="mb-2">
            <Trans i18nKey="documentationBodies.importarMenuCsv.fromAppStep1" components={{ strong: <strong /> }} />
          </li>
          <li className="mb-2">
            <Trans i18nKey="documentationBodies.importarMenuCsv.fromAppStep2" components={{ strong: <strong /> }} />
          </li>
          <li className="mb-2">
            <Trans
              i18nKey="documentationBodies.importarMenuCsv.fromAppStep3"
              components={{ a: <a href="/templates/menu-import-ejemplo.csv" download /> }}
            />
          </li>
        </ol>

        <h3 className="h6 text-uppercase text-muted mb-2">{t('documentationBodies.importarMenuCsv.sectionsHeading')}</h3>
        <ul className="mb-4">
          <li className="mb-2">
            <Trans i18nKey="documentationBodies.importarMenuCsv.sectionsLi1" components={{ strong: <strong />, code: <code /> }} />
          </li>
          <li className="mb-2">
            <Trans i18nKey="documentationBodies.importarMenuCsv.sectionsLi2" components={{ strong: <strong />, code: <code /> }} />
          </li>
        </ul>

        <h3 className="h6 text-uppercase text-muted mb-2">{t('documentationBodies.importarMenuCsv.productsHeading')}</h3>
        <ul className="mb-4">
          <li className="mb-2">
            <Trans i18nKey="documentationBodies.importarMenuCsv.productsLi1" components={{ code: <code /> }} />
          </li>
          <li className="mb-2">
            <Trans i18nKey="documentationBodies.importarMenuCsv.productsLi2" components={{ code: <code /> }} />
          </li>
          <li className="mb-2">
            <Trans i18nKey="documentationBodies.importarMenuCsv.productsLi3" components={{ strong: <strong />, code: <code /> }} />
          </li>
          <li className="mb-2">
            <Trans i18nKey="documentationBodies.importarMenuCsv.productsLi4" components={{ strong: <strong />, code: <code /> }} />
          </li>
          <li className="mb-2">
            <Trans i18nKey="documentationBodies.importarMenuCsv.productsLi5" components={{ strong: <strong /> }} />
          </li>
          <li className="mb-2">
            <Trans i18nKey="documentationBodies.importarMenuCsv.productsLi6" components={{ code: <code /> }} />
          </li>
        </ul>

        <h3 className="h6 text-uppercase text-muted mb-2">{t('documentationBodies.importarMenuCsv.allergensHeading')}</h3>
        <p className="mb-2">
          <Trans i18nKey="documentationBodies.importarMenuCsv.allergensP1" components={{ strong: <strong />, code: <code /> }} />
        </p>
        <ul className="mb-4">
          <li><code>celiaco</code></li>
          <li><code>picante</code></li>
          <li><code>vegano</code></li>
          <li><code>vegetariano</code></li>
          <li><code>sin-gluten</code></li>
          <li><code>sin-lactosa</code></li>
        </ul>
        <p className="mb-4">
          <Trans i18nKey="documentationBodies.importarMenuCsv.allergensP2" components={{ strong: <strong /> }} />
        </p>

        <h3 className="h6 text-uppercase text-muted mb-2">{t('documentationBodies.importarMenuCsv.afterImportHeading')}</h3>
        <p className="mb-3">
          <Trans i18nKey="documentationBodies.importarMenuCsv.afterImportP" components={{ strong: <strong /> }} />
        </p>

        <h3 className="h6 text-uppercase text-muted mb-2">{t('documentationBodies.importarMenuCsv.limitsHeading')}</h3>
        <ul className="mb-4">
          <li className="mb-2">
            <Trans i18nKey="documentationBodies.importarMenuCsv.limitsLi1" components={{ strong: <strong /> }} />
          </li>
        </ul>

        <p className="mb-0">
          <Trans i18nKey="documentationBodies.importarMenuCsv.finalP" components={{ strong: <strong /> }} />
        </p>
      </div>
    </div>
  );
}

export function DocCrearSeccionesBody({ basePath }: BodyProps): ReactNode {
  const { t } = useTranslation();
  return (
    <>
      <DocAudienceBlock title={t('documentationBodies.crearSecciones.audienceTitle')}>
        <p className="mb-2">
          <Trans
            i18nKey="documentationBodies.crearSecciones.audienceP1"
            components={{ strong: <strong />, link: <Link href={docHref(basePath, 'crear-menu')} /> }}
          />
        </p>
        <ul className="mb-0 ps-3">
          {(t('documentationBodies.crearSecciones.audienceItems', { returnObjects: true }) as string[]).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </DocAudienceBlock>

      <div className="card mb-4">
        <div className="card-header bg-info text-white">
          <h2 className="h4 mb-0">{t('documentationBodies.crearSecciones.cardTitle')}</h2>
        </div>
        <div className="card-body">
          <p className="mb-3">
            <Trans i18nKey="documentationBodies.crearSecciones.p1" components={{ strong: <strong /> }} />
          </p>
          <p className="mb-3">
            <Trans i18nKey="documentationBodies.crearSecciones.p2" components={{ strong: <strong /> }} />
          </p>
          <ol>
            <li className="mb-2">
              <Trans i18nKey="documentationBodies.crearSecciones.step1" components={{ strong: <strong /> }} />
            </li>
            <li className="mb-2">
              <Trans i18nKey="documentationBodies.crearSecciones.step2" components={{ strong: <strong /> }} />
            </li>
            <li className="mb-2">
              <Trans i18nKey="documentationBodies.crearSecciones.step3Intro" components={{ strong: <strong /> }} />
              <ul className="mt-2">
                <li>{t('documentationBodies.crearSecciones.step3Li1')}</li>
                <li><Trans i18nKey="documentationBodies.crearSecciones.step3Li2" components={{ strong: <strong /> }} /></li>
                <li><Trans i18nKey="documentationBodies.crearSecciones.step3Li3" components={{ strong: <strong /> }} /></li>
                <li><Trans i18nKey="documentationBodies.crearSecciones.step3Li4" components={{ strong: <strong /> }} /></li>
                <li>{t('documentationBodies.crearSecciones.step3Li5')}</li>
              </ul>
            </li>
            <li className="mb-2">
              <Trans i18nKey="documentationBodies.crearSecciones.step4" components={{ strong: <strong /> }} />
            </li>
          </ol>
          <p className="mb-3 mt-3">
            <Trans
              i18nKey="documentationBodies.crearSecciones.renameP"
              components={{ strong: <strong />, link: <Link href={docHref(basePath, 'crear-productos')} /> }}
            />
          </p>
          <div className="alert alert-info mt-3 mb-0">
            <Trans
              i18nKey="documentationBodies.crearSecciones.tip"
              components={{ strong: <strong />, link: <Link href={docHref(basePath, 'importar-menu-csv')} /> }}
            />
          </div>
        </div>
      </div>

      <DocSeeAlso
        basePath={basePath}
        slugs={['crear-menu', 'crear-productos', 'reordenar-productos', 'importar-menu-csv']}
      />

      <DocFaqBlock
        items={[
          {
            q: t('documentationBodies.crearSecciones.faq.0.q'),
            a: <Trans i18nKey="documentationBodies.crearSecciones.faq.0.a" components={{ strong: <strong /> }} />,
          },
          {
            q: t('documentationBodies.crearSecciones.faq.1.q'),
            a: <Trans i18nKey="documentationBodies.crearSecciones.faq.1.a" />,
          },
          {
            q: t('documentationBodies.crearSecciones.faq.2.q'),
            a: (
              <Trans
                i18nKey="documentationBodies.crearSecciones.faq.2.a"
                components={{ strong: <strong />, link: <Link href={docHref(basePath, 'importar-menu-csv')} /> }}
              />
            ),
          },
        ]}
      />
    </>
  );
}

export function DocCrearProductosBody(): ReactNode {
  const { t } = useTranslation();
  return (
    <div className="card mb-4">
      <div className="card-header bg-warning text-dark">
        <h2 className="h4 mb-0">{t('documentationBodies.crearProductos.cardTitle')}</h2>
      </div>
      <div className="card-body">
        <p className="mb-3">{t('documentationBodies.crearProductos.p1')}</p>
        <ol>
          <li className="mb-2">
            <Trans i18nKey="documentationBodies.crearProductos.step1" components={{ strong: <strong /> }} />
          </li>
          <li className="mb-2">
            <Trans i18nKey="documentationBodies.crearProductos.step2" components={{ strong: <strong /> }} />
          </li>
          <li className="mb-2">
            <Trans i18nKey="documentationBodies.crearProductos.step3Intro" components={{ strong: <strong /> }} />
            <ul className="mt-2">
              <li>{t('documentationBodies.crearProductos.createButton')}</li>
              <li><Trans i18nKey="documentationBodies.crearProductos.sub1Title" components={{ strong: <strong /> }} />
                <ul>
                  {(t('documentationBodies.crearProductos.sub1Items', { returnObjects: true }) as string[]).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </li>
              <li><Trans i18nKey="documentationBodies.crearProductos.sub2Title" components={{ strong: <strong /> }} />
                <ul>
                  <li>{t('documentationBodies.crearProductos.sub2Item1')}</li>
                  <li>{t('documentationBodies.crearProductos.sub2Item2')}</li>
                  <li>
                    <Trans i18nKey="documentationBodies.crearProductos.sub2Item3" components={{ strong: <strong /> }} />
                  </li>
                  <li>{t('documentationBodies.crearProductos.sub2Item4')}</li>
                </ul>
              </li>
              <li><Trans i18nKey="documentationBodies.crearProductos.sub3Title" components={{ strong: <strong /> }} />
                <ul>
                  {(t('documentationBodies.crearProductos.sub3Items', { returnObjects: true }) as string[]).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </li>
            </ul>
          </li>
          <li className="mb-2">
            <Trans i18nKey="documentationBodies.crearProductos.step4" components={{ strong: <strong /> }} />
          </li>
          <li className="mb-2">
            <Trans i18nKey="documentationBodies.crearProductos.step5" components={{ strong: <strong /> }} />
          </li>
        </ol>
        <div className="alert alert-info mt-3">
          <Trans i18nKey="documentationBodies.crearProductos.tip" components={{ strong: <strong /> }} />
        </div>
      </div>
    </div>
  );
}

export function DocReordenarProductosBody({ basePath }: BodyProps): ReactNode {
  const { t } = useTranslation();
  return (
    <>
      <DocAudienceBlock title={t('documentationBodies.reordenarProductos.audienceTitle')}>
        <p className="mb-2">
          <Trans i18nKey="documentationBodies.reordenarProductos.audienceP1" components={{ strong: <strong /> }} />
        </p>
      </DocAudienceBlock>

      <div className="card mb-4">
        <div className="card-header bg-danger text-white">
          <h2 className="h4 mb-0">{t('documentationBodies.reordenarProductos.cardTitle')}</h2>
        </div>
        <div className="card-body">
          <p className="mb-3">
            <Trans i18nKey="documentationBodies.reordenarProductos.p1" components={{ strong: <strong /> }} />
          </p>
          <ol>
            <li className="mb-2">
              <Trans i18nKey="documentationBodies.reordenarProductos.step1" components={{ strong: <strong /> }} />
            </li>
            <li className="mb-2">
              <Trans i18nKey="documentationBodies.reordenarProductos.step2" components={{ strong: <strong /> }} />
            </li>
            <li className="mb-2">
              <Trans i18nKey="documentationBodies.reordenarProductos.step3Intro" components={{ strong: <strong /> }} />
              <ul className="mt-2">
                {(t('documentationBodies.reordenarProductos.step3Items', { returnObjects: true }) as string[]).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </li>
            <li className="mb-2">
              <Trans i18nKey="documentationBodies.reordenarProductos.step4" components={{ strong: <strong /> }} />
            </li>
          </ol>
          <p className="mb-0 mt-3">
            <Trans i18nKey="documentationBodies.reordenarProductos.p2" components={{ strong: <strong /> }} />
          </p>
          <div className="alert alert-warning mt-3 mb-0">
            <Trans i18nKey="documentationBodies.reordenarProductos.warning" components={{ strong: <strong /> }} />
          </div>
        </div>
      </div>

      <DocSeeAlso basePath={basePath} slugs={['crear-secciones', 'crear-productos', 'edicion-masiva-productos']} />

      <DocFaqBlock
        items={[
          {
            q: t('documentationBodies.reordenarProductos.faq.0.q'),
            a: <Trans i18nKey="documentationBodies.reordenarProductos.faq.0.a" />,
          },
          {
            q: t('documentationBodies.reordenarProductos.faq.1.q'),
            a: (
              <Trans
                i18nKey="documentationBodies.reordenarProductos.faq.1.a"
                components={{ strong: <strong />, link: <Link href={docHref(basePath, 'importar-menu-csv')} /> }}
              />
            ),
          },
        ]}
      />
    </>
  );
}

export function DocPlantillasBody({ basePath }: BodyProps): ReactNode {
  const { t } = useTranslation();
  return (
    <>
      <DocAudienceBlock title={t('documentationBodies.plantillas.audienceTitle')}>
        <p className="mb-0">
          <Trans i18nKey="documentationBodies.plantillas.audienceP1" components={{ strong: <strong /> }} />
        </p>
      </DocAudienceBlock>

      <div className="card mb-4">
        <div className="card-header bg-secondary text-white">
          <h2 className="h4 mb-0">{t('documentationBodies.plantillas.cardTitle')}</h2>
        </div>
        <div className="card-body">
          <p className="mb-3">
            <Trans i18nKey="documentationBodies.plantillas.p1" components={{ strong: <strong /> }} />
          </p>
          <p className="mb-3">
            <Trans i18nKey="documentationBodies.plantillas.p2" components={{ strong: <strong /> }} />
          </p>
          <p className="mb-3">
            <Trans i18nKey="documentationBodies.plantillas.p3" components={{ strong: <strong /> }} />
          </p>
          <p className="mb-3">
            <Trans i18nKey="documentationBodies.plantillas.p4" components={{ strong: <strong /> }} />
          </p>
          <p className="mb-3">
            <Trans i18nKey="documentationBodies.plantillas.p5" components={{ strong: <strong /> }} />
          </p>
          <p className="mb-3">
            <Trans i18nKey="documentationBodies.plantillas.p6" components={{ strong: <strong /> }} />
          </p>
          <div className="alert alert-info mt-3 mb-0">
            <Trans
              i18nKey="documentationBodies.plantillas.tip"
              components={{ strong: <strong />, link: <Link href={docHref(basePath, 'descargar-qr')} /> }}
            />
          </div>
        </div>
      </div>

      <DocSeeAlso basePath={basePath} slugs={['catalogo-plantillas', 'crear-restaurante', 'publicar-menu', 'descargar-qr', 'crear-menu']} />

      <DocFaqBlock
        items={[
          {
            q: t('documentationBodies.plantillas.faq.0.q'),
            a: (
              <Trans
                i18nKey="documentationBodies.plantillas.faq.0.a"
                components={{ strong: <strong />, link: <Link href={docHref(basePath, 'publicar-menu')} /> }}
              />
            ),
          },
          {
            q: t('documentationBodies.plantillas.faq.1.q'),
            a: <Trans i18nKey="documentationBodies.plantillas.faq.1.a" components={{ strong: <strong /> }} />,
          },
        ]}
      />
    </>
  );
}

export function DocPublicarMenuBody({ basePath }: BodyProps): ReactNode {
  const { t } = useTranslation();
  return (
    <>
      <DocAudienceBlock title={t('documentationBodies.publicarMenu.audienceTitle')}>
        <p className="mb-0">
          <Trans i18nKey="documentationBodies.publicarMenu.audienceP1" components={{ strong: <strong /> }} />
        </p>
      </DocAudienceBlock>

      <div className="card mb-4">
        <div className="card-header bg-dark text-white">
          <h2 className="h4 mb-0">{t('documentationBodies.publicarMenu.cardTitle')}</h2>
        </div>
        <div className="card-body">
          <p className="mb-3">
            <Trans i18nKey="documentationBodies.publicarMenu.p1" components={{ strong: <strong /> }} />
          </p>
          <h3 className="h6 text-uppercase text-muted mb-2">{t('documentationBodies.publicarMenu.checklistHeading')}</h3>
          <ul className="mb-4 ps-3">
            <li className="mb-2">{t('documentationBodies.publicarMenu.checklist1')}</li>
            <li className="mb-2">
              <Trans
                i18nKey="documentationBodies.publicarMenu.checklist2"
                components={{ link: <Link href={docHref(basePath, 'crear-secciones')} /> }}
              />
            </li>
            <li className="mb-2">{t('documentationBodies.publicarMenu.checklist3')}</li>
            <li className="mb-2">{t('documentationBodies.publicarMenu.checklist4')}</li>
          </ul>
          <ol className="mb-4">
            <li className="mb-2">
              <Trans i18nKey="documentationBodies.publicarMenu.step1" components={{ strong: <strong /> }} />
            </li>
            <li className="mb-2">
              <Trans i18nKey="documentationBodies.publicarMenu.step2" components={{ strong: <strong /> }} />
            </li>
            <li className="mb-2">
              <Trans i18nKey="documentationBodies.publicarMenu.step3" components={{ strong: <strong /> }} />
            </li>
          </ol>
          <p className="mb-3">
            <Trans i18nKey="documentationBodies.publicarMenu.p2" components={{ strong: <strong /> }} />
          </p>
          <p className="mb-0">
            <Trans
              i18nKey="documentationBodies.publicarMenu.p3"
              components={{ strong: <strong />, link: <Link href={docHref(basePath, 'menu-visibilidad-y-eliminacion')} /> }}
            />
          </p>
        </div>
      </div>

      <DocSeeAlso basePath={basePath} slugs={['programar-menu', 'descargar-qr', 'menu-visibilidad-y-eliminacion', 'crear-menu']} />

      <DocFaqBlock
        items={[
          {
            q: t('documentationBodies.publicarMenu.faq.0.q'),
            a: (
              <Trans
                i18nKey="documentationBodies.publicarMenu.faq.0.a"
                components={{ strong: <strong />, link: <Link href={docHref(basePath, 'desactivar-restaurante')} /> }}
              />
            ),
          },
          {
            q: t('documentationBodies.publicarMenu.faq.1.q'),
            a: (
              <Trans
                i18nKey="documentationBodies.publicarMenu.faq.1.a"
                components={{ strong: <strong />, link: <Link href={docHref(basePath, 'programar-menu')} /> }}
              />
            ),
          },
        ]}
      />
    </>
  );
}

export function DocProgramarMenuBody({ basePath }: BodyProps): ReactNode {
  const { t } = useTranslation();
  return (
    <>
      <DocAudienceBlock title={t('documentationBodies.programarMenu.audienceTitle')}>
        <p className="mb-0">
          <Trans
            i18nKey="documentationBodies.programarMenu.audienceP1"
            components={{ strong: <strong />, link: <Link href={docHref(basePath, 'suscripciones-y-pagos')} /> }}
          />
        </p>
      </DocAudienceBlock>

      <div className="card mb-4">
        <div className="card-header bg-dark text-white">
          <h2 className="h4 mb-0">{t('documentationBodies.programarMenu.cardTitle')}</h2>
        </div>
        <div className="card-body">
          <p className="mb-3">
            <Trans i18nKey="documentationBodies.programarMenu.p1" components={{ strong: <strong /> }} />
          </p>
          <h3 className="h6 text-uppercase text-muted mb-2">{t('documentationBodies.programarMenu.checklistHeading')}</h3>
          <ul className="mb-4 ps-3">
            <li className="mb-2">
              <Trans
                i18nKey="documentationBodies.programarMenu.checklist1"
                components={{ strong: <strong />, link: <Link href={docHref(basePath, 'publicar-menu')} /> }}
              />
            </li>
            <li className="mb-2">
              <Trans i18nKey="documentationBodies.programarMenu.checklist2" components={{ strong: <strong /> }} />
            </li>
            <li className="mb-2">{t('documentationBodies.programarMenu.checklist3')}</li>
          </ul>
          <ol className="mb-4">
            <li className="mb-2">
              <Trans
                i18nKey="documentationBodies.programarMenu.step1"
                components={{
                  strong: <strong />,
                  scheduleLink: (
                    <Link href="/admin/menus/schedule" target="_blank" rel="noopener noreferrer" />
                  ),
                }}
              />
            </li>
            <li className="mb-2">
              <Trans i18nKey="documentationBodies.programarMenu.step2" components={{ strong: <strong /> }} />
            </li>
            <li className="mb-2">
              <Trans i18nKey="documentationBodies.programarMenu.step3" components={{ strong: <strong /> }} />
            </li>
            <li className="mb-2">
              <Trans i18nKey="documentationBodies.programarMenu.step4" components={{ strong: <strong /> }} />
            </li>
            <li className="mb-2">
              <Trans i18nKey="documentationBodies.programarMenu.step5" components={{ strong: <strong /> }} />
            </li>
            <li className="mb-2">
              <Trans i18nKey="documentationBodies.programarMenu.step6" components={{ strong: <strong />, em: <em /> }} />
            </li>
            <li className="mb-2">
              <Trans i18nKey="documentationBodies.programarMenu.step7" components={{ strong: <strong /> }} />
            </li>
            <li className="mb-2">
              <Trans i18nKey="documentationBodies.programarMenu.step8" components={{ strong: <strong /> }} />
            </li>
          </ol>
          <p className="mb-3">
            <Trans i18nKey="documentationBodies.programarMenu.p2" components={{ strong: <strong /> }} />
          </p>
          <div className="alert alert-info mb-0">
            <Trans i18nKey="documentationBodies.programarMenu.example" components={{ strong: <strong /> }} />
          </div>
        </div>
      </div>

      <DocSeeAlso basePath={basePath} slugs={['publicar-menu', 'menu-visibilidad-y-eliminacion', 'suscripciones-y-pagos']} />

      <DocFaqBlock
        items={[
          {
            q: t('documentationBodies.programarMenu.faq.0.q'),
            a: (
              <Trans
                i18nKey="documentationBodies.programarMenu.faq.0.a"
                components={{ strong: <strong />, link: <Link href={docHref(basePath, 'publicar-menu')} /> }}
              />
            ),
          },
          {
            q: t('documentationBodies.programarMenu.faq.1.q'),
            a: <Trans i18nKey="documentationBodies.programarMenu.faq.1.a" components={{ strong: <strong /> }} />,
          },
          {
            q: t('documentationBodies.programarMenu.faq.2.q'),
            a: (
              <Trans
                i18nKey="documentationBodies.programarMenu.faq.2.a"
                components={{ strong: <strong />, link: <Link href={docHref(basePath, 'suscripciones-y-pagos')} /> }}
              />
            ),
          },
        ]}
      />
    </>
  );
}

export function DocImprimirCartaBody({ basePath }: BodyProps): ReactNode {
  const { t } = useTranslation();
  return (
    <>
      <DocAudienceBlock title={t('documentationBodies.imprimirCarta.audienceTitle')}>
        <p className="mb-0">
          <Trans i18nKey="documentationBodies.imprimirCarta.audienceP1" components={{ strong: <strong /> }} />
        </p>
      </DocAudienceBlock>

      <div className="card mb-4">
        <div className="card-header bg-dark text-white">
          <h2 className="h4 mb-0">{t('documentationBodies.imprimirCarta.cardTitle')}</h2>
        </div>
        <div className="card-body">
          <p className="mb-3">{t('documentationBodies.imprimirCarta.p1')}</p>
          <h3 className="h6 text-uppercase text-muted mb-2">{t('documentationBodies.imprimirCarta.checklistHeading')}</h3>
          <ul className="mb-4 ps-3">
            <li className="mb-2">{t('documentationBodies.imprimirCarta.checklist1')}</li>
            <li className="mb-2">{t('documentationBodies.imprimirCarta.checklist2')}</li>
            <li className="mb-2">{t('documentationBodies.imprimirCarta.checklist3')}</li>
          </ul>
          <ol className="mb-4">
            <li className="mb-2">
              <Trans i18nKey="documentationBodies.imprimirCarta.step1" components={{ strong: <strong /> }} />
            </li>
            <li className="mb-2">
              <Trans i18nKey="documentationBodies.imprimirCarta.step2" components={{ strong: <strong /> }} />
            </li>
            <li className="mb-2">
              <Trans i18nKey="documentationBodies.imprimirCarta.step3Intro" components={{ strong: <strong /> }} />
              <ul className="mt-2 mb-0">
                {(t('documentationBodies.imprimirCarta.step3Items', { returnObjects: true }) as string[]).map((item, idx) => (
                  <li key={idx}>
                    <Trans i18nKey={`documentationBodies.imprimirCarta.step3Items.${idx}`} components={{ strong: <strong /> }} />
                  </li>
                ))}
              </ul>
            </li>
            <li className="mb-2">
              <Trans i18nKey="documentationBodies.imprimirCarta.step4" components={{ strong: <strong /> }} />
            </li>
            <li className="mb-2">
              <Trans i18nKey="documentationBodies.imprimirCarta.step5Intro" components={{ strong: <strong /> }} />
              <ul className="mt-2 mb-0">
                {(t('documentationBodies.imprimirCarta.step5Items', { returnObjects: true }) as string[]).map((item, idx) => (
                  <li key={idx}>
                    <Trans i18nKey={`documentationBodies.imprimirCarta.step5Items.${idx}`} components={{ strong: <strong /> }} />
                  </li>
                ))}
              </ul>
            </li>
            <li className="mb-2">
              <Trans i18nKey="documentationBodies.imprimirCarta.step6" components={{ strong: <strong /> }} />
            </li>
            <li className="mb-2">
              <Trans i18nKey="documentationBodies.imprimirCarta.step7" components={{ strong: <strong /> }} />
            </li>
            <li className="mb-2">
              <Trans i18nKey="documentationBodies.imprimirCarta.step8" components={{ strong: <strong /> }} />
            </li>
          </ol>
          <p className="mb-3">{t('documentationBodies.imprimirCarta.p2')}</p>
          <div className="alert alert-warning mb-0">
            <Trans i18nKey="documentationBodies.imprimirCarta.tip" components={{ strong: <strong /> }} />
          </div>
        </div>
      </div>

      <DocSeeAlso basePath={basePath} slugs={['publicar-menu', 'plantillas', 'traducciones', 'descargar-qr']} />

      <DocFaqBlock
        items={[
          {
            q: t('documentationBodies.imprimirCarta.faq.0.q'),
            a: <Trans i18nKey="documentationBodies.imprimirCarta.faq.0.a" />,
          },
          {
            q: t('documentationBodies.imprimirCarta.faq.1.q'),
            a: (
              <Trans
                i18nKey="documentationBodies.imprimirCarta.faq.1.a"
                components={{ link: <Link href={docHref(basePath, 'plantillas')} /> }}
              />
            ),
          },
          {
            q: t('documentationBodies.imprimirCarta.faq.2.q'),
            a: <Trans i18nKey="documentationBodies.imprimirCarta.faq.2.a" components={{ strong: <strong /> }} />,
          },
        ]}
      />
    </>
  );
}

export function DocDescargarQrBody(): ReactNode {
  const { t } = useTranslation();
  return (
    <div className="card mb-4">
      <div className="card-header bg-dark text-white">
        <h2 className="h4 mb-0">{t('documentationBodies.descargarQr.cardTitle')}</h2>
      </div>
      <div className="card-body">
        <p className="mb-3">
          <Trans i18nKey="documentationBodies.descargarQr.p1" components={{ strong: <strong /> }} />
        </p>
        <p className="mb-3">
          <Trans i18nKey="documentationBodies.descargarQr.p2" components={{ strong: <strong /> }} />
        </p>
        <div className="alert alert-warning mb-4">
          <Trans i18nKey="documentationBodies.descargarQr.warning" components={{ strong: <strong /> }} />
        </div>

        <h3 className="h6 text-uppercase text-muted mb-2">{t('documentationBodies.descargarQr.dashboardHeading')}</h3>
        <ol className="mb-4">
          <li className="mb-2">
            <Trans i18nKey="documentationBodies.descargarQr.dashboardStep1" components={{ strong: <strong /> }} />
          </li>
          <li className="mb-2">
            <Trans i18nKey="documentationBodies.descargarQr.dashboardStep2" components={{ strong: <strong /> }} />
          </li>
          <li className="mb-2">
            <Trans i18nKey="documentationBodies.descargarQr.dashboardStep3" components={{ strong: <strong /> }} />
          </li>
          <li className="mb-2">
            <Trans i18nKey="documentationBodies.descargarQr.dashboardStep4" components={{ strong: <strong /> }} />
          </li>
        </ol>

        <h3 className="h6 text-uppercase text-muted mb-2">{t('documentationBodies.descargarQr.downloadHeading')}</h3>
        <ul className="mb-4">
          {(t('documentationBodies.descargarQr.downloadItems', { returnObjects: true }) as string[]).map((item) => (
            <li className="mb-2" key={item}>{item}</li>
          ))}
        </ul>

        <div className="alert alert-success mt-3 mb-0">
          <Trans i18nKey="documentationBodies.descargarQr.success" components={{ strong: <strong /> }} />
        </div>
      </div>
    </div>
  );
}

export function DocDesactivarRestauranteBody({ basePath }: BodyProps): ReactNode {
  const { t } = useTranslation();
  return (
    <>
      <DocAudienceBlock title={t('documentationBodies.desactivarRestaurante.audienceTitle')}>
        <p className="mb-0">
          <Trans i18nKey="documentationBodies.desactivarRestaurante.audienceP1" components={{ strong: <strong /> }} />
        </p>
      </DocAudienceBlock>

      <div className="card mb-4">
        <div className="card-header bg-warning text-dark">
          <h2 className="h4 mb-0">{t('documentationBodies.desactivarRestaurante.cardTitle')}</h2>
        </div>
        <div className="card-body">
          <p className="mb-3">
            <Trans i18nKey="documentationBodies.desactivarRestaurante.p1" components={{ strong: <strong /> }} />
          </p>
          <h3 className="h6 text-uppercase text-muted mb-2">{t('documentationBodies.desactivarRestaurante.whatHappensHeading')}</h3>
          <ul className="mb-4 ps-3">
            <li className="mb-2"><Trans i18nKey="documentationBodies.desactivarRestaurante.whatHappens1" components={{ strong: <strong /> }} /></li>
            <li className="mb-2"><Trans i18nKey="documentationBodies.desactivarRestaurante.whatHappens2" components={{ strong: <strong /> }} /></li>
            <li className="mb-2">{t('documentationBodies.desactivarRestaurante.whatHappens3')}</li>
          </ul>
          <h3 className="h6 text-uppercase text-muted mb-2">{t('documentationBodies.desactivarRestaurante.howToHeading')}</h3>
          <ol className="mb-4">
            <li className="mb-2"><Trans i18nKey="documentationBodies.desactivarRestaurante.howTo1" components={{ strong: <strong /> }} /></li>
            <li className="mb-2"><Trans i18nKey="documentationBodies.desactivarRestaurante.howTo2" components={{ strong: <strong /> }} /></li>
            <li className="mb-2">{t('documentationBodies.desactivarRestaurante.howTo3')}</li>
            <li className="mb-2">{t('documentationBodies.desactivarRestaurante.howTo4')}</li>
          </ol>
          <p className="mb-3">
            <Trans i18nKey="documentationBodies.desactivarRestaurante.p2" components={{ strong: <strong /> }} />
          </p>
          <div className="alert alert-info mb-0">
            <Trans
              i18nKey="documentationBodies.desactivarRestaurante.note"
              components={{ strong: <strong />, link: <Link href={docHref(basePath, 'eliminar-restaurante')} /> }}
            />
          </div>
        </div>
      </div>

      <DocSeeAlso basePath={basePath} slugs={['eliminar-restaurante', 'publicar-menu', 'descargar-qr']} />

      <DocFaqBlock
        items={[
          {
            q: t('documentationBodies.desactivarRestaurante.faq.0.q'),
            a: <Trans i18nKey="documentationBodies.desactivarRestaurante.faq.0.a" components={{ strong: <strong /> }} />,
          },
          {
            q: t('documentationBodies.desactivarRestaurante.faq.1.q'),
            a: (
              <Trans
                i18nKey="documentationBodies.desactivarRestaurante.faq.1.a"
                components={{ link: <Link href={docHref(basePath, 'suscripciones-y-pagos')} /> }}
              />
            ),
          },
        ]}
      />
    </>
  );
}

export function DocEliminarRestauranteBody({ basePath }: BodyProps): ReactNode {
  const { t } = useTranslation();
  return (
    <>
      <DocAudienceBlock title={t('documentationBodies.eliminarRestaurante.audienceTitle')}>
        <ul className="mb-0 ps-3">
          <li className="mb-2">{t('documentationBodies.eliminarRestaurante.audienceItem1')}</li>
          <li className="mb-2">{t('documentationBodies.eliminarRestaurante.audienceItem2')}</li>
          <li className="mb-0">
            <Trans
              i18nKey="documentationBodies.eliminarRestaurante.audienceItem3"
              components={{ strong: <strong />, link: <Link href={docHref(basePath, 'desactivar-restaurante')} /> }}
            />
          </li>
        </ul>
      </DocAudienceBlock>

      <div className="card mb-4 border-danger">
        <div className="card-header bg-danger text-white">
          <h2 className="h4 mb-0">{t('documentationBodies.eliminarRestaurante.cardTitle')}</h2>
        </div>
        <div className="card-body">
          <p className="mb-3">
            <Trans i18nKey="documentationBodies.eliminarRestaurante.p1" components={{ strong: <strong /> }} />
          </p>
          <h3 className="h6 text-uppercase text-muted mb-2">{t('documentationBodies.eliminarRestaurante.flowHeading')}</h3>
          <ol className="mb-4">
            <li className="mb-2"><Trans i18nKey="documentationBodies.eliminarRestaurante.flow1" components={{ strong: <strong /> }} /></li>
            <li className="mb-2"><Trans i18nKey="documentationBodies.eliminarRestaurante.flow2" components={{ strong: <strong /> }} /></li>
            <li className="mb-2"><Trans i18nKey="documentationBodies.eliminarRestaurante.flow3" components={{ strong: <strong /> }} /></li>
            <li className="mb-2">{t('documentationBodies.eliminarRestaurante.flow4')}</li>
          </ol>
          <p className="mb-3">{t('documentationBodies.eliminarRestaurante.p2')}</p>
          <div className="alert alert-danger mb-0">
            <Trans i18nKey="documentationBodies.eliminarRestaurante.danger" components={{ strong: <strong /> }} />
          </div>
        </div>
      </div>

      <DocSeeAlso basePath={basePath} slugs={['desactivar-restaurante', 'menu-visibilidad-y-eliminacion', 'suscripciones-y-pagos']} />

      <DocFaqBlock
        items={[
          {
            q: t('documentationBodies.eliminarRestaurante.faq.0.q'),
            a: (
              <Trans
                i18nKey="documentationBodies.eliminarRestaurante.faq.0.a"
                components={{ strong: <strong />, link: <Link href={docHref(basePath, 'menu-visibilidad-y-eliminacion')} /> }}
              />
            ),
          },
        ]}
      />
    </>
  );
}

export function DocMenuVisibilidadEliminacionBody({ basePath }: BodyProps): ReactNode {
  const { t } = useTranslation();
  return (
    <>
      <DocAudienceBlock title={t('documentationBodies.menuVisibilidadEliminacion.audienceTitle')}>
        <p className="mb-0">
          <Trans i18nKey="documentationBodies.menuVisibilidadEliminacion.audienceP1" components={{ strong: <strong /> }} />
        </p>
      </DocAudienceBlock>

      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h2 className="h4 mb-0">{t('documentationBodies.menuVisibilidadEliminacion.cardTitle')}</h2>
        </div>
        <div className="card-body">
          <h3 className="h6 text-uppercase text-muted mb-2">{t('documentationBodies.menuVisibilidadEliminacion.publishedHeading')}</h3>
          <p className="mb-3">
            <Trans i18nKey="documentationBodies.menuVisibilidadEliminacion.publishedP1" components={{ strong: <strong /> }} />
          </p>
          <p className="mb-4">
            <Trans
              i18nKey="documentationBodies.menuVisibilidadEliminacion.publishedP2"
              components={{ link: <Link href={docHref(basePath, 'publicar-menu')} /> }}
            />
          </p>

          <h3 className="h6 text-uppercase text-muted mb-2">{t('documentationBodies.menuVisibilidadEliminacion.deleteHeading')}</h3>
          <p className="mb-3">
            <Trans i18nKey="documentationBodies.menuVisibilidadEliminacion.deleteP1" components={{ strong: <strong /> }} />
          </p>
          <p className="mb-3">
            <Trans
              i18nKey="documentationBodies.menuVisibilidadEliminacion.deleteP2"
              components={{ strong: <strong />, link: <Link href={docHref(basePath, 'edicion-masiva-productos')} /> }}
            />
          </p>
          <p className="mb-0">
            <Trans i18nKey="documentationBodies.menuVisibilidadEliminacion.deleteP3" components={{ strong: <strong /> }} />
          </p>
        </div>
      </div>

      <DocSeeAlso basePath={basePath} slugs={['publicar-menu', 'edicion-masiva-productos', 'crear-menu']} />

      <DocFaqBlock
        items={[
          {
            q: t('documentationBodies.menuVisibilidadEliminacion.faq.0.q'),
            a: <Trans i18nKey="documentationBodies.menuVisibilidadEliminacion.faq.0.a" />,
          },
          {
            q: t('documentationBodies.menuVisibilidadEliminacion.faq.1.q'),
            a: <Trans i18nKey="documentationBodies.menuVisibilidadEliminacion.faq.1.a" components={{ strong: <strong /> }} />,
          },
        ]}
      />
    </>
  );
}

export function DocTraduccionesBody({ basePath }: BodyProps): ReactNode {
  const { t } = useTranslation();
  return (
    <>
      <DocAudienceBlock title={t('documentationBodies.traducciones.audienceTitle')}>
        <p className="mb-0">
          <Trans
            i18nKey="documentationBodies.traducciones.audienceP1"
            components={{ link: <Link href={docHref(basePath, 'suscripciones-y-pagos')} /> }}
          />
        </p>
      </DocAudienceBlock>

      <DocTraduccionesVideo />

      <div className="card mb-4">
        <div className="card-header bg-info text-white">
          <h2 className="h4 mb-0">{t('documentationBodies.traducciones.cardTitle')}</h2>
        </div>
        <div className="card-body">
          <p className="mb-3">
            <Trans i18nKey="documentationBodies.traducciones.p1" components={{ strong: <strong /> }} />
          </p>
          <p className="mb-3">
            <Trans i18nKey="documentationBodies.traducciones.p2" components={{ strong: <strong /> }} />
          </p>
          <p className="mb-3">
            <Trans i18nKey="documentationBodies.traducciones.p3" components={{ strong: <strong /> }} />
          </p>
          <ol className="mb-4">
            <li className="mb-2">
              <Trans i18nKey="documentationBodies.traducciones.step1" components={{ strong: <strong /> }} />
            </li>
            <li className="mb-2">
              <Trans i18nKey="documentationBodies.traducciones.step2" components={{ strong: <strong /> }} />
            </li>
            <li className="mb-2">
              <Trans i18nKey="documentationBodies.traducciones.step3" components={{ strong: <strong /> }} />
            </li>
            <li className="mb-2">
              {t('documentationBodies.traducciones.step4')}
            </li>
          </ol>
          <div className="alert alert-warning mb-0">
            <Trans i18nKey="documentationBodies.traducciones.warning" components={{ strong: <strong /> }} />
          </div>
        </div>
      </div>

      <DocSeeAlso basePath={basePath} slugs={['suscripciones-y-pagos', 'editar-productos-detalle', 'publicar-menu']} />

      <DocFaqBlock
        items={[
          {
            q: t('documentationBodies.traducciones.faq.0.q'),
            a: (
              <Trans
                i18nKey="documentationBodies.traducciones.faq.0.a"
                components={{ strong: <strong />, link: <Link href={docHref(basePath, 'publicar-menu')} /> }}
              />
            ),
          },
          {
            q: t('documentationBodies.traducciones.faq.1.q'),
            a: (
              <Trans
                i18nKey="documentationBodies.traducciones.faq.1.a"
                components={{ link: <Link href={docHref(basePath, 'importar-menu-csv')} /> }}
              />
            ),
          },
        ]}
      />
    </>
  );
}

export function DocEdicionMasivaProductosBody({ basePath }: BodyProps): ReactNode {
  const { t } = useTranslation();
  return (
    <>
      <DocAudienceBlock title={t('documentationBodies.edicionMasivaProductos.audienceTitle')}>
        <p className="mb-0">
          <Trans i18nKey="documentationBodies.edicionMasivaProductos.audienceP1" components={{ strong: <strong /> }} />
        </p>
      </DocAudienceBlock>

      <div className="card mb-4">
        <div className="card-header bg-warning text-dark">
          <h2 className="h4 mb-0">{t('documentationBodies.edicionMasivaProductos.cardTitle')}</h2>
        </div>
        <div className="card-body">
          <p className="mb-3">
            <Trans i18nKey="documentationBodies.edicionMasivaProductos.p1" components={{ strong: <strong /> }} />
          </p>
          <h3 className="h6 text-uppercase text-muted mb-2">{t('documentationBodies.edicionMasivaProductos.commonActionsHeading')}</h3>
          <ul className="mb-4 ps-3">
            <li className="mb-2"><Trans i18nKey="documentationBodies.edicionMasivaProductos.commonAction1" components={{ strong: <strong /> }} /></li>
            <li className="mb-2"><Trans i18nKey="documentationBodies.edicionMasivaProductos.commonAction2" components={{ strong: <strong /> }} /></li>
            <li className="mb-2"><Trans i18nKey="documentationBodies.edicionMasivaProductos.commonAction3" components={{ strong: <strong /> }} /></li>
          </ul>
          <h3 className="h6 text-uppercase text-muted mb-2">{t('documentationBodies.edicionMasivaProductos.recommendedFlowHeading')}</h3>
          <ol className="mb-4 ps-3">
            <li className="mb-2">{t('documentationBodies.edicionMasivaProductos.recommendedFlow1')}</li>
            <li className="mb-2">{t('documentationBodies.edicionMasivaProductos.recommendedFlow2')}</li>
            <li className="mb-2">{t('documentationBodies.edicionMasivaProductos.recommendedFlow3')}</li>
            <li className="mb-2">{t('documentationBodies.edicionMasivaProductos.recommendedFlow4')}</li>
          </ol>
          <p className="mb-3">
            <Trans i18nKey="documentationBodies.edicionMasivaProductos.p2" components={{ strong: <strong /> }} />
          </p>
          <p className="mb-0">
            <Trans
              i18nKey="documentationBodies.edicionMasivaProductos.p3"
              components={{ strong: <strong />, link: <Link href={docHref(basePath, 'editar-productos-detalle')} /> }}
            />
          </p>
        </div>
      </div>

      <DocSeeAlso basePath={basePath} slugs={['editar-productos-detalle', 'importar-menu-csv', 'reordenar-productos']} />

      <DocFaqBlock
        items={[
          {
            q: t('documentationBodies.edicionMasivaProductos.faq.0.q'),
            a: <Trans i18nKey="documentationBodies.edicionMasivaProductos.faq.0.a" />,
          },
          {
            q: t('documentationBodies.edicionMasivaProductos.faq.1.q'),
            a: <Trans i18nKey="documentationBodies.edicionMasivaProductos.faq.1.a" />,
          },
        ]}
      />
    </>
  );
}

export function DocEditarProductosDetalleBody({ basePath }: BodyProps): ReactNode {
  const { t } = useTranslation();
  return (
    <>
      <DocAudienceBlock title={t('documentationBodies.editarProductosDetalle.audienceTitle')}>
        <p className="mb-0">
          <Trans i18nKey="documentationBodies.editarProductosDetalle.audienceP1" components={{ strong: <strong /> }} />
        </p>
      </DocAudienceBlock>

      <div className="card mb-4">
        <div className="card-header bg-warning text-dark">
          <h2 className="h4 mb-0">{t('documentationBodies.editarProductosDetalle.cardTitle')}</h2>
        </div>
        <div className="card-body">
          <p className="mb-3">
            <Trans i18nKey="documentationBodies.editarProductosDetalle.p1" components={{ strong: <strong /> }} />
          </p>
          <h3 className="h6 text-uppercase text-muted mb-2">{t('documentationBodies.editarProductosDetalle.fieldsHeading')}</h3>
          <ul className="mb-4 ps-3">
            <li className="mb-2"><Trans i18nKey="documentationBodies.editarProductosDetalle.field1" components={{ strong: <strong /> }} /></li>
            <li className="mb-2"><Trans i18nKey="documentationBodies.editarProductosDetalle.field2" components={{ strong: <strong /> }} /></li>
            <li className="mb-2"><Trans i18nKey="documentationBodies.editarProductosDetalle.field3" components={{ strong: <strong /> }} /></li>
            <li className="mb-2"><Trans i18nKey="documentationBodies.editarProductosDetalle.field4" components={{ strong: <strong /> }} /></li>
            <li className="mb-2"><Trans i18nKey="documentationBodies.editarProductosDetalle.field5" components={{ strong: <strong /> }} /></li>
          </ul>
          <p className="mb-3">
            <Trans
              i18nKey="documentationBodies.editarProductosDetalle.p2"
              components={{
                link1: <Link href={docHref(basePath, 'edicion-masiva-productos')} />,
                link2: <Link href={docHref(basePath, 'importar-menu-csv')} />,
              }}
            />
          </p>
          <div className="alert alert-info mb-0">
            {t('documentationBodies.editarProductosDetalle.tip')}
          </div>
        </div>
      </div>

      <DocSeeAlso basePath={basePath} slugs={['edicion-masiva-productos', 'reordenar-productos', 'traducciones']} />

      <DocFaqBlock
        items={[
          {
            q: t('documentationBodies.editarProductosDetalle.faq.0.q'),
            a: (
              <Trans
                i18nKey="documentationBodies.editarProductosDetalle.faq.0.a"
                components={{ strong: <strong />, link: <Link href={docHref(basePath, 'publicar-menu')} /> }}
              />
            ),
          },
          {
            q: t('documentationBodies.editarProductosDetalle.faq.1.q'),
            a: (
              <Trans
                i18nKey="documentationBodies.editarProductosDetalle.faq.1.a"
                components={{ link: <Link href={docHref(basePath, 'suscripciones-y-pagos')} /> }}
              />
            ),
          },
        ]}
      />
    </>
  );
}

export function DocSuscripcionesPagosBody({ basePath }: BodyProps): ReactNode {
  const { t } = useTranslation();
  return (
    <>
      <DocAudienceBlock title={t('documentationBodies.suscripcionesPagos.audienceTitle')}>
        <p className="mb-0">{t('documentationBodies.suscripcionesPagos.audienceP1')}</p>
      </DocAudienceBlock>

      <div className="card mb-4">
        <div className="card-header bg-dark text-white">
          <h2 className="h4 mb-0">{t('documentationBodies.suscripcionesPagos.cardTitle')}</h2>
        </div>
        <div className="card-body">
          <p className="mb-3">{t('documentationBodies.suscripcionesPagos.p1')}</p>
          <h3 className="h6 text-uppercase text-muted mb-2">{t('documentationBodies.suscripcionesPagos.paymentMethodsHeading')}</h3>
          <ul className="mb-4 ps-3">
            <li className="mb-2"><Trans i18nKey="documentationBodies.suscripcionesPagos.paymentMethod1" components={{ strong: <strong /> }} /></li>
            <li className="mb-2"><Trans i18nKey="documentationBodies.suscripcionesPagos.paymentMethod2" components={{ strong: <strong /> }} /></li>
          </ul>
          <h3 className="h6 text-uppercase text-muted mb-2">{t('documentationBodies.suscripcionesPagos.planChangesHeading')}</h3>
          <p className="mb-3">
            <Trans i18nKey="documentationBodies.suscripcionesPagos.p2" components={{ strong: <strong /> }} />
          </p>
          <p className="mb-3">
            <Trans i18nKey="documentationBodies.suscripcionesPagos.p3" components={{ strong: <strong /> }} />
          </p>
          <p className="mb-0 text-muted small">{t('documentationBodies.suscripcionesPagos.smallPrint')}</p>
        </div>
      </div>

      <DocSeeAlso basePath={basePath} slugs={['traducciones', 'importar-menu-csv', 'intro']} />

      <DocFaqBlock
        items={[
          {
            q: t('documentationBodies.suscripcionesPagos.faq.0.q'),
            a: <Trans i18nKey="documentationBodies.suscripcionesPagos.faq.0.a" />,
          },
          {
            q: t('documentationBodies.suscripcionesPagos.faq.1.q'),
            a: (
              <Trans
                i18nKey="documentationBodies.suscripcionesPagos.faq.1.a"
                components={{
                  link1: <Link href={docHref(basePath, 'traducciones')} />,
                  link2: <Link href={docHref(basePath, 'edicion-masiva-productos')} />,
                }}
              />
            ),
          },
        ]}
      />
    </>
  );
}

export function DocCatalogoPlantillasBody({ basePath }: BodyProps): ReactNode {
  const { t } = useTranslation();
  const templates = sortTemplatesByCatalogOrder(MENU_TEMPLATES_CATALOG);

  return (
    <>
      <DocAudienceBlock title={t('documentationBodies.catalogoPlantillas.audienceTitle')}>
        <p className="mb-0">
          <Trans i18nKey="documentationBodies.catalogoPlantillas.audienceP1" components={{ strong: <strong /> }} />
        </p>
      </DocAudienceBlock>

      <div className="card mb-4">
        <div className="card-header bg-secondary text-white">
          <h2 className="h4 mb-0">{t('documentationBodies.catalogoPlantillas.cardTitle')}</h2>
        </div>
        <div className="card-body p-0">
          <ul className="list-group list-group-flush mb-0">
            {templates.map((tpl) => {
              const estilos = Array.isArray(tpl.estilos) ? tpl.estilos.filter(Boolean) : [];
              const resumenParts = [tpl.categoria, ...estilos.slice(0, 2)].filter(Boolean);
              const resumen = resumenParts
                .map((s) => String(s).charAt(0).toUpperCase() + String(s).slice(1))
                .join(' · ');
              return (
                <li key={tpl.slug} className="list-group-item px-3 py-3">
                  <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2">
                    <div>
                      <h3 className="h6 mb-1">{tpl.nombre}</h3>
                      {resumen ? <p className="small text-muted mb-0">{resumen}</p> : null}
                    </div>
                    <Link
                      href={plantillaCaracteristicasHref(tpl.slug)}
                      className="btn btn-sm btn-outline-primary flex-shrink-0"
                    >
                      {t('documentationBodies.catalogoPlantillas.viewFeatures')}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <DocSeeAlso basePath={basePath} slugs={['plantillas', 'crear-restaurante', 'publicar-menu']} />
    </>
  );
}

export const DOC_BODY_BY_SLUG: Record<
  DocSection['slug'],
  (props: BodyProps) => ReactNode
> = {
  intro: (p) => <DocIntroBody {...p} />,
  'crear-restaurante': () => <DocCrearRestauranteBody />,
  'crear-menu': (p) => <DocCrearMenuBody {...p} />,
  'importar-menu-csv': () => <DocImportarMenuCsvBody />,
  'crear-secciones': (p) => <DocCrearSeccionesBody {...p} />,
  'crear-productos': () => <DocCrearProductosBody />,
  'reordenar-productos': (p) => <DocReordenarProductosBody {...p} />,
  plantillas: (p) => <DocPlantillasBody {...p} />,
  'publicar-menu': (p) => <DocPublicarMenuBody {...p} />,
  'programar-menu': (p) => <DocProgramarMenuBody {...p} />,
  'descargar-qr': () => <DocDescargarQrBody />,
  'imprimir-carta': (p) => <DocImprimirCartaBody {...p} />,
  'desactivar-restaurante': (p) => <DocDesactivarRestauranteBody {...p} />,
  'eliminar-restaurante': (p) => <DocEliminarRestauranteBody {...p} />,
  'menu-visibilidad-y-eliminacion': (p) => <DocMenuVisibilidadEliminacionBody {...p} />,
  traducciones: (p) => <DocTraduccionesBody {...p} />,
  'edicion-masiva-productos': (p) => <DocEdicionMasivaProductosBody {...p} />,
  'editar-productos-detalle': (p) => <DocEditarProductosDetalleBody {...p} />,
  'suscripciones-y-pagos': (p) => <DocSuscripcionesPagosBody {...p} />,
  'catalogo-plantillas': (p) => <DocCatalogoPlantillasBody {...p} />,
};
