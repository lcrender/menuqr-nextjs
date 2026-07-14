'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { catalogSlugToPreviewTemplateId } from '../../lib/menu-template-preview-route';
import { navigateUseTemplateByCatalogSlug } from '../../lib/template-use-flow';
import styles from './Plantillas.module.css';

export interface TemplateCardActionsProps {
  catalogSlug: string;
}

export default function TemplateCardActions({ catalogSlug }: TemplateCardActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const previewHref = `/preview/${encodeURIComponent(catalogSlugToPreviewTemplateId(catalogSlug))}`;

  const handleUseTemplate = useCallback(async () => {
    setBusy(true);
    try {
      await navigateUseTemplateByCatalogSlug(router, catalogSlug);
    } finally {
      setBusy(false);
    }
  }, [catalogSlug, router]);

  return (
    <div className={styles.cardCtaRow}>
      <Link href={previewHref} className={styles.ctaButtonSecondary}>
        Vista previa
      </Link>
      <button
        type="button"
        className={styles.ctaButton}
        onClick={() => void handleUseTemplate()}
        disabled={busy}
      >
        {busy ? 'Procesando…' : 'Usar plantilla'}
      </button>
    </div>
  );
}
