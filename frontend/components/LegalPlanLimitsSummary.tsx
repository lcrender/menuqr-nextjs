import { useEffect, useState } from 'react';
import {
  DEFAULT_PUBLIC_PLAN_LIMITS,
  fetchPublicPlanLimits,
  type PublicPlanLimitRow,
} from '../lib/public-plan-limits';

function cellLimit(n: number): string {
  if (n === -1) return 'Ilimitado';
  return String(n);
}

type Props = {
  /** Texto opcional encima de la tabla */
  caption?: string;
};

export default function LegalPlanLimitsSummary({ caption }: Props) {
  const [rows, setRows] = useState<PublicPlanLimitRow[]>([
    DEFAULT_PUBLIC_PLAN_LIMITS.free,
    DEFAULT_PUBLIC_PLAN_LIMITS.starter,
    DEFAULT_PUBLIC_PLAN_LIMITS.pro,
  ]);

  useEffect(() => {
    let cancelled = false;
    fetchPublicPlanLimits().then((m) => {
      if (!cancelled) setRows([m.free, m.starter, m.pro]);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="legal-plan-limits-summary my-3">
      {caption ? <p className="small text-muted mb-2">{caption}</p> : null}
      <div className="table-responsive">
        <table
          className="table table-sm table-bordered mb-2"
          style={{ fontSize: '0.9rem', maxWidth: '100%' }}
        >
          <thead className="table-light">
            <tr>
              <th scope="col">Plan</th>
              <th scope="col">Restaurantes</th>
              <th scope="col">Menús</th>
              <th scope="col">Productos</th>
              <th scope="col">Fotos en productos</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key}>
                <td>
                  <strong>{r.label}</strong>
                </td>
                <td>{cellLimit(r.restaurantLimit)}</td>
                <td>{cellLimit(r.menuLimit)}</td>
                <td>{cellLimit(r.productLimit)}</td>
                <td>{r.productPhotosAllowed ? 'Sí' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small text-muted mb-0" style={{ fontSize: '0.85rem' }}>
        Los valores efectivos corresponden a la configuración vigente de la Plataforma y pueden actualizarse. En planes
        con tope numérico, las variantes de producto pueden contar como productos adicionales.
      </p>
    </div>
  );
}
