import Head from 'next/head';
import { useRouter } from 'next/router';

/** Bump al cambiar estilos admin para evitar caché del navegador. */
const ADMIN_CSS_V = '20260721c';
/** Bump al cambiar CSS de plantillas (preview mockup, etc.). */
const MENU_CSS_V = '20260724z';

const ADMIN_STYLES = [
  `/css/admin.css?v=${ADMIN_CSS_V}`,
  '/css/print-menu.css',
  '/css/menu-schedule.css',
] as const;

const MENU_STYLES = [
  `/css/templates.css?v=${MENU_CSS_V}`,
  `/css/highlighted-product.css?v=${MENU_CSS_V}`,
  `/css/templates/classic.css?v=${MENU_CSS_V}`,
  `/css/templates/minimalist.css?v=${MENU_CSS_V}`,
  `/css/templates/foodie.css?v=${MENU_CSS_V}`,
  `/css/templates/burgers.css?v=${MENU_CSS_V}`,
  `/css/templates/italianfood.css?v=${MENU_CSS_V}`,
  `/css/templates/gourmet.css?v=${MENU_CSS_V}`,
  `/css/templates/smartfood.css?v=${MENU_CSS_V}`,
  `/css/templates/beachbar.css?v=${MENU_CSS_V}`,
  `/css/templates/promobile.css?v=${MENU_CSS_V}`,
  `/css/templates/solnoche.css?v=${MENU_CSS_V}`,
] as const;

function needsAdminStyles(pathname: string): boolean {
  return pathname.startsWith('/admin');
}

/** Cartas públicas, preview y rutas cortas /r /m */
function needsMenuStyles(pathname: string, asPath: string): boolean {
  if (pathname.startsWith('/admin/menus/preview')) return true;
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
