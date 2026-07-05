import Link from 'next/link';
import styles from './Plantillas.module.css';

export default function PremiumPlanCard() {
  return (
    <article className={`${styles.card} ${styles.premiumCard}`}>
      <div className={styles.premiumCardHeader} aria-hidden="true">
        <span className={styles.premiumCardLabel}>
          <span className={styles.premiumCardIcon}>💎</span>
          <span className={styles.premiumCardLabelText}>Premium</span>
        </span>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardTitleRow}>
          <h2 className={styles.cardTitle}>Plan Premium</h2>
          <span className={`${styles.badge} ${styles.badgePremium}`}>A medida</span>
        </div>
        <p className={styles.premiumCardText}>
          Diseño y configuración personalizada para adaptar tu carta digital a las necesidades de tu negocio.
        </p>
        <p className={styles.premiumCardSubtext}>Contactanos y armamos una propuesta a medida.</p>
        <div className={styles.cardCta}>
          <Link href="/contacto?from=plantillas-premium" className={styles.premiumCtaButton}>
            Consultar
          </Link>
        </div>
      </div>
    </article>
  );
}
