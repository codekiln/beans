import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";
import { getContentSlug } from "./content-ids";

type SpanCollectionEntry = CollectionEntry<"spans">;
export type SpanEntry = SpanCollectionEntry & { slug: string };

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC"
});

const parseDate = (date: string) => new Date(`${date}T00:00:00Z`);

const compareSpans = (a: SpanEntry, b: SpanEntry) => {
  const endA = a.data.endDate ?? "9999-12-31";
  const endB = b.data.endDate ?? "9999-12-31";
  const endCompare = endB.localeCompare(endA);

  if (endCompare !== 0) return endCompare;

  const startCompare = b.data.startDate.localeCompare(a.data.startDate);
  if (startCompare !== 0) return startCompare;

  return a.data.name.localeCompare(b.data.name, undefined, { sensitivity: "base" });
};

export const getSpans = async () => {
  const entries = await getCollection("spans");
  return entries.map((entry) => ({ ...entry, slug: getContentSlug(entry.id) })).sort(compareSpans);
};

export const getSpanPath = (slug: string) => `/spans/${slug}/`;

export const formatSpanDate = (date: string) => DATE_FORMATTER.format(parseDate(date));

export const getSpanDayCount = (span: SpanEntry) => {
  if (!span.data.endDate) {
    return null;
  }

  const dayMs = 24 * 60 * 60 * 1000;
  const diff = parseDate(span.data.endDate).getTime() - parseDate(span.data.startDate).getTime();
  return Math.floor(diff / dayMs) + 1;
};

export const getSpanRangeLabel = (span: SpanEntry) => {
  const start = formatSpanDate(span.data.startDate);

  if (!span.data.endDate) {
    return `Started ${start}`;
  }

  const dayCount = getSpanDayCount(span);
  const durationLabel = dayCount === 1 ? "1 day" : `${dayCount} days`;

  return `${start} - ${formatSpanDate(span.data.endDate)} (${durationLabel})`;
};

export const getSpanStatusLabel = (span: SpanEntry) => (span.data.endDate ? "closed" : "open");

export const getSpanRoastDateLabel = (span: SpanEntry) =>
  span.data.roastDate ? `Roasted ${formatSpanDate(span.data.roastDate)}` : null;

export const getSpanSubjectPath = (span: SpanEntry) => {
  if (!span.data.subject) {
    return null;
  }

  const { kind, slug } = span.data.subject;

  if (kind === "coffee") {
    return `/coffees/${slug}/`;
  }

  if (kind === "equipment") {
    return `/equipment/${slug}/`;
  }

  return `/roasters/${slug}/`;
};
