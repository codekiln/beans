import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import { markdownProcessor } from "./src/utils/markdown";

export default defineConfig({
  site: "https://codekiln.github.io/beans/",
  base: "/beans/",
  markdown: {
    processor: markdownProcessor
  },
  integrations: [mdx()]
});
