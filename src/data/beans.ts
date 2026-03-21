import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";
import { getContentSlug } from "./content-ids";

type BeanCollectionEntry = CollectionEntry<"beans">;
export type BeanEntry = BeanCollectionEntry & { slug: string };
export type BeanRouteInfo = {
  aliases: string[];
  commandText: string;
  displayLabel: string;
  legacyPath: string;
  legacySlug: string;
  path: string;
  publicSlug: string;
  titleLabel: string;
};

const compareBeansByDate = (a: BeanEntry, b: BeanEntry) => {
  const dateCompare = b.data.date.localeCompare(a.data.date);
  if (dateCompare !== 0) return dateCompare;
  const timeA = a.data.time ?? "";
  const timeB = b.data.time ?? "";
  return timeB.localeCompare(timeA);
};

const compareBeansWithinDate = (a: BeanEntry, b: BeanEntry) => {
  const timeCompare = (a.data.time ?? "").localeCompare(b.data.time ?? "");
  if (timeCompare !== 0) return timeCompare;
  return a.slug.localeCompare(b.slug);
};

const getTimeToken = (time: string | undefined) =>
  time
    ?.split(":")
    .slice(0, 2)
    .map((part) => part.padStart(2, "0"))
    .join("");

export const getBeans = async () => {
  const entries = await getCollection("beans");
  return entries.map((entry) => ({ ...entry, slug: getContentSlug(entry.id) })).sort(compareBeansByDate);
};

export const getBeanRouteInfoMap = (beans: BeanEntry[]) => {
  const beansByDate = new Map<string, BeanEntry[]>();

  beans.forEach((bean) => {
    const group = beansByDate.get(bean.data.date) ?? [];
    group.push(bean);
    beansByDate.set(bean.data.date, group);
  });

  const routeInfo = new Map<string, BeanRouteInfo>();

  beansByDate.forEach((group) => {
    const sortedGroup = [...group].sort(compareBeansWithinDate);
    const hasMultipleEntries = sortedGroup.length > 1;

    sortedGroup.forEach((bean, index) => {
      const disambiguator = hasMultipleEntries
        ? getTimeToken(bean.data.time) ?? String(index + 1)
        : null;
      const displayDisambiguator = hasMultipleEntries
        ? bean.data.time ?? String(index + 1)
        : null;
      const publicSlug = disambiguator ? `${bean.data.date}-${disambiguator}` : bean.data.date;
      const displayLabel = displayDisambiguator
        ? `${bean.data.date} ${displayDisambiguator}`
        : bean.data.date;

      routeInfo.set(bean.slug, {
        aliases:
          publicSlug === bean.slug
            ? [publicSlug]
            : [publicSlug, bean.slug],
        commandText: disambiguator
          ? `log ${bean.data.date} ${disambiguator}`
          : `log ${bean.data.date}`,
        displayLabel,
        legacyPath: `/log/${bean.slug}/`,
        legacySlug: bean.slug,
        path: `/log/${publicSlug}/`,
        publicSlug,
        titleLabel: `Bean ${displayLabel}`
      });
    });
  });

  return routeInfo;
};

export const getBeanRouteInfo = (bean: BeanEntry, beans: BeanEntry[]) => {
  const routeInfo = getBeanRouteInfoMap(beans).get(bean.slug);

  if (!routeInfo) {
    throw new Error(`Missing bean route info for ${bean.slug}`);
  }

  return routeInfo;
};

export const getAllTags = async () => {
  const beans = await getBeans();
  return Array.from(new Set(beans.flatMap((bean) => bean.data.tags))).sort();
};

export type InlineCompanionComment = {
  companion: string;
  body: string;
};

/**
 * Extract inline companion comments from bean content.
 * Matches <CompanionComment from="slug">body</CompanionComment> tags.
 */
export const extractInlineCompanionComments = (body: string): InlineCompanionComment[] => {
  const pattern = /<CompanionComment\s+from=["']([^"']+)["']\s*>([\s\S]*?)<\/CompanionComment>/g;
  const comments: InlineCompanionComment[] = [];
  let match;
  while ((match = pattern.exec(body)) !== null) {
    comments.push({
      companion: match[1],
      body: match[2].trim()
    });
  }
  return comments;
};

/**
 * Get unique companion slugs from inline comments in a bean's body.
 * Used for backreference lookups on companion pages.
 */
export const getInlineCompanionSlugs = (body: string): string[] => {
  const comments = extractInlineCompanionComments(body);
  return [...new Set(comments.map((c) => c.companion))];
};

/**
 * Check if a bean references a companion via inline comments or personaComment.
 * Deduplicates so a bean appears once per companion even with multiple inline comments.
 */
export const beanReferencesCompanion = (bean: BeanEntry, companionSlug: string): boolean => {
  if (bean.data.personaComment?.companion === companionSlug) {
    return true;
  }
  const inlineSlugs = getInlineCompanionSlugs(bean.body);
  return inlineSlugs.includes(companionSlug);
};

/**
 * Get all beans that reference a given companion (via personaComment or inline comments).
 */
export const getBeansForCompanion = (beans: BeanEntry[], companionSlug: string): BeanEntry[] => {
  return beans.filter((bean) => beanReferencesCompanion(bean, companionSlug));
};
