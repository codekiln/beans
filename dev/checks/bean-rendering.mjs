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

const basePagePath = await resolveBeanPagePath("2026-02-06");
const html = await readFile(basePagePath, "utf8");

if (html.includes("BEAN 2026-02-06 / undefined") || html.includes("/ undefined")) {
  throw new Error("Bean detail page contains an undefined time placeholder.");
}

if (!html.includes("bean log 2026-02-06")) {
  throw new Error("Bean detail page is missing the expected CLI prompt text.");
}

const legacyPagePath = await resolveBeanPagePath("2026-02-06-bean1");
const legacyHtml = await readFile(legacyPagePath, "utf8");

if (!legacyHtml.includes("/beans/log/2026-02-06/")) {
  throw new Error("Legacy bean path is missing the canonical single-entry bean route.");
}

const buddyPagePath = await resolveBeanPagePath("2026-03-05");
const buddyHtml = await readFile(buddyPagePath, "utf8");

if (
  !buddyHtml.includes("Coffee Buddy Comment") ||
  !buddyHtml.includes("Rin Vale") ||
  !buddyHtml.includes("wandering coffee connoisseur")
) {
  throw new Error("Bean detail page is missing the expected buddy comment metadata.");
}

console.log("bean-rendering check passed for 2026-02-06");
