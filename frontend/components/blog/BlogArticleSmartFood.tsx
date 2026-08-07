import Link from 'next/link';
import BlogArticleLayout from './BlogArticleLayout';
import { BLOG_ARTICLE_SMART_FOOD } from '../../data/blog/plantilla-smart-food-filtros-alimentarios';
import { getBlogArticleMeta } from '../../lib/blog-nav';

const meta = getBlogArticleMeta(BLOG_ARTICLE_SMART_FOOD.slug)!;
const watchUrl = `https://youtu.be/${BLOG_ARTICLE_SMART_FOOD.youtubeVideoId}`;
const embedUrl = `https://www.youtube.com/embed/${BLOG_ARTICLE_SMART_FOOD.youtubeVideoId}`;

export default function BlogArticleSmartFood() {
  const c = BLOG_ARTICLE_SMART_FOOD;

  return (
    <BlogArticleLayout meta={meta}>
      <p className="blog-lead">{c.lead}</p>

      <div className="blog-video card border-0 bg-light mb-4">
        <div className="card-body">
          <h2 className="h5 mb-2">Video: Smart Food en acción</h2>
          <p className="mb-3 text-muted small">
            Recorrido de la plantilla y de los filtros alimentarios.{' '}
            <a href={watchUrl} target="_blank" rel="noopener noreferrer">
              Abrir en YouTube
            </a>
          </p>
          <div className="ratio ratio-16x9 rounded overflow-hidden bg-dark">
            <iframe
              src={embedUrl}
              title="Plantilla Smart Food: filtros alimentarios en App Menu QR"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>
      </div>

      <p>{c.intro}</p>

      <p>
        La novedad principal es el sistema de filtros por tags: cada producto puede llevar etiquetas como{' '}
        <strong>sin gluten</strong>, <strong>sin lactosa</strong>, <strong>vegetariano</strong>,{' '}
        <strong>vegano</strong> o <strong>picante</strong>. En la carta pública, el cliente activa uno o más
        filtros y ve solo los platos compatibles. Si un filtro no aplica a ningún producto del menú, no se
        muestra, para mantener la interfaz limpia.
      </p>

      <p>{c.tagTranslationNote}</p>

      <p>{c.closing}</p>

      <h2 className="blog-h2">Qué incluye</h2>
      <ul className="blog-bullets">
        {c.bullets.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <div className="blog-cta-row">
        <Link href={c.demoHref} className="btn btn-primary">
          {c.ctaDemoLabel}
        </Link>
        <Link href={c.featuresHref} className="btn btn-outline-primary">
          {c.ctaFeaturesLabel}
        </Link>
      </div>

      <p className="blog-related">
        También podés leer más sobre{' '}
        <Link href={c.relatedHref}>menús con alérgenos e iconos dietéticos</Link> en la sección de
        funciones.
      </p>
    </BlogArticleLayout>
  );
}
