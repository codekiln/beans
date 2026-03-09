import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

export type QuestionEntry = CollectionEntry<"questions">;

export const getQuestions = async () => {
  const entries = await getCollection("questions");
  return entries.sort((a, b) => {
    const dateCompare = b.data.dateCreated.localeCompare(a.data.dateCreated);
    if (dateCompare !== 0) return dateCompare;
    return a.slug.localeCompare(b.slug);
  });
};

export const getQuestionPath = (slug: string) => `/questions/${slug}/`;
