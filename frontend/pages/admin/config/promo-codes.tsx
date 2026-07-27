import { useEffect } from 'react';
import { useRouter } from 'next/router';

/** Redirección: códigos promo pasaron de Configuración a Herramientas. */
export default function PromoCodesConfigRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/herramientas/promo-codes');
  }, [router]);
  return null;
}
