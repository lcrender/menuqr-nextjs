'use client';

import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { navigateUpgradeToProForTemplate } from '../../../lib/template-use-flow';

export interface PlantillaUpgradeProButtonProps {
  catalogSlug: string;
  label?: string;
  className?: string;
  busyLabel?: string;
}

export default function PlantillaUpgradeProButton({
  catalogSlug,
  label = 'Actualizar a PRO',
  className = '',
  busyLabel = 'Procesando…',
}: PlantillaUpgradeProButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleClick = useCallback(async () => {
    setBusy(true);
    try {
      await navigateUpgradeToProForTemplate(router, catalogSlug);
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
