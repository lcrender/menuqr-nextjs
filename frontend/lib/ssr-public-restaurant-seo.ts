import type { GetServerSidePropsContext } from 'next';
import { getServerApiBaseUrl } from './config';
import {
  APP_MENU_QR_TITLE_SUFFIX,
  type PublicHtmlSeo,
  buildMetaDescription,
  buildPublicRestaurantTitle,
  canonicalUrlFromSsr,
  plainTextFromRichDescription,
  robotsContent,
  sectionNamesForMeta,
} from './public-restaurant-meta';

/** Alineado con `isBcp47MenuLocale` (MenuLanguageSwitcher): `xx-XX`. */
const BCP47_MENU = /^[a-z]{2}-[A-Z]{2}$/;

function pickSsrMenuLocale(ctx: GetServerSidePropsContext): string {
  const l = ctx.query.locale;
  const g = ctx.query.lang;
  if (typeof l === 'string' && BCP47_MENU.test(l.trim())) return l.trim();
  if (typeof g === 'string' && BCP47_MENU.test(g.trim())) return g.trim();
  return 'es-ES';
}

export async function buildRestaurantHubSsrSeo(
  ctx: GetServerSidePropsContext,
): Promise<PublicHtmlSeo> {
  const slug = ctx.params?.slug;
  /** URL pública corta (`rewrites` /r/:slug → /restaurant/:slug); canónica única para SEO. */
  const canonicalPath = typeof slug === 'string' ? `/r/${encodeURIComponent(slug)}` : '/';

  const canonicalUrl = canonicalUrlFromSsr(ctx.req, canonicalPath);

  if (typeof slug !== 'string') {
    return {
      title: APP_MENU_QR_TITLE_SUFFIX,
      description: '',
      robots: 'noindex, nofollow',
      canonicalUrl,
    };
  }

  const locale = pickSsrMenuLocale(ctx);
  const base = getServerApiBaseUrl();

  try {
    const res = await fetch(
      `${base}/public/restaurants/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`,
      { headers: { Accept: 'application/json' } },
    );
    if (!res.ok) {
      return {
        title: APP_MENU_QR_TITLE_SUFFIX,
        description: '',
        robots: 'noindex, nofollow',
        canonicalUrl,
      };
    }

    const data = (await res.json()) as {
      name?: string;
      description?: string | null;
      menus?: Array<{ slug: string; sort?: number }>;
    };

    const menus = Array.isArray(data.menus) ? data.menus : [];
    const sortedMenus = [...menus].sort((a, b) => {
      const sortA = a.sort !== undefined ? a.sort : 999;
      const sortB = b.sort !== undefined ? b.sort : 999;
      return sortA - sortB;
    });

    let sectionNames = '';
    const hasDesc = !!plainTextFromRichDescription(data.description ?? undefined);
    const firstMenu = sortedMenus[0];
    if (!hasDesc && firstMenu) {
      const ms = firstMenu.slug;
      const mr = await fetch(
        `${base}/public/restaurants/${encodeURIComponent(slug)}/menus/${encodeURIComponent(ms)}?locale=${encodeURIComponent(locale)}`,
        { headers: { Accept: 'application/json' } },
      );
      if (mr.ok) {
        const md = (await mr.json()) as { sections?: { name?: string | null }[] };
        sectionNames = sectionNamesForMeta(md.sections);
      }
    }

    const description = buildMetaDescription({
      restaurantDescription: data.description ?? null,
      sectionNames,
    });

    return {
      title: buildPublicRestaurantTitle(data.name || slug),
      description,
      robots: robotsContent(sortedMenus.length > 0),
      canonicalUrl,
    };
  } catch {
    return {
      title: APP_MENU_QR_TITLE_SUFFIX,
      description: '',
      robots: 'noindex, nofollow',
      canonicalUrl,
    };
  }
}

export async function buildPublicMenuSsrSeo(
  ctx: GetServerSidePropsContext,
): Promise<PublicHtmlSeo> {
  const rs = ctx.params?.restaurantSlug;
  const ms = ctx.params?.menuSlug;
  const canonicalPath =
    typeof rs === 'string' && typeof ms === 'string'
      ? `/r/${encodeURIComponent(rs)}/${encodeURIComponent(ms)}`
      : '/';

  const canonicalUrl = canonicalUrlFromSsr(ctx.req, canonicalPath);

  if (typeof rs !== 'string' || typeof ms !== 'string') {
    return {
      title: APP_MENU_QR_TITLE_SUFFIX,
      description: '',
      robots: 'noindex, nofollow',
      canonicalUrl,
    };
  }

  const locale = pickSsrMenuLocale(ctx);
  const base = getServerApiBaseUrl();

  try {
    const menuRes = await fetch(
      `${base}/public/restaurants/${encodeURIComponent(rs)}/menus/${encodeURIComponent(ms)}?locale=${encodeURIComponent(locale)}`,
      { headers: { Accept: 'application/json' } },
    );

    if (!menuRes.ok) {
      return {
        title: APP_MENU_QR_TITLE_SUFFIX,
        description: '',
        robots: 'noindex, nofollow',
        canonicalUrl,
      };
    }

    const menuData = (await menuRes.json()) as {
      sections?: { name?: string | null }[];
      restaurantName?: string;
    };

    const restaurantRes = await fetch(
      `${base}/public/restaurants/${encodeURIComponent(rs)}?locale=${encodeURIComponent(locale)}`,
      { headers: { Accept: 'application/json' } },
    );

    let restaurantDescription: string | null | undefined;
    let restaurantName = menuData.restaurantName ?? '';
    if (restaurantRes.ok) {
      const rd = (await restaurantRes.json()) as {
        description?: string | null;
        name?: string;
      };
      restaurantDescription = rd.description ?? null;
      if (rd.name) restaurantName = rd.name;
    }

    const description = buildMetaDescription({
      restaurantDescription,
      sectionNames: sectionNamesForMeta(menuData.sections),
    });

    return {
      title: buildPublicRestaurantTitle(restaurantName || rs),
      description,
      robots: robotsContent(true),
      canonicalUrl,
    };
  } catch {
    return {
      title: APP_MENU_QR_TITLE_SUFFIX,
      description: '',
      robots: 'noindex, nofollow',
      canonicalUrl,
    };
  }
}
