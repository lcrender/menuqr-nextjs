import Image from 'next/image';
import LandingHomeLink from './LandingHomeLink';
import { LANDING_BRAND_LOGO_SRC, LANDING_BRAND_NAME } from './LandingBrandMark';

type PublicMenuStatusProps = {
  message: string;
};

/** Pantalla pública vacía: mismo diseño para “no encontrado” y “sin conexión”. */
export default function PublicMenuStatus({ message }: PublicMenuStatusProps) {
  return (
    <main className="public-menu-status">
      <LandingHomeLink className="public-menu-status-brand" aria-label={LANDING_BRAND_NAME}>
        <Image
          src={LANDING_BRAND_LOGO_SRC}
          alt=""
          width={96}
          height={96}
          priority
          className="public-menu-status-logo"
        />
        <span className="public-menu-status-name">{LANDING_BRAND_NAME}</span>
      </LandingHomeLink>
      <p className="public-menu-status-message">{message}</p>
      <style jsx global>{`
        .public-menu-status {
          min-height: 100vh;
          margin: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.75rem;
          padding: 2.5rem 1.5rem;
          background: #f7f7f8;
          color: #111827;
          text-align: center;
        }
        .public-menu-status-brand {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 0.85rem;
          text-decoration: none;
          color: inherit;
        }
        .public-menu-status-brand:hover {
          text-decoration: none;
          color: inherit;
        }
        .public-menu-status-logo {
          width: 96px;
          height: 96px;
          object-fit: contain;
        }
        .public-menu-status-name {
          font-size: 1.35rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.1;
          background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .public-menu-status-message {
          margin: 0;
          max-width: 22rem;
          font-size: 1.05rem;
          font-weight: 500;
          line-height: 1.5;
          color: #374151;
        }
      `}</style>
    </main>
  );
}
