import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

/**
 * Alias de registro: redirige a /login?action=register&template=…&plan=…
 * (mantiene URLs compartibles según el flujo de marketing).
 */
export default function RegistroPage() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    const qs = new URLSearchParams();
    qs.set('action', 'register');
    const t = router.query.template;
    const p = router.query.plan;
    if (typeof t === 'string' && t.trim()) qs.set('template', t.trim());
    if (typeof p === 'string' && p.trim()) qs.set('plan', p.trim());
    router.replace(`/login?${qs.toString()}`);
  }, [router, router.isReady, router.query.template, router.query.plan]);

  return (
    <>
      <Head>
        <title>Registro - AppMenuQR</title>
        <meta name="robots" content="noindex, follow" />
      </Head>
      <div className="container py-5 text-center text-muted">Redirigiendo al registro…</div>
    </>
  );
}
