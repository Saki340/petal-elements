/**
 * @license
 * Copyright 2026 Saki
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Builds CSS custom properties from the web DTCG tokens with
 * Style Dictionary.
 *
 * - sys.css: reference typeface and system tokens (color, typescale, shape,
 *   state, elevation, motion). Colors use `light-dark()`, so `color-scheme`
 *   picks the light or dark scheme.
 * - sys-medium-contrast.css, sys-high-contrast.css: color overrides for the
 *   contrast schemes.
 *
 * Springs: CSS cannot run a spring simulation, so each md.sys.motion.spring.*
 * pair (stiffness, damping ratio) is also sampled into a `linear()` easing
 * plus the duration it takes to settle.
 */

import {EXT, Group, isToken, SOURCES} from './dtcg.js';
import type {WebFile} from './web.js';

/** Modules that make up sys.css, besides colors. */
const SYSTEM_MODULES = [
  'md-ref-typeface',
  'md-sys-typescale',
  'md-sys-typescale-emphasized',
  'md-sys-shape',
  'md-sys-state',
  'md-sys-state-focus-indicator',
  'md-sys-elevation',
  'md-sys-motion',
];

const ROOT = '__root';

// Style Dictionary's own type declarations do not compile under this
// project's TypeScript settings, so it is loaded untyped and the few parts
// used here are declared below.
const STYLE_DICTIONARY = 'style-dictionary';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const StyleDictionary = (await import(STYLE_DICTIONARY)).default as any;

interface TransformedToken {
  name: string;
  path: string[];
  $type?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $value: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  original: {$value: any};
}

/** Renames DTCG `$root` tokens so Style Dictionary sees them as tokens. */
function withRoots(group: Group): Group {
  const roots = new Set<string>();
  const findRoots = (g: Group, prefix: string) => {
    if (isToken(g['$root'])) roots.add(prefix);
    for (const [key, value] of Object.entries(g)) {
      if (!key.startsWith('$') && !isToken(value)) {
        findRoots(value as Group, prefix ? `${prefix}.${key}` : key);
      }
    }
  };
  findRoots(group, '');
  const json = JSON.stringify(group)
    .replace(/"\$root":/g, `"${ROOT}":`)
    .replace(/"\{([\w.-]+)\}"/g, (all, path) => (roots.has(path) ? `"{${path}.${ROOT}}"` : all));
  return JSON.parse(json);
}

function merge(groups: Group[]): Group {
  const result: Group = {};
  const mergeInto = (target: Group, source: Group) => {
    for (const [key, value] of Object.entries(source)) {
      if (key.startsWith('$') && key !== ROOT) continue;
      if (isToken(value) || typeof target[key] !== 'object') {
        target[key] = value;
      } else {
        mergeInto(target[key] as Group, value as Group);
      }
    }
  };
  for (const group of groups) mergeInto(result, withRoots(group));
  return result;
}

function cssValue(token: TransformedToken): string {
  const value = token.$value;
  switch (token.$type) {
    case 'color':
      return value.hex;
    case 'dimension':
    case 'duration':
      return `${value.value}${value.unit}`;
    case 'cubicBezier':
      return `cubic-bezier(${value.join(', ')})`;
    case 'number':
    case 'fontWeight':
      return String(value);
    case 'fontFamily':
      return fontFamily(value);
    case 'typography':
      return `${value.fontWeight} ${value.fontSize}/${value.lineHeight} ${value.fontFamily}`;
    default:
      if (typeof value === 'string') return value;
      throw new Error(`${token.path.join('.')}: no CSS value for ${JSON.stringify(value)}`);
  }
}

function fontFamily(value: string | string[]) {
  const generic = /^(serif|sans-serif|monospace|system-ui|cursive|fantasy)$/;
  return [value]
    .flat()
    .map((family) => (generic.test(family) || !/\s/.test(family) ? family : `'${family}'`))
    .join(', ');
}

StyleDictionary.registerTransform({
  name: 'petal/name',
  type: 'name',
  transform: (token: TransformedToken) => token.path.filter((part) => part !== ROOT).join('-'),
});

StyleDictionary.registerTransform({
  name: 'petal/css-value',
  type: 'value',
  transitive: true,
  transform: (token: TransformedToken) => cssValue(token),
});

/** `{md.sys.color.primary}` -> `var(--md-sys-color-primary)`. */
function cssVar(reference: string) {
  const path = reference.slice(1, -1).split('.').filter((part) => part !== ROOT);
  return `var(--${path.join('-')})`;
}

const REFERENCE = /^\{[\w.-]+\}$/;

/**
 * The CSS value of a token, keeping references to other emitted tokens as
 * `var()` so overriding one property (e.g. --md-ref-typeface-plain) carries
 * through. References to the palette, which is not emitted, become values.
 */
function cssValueWithReferences(token: TransformedToken): string {
  const original = token.original.$value;
  const keep = (ref: unknown) =>
    typeof ref === 'string' && REFERENCE.test(ref) && !ref.startsWith('{md.ref.palette.');
  if (keep(original)) return cssVar(original);
  if (token.$type === 'typography' && typeof original === 'object') {
    const part = (key: string) => (keep(original[key]) ? cssVar(original[key]) : token.$value[key]);
    return `${part('fontWeight')} ${part('fontSize')}/${part('lineHeight')} ${part('fontFamily')}`;
  }
  return String(token.$value);
}

