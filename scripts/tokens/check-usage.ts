/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Checks that tokens/css/sys.css defines every `--md-sys-*` and
 * `--md-ref-*` property the stable components use. Run after `npm run build`
 * (it reads the compiled component CSS).
 *
 *     node scripts/tokens/check-usage.js
 *
 * labs/ is reported but does not fail the check: labs/gb uses a different
 * naming scheme (e.g. --md-sys-shape-corner-md).
 */

import * as fs from 'fs';

const SKIP = new Set(['node_modules', 'catalog', '.wireit', '.git', '.cache', '.claude', 'tokens']);

function cssFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const path = dir === '.' ? entry.name : `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      if (!SKIP.has(entry.name)) files.push(...cssFiles(path));
    } else if (entry.name.endsWith('.css')) {
      files.push(path);
    }
  }
  return files;
}

const defined = new Set(
  [...fs.readFileSync('tokens/css/sys.css', 'utf8').matchAll(/^\s*(--[\w-]+):/gm)].map((m) => m[1]),
);

const files = cssFiles('.');
if (!files.some((f) => f.startsWith('button/'))) {
  throw new Error('No compiled component CSS found; run "npm run build" first.');
}

const missing = new Map<string, Set<string>>();
for (const file of files) {
  const css = fs.readFileSync(file, 'utf8');
  for (const [, name] of css.matchAll(/var\((--md-(?:sys|ref)-[\w-]+)/g)) {
    if (defined.has(name)) continue;
    if (!missing.has(name)) missing.set(name, new Set());
    missing.get(name)!.add(file);
  }
}

const stable = [...missing].filter(([, where]) => [...where].some((f) => !f.startsWith('labs/')));
const labsOnly = [...missing].filter(([, where]) => [...where].every((f) => f.startsWith('labs/')));

if (labsOnly.length) {
  console.log(`labs/ uses ${labsOnly.length} properties not in sys.css (not checked).`);
}
if (stable.length) {
  console.error('Properties used by components but missing from tokens/css/sys.css:');
  for (const [name, where] of stable.sort()) {
    console.error(`  ${name} (${[...where].filter((f) => !f.startsWith('labs/')).join(', ')})`);
  }
  process.exit(1);
}
console.log('sys.css defines every --md-sys-* / --md-ref-* property the stable components use.');
