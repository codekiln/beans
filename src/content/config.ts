import { defineCollection, z } from 'astro:content';

const journal = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    mood: z.string().optional(),
    brew: z.string().optional(),
    gear: z.array(z.string()).optional(),
    recipe: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

const gear = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    category: z.enum(['grinder', 'brewer', 'filter', 'scale', 'kettle', 'other']),
    acquired: z.coerce.date().optional(),
    notes: z.string().optional(),
  }),
});

const recipes = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    brewMethod: z.string(),
    ratio: z.string(),
    grind: z.string(),
    waterTemp: z.string(),
    time: z.string(),
    yield: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { journal, gear, recipes };
