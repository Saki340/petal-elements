/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Renames custom elements from `md-*` to `petal-*`.
 *
 *     node scripts/rebrand.js           # rewrite files
 *     node scripts/rebrand.js --check   # exit 1 if anything would change
 *
 * Re-run after merging upstream: tag names are collected from both `md-*` and
 * `petal-*` definitions, so new upstream references to already-renamed
 * elements are renamed too. The script is idempotent.
 *
 * What changes:
 * - registered tag names (`md-filled-button` -> `petal-filled-button`), and
 *   CSS classes with the same name;
 * - element class names listed in `HTMLElementTagNameMap`
 *   (`MdFilledButton` -> `PetalFilledButton`);
 * - the package name in imports (`@material/web/...` -> `petal-elements/...`);
 * - Google-licensed files that change get a modification notice under their
 *   SPDX line (Apache-2.0 section 4(b)).
 *
 * What does not change: CSS custom properties (`--md-*`), Sass names,
 * file names and import paths (`md-focus-ring.js`), generated tokens in
 * tokens/versions/, CHANGELOG.md, and our own files that name the upstream
 * project on purpose (README, NOTICE, docs/licensing.md, docs/intro.md).
 */

import {execFileSync} from 'child_process';
import * as fs from 'fs';

const OLD = 'md';
const NEW = 'petal';
const NOTICE_LINE = `Modified for petal-elements; modifications Copyright ${new Date().getFullYear()} Saki. See NOTICE.`;
const TEXT_FILE = /\.(ts|js|cjs|mjs|scss|css|md|html|njk|json|ya?ml)$/;
const SKIP = [
  /^CHANGELOG\.md$/,
  /^LICENSE$/,
  /(^|\/)package-lock\.json$/,
  /^tokens\/versions\//,
  /^scripts\/rebrand\.ts$/,
  /^README(\.[\w-]+)?\.md$/,
  /^docs\/licensing\.md$/,
  /^docs\/intro\.md$/,
];

const check = process.argv.includes('--check');

const files = execFileSync('git', ['ls-files', '-z'], {encoding: 'utf8'})
  .split('\0')
  .filter((file) => TEXT_FILE.test(file) && !SKIP.some((re) => re.test(file)))
  .filter((file) => fs.existsSync(file));

const sources = new Map(
  files.map((file) => [file, fs.readFileSync(file, 'utf8')]),
);

// Collect tag names (without prefix) and element class names (without prefix).
const tags = new Set<string>();
const classes = new Set<string>();
const definition =
  /(?:@customElement\(|customElements\.define\()\s*['"](md|petal)-([a-z0-9-]+)['"]/g;
const tagMapEntry = /['"](md|petal)-([a-z0-9-]+)['"]\s*:\s*(Md|Petal)([A-Z]\w*)/g;
for (const source of sources.values()) {
  for (const m of source.matchAll(definition)) tags.add(m[2]);
  for (const m of source.matchAll(tagMapEntry)) {
    tags.add(m[2]);
    classes.add(m[4]);
  }
}

function alternatives(names: Set<string>) {
  // Longest first so `menu-item` is tried before `menu`.
  return [...names]
    .sort((a, b) => b.length - a.length)
    .map((name) => name.replace(/[-]/g, '\\-'))
    .join('|');
}

// A tag name not part of a longer name, a CSS variable (`--md-`), a Sass
// variable (`$md-`) or a path (`icon/md-icon`, `./md-focus-ring.js`).
// Closing tags (`</md-icon>`) are renamed. So are CSS classes equal to a tag
// name (labs/gb uses `.md-icon`), to keep them in sync with the markup.
const tagPattern = new RegExp(
  `(?<![\\w$-])(?<![^<]/)${OLD}-(${alternatives(tags)})(?![\\w-])(?!\\.(?:js|ts|scss|css|cjs|mjs)\\b)`,
  'g',
);
const classPattern = new RegExp(`\\bMd(${alternatives(classes)})\\b`, 'g');
// `@material/web` but not `@material/web-foo` or other `@material/*` packages.
const packagePattern = /@material\/web(?![\w-])/g;

function addNotice(source: string) {
  if (source.includes(NOTICE_LINE.slice(0, 30))) return source;
  const head = source.split('\n', 8).join('\n');
  if (!/Copyright \d{4} Google LLC/.test(head)) return source;
  return source.replace(
    /^( \*|\/\/) SPDX-License-Identifier: Apache-2\.0$/m,
    (line, comment) => `${line}\n${comment} ${NOTICE_LINE}`,
  );
}

let changed = 0;
for (const [file, source] of sources) {
  let next = source
    .replace(tagPattern, `${NEW}-$1`)
    .replace(classPattern, 'Petal$1')
    .replace(packagePattern, 'petal-elements');
  if (next === source) continue;
  next = addNotice(next);
  changed++;
  if (check) {
    console.log(`would change: ${file}`);
  } else {
    fs.writeFileSync(file, next);
  }
}

console.log(
  `${tags.size} tags, ${classes.size} classes, ${changed} files ${check ? 'to change' : 'changed'}.`,
);
if (check && changed) process.exit(1);
