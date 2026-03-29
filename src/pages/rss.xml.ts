import rss from "@astrojs/rss";
import { createMarkdownProcessor } from "@astrojs/markdown-remark";
import { extractInlineCompanionComments, getBeanRouteInfoMap, getBeans } from "../data/beans";
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
const inlineCommentStyle = [
  "margin:0.85em 0",
  "padding:0.65em 0.85em",
  "border-left:3px solid #8c6b3c",
  "background:#faf6ed",
  "color:#2b2118"
].join(";");
const stripMdxFrontmatterImports = (body: string) =>
  body.replace(/^(?:import|export)\s.+$/gm, "").replace(/\n{3,}/g, "\n\n").trim();
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

const renderInlineCompanionComment = async (
  companionSlug: string,
  commentBody: string,
  site: URL
) => {
  const companion = await getCompanionBySlug(companionSlug);
  const name = companion?.data.name ?? companionSlug;
  const companionLink = companion
    ? new URL(withBase(getCompanionPath(companion.slug)), site).toString()
    : null;
  const attribution = companionLink
    ? `<a href="${companionLink}">${escapeHtml(name)}</a>`
    : escapeHtml(name);
  return [
    `<blockquote style="${inlineCommentStyle}">`,
    `<p style="margin:0;font-style:italic;">${escapeHtml(commentBody)}</p>`,
    `<footer style="margin-top:0.45em;font-size:0.88em;color:#6b4b36;">-- ${attribution}</footer>`,
    "</blockquote>"
  ].join("");
};

const transformInlineComments = async (body: string, site: URL) => {
  const bodyWithoutImports = stripMdxFrontmatterImports(body);
  const comments = extractInlineCompanionComments(bodyWithoutImports);
  let result = bodyWithoutImports;

  for (const comment of comments) {
    const rendered = await renderInlineCompanionComment(comment.companion, comment.body, site);
    const escapedBody = comment.body.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\n/g, "\\s*");
    const pattern = new RegExp(
      `<CompanionComment\\b[^>]*\\bfrom=["']${comment.companion}["'][^>]*>\\s*${escapedBody}\\s*</CompanionComment>`,
      "g"
    );
    result = result.replace(pattern, rendered);
  }

  return result;
};

export const GET = async () => {
  const markdown = await createMarkdownProcessor();
  const beans = await getBeans();
  const beanRouteInfo = getBeanRouteInfoMap(beans);
  const sortedBeans = [...beans].sort((a, b) => toDate(b).getTime() - toDate(a).getTime());
  const site = new URL(withBase("/"), import.meta.env.SITE);

  return rss({
    title: "Beans",
    description: "A coffee log and knowledge garden.",
    site,
    items: await Promise.all(sortedBeans.map(async (entry) => {
      const bodyWithInlineComments = await transformInlineComments(entry.body, site);
      const content = (await markdown.render(bodyWithInlineComments)).code;

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
        link: withBase(beanRouteInfo.get(entry.slug)?.path ?? `/log/${entry.slug}/`)
      };
    }))
  });
};
