import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";
import { stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

type TermEntry = CollectionEntry<"terms">;
export type Term = TermEntry &
  TermEntry["data"] & {
    dateCreated: string;
    dateUpdated: string;
  };

const TERMS_DIR = fileURLToPath(new URL("../content/terms", import.meta.url));

const toDateString = (value: Date) => value.toISOString().slice(0, 10);

const getTermFileDates = async (id: string) => {
  const candidates = [path.join(TERMS_DIR, `${id}.md`), path.join(TERMS_DIR, `${id}.mdx`)];

  for (const candidate of candidates) {
    try {
      const stats = await stat(candidate);
      const created = stats.birthtimeMs > 0 ? stats.birthtime : stats.ctime;
      return {
        dateCreated: toDateString(created),
        dateUpdated: toDateString(stats.mtime)
      };
    } catch {
      // Try next extension.
    }
  }

  return {
    dateCreated: "",
    dateUpdated: ""
  };
};

export const getTerms = async () => {
  const entries = await getCollection("terms");
  const hydrated = await Promise.all(
    entries.map(async (entry) => {
      const dates = await getTermFileDates(entry.id);
      return { ...entry, ...entry.data, ...dates };
    })
  );

  return hydrated
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
};
