import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { getTemplateBySlug } from '../../lib/menu-templates-catalog';
import { getPlantillaHeroMockupByApiTemplateId } from '../../lib/plantilla-landing-hero-images';
import { apiTemplateIdToCatalogSlug } from '../../lib/template-selection-intent';
import {
  PREVIEW_DEFAULT_IMAGE,
  PREVIEW_IMAGE_BASE,
  type TemplateCatalogItem,
} from '../../lib/templates-catalog';
import styles from './AdminTemplateCard.module.css';

export interface AdminRestaurantOption {
  id: string;
  name: string;
}

export interface AdminTemplateCardProps {
  template: TemplateCatalogItem;
  restaurants: AdminRestaurantOption[];
  hasProTemplatesAccess: boolean;
  selectedTemplate: string | null;
  selectedRestaurant: string | null;
  applyingTemplate: string | null;
  getRestaurantTemplate: (restaurantId: string) => string;
  onRestaurantSelect: (templateId: string, restaurantId: string) => void | Promise<void>;
  onApply: (templateId: string, restaurantId: string) => void;
}

export default function AdminTemplateCard({
  template,
  restaurants,
  hasProTemplatesAccess,
  selectedTemplate,
  selectedRestaurant,
  applyingTemplate,
  getRestaurantTemplate,
  onRestaurantSelect,
  onApply,
}: AdminTemplateCardProps) {
  const [imageError, setImageError] = useState(false);
  const catalogSlug = apiTemplateIdToCatalogSlug(template.id);
  const catalogMeta = getTemplateBySlug(catalogSlug);
  const heroMockup = getPlantillaHeroMockupByApiTemplateId(template.id);
  const fallbackImage = `${PREVIEW_IMAGE_BASE}/preview-${template.id}.jpg`;
  const imageSrc = imageError
    ? PREVIEW_DEFAULT_IMAGE
    : heroMockup ?? fallbackImage;
  const usesMockup = Boolean(heroMockup) && !imageError;
  const isProTemplate = template.requiresProOrPremium || catalogMeta?.plan === 'pro';
  const isSelected = selectedTemplate === template.id && Boolean(selectedRestaurant);
  const isApplying = applyingTemplate === `${template.id}-${selectedRestaurant}`;
  const proLocked = Boolean(template.requiresProOrPremium && !hasProTemplatesAccess);

  return (
    <article className={`${styles.card} ${isProTemplate ? styles.cardPro : ''}`}>
      <div
        className={`${styles.cardImageWrap} ${usesMockup ? styles.cardImageWrapMockup : ''}`}
      >
        <Image
          src={imageSrc}
          alt={`Vista previa plantilla ${template.name}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`${styles.cardImage} ${usesMockup ? styles.cardImageMockup : ''}`}
          onError={() => setImageError(true)}
        />
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardTitleRow}>
          <h3 className={styles.cardTitle}>{template.name}</h3>
          {isProTemplate ? (
            <span className={`${styles.badge} ${styles.badgePro}`}>Pro</span>
          ) : (
            <span className={`${styles.badge} ${styles.badgeFree}`}>Free</span>
          )}
        </div>

        {catalogMeta ? (
          <div className={styles.badgeRow} aria-label="Rubro y estilo">
            <span className={`${styles.badge} ${styles.badgeCategory}`}>{catalogMeta.categoria}</span>
            {catalogMeta.estilos.map((estilo) => (
              <span key={estilo} className={`${styles.badge} ${styles.badgeStyle}`}>
                {estilo}
              </span>
            ))}
          </div>
        ) : (
          <div className={styles.badgeRow}>
            <span className={`${styles.badge} ${styles.badgeCategory}`}>{template.category}</span>
          </div>
        )}

        <div className={styles.cardActions}>
          <a
            href={`/preview/${template.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.previewButton}
          >
            Ver vista previa
          </a>

          {proLocked ? (
            <p className={styles.proLockedMsg}>
              Disponible en plan <strong>Pro</strong>, <strong>Pro Team</strong> o{' '}
              <strong>Premium</strong>.{' '}
              <Link href="/admin/profile/subscription/checkout?plan=pro">Mejorar plan</Link>
            </p>
          ) : (
            <>
              <label className={styles.applyLabel} htmlFor={`template-restaurant-${template.id}`}>
                Aplicar a restaurante
              </label>
              <div className={styles.selectWrap}>
                <select
                  id={`template-restaurant-${template.id}`}
                  className={styles.restaurantSelect}
                  value={selectedTemplate === template.id && selectedRestaurant ? selectedRestaurant : ''}
                onChange={async (e) => {
                  if (e.target.value) {
                    await onRestaurantSelect(template.id, e.target.value);
                  } else {
                    await onRestaurantSelect(template.id, '');
                  }
                }}
                disabled={applyingTemplate?.startsWith(template.id) ?? false}
              >
                <option value="">Elegir restaurante…</option>
                {restaurants.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}{' '}
                    {getRestaurantTemplate(restaurant.id) === template.id ? '(Actual)' : ''}
                  </option>
                ))}
                </select>
              </div>

              {isSelected ? (
                <button
                  type="button"
                  className={`admin-btn ${styles.applyButton}`}
                  onClick={() => onApply(template.id, selectedRestaurant!)}
                  disabled={isApplying}
                >
                  {isApplying ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Aplicando...
                    </>
                  ) : (
                    'Aplicar plantilla'
                  )}
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
