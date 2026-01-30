import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

export type BeanEntry = CollectionEntry<"beans">;

export const getBeans = async () => {
  const entries = await getCollection("beans");
  return entries.sort((a, b) => {
    const dateCompare = b.data.date.localeCompare(a.data.date);
    if (dateCompare !== 0) return dateCompare;
    const timeA = a.data.time ?? "";
    const timeB = b.data.time ?? "";
    return timeB.localeCompare(timeA);
  });
};

export const getAllTags = async () => {
  const beans = await getBeans();
  return Array.from(new Set(beans.flatMap((bean) => bean.data.tags))).sort();
};
