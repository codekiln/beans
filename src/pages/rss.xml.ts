import rss from "@astrojs/rss";
import { getBeans } from "../data/beans";
import { withBase } from "../utils/paths";

type BeanEntry = Awaited<ReturnType<typeof getBeans>>[number];

const toDate = (entry: BeanEntry) => new Date(`${entry.date}T${entry.time ?? "00:00"}`);
const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const renderInlineMarkdown = (value: string) => {
  const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  let output = "";
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(value)) !== null) {
    output += escapeHtml(value.slice(lastIndex, match.index));
    output += `<a href="${escapeHtml(match[2])}">${escapeHtml(match[1])}</a>`;
    lastIndex = match.index + match[0].length;
  }

  output += escapeHtml(value.slice(lastIndex));
  return output;
};

const renderList = (items: string[]) =>
  `<ul>${items.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</ul>`;

export const GET = async () => {
  const beans = await getBeans();
  const sortedBeans = [...beans].sort((a, b) => toDate(b).getTime() - toDate(a).getTime());
  const site = new URL(withBase("/"), import.meta.env.SITE);

  return rss({
    title: "Beans",
    description: "A coffee log rendered as a lab notebook.",
    site,
    items: sortedBeans.map((entry) => ({
      title: entry.title,
      pubDate: toDate(entry),
      description: [
        entry.image
          ? `<figure><img src="${new URL(withBase(entry.image.src), site)}" alt="${escapeHtml(
              entry.image.alt
            )}"></figure>`
          : "",
        "<h3>Observations</h3>",
        renderList(entry.observations),
        entry.brew.notes?.length ? "<h3>Brew notes</h3>" : "",
        entry.brew.notes?.length ? renderList(entry.brew.notes) : ""
      ].join(""),
      link: withBase(`log/${entry.slug}/`)
    }))
  });
};
