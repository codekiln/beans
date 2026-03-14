import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

export default defineConfig({
  site: "https://codekiln.github.io/beans/",
  base: "/beans/",
  integrations: [mdx()]
});
