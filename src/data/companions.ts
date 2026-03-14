import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

export type CompanionEntry = CollectionEntry<"companions">;
export type CompanionPortrait = {
  src: string;
  darkSrc?: string;
  alt: string;
};

const DEFAULT_COMPANION_PORTRAIT = {
  src: "/images/companion-placeholder-portrait.svg",
  darkSrc: "/images/companion-placeholder-portrait-dark.svg"
} as const;

export const getCompanions = async () => {
  const entries = await getCollection("companions");
  return entries.sort((a, b) => {
    const orderCompare = a.data.order - b.data.order;
    if (orderCompare !== 0) return orderCompare;
    return a.data.name.localeCompare(b.data.name);
  });
};

export const getCompanionPath = (slug: string) => `/companion/${slug}/`;

export const getCompanionPortrait = (
  companion: Pick<CompanionEntry["data"], "name" | "portrait">
): CompanionPortrait => {
  const fallbackAlt = `Placeholder portrait pattern for ${companion.name}, awaiting custom field sketch.`;
  return companion.portrait ?? {
    ...DEFAULT_COMPANION_PORTRAIT,
    alt: fallbackAlt
  };
};

export const getCompanionBySlug = async (slug: string) => {
  const companions = await getCompanions();
  return companions.find((companion) => companion.slug === slug) ?? null;
};
