import TemplateFonts from './TemplateFonts';
import {
  findTemplateGoogleFont,
  googleFontCssStack,
  googleFontStylesheetHref,
} from '../lib/template-google-fonts';

const TEMPLATE_ROOTS = [
  '.template-classic',
  '.template-minimalist',
  '.template-foodie',
  '.template-burgers',
  '.template-gourmet',
  '.template-pro-mobile',
  '.template-smartfood',
  '.template-beachbar',
  '.template-sol-noche',
  '.template-italianfood',
];

type Props = {
  templateConfig?: Record<string, unknown> | null | undefined;
};

/**
 * Si la plantilla tiene una Google Font elegida, la carga y reemplaza la fuente por defecto.
 * Con «Fuente de la plantilla» no hace nada.
 */
export default function TemplateGoogleFont({ templateConfig }: Props) {
  const font = findTemplateGoogleFont(templateConfig?.googleFont);
  if (!font) return null;

  const stack = googleFontCssStack(font);
  const selectors = TEMPLATE_ROOTS.flatMap((root) => [root, `${root} *:not(svg)`]).join(',');
  const css = `${selectors}{font-family:${stack} !important;}`;

  return (
    <>
      <TemplateFonts googleFontsHref={googleFontStylesheetHref(font)} />
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </>
  );
}
