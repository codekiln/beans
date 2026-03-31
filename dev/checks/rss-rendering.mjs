import { access, readFile } from "node:fs/promises";
import { join } from "node:path";

const resolveRssPath = async () => {
  const candidatePaths = [
    join(process.cwd(), "dist", "rss.xml"),
    join(process.cwd(), "dist", "beans", "rss.xml")
  ];

  for (const path of candidatePaths) {
    try {
      await access(path);
      return path;
    } catch {
      continue;
    }
  }

  throw new Error("RSS output file was not found in dist/.");
};

const rssPath = await resolveRssPath();
const xml = await readFile(rssPath, "utf8");
const decodeEntities = (value) =>
  value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
const extractTag = (block, tagName) => {
  const match = block.match(new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`));
  return match?.[1] ?? null;
};
const parseRssItems = (rssXml) => {
  const itemPattern = /<item>([\s\S]*?)<\/item>/g;
  const items = new Map();

  for (const match of rssXml.matchAll(itemPattern)) {
    const block = match[1];
    const link = decodeEntities(extractTag(block, "link") ?? "");
    const description = decodeEntities(extractTag(block, "description") ?? "");
    items.set(link, description);
  }

  return items;
};
const rssItems = parseRssItems(xml);

if (!xml.includes("Coffee buddy comment") || !xml.includes("Virtual companion note by Rin Vale")) {
  throw new Error("RSS feed is missing the expected persona buddy-comment markup.");
}

if (!xml.includes("This is a virtual companion comment, not the main post body.")) {
  throw new Error("RSS feed is missing the companion-note demarcation label.");
}

if (
  !xml.includes("earthy sweetness, beets. red.") ||
  !xml.includes("-- &lt;a href=&quot;https://codekiln.github.io/beans/companion/unicorn/&quot;&gt;🦄&lt;/a&gt;")
) {
  throw new Error("RSS feed did not render the inline companion comment into readable HTML.");
}

if (xml.includes("<CompanionComment") || xml.includes("import CompanionComment")) {
  throw new Error("RSS feed leaked MDX component syntax instead of rendered companion comment HTML.");
}

const march29 = rssItems.get("https://codekiln.github.io/beans/log/2026-03-29/");
if (
  !march29 ||
  !march29.startsWith(
    "<figure><img src=\"https://codekiln.github.io/beans/images/2026-03-29-sun-0520.jpg\""
  )
) {
  throw new Error("RSS feed did not promote the first March 29 body image into a preview figure.");
}

const march06 = rssItems.get("https://codekiln.github.io/beans/log/2026-03-06/");
if (
  !march06 ||
  !march06.startsWith(
    "<figure><img src=\"https://codekiln.github.io/beans/images/2026-03-06-cup1-notes.png\""
  )
) {
  throw new Error("RSS feed did not promote the first March 6 body image into a preview figure.");
}

const march21 = rssItems.get("https://codekiln.github.io/beans/log/2026-03-21/");
if (
  !march21 ||
  !march21.startsWith(
    "<figure><img src=\"https://codekiln.github.io/beans/images/2026-03-21-sat-0842.jpg\""
  )
) {
  throw new Error("RSS feed regressed the existing frontmatter preview image behavior.");
}

const january24 = rssItems.get("https://codekiln.github.io/beans/log/2026-01-24/");
if (!january24 || january24.includes("<img")) {
  throw new Error("RSS feed unexpectedly added an image to the January 24 no-image fixture.");
}

console.log("rss-rendering check passed");
