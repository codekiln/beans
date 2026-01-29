import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

type RecipeEntry = CollectionEntry<"recipes">;
export type Recipe = RecipeEntry["data"] & { slug: string };

export const getRecipes = async () => {
  const entries = await getCollection("recipes");
  return entries
    .map((entry) => ({ ...entry.data, slug: entry.slug }))
    .sort((a, b) => a.order - b.order);
};
