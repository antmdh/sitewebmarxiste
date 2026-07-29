import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { locales, type Locale } from '../../lib/i18n';

export const prerender = true;
export function getStaticPaths() {
  return locales.map((locale) => ({ params: { locale } }));
}

export async function GET(context: APIContext) {
  const locale = context.params.locale as Locale;
  const articles = (
    await getCollection('articles', ({ data }) => data.locale === locale && !data.draft)
  ).sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());
  return rss({
    title: `Marxist Games — ${locale.toUpperCase()}`,
    description: 'Jeux, histoire, politique et création collective.',
    site: context.site!,
    items: articles.map((article) => ({
      title: article.data.title,
      description: article.data.description,
      pubDate: article.data.publishedAt,
      link: `/${locale}/articles/${article.data.slug}/`,
    })),
    customData: `<language>${locale}</language>`,
  });
}
