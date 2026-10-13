import { satteri } from "@astrojs/markdown-satteri";

// The site's Markdown processor. astro.config.mjs sets it as `markdown.processor`
// for pages, and src/pages/rss.xml.ts renders feed items with it, so smart quotes,
// dashes and GFM come out the same on the page and in the feed.
export const markdownProcessor = satteri();
