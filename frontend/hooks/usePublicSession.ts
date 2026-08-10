import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { isAuthenticatedUser } from '../lib/template-use-flow';
import i18n from '../src/i18n/config';
import systemPagesEs from '../src/locales/fragments/systemPages.es.json';
import systemPagesEn from '../src/locales/fragments/systemPages.en.json';

i18n.addResourceBundle('es-ES', 'translation', { systemPages: systemPagesEs }, true, true);
i18n.addResourceBundle('en-US', 'translation', { systemPages: systemPagesEn }, true, true);

/** Sesión en páginas públicas (localStorage + cambios de ruta/pestaña). */
export function usePublicSession(): boolean {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const check = () => setIsLoggedIn(isAuthenticatedUser());
    check();
    window.addEventListener('storage', check);
    router.events.on('routeChangeComplete', check);
    return () => {
      window.removeEventListener('storage', check);
      router.events.off('routeChangeComplete', check);
    };
  }, [router.events]);

  return isLoggedIn;
}

export function usePublicAccountNav(): { href: string; label: string } {
  const { t } = useTranslation();
  const isLoggedIn = usePublicSession();
  return isLoggedIn
    ? { href: '/admin', label: t('systemPages.footer.myAccount') }
    : { href: '/login', label: t('systemPages.footer.signIn') };
}
