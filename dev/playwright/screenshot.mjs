#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";

const usage = () => {
  console.log("Usage: node dev/playwright/screenshot.mjs <url> <output> [--full-page] [--width=1440] [--height=900] [--wait=0]");
};

const args = process.argv.slice(2);
if (args.length < 2 || args.includes("--help")) {
  usage();
  process.exit(args.includes("--help") ? 0 : 1);
}

const url = args[0];
const output = args[1];

let fullPage = false;
let width = 1440;
let height = 900;
let waitMs = 0;

for (const arg of args.slice(2)) {
  if (arg === "--full-page") {
    fullPage = true;
    continue;
  }
  if (arg.startsWith("--width=")) {
    width = Number(arg.split("=")[1]);
    continue;
  }
  if (arg.startsWith("--height=")) {
    height = Number(arg.split("=")[1]);
    continue;
  }
  if (arg.startsWith("--wait=")) {
    waitMs = Number(arg.split("=")[1]);
    continue;
  }
}

if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) {
  console.error("Width/height must be positive numbers.");
  process.exit(1);
}

if (!Number.isFinite(waitMs) || waitMs < 0) {
  console.error("Wait must be a non-negative number.");
  process.exit(1);
}

const run = async () => {
  await fs.mkdir(path.dirname(output), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width, height } });

  await page.goto(url, { waitUntil: "networkidle" });
  if (waitMs > 0) {
    await page.waitForTimeout(waitMs);
  }

  await page.screenshot({ path: output, fullPage });
  await browser.close();

  console.log(`Saved screenshot to ${output}`);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
