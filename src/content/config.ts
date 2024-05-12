import { z, defineCollection, type CollectionEntry } from 'astro:content';

const projectsCollection = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      enabled: z.boolean().default(false),
      title: z.string(),
      description: z.string(),
      seo: image().optional(),
      cover: image(),
      coverAlt: z.string(),
      altImages: z.array(image()).optional(),
      author: z.string().default('Fabian Kachlock'),
      year: z.string(),
      order: z.number(),
      seeAlso: z.array(z.string()).optional(),
      technologies: z.array(z.string()),
      socials: z
        .object({
          github: z.string().optional(),
          web: z.string().optional(),
          link: z.string().optional(),
        })
        .optional(),
    }),
});

export type ProjectEntry = CollectionEntry<'projects'>;

export const collections = {
  projects: projectsCollection,
};
