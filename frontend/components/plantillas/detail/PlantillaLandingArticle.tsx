import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';
import type { MenuTemplateCatalogItem } from '../../../types/menu-template-catalog';
import type { PlantillaLandingContent, PlantillaLandingVariant } from '../../../types/plantilla-landing';
import PlantillaLandingCtaBandClient from './PlantillaLandingCtaBandClient';
import PlantillaLandingHeroAside from './PlantillaLandingHeroAside';
import PlantillaPreviewPhoneMockup from './PlantillaPreviewPhoneMockup';
import styles from './plantilla-detail.module.css';
import { PLANTILLAS_CATALOG_PATH } from '../../../lib/plantillas-catalog-url';

/** Línea tipo stack CSS (Inter, Poppins, etc.) o familia genérica al final (cursive, serif, …) */
function isFontStackLine(text: string): boolean {
  const t = text.trim();
  if (!t.includes(',')) return false;
  if (/,\s*-apple-system/i.test(t) && /sans-serif/i.test(t)) return true;
  return /,\s*(cursive|serif|sans-serif|monospace|fantasy)\s*$/i.test(t);
}

export interface PlantillaLandingArticleProps {
  content: PlantillaLandingContent;
  catalog: MenuTemplateCatalogItem | undefined;
  idPrefix: string;
  variant?: PlantillaLandingVariant;
}

function SectionBlock({
  id,
  heading,
  icon,
  children,
  className = '',
}: {
  id: string;
  heading: ReactNode;
  icon: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`${styles.sectionCard} ${className}`.trim()} aria-labelledby={id}>
      <div className={styles.sectionCardHead}>
        <span className={styles.sectionIcon} aria-hidden="true">
          {icon}
        </span>
        <h2 className={styles.h2} id={id}>
          {heading}
        </h2>
      </div>
      <div className={styles.sectionCardBody}>{children}</div>
    </section>
  );
}

