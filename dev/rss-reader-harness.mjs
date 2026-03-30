#!/usr/bin/env node
import { createServer } from "node:http";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, extname, join, resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const fixtureSpecs = [
  {
    id: "inline-comment-march-29",
    url: "https://codekiln.github.io/beans/log/2026-03-29/",
    sourcePath: "src/content/beans/2026-03-29-bean1.mdx",
    title: "earthy sweetness, beets. red. root-like and sweet.",
    coverage: ["inline companion comments", "body images", "content-order loss"],
    expected: {
      inlineComment: true,
      buddyComment: false,
      anyImage: true,
      noImage: false
    },
    markers: {
      sectionHeading: "grounds sniff",
      inlineComment: "earthy sweetness, beets. red.",
      imageAlt: "bean log 2026-03-29 sun 0520"
    },
    manualObservations: [
      {
        reader: "Readwise Reader",
        observedOn: "2026-03-30",
        source: "task description",
        note: "Drops the March 29 grounds sniff companion block from the rendered item."
      }
    ]
  },
  {
    id: "buddy-and-inline-march-18",
    url: "https://codekiln.github.io/beans/log/2026-03-18/",
    sourcePath: "src/content/beans/2026-03-18-bean1.mdx",
    title: "peppery today, sour edge",
    coverage: ["inline companion comments", "persona/buddy comments", "body images"],
    expected: {
      inlineComment: true,
      buddyComment: true,
      anyImage: true,
      noImage: false
    },
    markers: {
      inlineComment: "peppery today",
      buddyComment: "Coffee buddy comment",
      buddyAttribution: "Virtual companion note by Rin Vale",
      imageAlt: "bean log 2026-03-18 wed 0617"
    }
  },
  {
    id: "buddy-and-body-image-march-06",
    url: "https://codekiln.github.io/beans/log/2026-03-06/",
    sourcePath: "src/content/beans/2026-03-06-bean1.md",
    title: "friday cup 1, 5:39 am",
    coverage: ["persona/buddy comments", "body images"],
    expected: {
      inlineComment: false,
      buddyComment: true,
      anyImage: true,
      noImage: false
    },
    markers: {
      buddyComment: "Coffee buddy comment",
      imageAlt: "hand-written notes of the brew from this morning"
    }
  },
  {
    id: "preview-image-march-21",
    url: "https://codekiln.github.io/beans/log/2026-03-21/",
    sourcePath: "src/content/beans/2026-03-21-bean1.mdx",
    title: "rich, delicious with the lid off",
    coverage: ["preview-image behavior"],
    expected: {
      inlineComment: false,
      buddyComment: false,
      anyImage: true,
      noImage: false
    },
    markers: {
      imageAlt: "bean log 2026-03-21 sat 0842"
    }
  },
  {
    id: "no-image-january-24",
    url: "https://codekiln.github.io/beans/log/2026-01-24/",
    sourcePath: "src/content/beans/2026-01-24-bean2.md",
    title: "Cold walk, music, grounded cup",
    coverage: ["no-image posts"],
    expected: {
      inlineComment: false,
      buddyComment: false,
      anyImage: false,
      noImage: true
    },
    markers: {
      text: "The cold sharpened everything."
    }
  }
];

const usage = () => {
  console.log(
    [
      "Usage: node dev/rss-reader-harness.mjs [--check] [--write <output-json>]",
      "",
      "Build the site first with `npm run build`, then use:",
      "  node dev/rss-reader-harness.mjs --check",
      "  node dev/rss-reader-harness.mjs --write src/data/rss-reader-harness.json"
    ].join("\n")
  );
};

const args = process.argv.slice(2);
let shouldCheck = false;
let writePath = null;

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];

  if (arg === "--help") {
    usage();
    process.exit(0);
  }

  if (arg === "--check") {
    shouldCheck = true;
    continue;
  }

  if (arg === "--write") {
    writePath = args[index + 1] ?? null;
    index += 1;
    continue;
  }

  console.error(`Unknown argument: ${arg}`);
  usage();
  process.exit(1);
}

if (!shouldCheck && !writePath) {
  shouldCheck = true;
}

