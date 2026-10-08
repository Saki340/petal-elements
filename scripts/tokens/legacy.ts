/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Reads the v0.192 tokens (tokens/versions/v0_192), which the
 * stable components are built with today. These files are Sass functions
 * returning maps, so the Sass compiler evaluates them.
 */

import * as fs from 'fs';
import * as sass from 'sass';

const DIR = 'tokens/versions/v0_192';

/** Returns {module: {context: {key: Sass value as text}}}. */
export function readLegacyTokens(): Map<string, Map<string, Map<string, string>>> {
  const modules = fs
    .readdirSync(DIR)
    // Skip the *-meta.scss files the build generates.
    .filter((f) => /^_md-.*\.scss$/.test(f) && !f.endsWith('-meta.scss'))
    .map((f) => f.slice(1, -'.scss'.length))
    .sort();

  // One stylesheet that prints every map as custom properties:
  //   .md-comp-filled-button--light { --container-color: #6750a4; ... }
  const functions: Array<[string, string, string]> = [];
  for (const module of modules) {
    const source = fs.readFileSync(`${DIR}/_${module}.scss`, 'utf8');
    if (/@function values-light\(/.test(source)) {
      functions.push([module, 'light', 'values-light']);
      functions.push([module, 'dark', 'values-dark']);
    } else if (/@function values\(/.test(source)) {
      functions.push([module, 'light', 'values']);
    }
  }
  const scss = [
    "@use 'sass:map';",
    "@use 'sass:meta';",
    ...modules.map((m) => `@use '${m}';`),
    ...functions.map(
      ([module, context, fn]) =>
        `.${module}--${context} { @each $key, $value in ${module}.${fn}() {` +
        ` --#{$key}: #{meta.inspect($value)}; } }`,
    ),
  ].join('\n');

  const css = sass.compileString(scss, {loadPaths: [DIR], style: 'expanded'}).css;
  const result = new Map<string, Map<string, Map<string, string>>>();
  for (const block of css.matchAll(/^\.([\w-]+)--(light|dark) \{\n([\s\S]*?)\n\}/gm)) {
    const [, module, context, body] = block;
    const values = new Map<string, string>();
    for (const line of body.split('\n')) {
      const m = /^\s*--([\w-]+): (.*);$/.exec(line);
      if (m) values.set(m[1], m[2]);
    }
    if (!result.has(module)) result.set(module, new Map());
    result.get(module)!.set(context, values);
  }
  return result;
}
