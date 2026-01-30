import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

type RoasterEntry = CollectionEntry<"roasters">;
type CoffeeEntry = RoasterEntry & RoasterEntry["data"];
export type Coffee = CoffeeEntry & { roaster: string; slug: string };

const isRoasterEntry = (entry: RoasterEntry) =>
  /(^|\/)roaster(\.md)?$/.test(entry.id) || /(^|\/)roaster$/.test(entry.slug);

const getPathSegments = (entry: RoasterEntry) =>
  (entry.id.includes("/") ? entry.id : entry.slug).replace(/\.md$/, "").split("/").filter(Boolean);

const getRoasterSlug = (entry: RoasterEntry) => {
  const segments = getPathSegments(entry);
  return segments.length >= 2 ? segments[segments.length - 2] : segments[0] ?? "";
};

const getCoffeeSlug = (entry: RoasterEntry) => {
  if (entry.slug?.includes("/")) return entry.slug;
  const segments = getPathSegments(entry);
  if (segments.length >= 2) {
    return `${segments[segments.length - 2]}/${segments[segments.length - 1]}`;
  }
  return entry.slug ?? entry.id.replace(/\.md$/, "");
};

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
