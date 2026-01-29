import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

type CoffeeEntry = CollectionEntry<"coffees">;
export type Coffee = CoffeeEntry & CoffeeEntry["data"];

export const getCoffees = async () => {
  const entries = await getCollection("coffees");
  return entries
    .map((entry) => ({ ...entry, ...entry.data, slug: entry.slug }))
    .sort((a, b) => a.name.localeCompare(b.name));
};
