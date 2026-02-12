import { defineCollection, z } from "astro:content";

const beans = defineCollection({
  type: "content",
  schema: z.object({
    id: z.string(),
    beanKey: z.string(),
    date: z.string(),
    time: z.string().optional(),
    title: z.string(),
    tags: z.array(z.string()),
    image: z
      .object({
        src: z.string(),
        alt: z.string()
      })
      .optional(),
    coffee: z.object({
      roaster: z
        .object({
          name: z.string(),
          slug: z.string()
        })
        .optional(),
      roast: z
        .object({
          name: z.string(),
          slug: z.string()
        })
        .optional(),
      roastLevel: z.string().optional(),
      profile: z.string().optional(),
      blend: z.string().optional()
    }),
    brew: z.object({
      brewer: z
        .object({
          name: z.string(),
          slug: z.string()
        })
        .optional(),
      method: z.string().optional(),
      recipe: z
        .object({
          name: z.string(),
          slug: z.string()
        })
        .optional()
    }),
    brewDetails: z.object({
      dose: z.string().optional(),
      water: z.string().optional(),
      ratio: z.string().optional(),
      grinder: z
        .object({
          name: z.string(),
          slug: z.string()
        })
        .optional(),
      grind: z.string().optional(),
      setting: z.string().optional(),
      temp: z.string().optional(),
      release: z.string().optional(),
      total: z.string().optional(),
      time: z.string().optional()
    }),
    gear: z
      .array(
        z.object({
          label: z.string(),
          value: z.string(),
          slug: z.string().optional()
        })
      )
      .optional()
  })
});

const recipes = defineCollection({
  type: "content",
  schema: z.object({
    name: z.string(),
    summary: z.string(),
    image: z
      .object({
        src: z.string(),
        alt: z.string()
      })
      .optional(),
    gear: z
      .array(
        z.object({
          label: z.string(),
          value: z.string(),
          slug: z.string().optional()
        })
      )
      .optional(),
    order: z.number()
  })
});

const equipment = defineCollection({
  type: "content",
  schema: z.object({
    name: z.string(),
    type: z.string(),
    cost: z.number().nullable().optional(),
    purchaseDate: z.string().nullable().optional(),
    aliases: z
      .array(
        z.object({
          slug: z.string(),
          name: z.string()
        })
      )
      .optional(),
    references: z
      .array(
        z.object({
          label: z.string(),
          url: z.string()
        })
      )
      .optional(),
    image: z
      .object({
        src: z.string(),
        alt: z.string()
      })
      .optional(),
    related: z.array(z.string()),
    order: z.number()
  })
});

const roasters = defineCollection({
  type: "content",
  schema: z.union([
    z.object({
      name: z.string(),
      image: z
        .object({
          src: z.string(),
          alt: z.string()
        })
        .optional(),
      order: z.number()
    }),
    z.object({
      name: z.string(),
      image: z
        .object({
          src: z.string(),
          alt: z.string()
        })
        .optional(),
      roastLevel: z.string().optional(),
      profile: z.string().optional(),
      blend: z.string().optional()
    })
  ])
});

export const collections = { beans, recipes, equipment, roasters };