interface Resolved {
  /** Fully resolved value. */
  value: string;
  /** Value with `var()` references (see cssValueWithReferences). */
  css: string;
}

/** Resolves tokens and returns {CSS property name: value}. */
async function resolve(groups: Group[]): Promise<Map<string, Resolved>> {
  const sd = new StyleDictionary({
    tokens: merge(groups),
    usesDtcg: true,
    log: {verbosity: 'silent', warnings: 'error'},
    platforms: {css: {transforms: ['petal/name', 'petal/css-value']}},
  });
  const {allTokens}: {allTokens: TransformedToken[]} = await sd.getPlatformTokens('css');
  return new Map(
    allTokens.map((token) => [
      `--${token.name}`,
      {value: String(token.$value), css: cssValueWithReferences(token)},
    ]),
  );
}

// ---------- springs ----------

/** Position over time of a unit-mass spring released from 0 towards 1. */
function spring(stiffness: number, damping: number) {
  const w0 = Math.sqrt(stiffness);
  if (damping < 1) {
    const wd = w0 * Math.sqrt(1 - damping * damping);
    return (t: number) =>
      1 - Math.exp(-damping * w0 * t) * (Math.cos(wd * t) + ((damping * w0) / wd) * Math.sin(wd * t));
  }
  return (t: number) => 1 - Math.exp(-w0 * t) * (1 + w0 * t);
}

/** Last time the spring is more than 0.1% away from its end (max 3s). */
function settleTime(x: (t: number) => number) {
  let last = 0;
  for (let ms = 0; ms < 3000; ms++) {
    if (Math.abs(x(ms / 1000) - 1) > 0.001) last = ms / 1000;
  }
  return last;
}

function linearEasing(x: (t: number) => number, seconds: number, samples = 48) {
  const points = Array.from({length: samples + 1}, (_, i) =>
    i === samples ? 1 : x((seconds * i) / samples),
  );
  return `linear(${points.map((p) => String(Number(p.toFixed(4)))).join(', ')})`;
}

/** `set` is `spring` (standard scheme) or `expressive-spring`. */
function springProperties(values: Map<string, Resolved>, set: string) {
  const lines: string[] = [];
  for (const speed of ['fast', 'default', 'slow']) {
    for (const kind of ['spatial', 'effects']) {
      const name = `--md-sys-motion-${set}-${speed}-${kind}`;
      const stiffness = Number(values.get(`${name}-stiffness`)?.value);
      const damping = Number(values.get(`${name}-damping`)?.value);
      if (!stiffness || !damping) throw new Error(`${name}: missing stiffness or damping`);
      const x = spring(stiffness, damping);
      const seconds = settleTime(x);
      lines.push(`  ${name}: ${linearEasing(x, seconds)};`);
      lines.push(`  ${name}-duration: ${Math.round(seconds * 1000)}ms;`);
    }
  }
  return lines;
}

// ---------- output ----------

/** `composeCopyright` is set when the file includes Compose tokens. */
function fileHeader(title: string, notes: string[], composeCopyright?: string) {
  const web = SOURCES.web;
  const compose = SOURCES.compose;
  return [
    '/**',
    ` * ${title}`,
    ' *',
    ' * Generated by petal-elements ("npm run tokens") from the Material Design web',
    ` * tokens, version ${web.version}, in ${web.repository}`,
    ` * at commit ${web.commit}, ${web.path}.`,
    ` * ${web.copyright}. Licensed under the Apache License, Version 2.0.`,
    ...(composeCopyright
      ? [
          ' *',
          ' * The expressive motion springs (--md-sys-motion-expressive-spring-*) are',
          ' * not in the web tokens; they come from Jetpack Compose Material 3,',
          ` * ExpressiveMotionTokens.kt in ${compose.repository}`,
          ` * at commit ${compose.commit}.`,
          ` * ${composeCopyright}. Licensed under the Apache License, Version 2.0.`,
        ]
      : []),
    ' *',
    ' * Do not edit; regenerate instead.',
    ...(notes.length ? [' *', ...notes.map((n) => ` * ${n}`)] : []),
    ' */',
    '',
  ].join('\n');
}

function properties(values: Map<string, Resolved>, prefix: string) {
  return [...values]
    .filter(([name]) => name.startsWith(prefix))
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([name, {css}]) => `  ${name}: ${css};`);
}

/** Colors as `light-dark(light, dark)`, for one contrast level. */
async function colorProperties(byModule: Map<string, WebFile>, contrast: string) {
  const suffix = contrast ? `__${contrast}` : '';
  const file = (module: string) => {
    const found = byModule.get(module);
    if (!found) throw new Error(`Missing token file ${module}`);
    return found.tokens;
  };
  const palette = file('md-ref-palette');
  const light = await resolve([palette, file(`md-sys-color${suffix}`)]);
  const dark = await resolve([palette, file(`md-sys-color__dark${suffix}`)]);
  const lines: string[] = [];
  for (const [name, {value}] of [...light].sort(([a], [b]) => (a < b ? -1 : 1))) {
    if (!name.startsWith('--md-sys-color-')) continue;
    const darkValue = dark.get(name)?.value;
    if (darkValue === undefined) throw new Error(`${name}: no dark value`);
    lines.push(`  ${name}: ${value === darkValue ? value : `light-dark(${value}, ${darkValue})`};`);
  }
  return lines;
}

