import rss from "@astrojs/rss";
import { createMarkdownProcessor } from "@astrojs/markdown-remark";
import { getBeans } from "../data/beans";
import { getCompanionBySlug, getCompanionPath } from "../data/companions";
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
const renderParagraphs = (value: string) =>
  value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
const companionShellStyle = [
  "margin:1.5em 0 0",
  "padding:1em",
  "border:1px solid #8c6b3c",
  "background:#f8f1e3",
  "color:#2b2118"
].join(";");
const companionBlockquoteStyle = [
  "margin:0.85em 0 0",
  "padding:0 0 0 0.9em",
  "border-left:3px solid #8c6b3c"
].join(";");
const renderBuddyComment = async (entry: BeanEntry, site: URL) => {
  if (!entry.data.personaComment) {
    return "";
  }

  const { body, companion: companionRef } = entry.data.personaComment;
  const companion = await getCompanionBySlug(companionRef);
  const name = companion?.data.name ?? "Virtual companion";
  const title = companion?.data.title ?? "";
  const companionLink = companion
    ? new URL(withBase(getCompanionPath(companion.slug)), site).toString()
    : null;
  return [
    `<aside aria-label="Virtual companion note" style="${companionShellStyle}">`,
    "<header>",
    "<p><strong>[ Virtual companion note ]</strong> This is a virtual companion comment, not the main post body.</p>",
    "<h2 style=\"margin:0;font-size:1rem;line-height:1.4;\">Coffee buddy comment</h2>",
    `<p style="margin:0.35em 0 0;"><strong>From:</strong> ${escapeHtml(name)}<br><span>${escapeHtml(title)}</span></p>`,
    "</header>",
    `<blockquote aria-label="Quoted companion comment from ${escapeHtml(name)}" style="${companionBlockquoteStyle}">${renderParagraphs(body)}</blockquote>`,
    companionLink
      ? `<p style="margin:0.75em 0 0;"><cite><a href="${companionLink}">Virtual companion note by ${escapeHtml(name)}</a></cite></p>`
      : `<p style="margin:0.75em 0 0;"><cite>Virtual companion note by ${escapeHtml(name)}</cite></p>`,
    "</aside>"
  ].join("");
};

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
          content,
          await renderBuddyComment(entry, site)
        ].join(""),
        link: withBase(`log/${entry.slug}/`)
      };
    }))
  });
};
