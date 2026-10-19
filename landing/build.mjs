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
  console.log(`Site in ${SITE}/ (catalog in /catalog/, ${redirects} redirects)`);
}
