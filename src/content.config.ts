import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const workshop = defineCollection({
  loader: glob({ pattern: '**/index.md', base: './src/content/workshop' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      tags: z.array(z.string()),
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
      draft: z.boolean().default(false),
    }),
});

export const collections = { workshop };
