import { access, readFile } from "node:fs/promises";
import { join } from "node:path";

const candidatePaths = [
  join(process.cwd(), "dist", "log", "2026-02-06-bean1", "index.html"),
  join(process.cwd(), "dist", "beans", "log", "2026-02-06-bean1", "index.html")
];

let pagePath;
for (const path of candidatePaths) {
  try {
    await access(path);
    pagePath = path;
    break;
  } catch {
    continue;
  }
}

if (!pagePath) {
  throw new Error("Bean detail page output file was not found in dist/.");
}

const html = await readFile(pagePath, "utf8");

if (html.includes("BEAN 2026-02-06 / undefined") || html.includes("/ undefined")) {
  throw new Error("Bean detail page contains an undefined time placeholder.");
}

if (!html.includes("BEAN 2026-02-06")) {
  throw new Error("Bean detail page is missing the expected date-only header.");
}

console.log("bean-rendering check passed for 2026-02-06-bean1");
