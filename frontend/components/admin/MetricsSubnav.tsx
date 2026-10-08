import Link from 'next/link';
import { useRouter } from 'next/router';

export default function MetricsSubnav() {
  const { pathname } = useRouter();
  const onSubscriptions = pathname.startsWith('/admin/metrics/suscripciones');

  return (
    <ul className="nav nav-pills mb-4">
      <li className="nav-item">
        <Link href="/admin/metrics" className={`nav-link ${onSubscriptions ? '' : 'active'}`}>
          Resumen
        </Link>
      </li>
      <li className="nav-item">
        <Link
          href="/admin/metrics/suscripciones"
          className={`nav-link ${onSubscriptions ? 'active' : ''}`}
        >
          Suscripciones
        </Link>
      </li>
    </ul>
  );
}
