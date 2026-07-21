import Link, { type LinkProps } from 'next/link';
import type { ReactNode, AnchorHTMLAttributes } from 'react';
import { useLandingHomeHref } from '../lib/landing-region';

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> &
  Omit<LinkProps, 'href'> & {
    children: ReactNode;
    className?: string;
    /** Forzar home regional (p. ej. /AR). */
    homeHref?: string;
  };

/** Link al home regional (/AR o /ES) según ruta/cookie. */
export default function LandingHomeLink({ children, homeHref, ...rest }: Props) {
  const href = useLandingHomeHref(homeHref);
  return (
    <Link href={href} {...rest}>
      {children}
    </Link>
  );
}
