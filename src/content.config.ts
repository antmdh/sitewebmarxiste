import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const locale = z.enum(['fr', 'en', 'es', 'de']);
const category = z.enum([
  'devlog',
  'marxist-games',
  'marxism-games',
  'history',
  'tutorials',
  'association-news',
]);
const fileId = ({ entry }: { entry: string }) => entry.replace(/\.(md|mdx)$/, '');

const games = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/games', generateId: fileId }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      subtitle: z.string(),
      slug: z.string(),
      locale,
      translationKey: z.string(),
      developmentStatus: z.string(),
      platforms: z.array(z.string()),
      genre: z.string(),
      historicalPeriod: z.string(),
      description: z.string(),
      category: z.literal('game'),
      publishedAt: z.coerce.date(),
      heroImage: image(),
      heroAlt: z.string(),
      gallery: z
        .array(z.object({ image: image(), alt: z.string(), caption: z.string() }))
        .default([]),
      devlogUrl: z.string().optional(),
      downloadUrl: z.string().url().optional(),
      ctaLabel: z.string(),
      updatedAt: z.coerce.date(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles', generateId: fileId }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      slug: z.string(),
      locale,
      translationKey: z.string(),
      description: z.string(),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      heroImage: image().optional(),
      heroAlt: z.string().optional(),
      category,
      relatedGame: z.string().optional(),
      author: z.string(),
      draft: z.boolean().default(false),
      featured: z.boolean().default(false),
    }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages', generateId: fileId }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    locale,
    translationKey: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    category: z.string(),
    draft: z.boolean().default(false),
  }),
});

const authors = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/authors', generateId: fileId }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    locale,
    translationKey: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    category: z.string(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { games, articles, pages, authors };
