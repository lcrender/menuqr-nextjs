import OptimizedPicture from '../OptimizedPicture';
import { getPlantillaHeroMockupImage } from '../../lib/plantilla-landing-hero-images';
import type { MenuTemplateCatalogItem } from '../../types/menu-template-catalog';
import TemplateCardActions from './TemplateCardActions';
import styles from './Plantillas.module.css';

export interface TemplateCardProps {
  template: MenuTemplateCatalogItem;
}

export default function TemplateCard({ template }: TemplateCardProps) {
  const heroMockup = getPlantillaHeroMockupImage(template.slug);
  const imageSrc = heroMockup ?? template.imagen;
  const usesMockup = Boolean(heroMockup);

  return (
    <article className={styles.card}>
      <div
        className={`${styles.cardImageWrap} ${usesMockup ? styles.cardImageWrapMockup : ''}`}
      >
        <OptimizedPicture
          src={imageSrc}
          alt={`Vista previa plantilla menú QR ${template.nombre}`}
          fill
          className={`${styles.cardImage} ${
            usesMockup
              ? styles.cardImageMockup
              : template.slug === 'modern-food'
                ? styles.cardImageBiasTop
                : template.slug === 'night-club'
                  ? styles.cardImageNightClub
                  : ''
          }`}
        />
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardTitleRow}>
          <h2 className={styles.cardTitle}>{template.nombre}</h2>
          {template.plan === 'pro' ? (
            <span className={`${styles.badge} ${styles.badgePro}`}>Pro</span>
          ) : (
            <span className={`${styles.badge} ${styles.badgeFree}`}>Free</span>
          )}
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
          <TemplateCardActions catalogSlug={template.slug} />
        </div>
      </div>
    </article>
  );
}
