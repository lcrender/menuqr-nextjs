import type { GetStaticPaths, GetStaticProps } from 'next';
import FuncionesFeaturePage from '../../components/funciones/FuncionesFeaturePage';
import ImprimirMenuLanding from '../../components/funciones/ImprimirMenuLanding';
import MenuConAlergenosLanding from '../../components/funciones/MenuConAlergenosLanding';
import MenuMultidiomaLanding from '../../components/funciones/MenuMultidiomaLanding';
import MenuQrDinamicoLanding from '../../components/funciones/MenuQrDinamicoLanding';
import ProgramarMenusLanding from '../../components/funciones/ProgramarMenusLanding';
import {
  FUNCIONES_SLUGS,
  getFuncionesSection,
  isFuncionesSlug,
  type FuncionesSection,
} from '../../lib/funciones-nav';

type Props = {
  section: FuncionesSection;
};

export default function FuncionesSlugPage({ section }: Props) {
  if (section.slug === 'menu-qr-dinamico') {
    return <MenuQrDinamicoLanding />;
  }
  if (section.slug === 'menu-con-alergenos') {
    return <MenuConAlergenosLanding />;
  }
  if (section.slug === 'menu-multidioma') {
    return <MenuMultidiomaLanding />;
  }
  if (section.slug === 'programar-menus') {
    return <ProgramarMenusLanding />;
  }
  if (section.slug === 'imprimir-menu') {
    return <ImprimirMenuLanding />;
  }
  return <FuncionesFeaturePage section={section} />;
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: FUNCIONES_SLUGS.map((slug) => ({ params: { slug } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async (ctx) => {
  const slug = typeof ctx.params?.slug === 'string' ? ctx.params.slug : '';
  if (!isFuncionesSlug(slug)) {
    return { notFound: true };
  }
  const section = getFuncionesSection(slug);
  if (!section) return { notFound: true };
  return { props: { section } };
};
