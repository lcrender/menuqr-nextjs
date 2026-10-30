type PublicRestaurantLoadingProps = {
  logoUrl?: string | null | undefined;
  name?: string | null | undefined;
};

/**
 * Pantalla de carga de carta pública: logo del comercio centrado
 * (fallback a spinner si aún no hay logo).
 */
export default function PublicRestaurantLoading({ logoUrl, name }: PublicRestaurantLoadingProps) {
  const src = typeof logoUrl === 'string' ? logoUrl.trim() : '';
  const label = (name || '').trim() || 'Cargando…';

  return (
    <div className="public-restaurant-loading" role="status" aria-live="polite" aria-busy="true">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="public-restaurant-loading__logo" src={src} alt={label} />
      ) : (
        <div className="public-restaurant-loading__fallback">
          <div className="spinner-border text-secondary" role="presentation" />
          <span className="visually-hidden">Cargando…</span>
        </div>
      )}
      <style jsx>{`
        .public-restaurant-loading {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: #fff;
        }
        .public-restaurant-loading__logo {
          display: block;
          width: min(42vw, 9.5rem);
          height: auto;
          max-height: 9.5rem;
          object-fit: contain;
          animation: public-restaurant-loading-pulse 1.4s ease-in-out infinite;
        }
        .public-restaurant-loading__fallback {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        @keyframes public-restaurant-loading-pulse {
          0%,
          100% {
            opacity: 0.55;
            transform: scale(0.97);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
