import { Fragment } from 'react';
import Link from 'next/link';
import BlogArticleLayout from './BlogArticleLayout';
import {
  getBlogArticleCrearMenuQrGratis,
  type BlogInline,
} from '../../data/blog/como-crear-menu-qr-gratis';
import { getBlogArticleMeta, type BlogUiLocale } from '../../lib/blog-nav';

type Props = {
  locale?: BlogUiLocale;
};

function RichText({ content }: { content: BlogInline[] }) {
  return (
    <>
      {content.map((part, index) => {
        if (typeof part === 'string') return <Fragment key={index}>{part}</Fragment>;
        if ('strong' in part) return <strong key={index}>{part.strong}</strong>;
        return (
          <Link key={index} href={part.href}>
            {part.link}
          </Link>
        );
      })}
    </>
  );
}

export default function BlogArticleCrearMenuQrGratis({ locale = 'es' }: Props) {
  const c = getBlogArticleCrearMenuQrGratis(locale);
  const meta = getBlogArticleMeta('como-crear-un-menu-qr-gratis')!;

  return (
    <BlogArticleLayout meta={meta} locale={locale} faq={c.faqs}>
      <p className="blog-lead">
        <RichText content={c.lead} />
      </p>

      <nav className="blog-toc" aria-label={c.tocLabel}>
        <p className="blog-toc-title">{c.tocLabel}</p>
        <ol>
          {c.toc.map((item) => (
            <li key={item.href}>
              <a href={item.href}>{item.label}</a>
            </li>
          ))}
        </ol>
      </nav>

      {c.blocks.map((block, index) => {
        if (block.type === 'h2') {
          return (
            <h2 key={block.id} id={block.id} className="blog-h2">
              {block.text}
            </h2>
          );
        }
        if (block.type === 'h3') {
          return (
            <h3 key={`${block.text}-${index}`} className="blog-h3">
              {block.text}
            </h3>
          );
        }
        if (block.type === 'ul') {
          return (
            <ul key={`ul-${index}`} className="blog-bullets">
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }
        if (block.type === 'example') {
          return (
            <figure key={`example-${index}`} className="blog-example">
              <figcaption>{block.title}</figcaption>
              <p>{block.body}</p>
            </figure>
          );
        }
        if (block.type === 'note') {
          return (
            <aside key={`note-${index}`} className="blog-callout">
              <p>{block.text}</p>
            </aside>
          );
        }
        if (block.type === 'image') {
          return (
            <figure key={`image-${index}`} className="blog-figure">
              <img src={block.src} alt={block.alt} width={block.width} height={block.height} />
            </figure>
          );
        }
        return (
          <p key={`p-${index}`}>
            <RichText content={block.content} />
          </p>
        );
      })}

      <h2 id={c.faqId} className="blog-h2">
        {c.faqHeading}
      </h2>
      <div className="blog-faq">
        {c.faqs.map((item) => (
          <section key={item.question} className="blog-faq-item">
            <h3 className="blog-h3">{item.question}</h3>
            <p>{item.answer}</p>
          </section>
        ))}
      </div>

      <h2 id={c.ctaId} className="blog-h2">
        {c.ctaTitle}
      </h2>
      {c.ctaParagraphs.map((paragraph, index) => (
        <p key={`cta-${index}`}>
          <RichText content={paragraph} />
        </p>
      ))}
      <div className="blog-cta-row">
        <Link href={c.ctaHref} className="landing-btn-primary">
          {c.ctaLabel}
        </Link>
      </div>
    </BlogArticleLayout>
  );
}
