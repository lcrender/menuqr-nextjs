import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { isAuthenticatedUser } from '../lib/template-use-flow';

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
  const isLoggedIn = usePublicSession();
  return isLoggedIn
    ? { href: '/admin', label: 'Mi cuenta' }
    : { href: '/login', label: 'Iniciar sesión' };
}
