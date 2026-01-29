import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

type RecipeEntry = CollectionEntry<"recipes">;
export type Recipe = RecipeEntry["data"] & { slug: string; steps: string[] };

const parseRecipeBody = (body: string) => {
  const steps: string[] = [];

  body.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return;
    }

    const listMatch = /^[-*]\s+(.+)$/.exec(trimmed);
    if (listMatch) {
      steps.push(listMatch[1]);
      return;
    }

    const orderedMatch = /^\d+\.\s+(.+)$/.exec(trimmed);
    if (orderedMatch) {
      steps.push(orderedMatch[1]);
    }
  });

  return steps;
};

export const getRecipes = async () => {
  const entries = await getCollection("recipes");
  return entries
    .map((entry) => ({ ...entry.data, steps: parseRecipeBody(entry.body ?? ""), slug: entry.slug }))
    .sort((a, b) => a.order - b.order);
};
