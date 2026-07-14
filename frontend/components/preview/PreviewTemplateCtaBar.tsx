'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import api from '../../lib/axios';
import { consumeTemplateAfterAuth, getNavigationForConsumeResult } from '../../lib/consume-template-after-auth';
import { previewTemplateIdToCatalogSlug } from '../../lib/menu-template-preview-route';
import { plantillaCaracteristicasHref } from '../../lib/plantillas-catalog-url';
import {
  buildIntentFromPreviewTemplateId,
  saveTemplateIntent,
} from '../../lib/template-selection-intent';
import styles from './PreviewTemplateCtaBar.module.css';

export interface PreviewTemplateCtaBarProps {
  previewTemplateId: string;
  templateLabel: string;
}

function readStoredUser(): { role?: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw) as { role?: string };
  } catch {
    return null;
  }
}

function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(localStorage.getItem('accessToken'));
}

function buildRegisterHref(previewId: string): string {
  const intent = buildIntentFromPreviewTemplateId(previewId);
  const templateId = intent?.apiTemplateId ?? previewId;
  const plan = intent?.requiredPlan ?? 'free';
  const qs = new URLSearchParams();
  qs.set('action', 'register');
  qs.set('template', templateId);
  qs.set('plan', plan);
  return `/login?${qs.toString()}`;
}

export default function PreviewTemplateCtaBar({ previewTemplateId, templateLabel }: PreviewTemplateCtaBarProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const meta = useMemo(() => buildIntentFromPreviewTemplateId(previewTemplateId), [previewTemplateId]);
  const isPro = meta?.requiredPlan === 'pro';
  const catalogSlug = previewTemplateIdToCatalogSlug(previewTemplateId);
  const featuresHref = plantillaCaracteristicasHref(catalogSlug);

  const handlePrimary = useCallback(async () => {
    if (!meta) return;
    saveTemplateIntent(meta);

    if (!isAuthenticated()) {
      router.push(buildRegisterHref(previewTemplateId));
      return;
    }

    setBusy(true);
    try {
      const user = readStoredUser();
      const result = await consumeTemplateAfterAuth(api, {
        isSuperAdmin: user?.role === 'SUPER_ADMIN',
      });
      router.push(getNavigationForConsumeResult(result));
    } finally {
      setBusy(false);
    }
  }, [meta, previewTemplateId, router]);

  return (
    <>
      <div className={`${styles.spacer} ${isPro ? styles.spacerPro : styles.spacerFree}`} aria-hidden />
      <div className={styles.bar} role="region" aria-label="Acciones de plantilla">
        <div className={styles.inner}>
          <div className={styles.info}>
            <p className={styles.titleRow}>
              <span className={styles.title}>{templateLabel}</span>
              {isPro ? (
                <span className={`${styles.badge} ${styles.badgePro}`} aria-label="Plantilla Pro">
                  Pro
                </span>
              ) : (
                <span className={`${styles.badge} ${styles.badgeFree}`} aria-label="Plantilla gratuita">
                  Free
                </span>
              )}
            </p>
            {isPro ? (
              <p className={styles.proNote}>
                Para usar esta plantilla necesitás un plan <strong>Pro</strong> o <strong>Premium</strong>.
              </p>
            ) : null}
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primary}
              onClick={() => void handlePrimary()}
              disabled={busy || !meta}
            >
              {busy ? 'Procesando…' : 'Usar esta plantilla'}
            </button>
            <Link href={featuresHref} className={styles.secondary}>
              Ver características
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
