import { promises as fs } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const sourceDir = join(process.cwd(), "misc", "productStory");
const outDir = join(sourceDir, "png");
const initialViewport = { width: 1800, height: 1200 };
const defaultGutter = 48;
const scale = 2;

async function waitForAssets(page) {
  await page.evaluate(async () => {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    await Promise.all(
      Array.from(document.images, (img) => img.decode().catch(() => undefined))
    );
  });
}

async function getTargetViewport(page) {
  return page.evaluate((gutter) => {
    const wrap = document.querySelector(".wrap");
    const rect = wrap?.getBoundingClientRect();
    const width =
      rect?.width ||
      document.documentElement.scrollWidth ||
      document.body.scrollWidth ||
      1600;
    const height =
      rect?.height ||
      document.documentElement.scrollHeight ||
      document.body.scrollHeight ||
      900;

    return {
      width: Math.ceil(width + gutter),
      height: Math.ceil(height + gutter),
    };
  }, defaultGutter);
}

async function renderFlyer(browser, filename) {
  const inputPath = join(sourceDir, filename);
  const outputPath = join(outDir, filename.replace(/\.html$/i, ".png"));
  const url = pathToFileURL(inputPath).href;

  const page = await browser.newPage({
    viewport: initialViewport,
    deviceScaleFactor: scale,
  });

  try {
    await page.goto(url, { waitUntil: "load" });
    await waitForAssets(page);

    const targetViewport = await getTargetViewport(page);
    await page.setViewportSize(targetViewport);

    await page.goto(url, { waitUntil: "load" });
    await waitForAssets(page);

    await page.locator("body").screenshot({
      path: outputPath,
      type: "png",
    });

    const dimensions = await page.evaluate(() => ({
      width: Math.ceil(document.body.getBoundingClientRect().width),
      height: Math.ceil(document.body.getBoundingClientRect().height),
    }));

    return { filename, outputPath, dimensions };
  } finally {
    await page.close();
  }
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });

  const files = (await fs.readdir(sourceDir))
    .filter((name) => name.toLowerCase().endsWith(".html"))
    .sort();

  if (files.length === 0) {
    console.log(`No HTML files found in ${sourceDir}`);
    return;
  }

  const browser = await chromium.launch({ headless: true });

  try {
    for (const file of files) {
      const result = await renderFlyer(browser, file);
      console.log(
        `Wrote ${result.outputPath} (${result.dimensions.width}x${result.dimensions.height} @${scale}x)`
      );
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
