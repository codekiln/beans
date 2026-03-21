import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";
import { getContentSlug } from "./content-ids";

type QuestionCollectionEntry = CollectionEntry<"questions">;
export type QuestionEntry = QuestionCollectionEntry & { slug: string };

export const getQuestions = async () => {
  const entries = await getCollection("questions");
  return entries
    .map((entry) => ({ ...entry, slug: getContentSlug(entry.id) }))
    .sort((a, b) => {
      const dateCompare = b.data.dateCreated.localeCompare(a.data.dateCreated);
      if (dateCompare !== 0) return dateCompare;
      return a.slug.localeCompare(b.slug);
    });
};

export const getQuestionPath = (slug: string) => `/questions/${slug}/`;
