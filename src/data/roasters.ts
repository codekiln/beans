import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";
import { getContentPathSegments } from "./content-ids";

type RoasterCollectionEntry = CollectionEntry<"roasters">;
export type Roaster = RoasterCollectionEntry & RoasterCollectionEntry["data"] & { slug: string };

const isRoasterEntry = (entry: RoasterCollectionEntry) => {
  const segments = getContentPathSegments(entry.id);
  return segments[segments.length - 1] === "roaster";
};

const getRoasterSlug = (entry: RoasterCollectionEntry) => {
  const segments = getContentPathSegments(entry.id).filter((segment) => segment !== "roaster");
  return segments[segments.length - 1] ?? "";
};

export const getRoasters = async () => {
  const entries = await getCollection("roasters");
  return entries
    .filter((entry) => isRoasterEntry(entry))
    .map((entry) => ({ ...entry, ...entry.data, slug: getRoasterSlug(entry) }))
    .sort((a, b) => a.order - b.order);
};
