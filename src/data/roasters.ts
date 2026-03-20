import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

type RoasterCollectionEntry = CollectionEntry<"roasters">;
export type Roaster = RoasterCollectionEntry & RoasterCollectionEntry["data"] & { slug: string };

const isRoasterEntry = (entry: RoasterCollectionEntry) => /(^|\/)roaster$/.test(entry.id);

const getRoasterSlug = (entry: RoasterCollectionEntry) => {
  const base = entry.id.replace(/\/roaster$/, "");
  const segments = base.split("/").filter(Boolean);
  return segments[segments.length - 1] ?? "";
};

export const getRoasters = async () => {
  const entries = await getCollection("roasters");
  return entries
    .filter((entry) => isRoasterEntry(entry))
    .map((entry) => ({ ...entry, ...entry.data, slug: getRoasterSlug(entry) }))
    .sort((a, b) => a.order - b.order);
};
