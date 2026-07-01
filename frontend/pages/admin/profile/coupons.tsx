import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../../../lib/axios';
import AdminLayout from '../../../components/AdminLayout';
import AlertModal from '../../../components/AlertModal';
import { getApiErrorMessage } from '../../../lib/api-error-message';
import { appendPromoToCheckoutUrl, isPromoCheckoutPlan } from '../../../lib/promo-query';

type PromoPreview = {
  valid: boolean;
  code: string;
  grantPlan: string;
  grantPlanLabel: string;
  applicablePlans: string[];
  applicablePlanLabels: string[];
  grantDurationMonths: number | null;
  unlimitedDuration?: boolean;
  benefitEndsAt: string | null;
  codeValidUntil: string;
  message?: string;
};

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es', { dateStyle: 'medium' });
}

export default function ProfileCouponsPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [preview, setPreview] = useState<PromoPreview | null>(null);
  const [alert, setAlert] = useState<{ title: string; message: string; variant: 'success' | 'error' } | null>(null);

  const requiresDirectRedeem = (p: PromoPreview) =>
    p.grantPlan === 'pro_team' || !isPromoCheckoutPlan(p.grantPlan);

  const handleValidate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) {
      setAlert({ title: 'Código requerido', message: 'Ingresá un cupón para validar.', variant: 'error' });
      return;
    }

    setValidating(true);
    setPreview(null);
    setAlert(null);
    try {
      const res = await api.post<PromoPreview>('/subscriptions/validate-promo-code', {
        code: trimmed,
      });
      const data = res.data;
      if (!data.valid) {
        setAlert({
          title: 'Cupón no válido',
          message: data.message || 'No se puede usar este código.',
          variant: 'error',
        });
        return;
      }

      if (requiresDirectRedeem(data)) {
        setPreview(data);
        return;
      }

      const checkoutUrl = appendPromoToCheckoutUrl(
        `/admin/profile/subscription/checkout?plan=${encodeURIComponent(data.grantPlan)}&billing=monthly`,
        data.code,
      );
      router.push(checkoutUrl);
    } catch (err: unknown) {
      setAlert({
        title: 'Error',
        message: getApiErrorMessage(err, 'No se pudo validar el cupón.'),
        variant: 'error',
      });
    } finally {
      setValidating(false);
    }
  };

  const handleRedeemDirect = async () => {
    if (!preview?.code) return;
    setRedeeming(true);
    setAlert(null);
    try {
      const res = await api.post<{ grantPlan: string }>('/subscriptions/redeem-promo-code', {
        code: preview.code,
      });
      router.push(`/admin?promo=1&plan=${encodeURIComponent(res.data.grantPlan)}`);
    } catch (err: unknown) {
      setAlert({
        title: 'No se pudo canjear',
        message: getApiErrorMessage(err, 'Error al activar el cupón.'),
        variant: 'error',
      });
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container-fluid py-4" style={{ maxWidth: 720 }}>
        <div className="d-flex align-items-center gap-2 mb-4">
          <Link href="/admin/profile" className="btn btn-sm btn-outline-secondary">
            ← Volver al perfil
          </Link>
        </div>

        <h1 className="h3 mb-2 fw-semibold">Cupones</h1>
        <p className="text-muted mb-4">
          Ingresá tu código promocional. Si aplica a un plan de pago, te llevaremos al checkout con el cupón
          precargado. Los cupones de Pro Team u otros beneficios especiales se activan desde aquí.
        </p>

        <section className="card profile-section">
          <div className="card-body">
            <form onSubmit={handleValidate}>
              <label className="form-label fw-medium" htmlFor="coupon-code">
                Código del cupón
              </label>
              <div className="d-flex flex-column flex-sm-row gap-2">
                <input
                  id="coupon-code"
                  type="text"
                  className="form-control"
                  placeholder="Ej.: LANZAMIENTO2026"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  autoComplete="off"
                  spellCheck={false}
                />
                <button type="submit" className="btn btn-primary" disabled={validating || redeeming}>
                  {validating ? 'Validando…' : 'Validar cupón'}
                </button>
              </div>
            </form>

            {preview && (
              <div className="alert alert-success mt-4 mb-0">
                <div className="fw-semibold mb-2">Cupón válido: {preview.code}</div>
                <ul className="mb-3 ps-3 small">
                  <li>
                    Plan: <strong>{preview.grantPlanLabel}</strong>
                  </li>
                  <li>
                    Beneficio:{' '}
                    <strong>
                      {preview.unlimitedDuration
                        ? 'Tiempo ilimitado'
                        : `${preview.grantDurationMonths ?? '—'} mes(es) gratis`}
                    </strong>
                  </li>
                  {!preview.unlimitedDuration && preview.benefitEndsAt && (
                    <li>Válido hasta: {formatDate(preview.benefitEndsAt)}</li>
                  )}
                  <li>Código vigente hasta: {formatDate(preview.codeValidUntil)}</li>
                </ul>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleRedeemDirect}
                  disabled={redeeming}
                >
                  {redeeming ? 'Activando…' : 'Activar cupón'}
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {alert && (
        <AlertModal
          show
          title={alert.title}
          message={alert.message}
          variant={alert.variant}
          onClose={() => setAlert(null)}
        />
      )}
    </AdminLayout>
  );
}
