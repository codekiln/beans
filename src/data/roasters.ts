import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

type RoasterEntry = CollectionEntry<"roasters">;
export type Roaster = RoasterEntry & RoasterEntry["data"];

export const getRoasters = async () => {
  const entries = await getCollection("roasters");
  return entries
    .map((entry) => ({ ...entry, ...entry.data, slug: entry.slug }))
    .sort((a, b) => a.order - b.order);
};
