import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

export type BeanEntry = CollectionEntry<"beans">;
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
  return entries.sort(compareBeansByDate);
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
