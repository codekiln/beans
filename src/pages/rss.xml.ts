import rss from "@astrojs/rss";
import { getBeans } from "../data/beans";
import { withBase } from "../utils/paths";
import sanitizeHtml from "sanitize-html";
import MarkdownIt from "markdown-it";

const parser = new MarkdownIt();

type BeanEntry = Awaited<ReturnType<typeof getBeans>>[number];

const toDate = (entry: BeanEntry) => new Date(`${entry.data.date}T${entry.data.time ?? "00:00"}`);

export const GET = async () => {
  const beans = await getBeans();
  const sortedBeans = [...beans].sort((a, b) => toDate(b).getTime() - toDate(a).getTime());
  const site = new URL(withBase("/"), import.meta.env.SITE);

  return rss({
    title: "Beans",
    description: "A coffee log rendered as a lab notebook.",
    site,
    items: sortedBeans.map((entry) => {
      const content = parser.render(entry.body);
      
      return {
        title: entry.data.title,
        pubDate: toDate(entry),
        description: [
          entry.data.image
            ? `<figure><img src="${new URL(withBase(entry.data.image.src), site)}" alt="${sanitizeHtml(
                entry.data.image.alt
              )}"></figure>`
            : "",
          content
        ].join(""),
        link: withBase(`log/${entry.slug}/`)
      };
    })
  });
};
