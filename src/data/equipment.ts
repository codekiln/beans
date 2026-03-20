import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

type EquipmentCollectionEntry = CollectionEntry<"equipment">;
export type EquipmentItem = EquipmentCollectionEntry & EquipmentCollectionEntry["data"] & { slug: string };

export const getEquipment = async () => {
  const entries = await getCollection("equipment");
  return entries
    .map((entry) => ({ ...entry, ...entry.data, slug: entry.id }))
    .sort((a, b) => a.order - b.order);
};

export const getEquipmentTypes = async () => {
  const equipment = await getEquipment();
  return Array.from(new Set(equipment.map((item) => item.type))).sort();
};
