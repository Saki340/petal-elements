/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Token pipeline.
 *
 *     node scripts/tokens/build.js          # regenerate everything
 *     node scripts/tokens/build.js --check  # exit 1 if anything is out of date
 *
 * 1. Web tokens (tokens/versions/latest/sass, the primary source)
 *    -> tokens/dtcg/web/*.tokens.json
 * 2. Compose tokens (androidx, pinned in tokens/sources.json)
 *    -> tokens/dtcg/compose/*.tokens.json
 * 3. Web DTCG, plus the Compose expressive springs the web tokens lack,
 *    -> Style Dictionary -> tokens/css/*.css
 * 4. Web DTCG -> tokens/versions/v34/*.scss (v0.192 functions, v34 values)
 *    and tokens/versions/v34/values/*.scss (value maps for new features)
 * 5. Comparison reports -> tokens/reports/*.md
 */

import {readComposeTokens} from './compose.js';
import {compare, Flat, flattenDtcg, flattenLegacy, report, sourceLine} from './compare.js';
import {buildCss} from './css.js';
import {kebab, Output, SOURCES, stableJson} from './dtcg.js';
import {readLegacyTokens} from './legacy.js';
import {buildCompatSass, compatReport} from './sass.js';
import {buildValueModules} from './values.js';
import {readWebTokens} from './web.js';

const check = process.argv.includes('--check');
const outputs: Output[] = [];

// 1. Web tokens.
const web = readWebTokens();
const webOut = new Output('tokens/dtcg/web', '.tokens.json');
for (const file of web.files) webOut.add(`${file.module}.tokens.json`, stableJson(file.tokens));
outputs.push(webOut);

// 2. Compose tokens.
const compose = await readComposeTokens();
const composeOut = new Output('tokens/dtcg/compose', '.tokens.json');
for (const file of compose.files) {
  composeOut.add(`${kebab(file.object.replace(/Tokens$/, ''))}.tokens.json`, stableJson(file.tokens));
}
outputs.push(composeOut);

// 3. CSS.
const cssOut = new Output('tokens/css', '.css');
const expressiveMotion = compose.files.find((f) => f.object === 'ExpressiveMotionTokens');
if (!expressiveMotion) throw new Error('ExpressiveMotionTokens not found');
const css = await buildCss(web.files, expressiveMotion.tokens);
for (const [name, content] of css) cssOut.add(name, content);
outputs.push(cssOut);

// 4. Sass modules for the components (v0.192 shape, v34 values).
const legacyTokens = readLegacyTokens();
const compat = buildCompatSass(web.files, legacyTokens);
// The build writes *-meta.scss next to these files.
const sassOut = new Output('tokens/versions/v34', '.scss', /-meta\.scss$/);
for (const [name, content] of compat.output) sassOut.add(name, content);
outputs.push(sassOut);

// Value maps for the Expressive features.
const valuesOut = new Output('tokens/versions/v34/values', '.scss', /-meta\.scss$/);
for (const [name, content] of buildValueModules(web.files, css.get('sys.css')!)) {
  valuesOut.add(name, content);
}
outputs.push(valuesOut);

// 5. Reports.
const onlyLightDark = (flat: Flat): Flat =>
  new Map([...flat].filter(([k]) => !k.includes('/') || k.startsWith('dark/')));
const webFlat = onlyLightDark(flattenDtcg(web.files));
const composeFlat = flattenDtcg(
  compose.files.map((f) => ({
    context: f.object === 'ColorDarkTokens' ? 'dark' : '',
    tokens: f.tokens,
  })),
);
const legacyFlat = flattenLegacy(legacyTokens);

const webName = `web v${SOURCES.web.version}`;
const skippedNote = (title: string, names: string[]) =>
  `${title}: ${names.length}.\n\n<details>\n<summary>Names</summary>\n\n` +
  names.map((n) => `- \`${n}\``).join('\n') +
  '\n\n</details>';

const reportsOut = new Output('tokens/reports', '.md');
reportsOut.add(
  'web-vs-compose.md',
  report({
    title: `Token comparison: ${webName} and Jetpack Compose`,
    intro: [
      'Cross-check of the primary token source against Jetpack Compose Material 3.',
      'Only the light and dark color schemes are compared (Compose has no contrast variants).',
      '',
      sourceLine(webName, SOURCES.web),
      sourceLine('Compose', SOURCES.compose),
      '',
      'Expected differences: font families (Roboto on the web, the platform',
      'sans-serif in Compose), sp/dp rounding of letter spacing, and tokens that',
      'only one platform defines. Compose component *Defaults may also override',
      'these tokens; check them before relying on a value.',
    ],
    nameA: webName,
    nameB: 'Compose',
    comparison: compare(webFlat, composeFlat),
    notes: [
      skippedNote(`Web tokens without a value in the source (not compared)`, web.skipped),
      '',
      skippedNote('Compose files not converted', compose.skipped),
    ],
  }),
);
reportsOut.add(
  'web-vs-v0_192.md',
  report({
    title: `Token comparison: ${webName} and v0.192`,
    intro: [
      'What changes when the stable components move from the v0.192 tokens',
      '(tokens/versions/v0_192, used to build them today) to the web tokens.',
      '',
      sourceLine(webName, SOURCES.web),
      '- v0.192: tokens/versions/v0_192 in this repository',
    ],
    nameA: webName,
    nameB: 'v0.192',
    comparison: compare(webFlat, legacyFlat),
  }),
);
reportsOut.add('compat-v34.md', compatReport(compat.reports));
outputs.push(reportsOut);

const stale = outputs.flatMap((output) => output.commit(check));
if (check) {
  if (stale.length) {
    console.error(`Out of date (run "npm run tokens"):\n${stale.map((f) => `  ${f}`).join('\n')}`);
    process.exit(1);
  }
  console.log('Tokens are up to date.');
} else {
  console.log(stale.length ? `Updated ${stale.length} file(s).` : 'No changes.');
}
