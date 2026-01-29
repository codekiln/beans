import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

type EquipmentEntry = CollectionEntry<"equipment">;
export type EquipmentItem = EquipmentEntry["data"] & { slug: string };

export const getEquipment = async () => {
  const entries = await getCollection("equipment");
  return entries
    .map((entry) => ({ ...entry.data, slug: entry.slug }))
    .sort((a, b) => a.order - b.order);
};

export const getEquipmentTypes = async () => {
  const equipment = await getEquipment();
  return Array.from(new Set(equipment.map((item) => item.type))).sort();
};
