import { useTranslation } from 'react-i18next';
import OptimizedPicture from '../OptimizedPicture';
import { getPlantillaHeroMockupImage } from '../../lib/plantilla-landing-hero-images';
import { translateTemplatesCatalogTaxonomy } from '../../lib/templates-catalog-i18n';
import type { MenuTemplateCatalogItem } from '../../types/menu-template-catalog';
import TemplateCardActions from './TemplateCardActions';
import styles from './Plantillas.module.css';

export interface TemplateCardProps {
  template: MenuTemplateCatalogItem;
}

export default function TemplateCard({ template }: TemplateCardProps) {
  const { t } = useTranslation();
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
          alt={t('templatesCatalog.card.previewAlt', { name: template.nombre })}
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
            <span className={`${styles.badge} ${styles.badgePro}`}>
              {t('templatesCatalog.card.pro')}
            </span>
          ) : (
            <span className={`${styles.badge} ${styles.badgeFree}`}>
              {t('templatesCatalog.card.free')}
            </span>
          )}
        </div>
        <div className={styles.badgeRow} aria-label={t('templatesCatalog.card.categoryAria')}>
          <span className={`${styles.badge} ${styles.badgeCategory}`}>
            {translateTemplatesCatalogTaxonomy(t, 'categoria', template.categoria)}
          </span>
          {template.estilos.map((e) => (
            <span key={e} className={`${styles.badge} ${styles.badgeStyle}`}>
              {translateTemplatesCatalogTaxonomy(t, 'estilo', e)}
            </span>
          ))}
        </div>
        <p className={styles.tagsLabel}>{t('templatesCatalog.card.tagsLabel')}</p>
        <div className={styles.badgeRow}>
          {template.tags.map((tag) => (
            <span key={tag} className={`${styles.badge} ${styles.badgeTag}`}>
              {translateTemplatesCatalogTaxonomy(t, 'tag', tag)}
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
