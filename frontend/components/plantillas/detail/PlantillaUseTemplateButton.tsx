'use client';

import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { navigateUseTemplateByCatalogSlug } from '../../../lib/template-use-flow';

export interface PlantillaUseTemplateButtonProps {
  catalogSlug: string;
  label: string;
  className?: string;
  busyLabel?: string;
}

export default function PlantillaUseTemplateButton({
  catalogSlug,
  label,
  className = '',
  busyLabel = 'Procesando…',
}: PlantillaUseTemplateButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleClick = useCallback(async () => {
    setBusy(true);
    try {
      await navigateUseTemplateByCatalogSlug(router, catalogSlug);
    } finally {
      setBusy(false);
    }
  }, [catalogSlug, router]);

  return (
    <button type="button" className={className} onClick={() => void handleClick()} disabled={busy || !catalogSlug}>
      {busy ? busyLabel : label}
    </button>
  );
}
