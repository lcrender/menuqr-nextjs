import type { GetServerSideProps } from 'next';

/** Redirección legacy: /plantillas/:slug → /caracteristicas/:slug (sin getStaticPaths). */
export default function LegacyPlantillaSlugRedirect() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const raw = context.params?.slug;
  const slug = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : '';
  if (!slug) {
    return { notFound: true };
  }
  return {
    redirect: {
      destination: `/caracteristicas/${encodeURIComponent(slug)}`,
      permanent: true,
    },
  };
};
