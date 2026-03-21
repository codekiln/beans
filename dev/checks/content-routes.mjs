import { access } from "node:fs/promises";
import { join } from "node:path";

const resolveBuildPath = async (...segments) => {
  const candidatePaths = [
    join(process.cwd(), "dist", ...segments),
    join(process.cwd(), "dist", "beans", ...segments)
  ];

  for (const candidatePath of candidatePaths) {
    try {
      await access(candidatePath);
      return candidatePath;
    } catch {
      continue;
    }
  }

  return null;
};

const expectBuildPath = async (...segments) => {
  const buildPath = await resolveBuildPath(...segments);
  if (!buildPath) {
    throw new Error(`Expected build output was not found for ${segments.join("/")}.`);
  }
};

const expectMissingBuildPath = async (...segments) => {
  const buildPath = await resolveBuildPath(...segments);
  if (buildPath) {
    throw new Error(`Unexpected build output was found for ${segments.join("/")}.`);
  }
};

await expectBuildPath("roasters", "parable-coffee-co", "index.html");
await expectBuildPath("roasters", "ruby-colorful-coffees", "index.html");
await expectBuildPath("coffees", "parable-coffee-co", "finca-los-angeles", "index.html");
await expectMissingBuildPath("coffees", "parable-coffee-co", "roaster.md", "index.html");
await expectMissingBuildPath("coffees", "parable-coffee-co", "finca-los-angeles.md", "index.html");

console.log("content-routes check passed");
