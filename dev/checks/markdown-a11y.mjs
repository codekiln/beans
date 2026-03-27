import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const CONTENT_DIRECTORIES = [
  "src/content/beans",
  "src/content/equipment",
  "src/content/roasters",
  "src/content/recipes"
];

const MARKDOWN_EXTENSION_PATTERN = /\.(md|mdx)$/i;
const CODE_FENCE_PATTERN = /^(```|~~~)/;
const HEADING_PATTERN = /^(#{1,6})\s+(.*)$/;
const IMAGE_PATTERN = /!\[([^\]]*)\]\(([^)]+)\)/g;

const walkMarkdownFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return walkMarkdownFiles(absolutePath);
    }

    if (entry.isFile() && MARKDOWN_EXTENSION_PATTERN.test(entry.name)) {
      return [absolutePath];
    }

    return [];
  }));

  return files.flat();
};

const stripFrontmatter = (source) => {
  if (!source.startsWith("---\n")) {
    return source;
  }

  const closingIndex = source.indexOf("\n---\n", 4);
  if (closingIndex === -1) {
    return source;
  }

  return source.slice(closingIndex + 5);
};

const analyzeMarkdown = (filePath, source) => {
  const issues = [];
  const lines = stripFrontmatter(source).split("\n");
  let inCodeFence = false;
  let previousHeadingLevel = null;

  lines.forEach((line, index) => {
    if (CODE_FENCE_PATTERN.test(line.trim())) {
      inCodeFence = !inCodeFence;
      return;
    }

    if (inCodeFence) {
      return;
    }

    const headingMatch = line.match(HEADING_PATTERN);
    if (headingMatch) {
      const headingLevel = headingMatch[1].length;

      if (headingLevel === 1) {
        issues.push(`${filePath}:${index + 1} Heading levels in markdown bodies must start at H2, not H1.`);
      } else if (headingLevel > 3) {
        issues.push(
          `${filePath}:${index + 1} Heading level H${headingLevel} is too deep; use H2 for sections and H3 for subsections.`
        );
      } else if (previousHeadingLevel === null && headingLevel !== 2) {
        issues.push(`${filePath}:${index + 1} First markdown heading must be H2.`);
      } else if (previousHeadingLevel !== null && headingLevel > previousHeadingLevel + 1) {
        issues.push(
          `${filePath}:${index + 1} Heading level jumps from H${previousHeadingLevel} to H${headingLevel}.`
        );
      }

      previousHeadingLevel = headingLevel;
    }

    for (const imageMatch of line.matchAll(IMAGE_PATTERN)) {
      const altText = imageMatch[1].trim();
      if (!altText) {
        issues.push(`${filePath}:${index + 1} Markdown images must include non-empty alt text.`);
      }
    }
  });

  return issues;
};

const files = (await Promise.all(CONTENT_DIRECTORIES.map((directory) => walkMarkdownFiles(directory)))).flat();
const issues = [];

for (const filePath of files.sort()) {
  const source = await readFile(filePath, "utf8");
  issues.push(...analyzeMarkdown(filePath, source));
}

if (issues.length > 0) {
  console.error("markdown accessibility issues found:\n");
  console.error(issues.join("\n"));
  process.exit(1);
}

console.log(`markdown accessibility check passed for ${files.length} markdown files`);
