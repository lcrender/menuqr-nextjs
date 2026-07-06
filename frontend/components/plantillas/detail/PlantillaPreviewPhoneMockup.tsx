import Image from 'next/image';
import styles from './plantilla-detail.module.css';

export interface PlantillaPreviewPhoneMockupProps {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
}

export default function PlantillaPreviewPhoneMockup({
  src,
  alt,
  priority = false,
  sizes = '(max-width: 720px) 70vw, 280px',
}: PlantillaPreviewPhoneMockupProps) {
  return (
    <div className={styles.phoneMockupWrap}>
      <div className={styles.phoneMockup} aria-label="Vista previa en mockup de iPhone">
        <div className={styles.phoneMockupScreen}>
          <span className={styles.phoneMockupDynamicIsland} aria-hidden="true" />
          <Image src={src} alt={alt} fill className={styles.phoneMockupImage} sizes={sizes} priority={priority} />
        </div>
        <span className={styles.phoneMockupHomeIndicator} aria-hidden="true" />
      </div>
    </div>
  );
}
