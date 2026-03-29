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

console.log("rss-rendering check passed");
