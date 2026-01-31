import rss from "@astrojs/rss";
import { createMarkdownProcessor } from "@astrojs/markdown-remark";
import { getBeans } from "../data/beans";
import { withBase } from "../utils/paths";

type BeanEntry = Awaited<ReturnType<typeof getBeans>>[number];

const toDate = (entry: BeanEntry) => new Date(`${entry.data.date}T${entry.data.time ?? "00:00"}`);
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const GET = async () => {
  const markdown = await createMarkdownProcessor();
  const beans = await getBeans();
  const sortedBeans = [...beans].sort((a, b) => toDate(b).getTime() - toDate(a).getTime());
  const site = new URL(withBase("/"), import.meta.env.SITE);

  return rss({
    title: "Beans",
    description: "A coffee log rendered as a lab notebook.",
    site,
    items: await Promise.all(sortedBeans.map(async (entry) => {
      const content = (await markdown.render(entry.body)).code;

      return {
        title: entry.data.title,
        pubDate: toDate(entry),
        description: [
          entry.data.image
            ? `<figure><img src="${new URL(withBase(entry.data.image.src), site)}" alt="${escapeHtml(
                entry.data.image.alt
              )}"></figure>`
            : "",
          content
        ].join(""),
        link: withBase(`log/${entry.slug}/`)
      };
    }))
  });
};