const run = async () => {
  const distDir = resolve("dist");
  const rssPath = await resolveRssPath(distDir);
  const rssXml = await readFile(rssPath, "utf8");
  const rssItems = parseRssItems(rssXml);
  const eilmeldungCapture = await captureEilmeldungState(distDir);

  try {
    const fixtureRows = fixtureSpecs.map((fixture) => {
      const rss = rssItems.get(fixture.url);

      if (!rss) {
        throw new Error(`Fixture RSS item was not found for ${fixture.url}`);
      }

      const eilmeldung = eilmeldungCapture.articles.get(fixture.url);

      if (!eilmeldung) {
        throw new Error(`eilmeldung did not ingest fixture article ${fixture.url}`);
      }

      return buildFixtureRecord(fixture, rss, eilmeldung);
    });

    const data = {
      harnessVersion: 1,
      rssPath,
      fixtureCount: fixtureRows.length,
      terminalWorkflow: {
        reader: "eilmeldung",
        mode: "local_rss OPML import + sync against locally served dist/rss.xml"
      },
      browserWorkflow: {
        mode: "Playwright/browser inspection of /beans/dev/rss-reader-harness/"
      },
      notes: [
        "The browser page renders fixture cards from this JSON snapshot.",
        "March 29 includes a manual Readwise Reader observation sourced from the task description."
      ],
      fixtures: fixtureRows
    };

    if (shouldCheck) {
      checkHarness(data);
      printSummary(data);
    }

    if (writePath) {
      const targetPath = resolve(writePath);
      await mkdir(dirname(targetPath), { recursive: true });
      await writeFile(targetPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
      console.log(`Wrote reader harness snapshot to ${targetPath}`);
    }
  } finally {
    await eilmeldungCapture.cleanup();
  }
};

const resolveRssPath = async (distDir) => {
  const candidates = [join(distDir, "rss.xml"), join(distDir, "beans", "rss.xml")];

  for (const candidate of candidates) {
    try {
      await readFile(candidate, "utf8");
      return candidate;
    } catch {
      continue;
    }
  }

  throw new Error("RSS output file was not found in dist/. Run `npm run build` first.");
};

const decodeEntities = (value) =>
  value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");

const parseRssItems = (xml) => {
  const itemPattern = /<item>([\s\S]*?)<\/item>/g;
  const items = new Map();

  for (const match of xml.matchAll(itemPattern)) {
    const block = match[1];
    const title = decodeEntities(extractTag(block, "title") ?? "");
    const link = decodeEntities(extractTag(block, "link") ?? "");
    const description = decodeEntities(extractTag(block, "description") ?? "");

    items.set(link, {
      title,
      link,
      html: description
    });
  }

  return items;
};

const extractTag = (block, tagName) => {
  const match = block.match(new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`));
  return match?.[1] ?? null;
};

const captureEilmeldungState = async (distDir) => {
  const root = await mkdtemp(join(tmpdir(), "beans-rss-reader-"));
  const configDir = join(root, "config");
  const stateDir = join(root, "state");
  const opmlPath = join(root, "beans.opml");

  await mkdir(configDir, { recursive: true });
  await mkdir(stateDir, { recursive: true });
  await writeFile(
    join(configDir, "config.toml"),
    [
      "[login_setup]",
      "login_type = \"no_login\"",
      "provider = \"local_rss\""
    ].join("\n") + "\n",
    "utf8"
  );

  const server = await startStaticServer(distDir);

  try {
    await writeFile(
      opmlPath,
      [
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
        "<opml version=\"2.0\">",
        "  <head>",
        "    <title>Beans RSS reader harness</title>",
        "  </head>",
        "  <body>",
        `    <outline text="Beans RSS" title="Beans RSS" type="rss" xmlUrl="${server.feedUrl}" htmlUrl="https://codekiln.github.io/beans/" />`,
        "  </body>",
        "</opml>"
      ].join("\n"),
      "utf8"
    );

    const cliArgs = [
      "--config-dir",
      configDir,
      "--news-flash-config-dir",
      configDir,
      "--news-flash-state-dir",
      stateDir
    ];

    await execFileAsync("eilmeldung", [...cliArgs, "--import-opml", opmlPath], { cwd: process.cwd() });
    await execFileAsync("eilmeldung", [...cliArgs, "--sync"], { cwd: process.cwd() });

    const query = [
      "select url, title, html, summary, plain_text",
      "from articles",
      "where url in (",
      fixtureSpecs.map((fixture) => `'${fixture.url.replace(/'/g, "''")}'`).join(", "),
      ")"
    ].join(" ");
    const { stdout } = await execFileAsync("sqlite3", ["-json", join(stateDir, "database.sqlite"), query], {
      cwd: process.cwd()
    });
    const rows = JSON.parse(stdout);
    const articles = new Map(rows.map((row) => [row.url, row]));

    return {
      articles,
      cleanup: async () => {
        await server.close();
        await rm(root, { recursive: true, force: true });
      }
    };
  } catch (error) {
    await server.close();
    await rm(root, { recursive: true, force: true });
    throw error;
  }
};

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp"
};

const startStaticServer = async (distDir) => {
  const server = createServer(async (request, response) => {
    const requestPath = request.url === "/" ? "/index.html" : request.url ?? "/";
    const localPath = requestPath.split("?")[0].replace(/^\/+/, "");
    const filePath = join(distDir, localPath);

    try {
      const content = await readFile(filePath);
      response.writeHead(200, {
        "Content-Type": mimeTypes[extname(filePath)] ?? "application/octet-stream"
      });
      response.end(content);
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
    }
  });

  await new Promise((resolveServer) => {
    server.listen(0, "127.0.0.1", resolveServer);
  });

  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("Failed to start local RSS harness server.");
  }

  return {
    feedUrl: `http://127.0.0.1:${address.port}/rss.xml`,
    close: () =>
      new Promise((resolveClose, rejectClose) => {
        server.close((error) => {
          if (error) {
            rejectClose(error);
            return;
          }

          resolveClose();
        });
      })
  };
};

