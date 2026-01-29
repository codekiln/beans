import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

type BeanEntry = CollectionEntry<"beans">;
export type Bean = BeanEntry["data"] & {
  slug: string;
  observations: string[];
  brew: BeanEntry["data"]["brew"] & { notes?: string[] };
};

const parseBeanBody = (body: string) => {
  const observations: string[] = [];
  const brewNotes: string[] = [];
  let section: "observations" | "brewNotes" | null = null;

  body.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("## ")) {
      const heading = trimmed.slice(3).toLowerCase();
      if (heading === "observations") {
        section = "observations";
      } else if (heading === "brew log" || heading === "brew notes") {
        section = "brewNotes";
      } else {
        section = null;
      }
      return;
    }

    const listMatch = /^[-*]\s+(.+)$/.exec(trimmed);
    if (!listMatch || !section) {
      return;
    }

    if (section === "observations") {
      observations.push(listMatch[1]);
      return;
    }

    if (section === "brewNotes") {
      brewNotes.push(listMatch[1]);
    }
  });

  return { observations, brewNotes };
};

export const getBeans = async () => {
  const entries = await getCollection("beans");
  return entries
    .map((entry) => {
      const { observations, brewNotes } = parseBeanBody(entry.body ?? "");
      return {
        ...entry.data,
        observations,
        brew: {
          ...entry.data.brew,
          notes: brewNotes.length ? brewNotes : undefined
        },
        slug: entry.slug
      };
    })
    .sort((a, b) => a.order - b.order);
};

export const getAllTags = async () => {
  const beans = await getBeans();
  return Array.from(new Set(beans.flatMap((bean) => bean.tags))).sort();
};
