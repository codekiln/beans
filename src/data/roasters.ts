import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

type RoasterEntry = CollectionEntry<"roasters">;
export type Roaster = RoasterEntry & RoasterEntry["data"] & { slug: string };

const isRoasterEntry = (entry: RoasterEntry) =>
  /(^|\/)roaster(\.md)?$/.test(entry.id) || /(^|\/)roaster$/.test(entry.slug);

const getRoasterSlug = (entry: RoasterEntry) => {
  const base = (entry.id.includes("/") ? entry.id : entry.slug).replace(/\/roaster(\.md)?$/, "");
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
