import { Fragment } from 'react';
import Link from 'next/link';
import BlogArticleLayout from './BlogArticleLayout';
import OptimizedPicture from '../OptimizedPicture';
import {
  getBlogArticleVentajasMenuQr,
  type BlogInline,
} from '../../data/blog/ventajas-menu-qr-dinamico';
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
        if ('em' in part) return <em key={index}>{part.em}</em>;
        return (
          <Link key={index} href={part.href}>
            {part.link}
          </Link>
        );
      })}
    </>
  );
}

function inlineToText(content: BlogInline[]): string {
  return content
    .map((part) => {
      if (typeof part === 'string') return part;
      if ('strong' in part) return part.strong;
      if ('em' in part) return part.em;
      return part.link;
    })
    .join('');
}

export default function BlogArticleVentajasMenuQr({ locale = 'es' }: Props) {
  const c = getBlogArticleVentajasMenuQr(locale);
  const meta = getBlogArticleMeta('ventajas-menu-qr-dinamico')!;

  return (
    <BlogArticleLayout
      meta={meta}
      locale={locale}
      faq={c.faqs.map((item) => ({
        question: item.question,
        answer: inlineToText(item.answer),
      }))}
    >
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
            <h3 key={`${block.text}-${index}`} className="blog-h3" id={block.id}>
              {block.text}
            </h3>
          );
        }
        if (block.type === 'ul') {
          return (
            <ul key={`ul-${index}`} className="blog-bullets">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <RichText content={item} />
                </li>
              ))}
            </ul>
          );
        }
        if (block.type === 'table') {
          return (
            <div key={`table-${index}`} className="blog-table-wrap">
              <table className="blog-table">
                <thead>
                  <tr>
                    {block.headers.map((header) => (
                      <th key={header} scope="col">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row) => (
                    <tr key={row.join('|')}>
                      {row.map((cell, cellIndex) => (
                        <td key={`${cell}-${cellIndex}`}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        if (block.type === 'note') {
          return (
            <aside key={`note-${index}`} className="blog-callout">
              <p>
                <RichText content={block.content} />
              </p>
            </aside>
          );
        }
        if (block.type === 'image') {
          return (
            <figure key={`image-${index}`} className="blog-figure">
              <OptimizedPicture
                src={block.src}
                alt={block.alt}
                width={block.width}
                height={block.height}
                loading="lazy"
              />
              {block.caption ? (
                <figcaption className="blog-figure-caption">{block.caption}</figcaption>
              ) : null}
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
            <p>
              <RichText content={item.answer} />
            </p>
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