export default function PlantillaLandingArticle({
  content: L,
  catalog,
  idPrefix,
  variant = 'default',
}: PlantillaLandingArticleProps) {
  const articleClass = [
    styles.article,
    variant === 'minimal' ? styles.articleMinimal : '',
    variant === 'visual' ? styles.articleVisual : '',
    variant === 'premium' ? styles.articlePremium : '',
    variant === 'casual' ? styles.articleCasual : '',
  ]
    .filter(Boolean)
    .join(' ');

  const tipografiaFirst = L.tipografia?.paragraphs[0];
  const tipografiaRest = L.tipografia?.paragraphs.slice(1) ?? [];

  const heroTitle = catalog?.nombre ?? L.header.h1;
  const chooseHref = L.cta.secondaryHref ?? L.cta.primaryHref;
  const chooseLabel = L.cta.secondaryLabel ?? L.cta.primaryLabel;

  return (
    <article className={articleClass}>
      <div className={styles.heroIntro}>
        <nav className={styles.breadcrumb} aria-label="Migas de pan">
          <Link href={PLANTILLAS_CATALOG_PATH}>← Plantillas</Link>
        </nav>
        <header>
          <h1 className={styles.heroTitle}>{heroTitle}</h1>
          {L.header.intro.split(/\n\n+/).map((paragraph) => (
            <p key={paragraph} className={styles.lead}>
              {paragraph}
            </p>
          ))}
        </header>
      </div>

      <div className={styles.heroBand}>
        <div className={styles.heroVisualRow}>
          {catalog ? (
            L.heroPreviewImage ? (
              <div className={styles.heroPreviewWrap}>
                <Image
                  src={L.heroPreviewImage}
                  alt={`Vista previa de la plantilla menú QR ${catalog.nombre}`}
                  width={500}
                  height={625}
                  className={styles.heroPreviewImage}
                  sizes="(max-width: 720px) 70vw, 380px"
                  priority
                />
              </div>
            ) : (
              <div className={styles.heroMockupClip}>
                <PlantillaPreviewPhoneMockup
                  src={catalog.imagen}
                  alt={`Vista previa de la plantilla menú QR ${catalog.nombre}`}
                  priority
                />
              </div>
            )
          ) : (
            <div className={styles.heroMockupClipPlaceholder} aria-hidden="true" />
          )}

          <div className={styles.heroColAside}>
            <PlantillaLandingHeroAside
              previewPath={L.previewPath}
              demoButtonLabel={L.qr.demoButtonLabel}
              demoHint={L.qr.demoHint}
              chooseLabel={chooseLabel}
              chooseHref={chooseHref}
              catalogSlug={catalog?.slug ?? L.slug}
              primaryUseTemplate={catalog?.plan === 'free'}
              isProTemplate={catalog?.plan === 'pro'}
              {...(L.cta.secondaryShowOnlyForPro ? { chooseShowOnlyForPro: true } : {})}
            />
          </div>
        </div>
      </div>

      {catalog || L.badgeStrip?.length ? (
        <div className={styles.badgeRow} aria-label="Clasificación de la plantilla">
          {catalog ? (
            <>
              <span className={`${styles.badge} ${styles.badgeCategory}`}>{catalog.categoria}</span>
              {catalog.estilos.map((e) => (
                <span key={e} className={`${styles.badge} ${styles.badgeStyle}`}>
                  {e}
                </span>
              ))}
              {catalog.tags
                .filter((tag) => !(catalog.plan === 'pro' && tag.toLowerCase() === 'pro'))
                .map((tag) => (
                  <span key={tag} className={`${styles.badge} ${styles.badgeTag}`}>
                    {tag}
                  </span>
                ))}
            </>
          ) : null}
          {L.badgeStrip?.map((b) => (
            <span key={b} className={`${styles.badge} ${styles.badgeExclusive}`}>
              {b}
            </span>
          ))}
          {catalog?.plan === 'pro' ? <span className={styles.proBadge}>PRO</span> : null}
        </div>
      ) : null}

      <div className={styles.sectionsStack}>
        {L.exclusividadPro ? (
          <SectionBlock id={`${idPrefix}-exclusividad`} heading={L.exclusividadPro.heading} icon="★">
            {L.exclusividadPro.paragraphs.map((p) => (
              <p key={p} className={styles.paragraph}>
                {p}
              </p>
            ))}
          </SectionBlock>
        ) : null}

        <SectionBlock id={`${idPrefix}-para-quien`} heading={L.paraQuien.heading} icon="🏪">
          {L.paraQuien.intro ? <p className={styles.paragraph}>{L.paraQuien.intro}</p> : null}
          <ul className={styles.list}>
            {L.paraQuien.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </SectionBlock>

        <SectionBlock id={`${idPrefix}-ventajas`} heading={L.ventajas.heading} icon="✓">
          <ul className={styles.list}>
            {L.ventajas.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </SectionBlock>

        {L.identidadVisual ? (
          <SectionBlock id={`${idPrefix}-identidad-visual`} heading={L.identidadVisual.heading} icon="✦">
            {L.identidadVisual.paragraphs.map((p) => (
              <p key={p} className={styles.paragraph}>
                {p}
              </p>
            ))}
            {L.identidadVisual.items.length > 0 ? (
              <ul className={styles.list}>
                {L.identidadVisual.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </SectionBlock>
        ) : null}

        {L.imagenesProductos ? (
          <SectionBlock id={`${idPrefix}-imagenes`} heading={L.imagenesProductos.heading} icon="🖼">
            {L.imagenesProductos.paragraphs.map((p) => (
              <p key={p} className={styles.paragraph}>
                {p}
              </p>
            ))}
            {L.imagenesProductos.items.length > 0 ? (
              <ul className={styles.list}>
                {L.imagenesProductos.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </SectionBlock>
        ) : null}

        {L.navegacionLateral ? (
          <SectionBlock id={`${idPrefix}-navegacion-lateral`} heading={L.navegacionLateral.heading} icon="☰">
            {L.navegacionLateral.paragraphs.map((p) => (
              <p key={p} className={styles.paragraph}>
                {p}
              </p>
            ))}
          </SectionBlock>
        ) : null}

        {L.productosDestacados ? (
          <SectionBlock id={`${idPrefix}-productos-destacados`} heading={L.productosDestacados.heading} icon="⭐">
            {L.productosDestacados.paragraphs.map((p) => (
              <p key={p} className={styles.paragraph}>
                {p}
              </p>
            ))}
          </SectionBlock>
        ) : null}

        {L.productosMenu ? (
          <SectionBlock id={`${idPrefix}-productos-menu`} heading={L.productosMenu.heading} icon="🍽">
            {L.productosMenu.paragraphs.map((p) => (
              <p key={p} className={styles.paragraph}>
                {p}
              </p>
            ))}
          </SectionBlock>
        ) : null}

        {L.tipografia ? (
          <SectionBlock id={`${idPrefix}-tipografia`} heading={L.tipografia.heading} icon="Aa">
            {tipografiaFirst ? <p className={styles.paragraph}>{tipografiaFirst}</p> : null}
            {L.tipografiaFontList?.length ? (
              L.tipografiaFontList.map((f) =>
                isFontStackLine(f) ? (
                  <p key={f} className={styles.fontStack}>
                    {f}
                  </p>
                ) : (
                  <ul key={f} className={styles.list}>
                    <li>{f}</li>
                  </ul>
                ),
              )
            ) : null}
            {tipografiaRest.map((para) =>
              isFontStackLine(para) ? (
                <p key={para} className={styles.fontStack}>
                  {para}
                </p>
              ) : (
                <p key={para} className={styles.paragraph}>
                  {para}
                </p>
              ),
            )}
          </SectionBlock>
        ) : null}

        {L.cambioAutomatico ? (
          <SectionBlock id={`${idPrefix}-cambio-automatico`} heading={L.cambioAutomatico.heading} icon="🌓">
            {L.cambioAutomatico.paragraphs.map((p) => (
              <p key={p} className={styles.paragraph}>
                {p}
              </p>
            ))}
          </SectionBlock>
        ) : null}

        <SectionBlock id={`${idPrefix}-personalizacion`} heading={L.personalizacion.heading} icon="🎨">
          {L.personalizacion.intro?.trim() ? (
            <p className={styles.paragraph}>{L.personalizacion.intro}</p>
          ) : null}
          <h3 className={styles.h3}>{L.personalizacion.colors.heading}</h3>
          {L.personalizacion.colors.intro ? (
            <p className={styles.paragraph}>{L.personalizacion.colors.intro}</p>
          ) : null}
          <ul className={styles.list}>
            {L.personalizacion.colors.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {L.personalizacion.colors.outro ? (
            <p className={styles.paragraph}>{L.personalizacion.colors.outro}</p>
          ) : null}
          {L.personalizacion.elementos ? (
            <>
              <h3 className={styles.h3}>{L.personalizacion.elementos.heading}</h3>
              {L.personalizacion.elementos.intro ? (
                <p className={styles.paragraph}>{L.personalizacion.elementos.intro}</p>
              ) : null}
              <ul className={styles.list}>
                {L.personalizacion.elementos.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {L.personalizacion.elementos.outro ? (
                <p className={styles.paragraph}>{L.personalizacion.elementos.outro}</p>
              ) : null}
            </>
          ) : null}
          {L.personalizacion.titulosSeccion ? (
            <>
              <h3 className={styles.h3}>{L.personalizacion.titulosSeccion.heading}</h3>
              {L.personalizacion.titulosSeccion.paragraphs.map((p) => (
                <p key={p} className={styles.paragraph}>
                  {p}
                </p>
              ))}
            </>
          ) : null}
        </SectionBlock>

        <SectionBlock
          id={`${idPrefix}-traducciones`}
          heading={
            <>
              <span>{L.traduccionesPro.heading}</span>
              <span className={styles.proBadge}>PRO</span>
            </>
          }
          icon="🌐"
        >
          {L.traduccionesPro.paragraphs.map((p) => (
            <p key={p} className={styles.paragraph}>
              {p}
            </p>
          ))}
          <ul className={styles.list}>
            {L.traduccionesPro.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </SectionBlock>

        <SectionBlock id={`${idPrefix}-experiencia`} heading={L.experiencia.heading} icon="📱">
          {L.experiencia.intro ? <p className={styles.paragraph}>{L.experiencia.intro}</p> : null}
          <ul className={styles.list}>
            {L.experiencia.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </SectionBlock>
      </div>

      <PlantillaLandingCtaBandClient
        cta={L.cta}
        catalogSlug={catalog?.slug ?? L.slug}
        idPrefix={idPrefix}
        isFreeTemplate={catalog?.plan === 'free'}
        isProTemplate={catalog?.plan === 'pro'}
        premiumBand={variant === 'premium'}
      />
    </article>
  );
}
