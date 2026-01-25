import { defineCollection, z } from "astro:content";

const journal = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.date(),
    brewMethod: z.string().optional(),
    gear: z.array(z.string()).optional(),
    recipe: z.string().optional(),
    tags: z.array(z.string()).default([]),
    mood: z.string().optional(),
    caffeineMg: z.number().optional(),
  }),
});

const gear = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    category: z.enum(["grinder", "brewer", "filter", "scale", "kettle", "other"]),
    notes: z.string().optional(),
  }),
});

const recipes = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    method: z.string(),
    ratio: z.string(),
    grind: z.string(),
    brewTime: z.string(),
    waterTemp: z.string(),
    steps: z.array(z.string()).optional(),
  }),
});

export const collections = { journal, gear, recipes };
