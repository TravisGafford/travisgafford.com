/* ============================================================================
   Builds a set of self-contained preview pages you can double-click and open
   in a browser without running a web server.

     node tools/build.mjs        (first, to generate _site/)
     node tools/preview.mjs

   Output lands in _preview/. Each file inlines its own CSS and images as
   base64, so the pages are large and slow to load — fine for review, never
   for publishing. The real site is _site/.
   ========================================================================== */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = path.join(ROOT, "_site");
const OUT = path.join(ROOT, "_preview");

if (!fs.existsSync(SITE)) {
  console.error("No _site/ found. Run: node tools/build.mjs");
  process.exit(1);
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

let css = fs.readFileSync(path.join(SITE, "assets/css/style.css"), "utf8");

/* Preview pages are opened straight off the filesystem, where "/assets/..."
   does not resolve. Inline the fonts so the preview looks like the real site. */
css = css.replace(/url\("(\/assets\/fonts\/[^"]+)"\)/g, (m, p) => {
  const f = path.join(SITE, p.replace(/^\//, ""));
  if (!fs.existsSync(f)) return m;
  return `url("data:font/woff2;base64,${fs.readFileSync(f).toString("base64")}")`;
});

const cache = new Map();
function dataUri(p) {
  if (cache.has(p)) return cache.get(p);
  const f = path.join(SITE, p.replace(/^\//, ""));
  if (!fs.existsSync(f)) return p;
  const ext = path.extname(f).slice(1).toLowerCase();
  const mime =
    ext === "svg" ? "image/svg+xml" :
    ext === "png" ? "image/png" :
    ext === "webp" ? "image/webp" : "image/jpeg";
  const uri = `data:${mime};base64,${fs.readFileSync(f).toString("base64")}`;
  cache.set(p, uri);
  return uri;
}

/* Every built page, mapped to a flat filename so links work off the filesystem. */
const pages = [];
(function walk(dir, urlBase = "/") {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, urlBase + e.name + "/");
    else if (e.name === "index.html") pages.push({ file: p, url: urlBase });
  }
})(SITE);

const flat = (url) =>
  url === "/" ? "home.html" : url.replace(/^\/|\/$/g, "").replace(/\//g, "-") + ".html";

const nameFor = Object.fromEntries(pages.map((p) => [p.url, flat(p.url)]));

for (const { file, url } of pages) {
  let h = fs.readFileSync(file, "utf8");
  h = h.replace('<link rel="stylesheet" href="/assets/css/style.css">', `<style>\n${css}\n</style>`);
  // Drop the responsive image sources so only the plain .jpg is inlined.
  // Must not touch <source> inside <video>, which has no srcset.
  h = h.replace(/<source[^>]*srcset=[^>]*>/g, "");
  h = h.replace(/src="(\/assets\/img\/[^"]+)"/g, (_, p) => `src="${dataUri(p)}"`);
  h = h.replace(/href="(\/assets\/img\/[^"]+)"/g, (_, p) => `href="${dataUri(p)}"`);
  h = h.replace(/poster="(\/assets\/img\/[^"]+)"/g, (_, p) => `poster="${dataUri(p)}"`);
  h = h.replace(/data-full="(\/assets\/img\/[^"]+)"/g, (_, p) => `data-full="${dataUri(p)}"`);
  // Video files are copied alongside rather than inlined — base64 video is
  // enormous and some browsers refuse to seek within a data URI.
  h = h.replace(/(src|href)="\/assets\/video\/([^"]+)"/g, (_, attr, file) => {
    const from = path.join(SITE, "assets/video", file);
    if (fs.existsSync(from)) fs.copyFileSync(from, path.join(OUT, file));
    return `${attr}="${file}"`;
  });
  h = h.replace(/href="(\/[^"]*)"/g, (m, p) => (nameFor[p] ? `href="${nameFor[p]}"` : m));
  fs.writeFileSync(path.join(OUT, flat(url)), h);
}

console.log(`Preview pages in _preview/: ${fs.readdirSync(OUT).join(", ")}`);
console.log("Open _preview/home.html in a browser.");