/**
 * @param files web token files
 * @param expressiveMotion the Compose ExpressiveMotionTokens tree
 *     (md.sys.motion.expressive-spring.*)
 */
export async function buildCss(
  files: WebFile[],
  expressiveMotion: Group,
): Promise<Map<string, string>> {
  const byModule = new Map(files.map((f) => [f.module, f]));
  const system = await resolve([
    ...['md-ref-palette', 'md-sys-color', ...SYSTEM_MODULES].map((m) => byModule.get(m)!.tokens),
    expressiveMotion,
  ]);
  const extensions = expressiveMotion['$extensions'] as Record<string, {copyright: string}>;
  const composeCopyright = extensions[EXT].copyright;
  const colorNote = [
    'Colors use light-dark(). Set `color-scheme: light dark` on :root to follow',
    'the system setting, or `light` / `dark` on any element to fix the scheme.',
  ];

  // The default motion scheme is expressive, like Compose's
  // MaterialExpressiveTheme: --md-sys-motion-spring-* (which components use)
  // are the expressive springs, and the standard scheme is kept as
  // --md-sys-motion-standard-spring-*.
  const standard = (lines: string[]) =>
    lines.map((line) =>
      line.replace('--md-sys-motion-spring-', '--md-sys-motion-standard-spring-'),
    );
  const motion = standard(properties(system, '--md-sys-motion-'));
  const springs = [
    ...standard(springProperties(system, 'spring')),
    ...springProperties(system, 'expressive-spring'),
  ];
  const defaults = [...motion, ...springs]
    .filter((line) => line.startsWith('  --md-sys-motion-expressive-spring-'))
    .map((line) => line.replace('--md-sys-motion-expressive-spring-', '--md-sys-motion-spring-'));

  const sections: Array<[string, string[]]> = [
    ['Typeface', properties(system, '--md-ref-typeface-')],
    ['Color', await colorProperties(byModule, '')],
    ['Typescale', properties(system, '--md-sys-typescale-')],
    ['Shape', properties(system, '--md-sys-shape-')],
    ['State', properties(system, '--md-sys-state-')],
    ['Elevation', properties(system, '--md-sys-elevation-')],
    ['Motion', motion],
    [
      'Springs as linear() easings and settle durations, derived from stiffness\n' +
        '   * and damping (not in the sources). standard-spring-*: standard motion\n' +
        '   * scheme; expressive-spring-*: expressive motion scheme',
      springs,
    ],
    [
      'The springs components use: the expressive scheme by default (load\n' +
        '   * motion-standard.css for the standard one)',
      defaults,
    ],
  ];
  const body = sections
    .map(([title, lines]) => `  /* ${title} */\n${lines.join('\n')}`)
    .join('\n\n');

  const output = new Map<string, string>();
  output.set(
    'sys.css',
    fileHeader('Material Design system tokens.', colorNote, composeCopyright) +
      `:root {\n${body}\n}\n`,
  );
  for (const contrast of ['medium-contrast', 'high-contrast']) {
    const lines = await colorProperties(byModule, contrast);
    output.set(
      `sys-${contrast}.css`,
      fileHeader(`Material Design ${contrast.replace('-', ' ')} color scheme. Load after sys.css.`, colorNote) +
        `:root {\n${lines.join('\n')}\n}\n`,
    );
  }

  // Components use the --md-sys-motion-spring-* names, which are the
  // expressive scheme by default. These files point them at one scheme, for
  // :root or any element.
  for (const [scheme, title, note] of [
    ['standard', 'Standard motion scheme', 'MotionScheme.standard(): calmer, no overshoot'],
    ['expressive', 'Expressive motion scheme', 'MotionScheme.expressive(), the default'],
  ]) {
    const lines: string[] = [];
    for (const speed of ['fast', 'default', 'slow']) {
      for (const kind of ['spatial', 'effects']) {
        // The curve and duration, and the spring itself (damping, stiffness)
        // for components that simulate it.
        for (const suffix of ['', '-duration', '-damping', '-stiffness']) {
          const name = `${speed}-${kind}${suffix}`;
          lines.push(`  --md-sys-motion-spring-${name}: var(--md-sys-motion-${scheme}-spring-${name});`);
        }
      }
    }
    output.set(
      `motion-${scheme}.css`,
      fileHeader(`${title}. Load after sys.css.`, [
        'Points the --md-sys-motion-spring-* properties, which components use, at',
        `the ${scheme} springs (${note}).`,
        'To use it for part of a page only, copy the rule to a class.',
      ]) + `:root {\n${lines.join('\n')}\n}\n`,
    );
  }
  return output;
}
