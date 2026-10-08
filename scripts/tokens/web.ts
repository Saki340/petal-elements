/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Reads the Material Design web tokens (Sass variables in
 * tokens/versions/latest/sass, shipped by material-web) into DTCG token trees.
 *
 * Each Sass variable is preceded by a doc comment with its token name:
 *
 *     /// md.sys.color.primary (Primary colors)
 *     $primary: md-ref-palette.$primary40;
 *
 * Anything that cannot be read is an error, except composite tokens the
 * source itself does not express as a value (Sass mixins and `null`
 * composites); those are listed in `skipped`.
 */

import * as fs from 'fs';
import {
  alias,
  color,
  dimension,
  duration,
  EXT,
  Group,
  header,
  number,
  setToken,
  SOURCES,
  Token,
} from './dtcg.js';

export interface WebFile {
  /** Sass module name, e.g. `md-sys-color__dark`. */
  module: string;
  /** Context from the file name, e.g. `dark__high-contrast`, or ''. */
  context: string;
  tokens: Group;
  /**
   * Sass variable name -> token name, for the converted tokens. Typography
   * mixins are keyed `@name`.
   */
  variables: Map<string, string>;
}

export interface WebTokens {
  files: WebFile[];
  /** Token names that have no value in the source (composites, mixins). */
  skipped: string[];
}

interface RawToken {
  name: string;
  variable: string;
  value: string;
  deprecated?: string;
  /** A composite or other type with no value in the source. */
  composite?: boolean;
  /** Body lines of a typography mixin. */
  mixin?: string[];
}

class CompositeReference extends Error {}

const DIR = SOURCES.web.path;

function parseFile(file: string) {
  const text = fs.readFileSync(`${DIR}/${file}`, 'utf8');
  const version = /^\/\/ Version: (\S+)$/m.exec(text)?.[1];
  if (version !== SOURCES.web.version) {
    throw new Error(
      `${file}: version ${version}, expected ${SOURCES.web.version} ` +
        `(update tokens/sources.json after merging new upstream tokens)`,
    );
  }

  const raw: RawToken[] = [];
  const skipped: string[] = [];
  let name: string | undefined;
  let deprecated: string | undefined;
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const doc = /^\/\/\/ (md\.[\w.-]+)( \(.*\))?$/.exec(line);
    if (doc && name === undefined) {
      name = doc[1];
      continue;
    }
    const dep = /^\/\/\/ @deprecated ?(.*)$/.exec(line);
    if (dep) {
      deprecated = dep[1] || 'Deprecated';
      continue;
    }
    if (line.startsWith('///') || line.startsWith('//') || !line.trim()) {
      continue;
    }
    if (line.startsWith('@use ')) continue;
    const mixin = /^@mixin ([\w-]+) \{$/.exec(line);
    if (mixin) {
      const body: string[] = [];
      while (lines[++i] !== '}') {
        if (i >= lines.length) throw new Error(`${file}: unclosed @mixin`);
        body.push(lines[i].trim());
      }
      if (!name) throw new Error(`${file}:${i + 1}: @mixin ${mixin[1]} has no token name`);
      // Mixins are referenced as `@include module.name`; key them by `@name`.
      raw.push({name, variable: `@${mixin[1]}`, value: '', deprecated, mixin: body});
      name = deprecated = undefined;
      continue;
    }
    const variable = /^\$([\w-]+): (.*);$/.exec(line);
    if (!variable) throw new Error(`${file}:${i + 1}: cannot read "${line}"`);
    if (!name) {
      throw new Error(`${file}:${i + 1}: $${variable[1]} has no token name`);
    }
    // e.g. `/* Type "custom_composite" is not supported. */ null`
    const composite = /^\/\* Type "\w+" is not supported\. \*\/ null$/.test(
      variable[2],
    );
    raw.push({name, variable: variable[1], value: variable[2], deprecated, composite});
    name = deprecated = undefined;
  }
  return {raw, skipped};
}

