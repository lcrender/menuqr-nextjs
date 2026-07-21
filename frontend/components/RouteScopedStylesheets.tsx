import Head from 'next/head';
import { useRouter } from 'next/router';

/** Bump al cambiar estilos admin para evitar caché del navegador. */
const ADMIN_CSS_V = '20260721b';

const ADMIN_STYLES = [
  `/css/admin.css?v=${ADMIN_CSS_V}`,
  '/css/print-menu.css',
  '/css/menu-schedule.css',
] as const;

const MENU_STYLES = [
  '/css/templates.css',
  '/css/highlighted-product.css',
  '/css/templates/classic.css',
  '/css/templates/minimalist.css',
  '/css/templates/foodie.css',
  '/css/templates/burgers.css',
  '/css/templates/italianfood.css',
  '/css/templates/smartfood.css',
  '/css/templates/beachbar.css',
  '/css/templates/promobile.css',
  '/css/templates/solnoche.css',
] as const;

function needsAdminStyles(pathname: string): boolean {
  return pathname.startsWith('/admin');
}

/** Cartas públicas, preview y rutas cortas /r /m */
function needsMenuStyles(pathname: string, asPath: string): boolean {
  if (
    pathname.startsWith('/restaurant') ||
    pathname.startsWith('/menu') ||
    pathname.startsWith('/preview') ||
    pathname.startsWith('/r/') ||
    pathname.startsWith('/m/')
  ) {
    return true;
  }
  // rewrite /r/:slug → /restaurant/:slug (pathname ya normalizado en Pages Router)
  if (asPath.startsWith('/r/') || asPath.startsWith('/m/')) return true;
  return false;
}

/**
 * Carga CSS pesado (admin + plantillas) solo en rutas que lo necesitan.
 * La homepage y landings quedan con bootstrap + landing.css únicamente.
 */
export default function RouteScopedStylesheets() {
  const router = useRouter();
  const pathname = router.pathname || '';
  const asPath = router.asPath || '';

  const admin = needsAdminStyles(pathname);
  const menus = needsMenuStyles(pathname, asPath);

  if (!admin && !menus) return null;

  const hrefs = [
    ...(admin ? ADMIN_STYLES : []),
    ...(menus ? MENU_STYLES : []),
  ];

  return (
    <Head>
      {hrefs.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
    </Head>
  );
}
