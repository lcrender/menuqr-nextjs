import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { buildPremiumInquiryUrl } from '../../lib/premium-inquiry-url';
import styles from './Plantillas.module.css';

export default function PremiumPlanCard() {
  const { t } = useTranslation();

  return (
    <article className={`${styles.card} ${styles.premiumCard}`}>
      <div className={styles.premiumCardHeader} aria-hidden="true">
        <span className={styles.premiumCardLabel}>
          <span className={styles.premiumCardIcon}>💎</span>
          <span className={styles.premiumCardLabelText}>{t('templatesCatalog.premium.label')}</span>
        </span>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardTitleRow}>
          <h2 className={styles.cardTitle}>{t('templatesCatalog.premium.title')}</h2>
          <span className={`${styles.badge} ${styles.badgePremium}`}>
            {t('templatesCatalog.premium.badge')}
          </span>
        </div>
        <p className={styles.premiumCardText}>{t('templatesCatalog.premium.text')}</p>
        <p className={styles.premiumCardSubtext}>{t('templatesCatalog.premium.subtext')}</p>
        <div className={styles.cardCta}>
          <Link href={buildPremiumInquiryUrl('plantillas')} className={styles.premiumCtaButton}>
            {t('templatesCatalog.premium.cta')}
          </Link>
        </div>
      </div>
    </article>
  );
}
