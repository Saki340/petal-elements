/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Builds the landing page into landing/_site/. Run from the repository root
 * after `npm run build`:
 *
 *     node landing/build.mjs          # the landing page only
 *     node landing/build.mjs --site   # the whole site in _site/:
 *                                     # landing page, catalog in /catalog/,
 *                                     # and redirects from the catalog's old
 *                                     # root paths
 *
 * --site needs the catalog built for /catalog/:
 *
 *     CATALOG_BASE=/catalog/ npm run build:catalog
 */

import * as esbuild from 'esbuild';
import * as fs from 'fs';
import * as path from 'path';

const OUT = 'landing/_site';
const SITE = '_site';
const CATALOG = 'catalog/_prod';
const ORIGIN = 'https://petal.anontokyo.vip';

fs.rmSync(OUT, {recursive: true, force: true});
fs.mkdirSync(`${OUT}/assets`, {recursive: true});

await esbuild.build({
  entryPoints: ['landing/main.ts'],
  bundle: true,
  format: 'esm',
  minify: true,
  target: 'es2022',
  legalComments: 'external',
  outfile: `${OUT}/assets/main.js`,
});
fs.copyFileSync('landing/index.html', `${OUT}/index.html`);
fs.copyFileSync('landing/styles.css', `${OUT}/assets/styles.css`);
fs.copyFileSync('tokens/css/sys.css', `${OUT}/assets/sys.css`);
fs.copyFileSync('catalog/site/images/favicon.svg', `${OUT}/favicon.svg`);
for (const image of fs.readdirSync('landing/images')) {
  fs.copyFileSync(`landing/images/${image}`, `${OUT}/assets/${image}`);
}

// llms.txt and llms-full.txt at the site root, for coding assistants, with
// links to the package's docs pointing at the catalog pages instead.
const REPO = 'https://github.com/Saki340/petal-elements/blob/main/';
const LINK =
  /\]\(((?:docs|migrations)\/[^)#\s]+|CHANGELOG\.md|custom-elements\.json)(#[^)]*)?\)/g;
function catalogPage(file) {
  const name = path.basename(file, '.md');
  if (file === 'docs/theming/README.md') return 'theming/material-theming';
  if (/^docs\/theming\/[\w-]+\.md$/.test(file)) return `theming/${name}`;
  if (/^docs\/components\/[\w-]+\.md$/.test(file)) return `components/${name}`;
  if (/^docs\/[\w-]+\.md$/.test(file)) return `about/${name}`;
  return null;
}
function siteLinks(text) {
  return text.replace(LINK, (all, file, hash = '') => {
    const page = catalogPage(file);
    return page ? `](/catalog/${page}/${hash})` : `](${REPO}${file}${hash})`;
  });
}
for (const file of ['llms.txt', 'llms-full.txt']) {
  fs.writeFileSync(`${OUT}/${file}`, siteLinks(fs.readFileSync(file, 'utf8')));
}
console.log(`Landing page in ${OUT}/`);

if (process.argv.includes('--site')) {
  const index = path.join(CATALOG, 'index.html');
  if (!fs.existsSync(index) || !fs.readFileSync(index, 'utf8').includes('"/catalog/')) {
    throw new Error(
      'Build the catalog for /catalog/ first: CATALOG_BASE=/catalog/ npm run build:catalog',
    );
  }
  fs.rmSync(SITE, {recursive: true, force: true});
  fs.cpSync(OUT, SITE, {recursive: true});
  fs.cpSync(CATALOG, `${SITE}/catalog`, {recursive: true});

  // The catalog used to be at the root: send its old page URLs to /catalog/.
  let redirects = 0;
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(file);
      } else if (entry.name === 'index.html' && dir !== CATALOG) {
        const page = path.relative(CATALOG, dir).split(path.sep).join('/');
        const target = `/catalog/${page}/`;
        const stub = path.join(SITE, page, 'index.html');
        fs.mkdirSync(path.dirname(stub), {recursive: true});
        fs.writeFileSync(
          stub,
          `<!doctype html>
<meta charset="utf-8">
<title>Moved</title>
<link rel="canonical" href="${target}">
<meta http-equiv="refresh" content="0; url=${target}">
<script>location.replace(${JSON.stringify(target)} + location.hash)</script>
<p>Moved to <a href="${target}">${target}</a>.</p>
`,
        );
        redirects++;
      }
    }
  };
  walk(CATALOG);

  // robots.txt and sitemap.xml for search engines. The sitemap lists the
  // catalog's documentation pages, not the story pages (those are iframe
  // content for the demos) or the old-path redirect stubs.
  const urls = [`${ORIGIN}/`, `${ORIGIN}/catalog/`];
  const collect = (dir) => {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'stories' && entry.name !== 'assets') collect(file);
      } else if (entry.name === 'index.html' && dir !== CATALOG) {
        const page = path.relative(CATALOG, dir).split(path.sep).join('/');
        urls.push(`${ORIGIN}/catalog/${page}/`);
      }
    }
  };
  collect(CATALOG);
  const lastmod = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(
    `${SITE}/sitemap.xml`,
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n')}
</urlset>
`,
  );
  fs.writeFileSync(
    `${SITE}/robots.txt`,
    `User-agent: *
Allow: /
Disallow: /catalog/assets/

Sitemap: ${ORIGIN}/sitemap.xml
`,
  );
  console.log(`Sitemap with ${urls.length} URLs`);
  console.log(`Site in ${SITE}/ (catalog in /catalog/, ${redirects} redirects)`);
}
