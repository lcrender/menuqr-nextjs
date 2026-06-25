import Link from 'next/link';
import { useRouter } from 'next/router';

const ITEMS = [
  { href: '/admin/config/dashboard/welcome-messages', label: 'Mensajes bienvenida' },
  { href: '/admin/config/dashboard/cta-card', label: 'Mensaje card' },
];

export default function DashboardConfigNav() {
  const router = useRouter();
  const current = router.pathname;

  return (
    <nav className="nav nav-pills flex-wrap gap-2 mb-4">
      {ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`nav-link ${current === item.href ? 'active' : ''}`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
