// @ts-check
/**
 * Renders the preview pages in `preview/src/16-9/` into PNGs with headless Edge.
 *
 *   pnpm generate:previews
 *
 *   preview/src/16-9/*.html -> preview/renders/16-9/*.png 1920x1080
 *
 * The pages read their source captures from `preview/screenshots/`. Set
 * `EDGE_PATH` if Edge is installed somewhere else.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const EDGE =
  process.env.EDGE_PATH ??
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const PREVIEW = resolve("preview");
const SOURCE = join(PREVIEW, "screenshots");
const FROM = join(PREVIEW, "src", "16-9");
const TO = join(PREVIEW, "renders", "16-9");
const SIZE = "1920,1080";

const pages = readdirSync(FROM).filter((file) => file.endsWith(".html"));
const missingScreenshots = [...new Set(
  pages.flatMap((page) =>
    [...readFile(join(FROM, page)).matchAll(/\.\.\/\.\.\/screenshots\/(\d+\.png)/g)]
      .map((match) => match[1]),
  ),
)].filter((file) => !existsSync(join(SOURCE, file)));

if (missingScreenshots.length) {
  throw new Error(
    `Add the source screenshots before rendering: ${missingScreenshots.map((file) => join(SOURCE, file)).join(", ")}`,
  );
}

mkdirSync(TO, { recursive: true });
for (const page of pages) {
  const output = join(TO, page.replace(/\.html$/, ".png"));
  execFileSync(EDGE, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--allow-file-access-from-files",
    "--virtual-time-budget=3000",
    `--window-size=${SIZE}`,
    `--screenshot=${output}`,
    pathToFileURL(join(FROM, page)).href,
  ]);
}

function readFile(path) {
  return readFileSync(path, "utf8");
}
