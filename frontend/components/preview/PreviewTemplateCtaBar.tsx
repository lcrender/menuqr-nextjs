'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import api from '../../lib/axios';
import { consumeTemplateAfterAuth } from '../../lib/consume-template-after-auth';
import {
  buildIntentFromPreviewTemplateId,
  saveTemplateIntent,
} from '../../lib/template-selection-intent';

export interface PreviewTemplateCtaBarProps {
  previewTemplateId: string;
  templateLabel: string;
}

function readStoredUser(): { role?: string; tenant?: { plan?: string } } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw) as { role?: string; tenant?: { plan?: string } };
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
  const plan = intent?.requiredPlan ?? 'free';
  const qs = new URLSearchParams();
  qs.set('action', 'register');
  qs.set('template', previewId);
  qs.set('plan', plan);
  return `/login?${qs.toString()}`;
}

export default function PreviewTemplateCtaBar({ previewTemplateId, templateLabel }: PreviewTemplateCtaBarProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const meta = useMemo(() => buildIntentFromPreviewTemplateId(previewTemplateId), [previewTemplateId]);
  const isPro = meta?.requiredPlan === 'pro';
  const primaryLabel = isPro ? 'Usar esta plantilla PRO' : 'Usar esta plantilla';

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
      if (result.action === 'needs_upgrade') {
        router.push(result.upgradeHref);
        return;
      }
      if (result.action === 'needs_restaurant') {
        router.push(result.wizardHref);
        return;
      }
      if (result.action === 'applied') {
        router.push('/admin');
        return;
      }
      router.push('/admin');
    } finally {
      setBusy(false);
    }
  }, [meta, previewTemplateId, router]);

  return (
    <div className="preview-cta-bar">
      <div className="preview-cta-inner">
        <p className="preview-cta-lead">
          <strong>{templateLabel}</strong>
          {isPro ? (
            <span className="preview-cta-pro-pill" aria-label="Plantilla Pro">
              PRO
            </span>
          ) : null}
        </p>
        <div className="preview-cta-actions">
          <button
            type="button"
            className="preview-cta-primary"
            onClick={() => void handlePrimary()}
            disabled={busy || !meta}
          >
            {busy ? 'Procesando…' : primaryLabel}
          </button>
          <Link href="/login?action=register" className="preview-cta-secondary">
            Crear mi menú
          </Link>
        </div>
      </div>
      <style jsx>{`
        .preview-cta-bar {
          position: sticky;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 95;
          padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0));
          background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #ffffff 18%);
          border-top: 1px solid #e2e8f0;
          box-shadow: 0 -4px 20px rgba(15, 23, 42, 0.06);
        }

        .preview-cta-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 12px 16px;
        }

        .preview-cta-lead {
          margin: 0;
          font-size: 0.95rem;
          color: #334155;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .preview-cta-pro-pill {
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          color: #92400e;
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
          border: 1px solid #fcd34d;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .preview-cta-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          align-items: center;
        }

        .preview-cta-primary {
          appearance: none;
          border: none;
          cursor: pointer;
          padding: 0.65rem 1.25rem;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.95rem;
          color: #ffffff;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.35);
          transition:
            transform 0.15s ease,
            box-shadow 0.15s ease,
            opacity 0.15s ease;
        }

        .preview-cta-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
        }

        .preview-cta-primary:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .preview-cta-secondary {
          padding: 0.6rem 1.1rem;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.92rem;
          color: #1d4ed8;
          background: #ffffff;
          border: 2px solid #bfdbfe;
          text-decoration: none;
          transition:
            background 0.15s ease,
            border-color 0.15s ease;
        }

        .preview-cta-secondary:hover {
          background: #eff6ff;
          border-color: #93c5fd;
        }

        @media (min-width: 768px) {
          .preview-cta-bar {
            position: relative;
            bottom: auto;
            border-top: none;
            box-shadow: none;
            padding: 16px 20px 28px;
            background: #fafafa;
          }

          .preview-cta-inner {
            padding: 16px 20px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            box-shadow: 0 4px 18px rgba(15, 23, 42, 0.06);
          }
        }
      `}</style>
    </div>
  );
}
