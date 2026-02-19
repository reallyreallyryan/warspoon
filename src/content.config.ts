import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const workshop = defineCollection({
  loader: glob({ pattern: '**/index.md', base: './src/content/workshop' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      tags: z.array(z.enum(['showcase', 'death-guard', 'recipe', 'painting', 'bases', '3d-printing', 'terrain', 'story', 'the-borrowed', 'kill-team', 'comic-book', 'mandrakes', 'download'])),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      images: z
        .array(
          z.object({
            src: image(),
            alt: z.string(),
          }),
        )
        .optional(),
      downloads: z
        .array(
          z.object({
            label: z.string(),
            url: z.string().url(),
            host: z.string().optional(),
          }),
        )
        .optional(),
      lastModified: z.coerce.date().optional(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { workshop };