const normalizeWhitespace = (value) => value.replace(/\r/g, " ").replace(/\s+/g, " ").trim();

const htmlToText = (html) =>
  normalizeWhitespace(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<\/h[1-6]>/gi, "\n")
      .replace(/<\/blockquote>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, "\"")
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
  );

const firstImage = (html) => {
  const match = html.match(/<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"/i);
  return match ? { src: match[1], alt: match[2] } : null;
};

const markerFlags = (content, markers) =>
  Object.fromEntries(
    Object.entries(markers).map(([key, marker]) => [key, content.includes(marker)])
  );

const buildFixtureRecord = (fixture, rss, eilmeldung) => {
  const rssText = htmlToText(rss.html);
  const summary = normalizeWhitespace(eilmeldung.summary ?? "");
  const plainText = normalizeWhitespace(eilmeldung.plain_text ?? "");
  const image = firstImage(rss.html);

  return {
    id: fixture.id,
    url: fixture.url,
    title: fixture.title,
    sourcePath: fixture.sourcePath,
    coverage: fixture.coverage,
    expected: fixture.expected,
    manualObservations: fixture.manualObservations ?? [],
    rss: {
      html: rss.html,
      text: rssText,
      markers: markerFlags(rss.html, fixture.markers),
      hasInlineComment: rss.html.includes("<blockquote") && rssText.includes(fixture.markers.inlineComment ?? "__missing__"),
      hasBuddyComment: rss.html.includes("Coffee buddy comment"),
      image,
      imageCount: (rss.html.match(/<img\b/gi) ?? []).length
    },
    eilmeldung: {
      html: eilmeldung.html ?? "",
      summary,
      plainText,
      summaryMarkers: markerFlags(summary, fixture.markers),
      plainTextMarkers: markerFlags(plainText, fixture.markers),
      hasInlineComment: plainText.includes(fixture.markers.inlineComment ?? "__missing__"),
      hasBuddyComment: (eilmeldung.html ?? "").includes("Coffee buddy comment"),
      summaryLength: summary.length
    },
    compatibility: {
      summaryDropsInlineComment:
        Boolean(fixture.markers.inlineComment) &&
        rssText.includes(fixture.markers.inlineComment) &&
        !summary.includes(fixture.markers.inlineComment),
      summaryDropsBuddyComment:
        Boolean(fixture.markers.buddyComment) &&
        rssText.includes(fixture.markers.buddyComment) &&
        !summary.includes(fixture.markers.buddyComment),
      summaryDropsSectionHeading:
        Boolean(fixture.markers.sectionHeading) &&
        rssText.includes(fixture.markers.sectionHeading) &&
        !summary.includes(fixture.markers.sectionHeading),
      previewImageAvailable: Boolean(image?.src),
      contentOrderStartsWithImage: Boolean(image?.src) && normalizeWhitespace(rss.html).startsWith("<figure><img")
    }
  };
};

const checkHarness = (data) => {
  const failures = [];

  for (const fixture of data.fixtures) {
    if (fixture.expected.inlineComment && !fixture.rss.hasInlineComment) {
      failures.push(`${fixture.id}: expected inline companion comment in RSS HTML.`);
    }

    if (fixture.expected.buddyComment && !fixture.rss.hasBuddyComment) {
      failures.push(`${fixture.id}: expected buddy comment markup in RSS HTML.`);
    }

    if (fixture.expected.anyImage && !fixture.rss.image) {
      failures.push(`${fixture.id}: expected at least one image in RSS HTML.`);
    }

    if (fixture.expected.noImage && fixture.rss.image) {
      failures.push(`${fixture.id}: expected no images in RSS HTML.`);
    }

    if (!fixture.eilmeldung.summaryLength) {
      failures.push(`${fixture.id}: eilmeldung summary was empty.`);
    }

    if (!fixture.eilmeldung.plainText) {
      failures.push(`${fixture.id}: eilmeldung plain-text capture was empty.`);
    }
  }

  if (failures.length > 0) {
    throw new Error(`RSS reader harness check failed:\n- ${failures.join("\n- ")}`);
  }
};

const printSummary = (data) => {
  console.log(`reader harness check passed (${data.fixtureCount} fixtures)`);

  for (const fixture of data.fixtures) {
    const notes = [];

    if (fixture.compatibility.summaryDropsSectionHeading) {
      notes.push("summary drops section heading");
    }
    if (fixture.compatibility.summaryDropsInlineComment) {
      notes.push("summary drops inline comment");
    }
    if (fixture.compatibility.summaryDropsBuddyComment) {
      notes.push("summary drops buddy comment");
    }
    if (fixture.compatibility.previewImageAvailable) {
      notes.push("preview image available");
    }
    if (fixture.expected.noImage) {
      notes.push("no-image fixture");
    }

    console.log(`- ${fixture.id}: ${notes.join(", ") || "captured"}`);
  }
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
