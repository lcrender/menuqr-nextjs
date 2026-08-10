import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

export default function DashboardConfigNav() {
  const router = useRouter();
  const { t } = useTranslation();
  const current = router.pathname;

  const items = [
    { href: '/admin/config/dashboard/welcome-messages', labelKey: 'dashboardPage.configNav.welcomeMessages' },
    { href: '/admin/config/dashboard/cta-card', labelKey: 'dashboardPage.configNav.ctaCard' },
  ];

  return (
    <nav className="nav nav-pills flex-wrap gap-2 mb-4">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`nav-link ${current === item.href ? 'active' : ''}`}
        >
          {t(item.labelKey)}
        </Link>
      ))}
    </nav>
  );
}
