import type { GetStaticPaths, GetStaticProps } from 'next';
import FuncionesFeaturePage from '../../../components/funciones/FuncionesFeaturePage';
import GestionarProductosLanding from '../../../components/funciones/GestionarProductosLanding';
import ImprimirMenuLanding from '../../../components/funciones/ImprimirMenuLanding';
import MenuConAlergenosLanding from '../../../components/funciones/MenuConAlergenosLanding';
import MenuMultidiomaLanding from '../../../components/funciones/MenuMultidiomaLanding';
import MenuQrDinamicoLanding from '../../../components/funciones/MenuQrDinamicoLanding';
import ProgramarMenusLanding from '../../../components/funciones/ProgramarMenusLanding';
import {
  FUNCIONES_SECTIONS,
  getFuncionesSection,
  isFuncionesEnSlug,
  type FuncionesSection,
} from '../../../lib/funciones-nav';

type Props = {
  section: FuncionesSection;
};

export default function FeaturesSlugEnPage({ section }: Props) {
  if (section.slug === 'menu-qr-dinamico') {
    return <MenuQrDinamicoLanding locale="en" />;
  }
  if (section.slug === 'menu-con-alergenos') {
    return <MenuConAlergenosLanding locale="en" />;
  }
  if (section.slug === 'menu-multidioma') {
    return <MenuMultidiomaLanding locale="en" />;
  }
  if (section.slug === 'programar-menus') {
    return <ProgramarMenusLanding locale="en" />;
  }
  if (section.slug === 'imprimir-menu') {
    return <ImprimirMenuLanding locale="en" />;
  }
  if (section.slug === 'gestionar-productos-menu') {
    return <GestionarProductosLanding locale="en" />;
  }
  return <FuncionesFeaturePage section={section} locale="en" region="EN" />;
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: FUNCIONES_SECTIONS.map((s) => ({ params: { slug: s.enSlug } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async (ctx) => {
  const slug = typeof ctx.params?.slug === 'string' ? ctx.params.slug : '';
  if (!isFuncionesEnSlug(slug)) {
    return { notFound: true };
  }
  const section = getFuncionesSection(slug);
  if (!section) return { notFound: true };
  return { props: { section } };
};
