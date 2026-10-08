/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Checks the licenses of all installed npm packages.
 *
 *     node scripts/check-licenses.js
 *
 * Reads every package in package-lock.json from node_modules (run after
 * `npm ci`). Runtime dependencies must use a permissive license; dev
 * dependencies may also use a few more licenses that do not affect what we
 * publish. Exits with 1 if anything is not allowed.
 */

import * as fs from 'fs';

const PERMISSIVE = new Set([
  '0BSD',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'ISC',
  'MIT',
  'W3C-20150513',
]);
// Build and test tools only; never shipped.
const DEV_ONLY = new Set([
  'BlueOak-1.0.0',
  'CC-BY-4.0',
  'CC0-1.0',
  'MPL-2.0',
  // Fonts used only by the visual tests (@fontsource/roboto).
  'OFL-1.1',
  'Python-2.0',
  'Unlicense',
  'WTFPL',
]);
// Packages without a license field, checked by hand.
const OVERRIDES: Record<string, string> = {
  // MIT, stated in its Readme.md.
  'node_modules/only': 'MIT',
};

interface LockEntry {
  dev?: boolean;
  optional?: boolean;
  devOptional?: boolean;
}

function readLicense(dir: string): string | undefined {
  const pkg = JSON.parse(fs.readFileSync(`${dir}/package.json`, 'utf8'));
  const {license, licenses} = pkg;
  if (typeof license === 'string') return license;
  if (license?.type) return license.type;
  if (Array.isArray(licenses)) {
    return licenses.map((l: {type: string}) => l.type).join(' OR ');
  }
  return undefined;
}

/** True if an SPDX expression like `(MIT OR Apache-2.0)` is allowed. */
function isAllowed(expression: string, allowed: Set<string>) {
  return expression
    .replace(/[()]/g, '')
    .split(/\s+OR\s+/)
    .some((choice) =>
      choice.split(/\s+AND\s+/).every((id) => allowed.has(id.trim())),
    );
}

const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
const entries = Object.entries(lock.packages as Record<string, LockEntry>);
const problems: string[] = [];
const counts = new Map<string, number>();

for (const [dir, entry] of entries) {
  // Skip the root package and workspace links.
  if (!dir.includes('node_modules/')) continue;
  if (!fs.existsSync(`${dir}/package.json`)) {
    // Optional platform-specific packages are not installed everywhere.
    if (!entry.optional && !entry.devOptional) {
      problems.push(`${dir}: not installed (run npm ci first)`);
    }
    continue;
  }
  const license = OVERRIDES[dir] ?? readLicense(dir);
  const dev = Boolean(entry.dev || entry.devOptional);
  const allowed = dev ? new Set([...PERMISSIVE, ...DEV_ONLY]) : PERMISSIVE;
  const key = `${license ?? 'UNKNOWN'}${dev ? ' (dev)' : ''}`;
  counts.set(key, (counts.get(key) ?? 0) + 1);
  if (!license || !isAllowed(license, allowed)) {
    problems.push(`${dir}: ${license ?? 'no license field'}${dev ? ' (dev)' : ''}`);
  }
}

for (const [key, count] of [...counts].sort((a, b) => b[1] - a[1])) {
  console.log(`${String(count).padStart(5)}  ${key}`);
}
if (problems.length) {
  console.error(`\n${problems.length} package(s) not allowed:`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}
console.log('\nAll licenses allowed.');
