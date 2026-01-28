import rss from "@astrojs/rss";
import { beans } from "../data/beans";
import { withBase } from "../utils/paths";

type BeanEntry = (typeof beans)[number];

const toDate = (entry: BeanEntry) => new Date(`${entry.date}T${entry.time ?? "00:00"}`);

export const GET = () => {
  const sortedBeans = [...beans].sort((a, b) => toDate(b).getTime() - toDate(a).getTime());

  return rss({
    title: "Beans",
    description: "A coffee log rendered as a lab notebook.",
    site: Astro.site,
    items: sortedBeans.map((entry) => ({
      title: entry.title,
      pubDate: toDate(entry),
      description: entry.observations?.[0] ?? entry.title,
      link: withBase(`/log/${entry.slug}/`)
    }))
  });
};
