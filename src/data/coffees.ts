import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

type RoasterCollectionEntry = CollectionEntry<"roasters">;
type CoffeeEntry = RoasterCollectionEntry & RoasterCollectionEntry["data"];
export type Coffee = CoffeeEntry & { roaster: string; slug: string };

const isRoasterEntry = (entry: RoasterCollectionEntry) => /(^|\/)roaster$/.test(entry.slug);

const getPathSegments = (entry: RoasterCollectionEntry) => entry.slug.split("/").filter(Boolean);

const getRoasterSlug = (entry: RoasterCollectionEntry) => {
  const segments = getPathSegments(entry);
  return segments.length >= 2 ? segments[segments.length - 2] : segments[0] ?? "";
};

const getCoffeeSlug = (entry: RoasterCollectionEntry) => entry.slug;

export const getCoffees = async () => {
  const entries = await getCollection("roasters");
  return entries
    .filter((entry) => !isRoasterEntry(entry))
    .map((entry) => ({
      ...entry,
      ...entry.data,
      slug: getCoffeeSlug(entry),
      roaster: getRoasterSlug(entry)
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};
