import { access, readFile } from "node:fs/promises";
import { join } from "node:path";

const resolveBeanPagePath = async (slug) => {
  const candidatePaths = [
    join(process.cwd(), "dist", "log", slug, "index.html"),
    join(process.cwd(), "dist", "beans", "log", slug, "index.html")
  ];

  for (const path of candidatePaths) {
    try {
      await access(path);
      return path;
    } catch {
      continue;
    }
  }

  throw new Error(`Bean detail page output file was not found for ${slug} in dist/.`);
};

const basePagePath = await resolveBeanPagePath("2026-02-06-bean1");
const html = await readFile(basePagePath, "utf8");

if (html.includes("BEAN 2026-02-06 / undefined") || html.includes("/ undefined")) {
  throw new Error("Bean detail page contains an undefined time placeholder.");
}

if (!html.includes("bean log 2026-02-06 bean1")) {
  throw new Error("Bean detail page is missing the expected CLI prompt text.");
}

const personaPagePath = await resolveBeanPagePath("2026-03-05-bean1");
const personaHtml = await readFile(personaPagePath, "utf8");

if (!personaHtml.includes("Rin Vale") || !personaHtml.includes("Campfire Cupping Companion")) {
  throw new Error("Bean detail page is missing the expected persona comment metadata.");
}

console.log("bean-rendering check passed for 2026-02-06-bean1");
