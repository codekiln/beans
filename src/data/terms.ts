import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";
import { stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getContentSlug } from "./content-ids";
import { getBeanRouteInfoMap, type BeanEntry } from "./beans";
import type { CompanionEntry } from "./companions";
import type { EquipmentItem } from "./equipment";
import type { QuestionEntry } from "./questions";
import type { Recipe } from "./recipes";
import type { Coffee } from "./coffees";
import type { Roaster } from "./roasters";

type TermCollectionEntry = CollectionEntry<"terms">;
export type Term = TermCollectionEntry &
  TermCollectionEntry["data"] & {
    dateCreated: string;
    dateUpdated: string;
    slug: string;
  };
export type TermReference = {
  href: string;
  label: string;
  meta: string;
};

type ReferenceSource =
  | BeanEntry
  | Coffee
  | CompanionEntry
  | EquipmentItem
  | QuestionEntry
  | Recipe
  | Roaster;

const TERMS_DIR = fileURLToPath(new URL("../content/terms", import.meta.url));

const toDateString = (value: Date) => value.toISOString().slice(0, 10);

const getTermFileDates = async (id: string) => {
  const normalizedId = id.replace(/\.(md|mdx)$/i, "");
  const candidates = [
    path.join(TERMS_DIR, id),
    path.join(TERMS_DIR, `${normalizedId}.md`),
    path.join(TERMS_DIR, `${normalizedId}.mdx`)
  ];

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
      return { ...entry, ...entry.data, ...dates, slug: getContentSlug(entry.id) };
    })
  );

  return hydrated
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
};

const getTermReferencePattern = (termSlug: string) =>
  new RegExp(`/beans/terms/${termSlug}/(?=[)#\\s"'\\]|>]|$)`, "i");

const compareReferences = (a: TermReference, b: TermReference) => {
  const metaCompare = b.meta.localeCompare(a.meta, undefined, { sensitivity: "base" });
  if (metaCompare !== 0) return metaCompare;
  return a.label.localeCompare(b.label, undefined, { sensitivity: "base" });
};

const getBeanReferences = (beans: BeanEntry[], termSlug: string) => {
  const referencePattern = getTermReferencePattern(termSlug);
  const beanRouteInfo = getBeanRouteInfoMap(beans);

  return beans
    .filter((bean) => referencePattern.test(bean.body))
    .map((bean) => {
      const routeInfo = beanRouteInfo.get(bean.slug);

      return {
        href: routeInfo?.path ?? `/log/${bean.slug}/`,
        label: routeInfo?.displayLabel ?? bean.data.date,
        meta: `bean log ${routeInfo?.displayLabel ?? bean.data.date}`
      };
    });
};

const getCollectionReferences = <T extends ReferenceSource>(
  entries: T[],
  termSlug: string,
  options: {
    href: (entry: T) => string;
    label: (entry: T) => string;
    meta: (entry: T) => string;
  }
) => {
  const referencePattern = getTermReferencePattern(termSlug);

  return entries
    .filter((entry) => referencePattern.test(entry.body))
    .map((entry) => ({
      href: options.href(entry),
      label: options.label(entry),
      meta: options.meta(entry)
    }));
};

export const getTermReferences = async (termSlug: string) => {
  const [beans, companions, equipment, questions, recipes, roasters] = await Promise.all([
    getCollection("beans"),
    getCollection("companions"),
    getCollection("equipment"),
    getCollection("questions"),
    getCollection("recipes"),
    getCollection("roasters")
  ]);

  const beanEntries = beans.map((entry) => ({ ...entry, slug: getContentSlug(entry.id) }));
  const companionEntries = companions.map((entry) => ({ ...entry, slug: getContentSlug(entry.id) }));
  const equipmentEntries = equipment.map((entry) => ({
    ...entry,
    ...entry.data,
    slug: getContentSlug(entry.id)
  }));
  const questionEntries = questions.map((entry) => ({ ...entry, slug: getContentSlug(entry.id) }));
  const recipeEntries = recipes.map((entry) => ({
    ...entry,
    ...entry.data,
    slug: getContentSlug(entry.id)
  }));
  const roasterEntries = roasters.map((entry) => ({
    ...entry,
    ...entry.data,
    slug: getContentSlug(entry.id)
  }));
  const coffeeEntries = roasters
    .filter((entry) => !entry.id.endsWith("/roaster.md"))
    .map((entry) => ({
      ...entry,
      ...entry.data,
      slug: getContentSlug(entry.id),
      roaster: entry.id.split("/").at(-2) ?? ""
    }));
  const canonicalRoasters = roasterEntries.filter((entry) => entry.id.endsWith("/roaster.md"));

  return [
    ...getBeanReferences(beanEntries, termSlug),
    ...getCollectionReferences(companionEntries, termSlug, {
      href: (entry) => `/companion/${entry.slug}/`,
      label: (entry) => entry.data.name,
      meta: () => "companion"
    }),
    ...getCollectionReferences(equipmentEntries, termSlug, {
      href: (entry) => `/equipment/${entry.slug}/`,
      label: (entry) => entry.name,
      meta: (entry) => entry.type
    }),
    ...getCollectionReferences(questionEntries, termSlug, {
      href: (entry) => `/questions/${entry.slug}/`,
      label: (entry) => entry.data.title,
      meta: () => "question"
    }),
    ...getCollectionReferences(recipeEntries, termSlug, {
      href: (entry) => `/recipes/${entry.slug}/`,
      label: (entry) => entry.name,
      meta: () => "recipe"
    }),
    ...getCollectionReferences(canonicalRoasters, termSlug, {
      href: (entry) => `/roasters/${entry.slug}/`,
      label: (entry) => entry.name,
      meta: () => "roaster"
    }),
    ...getCollectionReferences(coffeeEntries, termSlug, {
      href: (entry) => `/coffees/${entry.slug}/`,
      label: (entry) => entry.name,
      meta: () => "coffee"
    })
  ].sort(compareReferences);
};
