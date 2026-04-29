import Image from 'next/image';
import Link from 'next/link';
import type { MenuTemplateCatalogItem } from '../../types/menu-template-catalog';
import styles from './Plantillas.module.css';

export interface TemplateCardProps {
  template: MenuTemplateCatalogItem;
}

export default function TemplateCard({ template }: TemplateCardProps) {
  const href = `/plantillas/${encodeURIComponent(template.slug)}`;

  return (
    <article className={styles.card}>
      <div className={styles.cardImageWrap}>
        <Image
          src={template.imagen}
          alt={`Vista previa plantilla menú QR ${template.nombre}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={styles.cardImage}
          priority={false}
        />
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardTitleRow}>
          <h2 className={styles.cardTitle}>{template.nombre}</h2>
          {template.plan === 'pro' ? (
            <span className={`${styles.badge} ${styles.badgePro}`}>Pro</span>
          ) : null}
        </div>
        <div className={styles.badgeRow} aria-label="Categoría">
          <span className={`${styles.badge} ${styles.badgeCategory}`}>{template.categoria}</span>
          {template.estilos.map((e) => (
            <span key={e} className={`${styles.badge} ${styles.badgeStyle}`}>
              {e}
            </span>
          ))}
        </div>
        <p className={styles.tagsLabel}>Tags</p>
        <div className={styles.badgeRow}>
          {template.tags.map((tag) => (
            <span key={tag} className={`${styles.badge} ${styles.badgeTag}`}>
              {tag}
            </span>
          ))}
        </div>
        <div className={styles.cardCta}>
          <Link href={href} className={styles.ctaButton}>
            Ver plantilla
          </Link>
        </div>
      </div>
    </article>
  );
}
