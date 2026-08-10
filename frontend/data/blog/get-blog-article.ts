import { BLOG_ARTICLE_SMART_FOOD } from './plantilla-smart-food-filtros-alimentarios';
import { BLOG_ARTICLE_SMART_FOOD_EN } from './plantilla-smart-food-filtros-alimentarios.en';
import type { BlogUiLocale } from '../../lib/blog-nav';

export function getBlogArticleSmartFood(locale: BlogUiLocale) {
  return locale === 'en' ? BLOG_ARTICLE_SMART_FOOD_EN : BLOG_ARTICLE_SMART_FOOD;
}