/** Converts one Sass value; `resolve` maps a Sass reference to a token name. */
function toToken(
  raw: RawToken,
  resolve: (module: string | undefined, variable: string) => string,
): Token {
  const {name, value} = raw;
  let m: RegExpExecArray | null;
  if (raw.mixin) return typography(raw, resolve);
  if ((m = /^(?:([\w-]+)\.)?\$([\w-]+)$/.exec(value))) {
    return alias(resolve(m[1], m[2]));
  }
  if (/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(value)) return color(value);
  if ((m = /^(-?[\d.]+)(px|rem)$/.exec(value))) {
    return dimension(Number(m[1]), m[2] as 'px' | 'rem');
  }
  if ((m = /^(-?[\d.]+)ms$/.exec(value))) return duration(Number(m[1]), 'ms');
  if ((m = /^-?[\d.]+$/.exec(value))) {
    const isWeight = /(^|[.-])weight(-[a-z]+)?$/.test(name);
    return isWeight
      ? {$type: 'fontWeight', $value: Number(value)}
      : number(Number(value));
  }
  if ((m = /^'(\w{4})' (-?[\d.]+)$/.exec(value))) {
    // Font variation axis, e.g. `'wght' 400`.
    return {...number(Number(m[2])), $extensions: {[EXT]: {fontAxis: m[1]}}};
  }
  if ((m = /^cubic-bezier\(([^)]*)\)$/.exec(value))) {
    const points = m[1].split(',').map((p) => Number(p.trim()));
    if (points.length !== 4 || points.some(isNaN)) {
      throw new Error(`${name}: bad cubic-bezier ${value}`);
    }
    return {$type: 'cubicBezier', $value: points};
  }
  if (/^md\.ref\.typeface\.(brand|plain)$/.test(name) && /^[\w ]+$/.test(value)) {
    return {$type: 'fontFamily', $value: value};
  }
  // Values without a DTCG type: per-corner radii (`0px 16px 16px 0px`),
  // percentages and keywords. Kept as CSS text.
  if (/^(-?[\d.]+(px|%)?( |$)){1,4}$/.test(value) || value === 'none') {
    return {$value: value, $extensions: {[EXT]: {css: true}}};
  }
  throw new Error(`${name}: cannot convert value "${value}"`);
}

const TYPOGRAPHY_PROPERTIES: Record<string, string> = {
  'font-family': 'fontFamily',
  'font-size': 'fontSize',
  'font-weight': 'fontWeight',
  'letter-spacing': 'letterSpacing',
  'line-height': 'lineHeight',
};

/**
 * A typography mixin: either `@include md-sys-typescale.label-large;` or
 * five `font-*` / `letter-spacing` / `line-height` declarations.
 */
function typography(
  raw: RawToken,
  resolve: (module: string | undefined, variable: string) => string,
): Token {
  const body = raw.mixin!;
  let m: RegExpExecArray | null;
  if (body.length === 1 && (m = /^@include ([\w-]+)\.([\w-]+);$/.exec(body[0]))) {
    return alias(resolve(m[1], `@${m[2]}`), 'typography');
  }
  const value: Record<string, string> = {};
  for (const line of body) {
    m = /^([\w-]+): (?:([\w-]+)\.)?\$([\w-]+);$/.exec(line);
    const property = m && TYPOGRAPHY_PROPERTIES[m[1]];
    if (!m || !property) throw new Error(`${raw.name}: cannot read mixin line "${line}"`);
    value[property] = `{${resolve(m[2], m[3])}}`;
  }
  if (Object.keys(value).length !== 5) {
    throw new Error(`${raw.name}: incomplete typography mixin`);
  }
  return {$type: 'typography', $value: value};
}

export function readWebTokens(): WebTokens {
  const fileNames = fs
    .readdirSync(DIR)
    .filter(
      (f) => /^_md-.*\.scss$/.test(f) && !f.endsWith('-meta.scss'),
    )
    .sort();

  const parsed = new Map<string, ReturnType<typeof parseFile>>();
  for (const f of fileNames) {
    parsed.set(f.slice(1, -'.scss'.length), parseFile(f));
  }

  // module -> Sass variable -> token, for resolving references.
  const names = new Map<string, Map<string, RawToken>>();
  for (const [module, {raw}] of parsed) {
    names.set(module, new Map(raw.map((t) => [t.variable, t])));
  }

  const files: WebFile[] = [];
  const skipped: string[] = [];
  for (const [module, {raw, skipped: fileSkipped}] of parsed) {
    skipped.push(...fileSkipped);
    const resolve = (refModule: string | undefined, variable: string) => {
      const target = names.get(refModule ?? module)?.get(variable);
      if (!target) {
        throw new Error(`${module}: unknown reference ${refModule ?? ''}.$${variable}`);
      }
      if (target.composite) throw new CompositeReference();
      return target.name;
    };
    const context = module.includes('__') ? module.slice(module.indexOf('__') + 2) : '';
    const tokens: Group = header(SOURCES.web, `_${module}.scss`, context ? {context} : {});
    const variables = new Map<string, string>();
    for (const t of raw) {
      if (t.composite) {
        skipped.push(t.name);
        continue;
      }
      let token: Token;
      try {
        token = toToken(t, resolve);
      } catch (e) {
        // A reference to a composite has no value either.
        if (!(e instanceof CompositeReference)) throw e;
        skipped.push(t.name);
        continue;
      }
      if (t.deprecated) token.$deprecated = t.deprecated;
      setToken(tokens, t.name, token);
      variables.set(t.variable, t.name);
    }
    files.push({module, context, tokens, variables});
  }
  return {files, skipped: [...new Set(skipped)].sort()};
}
