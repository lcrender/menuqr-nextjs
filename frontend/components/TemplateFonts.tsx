import Head from 'next/head';

type TemplateFontsProps = {
  /** Familias Google Fonts (URL css2 ya armada). */
  googleFontsHref: string;
};

/**
 * Carga fuentes de plantilla solo cuando esa plantilla se renderiza
 * (evita @import en CSS global que bloquea FCP en toda la web).
 */
export default function TemplateFonts({ googleFontsHref }: TemplateFontsProps) {
  return (
    <Head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={googleFontsHref} />
    </Head>
  );
}

export const ITALIAN_FOOD_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&display=swap';

export const SMART_FOOD_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&family=Inter:wght@400;600;700&display=swap';
