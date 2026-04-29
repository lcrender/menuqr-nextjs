import Image from 'next/image';
import Link from 'next/link';
import type { MenuTemplateCatalogItem } from '../../../types/menu-template-catalog';
import type { PlantillaLandingContent, PlantillaLandingVariant } from '../../../types/plantilla-landing';
import PlantillaLandingDualCtaClient from './PlantillaLandingDualCtaClient';
import PlantillaPreviewQrClient from './PlantillaPreviewQrClient';
import styles from './plantilla-detail.module.css';

/** Línea tipo stack CSS (Inter, Poppins, etc.) */
function isFontStackLine(text: string): boolean {
  return /,\s*-apple-system/i.test(text) && /sans-serif/i.test(text);
}

export interface PlantillaLandingArticleProps {
  content: PlantillaLandingContent;
  catalog: MenuTemplateCatalogItem | undefined;
  idPrefix: string;
  variant?: PlantillaLandingVariant;
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

  return (
    <article className={articleClass}>
      <nav className={styles.breadcrumb} aria-label="Migas de pan">
        <Link href="/plantillas">← Plantillas</Link>
      </nav>

      <header>
        <h1 className={styles.heroTitle}>{L.header.h1}</h1>
        <p className={styles.lead}>{L.header.intro}</p>
      </header>

      {catalog ? (
        <div className={styles.heroFigure}>
          <Image
            src={catalog.imagen}
            alt={`Vista previa de la plantilla menú QR ${catalog.nombre}`}
            fill
            sizes="(max-width: 720px) 100vw, 42rem"
            className={styles.heroImage}
            priority
          />
        </div>
      ) : null}

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

      {L.exclusividadPro ? (
        <section className={styles.section} aria-labelledby={`${idPrefix}-exclusividad`}>
          <h2 className={styles.h2} id={`${idPrefix}-exclusividad`}>
            {L.exclusividadPro.heading}
          </h2>
          {L.exclusividadPro.paragraphs.map((p) => (
            <p key={p} className={styles.paragraph}>
              {p}
            </p>
          ))}
        </section>
      ) : null}

      <section className={styles.section} aria-labelledby={`${idPrefix}-para-quien`}>
        <h2 className={styles.h2} id={`${idPrefix}-para-quien`}>
          {L.paraQuien.heading}
        </h2>
        <ul className={styles.list}>
          {L.paraQuien.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby={`${idPrefix}-ventajas`}>
        <h2 className={styles.h2} id={`${idPrefix}-ventajas`}>
          {L.ventajas.heading}
        </h2>
        <ul className={styles.list}>
          {L.ventajas.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      {L.imagenesProductos ? (
        <section className={styles.section} aria-labelledby={`${idPrefix}-imagenes`}>
          <h2 className={styles.h2} id={`${idPrefix}-imagenes`}>
            {L.imagenesProductos.heading}
          </h2>
          {L.imagenesProductos.paragraphs.map((p) => (
            <p key={p} className={styles.paragraph}>
              {p}
            </p>
          ))}
          <ul className={styles.list}>
            {L.imagenesProductos.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className={styles.section} aria-labelledby={`${idPrefix}-personalizacion`}>
        <h2 className={styles.h2} id={`${idPrefix}-personalizacion`}>
          {L.personalizacion.heading}
        </h2>
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

        {L.personalizacion.elementos ? (
          <>
            <h3 className={styles.h3}>{L.personalizacion.elementos.heading}</h3>
            <ul className={styles.list}>
              {L.personalizacion.elementos.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        ) : null}
      </section>

      {L.tipografia ? (
        <section className={styles.section} aria-labelledby={`${idPrefix}-tipografia`}>
          <h2 className={styles.h2} id={`${idPrefix}-tipografia`}>
            {L.tipografia.heading}
          </h2>
          {tipografiaFirst ? <p className={styles.paragraph}>{tipografiaFirst}</p> : null}
          {L.tipografiaFontList?.length ? (
            <ul className={styles.list}>
              {L.tipografiaFontList.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
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
        </section>
      ) : null}

      {L.identidadVisual ? (
        <section className={styles.section} aria-labelledby={`${idPrefix}-identidad-visual`}>
          <h2 className={styles.h2} id={`${idPrefix}-identidad-visual`}>
            {L.identidadVisual.heading}
          </h2>
          {L.identidadVisual.paragraphs.map((p) => (
            <p key={p} className={styles.paragraph}>
              {p}
            </p>
          ))}
          <ul className={styles.list}>
            {L.identidadVisual.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className={styles.section} aria-labelledby={`${idPrefix}-traducciones`}>
        <h2 className={styles.h2} id={`${idPrefix}-traducciones`}>
          <span>{L.traduccionesPro.heading}</span>
          <span className={styles.proBadge}>PRO</span>
        </h2>
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
      </section>

      <section className={styles.section} aria-labelledby={`${idPrefix}-experiencia`}>
        <h2 className={styles.h2} id={`${idPrefix}-experiencia`}>
          {L.experiencia.heading}
        </h2>
        <ul className={styles.list}>
          {L.experiencia.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className={styles.qrSection} aria-labelledby={`${idPrefix}-qr`}>
        <h2 className={styles.h2} id={`${idPrefix}-qr`}>
          {L.qr.heading}
        </h2>
        <p className={styles.qrSectionIntro}>{L.qr.body}</p>
        <PlantillaPreviewQrClient
          previewPath={L.previewPath}
          demoButtonLabel={L.qr.demoButtonLabel}
          demoHint={L.qr.demoHint}
          {...(typeof L.qr.qrSize === 'number' ? { qrSize: L.qr.qrSize } : {})}
        />
      </section>

      {L.cta.secondaryLabel && L.cta.secondaryHref ? (
        <PlantillaLandingDualCtaClient cta={L.cta} idPrefix={idPrefix} premiumBand={variant === 'premium'} />
      ) : (
        <section className={`${styles.ctaBand} ${styles.sectionLast}`} aria-labelledby={`${idPrefix}-cta`}>
          <h2 className={styles.h2} id={`${idPrefix}-cta`}>
            {L.cta.heading}
          </h2>
          <p>{L.cta.body}</p>
          <Link href={L.cta.primaryHref} className={styles.btnPrimary}>
            {L.cta.primaryLabel}
          </Link>
        </section>
      )}
    </article>
  );
}
