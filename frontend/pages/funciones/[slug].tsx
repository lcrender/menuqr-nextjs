import type { GetStaticPaths, GetStaticProps } from 'next';
import FuncionesFeaturePage from '../../components/funciones/FuncionesFeaturePage';
import MenuConAlergenosLanding from '../../components/funciones/MenuConAlergenosLanding';
import MenuQrDinamicoLanding from '../../components/funciones/MenuQrDinamicoLanding';
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
