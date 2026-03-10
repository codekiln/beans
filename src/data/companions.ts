import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

export type CompanionEntry = CollectionEntry<"companions">;

export const getCompanions = async () => {
  const entries = await getCollection("companions");
  return entries.sort((a, b) => {
    const orderCompare = a.data.order - b.data.order;
    if (orderCompare !== 0) return orderCompare;
    return a.data.name.localeCompare(b.data.name);
  });
};

export const getCompanionPath = (slug: string) => `/companion/${slug}/`;

export const getCompanionBySlug = async (slug: string) => {
  const companions = await getCompanions();
  return companions.find((companion) => companion.slug === slug) ?? null;
};
